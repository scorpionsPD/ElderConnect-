# Email Configuration Setup Guide

## Overview

ElderConnect+ is configured to send emails using SendGrid API or Hostinger SMTP. The application supports both Node.js backend services and Supabase Edge Functions (Deno).

---

## Configuration Details

### Your Email Settings

```env
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=info@scotitech.com
EMAIL_PASSWORD=@Port2411
EMAIL_FROM_NAME=ElderConnect+
```

**Provider**: Hostinger SMTP  
**Protocol**: SMTP (SSL/TLS on port 465)  
**From Address**: `ElderConnect+ <info@scotitech.com>`  

---

## Setup Instructions

### Option 1: SendGrid API (Recommended for Deno Edge Functions)

SendGrid is the recommended email service for Supabase Edge Functions since they run Deno, which doesn't have direct SMTP support.

1. **Create SendGrid Account**
   - Visit https://sendgrid.com
   - Sign up for a free account
   - Verify your sender email

2. **Generate API Key**
   - Go to Settings → API Keys
   - Create a new API key with Mail Send access
   - Copy the API key

3. **Set Environment Variable**
   ```env
   SENDGRID_API_KEY=SG.xxx...
   ```

4. **Update Supabase Secrets**
   ```bash
   supabase secrets set SENDGRID_API_KEY=SG.xxx...
   supabase secrets set EMAIL_USER=info@scotitech.com
   supabase secrets set EMAIL_FROM_NAME=ElderConnect+
   ```

### Option 2: Hostinger SMTP (Node.js Backend Only)

For Node.js services in your backend, you can use the direct Hostinger SMTP configuration.

1. **Set Environment Variables**
   ```env
   EMAIL_HOST=smtp.hostinger.com
   EMAIL_PORT=465
   EMAIL_SECURE=true
   EMAIL_USER=info@scotitech.com
   EMAIL_PASSWORD=@Port2411
   EMAIL_FROM_NAME=ElderConnect+
   ```

2. **Test Connection**
   ```bash
   npm install nodemailer
   ```
   
   Then create a test file:
   ```javascript
   const nodemailer = require('nodemailer')
   
   const transporter = nodemailer.createTransport({
     host: 'smtp.hostinger.com',
     port: 465,
     secure: true,
     auth: {
       user: 'info@scotitech.com',
       pass: '@Port2411'
     }
   })
   
   transporter.sendMail({
     from: 'ElderConnect+ <info@scotitech.com>',
     to: 'test@example.com',
     subject: 'Test Email',
     html: '<h1>Test</h1>'
   }, (err, info) => {
     if (err) console.error('Error:', err)
     else console.log('Email sent:', info.response)
   })
   ```

---

## Email Service Files

### 1. Email Service (Node.js)
**File**: `/backend/src/services/email.service.ts`

Complete email service with methods for:
- OTP emails
- Welcome emails
- Companion request notifications
- Password reset emails (future)

**Usage**:
```typescript
import { emailService } from '@/services/email.service'

await emailService.sendOTPEmail('user@example.com', '1234', 10)
await emailService.sendWelcomeEmail('user@example.com', 'John')
```

### 2. Deno Email Module
**File**: `/backend/src/lib/email-deno.ts`

Email functions optimized for Deno Edge Functions:
- `sendOTPEmail()` - Send OTP via SendGrid
- `sendWelcomeEmail()` - Send welcome message
- `sendCompanionRequestNotification()` - Notify matches

**Usage**:
```typescript
import { sendOTPEmail } from './email-deno'

const sent = await sendOTPEmail('user@example.com', '1234', 10)
```

### 3. Supabase Edge Function
**File**: `/backend/supabase/functions/send-otp/index.ts`

Production Edge Function that:
- Generates random 4-digit OTP
- Stores in database
- Sends via SendGrid API
- Fallback to console log in development

---

## Email Templates

### OTP Email Template

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
    <h1 style="color: #333; margin: 0; font-size: 24px;">Your ElderConnect+ OTP</h1>
  </div>
  
  <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
    Here's your one-time password to complete your login:
  </p>
  
  <div style="background-color: #f0f4ff; padding: 30px; border-radius: 8px; text-align: center;">
    <p style="font-size: 48px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">
      1234
    </p>
  </div>
  
  <p style="color: #999; font-size: 14px;">
    This code will expire in 10 minutes.
  </p>
