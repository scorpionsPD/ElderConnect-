/**
 * stripe-webhook — Supabase Edge Function
 *
 * Receives Stripe webhook events and reconciles donation state in the database.
 *
 * Handled events:
 *   • checkout.session.completed      — web checkout paid / subscription started
 *   • payment_intent.succeeded        — mobile payment-sheet paid
 *   • payment_intent.payment_failed   — mobile / checkout payment failure
 *   • charge.refunded                 — any refund on a donation
 *   • customer.subscription.deleted   — monthly subscription cancelled
 *
 * Required secrets:
 *   STRIPE_WEBHOOK_SECRET        (whsec_… from Stripe Dashboard)
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional secrets:
 *   EMAIL_HOST
 *   EMAIL_PORT
 *   EMAIL_SECURE
 *   EMAIL_USER
 *   EMAIL_PASSWORD
 *   EMAIL_FROM
 *   EMAIL_FROM_NAME
 *   RESEND_API_KEY               (optional fallback)
 *   DONATION_EMAIL_FROM
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import nodemailer from 'npm:nodemailer@6.9.16'

// ── Constants ────────────────────────────────────────────────────────────────

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const smtpHost = Deno.env.get('EMAIL_HOST')
const smtpPort = Number(Deno.env.get('EMAIL_PORT') || '465')
const smtpSecure = (Deno.env.get('EMAIL_SECURE') || 'true').toLowerCase() === 'true'
const smtpUser = Deno.env.get('EMAIL_USER')
const smtpPassword = Deno.env.get('EMAIL_PASSWORD')
const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'ElderConnect+'
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const donationFromEmail =
  Deno.env.get('DONATION_EMAIL_FROM') ||
  Deno.env.get('EMAIL_FROM') ||
  smtpUser ||
  'donations@elderconnect.dev'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Stripe does NOT send CORS pre-flights — no CORS headers needed here.
// All requests must be POST with a Stripe-Signature header.

// ── Entry ────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  // Read raw body for signature verification — must happen before any .json() call
  const rawBody = await req.text()

  const sigHeader = req.headers.get('stripe-signature')
  if (!sigHeader) {
    return respond(400, { error: 'Missing stripe-signature header' })
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — cannot verify webhook signature')
    return respond(500, { error: 'Webhook secret not configured' })
  }

  // ── Signature verification (HMAC-SHA256) ──────────────────────────────────
  const signatureValid = await verifyStripeSignature(rawBody, sigHeader, webhookSecret)
  if (!signatureValid) {
    return respond(400, { error: 'Webhook signature verification failed' })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody) as StripeEvent
  } catch {
    return respond(400, { error: 'Invalid JSON payload' })
  }

  console.log(`stripe-webhook: received ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as StripeCheckoutSession)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as StripePaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as StripePaymentIntent)
        break
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as StripeCharge)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as StripeSubscription)
        break
      default:
        console.log(`stripe-webhook: unhandled event type ${event.type} — ignoring`)
    }
  } catch (err) {
    console.error(`stripe-webhook: error handling ${event.type}`, err)
    // Return 500 so Stripe retries the event
    return respond(500, { error: err instanceof Error ? err.message : 'Handler error' })
  }

  // Stripe expects a 2xx response to stop retry attempts
  return respond(200, { received: true, event_id: event.id })
})

// ── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(session: StripeCheckoutSession) {
  const paymentStatus = String(session.payment_status || '').toLowerCase()
  const paid = paymentStatus === 'paid' || paymentStatus === 'unpaid_subscription'
  const donationId = session.metadata?.donation_id

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : (session.payment_intent as any)?.id ?? null

  const receiptEmail = session.customer_details?.email ?? null
  const amountTotal = session.amount_total ? session.amount_total / 100 : null

  if (donationId) {
    await upsertDonationStatus({
      donationId,
      status: paid ? 'COMPLETED' : 'PROCESSING',
      paymentIntentId,
      paymentReference: session.id,
      receiptEmail,
      amount: amountTotal,
    })

    if (paid) {
      await writeAuditLog(donationId, 'checkout.session.completed', {
        session_id: session.id,
        payment_status: paymentStatus,
        payment_intent_id: paymentIntentId,
        amount: amountTotal,
      })

      if (receiptEmail) {
        await sendReceiptEmail(receiptEmail, amountTotal ?? 0, paymentIntentId ?? session.id)
      }
    }
  } else {
    // Lookup by payment_intent metadata when donation_id is missing on session
    if (paymentIntentId) {
      await reconcileByPaymentIntent(paymentIntentId, paid ? 'COMPLETED' : 'PROCESSING', receiptEmail)
    }
    console.warn(`stripe-webhook: checkout.session.completed — no donation_id in metadata for session ${session.id}`)
  }
}

async function handlePaymentIntentSucceeded(pi: StripePaymentIntent) {
  const donationId = pi.metadata?.donation_id
  const receiptEmail = pi.receipt_email ?? null
  const amount = pi.amount_received ? pi.amount_received / 100 : pi.amount / 100

  if (donationId) {
    await upsertDonationStatus({
      donationId,
      status: 'COMPLETED',
      paymentIntentId: pi.id,
      paymentReference: pi.id,
      receiptEmail,
      amount,
    })

    await writeAuditLog(donationId, 'payment_intent.succeeded', {
      payment_intent_id: pi.id,
      amount_received: pi.amount_received,
    })

    if (receiptEmail) {
      await sendReceiptEmail(receiptEmail, amount, pi.id)
    }
  } else {
    await reconcileByPaymentIntent(pi.id, 'COMPLETED', receiptEmail)
    console.warn(`stripe-webhook: payment_intent.succeeded — no donation_id in metadata for ${pi.id}`)
  }
}

async function handlePaymentIntentFailed(pi: StripePaymentIntent) {
  const donationId = pi.metadata?.donation_id

  if (donationId) {
    await upsertDonationStatus({
      donationId,
      status: 'FAILED',
      paymentIntentId: pi.id,
      paymentReference: pi.id,
      receiptEmail: pi.receipt_email ?? null,
      amount: null,
    })

    await writeAuditLog(donationId, 'payment_intent.payment_failed', {
      payment_intent_id: pi.id,
      failure_message: pi.last_payment_error?.message ?? 'unknown',
    })

    if (pi.receipt_email) {
      await sendFailureEmail(pi.receipt_email, pi.last_payment_error?.message ?? 'Payment declined')
    }
  } else {
    await reconcileByPaymentIntent(pi.id, 'FAILED', null)
    console.warn(`stripe-webhook: payment_intent.payment_failed — no donation_id in metadata for ${pi.id}`)
  }
}

async function handleChargeRefunded(charge: StripeCharge) {
  const donationId = charge.metadata?.donation_id
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : (charge.payment_intent as any)?.id ?? null

  if (donationId) {
    await upsertDonationStatus({
      donationId,
      status: 'REFUNDED',
      paymentIntentId: paymentIntentId ?? null,
      paymentReference: charge.id,
      receiptEmail: null,
      amount: null,
    })

    await writeAuditLog(donationId, 'charge.refunded', {
      charge_id: charge.id,
      amount_refunded: charge.amount_refunded,
    })
  } else if (paymentIntentId) {
    await reconcileByPaymentIntent(paymentIntentId, 'REFUNDED', null)
    console.warn(`stripe-webhook: charge.refunded — no donation_id in metadata for charge ${charge.id}`)
  }
}

async function handleSubscriptionDeleted(sub: StripeSubscription) {
  // Mark any PROCESSING/PENDING monthly donations linked to this subscription as CANCELLED
  const donationId = sub.metadata?.donation_id

  if (donationId) {
    await supabase
      .from('donations')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId)
      .in('status', ['PROCESSING', 'PENDING'])

    await writeAuditLog(donationId, 'customer.subscription.deleted', {
      subscription_id: sub.id,
    })
  }
}

// ── Shared helpers ───────────────────────────────────────────────────────────

interface UpsertDonationStatusParams {
  donationId: string
  status: string
  paymentIntentId: string | null
  paymentReference: string | null
  receiptEmail: string | null
  amount: number | null
}

async function upsertDonationStatus({
  donationId,
  status,
  paymentIntentId,
  paymentReference,
  receiptEmail,
  amount,
}: UpsertDonationStatusParams) {
  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (paymentIntentId) update.stripe_payment_intent_id = paymentIntentId
  if (paymentReference) update.payment_reference = paymentReference
  if (receiptEmail) update.receipt_email = receiptEmail
  if (amount !== null) update.donation_amount = amount

  const { error } = await supabase
    .from('donations')
    .update(update)
    .eq('id', donationId)

  if (error) {
    throw new Error(`DB update failed for donation ${donationId}: ${error.message}`)
  }
}

async function reconcileByPaymentIntent(
  paymentIntentId: string,
  status: string,
  receiptEmail: string | null,
) {
  const update: Record<string, unknown> = {
    status,
    stripe_payment_intent_id: paymentIntentId,
    updated_at: new Date().toISOString(),
  }
  if (receiptEmail) update.receipt_email = receiptEmail

  const { data, error } = await supabase
    .from('donations')
    .update(update)
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select('id')

  if (error) {
    console.error(`reconcileByPaymentIntent: DB update failed for pi ${paymentIntentId}:`, error.message)
  } else {
    console.log(`reconcileByPaymentIntent: updated ${(data ?? []).length} donation(s) for pi ${paymentIntentId}`)
  }
}

async function writeAuditLog(
  donationId: string,
  eventType: string,
  details: Record<string, unknown>,
) {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: null,
    action: 'UPDATE',
    table_name: 'donations',
    record_id: donationId,
    old_values: null,
    new_values: { event_type: eventType, ...details },
    created_at: new Date().toISOString(),
  })

  if (error) {
    // Audit failures should not block payment flows
    console.warn('stripe-webhook: audit_log insert failed:', error.message)
  }
}

async function sendReceiptEmail(to: string, amount: number, reference: string) {
  await sendDonationEmail(
    {
      to,
      subject: 'Thank you for your ElderConnect+ donation',
      html: `
        <p>Thank you so much for your generous support of <strong>ElderConnect+</strong>.</p>
        <p><strong>Amount:</strong> £${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p>Your donation helps connect lonely seniors with caring companions.</p>
      `,
    },
    'sendReceiptEmail',
  )
}

async function sendFailureEmail(to: string, reason: string) {
  await sendDonationEmail(
    {
      to,
      subject: 'Your ElderConnect+ donation could not be processed',
      html: `
        <p>Unfortunately, your recent donation attempt was not successful.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please try again at <a href="https://www.elderconnect.co.uk/donate">www.elderconnect.co.uk/donate</a>.</p>
      `,
    },
    'sendFailureEmail',
  )
}

async function sendDonationEmail(
  payload: { to: string; subject: string; html: string },
  source: string,
) {
  if (smtpHost && smtpUser && smtpPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      })

      await transporter.sendMail({
        from: `${fromName} <${donationFromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      })
      return
    } catch (err) {
      console.warn(`${source} SMTP failed:`, err)
    }
  }

  if (!resendApiKey) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: donationFromEmail,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  }).catch((err) => console.warn(`${source} resend failed:`, err))
}

// ── Stripe signature verification (manual HMAC — no Stripe SDK needed) ───────
// Algorithm: HMAC-SHA256 over "timestamp.payload" compared against signatures in header.

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  try {
    // Parse "t=...,v1=...,v1=..." format
    const parts: Record<string, string[]> = {}
    for (const piece of sigHeader.split(',')) {
      const [key, value] = piece.split('=')
      if (!key || !value) continue
      if (!parts[key]) parts[key] = []
      parts[key].push(value)
    }

    const timestamp = parts['t']?.[0]
    const v1Sigs = parts['v1'] ?? []

    if (!timestamp || v1Sigs.length === 0) return false

    // Reject webhooks older than 5 minutes
    const eventTs = Number(timestamp)
    const ageSeconds = Math.abs(Date.now() / 1000 - eventTs)
    if (ageSeconds > 300) {
      console.warn(`stripe-webhook: signature too old (${Math.round(ageSeconds)}s)`)
      return false
    }

    const signedPayload = `${timestamp}.${payload}`

    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const sig = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(signedPayload))
    const computedHex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Constant-time comparison equivalent — check each v1 sig
    return v1Sigs.some((expected) => timingSafeEqual(computedHex, expected))
  } catch (err) {
    console.error('stripe-webhook: signature verification error', err)
    return false
  }
}

/**
 * Naive constant-time string comparison to avoid timing attacks.
 * Both strings are hex so same length when correct.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

// ── Minimal Stripe type shims ────────────────────────────────────────────────

interface StripeEvent {
  id: string
  type: string
  data: { object: unknown }
}

interface StripeCheckoutSession {
  id: string
  payment_status: string
  payment_intent: string | { id: string } | null
  amount_total: number | null
  customer_details: { email?: string } | null
  metadata: Record<string, string>
}

interface StripePaymentIntent {
  id: string
  amount: number
  amount_received: number
  receipt_email: string | null
  metadata: Record<string, string>
  last_payment_error: { message?: string } | null
}

interface StripeCharge {
  id: string
  payment_intent: string | { id: string } | null
  amount_refunded: number
  metadata: Record<string, string>
}

interface StripeSubscription {
  id: string
  metadata: Record<string, string>
}

// ── Response helper ──────────────────────────────────────────────────────────

function respond(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
