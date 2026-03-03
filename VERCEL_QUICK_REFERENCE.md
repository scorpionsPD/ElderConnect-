# Vercel Deployment - Quick Reference Card

**Print this or keep open while deploying**

---

## 📋 Pre-Deployment (Do This First)

```bash
# Verify everything works
cd /Users/pradeepdahiya/Documents/ElderConnect+
./scripts/pre-deploy.sh

# Expected: All checks PASSED
```

---

## 🔑 Environment Variables (Copy-Paste Ready)

### For Vercel Dashboard (Settings → Environment Variables)

```
Variable Name:                           Value:
────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL
https://kydzdwzmuibwfohrdcmu.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHpkd3ptdWlid2ZvaHJkY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxODI0MjQsImV4cCI6MjA4Nzc1ODQyNH0.waR-c67gyOgfRPu_yb-ejy78SSsGc1xaW8PbmvcoNhA

NEXT_PUBLIC_API_URL
https://kydzdwzmuibwfohrdcmu.supabase.co/functions/v1

NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK
false

NEXT_PUBLIC_NOMINATIM_EMAIL
info@scotitech.com

NEXT_PUBLIC_GETADDRESS_API_KEY
O5iC_evP5U6oSVWm8pxXDw50728

NEXT_PUBLIC_GETADDRESS_ADMIN_KEY
Qz59hwkVf0qKnwF7Dxu76g50728

NEXT_PUBLIC_ADDRESS_PROVIDER
getaddress
```

**For each variable:**
- ✅ Leave "Encrypted" UNCHECKED
- ✅ Apply to: Production, Preview, Development
- ✅ Click Save

---

## ⚙️ Vercel Build Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `./admin` ⭐ IMPORTANT |
| **Framework** | Next.js (auto-detected) |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

---

## 🚀 5-Step Deployment

### Step 1: Verify Code
```bash
./scripts/pre-deploy.sh
```
Expected: All checks pass ✅

### Step 2: Push to GitHub
```bash
git add .
git commit -m "chore: ready for Vercel"
git push origin main
```

### Step 3: Import Project
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your repository
4. Click "Import"

### Step 4: Configure
- Set Root Directory to `./admin`
- Add 8 environment variables (see table above)
- Click "Deploy"

### Step 5: Wait & Test
- Wait for build (2-5 minutes)
- Click the preview URL
- Test login (OTP: 1234 in dev)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Deployment shows "Ready" (green)
- [ ] Clicking URL shows your app
- [ ] Login page appears
- [ ] Can log in with test account
- [ ] No 401 errors
- [ ] No console errors
- [ ] Data persists on refresh

---

## 🆘 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Root dir = `./admin` |
| Build fails | Check build logs in Vercel |
| `NEXT_PUBLIC_*` undefined | Add to Vercel env vars |
| 401 API errors | Check Supabase URL correct |
| Slow build | Normal first time (5-10 min) |

---

## 📍 Important URLs

| What | URL |
|------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Your Deployed App | https://yourapp.vercel.app |
| GitHub Repo | https://github.com/YOUR/REPO |
| Supabase Project | https://app.supabase.com |

---

## 🔄 After First Deployment

### Automatic Updates
Every push to GitHub → Automatic Vercel deployment

```bash
# Make change locally
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel automatically:
# 1. Receives push
# 2. Builds app
# 3. Deploys when ready
# ✅ Done!
```

### Create Pull Requests for Testing
```bash
git checkout -b feature/my-feature
# Make changes
git push origin feature/my-feature

# Go to GitHub, create PR
# Vercel creates preview: https://preview-url.vercel.app
# Test there before merging
# Merge to main when ready
# Vercel deploys to production
```

---

## 📊 Production Checklist

Before going live to real users:

- [ ] Test login with real account
- [ ] Test all main features
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Set up custom domain (optional)
- [ ] Enable SSL (automatic)
- [ ] Configure backups

---

## 🆓 Free Tier Limits (Vercel)

- Deployments: Unlimited
- Functions: 1000 invocations/month free
- Storage: Limited to project files
- Bandwidth: 100GB/month free
- Custom domains: 1 free

**Plenty for most projects!**

---

## 📞 Help Links

- **Build failed?** Check logs in Vercel dashboard
- **API not working?** Verify Supabase functions are deployed
- **Need custom domain?** See VERCEL_DEPLOYMENT.md Phase 6
- **More help?** See VERCEL_DEPLOYMENT.md Troubleshooting

---

## 🎯 Next Steps

1. ✅ Run `./scripts/pre-deploy.sh`
2. ✅ Read VERCEL_QUICKSTART.md
3. ✅ Follow 5-step deployment above
4. ✅ Test your live app
5. ✅ Share with team!

---

**Save this page or print it for reference during deployment!**

---

*Generated: March 3, 2026*

