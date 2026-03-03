# 🏗️ Dashboard Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ElderConnect+ Dashboards                 │
└─────────────────────────────────────────────────────────────┘

                          ┌──────────────┐
                          │   Next.js    │
                          │   Router     │
                          └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼────┐  ┌────▼───┐  ┌───▼──────────┐
            │   Elder    │  │  Admin │  │  Volunteer  │
            │ Dashboard  │  │ Dash   │  │   Dashboard │
            └───────┬────┘  └────┬───┘  └───┬─────────┘
                    │            │           │
            ┌───────▼────────────┼───────────▼─────┐
            │                                        │
        ┌───▼─────────────────────────────────────────┐
        │         Layout + Navigation                 │
        │      (Tabs, Card, Badge, Button)           │
        └───┬─────────────────────────────────────────┘
            │
        ┌───▼────────────────────────────┐
        │      Dummy Data Service        │
        │   (utils/dummyData.ts)         │
        └───┬────────────────────────────┘
            │
            ├─── DUMMY_ELDER_PROFILE
            ├─── DUMMY_VOLUNTEER_PROFILE
            ├─── DUMMY_COMPANION_REQUESTS
            ├─── DUMMY_HEALTH_CHECKINS
            ├─── DUMMY_FAMILY_MEMBERS
            ├─── DUMMY_COMMUNITY_EVENTS
            ├─── DUMMY_MESSAGES
            ├─── DUMMY_NOTIFICATIONS
            └─── DUMMY_*_STATS
```

---

## Component Hierarchy

### Elder Dashboard
```
ElderDashboard
│
├── Header
│   ├── Profile Image
│   ├── Name & Location
│   ├── Badge (Verification)
│   └── Notification Bell
│
├── Quick Stats (Grid)
│   ├── Companion Visits Card
│   ├── Upcoming Visits Card
│   ├── Health Score Card
│   └── Family Connections Card
│
├── Tabs Component
│   ├── Overview Tab
│   │   ├── Upcoming Appointments
│   │   └── Quick Actions
│   │
│   ├── Companions Tab
│   │   └── Companion Requests List
│   │
│   ├── Health & Wellness Tab
│   │   ├── Health Conditions
│   │   ├── Medications
│   │   └── Recent Check-ins
│   │
│   ├── Family Tab
│   │   └── Family Members List
│   │
│   └── Settings Tab
│       ├── Profile Settings
│       ├── Accessibility
│       └── Preferences
```

### Volunteer Dashboard
```
VolunteerDashboard
│
├── Header
│   ├── Profile Image
│   ├── Name & Location
│   ├── Badges (Rating, DBS, Hours)
│   └── Impact Counter
│
├── Quick Stats (Grid)
│   ├── Hours This Week Card
│   ├── Upcoming Matches Card
│   ├── Completed Matches Card
│   └── Rating Card
│
├── Tabs Component
│   ├── Overview Tab
│   │   ├── Welcome Message
│   │   ├── Upcoming Matches
│   │   └── Quick Actions
│   │
│   ├── Companion Requests Tab
│   │   ├── Requests Filter
│   │   └── Request Cards
│   │
│   ├── Calendar Tab
│   │   └── Weekly Availability Grid
│   │
│   ├── Impact Tab
│   │   ├── Impact Stats Cards
│   │   ├── Timeline Chart
│   │   └── Badges
│   │
│   ├── Profile Tab
│   │   ├── Basic Info
│   │   ├── Skills Display
│   │   └── Verification Status
│   │
│   └── Settings Tab
│       ├── Notifications
│       ├── Privacy
│       └── Account
```

---

## Data Flow Diagram

### Current State (Dummy Data)
```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Component                       │
│                  (useState, useEffect)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ setActiveTab()
                 ├─ setShowNotifications()
                 └─ handleActions()
                 │
    ┌────────────▼──────────────┐
    │  Render Tab Content       │
    └────────────┬──────────────┘
                 │
        ┌────────▼─────────┐
        │  Import from:    │
        │  dummyData.ts    │
        └────────┬─────────┘
                 │
        ┌────────▼───────────────────┐
        │  DUMMY_ELDER_PROFILE       │
        │  DUMMY_COMPANION_REQUESTS  │
        │  DUMMY_HEALTH_CHECKINS     │
        │  etc...                    │
        └────────┬───────────────────┘
                 │
        ┌────────▼─────────────────┐
        │  Component Props          │
        │  & Local State            │
        └────────┬─────────────────┘
                 │
                 ▼
        Render UI with Dummy Data
```

### Future State (With Backend)
```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Component                       │
│                  (useState, useEffect)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ useEffect(() => fetchData())
                 ├─ setActiveTab()
                 └─ handleFormSubmit()
                 │
    ┌────────────▼──────────────────┐
    │  API Service Layer            │
    │  (Supabase Client)            │
    └────────────┬──────────────────┘
                 │
        ┌────────▼────────────────────────┐
        │  Supabase Functions             │
        │  - supabase.from()              │
        │  - .select() / .insert()        │
        │  - .subscribe() (realtime)      │
        └────────┬────────────────────────┘
                 │
    ┌────────────▼─────────────────┐
    │  PostgreSQL Database         │
    │  (Supabase Backend)          │
    └────────────┬─────────────────┘
                 │
        ┌────────▼──────────────────┐
        │  Tables                   │
        │  - users                  │
        │  - companion_requests     │
        │  - health_checkins        │
        │  - family_members         │
        │  - messages               │
        │  - notifications          │
        └───────────────────────────┘
