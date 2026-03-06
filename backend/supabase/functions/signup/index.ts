import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SignupRequest {
  email: string
  role: 'ELDER' | 'VOLUNTEER' | 'PROFESSIONAL' | 'FAMILY' | 'ADMIN'
  first_name: string
  last_name?: string
  phone_number?: string
  date_of_birth?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  postcode?: string
  bio?: string
}

interface SignupResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    email: string
    role: string
    name: string
  }
  error?: string
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  try {
    const body: SignupRequest = await req.json()
    const { email, role, first_name, last_name, phone_number, date_of_birth, address_line_1, address_line_2, city, postcode, bio } = body

    // Validate required fields
    if (!email || !role || !first_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email, role, and first_name are required'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validate role
    if (!['ELDER', 'VOLUNTEER', 'PROFESSIONAL', 'FAMILY', 'ADMIN'].includes(role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid role' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email already registered. Please login instead.'
        }),
        { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Create user
    const userId = crypto.randomUUID()
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        role,
        first_name,
        last_name: last_name || '',
        phone_number: phone_number || null,
        date_of_birth: date_of_birth || null,
        address_line_1: address_line_1 || null,
        address_line_2: address_line_2 || null,
        city: city || null,
        postcode: postcode || null,
        bio: bio || null,
        is_verified: true, // Marked as verified since they completed OTP
        is_active: true,
        data_consent: true,
        consent_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, role')
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create user account. Please try again.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Create profile record in audit logs
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'CREATE',
        resource_type: 'USER',
        resource_id: userId,
        changes: {
          email,
          role,
          first_name,
          last_name
        },
        created_at: new Date().toISOString()
      })

    // Generate JWT token for the new user
    const tokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const tokenPayload = btoa(JSON.stringify({
      user_id: userId,
      email: email,
      role: role,
      iss: 'supabase',
      sub: userId,
      aud: 'authenticated',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    }))
    const tokenSignature = 'dev_signature'
    const token = `${tokenHeader}.${tokenPayload}.${tokenSignature}`

    return new Response(
      JSON.stringify({
        success: true,
        message: `Welcome ${first_name}! Your account has been created successfully.`,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: last_name ? `${first_name} ${last_name}` : first_name
        },
        token: token
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
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
})

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