</div>
```

### Welcome Email Template

Includes:
- Gradient header
- Getting started checklist
- Dashboard link
- Footer with legal links

### Companion Request Notification

Includes:
- Volunteer name
- Activity type
- Next steps
- Request details link

---

## Environment Variables

### `.env` File (Development)

```env
# Email Configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=info@scotitech.com
EMAIL_PASSWORD=@Port2411
EMAIL_FROM_NAME=ElderConnect+

# SendGrid (Alternative for Edge Functions)
SENDGRID_API_KEY=SG.xxx...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx...
```

### Supabase Secrets (Production)

```bash
# Set in Supabase dashboard or via CLI
supabase secrets set EMAIL_HOST=smtp.hostinger.com
supabase secrets set EMAIL_PORT=465
supabase secrets set EMAIL_SECURE=true
supabase secrets set EMAIL_USER=info@scotitech.com
supabase secrets set EMAIL_PASSWORD=@Port2411
supabase secrets set EMAIL_FROM_NAME=ElderConnect+
supabase secrets set SENDGRID_API_KEY=SG.xxx...
```

---

## Testing Email

### Test OTP Sending

```bash
curl -X POST http://localhost:54321/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent to test@example.com. It will expire in 10 minutes.",
  "expires_in": 600
}
```

### Test Node.js Service

```bash
cd backend
npm install nodemailer
npm run test:email
```

### Check Email in Console (Development)

When `SENDGRID_API_KEY` is not set, emails are logged:

```
[DEV] OTP for test@example.com: 1234
```

---

## Troubleshooting

### OTP Email Not Sending

**Check 1: SendGrid API Key**
```bash
# Verify the API key is set
echo $SENDGRID_API_KEY
```

**Check 2: Email Configuration**
- Verify `EMAIL_USER` is correct: `info@scotitech.com`
- Verify `EMAIL_FROM_NAME` is set: `ElderConnect+`

**Check 3: Supabase Logs**
```bash
supabase functions logs send-otp
```

**Check 4: Fallback to Console Log**
If SendGrid API key is not set, check for:
```
[DEV] OTP for user@example.com: 1234
```

### SMTP Connection Failed (Hostinger)

If using direct Hostinger SMTP:

1. **Verify Credentials**
   - Email: `info@scotitech.com`
   - Password: `@Port2411`
   - Host: `smtp.hostinger.com`
   - Port: `465` (with SSL)

2. **Check Hostinger Firewall**
   - Ensure port 465 is open
   - Verify IP whitelist settings

3. **Test Connection**
   ```bash
   telnet smtp.hostinger.com 465
   ```

### Email Marked as Spam

To improve deliverability:

1. **Verify Sender Email**
   - Add SPF record: `v=spf1 include:sendgrid.net ~all`
   - Add DKIM record (from SendGrid)
   - Add DMARC record

2. **Update DNS** (with your domain registrar)
   - These records help email providers trust your emails

3. **Monitor Bounce Rate**
   - Check SendGrid dashboard for bounce/spam reports

---

## Email Flow Diagram

```
User Action (Signup/Login)
    ↓
Frontend → API Endpoint
    ↓
Supabase Edge Function (send-otp)
    ↓
Generate OTP + Save to DB
    ↓
Send via SendGrid API / Hostinger SMTP
    ↓
Email Delivered to User
    ↓
User enters OTP for verification
    ↓
Token generated & User authenticated
```

---

## Production Checklist

- [ ] SendGrid API key configured in Supabase secrets
- [ ] Email sender verified in SendGrid
- [ ] DNS records (SPF, DKIM, DMARC) configured
- [ ] Email templates reviewed and tested
- [ ] Bounce/unsubscribe handling configured
- [ ] Email logs monitored
- [ ] Error handling for failed emails
- [ ] Rate limiting for OTP requests

---

## Additional Resources

- **SendGrid Documentation**: https://docs.sendgrid.com
- **Hostinger SMTP**: https://support.hostinger.com/en/articles/360000725494
- **Nodemailer Guide**: https://nodemailer.com
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

**Last Updated**: February 27, 2024  
**Email Provider**: Hostinger SMTP + SendGrid API  
**Status**: ✅ Ready for Production
