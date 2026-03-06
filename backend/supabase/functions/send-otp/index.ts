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
 * Send OTP email via SMTP (using Mailgun API as SMTP bridge for Deno Edge)
 */
async function sendOTPEmail(email: string, otp: string): Promise<{ sent: boolean; error?: string }> {
  const smtpHost = Deno.env.get('EMAIL_HOST')
  const smtpPort = Deno.env.get('EMAIL_PORT')
  const smtpUser = Deno.env.get('EMAIL_USER')
  const smtpPassword = Deno.env.get('EMAIL_PASSWORD')
  const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'ElderConnect+'
  const fromEmail = smtpUser || Deno.env.get('EMAIL_FROM') || 'info@scotitech.com'

  console.log('[DEBUG] SMTP config check:', {
    hasHost: !!smtpHost,
    hasPort: !!smtpPort,
    hasUser: !!smtpUser,
    hasPassword: !!smtpPassword,
    fromEmail
  })

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.error('[ERROR] SMTP config missing')
    return {
      sent: false,
      error: 'Email provider is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD.'
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

    // Use SendGrid's SMTP API as bridge (supports raw SMTP credentials)
    const formData = new FormData()
    formData.append('from', `${fromName} <${fromEmail}>`)
    formData.append('to', email)
    formData.append('subject', 'Your ElderConnect+ verification code')
    formData.append('html', html)

    // Alternative: Use Mailgun with SMTP credentials
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN')
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')

    if (mailgunApiKey && mailgunDomain) {
      const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Mailgun API error:', response.status, errorText)
        return {
          sent: false,
          error: 'Failed to send OTP email via Mailgun. Please try again.'
        }
      }

      const result = await response.json()
      console.log('Mailgun API success:', result.id)
      return { sent: true }
    }

    // Fallback: Direct SMTP emulation via SendGrid
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendgridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email }],
            subject: 'Your ElderConnect+ verification code'
          }],
          from: {
            email: fromEmail,
            name: fromName
          },
          content: [{
            type: 'text/html',
            value: html
          }]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('SendGrid API error:', response.status, errorText)
        return {
          sent: false,
          error: 'Failed to send OTP email via SendGrid. Please try again.'
        }
      }

      console.log('SendGrid API success')
      return { sent: true }
    }

    // If no HTTP bridge available, log the requirement
    console.error('[ERROR] No email API bridge configured. Supabase Edge Functions require HTTP-based email services (Mailgun, SendGrid, or Resend).')
    return {
      sent: false,
      error: 'Email service not available. Configure MAILGUN_API_KEY or SENDGRID_API_KEY for SMTP bridge.'
    }

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
