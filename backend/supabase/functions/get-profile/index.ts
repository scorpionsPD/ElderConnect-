import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  role: string
  profile_picture_url?: string
  bio?: string
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  postcode?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  accessibility_large_fonts: boolean
  accessibility_high_contrast: boolean
  accessibility_voice_enabled: boolean
  preferred_language: string
}

interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  phone_number?: string
  bio?: string
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  postcode?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  profile_picture_url?: string
  accessibility_large_fonts?: boolean
  accessibility_high_contrast?: boolean
  accessibility_voice_enabled?: boolean
  preferred_language?: string
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

  // Get user ID from Authorization header
  const authHeader = req.headers.get('Authorization')
  const userIdHeader = req.headers.get('X-User-Id')

  let userId: string | null = null

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  // Try to extract user ID from Authorization header (JWT token)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    userId = await verifyToken(token, supabaseUrl)
    console.log('JWT verification result:', userId ? 'valid' : 'invalid')
  }

  // Fallback: Use X-User-Id header if no valid JWT was provided
  if (!userId && userIdHeader) {
    userId = userIdHeader
    console.log('Using X-User-Id header:', userId)
  }

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized - Please provide valid Authorization header or X-User-Id header' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // GET /users/me - Fetch user profile
  if (req.method === 'GET') {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: formatUserProfile(user)
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

  // PUT /users/me - Update user profile
  if (req.method === 'PUT') {
    try {
      const body: UpdateProfileRequest = await req.json()

      // Build update object with only provided fields
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      }

      if (body.first_name) updateData.first_name = body.first_name
      if (body.last_name) updateData.last_name = body.last_name
      if (body.phone_number) updateData.phone_number = body.phone_number
      if (body.bio) updateData.bio = body.bio
      if (body.date_of_birth) updateData.date_of_birth = body.date_of_birth
      if (body.address_line_1) updateData.address_line_1 = body.address_line_1
      if (body.address_line_2) updateData.address_line_2 = body.address_line_2
      if (body.city) updateData.city = body.city
      if (body.postcode) updateData.postcode = body.postcode
      if ('emergency_contact_name' in body) {
        updateData.emergency_contact_name = body.emergency_contact_name?.trim() || null
      }
      if ('emergency_contact_phone' in body) {
        updateData.emergency_contact_phone = body.emergency_contact_phone?.trim() || null
      }
      if (body.profile_picture_url) updateData.profile_picture_url = body.profile_picture_url
      if (body.accessibility_large_fonts !== undefined) updateData.accessibility_large_fonts = body.accessibility_large_fonts
      if (body.accessibility_high_contrast !== undefined) updateData.accessibility_high_contrast = body.accessibility_high_contrast
      if (body.accessibility_voice_enabled !== undefined) updateData.accessibility_voice_enabled = body.accessibility_voice_enabled
      if (body.preferred_language) updateData.preferred_language = body.preferred_language

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .single()

      if (error || !updatedUser) {
        console.error('Update error:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update profile' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }

      // Log the update
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'UPDATE',
          resource_type: 'USER',
          resource_id: userId,
          changes: body,
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Profile updated successfully',
          data: formatUserProfile(updatedUser)
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
 * Verify JWT token from Supabase Auth
 * Extracts user ID from the 'sub' claim in the JWT payload
 */
async function verifyToken(token: string, supabaseUrl: string): Promise<string | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Decode the payload
    const payload = JSON.parse(atob(parts[1]))
    
    // Supabase Auth tokens use 'sub' (subject) for user ID
    const userId = payload.sub || payload.user_id
    
    if (!userId) return null

    return userId
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Format user data for API response
 */
function formatUserProfile(user: Record<string, any>): UserProfile {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    role: user.role,
    profile_picture_url: user.profile_picture_url,
    bio: user.bio,
    date_of_birth: user.date_of_birth,
    address_line_1: user.address_line_1,
    address_line_2: user.address_line_2,
    city: user.city,
    postcode: user.postcode,
    emergency_contact_name: user.emergency_contact_name,
    emergency_contact_phone: user.emergency_contact_phone,
    accessibility_large_fonts: user.accessibility_large_fonts || false,
    accessibility_high_contrast: user.accessibility_high_contrast || false,
    accessibility_voice_enabled: user.accessibility_voice_enabled || false,
    preferred_language: user.preferred_language || 'en'
  }
}
