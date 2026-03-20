# Stripe Donation Go-Live Checklist

## 1) Required Keys and Secrets

### Supabase Edge Functions (required)
Set these as Supabase function secrets:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_MONTHLY_PRICE_ID` (required if monthly option enabled)
- `STRIPE_WEBHOOK_SECRET` (recommended for production reconciliation)

Also ensure existing service secrets are present:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 

### Web (`admin/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DONATIONS_ENABLED=true`

### Mobile (`mobile/.env`)

- `STRIPE_PUB_KEY`
- `STRIPE_MERCHANT_IDENTIFIER`
- `STRIPE_MERCHANT_COUNTRY`
- `ENABLE_DONATIONS=true`

---

## 2) Apple Pay Readiness (iOS)

1. Create Apple Merchant ID in Apple Developer (must match `STRIPE_MERCHANT_IDENTIFIER`).
2. Add Apple Pay capability to `Runner` target in Xcode.
3. Attach merchant ID to app identifier.
4. In Stripe Dashboard, enable Apple Pay.
5. Complete Apple Pay certificate setup in Stripe.

---

## 3) Deploy Donation Edge Functions

Run from `backend`:

```bash
supabase functions deploy create-donation-intent
supabase functions deploy create-donation-checkout-session
supabase functions deploy confirm-donation-session
supabase functions deploy process-donation
supabase functions deploy stripe-webhook
```

Set secrets (example):

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_PUBLISHABLE_KEY=pk_live_xxx \
  STRIPE_MONTHLY_PRICE_ID=price_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 3b) Configure Stripe Webhook in Dashboard

1. Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**.
2. Set endpoint URL:
   ```
   https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1/stripe-webhook
   ```
   Do **not** use a page URL such as `https://elderconnect-eta.vercel.app/welcome` for Stripe webhooks.
   Stripe must send events to the Edge Function endpoint above.
3. Subscribe to these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (`whsec_…`) and set as `STRIPE_WEBHOOK_SECRET`.

---

## 4) Stripe Webhook (Implemented)

The `stripe-webhook` edge function is already implemented and handles:

| Event | Action |
|---|---|
| `checkout.session.completed` | Marks donation COMPLETED, sends receipt email |
| `payment_intent.succeeded` | Marks donation COMPLETED, sends receipt email |
| `payment_intent.payment_failed` | Marks donation FAILED, sends failure email |
| `charge.refunded` | Marks donation REFUNDED |
| `customer.subscription.deleted` | Marks monthly donation CANCELLED |

Signature verification uses HMAC-SHA256 with a 5-minute replay-attack window.

Fallback: if `donation_id` is absent from metadata, the function reconciles by `stripe_payment_intent_id`.

---

## 5) Live Test Plan

### Web donation test
1. Open `/donate` on web.
2. Submit test amount and complete Stripe Checkout with test card.
3. Confirm redirect back includes `status=success`, `donation_id`, `session_id`.
4. Confirm thank-you UI shown.
5. Verify donation row status in DB is `COMPLETED` (or equivalent final state).

### Mobile donation test
1. Open app and navigate to Donate screen.
2. Select amount and submit Payment Sheet.
3. Complete payment with test card / Apple Pay sandbox.
4. Verify success message and DB donation status updated.

### Failure-path test
- Cancel checkout/payment and confirm UI error/cancel handling and DB status are consistent.

---

## 6) Production Safety Checks

- Ensure only `pk_*` keys are used client-side, never `sk_*`.
- Confirm HTTPS-only domains for web redirects and webhooks.
- Confirm CORS headers and origin restrictions in production where possible.
- Confirm monthly price ID points to correct product and currency.
- Monitor function logs during first live transactions.
