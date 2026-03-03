# Vercel Deployment - Quick Start (5 Minutes)

## Prerequisites
- GitHub account with your code pushed
- Vercel account (free tier works)

---

## Step 1: Run Pre-Deployment Checklist (1 min)

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+
chmod +x scripts/pre-deploy.sh
./scripts/pre-deploy.sh
```

**Fix any failures before proceeding.**

---

## Step 2: Push to GitHub (1 min)

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+

# Commit all changes
git add .
git commit -m "chore: prepare for Vercel deployment"

# Push to main branch
git push origin main
```

---

## Step 3: Create Vercel Project (2 min)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. **Select your repository** (ElderConnect-Plus or similar)
4. Click **"Import"**

### Build Settings (Vercel will auto-detect):
- **Root Directory**: `./admin`
- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

Click **"Deploy"** to proceed

---

## Step 4: Add Environment Variables (1 min)

⚠️ **IMPORTANT**: Don't deploy yet if Vercel shows warnings about missing env vars.

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://kydzdwzmuibwfohrdcmu.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHpkd3ptdWlid2ZvaHJkY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODI0MjQsImV4cCI6MjA4Nzc1ODQyNH0.waR-c67gyOgfRPu_yb-ejy78SSsGc1xaW8PbmvcoNhA

NEXT_PUBLIC_API_URL
Value: https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1

NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK
Value: false

NEXT_PUBLIC_NOMINATIM_EMAIL
Value: info@scotitech.com

NEXT_PUBLIC_GETADDRESS_API_KEY
Value: O5iC_evP5U6oSVWm8pxXDw50728

NEXT_PUBLIC_GETADDRESS_ADMIN_KEY
Value: Qz59hwkVf0qKnwF7Dxu76g50728

NEXT_PUBLIC_ADDRESS_PROVIDER
Value: getaddress
```

**For each variable:**
- ✅ Leave "Encrypted" unchecked (needs to be available at build time)
- ✅ Select: Production, Preview, and Development

3. Click **"Save"**

---

## Step 5: Deploy! 🚀

1. Go to **Deployments** tab
2. Click **"Redeploy"** (or "Deploy Now" if you just added env vars)
3. Wait for build to complete (2-5 minutes)

### What to look for:
- ✅ **Build succeeded** - deployment is live
- ❌ **Build failed** - check build logs (scroll down in dashboard)

---

## Step 6: Test Production

Once deployment says "Ready":

1. Click the **preview URL** (looks like `https://elderconnect-plus.vercel.app`)
2. Test login with your test credentials (OTP: 1234)
3. Try creating a companion request
4. Verify data persists on refresh

---

## Step 7: Set Custom Domain (Optional)

1. In Vercel Settings → **Domains**
2. Add your domain (e.g., `admin.elderconnect.co.uk`)
3. Follow DNS instructions from your domain provider
4. Wait for DNS propagation (24-48 hours)

---

## Common Issues & Fixes

### ❌ Build fails: "Cannot find module"
**Solution:** Ensure `root` is set to `./admin` in Vercel settings

### ❌ Environment variables show as "undefined"
**Solution:** Check variables are added with `NEXT_PUBLIC_` prefix and are applied to all environments

### ❌ API calls fail (401 errors)
**Solution:** Verify Supabase URL and anon key are correct in Vercel env vars

### ❌ Build takes >10 minutes
**Solution:** Normal for first build. Subsequent builds are faster with caching.

---

## Automatic Deployments from Now On

**Every time you push to GitHub:**
1. Vercel automatically detects changes
2. Runs build in production environment
3. Deploys if build succeeds
4. Shows deployment status on GitHub PR/commit

**No more manual deploys needed!** 🎉

---

## Next Steps After Going Live

1. **Monitor Performance**
   - Vercel Dashboard → Analytics
   - Check Core Web Vitals
   - Monitor error rates

2. **Set Up Error Tracking** (Optional)
   - Sentry
   - LogRocket
   - Rollbar

3. **Enable Vercel Monitoring**
   - Vercel Settings → Analytics
   - Enable Web Analytics

4. **Update DNS**
   - Point your domain to Vercel
   - Set up SSL certificate

5. **Celebrate!** 🎊

---

## Help & Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Troubleshooting**: https://vercel.com/docs/platform/frequently-asked-questions
- **Support**: support@vercel.com

