import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const donationFromEmail = Deno.env.get('DONATION_EMAIL_FROM') || 'donations@elderconnect.dev'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Method not allowed' })
  }

  try {
    const { donationId, amount, paymentIntentId, status, donorEmail, isAnonymous } = await req.json()
    if (!donationId || !status) {
      return jsonResponse(400, { success: false, error: 'donationId and status are required' })
    }

    const { error } = await supabase
      .from('donations')
      .update({
        status: status,
        stripe_payment_intent_id: paymentIntentId,
        receipt_email: donorEmail || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId)

    if (error) throw error

    await supabase
      .from('audit_logs')
      .insert({
        user_id: null,
        action: 'UPDATE',
        table_name: 'donations',
        record_id: donationId,
        old_values: null,
        new_values: {
          status,
          stripe_payment_intent_id: paymentIntentId || null,
          amount: amount || null,
        },
        created_at: new Date().toISOString(),
      })

    if (String(status).toUpperCase() === 'COMPLETED' && !isAnonymous && donorEmail) {
      await sendDonationReceiptEmail(donorEmail, Number(amount || 0), String(paymentIntentId || ''))
    }

    return jsonResponse(200, { success: true, donation_id: donationId })
  } catch (error) {
    console.error('Donation processing error', error)
    return jsonResponse(400, { success: false, error: error instanceof Error ? error.message : 'Request failed' })
  }
})

async function sendDonationReceiptEmail(to: string, amount: number, paymentIntentId: string) {
  if (!resendApiKey) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: donationFromEmail,
      to: [to],
      subject: 'Thank you for your donation',
      html: `
        <p>Thank you for supporting ElderConnect+.</p>
        <p><strong>Amount:</strong> £${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}</p>
        ${paymentIntentId ? `<p><strong>Reference:</strong> ${paymentIntentId}</p>` : ''}
      `,
    }),
  })
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
