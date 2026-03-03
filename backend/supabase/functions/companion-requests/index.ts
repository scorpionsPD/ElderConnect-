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

interface AcceptCompanionRequestBody {
  volunteer_id: string
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

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const requestId = pathParts[pathParts.length - 2] === 'companion-requests' ? null : pathParts[pathParts.length - 2]

  // GET /companion-requests - List companion requests
  if (req.method === 'GET') {
    try {
      let query = supabase
        .from('companion_requests')
        .select('*, elder:users(id, first_name, last_name, email), volunteer:users(id, first_name, last_name, email)')

      // Filter based on user role
      if (user.role === 'ELDER') {
        query = query.eq('elder_id', userId)
      } else if (user.role === 'VOLUNTEER') {
        query = query.eq('volunteer_id', userId)
      }

      const { data: requests, error } = await query.order('requested_date', { ascending: false })

      if (error) {
        console.error('Query error:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch requests' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: requests || [],
          count: (requests || []).length
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

  // POST /companion-requests - Create new companion request (for elders)
  if (req.method === 'POST' && !requestId) {
    try {
      // Only elders can create companion requests
      if (user.role !== 'ELDER') {
        return new Response(
          JSON.stringify({ success: false, error: 'Only elders can create companion requests' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      const body: CreateCompanionRequestBody = await req.json()

      // Validate required fields
      if (!body.activity_type) {
        return new Response(
          JSON.stringify({ success: false, error: 'Activity type is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Validate activity type
      const validActivities = ['SHOPPING', 'VISIT', 'ERRANDS', 'SOCIAL_ACTIVITY', 'OTHER']
      if (!validActivities.includes(body.activity_type.toUpperCase())) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid activity type' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      const { data: newRequest, error } = await supabase
        .from('companion_requests')
        .insert({
          elder_id: userId,
          activity_type: body.activity_type.toUpperCase(),
          description: body.description || null,
          preferred_time_start: body.preferred_time_start || null,
          preferred_time_end: body.preferred_time_end || null,
          location_latitude: body.location_latitude || null,
          location_longitude: body.location_longitude || null,
          status: 'PENDING',
          requested_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        console.error('Insert error:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create companion request' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'CREATE',
          resource_type: 'COMPANION_REQUEST',
          resource_id: newRequest.id,
          changes: body,
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Companion request created successfully',
          data: newRequest
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

  // POST /companion-requests/:id/accept - Volunteer accepts companion request
  if (req.method === 'POST' && requestId && url.pathname.endsWith('/accept')) {
    try {
      // Only volunteers can accept requests
      if (user.role !== 'VOLUNTEER') {
        return new Response(
          JSON.stringify({ success: false, error: 'Only volunteers can accept companion requests' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Get the request
      const { data: request, error: getError } = await supabase
        .from('companion_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (getError || !request) {
        return new Response(
          JSON.stringify({ success: false, error: 'Companion request not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Check if request is still pending
      if (request.status !== 'PENDING') {
        return new Response(
          JSON.stringify({ success: false, error: 'This request is no longer available' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Update request
      const { data: updatedRequest, error: updateError } = await supabase
        .from('companion_requests')
        .update({
          volunteer_id: userId,
          status: 'ACCEPTED',
          accepted_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select('*')
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to accept request' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'UPDATE',
          resource_type: 'COMPANION_REQUEST',
          resource_id: requestId,
          changes: { status: 'ACCEPTED', volunteer_id: userId },
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Companion request accepted successfully',
          data: updatedRequest
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
