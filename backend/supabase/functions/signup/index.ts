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

const OTP_VERIFICATION_WINDOW_MINUTES = 15

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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
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
    const normalizedEmail = email?.trim().toLowerCase()

    // Validate required fields
    if (!normalizedEmail || !role || !first_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email, role, and first_name are required'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
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

    const verificationCutoff = new Date(
      Date.now() - OTP_VERIFICATION_WINDOW_MINUTES * 60 * 1000,
    ).toISOString()

    const { data: verifiedOtp, error: otpVerificationError } = await supabase
      .from('otp_codes')
      .select('id, used_at')
      .ilike('email', normalizedEmail)
      .eq('is_used', true)
      .not('used_at', 'is', null)
      .gte('used_at', verificationCutoff)
      .order('used_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (otpVerificationError) {
      console.error('OTP verification lookup error:', otpVerificationError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to verify OTP confirmation. Please try again.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    if (!verifiedOtp) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please verify your email with OTP before signing up.'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
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
        email: normalizedEmail,
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

    if (role === 'FAMILY') {
      const { data: pendingInvites } = await supabase
        .from('family_invitations')
        .select('id, elder_id, relationship, access_level')
        .eq('family_email', normalizedEmail)
        .eq('status', 'PENDING')

      for (const invite of pendingInvites || []) {
        const { error: connectError } = await supabase
          .from('family_access')
          .upsert({
            elder_id: invite.elder_id,
            family_member_id: userId,
            relationship: invite.relationship || 'OTHER',
            access_level: invite.access_level || 'VIEW_ALL',
            verified: true,
            verified_by_elder: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'elder_id,family_member_id' })

        if (!connectError) {
          await supabase
            .from('family_invitations')
            .update({
              status: 'ACCEPTED',
              accepted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', invite.id)
        }
      }
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
          email: normalizedEmail,
          role,
          first_name,
          last_name
        },
        created_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Welcome ${first_name}! Your account has been created successfully.`,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: last_name ? `${first_name} ${last_name}` : first_name
        }
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
