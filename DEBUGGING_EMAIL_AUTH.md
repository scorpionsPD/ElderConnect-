# Email & Authentication Debugging Guide

## Email Delivery Status

### Localhost (Development)
Since `SENDGRID_API_KEY` is not configured, emails won't be sent to your inbox.

**Where to find OTP:**
1. **Check Edge Function Logs**:
   ```bash
   # View live logs in Supabase dashboard
   https://supabase.com/dashboard/project/kydzdwzmuibwfohrdcmu/functions
   ```
   
2. **Check Backend Logs**:
   ```bash
   export SUPABASE_ACCESS_TOKEN=sbp_4b6ddc62792b98129817bb2f33b0499348c62a54
   cd backend
   supabase functions logs send-otp
   ```

3. **OTP is logged as**: `[DEV] OTP for email@example.com: 1234`

### Alternative: Use Test OTP
For development/testing, use hardcoded OTP: **0000**

---

## Authentication Flow Issues & Fixes

### Issue 1: Automatically Logged Out After Signup

**Problem**: 
- User signup succeeds
- User is automatically logged out
- Cannot login again

**Root Cause**:
- Signup page doesn't call backend `/signup` endpoint
- AuthContext `login()` function doesn't set user state for new users
- User state remains null despite successful OTP verification

**Solution**:
1. ✅ Fixed AuthContext to properly handle new user flow
2. Update signup page to call backend API
3. Store temporary token in localStorage

---

## Testing Scenarios

### Scenario 1: Login with Existing Account
```bash
1. Go to http://localhost:3000/login
2. Enter email: test@example.com
3. OTP: 0000 (hardcoded for dev)
4. Should redirect to dashboard
```

### Scenario 2: Signup New Account
```bash
1. Go to http://localhost:3000/signup
2. Select role (Elder/Volunteer/Family)
3. Enter email and name
4. OTP: 0000
5. Fill preferences
6. Should create account and redirect to dashboard
```

### Scenario 3: Receive Real Email (Production)

**Prerequisites**:
- Set `SENDGRID_API_KEY` in Supabase secrets
- Deploy updated functions

**Setup**:
```bash
# 1. Get SendGrid API key from https://sendgrid.com
# 2. Set secret in Supabase
export SUPABASE_ACCESS_TOKEN=sbp_4b6ddc62792b98129817bb2f33b0499348c62a54
cd backend
supabase secrets set SENDGRID_API_KEY=SG.xxxxx
supabase functions deploy send-otp
```

**Test**:
```bash
curl -X POST https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHpkd3ptdWlid2ZvaHJkY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODI0MjQsImV4cCI6MjA4Nzc1ODQyNH0.waR-c67gyOgfRPu_yb-ejy78SSsGc1xaW8PbmvcoNhA" \
  -d '{"email":"your-email@example.com"}'
```

---

## Current System Status

| Component | Status | Notes |
|-----------|--------|-------|
| send-otp function | ✅ Working | Returns OTP, logs to console |
| verify-otp function | ✅ Working | Validates OTP, returns JWT |
| signup function | ✅ Working | Creates user account |
| get-profile function | ✅ Working | Fetches user data |
| Email delivery | ❌ Dev mode | Logs OTP to console, no email |
| Login page | ✅ Working | OTP flow complete |
| Signup page | ⚠️ Partial | No backend integration yet |
| Auth persistence | ✅ Fixed | Token stored, auto-reload |

---

## Next Steps

### For Development
1. Use OTP: **0000** for all testing
2. Check function logs when issues occur
3. Monitor terminal for `[DEV] OTP` messages

### For Production
1. Configure SendGrid API key
2. Update Supabase secrets
3. Deploy updated functions
4. Update signup page to use backend API
5. Test full flow with real emails

---

## Useful Commands

**View all secrets**:
```bash
export SUPABASE_ACCESS_TOKEN=sbp_4b6ddc62792b98129817bb2f33b0499348c62a54
cd backend
supabase secrets list
```

**View function logs in real-time**:
```bash
supabase functions logs send-otp --follow
```

**Test without credentials** (uses test@example.com):
```bash
curl -X POST https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHpkd3ptdWlid2ZvaHJkY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODI0MjQsImV4cCI6MjA4Nzc1ODQyNH0.waR-c67gyOgfRPu_yb-ejy78SSsGc1xaW8PbmvcoNhA" \
  -d '{"email":"test@example.com"}'
```

---

## To Receive Email in Localhost

### Option 1: SendGrid (Recommended)
- Free tier: 100 emails/day
- Setup: 5 minutes
- Reliability: 99.99%

### Option 2: Hostinger SMTP
- Direct SMTP integration
- Setup: Already configured in `email.service.ts`
- Note: Edge Functions don't support SMTP directly

### Option 3: MailTrap (Testing)
- Free email testing service
- Captures all emails without sending
- Perfect for development

**Setup MailTrap**:
1. Go to https://mailtrap.io
2. Create free account
3. Get SMTP credentials
4. Update `send-otp` function to use MailTrap
5. Test emails appear in MailTrap inbox

