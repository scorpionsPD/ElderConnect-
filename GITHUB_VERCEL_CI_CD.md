# GitHub & Vercel CI/CD Setup Guide

Complete setup for automatic deployments from GitHub to Vercel.

---

## Part 1: Initialize Git & Push to GitHub (5 minutes)

### Step 1: Initialize Git (if not already done)

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+

# Check if git is already initialized
git status
```

If you see `fatal: not a git repository`, run:
```bash
git init
git add .
git commit -m "Initial commit: ElderConnect+ admin dashboard ready for production"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `ElderConnect-Plus` (or your preference)
3. **Description**: "Open-source elderly care coordination platform"
4. **Visibility**: Public (for open-source) or Private (for private projects)
5. **Do NOT initialize** with README (we have one)
6. Click **"Create repository"**

### Step 3: Add Remote & Push

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+

# Add remote pointing to your new repository
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/ElderConnect-Plus.git

# Rename main branch if needed (if you have 'master')
git branch -M main

# Push all commits to GitHub
git push -u origin main
```

**Verify:** Go to your GitHub repo URL and confirm all files are there.

---

## Part 2: Connect Vercel to GitHub (5 minutes)

### Step 1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Confirm your email

### Step 2: Import Project

1. Go to https://vercel.com/new
2. Select your GitHub repository: `ElderConnect-Plus`
3. Click **"Import"**

### Step 3: Configure Build Settings

Vercel will show a configuration page:

**Project Settings:**
- **Project Name**: `elderconnect-plus` (auto-filled)
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./admin` ← **CHANGE THIS**
- **Build Command**: `npm run build` (default is OK)
- **Install Command**: `npm install` (default is OK)

**Environment Variables:**
Add all required variables (see section below)

Click **"Deploy"**

---

## Part 3: Add Environment Variables (3 minutes)

In Vercel dashboard, go to **Settings** → **Environment Variables**

Add each of these variables **FOR ALL ENVIRONMENTS** (Production, Preview, Development):

```
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

**Important Notes:**
- ✅ Leave "Encrypted" UNCHECKED (needs to be available at build time)
- ✅ Apply to: **Production, Preview, and Development**
- ✅ Save each one

Then go to **Deployments** tab and click **"Redeploy"**

---

## Part 4: Verify Automatic Deployments Work

### Test 1: Make a Small Change

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+

# Make a small change (e.g., edit README.md)
echo "# Deployment test on $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "test: trigger automatic Vercel deployment"
git push origin main
```

### Test 2: Watch Vercel Deploy

1. Go to your Vercel dashboard
2. Go to **Deployments** tab
3. You should see a new deployment starting
4. Wait for it to complete (2-5 minutes)
5. Click deployment to see build logs

**Success indicators:**
- ✅ Build shows "READY"
- ✅ Deployment shows a live URL
- ✅ Clicking the URL shows your app

### Test 3: Verify Preview Deployments

When you create a pull request:

```bash
cd /Users/pradeepdahiya/Documents/ElderConnect+

# Create a feature branch
git checkout -b feature/test-preview

# Make a change
echo "Test feature" >> README.md

# Commit and push
git add README.md
git commit -m "feat: test preview deployment"
git push origin feature/test-preview
```

Then:
1. Go to GitHub
2. Create a **Pull Request** from `feature/test-preview` → `main`
3. Vercel will automatically create a preview deployment
4. You'll see a link in the PR to test the preview

This is great for testing changes before merging to production!

---

## Part 5: GitHub Branch Protection (Optional but Recommended)

Set up rules to require successful Vercel deployment before merging:

1. Go to GitHub repository **Settings** → **Branches**
2. Click **"Add rule"**
3. Branch name pattern: `main`
4. Check: **"Require status checks to pass before merging"**
5. Select: **Vercel** (it will appear after first deployment)
6. Click **"Create"**

**Result:** PRs can't be merged unless Vercel deployment succeeds. Great for preventing broken builds!

---

## CI/CD Workflow Visualization

```
Developer edits code locally
        ↓
Commits to feature branch
        ↓
Pushes to GitHub
        ↓
GitHub webhook → Vercel
        ↓
Vercel builds app (npm install, npm run build)
        ↓
┌─────────────────────────┐
│ Branch: main (production) → Vercel deployment to production URL
│ Branch: feature/* (PR) → Vercel preview deployment with unique URL
└─────────────────────────┘
        ↓
✅ Deployment success → Status shows green on GitHub PR
❌ Deployment failure → Status shows red, PR blocked if branch protection enabled
        ↓
Developer clicks status link → Goes to Vercel build logs to debug
```

---

## Daily Workflow with Automatic Deployments

### Making Changes

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes
# Edit files...

