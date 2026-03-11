import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreateHealthCheckinBody {
  mood: string
  energy_level: number
  sleep_hours: number
  medications_taken: boolean
  notes?: string
}

interface HealthCheckinRow {
  id: string
  user_id: string
  checkin_date: string
  mood_level: number | null
  energy_level: number | null
  sleep_quality: number | null
  medication_taken: boolean | null
  notes: string | null
  created_at: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Get user ID from Authorization header or fallback header
  const authHeader = req.headers.get('Authorization')
  const userTokenHeader = req.headers.get('X-User-Token')
  const userIdHeader = req.headers.get('X-User-Id')
  let userId: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    userId = extractUserIdFromToken(token)
  }

  if (!userId && userTokenHeader) {
    userId = userTokenHeader
  }
  if (!userId && userIdHeader) {
    userId = userIdHeader
  }

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized - valid token or X-User-Token is required' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get user role
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return new Response(
      JSON.stringify({ success: false, error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  // GET /health-checkins - Get user's health check-ins
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url)
      const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 30
      const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0
      const elderUserIdParam = url.searchParams.get('elder_user_id')
      let targetUserId = userId

      if (user.role === 'FAMILY') {
        if (!elderUserIdParam) {
          return new Response(
            JSON.stringify({ success: false, error: 'elder_user_id is required for family access' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          )
        }

        const { data: connection, error: connectionError } = await supabase
          .from('family_access')
          .select('id')
          .eq('elder_id', elderUserIdParam)
          .eq('family_member_id', userId)
          .eq('verified', true)
          .maybeSingle()

        if (connectionError) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to validate family access' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          )
        }

        if (!connection) {
          return new Response(
            JSON.stringify({ success: false, error: 'You do not have access to this elder health data' }),
            { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          )
        }

        targetUserId = elderUserIdParam
      } else if (user.role !== 'ELDER') {
        return new Response(
          JSON.stringify({ success: false, error: 'Only elders and invited family members can view health check-ins' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      const { data: checkins, error } = await supabase
        .from('health_checkins')
        .select('*')
        .eq('user_id', targetUserId)
        .order('checkin_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Query error:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch health check-ins' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Get total count
      const { count } = await supabase
        .from('health_checkins')
        .select('id', { count: 'exact' })
        .eq('user_id', targetUserId)

      const normalizedCheckins = ((checkins || []) as HealthCheckinRow[]).map((row) => mapDbRowToApi(row))

      return new Response(
        JSON.stringify({
          success: true,
          data: normalizedCheckins,
          count: count || 0,
          limit,
          offset
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } catch (error) {
      console.error('Error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
  }

  // POST /health-checkins - Submit health check-in
  if (req.method === 'POST') {
    try {
      if (user.role !== 'ELDER') {
        return new Response(
          JSON.stringify({ success: false, error: 'Only elders can submit health check-ins' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      const body: CreateHealthCheckinBody = await req.json()

      // Validate required fields
      if (!body.mood || body.energy_level === undefined || body.sleep_hours === undefined || body.medications_taken === undefined) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Mood, energy_level, sleep_hours, and medications_taken are required'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Validate mood
      const validMoods = ['HAPPY', 'GOOD', 'OKAY', 'SAD', 'ANXIOUS']
      if (!validMoods.includes(body.mood.toUpperCase())) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid mood value' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Validate energy level (1-10)
      if (body.energy_level < 1 || body.energy_level > 10) {
        return new Response(
          JSON.stringify({ success: false, error: 'Energy level must be between 1 and 10' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Validate sleep hours (0-24)
      if (body.sleep_hours < 0 || body.sleep_hours > 24) {
        return new Response(
          JSON.stringify({ success: false, error: 'Sleep hours must be between 0 and 24' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      const { data: newCheckin, error } = await supabase
        .from('health_checkins')
        .insert({
          user_id: userId,
          mood_level: moodToMoodLevel(body.mood),
          energy_level: normalizeEnergyLevel(body.energy_level),
          sleep_quality: sleepHoursToQuality(body.sleep_hours),
          medication_taken: body.medications_taken,
          notes: body.notes || null,
          checkin_date: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        console.error('Insert error:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to submit health check-in' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'CREATE',
          resource_type: 'HEALTH_CHECKIN',
          resource_id: newCheckin.id,
          changes: {
            mood: body.mood,
            energy_level: body.energy_level,
            sleep_hours: body.sleep_hours
          },
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Health check-in submitted successfully',
          data: mapDbRowToApi(newCheckin as HealthCheckinRow)
        }),
        { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    } catch (error) {
      console.error('Error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  )
})

/**
 * Extract user ID from JWT token
 */
function extractUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload.user_id || null
  } catch {
    return null
  }
}

function moodToMoodLevel(mood: string): number {
  const normalized = mood.toUpperCase()
  if (normalized === 'HAPPY') return 5
  if (normalized === 'GOOD') return 4
  if (normalized === 'OKAY') return 3
  if (normalized === 'SAD') return 2
  return 1
}

function moodLevelToMood(moodLevel: number | null): string {
  if (!moodLevel || moodLevel <= 1) return 'ANXIOUS'
  if (moodLevel === 2) return 'SAD'
  if (moodLevel === 3) return 'OKAY'
  if (moodLevel === 4) return 'GOOD'
  return 'HAPPY'
}

function normalizeEnergyLevel(level: number): number {
  if (level <= 2) return 1
  if (level <= 4) return 2
  if (level <= 6) return 3
  if (level <= 8) return 4
  return 5
}

function denormalizeEnergyLevel(level: number | null): number {
  if (!level || level <= 1) return 2
  if (level === 2) return 4
  if (level === 3) return 6
  if (level === 4) return 8
  return 10
}

function sleepHoursToQuality(hours: number): number {
  if (hours >= 8) return 5
  if (hours >= 7) return 4
  if (hours >= 6) return 3
  if (hours >= 5) return 2
  return 1
}

function sleepQualityToHours(quality: number | null): number {
  if (!quality || quality <= 1) return 4
  if (quality === 2) return 5
  if (quality === 3) return 6
  if (quality === 4) return 7
  return 8
}

function mapDbRowToApi(row: HealthCheckinRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    mood: moodLevelToMood(row.mood_level),
    energy_level: denormalizeEnergyLevel(row.energy_level),
    sleep_hours: sleepQualityToHours(row.sleep_quality),
    medications_taken: Boolean(row.medication_taken),
    notes: row.notes || '',
    checkin_date: row.checkin_date,
    created_at: row.created_at
  }
}
