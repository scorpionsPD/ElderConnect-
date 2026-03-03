#!/bin/bash

# ElderConnect+ Pre-Deployment Verification Script
# Run this before deploying to Vercel

set -e

echo "🚀 ElderConnect+ Pre-Deployment Checklist"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# ============================================================================
# Phase 1: Code Quality
# ============================================================================
echo "📋 Phase 1: Code Quality Checks"
echo "--------------------------------"

cd admin

# Check lint
echo -n "Linting... "
if npm run lint >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    FAILURES=$((FAILURES + 1))
fi

# Check types
echo -n "Type checking... "
if npm run type-check >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    FAILURES=$((FAILURES + 1))
fi

# Test build
echo -n "Building... "
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    FAILURES=$((FAILURES + 1))
fi

cd ..

# ============================================================================
# Phase 2: Environment Configuration
# ============================================================================
echo ""
echo "⚙️  Phase 2: Environment Configuration"
echo "------------------------------------"

# Check .env.local for dev-only settings
echo -n "Checking .env.local... "
if grep -q "NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=true" admin/.env.local; then
    echo -e "${YELLOW}ℹ Development mode enabled (OK for local)${NC}"
else
    echo -e "${GREEN}✓ Development mode disabled${NC}"
fi

# Check .env.production exists
echo -n "Checking .env.production... "
if [ -f "admin/.env.production" ]; then
    echo -e "${GREEN}✓ EXISTS${NC}"
else
    echo -e "${RED}✗ MISSING${NC}"
    FAILURES=$((FAILURES + 1))
fi

# Check required environment variables
echo "Checking required .env.production variables..."
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_API_URL"
    "NEXT_PUBLIC_GETADDRESS_API_KEY"
)

for var in "${required_vars[@]}"; do
    echo -n "  $var... "
    if grep -q "$var=" admin/.env.production; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ MISSING${NC}"
        FAILURES=$((FAILURES + 1))
    fi
done

# ============================================================================
# Phase 3: Git Repository
# ============================================================================
echo ""
echo "📦 Phase 3: Git Repository"
echo "------------------------"

# Check if git is initialized
echo -n "Git initialized... "
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ NOT INITIALIZED${NC}"
    FAILURES=$((FAILURES + 1))
fi

# Check for uncommitted changes
echo -n "All changes committed... "
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}ℹ Uncommitted changes (stash before deploying)${NC}"
fi

# Check remote configured
echo -n "Remote repository configured... "
if git remote | grep -q origin; then
    echo -e "${GREEN}✓${NC}"
    echo "  Remote: $(git remote get-url origin)"
else
    echo -e "${RED}✗ NO REMOTE${NC}"
    FAILURES=$((FAILURES + 1))
fi

# ============================================================================
# Phase 4: Backend Ready
# ============================================================================
echo ""
echo "🔌 Phase 4: Backend Readiness"
echo "---------------------------"

echo "Required Edge Functions to deploy:"
functions=("verify-otp" "signup" "send-otp" "companion-requests" "health-checkins" "get-profile")
for func in "${functions[@]}"; do
    echo -n "  $func... "
    if [ -f "backend/supabase/functions/$func/index.ts" ]; then
        echo -e "${GREEN}✓ EXISTS${NC}"
    else
        echo -e "${RED}✗ MISSING${NC}"
    fi
done

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "=========================================="

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push code to GitHub:"
    echo "   git push origin main"
    echo ""
    echo "2. Go to Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
    echo "3. Import your GitHub repository"
    echo ""
    echo "4. Add these environment variables in Vercel:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - NEXT_PUBLIC_API_URL"
    echo "   - NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK=false"
    echo "   - NEXT_PUBLIC_GETADDRESS_API_KEY"
    echo "   - NEXT_PUBLIC_GETADDRESS_ADMIN_KEY"
    echo "   - NEXT_PUBLIC_ADDRESS_PROVIDER"
    echo ""
    echo "5. Deploy!"
    exit 0
else
    echo -e "${RED}✗ $FAILURES CHECK(S) FAILED${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
    exit 1
fi
