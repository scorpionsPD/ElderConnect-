// Dummy data for UI prototyping

export const DUMMY_ELDER_PROFILE = {
  id: 'elder-001',
  email: 'margaret.wilson@email.com',
  fullName: 'Margaret Wilson',
  phone: '+44 141 123 4567',
  age: 72,
  location: 'Glasgow, Scotland',
  bio: 'Retired teacher, love reading and gardening. Looking for friendly companion visits.',
  profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  role: 'elder',
  verificationStatus: 'verified',
  joinedDate: '2024-01-15',
  
  // Health & Wellness
  healthConditions: ['Type 2 Diabetes', 'Mild Arthritis'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '08:00, 20:00' },
    { name: 'Ibuprofen', dosage: '200mg', frequency: 'As needed', time: 'N/A' },
  ],
  emergencyContact: {
    name: 'Sarah Wilson',
    relation: 'Daughter',
    phone: '+44 141 234 5678',
    email: 'sarah@email.com',
  },

  // Companion Preferences
  preferredCompanions: ['Female', 'Any'],
  interests: ['Reading', 'Gardening', 'Art', 'Walking', 'Cooking'],
  servicesNeeded: ['Shopping assistance', 'Doctor appointments', 'Social visits', 'Technology help'],
  mobilityStatus: 'Independent with walking aid',
  accessibility: {
    largeFont: true,
    highContrast: false,
    textToSpeech: false,
    hearingAid: false,
  },

  // Stats
  companionVisits: 24,
  averageRating: 4.8,
  emergencyAlertsUsed: 2,
  familyConnections: 2,
}

export const DUMMY_VOLUNTEER_PROFILE = {
  id: 'vol-001',
  email: 'james.smith@email.com',
  fullName: 'James Smith',
  phone: '+44 141 987 6543',
  age: 28,
  location: 'Edinburgh, Scotland',
  bio: 'Software engineer with passion for community service. Available weekends and evenings.',
  profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  role: 'volunteer',
  verificationStatus: 'verified',
  joinedDate: '2023-11-20',

  // Volunteer Details
  dbsCertified: true,
  dbsExpiryDate: '2026-11-20',
  backgroundCheckStatus: 'cleared',
  references: [
    { name: 'Dr. Jane Doe', status: 'verified' },
    { name: 'Mr. John Brown', status: 'verified' },
  ],

  // Skills & Services
  skills: ['Technology support', 'Shopping assistance', 'Social companionship', 'Errands'],
  languages: ['English', 'Gaelic (Basic)'],
  specializations: ['Tech support', 'Young volunteers'],
  
  // Availability
  availability: {
    Monday: { available: false },
    Tuesday: { available: true, from: '18:00', to: '21:00' },
    Wednesday: { available: true, from: '18:00', to: '21:00' },
    Thursday: { available: false },
    Friday: { available: true, from: '18:00', to: '22:00' },
    Saturday: { available: true, from: '09:00', to: '18:00' },
    Sunday: { available: true, from: '10:00', to: '17:00' },
  },

  // Stats
  hoursContributed: 156,
  completedMatches: 42,
  averageRating: 4.9,
  totalImpact: { elders: 12, hours: 156 },
}

