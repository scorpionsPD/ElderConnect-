import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Method not allowed' })
  }

  if (!stripeSecretKey) {
    return jsonResponse(500, { success: false, error: 'Missing STRIPE_SECRET_KEY' })
  }

  try {
    const payload = await req.json()
    const donationId = String(payload.donationId || '')
    const sessionId = String(payload.sessionId || '')

    if (!donationId || !sessionId) {
      return jsonResponse(400, { success: false, error: 'donationId and sessionId are required' })
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=payment_intent`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      },
    )

    const session = await stripeRes.json()

    if (!stripeRes.ok) {
      throw new Error(session?.error?.message || 'Unable to retrieve checkout session')
    }

    const paymentStatus = String(session.payment_status || '').toLowerCase()
    const paid = paymentStatus === 'paid'
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id

    await supabase
      .from('donations')
      .update({
        status: paid ? 'COMPLETED' : 'PROCESSING',
        stripe_payment_intent_id: paymentIntentId || null,
        payment_reference: sessionId,
        receipt_email: session.customer_details?.email || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId)

    return jsonResponse(200, {
      success: true,
      donation_id: donationId,
      paid,
      payment_status: paymentStatus,
      payment_intent_id: paymentIntentId || null,
    })
  } catch (error) {
    console.error('confirm-donation-session failed', error)
    return jsonResponse(400, {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed',
    })
  }
})

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}
