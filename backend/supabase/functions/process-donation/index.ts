// Supabase Edge Function: Process donations
// Handles Stripe payment callbacks and donation tracking

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { donationId, amount, paymentIntentId, status, donorEmail, isAnonymous } = await req.json()

    // Update donation record
    const { error } = await supabase
      .from('donations')
      .update({
        status: status,
        stripe_payment_intent_id: paymentIntentId,
        updated_at: new Date().toIso8601String(),
      })
      .eq('id', donationId)

    if (error) throw error

    // Log audit event
    await supabase
      .from('audit_logs')
      .insert({
        action: 'UPDATE',
        table_name: 'donations',
        record_id: donationId,
        status: 'SUCCESS',
        created_at: new Date().toIso8601String(),
      })

    // Send receipt email if not anonymous
    if (!isAnonymous && donorEmail) {
      // TODO: Send receipt email
    }

    return new Response(
      JSON.stringify({ success: true, donation_id: donationId }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
