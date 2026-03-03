# ElderConnect+

<div align="center">
  <p><strong>Community-Driven Elderly Support Mobile App</strong></p>
  <p>Completely Free • No Ads • Donation-Supported • GDPR Compliant • Built for Scotland</p>
  
  [![License](https://img.shields.io/badge/license-AGPL%203.0-green)](LICENSE)
  [![Flutter](https://img.shields.io/badge/Flutter-3.0+-blue)](https://flutter.dev)
  [![Supabase](https://img.shields.io/badge/Backend-Supabase-brightgreen)](https://supabase.com)
  [![Contribution Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)](#contributing)
</div>

---

## Overview

**ElderConnect+** is a mission-driven, open-source mobile application designed to support elderly individuals in Scotland through volunteer companionship, professional services, and community connection. Built entirely on donations and volunteer contributions with zero commission or advertisement.

### Mission
To combat elderly loneliness, provide accessible support services, and foster intergenerational community connections through a secure, privacy-first digital platform.

### Core Values
- 🤝 **Community-First**: Built by and for the community
- 🔒 **Privacy-First**: GDPR compliant, minimal data storage
- 💰 **No Profit Motive**: Completely free, donation-supported
- ♿ **Accessibility**: Designed for elderly users with large fonts, high contrast, voice assistance
- 🌍 **Open Source**: Transparent development, community contributions

---

## Features

### For Elders
- 🆘 **Emergency SOS Button** - Immediate alert to nearby volunteers and support network
- 🤝 **Companion Requests** - Request volunteers for shopping, visits, errands, social activities
- 💬 **In-App Messaging** - Secure chat with volunteers and family
- 📞 **Video Calling** - One-on-one secure video calls
- 🏥 **Daily Health Check-In** - Track mood, energy, sleep, medication, meals
- 💊 **Medication Reminders** - Set and receive medication reminders
- 👥 **Family Dashboard** - Share health data with trusted family members
- 🎉 **Community Events** - Discover local events, activities, and support groups

### For Volunteers
- 🎯 **Companion Matching** - Browse companion requests from elders
- ⭐ **Verification Badge** - Background-verified volunteers get displayed badge
- 📋 **Request Management** - Accept, track, and complete tasks
- 💬 **Direct Chat** - Communicate securely with elders and professionals
- 📊 **Impact Tracking** - See your contribution to the community
- 📱 **Flexible Scheduling** - Choose your own availability

### For Professionals
- 🏥 **Service Booking** - Accept healthcare, legal, financial, tech support requests
- 📝 **Qualification Verification** - Display verified credentials
- 💼 **Professional Dashboard** - Manage bookings and client interactions
- 🎓 **Specialization Tags** - Showcase expertise areas

### For Admins
- 📊 **User Management** - Review, verify, and manage all users
- ✅ **Verification System** - DBS checks, reference verification, ID validation
- 📈 **Analytics Dashboard** - Track app metrics, user growth, impact
- 💬 **Content Moderation** - Review messages and flag inappropriate content
- 💰 **Donation Tracking** - Monitor fundraising and impact metrics
- 🚨 **Emergency Response** - Manage emergency alerts and volunteer dispatching

---

## Tech Stack

### Frontend (Mobile)
- **Framework**: Flutter 3.0+
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **Architecture**: Clean Architecture (Entity → Usecase → Repository → Datasource)
- **Accessibility**: Flutter TTS, ScreenUtil for responsive design
- **Testing**: Mocktail, Integration tests

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Email + Password, OAuth)
- **Real-time**: Supabase Realtime subscriptions
- **APIs**: RESTful + GraphQL ready
- **Edge Functions**: Deno-based Supabase Functions
- **Storage**: Supabase Storage for images/documents

### Admin Dashboard (Web)
- **Framework**: Next.js / React
- **Styling**: Tailwind CSS
- **Charts**: Recharts for analytics
- **Tables**: TanStack Table

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Hosting**: 
  - Mobile: App Store, Google Play
  - Backend: Supabase (Auto-scaling)
  - Admin: Vercel / AWS

---

## Project Structure

```
ElderConnect+/
├── mobile/                          # Flutter mobile app
│   ├── lib/
│   │   ├── src/
│   │   │   ├── core/               # Core layer (constants, utils, theme, extensions)
│   │   │   ├── data/               # Data layer (models, datasources, repositories)
│   │   │   ├── domain/             # Domain layer (entities, repositories, usecases)
│   │   │   └── presentation/       # Presentation layer (pages, widgets, providers)
│   │   └── main.dart
│   ├── test/                        # Unit and widget tests
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
│
├── backend/
│   ├── supabase/
│   │   ├── migrations/              # Database migrations
│   │   │   └── 001_initial_schema.sql
│   │   ├── functions/               # Edge functions
│   │   │   ├── emergency-handler/
│   │   │   ├── process-donation/
│   │   │   └── gdpr-delete-user/
│   │   └── config.toml
│   ├── src/
│   │   ├── models/                  # TypeScript types
│   │   ├── routes/                  # API routes (if using custom server)
│   │   └── middleware/              # Authentication, logging, validation
│   └── deno.json
│
├── admin/                           # Admin dashboard (Next.js)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── package.json
│   └── next.config.js
│
├── docs/                            # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── GDPR_COMPLIANCE.md
│
├── .github/
│   └── workflows/                   # GitHub Actions CI/CD
│
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── .gitignore
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites
- Flutter 3.0+ SDK
- Node.js 18+
- PostgreSQL 14+ (for local development)
- Supabase CLI
- Git

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/elderconnect-plus/app.git
cd ElderConnect+
```

#### 2. Mobile Setup
```bash
cd mobile
flutter pub get
flutter run
```

#### 3. Backend Setup
```bash
cd backend
supabase start  # Starts local Supabase instance
supabase db push  # Runs migrations
```

#### 4. Admin Dashboard Setup
```bash
cd admin
npm install
npm run dev
```

For detailed setup instructions, see [SETUP.md](SETUP.md)

---

## Environment Configuration

### Mobile App (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
STRIPE_PUB_KEY=pk_test_...
```

### Backend
See `backend/.env.example` for all available configuration options.

---

## Database Schema Highlights

### Core Tables
- **users** - User profiles with roles (Elder, Volunteer, Professional, Family, Admin)
- **background_verifications** - DBS checks, reference checks, ID verification
- **companion_requests** - Volunteer request matching
- **task_assistance_bookings** - Professional service bookings
- **health_checkins** - Daily wellness logs
- **emergency_alerts** - Emergency trigger and response tracking
- **messages** - Encrypted in-app messaging
- **video_call_sessions** - Video call scheduling and recording
- **community_events** - Event organization and attendance
- **donations** - Donation tracking and impact
- **audit_logs** - GDPR audit trail

### Security Features
- Row Level Security (RLS) policies
- Encrypted sensitive data
- Soft delete for GDPR compliance
- Full audit logging
- GDPR deletion and export requests

See [backend/supabase/migrations/001_initial_schema.sql](backend/supabase/migrations/001_initial_schema.sql) for full schema.

---

## Architecture Principles

### Clean Architecture
The app follows clean architecture principles with clear separation of concerns:

**Core Layer**
- Constants, utilities, theme, error handling
- No external dependencies

**Data Layer**
- Models (JSON serializable)
- Datasources (Remote/Local)
- Repositories (implement domain repositories)
- Uses Supabase service for API calls

**Domain Layer**
- Entities (business logic models)
- Repository interfaces (abstract)
- Usecases (future: business logic)

**Presentation Layer**
- Riverpod providers (state management)
- Pages and widgets (UI)
- GoRouter (navigation)

### State Management
- **Riverpod** for predictable, testable state management
- **FutureProvider** for async data
- **StreamProvider** for real-time updates
- **StateNotifierProvider** for complex state

---

## GDPR Compliance

ElderConnect+ is designed with privacy and GDPR compliance as core features:

### Key Features
- ✅ **Data Minimization** - Only collect necessary data
- ✅ **User Consent** - Explicit opt-in for data processing
- ✅ **Right to Access** - Users can export their data
- ✅ **Right to Deletion** - Users can request account deletion
- ✅ **Audit Logs** - Complete audit trail of all data access
- ✅ **Encryption** - Sensitive data encrypted at rest and in transit
- ✅ **Data Retention** - Auto-delete inactive accounts after 1 year
- ✅ **Privacy Policy** - Transparent, easy-to-understand policy

See [docs/GDPR_COMPLIANCE.md](docs/GDPR_COMPLIANCE.md) for detailed compliance information.

---

## Accessibility Features

Designed specifically for elderly users:

- **Large Fonts** - Toggle 20pt+ fonts with one setting
- **High Contrast Mode** - Pure black on white for visibility
- **Voice Assistance** - Text-to-speech for all content
- **Simplified Navigation** - Large touch targets, minimal gestures
- **Readable Typography** - Clear, sans-serif fonts
- **Color Blind Friendly** - WCAG AAA compliant colors

---

## Security Considerations

### Authentication
- Supabase Auth with secure password requirements
- Optional 2-factor authentication
- Session management with automatic logout
- Refresh token rotation

### Data Protection
- HTTPS/TLS for all communications
- Database encryption at rest
- Encrypted sensitive fields
- Row-level security policies

### Verification
- Background verification for volunteers
- Professional qualification verification
- ID verification for user accounts
- Admin-verified badges

---

## Contributing

We welcome contributions from developers, designers, community members, and organizations! 

### Types of Contributions
- 🐛 **Bug Reports** - Found an issue? Let us know
- ✨ **Features** - Have an idea? Create a proposal
- 🎨 **Design** - Help improve UI/UX
- 📝 **Documentation** - Improve our docs
- 🧪 **Tests** - Add test coverage
- 🌍 **Translations** - Help localize the app
- 💡 **Ideas** - Discuss in Issues

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## Roadmap

### Phase 1: MVP (Current)
- ✅ Basic user registration and authentication
- ✅ Companion request system
- ✅ In-app messaging
- ⏳ Health check-ins
- ⏳ Emergency alerts

### Phase 2: Enhanced Features (Q2 2024)
- Video calling integration
- Community events board
- Admin dashboard
- Professional service booking
- Background verification system

### Phase 3: Scale & Internationalization (Q3-Q4 2024)
- Mobile app release (iOS/Android)
- Web portal for family members
- Multi-language support
- Integration with NHS systems
- AI-powered volunteer matching

### Phase 4: AI & Analytics (2025+)
- Predictive health analytics
- AI-powered companion matching
- Sentiment analysis for mental health tracking
- Advanced admin dashboards

---

## Donation & Support

ElderConnect+ is **100% free** and **completely donation-supported**. No subscription, no ads, no commission.

### How Donations Help
- 🖥️ **Infrastructure Costs** - Server, database, hosting
- 👥 **Team Expansion** - Hire support staff, community managers
- 🎓 **Volunteer Training** - Onboarding, safety training programs
- 🌍 **Community Outreach** - Reach underserved elderly populations
- 🧪 **Research & Development** - Improve features based on user feedback
- ♿ **Accessibility** - Continuous improvements for accessibility

### Donate
[Donate via Stripe](https://donate.elderconnect.plus) | [Bank Transfer](#) | [Standing Order](#)

All donations are tax-exempt through our partnership with [Charity Partner].

---

## License

ElderConnect+ is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**

### Why AGPL?
We chose AGPL to ensure:
- ✅ Code remains open source
- ✅ Improvements benefit the community
- ✅ Cannot be commercialized without contribution
- ✅ Protects elderly users' interests

If you need a different license for your use case, please contact us.

See [LICENSE](LICENSE) for full terms.

---

## Support & Community

### Getting Help
- 📖 **Docs**: [docs/](docs/)
- 💬 **GitHub Issues**: [Issues](https://github.com/elderconnect-plus/app/issues)
- 🗣️ **Discussions**: [GitHub Discussions](https://github.com/elderconnect-plus/app/discussions)
- 📧 **Email**: hello@elderconnect.plus
- 🐦 **Twitter**: [@ElderConnectPlus](https://twitter.com/ElderConnectPlus)

### Code of Conduct
We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Team & Contributors

### Core Team
- [Your Name] - Lead Developer
- [Your Name] - Designer
- [Your Name] - Community Manager

### Contributors
Thanks to all our wonderful contributors! [See full list](CONTRIBUTORS.md)

---

## FAQ

**Q: Is ElderConnect+ really free?**
A: Yes! There are no subscription fees, ads, or commissions. We're entirely donation-supported.

**Q: How is my data protected?**
A: We follow strict GDPR compliance, encrypt sensitive data, and maintain detailed audit logs. You own your data and can request export or deletion anytime.

**Q: Who can volunteer?**
A: Anyone 18+ can volunteer. We conduct background checks for safety.

**Q: Is there a web version?**
A: Yes! Web access is available through family member portals and admin dashboards.

**Q: How do I report a security issue?**
A: Please email security@elderconnect.plus with details.

---

## Acknowledgments

Built with ❤️ for the elderly community of Scotland.

Special thanks to:
- Supabase for backend infrastructure
- Flutter team for the amazing mobile framework
- Our volunteer community
- All donors and supporters

---

<div align="center">
  <p><strong>Making Connection Accessible to Everyone</strong></p>
  <p>ElderConnect+ - Community-Driven, Completely Free</p>
</div>
