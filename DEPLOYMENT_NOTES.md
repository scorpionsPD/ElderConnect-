# Edge Function Deployment Notes

## Status
The admin frontend is now correctly configured to send both `apikey` and `Authorization` headers required by Supabase Edge Functions.

## What Was Fixed

### Client-Side (admin/src/utils/api-client.ts)
✅ Updated to send both required headers:
- `apikey: <SUPABASE_ANON_KEY>` — Gateway authentication
- `Authorization: Bearer <token>` — User or service authentication

### Backend Functions - CORS Headers Updated
✅ Updated CORS headers in all Edge Functions to allow `apikey`:
- `/backend/supabase/functions/verify-otp/index.ts`
- `/backend/supabase/functions/send-otp/index.ts`
- `/backend/supabase/functions/signup/index.ts`
- `/backend/supabase/functions/companion-requests/index.ts`
- `/backend/supabase/functions/health-checkins/index.ts`
- `/backend/supabase/functions/get-profile/index.ts`

Each now includes `apikey` in `Access-Control-Allow-Headers`.

## What Needs to Be Done

### Deploy Updated Functions to Remote Supabase
The changes are made locally but need to be deployed to your remote Supabase project.

**To deploy:**
```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+/backend

# Authenticate with your Supabase account
supabase login

# Deploy each function
supabase functions deploy verify-otp
supabase functions deploy send-otp
supabase functions deploy signup
supabase functions deploy companion-requests
supabase functions deploy health-checkins
supabase functions deploy get-profile
```

Once deployed, the CORS errors will be resolved and the login/OTP flow will work correctly.

## Current Configuration
- **Admin URL**: http://localhost:3001
- **Supabase Backend**: https://kydzdwzmuibwfohrdcmu.supabase.co
- **Status**: Waiting for Edge Function deployment to remote Supabase
