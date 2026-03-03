# Supabase Configuration Complete ✅

## Your Credentials

> **⚠️ IMPORTANT**: Never commit secrets to Git!  
> Your actual credentials are in your `.env.local` file (gitignored)

```
Project URL: https://kydzdwzmuibwfohrdcmu.supabase.co
Anon Key: [See your .env.local file]
Secret Key: [NEVER commit this - keep in .env.local only]
```

---

## 3 Steps to Finish Setup

### Step 1: Link Project Locally

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+

# Link to your Supabase project
supabase link --project-ref kydzdwzmuibwfohrdcmu

# When prompted for password, enter: @Port2411241
```

### Step 2: Set Secrets in Supabase

Run these commands to set environment variables for Edge Functions:

```bash
# Email Configuration
supabase secrets set SENDGRID_API_KEY="SG.xxx..." # Get from SendGrid, or skip for Hostinger SMTP

supabase secrets set EMAIL_USER="info@scotitech.com"
supabase secrets set EMAIL_PASSWORD="@Port2411"
supabase secrets set EMAIL_FROM_NAME="ElderConnect+"

# Supabase Configuration
supabase secrets set SUPABASE_URL="https://kydzdwzmuibwfohrdcmu.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"  # Get from .env.local
```

### Step 3: Deploy Edge Functions

```bash
# Deploy all functions to Supabase
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy signup
supabase functions deploy get-profile
supabase functions deploy companion-requests
supabase functions deploy health-checkins
```

---

## Test Email Sending

Once deployed, test OTP sending:

```bash
curl -X POST https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>" \
  -d '{"email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to test@example.com. It will expire in 10 minutes.",
  "expires_in": 600
}
```

---

## Local Development Setup

Create `.env` file in `/admin` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kydzdwzmuibwfohrdcmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_piyMV59nysBl55-jxQf3jA_krdNV-uI

# API
NEXT_PUBLIC_API_URL=https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1
```

Then run:

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+/admin
npm install
npm run dev
```

---

## Backend Edge Functions Ready

All 8 APIs configured and ready to deploy:

1. ✅ **send-otp** - Email OTP delivery
2. ✅ **verify-otp** - OTP validation + JWT generation
3. ✅ **signup** - User account creation
4. ✅ **get-profile** - Profile GET/PUT
5. ✅ **companion-requests** - Request management
6. ✅ **health-checkins** - Wellness tracking
7. ✅ **process-donation** - Donation processing
8. ✅ **gdpr-delete-user** - User deletion

---

## Important Notes

- **Secret Key vs Service Role Key**: Your `sb_secret_*` is the service role key (full database access for backend)
- **Anon Key**: Used in frontend, restricted permissions
- **Email**: Will fall back to console logging if SENDGRID_API_KEY not set
- **Database**: migrations already configured, will auto-run on deploy

---

## Next: Frontend Configuration

Update `/admin/src/utils/api-client.ts` to use your Supabase URL:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  'https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1'
```

---

## Checklist

- [ ] Run `supabase link` with project ref
- [ ] Set all environment secrets with `supabase secrets set`
- [ ] Deploy Edge Functions with `supabase functions deploy`
- [ ] Test OTP endpoint with curl
- [ ] Configure .env in /admin directory
- [ ] Run frontend dev server
- [ ] Test login → OTP → Dashboard flow

---

**Status**: 🎉 Ready to deploy!
