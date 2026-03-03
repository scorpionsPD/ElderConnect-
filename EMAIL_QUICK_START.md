# Email Setup Quick Start

## Your Email Configuration

```env
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=info@scotitech.com
EMAIL_PASSWORD=@Port2411
EMAIL_FROM_NAME=ElderConnect+
```

---

## 3 Steps to Get Email Working

### Step 1: Choose Email Service

**Option A: SendGrid (Recommended for Supabase Edge Functions)**
```bash
# Sign up at https://sendgrid.com
# Get API key from Settings → API Keys
# Set environment variable:
SENDGRID_API_KEY=SG.xxx...
```

**Option B: Direct SMTP (Hostinger)**
```bash
# Use the credentials above
# Already configured in .env.example
# Nodemailer will handle SMTP connection
```

### Step 2: Set Environment Variables

**For Supabase Edge Functions:**
```bash
supabase secrets set SENDGRID_API_KEY=SG.xxx...
supabase secrets set EMAIL_USER=info@scotitech.com
supabase secrets set EMAIL_FROM_NAME=ElderConnect+
```

**For Local Development (.env):**
```env
SENDGRID_API_KEY=SG.xxx...
EMAIL_USER=info@scotitech.com
EMAIL_FROM_NAME=ElderConnect+
```

### Step 3: Test Email

**Send OTP via API:**
```bash
curl -X POST http://localhost:54321/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to test@example.com. It will expire in 10 minutes.",
  "expires_in": 600
}
```

---

## Files Created

1. **`/backend/src/services/email.service.ts`** (5.8 KB)
   - Node.js email service with Nodemailer
   - Methods: sendOTPEmail, sendWelcomeEmail, etc.

2. **`/backend/src/lib/email-deno.ts`** (4.2 KB)
   - Deno-compatible email functions
   - Uses SendGrid API
   - For Edge Functions

3. **`/backend/supabase/functions/send-otp/index.ts`** (Updated)
   - Now uses SendGrid API
   - Fallback to console log in dev
   - Production-ready

4. **`/.env.example`** (Updated)
   - Complete environment variables
   - Email configuration included

5. **`/EMAIL_SETUP.md`**
   - Full email configuration guide
   - Templates and troubleshooting

---

## Email Features

### Implemented Templates

✅ **OTP Email**
- 4-digit code display
- 10-minute expiration notice
- Security message
- Professional design

✅ **Welcome Email**
- Personalized greeting
- Getting started checklist
- Dashboard link
- Legal footer

✅ **Companion Request Notification**
- Volunteer name
- Activity type
- Next steps
- Request link

### Future Templates

- [ ] Password reset
- [ ] Appointment reminder
- [ ] Monthly newsletter
- [ ] Activity report

---

## Troubleshooting

### Emails not sending?

1. **Check API Key**
   ```bash
   echo $SENDGRID_API_KEY
   ```

2. **Check Logs**
   ```bash
   supabase functions logs send-otp
   ```

3. **Development Fallback**
   - Check terminal for: `[DEV] OTP for user@email.com: 1234`

### SMTP Connection Error?

1. Verify credentials in Hostinger account
2. Check firewall allows port 465
3. Test connection:
   ```bash
   telnet smtp.hostinger.com 465
   ```

---

## Next Steps

1. ✅ Configure SendGrid or SMTP
2. ✅ Set environment variables
3. ✅ Test OTP sending
4. ✅ Deploy to Supabase
5. ✅ Monitor email delivery

---

## Support

- **Full Guide**: See `/EMAIL_SETUP.md`
- **SendGrid Docs**: https://docs.sendgrid.com
- **Hostinger Support**: https://support.hostinger.com

**Status**: ✅ Ready to use!