# Commit and push
git add .
git commit -m "feat: description of changes"
git push origin feature/my-feature
```

### Creating Pull Request

1. Go to GitHub repository
2. Click **"New Pull Request"**
3. Base: `main`, Compare: `feature/my-feature`
4. Add description
5. Click **"Create Pull Request"**

Vercel automatically creates a preview:
- Test your changes without affecting production
- Share the preview URL with team members
- Once approved, merge to main
- Vercel automatically deploys to production

### Deploying to Production

Simply merge the PR to `main`:
1. Click **"Squash and merge"** or **"Merge pull request"**
2. Vercel sees the new commit
3. Vercel builds and deploys automatically
4. Production updated in 2-5 minutes

---

## Monitoring Deployments

### From Vercel Dashboard

Go to https://vercel.com/dashboard:
- **Deployments tab**: See all deployments and their status
- **Analytics tab**: Monitor performance, errors, uptime
- **Settings tab**: Manage environment variables, domains, integrations

### From GitHub

Your commits/PRs will show:
- ✅ Green checkmark = Vercel deployment succeeded
- ❌ Red X = Vercel deployment failed

Click the status to jump to Vercel build logs.

---

## Rollback (If Something Goes Wrong)

### Option 1: Revert Commit

```bash
# Find the commit hash that caused issue
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main
```

Vercel automatically deploys the revert.

### Option 2: Use Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Go to **Deployments**
3. Find previous working deployment
4. Click **"Promote to Production"**

App instantly rolls back to that version.

---

## Environment-Specific Deployments

With Vercel and GitHub, you can have:

**Production** (main branch)
- Stable, tested code
- Real users accessing this
- Automatic deployment on merge

**Preview** (feature branches)
- Temporary deployments for testing
- Unique URL per PR
- Auto-deleted when PR closes

**Development** (local)
- Your laptop
- `npm run dev` locally
- Full debug access

---

## Troubleshooting Automatic Deployments

### Deployment not triggering on push

**Check:**
1. Are you on the right branch? (should be `main` for production)
2. Is the remote correctly configured?
   ```bash
   git remote -v  # Should show origin pointing to GitHub
   ```
3. Did you actually push?
   ```bash
   git push origin main  # Explicitly push to main
   ```
4. Check Vercel dashboard - may still be building

### Build fails on Vercel but succeeds locally

**Common causes:**
1. Environment variables missing in Vercel
2. Root directory not set to `./admin`
3. Different Node/npm versions
4. Cache issues

**Solutions:**
1. Verify all environment variables in Vercel dashboard
2. Check root directory is `./admin` in Vercel settings
3. Go to Vercel Settings → Git → Rebuild without cache
4. Check build logs in Vercel for specific error

---

## GitHub + Vercel Tips & Tricks

### Automatic Deployment Preview Links

Every PR gets a unique URL. Share with:
- Designers to verify styling
- QA team to test
- Product managers to review features

### Skip Deployment

If you commit to `main` but don't want to deploy:
```bash
git commit --allow-empty -m "docs: update README [skip ci]"
git push origin main
```

Add `[skip ci]` to commit message to skip deployment.

### Deploy to Staging First

Create a `staging` branch for testing before production:
1. Create `staging` branch from `main`
2. Add separate Vercel project for staging
3. Merge feature PRs to `staging` first
4. Test in staging environment
5. Once verified, merge `staging` → `main` for production

---

## Summary: Your CI/CD Pipeline

```
┌─────────────────────────────────────────────┐
│          GitHub Repository                   │
│  ┌──────────────────────────────────────┐   │
│  │ main branch (production)              │   │
│  │ feature/* branches (PRs)              │   │
│  └──────────────────────────────────────┘   │
└────────────────────┬────────────────────────┘
                     │ GitHub webhook
                     ↓
┌─────────────────────────────────────────────┐
│          Vercel Platform                     │
│  ┌──────────────────────────────────────┐   │
│  │ npm install                          │   │
│  │ npm run build                        │   │
│  │ Deploy to CDN worldwide              │   │
│  └──────────────────────────────────────┘   │
└────────────────────┬────────────────────────┘
                     │ Deployment complete
                     ↓
          ✅ App Live on Internet
```

---

## Next Steps

1. ✅ Initialize Git & push to GitHub (if not done)
2. ✅ Create Vercel account & import project
3. ✅ Add environment variables
4. ✅ Verify automatic deployment works
5. ✅ Optional: Set up branch protection
6. ✅ Optional: Set up staging environment

Then start using the automatic deployment workflow!

---

## Resources

- **Vercel + GitHub Integration**: https://vercel.com/docs/git-integrations/github
- **Vercel Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **GitHub Webhooks**: https://docs.github.com/en/developers/webhooks-and-events/webhooks
- **Best Practices**: https://vercel.com/blog/best-practices

