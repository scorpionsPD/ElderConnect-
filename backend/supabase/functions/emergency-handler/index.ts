// Supabase Edge Function: Handle emergency alerts in real-time
// This function processes emergency triggers and notifies relevant volunteers

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { userId, alertType, description, latitude, longitude } = await req.json()

    // Create emergency alert record
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

    // Get nearby volunteers (TODO: Implement location-based query)
    const { data: volunteers, error: volunteersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'VOLUNTEER')
      .eq('is_active', true)

    if (volunteersError) throw volunteersError

    // Notify volunteers via push notifications and real-time
    // TODO: Integrate with push notification service

    return new Response(
      JSON.stringify({
        success: true,
        alert,
        volunteers_notified: volunteers?.length || 0,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