export const DUMMY_COMPANION_REQUESTS = [
  {
    id: 'req-001',
    elder: { name: 'Margaret Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop' },
    serviceType: 'Shopping assistance',
    description: 'Need help with weekly grocery shopping at Tesco',
    date: '2026-02-26',
    time: '14:00',
    duration: 2,
    location: 'Glasgow City Centre',
    urgency: 'normal',
    volunteers: 3,
    status: 'open',
  },
  {
    id: 'req-002',
    elder: { name: 'Robert Johnson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop' },
    serviceType: 'Doctor appointment',
    description: 'Accompany to GP appointment and help understand medical advice',
    date: '2026-02-27',
    time: '10:00',
    duration: 1.5,
    location: 'Edinburgh Royal Infirmary',
    urgency: 'high',
    volunteers: 2,
    status: 'open',
  },
  {
    id: 'req-003',
    elder: { name: 'Dorothy Campbell', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop' },
    serviceType: 'Social visit',
    description: 'Chat and have tea, maybe help with garden planning',
    date: '2026-02-28',
    time: '15:00',
    duration: 2,
    location: 'Perth',
    urgency: 'normal',
    volunteers: 5,
    status: 'matched',
  },
]

export const DUMMY_HEALTH_CHECKINS = [
  {
    date: '2026-02-24',
    mood: 'Happy',
    energy: 7,
    sleep: 7,
    mealsSinceLastCheck: 3,
    moodDetails: 'Had a nice visit from granddaughter',
  },
  {
    date: '2026-02-23',
    mood: 'Okay',
    energy: 5,
    sleep: 6,
    mealsSinceLastCheck: 2,
    moodDetails: 'Bit tired, rainy day',
  },
  {
    date: '2026-02-22',
    mood: 'Happy',
    energy: 8,
    sleep: 8,
    mealsSinceLastCheck: 3,
    moodDetails: 'Garden looks beautiful today',
  },
]

export const DUMMY_FAMILY_MEMBERS = [
  {
    id: 'fam-001',
    name: 'Sarah Wilson',
    relation: 'Daughter',
    email: 'sarah@email.com',
    phone: '+44 141 234 5678',
    status: 'active',
    permissionLevel: 'view_health_and_activities',
    lastActive: '2026-02-24T10:30:00Z',
  },
  {
    id: 'fam-002',
    name: 'Tom Wilson',
    relation: 'Son',
    email: 'tom@email.com',
    phone: '+44 141 345 6789',
    status: 'pending',
    permissionLevel: 'view_health_only',
    lastActive: null,
  },
]

export const DUMMY_COMMUNITY_EVENTS = [
  {
    id: 'event-001',
    title: 'Weekly Coffee & Chat',
    description: 'Virtual coffee session with other elders. Everyone welcome!',
    date: '2026-02-26',
    time: '14:00',
    duration: 1,
    type: 'virtual',
    attendees: 12,
    joined: false,
  },
  {
    id: 'event-002',
    title: 'Garden Club Meeting',
    description: 'Spring gardening tips and tricks. Meet at Glasgow Botanical Gardens.',
    date: '2026-02-27',
    time: '10:00',
    duration: 2,
    type: 'in-person',
    location: 'Glasgow Botanical Gardens',
    attendees: 8,
    joined: true,
  },
  {
    id: 'event-003',
    title: 'Tech Help Workshop',
    description: 'Learn how to use your smartphone better. One-on-one help available.',
    date: '2026-03-01',
    time: '11:00',
    duration: 1.5,
    type: 'hybrid',
    location: 'Community Centre',
    attendees: 15,
    joined: false,
  },
]

export const DUMMY_MESSAGES = [
  {
    id: 'msg-001',
    sender: 'James Smith',
    senderRole: 'volunteer',
    content: 'Hi Margaret! I can help with your shopping this Wednesday. Is 2 PM okay?',
    timestamp: '2026-02-24T14:30:00Z',
    read: true,
  },
  {
    id: 'msg-002',
    sender: 'Margaret Wilson',
    senderRole: 'elder',
    content: 'That sounds wonderful! Yes, 2 PM is perfect. I need to go to Tesco.',
    timestamp: '2026-02-24T14:45:00Z',
    read: true,
  },
  {
    id: 'msg-003',
    sender: 'James Smith',
    senderRole: 'volunteer',
    content: "Great! I'll meet you at the main entrance. See you then!",
    timestamp: '2026-02-24T15:00:00Z',
    read: false,
  },
]

export const DUMMY_NOTIFICATIONS = [
  {
    id: 'notif-001',
    type: 'companion_match',
    title: 'New Companion Request',
    message: 'A volunteer has accepted your shopping request!',
    timestamp: '2026-02-24T14:30:00Z',
    read: false,
    actionUrl: '/request/req-001',
  },
  {
    id: 'notif-002',
    type: 'health_reminder',
    title: 'Daily Health Check-in',
    message: 'How are you feeling today? Take a quick check-in.',
    timestamp: '2026-02-24T08:00:00Z',
    read: true,
    actionUrl: '/health/check-in',
  },
  {
    id: 'notif-003',
    type: 'medication',
    title: 'Medication Reminder',
    message: "Don't forget your Metformin at 20:00",
    timestamp: '2026-02-24T19:50:00Z',
    read: false,
    actionUrl: '/health/medications',
  },
]

export const DUMMY_VOLUNTEER_STATS = {
  hoursThisWeek: 8,
  hoursThisMonth: 32,
  matchesThisMonth: 5,
  upcomingMatches: 2,
  averageRating: 4.9,
  totalReviews: 24,
  impactSummary: {
    eldersMet: 12,
    totalHours: 156,
    taskCompleted: 42,
  },
}

export const DUMMY_ELDER_STATS = {
  companionVisitsThisMonth: 6,
  upcomingVisits: 2,
  familyConnections: 2,
  lastHealthCheckin: '2026-02-24T08:30:00Z',
  averageHealthScore: 7.5,
  emergencyContactsSetup: true,
}
