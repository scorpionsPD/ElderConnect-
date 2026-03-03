# ElderConnect+ Vercel Deployment Guide

Complete setup to deploy the admin dashboard to Vercel production.

## Phase 1: Pre-Deployment Checklist

### ✅ Code Quality
- [ ] Run linter and fix all errors
- [ ] Run type check
- [ ] Test build locally
- [ ] Commit all changes to git

### ✅ Environment Configuration
- [ ] Create `.env.local` for production (different from development)
- [ ] Disable dev auth mock in production: `NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=false`
- [ ] Verify all API endpoints point to Supabase remote
- [ ] Validate all API keys are set correctly

### ✅ Backend Ready
- [ ] Deploy all Edge Functions to Supabase: `verify-otp`, `signup`, `send-otp`, `companion-requests`, `health-checkins`, `get-profile`
- [ ] Verify CORS headers are correctly configured in all functions
- [ ] Test all API endpoints with production JWT tokens

### ✅ Database
- [ ] All migrations run successfully
- [ ] RLS (Row Level Security) policies configured
- [ ] Test data cleaned up (optional)

---

## Phase 2: GitHub Repository Setup

### Step 1: Initialize Git (if not already done)
```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+

# Check if git is initialized
git status

# If not, initialize
git init
git add .
git commit -m "Initial commit: ElderConnect+ with admin dashboard"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create repository: `ElderConnect-Plus` (or your preferred name)
3. Do NOT initialize with README (we have one)

### Step 3: Push to GitHub
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/ElderConnect-Plus.git

# Rename branch to main if needed
git branch -M main

# Push
git push -u origin main
```

---

## Phase 3: Vercel Account & Project Setup

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub repositories

### Step 2: Import Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository `ElderConnect-Plus`
4. Click "Import"

### Step 3: Configure Build Settings
When Vercel shows the project settings:

**Root Directory**: `./admin`
- This tells Vercel the Next.js app is in the `/admin` folder

**Build Command**: `npm run build`
- Default is correct

**Output Directory**: `.next`
- Default is correct

**Install Command**: `npm install`
- Default is correct

---

## Phase 4: Environment Variables in Vercel

### Step 1: Add Environment Variables
In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://kydzdwzmuibwfohrdcmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHpkd3ptdWlid2ZvaHJkY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODI0MjQsImV4cCI6MjA4Nzc1ODQyNH0.waR-c67gyOgfRPu_yb-ejy78SSsGc1xaW8PbmvcoNhA
NEXT_PUBLIC_API_URL=https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1
NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=false
NEXT_PUBLIC_NOMINATIM_EMAIL=info@scotitech.com
NEXT_PUBLIC_GETADDRESS_API_KEY=O5iC_evP5U6oSVWm8pxXDw50728
NEXT_PUBLIC_GETADDRESS_ADMIN_KEY=Qz59hwkVf0qKnwF7Dxu76g50728
NEXT_PUBLIC_ADDRESS_PROVIDER=getaddress
```

**IMPORTANT**: For `NEXT_PUBLIC_*` variables, they need to be available at build time. Make sure to:
1. Check "Encrypted" checkbox is unchecked (they should be visible for builds)
2. Apply to: "Production", "Preview", "Development"

### Step 2: Verify Production Environment
Make sure the production environment variables are different from development:
- `NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=false` (disable mock auth)
- All other keys same as production Supabase instance

---

## Phase 5: Vercel Deployment

### Step 1: Deploy
Once environment variables are set:
1. Go back to Deployments tab
2. Click "Deploy" or "Redeploy"
3. Wait for build to complete (usually 2-5 minutes)

### Step 2: Monitor Build Logs
- Click on the deployment to see build logs
- Look for any errors related to:
  - Missing environment variables
  - TypeScript errors
  - Next.js build errors

### Step 3: Test Production Deployment
Once deployment succeeds:
1. Click the preview URL (e.g., `https://elderconnect-plus.vercel.app`)
2. Test the login flow with your test account
3. Verify API calls work correctly
4. Check browser console for errors

---

## Phase 6: Custom Domain (Optional)

### Add Custom Domain
1. In Vercel Project Settings → Domains
2. Add your domain (e.g., `admin.elderconnect.co.uk`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take 24-48 hours)

---

## Phase 7: Post-Deployment Checks

### ✅ Security
- [ ] Verify HTTPS is enabled (automatic on Vercel)
- [ ] Check that API keys are environment variables (not hardcoded)
- [ ] Review Supabase RLS policies are enforced

### ✅ Performance
- [ ] Check Vercel Analytics dashboard
- [ ] Review Core Web Vitals
- [ ] Test load time from different locations

### ✅ Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.) - OPTIONAL
- [ ] Configure Vercel alerts for failed deployments
- [ ] Enable Vercel Analytics

### ✅ DNS & SSL
- [ ] Verify SSL certificate is valid
- [ ] Test custom domain works (if configured)
- [ ] Set up SSL auto-renewal

---

## Phase 8: Automatic Deployments

### GitHub Integration (Already Enabled)
Once connected, Vercel automatically:
- **Deploys on push to main**: Production deployment
- **Deploys on pull requests**: Preview deployments
- **Shows deployment status on GitHub**: Merge confidence

### Best Practices
- Keep main branch stable
- Use feature branches for development
- Require preview deployment success before merging

---

## Troubleshooting

### Build Fails with "Cannot find module"
**Solution**: Make sure root directory is set to `./admin`

### "NEXT_PUBLIC_* is undefined"
**Solution**: Environment variables starting with `NEXT_PUBLIC_` must be set in Vercel dashboard, not in `.env.local`

### API calls fail in production (401 errors)
**Solution**: Verify Supabase project is accessible from production:
```bash
# Test from terminal
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1/verify-otp
```

### CORS errors in browser console
**Solution**: Ensure all backend Edge Functions have correct CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
}
```

---

## Quick Reference: Environment Variables

### Production (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://kydzdwzmuibwfohrdcmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1
NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=false
NEXT_PUBLIC_NOMINATIM_EMAIL=info@scotitech.com
NEXT_PUBLIC_GETADDRESS_API_KEY=<your-key>
NEXT_PUBLIC_GETADDRESS_ADMIN_KEY=<your-key>
NEXT_PUBLIC_ADDRESS_PROVIDER=getaddress
```

### Development (Local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://kydzdwzmuibwfohrdcmu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1
NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=true
NEXT_PUBLIC_NOMINATIM_EMAIL=info@scotitech.com
NEXT_PUBLIC_GETADDRESS_API_KEY=<your-key>
NEXT_PUBLIC_GETADDRESS_ADMIN_KEY=<your-key>
NEXT_PUBLIC_ADDRESS_PROVIDER=getaddress
```

---

## CI/CD Pipeline Summary

```
Code Push to GitHub
        ↓
Vercel receives webhook
        ↓
Vercel runs: npm install (in /admin)
        ↓
Vercel runs: npm run build
        ↓
Vercel creates optimized production bundle
        ↓
Vercel deploys to CDN (worldwide)
        ↓
App live at: https://elderconnect-plus.vercel.app
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Status**: https://www.vercel-status.com

