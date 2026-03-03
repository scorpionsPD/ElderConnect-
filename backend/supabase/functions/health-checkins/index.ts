import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CreateHealthCheckinBody {
  mood: string
  energy_level: number
  sleep_hours: number
  medications_taken: boolean
  notes?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, apikey',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Get user ID from Authorization header
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const token = authHeader.substring(7)
  const userId = extractUserIdFromToken(token)

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid token' }),
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

  // Only elders can use health checkin
  if (user.role !== 'ELDER') {
    return new Response(
      JSON.stringify({ success: false, error: 'Only elders can submit health check-ins' }),
      { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  // GET /health-checkins - Get user's health check-ins
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url)
      const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 30
      const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0

      const { data: checkins, error } = await supabase
        .from('health_checkins')
        .select('*')
        .eq('elder_id', userId)
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
        .eq('elder_id', userId)

      return new Response(
        JSON.stringify({
          success: true,
          data: checkins || [],
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
          elder_id: userId,
          mood: body.mood.toUpperCase(),
          energy_level: body.energy_level,
          sleep_hours: body.sleep_hours,
          medications_taken: body.medications_taken,
          notes: body.notes || null,
          checkin_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          data: newCheckin
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
