import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const stripePublishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY')

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

    const amount = Number(payload.amount)
    const currency = String(payload.currency || 'GBP').toLowerCase()
    const donationType = String(payload.donationType || 'ONE_TIME').toUpperCase()
    const donationMethod = String(payload.donationMethod || 'CARD').toUpperCase()
    const donorEmail = payload.donorEmail ? String(payload.donorEmail).trim() : null
    const donorMessage = payload.donorMessage ? String(payload.donorMessage).trim() : null
    const isAnonymous = payload.isAnonymous === true
    const donorId = payload.donorId ? String(payload.donorId) : null

    if (!Number.isFinite(amount) || amount <= 0) {
      return jsonResponse(400, { success: false, error: 'amount must be greater than 0' })
    }

    const amountMinor = Math.round(amount * 100)

    const { data: donation, error: donationInsertError } = await supabase
      .from('donations')
      .insert({
        donor_id: donorId,
        donation_amount: amount,
        currency: currency.toUpperCase(),
        donation_type: donationType,
        donation_method: donationMethod,
        is_anonymous: isAnonymous,
        donor_message: donorMessage,
        receipt_email: donorEmail,
        status: 'PENDING',
      })
      .select('*')
      .single()

    if (donationInsertError || !donation) {
      throw donationInsertError || new Error('Failed to create donation row')
    }

    const stripeBody = new URLSearchParams()
    stripeBody.append('amount', String(amountMinor))
    stripeBody.append('currency', currency)
    stripeBody.append('automatic_payment_methods[enabled]', 'true')
    stripeBody.append('description', 'ElderConnect+ Donation')
    stripeBody.append('metadata[donation_id]', donation.id)
    stripeBody.append('metadata[donation_type]', donationType)
    if (donorEmail) stripeBody.append('metadata[donor_email]', donorEmail)
    if (donorEmail) stripeBody.append('receipt_email', donorEmail)

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeBody,
    })

    const stripePayload = await stripeRes.json()

    if (!stripeRes.ok) {
      await supabase
        .from('donations')
        .update({ status: 'FAILED' })
        .eq('id', donation.id)

      const stripeMessage = stripePayload?.error?.message || 'Failed to create payment intent'
      throw new Error(stripeMessage)
    }

    const paymentIntentId = String(stripePayload.id)
    const clientSecret = String(stripePayload.client_secret)

    await supabase
      .from('donations')
      .update({
        status: 'PROCESSING',
        stripe_payment_intent_id: paymentIntentId,
        payment_reference: paymentIntentId,
      })
      .eq('id', donation.id)

    return jsonResponse(200, {
      success: true,
      donation_id: donation.id,
      payment_intent_id: paymentIntentId,
      client_secret: clientSecret,
      publishable_key: stripePublishableKey,
      amount_minor: amountMinor,
      currency,
    })
  } catch (error) {
    console.error('create-donation-intent failed', error)
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
