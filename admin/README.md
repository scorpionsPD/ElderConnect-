# ElderConnect+ Admin Dashboard

A comprehensive admin dashboard for managing the ElderConnect+ platform, built with Next.js, TypeScript, and Supabase.

## Features

- 🔐 **Secure Authentication** - Admin login with Supabase Auth
- 📊 **Dashboard Overview** - Real-time statistics and analytics
- 👥 **User Management** - Monitor and manage all platform users
- ✅ **Verification System** - Review and approve user verifications
- 💰 **Donation Tracking** - Track and manage all donations
- 🎨 **Modern UI** - Clean and responsive design with Tailwind CSS
- 📈 **Data Visualization** - Charts and graphs using Recharts

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional branding variables (single-place icon control):
- `NEXT_PUBLIC_BRAND_ICON_URL` (can be a Supabase Storage public URL)
- `NEXT_PUBLIC_BRAND_ICON_ALT` (image alt text)
- `NEXT_PUBLIC_BRAND_ICON_VERSION` (cache-buster, e.g. `3`)

Example:
```bash
NEXT_PUBLIC_BRAND_ICON_URL=https://<project-ref>.supabase.co/storage/v1/object/public/branding/logo.png
NEXT_PUBLIC_BRAND_ICON_ALT=ElderConnect+ logo
NEXT_PUBLIC_BRAND_ICON_VERSION=3
```

### Database Setup

Create the following tables in your Supabase database:

1. **users** - Store user information
2. **verification_requests** - Track verification requests
3. **donations** - Store donation records
4. **admin_users** - Store admin user information

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
admin/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── pages/          # Next.js pages
│   │   ├── api/        # API routes
│   │   ├── dashboard.tsx
│   │   ├── users.tsx
│   │   ├── verifications.tsx
│   │   ├── donations.tsx
│   │   ├── settings.tsx
│   │   └── login.tsx
│   ├── styles/         # Global styles
│   │   └── globals.css
│   └── utils/          # Utility functions
│       ├── supabase.ts
│       ├── api.ts
│       └── formatters.ts
├── middleware.ts       # Auth middleware
└── package.json
```

## Features Overview

### Dashboard
- Real-time user statistics
- Donation analytics
- User growth charts
- Recent activity feed

### User Management
- View all users
- Filter by role and status
- Update verification status
- Search functionality

### Verifications
- Review verification requests
- Approve or reject with reasons
- View submitted documents
- Track review history

### Donations
- Monitor all donations
- Filter by status and date
- Export donation reports
- Track total revenue

### Settings
- General dashboard settings
- Notification preferences
- Security settings
- Database management

## Authentication

The dashboard uses Supabase Auth for secure authentication. Only users with admin privileges can access the dashboard.

## API Routes

- `/api/users` - User management endpoints
- `/api/verifications` - Verification management
- `/api/donations` - Donation tracking
- `/api/dashboard/stats` - Dashboard statistics
- `/api/auth/logout` - Logout endpoint

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests for any enhancements.

## License

This project is private and confidential.

## Support

For support or questions, contact the development team.
