import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SignJWT } from 'https://esm.sh/jose@5.0.0'

interface VerifyOTPRequest {
  email?: string
  phone_number?: string
  code: string
}

interface VerifyOTPResponse {
  success: boolean
  message?: string
  token?: string
  user_id?: string
  email?: string
  role?: string
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
    const body: VerifyOTPRequest = await req.json()
    const { email, phone_number, code } = body

    // Validate input
    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'OTP code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    if (!email && !phone_number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Either email or phone_number must be provided'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validate code format (4 digits)
    if (!/^\d{4}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid OTP code format' }),
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

    // Development bypass: only enabled when explicitly configured.
    // Never infer development mode from OTP format.
    const runtimeEnv = (Deno.env.get('ENVIRONMENT') || Deno.env.get('NODE_ENV') || 'production').toLowerCase()
    const allowDevOtpBypass = (Deno.env.get('ALLOW_DEV_OTP_BYPASS') || 'false').toLowerCase() === 'true'
    const isDevelopment = runtimeEnv !== 'production' && allowDevOtpBypass
    
    if (isDevelopment) {
      console.log(`[DEV] Accepting OTP ${code} for ${email || phone_number}`)
      // For development, check if user exists
      const userEmail = email || `user-${phone_number}@dev.local`
      
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role, first_name')
        .eq('email', userEmail)
        .single()

      if (existingUser) {
        // User exists, return their data
        const token = await generateSessionToken({
          user_id: existingUser.id,
          email: userEmail,
          role: existingUser.role,
          verified: true
        })
        return new Response(
          JSON.stringify({
            success: true,
            message: 'OTP verified successfully (DEV)',
            token,
            user_id: existingUser.id,
            email: userEmail,
            role: existingUser.role,
            is_new_user: false
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      } else {
        // New user - don't create them, let signup endpoint handle that
        // Return is_new_user flag so frontend knows to show signup form
        console.log(`[DEV] New user detected for ${userEmail}`)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'OTP verified successfully - new user',
            is_new_user: true,
            email: userEmail
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
    }

    // Production mode: Check database for OTP

    // Find OTP record
    let otpQuery = supabase
      .from('otp_codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)

    if (email) {
      otpQuery = otpQuery.eq('email', email)
    } else if (phone_number) {
      otpQuery = otpQuery.eq('phone_number', phone_number)
    }

    const { data: otpRecords, error: otpError } = await otpQuery.single()

    if (otpError || !otpRecords) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid OTP code. Please request a new one.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpRecords.expires_at)
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OTP code has expired. Please request a new one.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Check attempt count
    if (otpRecords.attempt_count >= otpRecords.max_attempts) {
      // Mark as used (expired) to prevent further attempts
      await supabase
        .from('otp_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', otpRecords.id)

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many incorrect attempts. Please request a new OTP.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Increment attempt count
    await supabase
      .from('otp_codes')
      .update({ attempt_count: otpRecords.attempt_count + 1 })
      .eq('id', otpRecords.id)

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', otpRecords.id)

    if (updateError) {
      console.error('Failed to mark OTP as used:', updateError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to verify OTP. Please try again.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Check if user exists
    const userEmail = email || otpRecords.email
    const { data: userRecords, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', userEmail)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('User lookup error:', userError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to verify user. Please try again.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // If user doesn't exist, return success with flag for signup
    if (!userRecords) {
      const token = await generateSessionToken({
        email: userEmail,
        verified: true,
        is_new_user: true
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'OTP verified. Please complete signup.',
          token,
          email: userEmail,
          is_new_user: true
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // User exists - generate auth token
    const token = await generateSessionToken({
      user_id: userRecords.id,
      email: userRecords.email,
      role: userRecords.role,
      verified: true
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP verified. Login successful.',
        token,
        user_id: userRecords.id,
        email: userRecords.email,
        role: userRecords.role
      }),
      { 
        status: 200, 
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
 * Generate JWT session token
 * Token expires in 7 days
 */
async function generateSessionToken(
  payload: Record<string, any>
): Promise<string> {
  const secret = Deno.env.get('JWT_SECRET')

  if (!secret) {
    // Fallback for development
    return btoa(JSON.stringify({ ...payload, iat: Date.now() }))
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days

  // For production, use SignJWT from jose library:
  // const token = await new SignJWT(payload)
  //   .setProtectedHeader({ alg: 'HS256' })
  //   .setIssuedAt()
  //   .setExpirationTime(expiresAt)
  //   .sign(key)

  // For now, return a simple token with basic HMAC
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ ...payload, exp: expiresAt, iat: Math.floor(Date.now() / 1000) }))
  const signatureInput = `${header}.${body}`
  
  const signature = btoa(
    String.fromCharCode.apply(
      null,
      Array.from(
        new Uint8Array(
          await crypto.subtle.sign('HMAC', key, encoder.encode(signatureInput))
        )
      ) as number[]
    )
  )

  return `${signatureInput}.${signature}`
}
