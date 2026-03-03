# Environment Configuration Guide

## Overview
ElderConnect+ uses environment variables for configuration across all components. This guide covers all available settings.

## Mobile App Configuration

### File Location
Create `.env` in `mobile/` directory

### Required Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Stripe (for donations)
STRIPE_PUB_KEY=pk_test_...

# Firebase (optional, for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_APP_ID=your-app-id
FIREBASE_API_KEY=your-api-key
```

### Optional Variables
```env
# Logging
LOG_LEVEL=info  # debug, info, warning, error

# Feature Flags
ENABLE_2FA=true
ENABLE_VOICE_ASSISTANCE=true
ENABLE_COMMUNITY_EVENTS=false

# Accessibility
DEFAULT_FONT_SIZE=16  # 16, 20, 24, 28
DEFAULT_CONTRAST=normal  # normal, high
```

### Build Configuration
```bash
# Development build with environment variables
flutter run \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=...

# Release build
flutter build apk \
  --dart-define-from-file=.env \
  --release
```

## Backend Configuration

### Supabase Setup

#### config.toml
Located at `backend/supabase/config.toml`

```toml
[api]
enabled = true
port = 54321

[db]
port = 54322
major_version = 15

[auth]
enable_signup = true
email_max_frequency = "1 sec"
sms_max_frequency = "1 sec"

[auth.email]
enable_signup = true
enable_confirmations = true
max_frequency = "1 sec"
```

#### Environment Variables
```env
# Supabase CLI
SUPABASE_ACCESS_TOKEN=your-access-token

# Database
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres
SHADOW_DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres_shadow

# Edge Functions
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (for notifications)
SENDGRID_API_KEY=SG...

# SMS (for 2FA)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Encryption
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

### Secrets Management
```bash
# Set secrets for edge functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set SENDGRID_API_KEY=SG...

# List secrets
supabase secrets list

# View deployed secrets
supabase secrets list --linked
```

## Admin Dashboard Configuration

### File Location
Create `.env.local` in `admin/` directory

### Required Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Stripe
NEXT_PUBLIC_STRIPE_PUB_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Optional Variables
```env
# Analytics
NEXT_PUBLIC_GA_ID=G-...

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_EXPORT=true

# Theming
NEXT_PUBLIC_PRIMARY_COLOR=#6366F1
NEXT_PUBLIC_FONT_FAMILY=Poppins
```

## Local Development Setup

### 1. Copy Template Files
```bash
# Mobile
cp mobile/.env.example mobile/.env

# Admin
cp admin/.env.example admin/.env.local
```

### 2. Update with Local Values
```bash
# Get Supabase credentials
supabase status

# Copy into .env files
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from supabase status output>
```

### 3. Start Development Environment
```bash
# Terminal 1: Backend
cd backend
supabase start

# Terminal 2: Mobile
cd mobile
flutter run

# Terminal 3: Admin
cd admin
npm run dev
```

## Production Configuration

### Mobile App
```bash
# Build iOS
flutter build ios \
  --dart-define-from-file=.env.production \
  --release

# Build Android
flutter build apk \
  --dart-define-from-file=.env.production \
  --release
```

### Backend (Supabase Cloud)
1. Create Supabase project at supabase.com
2. Get project credentials
3. Set up environment variables in Supabase dashboard
4. Deploy migrations: `supabase db push --linked`
5. Deploy functions: `supabase functions deploy --linked`

### Admin Dashboard
```bash
# Build for production
npm run build

# Deploy to Vercel, AWS, or your hosting
npm run deploy
```

## Security Best Practices

### ❌ NEVER
- Commit `.env` or `.env.local` files
- Share API keys in version control
- Use same keys for development and production
- Store secrets in code

### ✅ DO
- Add `.env` and `.env.local` to `.gitignore`
- Use `.env.example` for documentation
- Rotate keys regularly
- Use separate projects for dev/staging/production
- Store secrets in environment variables
- Use password managers for secret storage
- Enable 2FA on cloud dashboards

### .gitignore Configuration
```
# Environment files
.env
.env.local
.env.*.local
.env.production

# Secrets
secrets/
*.key
*.pem

# Build artifacts
build/
.dart_tool/
node_modules/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo
```

## Rotating Secrets

### Update Supabase Keys
```bash
# In Supabase dashboard:
# 1. Go to Project Settings > API
# 2. Regenerate Anon Key
# 3. Update in all .env files
# 4. Redeploy applications
```

### Update Stripe Keys
```bash
# In Stripe dashboard:
# 1. Settings > API Keys
# 2. Reveal restricted key
# 3. Rotate API key
# 4. Update STRIPE_SECRET_KEY in backend
# 5. Update NEXT_PUBLIC_STRIPE_PUB_KEY in admin
```

## Debugging Environment Issues

### Check Supabase Connection
```bash
# From mobile
flutter run --verbose

# Check logs for connection errors
# Look for "Supabase initialized successfully"
```

### Test Edge Functions
```bash
# Local testing
supabase functions serve

# Test function
curl -X POST http://localhost:54321/functions/v1/emergency-handler \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"userId":"...", "alertType":"..."}'
```

### Verify Database Connection
```bash
# Connect to local database
psql postgresql://postgres:postgres@localhost:54322/postgres

# List tables
\dt

# Check schema
\d users
```

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: Verify SUPABASE_ANON_KEY matches project settings
```bash
supabase status  # Get correct key
```

### Issue: "Connection timeout"
**Solution**: Check Supabase is running
```bash
supabase status
# or restart
supabase stop && supabase start
```

### Issue: "JWT token invalid"
**Solution**: Verify JWT_SECRET matches across services
```bash
# Check in config.toml and edge function settings
```

### Issue: "Port already in use"
**Solution**: Kill process or use different port
```bash
lsof -ti:54321 | xargs kill -9
# or
supabase start -p 54321
```

## References

- [Supabase Environment Variables](https://supabase.com/docs/guides/ci-cd)
- [Flutter Build Configuration](https://flutter.dev/docs/deployment/flavors)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Stripe API Keys](https://stripe.com/docs/keys)

---

For more help: hello@elderconnect.plus
