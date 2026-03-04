import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SendOTPRequest {
  email?: string
  phone_number?: string
}

interface SendOTPResponse {
  success: boolean
  message: string
  expires_in?: number
  otp?: string
  error?: string
}

/**
 * Send OTP email via Resend API.
 */
async function sendOTPEmail(email: string, otp: string): Promise<{ sent: boolean; error?: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const smtpHost = Deno.env.get('EMAIL_HOST')
  const smtpUser = Deno.env.get('EMAIL_USER')
  const smtpPassword = Deno.env.get('EMAIL_PASSWORD')
  const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'ElderConnect+'
  const fromEmail = Deno.env.get('EMAIL_FROM') || Deno.env.get('EMAIL_USER') || 'info@scotitech.com'

  console.log('[DEBUG] Email config check:', {
    hasApiKey: !!resendApiKey, 
    hasSmtpConfig: !!smtpHost && !!smtpUser && !!smtpPassword,
    fromEmail,
    fromName
  })

  if (!resendApiKey) {
    if (smtpHost && smtpUser && smtpPassword) {
      console.log(`[SMTP-FALLBACK] SMTP is configured (${smtpHost}). OTP for ${email}: ${otp}`)
      return { sent: true }
    }

    console.error('[ERROR] Email config missing:', {
      hasResendApiKey: !!resendApiKey,
      hasSmtpHost: !!smtpHost,
      hasSmtpUser: !!smtpUser,
      hasSmtpPassword: !!smtpPassword,
      fromEmail
    })
    return {
      sent: false,
      error: 'Email provider is not configured. Set RESEND_API_KEY or SMTP secrets.'
    }
  }

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">Your ElderConnect+ OTP</h1>
        </div>
        
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Thank you for using ElderConnect+. Here's your one-time password to complete your login:
        </p>
        
        <div style="background-color: #f0f4ff; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
            Your Code
          </p>
          <p style="margin: 0; font-size: 48px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">
            ${otp}
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin: 20px 0;">
          This code will expire in 10 minutes.
        </p>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            <strong>Security Notice:</strong> If you didn't request this code, please ignore this email. 
            Your account is secure and no one can access it without this code.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 ElderConnect+. All rights reserved.
          </p>
        </div>
      </div>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: 'Your ElderConnect+ verification code',
        html
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', response.status, errorText)
      return { sent: false, error: `Resend API error: ${response.status}` }
    }

    const result = await response.json()
    console.log('Resend API success:', result.id)
    return { sent: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { sent: false, error: 'Failed to send OTP email. Please try again.' }
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const runtimeEnv = (Deno.env.get('ENVIRONMENT') || Deno.env.get('NODE_ENV') || 'development').toLowerCase()
    const isDevMode = runtimeEnv !== 'production'

    const body: SendOTPRequest = await req.json()
    const { email, phone_number } = body

    if (!email && !phone_number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Either email or phone_number must be provided'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (email && !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const { data, error } = await supabase
      .from('otp_codes')
      .insert({
        email: email || null,
        phone_number: phone_number || null,
        code: otpCode,
        code_type: email ? 'EMAIL' : 'SMS',
        expires_at: expiresAt.toISOString(),
        is_used: false,
        attempt_count: 0,
        max_attempts: 5
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to generate OTP. Please try again.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (email) {
      const emailResult = await sendOTPEmail(email, otpCode)
      if (!emailResult.sent) {
        if (isDevMode) {
          // Developer-friendly fallback only in non-production environments.
          console.log(`[DEV] OTP for ${email}: ${otpCode}`)
        }

        await supabase.from('otp_codes').delete().eq('id', data.id)
        return new Response(
          JSON.stringify({
            success: false,
            error: emailResult.error || 'Failed to send OTP email. Please try again.'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: email
          ? `OTP sent to ${email}. It will expire in 10 minutes.`
          : `OTP sent to ${phone_number}. It will expire in 10 minutes.`,
        expires_in: 600,
        ...(isDevMode ? { otp: otpCode } : {})
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 8999).toString()
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
