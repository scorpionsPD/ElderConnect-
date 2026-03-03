# Setup Guide

Complete step-by-step guide to set up ElderConnect+ for development.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Mobile App Setup](#mobile-app-setup)
3. [Backend Setup](#backend-setup)
4. [Admin Dashboard Setup](#admin-dashboard-setup)
5. [IDE Configuration](#ide-configuration)
6. [Running the Project](#running-the-project)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **macOS, Linux, or Windows** with admin access
- **4GB RAM minimum** (8GB recommended)
- **20GB free disk space**

### Required Software

#### For All Platforms
- **Git**: https://git-scm.com
- **Node.js 18+**: https://nodejs.org
- **VSCode**: https://code.visualstudio.com (recommended)

#### For Mobile Development
- **Flutter 3.0+**: https://flutter.dev/docs/get-started/install
- **Android Studio** or **Xcode**:
  - macOS: Xcode from App Store
  - Windows/Linux: Android Studio from https://developer.android.com/studio
- **Xcode Command Line Tools** (macOS):
  ```bash
  xcode-select --install
  ```

#### For Backend
- **Supabase CLI**: `npm install -g supabase`
- **Deno** (optional): `curl -fsSL https://deno.land/install.sh | sh`

### Verify Installations
```bash
flutter --version
node --version
npm --version
supabase --version
git --version
```

## Mobile App Setup

### Step 1: Navigate to Mobile Directory
```bash
cd ElderConnect+/mobile
```

### Step 2: Install Dependencies
```bash
flutter pub get
```

### Step 3: Generate Code (Freezed, Riverpod)
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Step 4: Set Up Environment Variables
Create `.env` file in mobile root:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
STRIPE_PUB_KEY=pk_test_...
```

### Step 5: Verify Flutter Setup
```bash
flutter doctor
```

All items should show a checkmark (✓). Fix any issues before proceeding.

### Step 6: Run the App
```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d <device-id>

# Run with verbose output (for debugging)
flutter run -v
```

### For iOS Development
```bash
cd mobile/ios
pod install
cd ..
flutter run
```

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd ElderConnect+/backend
```

### Step 2: Initialize Supabase Project
```bash
supabase init
```

This creates `supabase/config.toml`. Update with your project credentials:
```toml
project_id = "your-project-id"
```

### Step 3: Start Local Supabase
```bash
supabase start
```

Wait for all services to start. You should see:
- API: http://localhost:54321
- Studio: http://localhost:54323
- DB: postgresql://postgres:postgres@localhost:54322/postgres

### Step 4: Run Database Migrations
```bash
supabase db push
```

This applies the initial schema from `supabase/migrations/001_initial_schema.sql`.

### Step 5: Create Admin User (Optional)
```bash
supabase sql < scripts/create_admin.sql
```

### Step 6: Deploy Edge Functions (Optional)
```bash
supabase functions deploy emergency-handler
supabase functions deploy process-donation
supabase functions deploy gdpr-delete-user
```

### Verify Backend Setup
1. Open http://localhost:54323 (Supabase Studio)
2. Navigate to Database > Tables
3. Verify all tables were created
4. Check Realtime subscriptions are enabled

## Admin Dashboard Setup

### Step 1: Navigate to Admin Directory
```bash
cd ElderConnect+/admin
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Variables
Create `.env.local`:
```bash
cp .env.example .env.local
```

Edit with your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUB_KEY=pk_test_...
```

### Step 4: Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in browser.

## IDE Configuration

### VSCode Extensions

#### For Flutter/Dart
1. **Flutter** - flutter.flutter
2. **Dart** - dart-code.dart-code
3. **Awesome Flutter Snippets** - nash.awesome-flutter-snippets

#### For Backend
1. **Deno** - denoland.vscode-deno
2. **TypeScript Vue Plugin** - vue.vscode-typescript-vue-plugin
3. **Supabase** - supabase.supabase-vscode

#### General
1. **Prettier** - esbenp.prettier-vscode
2. **ESLint** - dbaeumer.vscode-eslint
3. **Git Graph** - mhutchie.git-graph
4. **Thunder Client** - rangav.vscode-thunder-client

### VSCode Settings
Create `.vscode/settings.json` in project root:
```json
{
  "dart.enableSdkFormatter": true,
  "dart.lineLength": 100,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[dart]": {
    "editor.defaultFormatter": "dart-code.dart-code"
  },
  "files.exclude": {
    "**/.git": true,
    "**/build": true,
    "**/.dart_tool": true,
    "**/node_modules": true
  }
}
```

### VSCode Launch Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flutter",
      "type": "dart",
      "request": "launch",
      "program": "mobile/lib/main.dart",
      "console": "integratedTerminal",
      "cwd": "mobile"
    },
    {
      "name": "Admin Dashboard",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/admin/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/admin",
      "console": "integratedTerminal"
    }
  ]
}
```

## Running the Project

### Full Stack Development

#### Terminal 1: Backend
```bash
cd backend
supabase start
```

#### Terminal 2: Mobile App
```bash
cd mobile
flutter run
```

#### Terminal 3: Admin Dashboard
```bash
cd admin
npm run dev
```

### Access Points
- **Mobile App**: Running on emulator/device
- **Supabase API**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323
- **Admin Dashboard**: http://localhost:3000

## Testing

### Run Tests
```bash
# Mobile tests
cd mobile
flutter test

# Backend tests
cd backend
npm test

# Admin tests
cd admin
npm test
```

### Run Specific Tests
```bash
# Single test file
flutter test test/src/data/repositories/auth_repository_test.dart

# With filter
flutter test -k "auth"
```

### Generate Coverage
```bash
cd mobile
flutter test --coverage
# View coverage report in coverage/lcov-report/index.html
```

## Troubleshooting

### Flutter Issues

#### "Flutter command not found"
```bash
# Add Flutter to PATH
echo 'export PATH="$PATH:$(pwd)/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
```

#### "Gradle build failed"
```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

#### "Pod install failed" (iOS)
```bash
cd mobile/ios
rm -rf Pods Pod.lock
pod install
cd ..
flutter run
```

### Backend Issues

#### "Port already in use"
```bash
# Kill process on port 54321
lsof -ti:54321 | xargs kill -9
supabase start
```

#### "Database connection failed"
```bash
supabase stop
supabase start --no-backup
supabase db reset
```

#### "Edge function deployment failed"
```bash
# Check logs
supabase functions list
# Re-deploy
supabase functions deploy emergency-handler --no-verify-jwt
```

### Admin Dashboard Issues

#### "Module not found"
```bash
cd admin
rm -rf node_modules .next
npm install
npm run dev
```

#### "Port 3000 in use"
```bash
# Use different port
npm run dev -- -p 3001
```

### Git Issues

#### "Failed to push"
```bash
# Update from upstream
git fetch upstream
git rebase upstream/main
git push origin your-branch
```

#### "Large files error"
```bash
# Install Git LFS
git lfs install
git lfs track "*.mp4" "*.zip"
```

## Environment Setup Checklist

- [ ] Flutter installed and in PATH
- [ ] Xcode/Android Studio installed
- [ ] Node.js 18+ installed
- [ ] Git configured with email and name
- [ ] Supabase CLI installed
- [ ] VSCode with recommended extensions
- [ ] All environment files (.env, .env.local) created
- [ ] `flutter doctor` shows all checks passing
- [ ] `supabase start` completes without errors
- [ ] Mobile app runs on emulator/device
- [ ] Admin dashboard accessible at localhost:3000

## Next Steps

1. Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand project structure
2. Check out [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Review [docs/](docs/) for more detailed documentation
4. Join our community: [GitHub Discussions](https://github.com/elderconnect-plus/app/discussions)

Need help? Open an issue or contact hello@elderconnect.plus
