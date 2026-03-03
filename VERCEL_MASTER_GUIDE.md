# Vercel Deployment Master Guide

**Complete setup for deploying ElderConnect+ to Vercel in production.**

---

## 🎯 Deployment Guides (Choose Your Path)

### ⚡ **Fast Track (5 Minutes)**
👉 **Start here if you want quick deployment**

Read: [`VERCEL_QUICKSTART.md`](./VERCEL_QUICKSTART.md)
- Step-by-step 5-minute deployment
- For experienced developers
- All steps in one place

---

### 📚 **Complete Setup (30 Minutes)**
👉 **Start here if you want full understanding**

1. **[VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)** (5 min)
   - Master checklist of all items
   - Quick reference
   - Status tracking

2. **[GITHUB_VERCEL_CI_CD.md](./GITHUB_VERCEL_CI_CD.md)** (15 min)
   - Initialize Git repository
   - Push to GitHub
   - Set up automatic deployments
   - GitHub branch protection

3. **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** (10 min)
   - Detailed step-by-step guide
   - All 8 phases explained
   - Troubleshooting section

---

## 🚀 Quick Start (3 Steps)

### Step 1: Verify Code Ready
```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+
chmod +x scripts/pre-deploy.sh
./scripts/pre-deploy.sh
```
✅ All checks should pass

### Step 2: Push to GitHub
```bash
git add .
git commit -m "chore: ready for Vercel"
git push origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repo
4. Set root directory to `./admin`
5. Add environment variables
6. Click "Deploy"

**That's it!** Your app is live. 🎉

---

## 📋 Pre-Deployment Checklist

Before deploying, verify all these pass:

- [ ] Code quality: `npm run lint` passes
- [ ] Build works: `npm run build` succeeds
- [ ] Git initialized: `git status` works
- [ ] Code on GitHub: Repository exists and code is pushed
- [ ] `.env.production` file exists
- [ ] All required environment variables documented

Run automated check:
```bash
./scripts/pre-deploy.sh
```

---

## 🔑 Environment Variables

### Development (Local)
Keep in `.env.local`:
```
NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=true
```

### Production (Vercel)
Set in Vercel dashboard:
```
NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=false
```

**All variables needed:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK`
- `NEXT_PUBLIC_NOMINATIM_EMAIL`
- `NEXT_PUBLIC_GETADDRESS_API_KEY`
- `NEXT_PUBLIC_GETADDRESS_ADMIN_KEY`
- `NEXT_PUBLIC_ADDRESS_PROVIDER`

---

## 📁 Project Structure for Vercel

```
ElderConnect+/
├── admin/                      ← Next.js app (set as root in Vercel)
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── .env.local             ← Development (IGNORED)
│
├── backend/                    ← Supabase functions (deployed separately)
├── mobile/                     ← Flutter app
├── vercel.json                 ← Vercel config
├── VERCEL_QUICKSTART.md        ← Fast deployment guide
├── VERCEL_DEPLOYMENT.md        ← Complete guide
├── GITHUB_VERCEL_CI_CD.md      ← GitHub integration
├── VERCEL_DEPLOYMENT_CHECKLIST.md
└── .gitignore                  ← Excludes .env files
```

**Key point:** Set Vercel root directory to `./admin`

---

## ✅ Success Criteria

Your deployment is successful when:

✅ **Build succeeds**
- Vercel dashboard shows "Ready"
- No build errors in logs

✅ **App runs**
- Deployment URL works
- No white screen or errors

✅ **Login works**
- Can enter email
- Receives OTP (in dev mode or real)
- Can log in with valid credentials

✅ **API calls work**
- No 401 errors
- Companion requests can be created
- Health check-ins can be submitted

✅ **Data persists**
- Refresh page - data still there
- No console errors

---

## 🔄 CI/CD Pipeline

```
You push to GitHub
    ↓
GitHub webhook triggers Vercel
    ↓
Vercel runs: npm install
Vercel runs: npm run build
    ↓
Build succeeds → Deployment to CDN
Build fails → Notifies on GitHub PR
    ↓
App live at: yourapp.vercel.app
```

**Automatic deployments** from now on!

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Set root dir to `./admin` in Vercel |
| "NEXT_PUBLIC_* undefined" | Add env var to Vercel dashboard |
| 401 errors from API | Check Supabase URL and anon key |
| Build takes >10 min | First build is slow, cache helps |
| Deployment stuck | Check Vercel status: vercel-status.com |

See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for detailed troubleshooting.

---

## 📊 Monitoring After Deployment

### Day 1
- [ ] Test login flow
- [ ] Test API calls
- [ ] Check browser console for errors

### Day 7
- [ ] Monitor Vercel Analytics dashboard
- [ ] Check Core Web Vitals
- [ ] Review any error logs

### Ongoing
- [ ] Monitor deployment trends
- [ ] Update dependencies monthly
- [ ] Review security regularly

---

## 🎓 Learning Resources

- **[Vercel Docs](https://vercel.com/docs)** - Official documentation
- **[Next.js Docs](https://nextjs.org/docs)** - Next.js framework guide
- **[Supabase Docs](https://supabase.com/docs)** - Backend documentation
- **[GitHub Docs](https://docs.github.com)** - Git and GitHub guide

---

## 🚀 Next Actions

### If you're experienced:
→ Go to **[VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)** (5 min)

### If you want detailed steps:
→ Follow these in order:
1. **[VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)**
2. **[GITHUB_VERCEL_CI_CD.md](./GITHUB_VERCEL_CI_CD.md)**
3. **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

### If you need help:
→ See troubleshooting in **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

---

## 📞 Support

- **Can't push to GitHub?** → See GITHUB_VERCEL_CI_CD.md Part 1
- **Vercel build failing?** → See VERCEL_DEPLOYMENT.md Troubleshooting
- **API errors in production?** → Check Supabase functions are deployed
- **Need custom domain?** → See VERCEL_DEPLOYMENT.md Phase 6

---

**Status: Ready to Deploy ✅**

All configuration files are in place. Choose your guide above and get started!

