import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const stripeMonthlyPriceId = Deno.env.get('STRIPE_MONTHLY_PRICE_ID')

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
    const donorEmail = payload.donorEmail ? String(payload.donorEmail).trim() : null
    const donorName = payload.donorName ? String(payload.donorName).trim() : null
    const donorMessage = payload.donorMessage ? String(payload.donorMessage).trim() : null
    const isAnonymous = payload.isAnonymous === true
    const donorId = payload.donorId ? String(payload.donorId) : null
    const successUrl = String(payload.successUrl || '')
    const cancelUrl = String(payload.cancelUrl || '')

    if (!Number.isFinite(amount) || amount <= 0) {
      return jsonResponse(400, { success: false, error: 'amount must be greater than 0' })
    }

    if (!successUrl || !cancelUrl) {
      return jsonResponse(400, { success: false, error: 'successUrl and cancelUrl are required' })
    }

    const amountMinor = Math.round(amount * 100)
    const isMonthly = donationType === 'MONTHLY_SUBSCRIPTION'

    const { data: donation, error: donationInsertError } = await supabase
      .from('donations')
      .insert({
        donor_id: donorId,
        donation_amount: amount,
        currency: currency.toUpperCase(),
        donation_type: donationType,
        donation_method: 'CARD',
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

    const finalSuccessUrl = successUrl.replace('{DONATION_ID}', donation.id)
    const finalCancelUrl = cancelUrl.replace('{DONATION_ID}', donation.id)

    const stripeBody = new URLSearchParams()
    stripeBody.append('success_url', finalSuccessUrl)
    stripeBody.append('cancel_url', finalCancelUrl)
    stripeBody.append('allow_promotion_codes', 'true')
    stripeBody.append('payment_method_types[0]', 'card')
    stripeBody.append('metadata[donation_id]', donation.id)
    stripeBody.append('metadata[donation_type]', donationType)
    if (donorEmail) {
      stripeBody.append('customer_email', donorEmail)
      stripeBody.append('metadata[donor_email]', donorEmail)
    }
    if (donorName) stripeBody.append('metadata[donor_name]', donorName)

    if (isMonthly && stripeMonthlyPriceId) {
      stripeBody.append('mode', 'subscription')
      stripeBody.append('line_items[0][price]', stripeMonthlyPriceId)
      stripeBody.append('line_items[0][quantity]', '1')
    } else {
      stripeBody.append('mode', 'payment')
      stripeBody.append('line_items[0][price_data][currency]', currency)
      stripeBody.append('line_items[0][price_data][product_data][name]', 'ElderConnect+ Donation')
      stripeBody.append('line_items[0][price_data][product_data][description]', 'Support companionship for seniors')
      stripeBody.append('line_items[0][price_data][unit_amount]', String(amountMinor))
      stripeBody.append('line_items[0][quantity]', '1')
      stripeBody.append('payment_intent_data[metadata][donation_id]', donation.id)
      if (donorEmail) stripeBody.append('payment_intent_data[metadata][donor_email]', donorEmail)
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
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

      const stripeMessage = stripePayload?.error?.message || 'Failed to create checkout session'
      throw new Error(stripeMessage)
    }

    await supabase
      .from('donations')
      .update({
        status: 'PROCESSING',
        payment_reference: String(stripePayload.id),
      })
      .eq('id', donation.id)

    return jsonResponse(200, {
      success: true,
      donation_id: donation.id,
      session_id: stripePayload.id,
      checkout_url: stripePayload.url,
      mode: isMonthly && stripeMonthlyPriceId ? 'subscription' : 'payment',
    })
  } catch (error) {
    console.error('create-donation-checkout-session failed', error)
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
