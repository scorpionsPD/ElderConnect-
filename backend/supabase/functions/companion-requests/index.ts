import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreateCompanionRequestBody {
  activity_type: string
  description?: string
  preferred_time_start?: string
  preferred_time_end?: string
  location_latitude?: number
  location_longitude?: number
}

type CompanionStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type ConfirmationRole = 'ELDER' | 'VOLUNTEER'
type RolePreferences = {
  preferredActivityTypes?: string[]
  availabilityDays?: string[]
  volunteerTravelDistance?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  const userTokenHeader = req.headers.get('X-User-Token')
  const userIdHeader = req.headers.get('X-User-Id')

  let userId: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    userId = extractUserIdFromToken(token)
  }

  if (!userId && userTokenHeader) userId = userTokenHeader
  if (!userId && userIdHeader) userId = userIdHeader

  if (!userId) {
    return jsonResponse(401, { success: false, error: 'Unauthorized - valid token or X-User-Token is required' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse(500, { success: false, error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return jsonResponse(404, { success: false, error: 'User not found' })
  }

  const { requestId, action } = parsePath(req.url)

  if (req.method === 'GET' && !requestId) {
    try {
      let query = supabase
        .from('companion_requests')
        .select(`
          *,
          elder:users!companion_requests_elder_id_fkey(
            id,
            first_name,
            last_name,
            email,
            phone_number,
            address_line_1,
            city,
            postcode
          ),
          volunteer:users!companion_requests_volunteer_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)

      if (user.role === 'ELDER') {
        query = query.eq('elder_id', userId)
      } else if (user.role === 'VOLUNTEER') {
        query = query.or(`status.eq.PENDING,volunteer_id.eq.${userId}`)
      } else if (user.role === 'FAMILY') {
        const { data: links, error: linksError } = await supabase
          .from('family_access')
          .select('elder_id')
          .eq('family_member_id', userId)

        if (linksError) {
          return jsonResponse(500, { success: false, error: 'Failed to load family connections' })
        }

        const elderIds = [...new Set((links || []).map((item: any) => item.elder_id).filter(Boolean))]
        if (!elderIds.length) {
          return jsonResponse(200, { success: true, data: [], count: 0 })
        }

        query = query.in('elder_id', elderIds)
      } else {
        return jsonResponse(403, { success: false, error: 'Role not allowed to access companion requests' })
      }

      const { data: requests, error } = await query.order('requested_date', { ascending: false })

      if (error) {
        console.error('Query error:', error)
        return jsonResponse(500, { success: false, error: 'Failed to fetch requests' })
      }

      let enriched = await enrichRequestsWithCompletionState(supabase, requests || [])

      if (user.role === 'VOLUNTEER') {
        const volunteerPreferences = await loadRolePreferences(supabase, userId)
        const elderIds = [...new Set(enriched.map((request: any) => request.elder_id).filter(Boolean))]
        const elderPreferenceMap = new Map<string, RolePreferences>()

        await Promise.all(
          elderIds.map(async (elderId) => {
            elderPreferenceMap.set(elderId, await loadRolePreferences(supabase, elderId))
          })
        )

        enriched = enriched
          .map((request: any) => {
            if (request.status !== 'PENDING') {
              return {
                ...request,
                matching: {
                  score: null,
                  activity_match: null,
                  availability_match: null,
                  elder_alignment: null,
                },
              }
            }

            const elderPreferences = elderPreferenceMap.get(request.elder_id) || {}
            const matching = buildMatchingMetadata(request, volunteerPreferences, elderPreferences)
            return {
              ...request,
              matching,
            }
          })
          .sort((a: any, b: any) => {
            const aPending = a.status === 'PENDING'
            const bPending = b.status === 'PENDING'
            if (aPending && bPending) {
              const scoreDelta = (b.matching?.score ?? 0) - (a.matching?.score ?? 0)
              if (scoreDelta !== 0) return scoreDelta
            }
            return new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime()
          })
      }

      return jsonResponse(200, {
        success: true,
        data: enriched,
        count: enriched.length,
      })
    } catch (error) {
      console.error('Error:', error)
      return jsonResponse(500, {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      })
    }
  }

  if (req.method === 'POST' && !requestId) {
    try {
      if (user.role !== 'ELDER') {
        return jsonResponse(403, { success: false, error: 'Only elders can create companion requests' })
      }

      const body: CreateCompanionRequestBody = await req.json()

      if (!body.activity_type) {
        return jsonResponse(400, { success: false, error: 'Activity type is required' })
      }

      const validActivities = ['SHOPPING', 'VISIT', 'ERRANDS', 'SOCIAL_ACTIVITY', 'OTHER']
      if (!validActivities.includes(body.activity_type.toUpperCase())) {
        return jsonResponse(400, { success: false, error: 'Invalid activity type' })
      }

      const { data: newRequest, error } = await supabase
        .from('companion_requests')
        .insert({
          elder_id: userId,
          activity_type: body.activity_type.toUpperCase(),
          description: body.description || null,
          preferred_time_start: normalizePreferredTime(body.preferred_time_start),
          preferred_time_end: normalizePreferredTime(body.preferred_time_end),
          location_latitude: body.location_latitude || null,
          location_longitude: body.location_longitude || null,
          status: 'PENDING',
          requested_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single()

      if (error) {
        console.error('Insert error:', error)
        return jsonResponse(500, { success: false, error: 'Failed to create companion request' })
      }

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'CREATE',
          resource_type: 'COMPANION_REQUEST',
          resource_id: newRequest.id,
          changes: body,
          created_at: new Date().toISOString(),
        })

      return jsonResponse(201, {
        success: true,
        message: 'Companion request created successfully',
        data: withCompletionState(newRequest, { elder_confirmed: false, volunteer_confirmed: false, waiting_for: null }),
      })
    } catch (error) {
      console.error('Error:', error)
      return jsonResponse(500, {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      })
    }
  }

  if (req.method === 'POST' && requestId && action === 'accept') {
    try {
      if (user.role !== 'VOLUNTEER') {
        return jsonResponse(403, { success: false, error: 'Only volunteers can accept companion requests' })
      }

      const { data: request, error: getError } = await supabase
        .from('companion_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (getError || !request) {
        return jsonResponse(404, { success: false, error: 'Companion request not found' })
      }

      if (request.status !== 'PENDING') {
        return jsonResponse(400, { success: false, error: 'This request is no longer available' })
      }

      const { data: updatedRequest, error: updateError } = await supabase
        .from('companion_requests')
        .update({
          volunteer_id: userId,
          status: 'ACCEPTED',
          accepted_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('*')
        .single()

      if (updateError || !updatedRequest) {
        console.error('Update error:', updateError)
        return jsonResponse(500, { success: false, error: 'Failed to accept request' })
      }

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'UPDATE',
          resource_type: 'COMPANION_REQUEST',
          resource_id: requestId,
          changes: { status: 'ACCEPTED', volunteer_id: userId },
          created_at: new Date().toISOString(),
        })

      return jsonResponse(200, {
        success: true,
        message: 'Companion request accepted successfully',
        data: withCompletionState(updatedRequest, { elder_confirmed: false, volunteer_confirmed: false, waiting_for: null }),
      })
    } catch (error) {
      console.error('Error:', error)
      return jsonResponse(500, {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      })
    }
  }

  if (req.method === 'POST' && requestId && action === 'complete') {
    try {
      const { data: request, error: getError } = await supabase
        .from('companion_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (getError || !request) {
        return jsonResponse(404, { success: false, error: 'Companion request not found' })
      }

      const isElder = request.elder_id === userId
      const isAssignedVolunteer = request.volunteer_id === userId
      if (!isElder && !isAssignedVolunteer) {
        return jsonResponse(403, { success: false, error: 'Only the elder or assigned volunteer can complete this request' })
      }

      if (request.status === 'COMPLETED') {
        return jsonResponse(400, { success: false, error: 'Request is already completed' })
      }

      if (request.status !== 'ACCEPTED' && request.status !== 'IN_PROGRESS') {
        return jsonResponse(400, { success: false, error: 'Only accepted or in-progress requests can be completed' })
      }

      const { data: finalRequest, error: updateError } = await supabase
        .from('companion_requests')
        .update({
          status: 'COMPLETED',
          completed_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('*')
        .single()

      if (updateError || !finalRequest) {
        return jsonResponse(500, { success: false, error: 'Failed to complete request' })
      }

      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'UPDATE',
          resource_type: 'COMPANION_REQUEST',
          resource_id: requestId,
          changes: {
            status: 'COMPLETED',
            completed_by_role: isElder ? 'ELDER' : 'VOLUNTEER',
          },
          created_at: new Date().toISOString(),
        })

      return jsonResponse(200, {
        success: true,
        message: 'Request completed successfully',
        data: withCompletionState(finalRequest, {
          elder_confirmed: true,
          volunteer_confirmed: true,
          waiting_for: null,
        }),
      })
    } catch (error) {
      console.error('Error:', error)
      return jsonResponse(500, {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      })
    }
  }

  return jsonResponse(405, { success: false, error: 'Method not allowed' })
})

function extractUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload.user_id || payload.sub || null
  } catch {
    return null
  }
}

function parsePath(rawUrl: string): { requestId: string | null; action: string | null } {
  const url = new URL(rawUrl)
  const parts = url.pathname.split('/').filter(Boolean)
  const companionIndex = parts.indexOf('companion-requests')

  if (companionIndex === -1) {
    return { requestId: null, action: null }
  }

  const maybeId = parts[companionIndex + 1]
  const maybeAction = parts[companionIndex + 2] || null

  return {
    requestId: maybeId || null,
    action: maybeAction,
  }
}

async function getCompletionState(supabase: any, requestId: string) {
  const confirmations = await fetchCompletionConfirmationRows(supabase, requestId)

  let elderConfirmed = false
  let volunteerConfirmed = false

  for (const item of confirmations) {
    const role = item?.confirmed_by_role
    if (role === 'ELDER') elderConfirmed = true
    if (role === 'VOLUNTEER') volunteerConfirmed = true
  }

  let waitingFor: ConfirmationRole | null = null
  if (elderConfirmed && !volunteerConfirmed) waitingFor = 'VOLUNTEER'
  if (!elderConfirmed && volunteerConfirmed) waitingFor = 'ELDER'

  return {
    elder_confirmed: elderConfirmed,
    volunteer_confirmed: volunteerConfirmed,
    waiting_for: waitingFor,
  }
}

async function enrichRequestsWithCompletionState(supabase: any, requests: any[]) {
  if (!requests.length) return requests

  const requestIds = requests.map((r) => r.id)
  const confirmations = await fetchCompletionConfirmationRows(supabase, undefined, requestIds)

  const completionMap = new Map<string, { elder_confirmed: boolean; volunteer_confirmed: boolean; waiting_for: ConfirmationRole | null }>()

  for (const request of requests) {
    completionMap.set(request.id, {
      elder_confirmed: false,
      volunteer_confirmed: false,
      waiting_for: null,
    })
  }

  for (const item of confirmations) {
    const requestId = item.resource_id
    const state = completionMap.get(requestId)
    if (!state) continue

    const role = item?.confirmed_by_role
    if (role === 'ELDER') state.elder_confirmed = true
    if (role === 'VOLUNTEER') state.volunteer_confirmed = true
  }

  for (const state of completionMap.values()) {
    if (state.elder_confirmed && !state.volunteer_confirmed) state.waiting_for = 'VOLUNTEER'
    if (!state.elder_confirmed && state.volunteer_confirmed) state.waiting_for = 'ELDER'
  }

  return requests.map((request) => withCompletionState(request, completionMap.get(request.id) || {
    elder_confirmed: false,
    volunteer_confirmed: false,
    waiting_for: null,
  }))
}

function withCompletionState(request: any, completion: { elder_confirmed: boolean; volunteer_confirmed: boolean; waiting_for: ConfirmationRole | null }) {
  return {
    ...request,
    completion,
  }
}

async function loadRolePreferences(supabase: any, userId: string): Promise<RolePreferences> {
  const { data: primary } = await supabase
    .from('audit_logs')
    .select('changes')
    .eq('user_id', userId)
    .eq('resource_type', 'USER_PREFERENCES')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (primary?.changes && typeof primary.changes === 'object') {
    return primary.changes as RolePreferences
  }

  const { data: fallback } = await supabase
    .from('audit_logs')
    .select('new_values')
    .eq('user_id', userId)
    .eq('table_name', 'USER_PREFERENCES')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fallback?.new_values && typeof fallback.new_values === 'object') {
    return fallback.new_values as RolePreferences
  }

  return {}
}

function buildMatchingMetadata(request: any, volunteerPrefs: RolePreferences, elderPrefs: RolePreferences) {
  const requestedActivity = mapActivityTypeToPreferenceId(request.activity_type)
  const requestTiming = getRequestTiming(request.preferred_time_start)

  const volunteerActivities = Array.isArray(volunteerPrefs.preferredActivityTypes) ? volunteerPrefs.preferredActivityTypes : []
  const volunteerAvailability = Array.isArray(volunteerPrefs.availabilityDays) ? volunteerPrefs.availabilityDays : []
  const elderActivities = Array.isArray(elderPrefs.preferredActivityTypes) ? elderPrefs.preferredActivityTypes : []
  const elderAvailability = Array.isArray(elderPrefs.availabilityDays) ? elderPrefs.availabilityDays : []

  const activityMatch =
    volunteerActivities.length === 0 || !requestedActivity ? true : volunteerActivities.includes(requestedActivity)
  const availabilityMatch = doesAvailabilityMatch(volunteerAvailability, requestTiming)
  const elderAlignment = doesElderPreferenceAlign(elderActivities, elderAvailability, requestedActivity, requestTiming)

  let score = 50
  if (activityMatch) score += 30
  else score -= 20

  if (availabilityMatch) score += 25
  else score -= 15

  if (elderAlignment) score += 10

  return {
    score: Math.max(0, Math.min(100, score)),
    activity_match: activityMatch,
    availability_match: availabilityMatch,
    elder_alignment: elderAlignment,
  }
}

function mapActivityTypeToPreferenceId(activityType?: string): string | null {
  const normalized = (activityType || '').toUpperCase()
  if (normalized === 'SHOPPING' || normalized === 'ERRANDS') return 'errands'
  if (normalized === 'VISIT') return 'conversation'
  if (normalized === 'SOCIAL_ACTIVITY') return 'games'
  if (normalized === 'OTHER') return 'conversation'
  return null
}

function normalizePreferredTime(value?: string): string | null {
  if (!value) return null
  // Accept either ISO datetime or HH:mm[:ss] and normalize to HH:mm:ss for TIME columns.
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.length === 5 ? `${value}:00` : value
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  const hh = String(parsed.getHours()).padStart(2, '0')
  const mm = String(parsed.getMinutes()).padStart(2, '0')
  const ss = String(parsed.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function getRequestTiming(preferredTimeStart?: string) {
  if (!preferredTimeStart) return { slotId: null as string | null, period: null as string | null, dayType: null as string | null }

  // Supports either full datetime (ISO) or time-only values.
  const asDate = new Date(preferredTimeStart)
  if (!Number.isNaN(asDate.getTime())) {
    const hour = asDate.getHours()
    const day = asDate.getDay()
    const dayType = day === 0 || day === 6 ? 'weekend' : 'weekday'
    const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    return { slotId: `${dayType}-${period}`, period, dayType }
  }

  const timeParts = preferredTimeStart.split(':')
  const hour = Number(timeParts[0])
  if (Number.isNaN(hour)) {
    return { slotId: null as string | null, period: null as string | null, dayType: null as string | null }
  }
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return { slotId: null as string | null, period, dayType: null as string | null }
}

function doesAvailabilityMatch(volunteerAvailability: string[], requestTiming: { slotId: string | null; period: string | null }) {
  if (!volunteerAvailability.length) return true
  if (!requestTiming.period) return true

  if (requestTiming.slotId && volunteerAvailability.includes(requestTiming.slotId)) return true
  return volunteerAvailability.some((slot) => slot.endsWith(`-${requestTiming.period}`))
}

function doesElderPreferenceAlign(
  elderActivities: string[],
  elderAvailability: string[],
  requestedActivity: string | null,
  requestTiming: { period: string | null }
) {
  const activityAligned = !elderActivities.length || !requestedActivity || elderActivities.includes(requestedActivity)
  const timingAligned = !elderAvailability.length || !requestTiming.period || elderAvailability.includes(requestTiming.period)
  return activityAligned && timingAligned
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

async function hasCompletionConfirmation(supabase: any, requestId: string, role: ConfirmationRole) {
  const rows = await fetchCompletionConfirmationRows(supabase, requestId)
  return rows.filter((row: any) => row.confirmed_by_role === role)
}

async function fetchCompletionConfirmationRows(supabase: any, singleRequestId?: string, requestIds?: string[]) {
  const primaryQuery = supabase
    .from('audit_logs')
    .select('resource_id, changes')
    .eq('resource_type', 'COMPANION_REQUEST')
    .contains('changes', { completion_confirmation: true })

  const primary = singleRequestId
    ? await primaryQuery.eq('resource_id', singleRequestId)
    : requestIds && requestIds.length
      ? await primaryQuery.in('resource_id', requestIds)
      : await primaryQuery

  if (!primary.error) {
    return (primary.data || []).map((item: any) => ({
      resource_id: item.resource_id,
      confirmed_by_role: item?.changes?.confirmed_by_role as ConfirmationRole | null,
    }))
  }

  const fallbackQuery = supabase
    .from('audit_logs')
    .select('record_id, new_values')
    .eq('table_name', 'COMPANION_REQUEST')
    .contains('new_values', { completion_confirmation: true })

  const fallback = singleRequestId
    ? await fallbackQuery.eq('record_id', singleRequestId)
    : requestIds && requestIds.length
      ? await fallbackQuery.in('record_id', requestIds)
      : await fallbackQuery

  if (fallback.error) return []
  return (fallback.data || []).map((item: any) => ({
    resource_id: item.record_id,
    confirmed_by_role: item?.new_values?.confirmed_by_role as ConfirmationRole | null,
  }))
}

async function insertCompanionAuditLog(
  supabase: any,
  payload: {
    user_id: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT' | 'DATA_EXPORT' | 'DATA_DELETE'
    resource_id: string
    changes: Record<string, unknown>
  }
) {
  const now = new Date().toISOString()
  const primary = await supabase
    .from('audit_logs')
    .insert({
      user_id: payload.user_id,
      action: payload.action,
      resource_type: 'COMPANION_REQUEST',
      resource_id: payload.resource_id,
      changes: payload.changes,
      created_at: now,
    })

  if (!primary.error) return true

  const fallback = await supabase
    .from('audit_logs')
    .insert({
      user_id: payload.user_id,
      action: payload.action,
      table_name: 'COMPANION_REQUEST',
      record_id: payload.resource_id,
      new_values: payload.changes,
      created_at: now,
    })

  return !fallback.error
}