```

---

## Component Dependencies

### Elder Dashboard Dependencies
```
elder-dashboard.tsx
│
├─ Layout (existing)
├─ Tabs (new)
├─ Card (new)
├─ Badge (existing)
├─ Button (existing)
│
└─ Icons from lucide-react:
   ├─ Heart, Users, Calendar, Clock
   ├─ MapPin, Star, Settings, Bell
   ├─ MessageSquare, AlertCircle, Plus
   ├─ Pill, TrendingUp, Phone, Mail
   ├─ Edit2, LogOut
   └─ ... (20+ total)

└─ Data from dummyData.ts:
   ├─ DUMMY_ELDER_PROFILE
   ├─ DUMMY_COMPANION_REQUESTS
   ├─ DUMMY_HEALTH_CHECKINS
   ├─ DUMMY_FAMILY_MEMBERS
   └─ DUMMY_NOTIFICATIONS
```

### Volunteer Dashboard Dependencies
```
volunteer-dashboard.tsx
│
├─ Layout (existing)
├─ Tabs (new)
├─ Card (new)
├─ Badge (existing)
├─ Button (existing)
│
└─ Icons from lucide-react:
   ├─ Calendar, Clock, MapPin, Star
   ├─ Zap, Users, TrendingUp, Award
   ├─ Settings, Bell, MessageSquare, CheckCircle
   ├─ Eye, BarChart3, Shield, Heart
   ├─ Edit2
   └─ ... (20+ total)

└─ Data from dummyData.ts:
   ├─ DUMMY_VOLUNTEER_PROFILE
   ├─ DUMMY_COMPANION_REQUESTS
   ├─ DUMMY_MESSAGES
   └─ DUMMY_VOLUNTEER_STATS
```

---

## State Management

### Elder Dashboard State
```typescript
{
  activeTab: 'overview' | 'companions' | 'health' | 'family' | 'settings'
  showNotifications: boolean
}
```

### Volunteer Dashboard State
```typescript
{
  activeTab: 'overview' | 'matches' | 'calendar' | 'impact' | 'profile' | 'settings'
}
```

---

## API Integration Points (Ready for Backend)

### To Connect:
```typescript
// Replace dummy data with real queries
const [elderData, setElderData] = useState(null)

useEffect(() => {
  // Fetch real data from backend
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  setElderData(data)
}, [])

// Connect form submissions
const handleSaveProfile = async (formData) => {
  const { error } = await supabase
    .from('users')
    .update(formData)
    .eq('id', userId)
}

// Set up real-time subscriptions
supabase
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'notifications' },
    (payload) => {
      // Handle new notifications
    }
  )
  .subscribe()
```

---

## Environment Configuration

### Required Supabase Tables
```sql
-- Already exist (from initial schema)
users
├─ id (UUID)
├─ email
├─ full_name
├─ role ('elder' | 'volunteer')
├─ verification_status
└─ created_at

companion_requests
├─ id
├─ elder_id
├─ service_type
├─ date
├─ time
├─ status
└─ created_at

health_checkins
├─ id
├─ user_id
├─ mood
├─ energy (1-10)
├─ sleep (1-10)
├─ created_at
└─ ...

family_members
├─ id
├─ user_id
├─ name
├─ relation
└─ permission_level

notifications
├─ id
├─ user_id
├─ type
├─ message
└─ created_at
```

---

## Styling System

### Tailwind CSS Breakdown
```
Colors Used:
├─ Primary: blue-500, blue-600, blue-50, blue-100, blue-200
├─ Success: green-500, green-600, green-50, green-200
├─ Warning: yellow-500, yellow-600, yellow-50, yellow-200
├─ Danger: red-500, red-600, red-50, red-200
├─ Info: purple-500, purple-600, purple-50, purple-200
└─ Neutral: gray-50 → gray-900

Responsive Breakpoints:
├─ Mobile: default (no prefix)
├─ Tablet: md: (768px)
└─ Desktop: lg: (1024px), xl: (1280px)

Components:
├─ Cards: rounded-lg, shadow-sm/md, border
├─ Buttons: px-3 py-2, rounded-lg, transition
├─ Forms: w-full, px-3, py-2, border, rounded-lg
└─ Typography: text-sm → text-3xl, font-medium → font-bold
```

---

## Performance Considerations

### Current (Dummy Data)
- ✅ Fast rendering (no API calls)
- ✅ Instant tab switching
- ✅ No network latency
- ⚠️ Static data only

### Future (Backend Connected)
- ⚠️ Add loading states
- ⚠️ Implement pagination for lists
- ⚠️ Cache frequently accessed data
- ✅ Real-time updates via subscriptions
- ✅ Optimistic UI updates
- ✅ Error handling & retry logic

---

## Security Considerations

### Current
- No authentication check (demo mode)
- Public dummy data

### When Backend Connected
- ✅ Add auth guards (middleware)
- ✅ Verify user permissions
- ✅ Sanitize form inputs
- ✅ Use Supabase RLS policies
- ✅ Protect API routes
- ✅ Validate data server-side

---

## Testing Strategy

### Unit Tests
```
- Tabs component renders correctly
- Card component with/without header
- Badge variants display properly
```

### Integration Tests
```
- Dummy data loads on mount
- Tab switching updates UI
- Form inputs accept data
```

### E2E Tests
```
- Navigate elder dashboard
- Switch all tabs without errors
- Click buttons and see interactions
- Same for volunteer dashboard
```

---

**Last Updated**: February 25, 2026  
**Status**: ✅ Architecture Ready for Backend Integration
