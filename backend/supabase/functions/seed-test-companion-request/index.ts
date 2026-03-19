/**
 * seed-test-companion-request — Supabase Edge Function
 *
 * Development / testing helper. Creates a sample companion request for a given
 * elder so that volunteer dashboards and notification flows can be tested
 * without manual data entry.
 *
 * Only operates when NODE_ENV / APP_ENV is NOT "production".
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return respond(200, { ok: true })
  }

  if (req.method !== 'POST') {
    return respond(405, { success: false, error: 'Method not allowed' })
  }

  // Block in production
  const appEnv = Deno.env.get('APP_ENV') || Deno.env.get('NODE_ENV') || 'development'
  if (appEnv === 'production') {
    return respond(403, { success: false, error: 'Seed endpoint is disabled in production' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    return respond(500, { success: false, error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const body = await req.json().catch(() => ({}))

    // Accept an explicit elder_id or pick the first elder in the DB
    let elderId: string | null = body.elder_id ? String(body.elder_id) : null

    if (!elderId) {
      const { data: firstElder, error: elderError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'ELDER')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (elderError || !firstElder) {
        return respond(404, { success: false, error: 'No active elder found to seed request for' })
      }
      elderId = firstElder.id
    }

    const activityTypes = ['CONVERSATION', 'READING', 'GAMES', 'ERRANDS', 'SOCIAL_ACTIVITY', 'VISIT']
    const activityType = body.activity_type
      ? String(body.activity_type).toUpperCase()
      : activityTypes[Math.floor(Math.random() * activityTypes.length)]

    const now = new Date()
    const preferredStart = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    const preferredEnd = new Date(preferredStart.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration

    const { data: request, error: insertError } = await supabase
      .from('companion_requests')
      .insert({
        elder_id: elderId,
        activity_type: activityType,
        description: body.description || `Test ${activityType.toLowerCase()} request created by seed endpoint`,
        status: 'PENDING',
        requested_date: now.toISOString(),
        preferred_time_start: preferredStart.toISOString(),
        preferred_time_end: preferredEnd.toISOString(),
        location_latitude: body.latitude || 51.5074,  // Default London
        location_longitude: body.longitude || -0.1278,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .select('*')
      .single()

    if (insertError || !request) {
      throw insertError || new Error('Failed to insert companion request')
    }

    return respond(201, {
      success: true,
      message: 'Seed companion request created',
      data: request,
    })
  } catch (err) {
    console.error('seed-test-companion-request error:', err)
    return respond(400, {
      success: false,
      error: err instanceof Error ? err.message : 'Seed failed',
    })
  }
})

function respond(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
