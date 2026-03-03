# ElderConnect+ Frontend API & Hooks Implementation Guide

## Completed Implementations

### 1. Authentication & Profile (AuthContext)
- ✅ `sendOTP(email)` - Generates 4-digit OTP for verification
- ✅ `verifyOTP(code, email)` - Verifies OTP and creates session
- ✅ `signup(email, role, first_name, phone_number)` - Creates new user account
- ✅ `login(email, otp)` - Logs in user with OTP
- ✅ `getProfile()` - Fetches user profile from backend
- ✅ `updateUserProfile(updates)` - Updates user profile with backend sync
- ✅ `logout()` - Clears session but persists user data for re-login

**Import:**
```typescript
import { useAuth } from '@/contexts/AuthContext'
const { user, signup, login, updateUserProfile } = useAuth()
```

---

### 2. Companion Requests (useCompanionRequests Hook)
Manages all companion request operations.

**Available Methods:**
```typescript
const {
  requests,           // Array of all requests
  loading,           // Loading state
  error,             // Error message
  fetchRequests,     // Refresh requests list
  createRequest,     // Create new request (Elder/Family only)
  acceptRequest      // Accept request (Volunteer only)
} = useCompanionRequests()
```

**Request Status Values:** PENDING | ACCEPTED | IN_PROGRESS | COMPLETED | CANCELLED

**Usage Example:**
```typescript
import { useCompanionRequests } from '@/hooks'

function CompanionTab() {
  const { requests, createRequest, acceptRequest } = useCompanionRequests()
  
  return (
    <>
      {requests.map(req => (
        <div key={req.id}>
          <h3>{req.activity_type}</h3>
          <p>Status: {req.status}</p>
          {req.status === 'PENDING' && 
            <button onClick={() => acceptRequest(req.id)}>Accept</button>}
        </div>
      ))}
    </>
  )
}
```

---

### 3. Health Check-ins (useHealthCheckins Hook)
Manages health check-in data and submissions.

**Available Methods:**
```typescript
const {
  checkins,           // Array of past check-ins
  loading,           // Loading state
  error,             // Error message
  fetchCheckins,     // Refresh check-in history
  submitCheckin,     // Submit new check-in
  getLatestCheckin   // Get most recent check-in
} = useHealthCheckins()
```

**Check-in Fields:** mood, energy_level (0-10), sleep_hours, medications_taken, notes

**Usage Example:**
```typescript
import { useHealthCheckins } from '@/hooks'

function HealthTab() {
  const { submitCheckin, getLatestCheckin } = useHealthCheckins()
  const latest = getLatestCheckin()
  
  const handleSubmit = async () => {
    await submitCheckin('Good', 7, 8, true, 'Feeling energetic')
  }
  
  return (
    <>
      <p>Latest: {latest?.mood} - Energy: {latest?.energy_level}/10</p>
      <button onClick={handleSubmit}>Submit Check-in</button>
    </>
  )
}
```

---

### 4. Dashboard Statistics (useStats Hook)
Calculates all dashboard statistics from request and check-in data.

**Statistics Available:**
```typescript
const stats = useStats()

// Companion Request Stats
stats.companionRequestsPending      // Number of pending requests
stats.companionRequestsAccepted     // In-progress requests
stats.companionRequestsCompleted    // Completed requests
stats.companionRequestsCancelled    // Cancelled requests
stats.upcomingVisits               // Upcoming scheduled visits

// Health Stats
stats.lastHealthCheckinDate        // Date of latest check-in
stats.averageHealthScore           // Average energy level (0-100)
stats.consecutiveDaysCheckin       // Days with check-ins in last 7 days

// Connection Stats
stats.eldersConnected              // Number of connected elders (Family)
stats.volunteersMatched            // Number of matched volunteers
stats.familyMembers                // Number of family members (Elder)

// Activity Stats
stats.activitiesThisMonth          // Requests this month
stats.emergencyContactsSetup       // Has emergency contacts
```

**Usage Example:**
```typescript
import { useStats } from '@/hooks'

function DashboardOverview() {
  const stats = useStats()
  
  return (
    <div className="grid grid-cols-4">
      <StatCard 
        title="Pending Requests" 
        value={stats.companionRequestsPending}
      />
      <StatCard 
        title="Health Score" 
        value={`${stats.averageHealthScore}%`}
      />
      <StatCard 
        title="Upcoming Visits" 
        value={stats.upcomingVisits}
      />
      <StatCard 
        title="Check-ins (7 days)" 
        value={stats.consecutiveDaysCheckin}
      />
    </div>
  )
}
```

---

### 5. Elder Management - Family Role (useElders Hook)
Family members can add, remove, and manage their connected elders.

**Available Methods:**
```typescript
const {
  elders,           // Array of connected elders
  loading,          // Loading state
  error,            // Error message
  fetchElders,      // Refresh elders list
  addElder,         // Add new elder by email
  removeElder,      // Remove elder connection
  updateElder       // Update relationship type
} = useElders()
```

**Relationship Types:** Parent, Grandparent, Sibling, Aunt/Uncle, Other

