# Quick Reference Guide

## Project Structure at a Glance

```
ElderConnect+/
├── mobile/                  # Flutter app (Clean Architecture)
│   ├── lib/src/
│   │   ├── core/           # Constants, theme, utilities
│   │   ├── data/           # Models, datasources, repositories
│   │   ├── domain/         # Entities, interfaces, usecases
│   │   └── presentation/   # UI, providers, navigation
│   └── pubspec.yaml
│
├── backend/                # Supabase + Edge Functions
│   ├── supabase/
│   │   ├── migrations/     # SQL schema
│   │   └── functions/      # Deno edge functions
│   └── config.toml
│
├── admin/                  # Next.js dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
└── docs/                   # Documentation
    ├── ARCHITECTURE.md
    ├── GDPR_COMPLIANCE.md
    └── [other docs]
```

## Essential Commands

### Mobile Development
```bash
cd mobile

# Setup
flutter pub get
flutter pub run build_runner build

# Development
flutter run                    # Run app
flutter test                   # Run tests
flutter analyze               # Code analysis
dart format .                 # Format code

# Build
flutter build apk            # Android release
flutter build ios            # iOS release
```

### Backend Development
```bash
cd backend

# Setup
supabase init
supabase start               # Start local instance
supabase db push             # Apply migrations

# Management
supabase stop                # Stop local instance
supabase db reset            # Reset database
supabase functions deploy    # Deploy edge functions
```

### Admin Dashboard
```bash
cd admin

# Setup
npm install

# Development
npm run dev                  # Development server
npm test                     # Run tests
npm run build               # Production build
npm run build:analyze       # Bundle analysis
```

## Database Quick Access

### Local Database
```bash
# Connect to local PostgreSQL
psql postgresql://postgres:postgres@localhost:54322/postgres

# Common queries
\dt              # List all tables
\d users         # Describe users table
SELECT * FROM users LIMIT 10;
SELECT * FROM health_checkins WHERE user_id = '...';
```

### Supabase Studio
- **URL**: http://localhost:54323
- **Username**: admin@example.com
- **Password**: password

## Architecture Layers Quick Reference

```
┌──────────────────────────────────────────────────┐
│ PRESENTATION (UI, Widgets, Navigation)           │
│ - Riverpod providers                             │
│ - GoRouter routes                                │
│ - UI screens and widgets                         │
└──────────────┬───────────────────────────────────┘
               │ depends on
┌──────────────▼───────────────────────────────────┐
│ DOMAIN (Business Logic, Interfaces)              │
│ - Entities (UserEntity, CompanionRequestEntity)  │
│ - Repository interfaces                          │
│ - Usecases                                       │
└──────────────┬───────────────────────────────────┘
               │ depends on
┌──────────────▼───────────────────────────────────┐
│ DATA (Implementation, API, Database)             │
│ - Models (UserModel, CompanionRequestModel)      │
│ - Datasources (SupabaseAuthService)              │
│ - Repository implementations                     │
└──────────────┬───────────────────────────────────┘
               │ depends on
┌──────────────▼───────────────────────────────────┐
│ CORE (No Dependencies)                           │
│ - Constants                                      │
│ - Utilities                                      │
│ - Themes                                         │
│ - Failures/Errors                                │
└──────────────────────────────────────────────────┘
```

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile | Flutter | Cross-platform app |
| State | Riverpod | Predictable state management |
| Navigation | GoRouter | Type-safe routing |
| Backend | Supabase | BaaS platform |
| Database | PostgreSQL | Relational data |
| Authentication | Supabase Auth | Email/OAuth |
| Real-time | Supabase Realtime | Live subscriptions |
| Payments | Stripe | Donation processing |
| Error Handling | Dartz | Functional programming |
| Testing | Mocktail | Mocking framework |

## Common Patterns

### Using a Repository
```dart
// Get from provider
final authRepository = ref.watch(authRepositoryProvider);

// Call method
final result = await authRepository.loginUser(
  email: email,
  password: password,
);

// Handle Either
result.fold(
  (failure) => showError(failure.message),
  (user) => navigateToHome(),
);
```

### Creating a Provider
```dart
final userProvider = FutureProvider<UserEntity>((ref) async {
  final repository = ref.watch(authRepositoryProvider);
  final result = await repository.getCurrentUser();
  return result.fold((l) => throw l, (r) => r);
});
```

### Real-time Updates
```dart
final messagesStreamProvider = StreamProvider<List<MessageEntity>>((ref) {
  final repository = ref.watch(messagingRepositoryProvider);
  return repository.watchMessages(userId);
});
```

## Debugging Tips

### Flutter Debugging
```bash
# Verbose logging
flutter run -v

# DevTools
flutter pub global run devtools

# Attach debugger
flutter attach
```

### Database Debugging
```bash
# View recent audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;

# Check user permissions
SELECT * FROM users WHERE email = 'test@example.com';

# Monitor real-time subscriptions
SELECT * FROM pg_stat_subscription;
```

### Network Debugging
- Use Thunder Client extension in VS Code
- Enable network request logging in code
- Check Supabase API logs in dashboard

## Important Passwords & Keys

| Service | Location | How to Set |
|---------|----------|-----------|
| Supabase Anon Key | `.env` | `supabase status` |
| Supabase Service Key | Backend secrets | Supabase dashboard |
| Stripe Public Key | `.env` | Stripe dashboard |
| Stripe Secret Key | Backend secrets | Stripe dashboard |
| JWT Secret | Backend config | Generate random string |

## Testing Checklist

- [ ] Unit tests for repositories
- [ ] Unit tests for models
- [ ] Widget tests for screens
- [ ] Integration tests for critical flows
- [ ] API endpoint tests
- [ ] Database query tests
- [ ] Error handling tests
- [ ] Accessibility tests

## Accessibility Checklist

- [ ] Large font support (20pt+)
- [ ] High contrast mode
- [ ] Voice assistance ready
- [ ] Touch targets > 48x48 dp
- [ ] No colors-only information
- [ ] Semantic labels on all buttons
- [ ] Screen reader compatible
- [ ] Tested with real devices

## Performance Optimization

### Mobile
- Use const widgets
- Implement pagination
- Cache images locally
- Lazy load content
- Minimize rebuilds with Riverpod

### Backend
- Add database indexes
- Implement query caching
- Use connection pooling
- Monitor slow queries
- Archive old data

### State Management
- Use FutureProvider for one-time data
- Use StreamProvider for real-time
- Implement selection/family providers
- Cache frequently accessed data

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Stripe webhook configured
- [ ] Email service set up
- [ ] Push notifications configured
- [ ] Analytics enabled
- [ ] Error tracking enabled
- [ ] Backups configured
- [ ] Security scans passed

## Support & Resources

- **Docs**: See `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: hello@elderconnect.plus
- **Community**: Discord (coming soon)

## Contributing Quick Start

1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run tests: `flutter test` / `npm test`
5. Commit with message: `feat(auth): add 2FA support`
6. Push and create Pull Request
7. Address review comments
8. Merge after approval

## License

**AGPL-3.0** - See LICENSE file

---

**Last Updated**: 2024-02-23
**Next Review**: 2024-12-31
