import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)
const pushWebhookUrl = Deno.env.get('PUSH_NOTIFICATION_WEBHOOK_URL')
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const emailFrom = Deno.env.get('EMERGENCY_EMAIL_FROM') || 'alerts@elderconnect.dev'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Method not allowed' })
  }

  try {
    const { userId, alertType, description, latitude, longitude } = await req.json()
    if (!userId || !alertType) {
      return jsonResponse(400, { success: false, error: 'userId and alertType are required' })
    }

    const { data: alert, error: alertError } = await supabase
      .from('emergency_alerts')
      .insert({
        user_id: userId,
        alert_type: alertType,
        description: description,
        location_latitude: latitude,
        location_longitude: longitude,
        status: 'TRIGGERED',
        triggered_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (alertError) throw alertError

    const volunteers = await loadActiveVolunteers()

    const eligibleVolunteers = await filterVolunteersByDistance(volunteers, latitude, longitude)
    const notificationResult = await notifyVolunteers(eligibleVolunteers, {
      id: alert.id,
      alertType,
      description: description || '',
      latitude,
      longitude,
      triggeredAt: alert.triggered_at,
    })

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'UPDATE',
      resource_type: 'EMERGENCY_ALERT',
      resource_id: alert.id,
      changes: {
        volunteers_considered: volunteers.length,
        volunteers_notified: notificationResult.totalNotified,
      },
      created_at: new Date().toISOString(),
    })

    return jsonResponse(200, {
      success: true,
      alert,
      volunteers_considered: volunteers.length,
      volunteers_notified: notificationResult.totalNotified,
      push_notifications_sent: notificationResult.pushSent,
      emails_sent: notificationResult.emailsSent,
    })
  } catch (error) {
    console.error('Emergency handler error', error)
    return jsonResponse(400, { success: false, error: error instanceof Error ? error.message : 'Request failed' })
  }
})

async function loadActiveVolunteers() {
  const primary = await supabase
    .from('users')
    .select('id, first_name, email, phone_number, city, postcode, location_latitude, location_longitude')
    .eq('role', 'VOLUNTEER')
    .eq('is_active', true)

  if (!primary.error && primary.data) {
    return primary.data
  }

  const fallback = await supabase
    .from('users')
    .select('id, first_name, email, phone_number, city, postcode')
    .eq('role', 'VOLUNTEER')
    .eq('is_active', true)

  if (fallback.error) throw fallback.error
  return fallback.data || []
}

async function filterVolunteersByDistance(volunteers: any[], latitude?: number, longitude?: number) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return volunteers
  }

  const preferenceMap = await getVolunteerDistancePreferences(volunteers.map((v) => v.id))
  return volunteers.filter((volunteer) => {
    const lat = Number(volunteer.location_latitude)
    const lng = Number(volunteer.location_longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return true

    const distanceKm = haversineDistanceKm(latitude, longitude, lat, lng)
    const maxDistanceKm = preferenceMap.get(volunteer.id) ?? 15
    return distanceKm <= maxDistanceKm
  })
}

async function getVolunteerDistancePreferences(volunteerIds: string[]) {
  const result = new Map<string, number>()
  if (!volunteerIds.length) return result

  const { data } = await supabase
    .from('audit_logs')
    .select('user_id, changes, created_at')
    .in('user_id', volunteerIds)
    .eq('resource_type', 'USER_PREFERENCES')
    .order('created_at', { ascending: false })

  const seen = new Set<string>()
  for (const row of data || []) {
    const userId = row.user_id
    if (seen.has(userId)) continue
    const distance = Number(row?.changes?.volunteerTravelDistance)
    if (!Number.isNaN(distance) && distance > 0) {
      result.set(userId, distance)
      seen.add(userId)
    }
  }
  return result
}

async function notifyVolunteers(volunteers: any[], payload: Record<string, unknown>) {
  let pushSent = 0
  let emailsSent = 0

  if (pushWebhookUrl) {
    await Promise.all(
      volunteers.map(async (volunteer) => {
        try {
          const res = await fetch(pushWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              volunteerId: volunteer.id,
              ...payload,
            }),
          })
          if (res.ok) pushSent += 1
        } catch {
          // Continue notifying other volunteers.
        }
      })
    )
  }

  if (resendApiKey) {
    await Promise.all(
      volunteers.map(async (volunteer) => {
        if (!volunteer.email) return
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: emailFrom,
              to: [volunteer.email],
              subject: 'Emergency Alert Nearby',
              html: `<p>Hello ${volunteer.first_name || 'Volunteer'},</p><p>An emergency alert has been triggered and your support may be needed.</p>`,
            }),
          })
          if (res.ok) emailsSent += 1
        } catch {
          // Continue notifying other volunteers.
        }
      })
    )
  }

  return {
    pushSent,
    emailsSent,
    totalNotified: Math.max(pushSent, emailsSent),
  }
}

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