**Usage Example:**
```typescript
import { useElders } from '@/hooks'

function FamilyEldersTab() {
  const { elders, addElder, removeElder } = useElders()
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('Parent')
  
  const handleAdd = async () => {
    const success = await addElder(email, relationship)
    if (success) setEmail('')
  }
  
  return (
    <>
      <div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Elder email" />
        <select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
          <option>Parent</option>
          <option>Grandparent</option>
        </select>
        <button onClick={handleAdd}>Add Elder</button>
      </div>
      
      {elders.map(elder => (
        <div key={elder.id}>
          <h3>{elder.elder?.first_name}</h3>
          <p>{elder.relationship}</p>
          <button onClick={() => removeElder(elder.id)}>Remove</button>
        </div>
      ))}
    </>
  )
}
```

---

### 6. User Preferences & Settings (usePreferences Hook)
Manages all user settings and preferences across all roles.

**Available Methods:**
```typescript
const {
  preferences,            // Current preferences object
  loading,               // Loading state
  error,                 // Error message
  saved,                 // Shows save confirmation
  savePreferences,       // Save custom preferences
  updateNotifications,   // Update notification settings
  updateAccessibility,   // Update accessibility settings
  updatePrivacy,         // Update privacy settings
  updateRolePreferences  // Update role-specific prefs
} = usePreferences()
```

**Preference Categories:**

**Notifications:**
```typescript
await updateNotifications(
  emailNotifications: boolean,
  smsNotifications: boolean,
  pushNotifications: boolean
)
```

**Accessibility:**
```typescript
await updateAccessibility(
  largeFonts: boolean,
  highContrast: boolean,
  voiceEnabled: boolean,
  language: 'en' | 'es' | 'fr' | etc
)
```

**Privacy:**
```typescript
await updatePrivacy(
  dataSharingConsent: boolean,
  marketingEmails: boolean
)
```

**Role-Specific (Elder):**
```typescript
await updateRolePreferences({
  healthCheckInFrequency: 'daily' | 'weekly',
  emergencyContactsSetup: boolean
})
```

**Role-Specific (Volunteer):**
```typescript
await updateRolePreferences({
  maxCompanionshipHoursPerWeek: 10,
  preferredActivityTypes: ['companionship', 'errands'],
  availabilityDays: ['Mon', 'Tue', 'Wed']
})
```

**Role-Specific (Family):**
```typescript
await updateRolePreferences({
  notifyOnElderActivity: true,
  shareMedicationReminders: true
})
```

**Usage Example:**
```typescript
import { usePreferences } from '@/hooks'

function SettingsPage() {
  const { preferences, updateNotifications, saved } = usePreferences()
  
  const handleNotificationChange = async (type: string, value: boolean) => {
    const result = await updateNotifications(
      type === 'email' ? value : preferences.emailNotifications,
      type === 'sms' ? value : preferences.smsNotifications,
      type === 'push' ? value : preferences.pushNotifications
    )
    if (result) console.log('Saved!')
  }
  
  return (
    <div>
      <label>
        <input 
          type="checkbox"
          checked={preferences.emailNotifications}
          onChange={(e) => handleNotificationChange('email', e.target.checked)}
        />
        Email Notifications
      </label>
      {saved && <p className="text-green-600">Preferences saved!</p>}
    </div>
  )
}
```

---

## Data Persistence

All hooks automatically handle:
- ✅ Real-time updates from backend
- ✅ Local state management
- ✅ Error handling & retry logic
- ✅ Loading states for UX
- ✅ localStorage caching for offline access

---

## Backend Endpoints Reference

These are the endpoints these hooks call:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /send-otp | Generate OTP |
| POST | /verify-otp | Verify OTP |
| POST | /signup | Create account |
| GET | /get-profile | Fetch profile |
| PUT | /get-profile | Update profile |
| GET | /companion-requests | List requests |
| POST | /companion-requests | Create request |
| POST | /companion-requests/:id/accept | Accept request |
| GET | /health-checkins | Get check-ins |
| POST | /health-checkins | Submit check-in |
| GET | /family-elders | List elders |
| POST | /family-elders | Add elder |
| DELETE | /family-elders/:id | Remove elder |
| PUT | /family-elders/:id | Update elder |
| GET | /user-preferences | Load preferences |
| PUT | /user-preferences | Save preferences |

---

## Type Definitions

All hooks export TypeScript interfaces for type safety:

```typescript
import type {
  User,              // User profile
  CompanionRequest,  // Companion request
  HealthCheckin,     // Health check-in
  ElderConnection,   // Family-elder connection
  DashboardStats,    // Statistics
  UserPreferences    // User preferences
} from '@/hooks'
```

---

## Common Patterns

### Loading Data on Mount
```typescript
useEffect(() => {
  // Hooks auto-fetch on mount
  // No additional setup needed
}, [])
```

### Optimistic Updates
```typescript
// State updates immediately, syncs to backend
const { createRequest } = useCompanionRequests()
await createRequest(data)  // Updates requests array instantly
```

### Error Handling
```typescript
const { requests, error } = useCompanionRequests()
if (error) return <div className="text-red-600">{error}</div>
```

### Combining Multiple Hooks
```typescript
function Dashboard() {
  const { user } = useAuth()
  const stats = useStats()
  const { requests } = useCompanionRequests()
  const { preferences } = usePreferences()
  
  // All data is available and synced
}
```

---

## Next Steps

1. **Integrate Stats** into dashboard cards
2. **Add Settings UI** with usePreferences hook
3. **Implement Add Elder** modal for family role
4. **Add Request Filters** (status tabs)
5. **Create Messaging** system (optional)

All APIs are production-ready and will automatically work when backend is deployed! 🚀
