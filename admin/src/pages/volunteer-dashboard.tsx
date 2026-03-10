'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Tabs from '@/components/Tabs'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { useStats } from '@/hooks/useStats'
import { useCompanionRequests } from '@/hooks/useCompanionRequests'
import { useCompanionMessages } from '@/hooks/useCompanionMessages'
import { usePreferences } from '@/hooks/usePreferences'
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Zap,
  Users,
  TrendingUp,
  Award,
  Settings,
  Bell,
  MessageSquare,
  CheckCircle,
  Eye,
  BarChart3,
  Shield,
  Heart,
  Edit2,
  RefreshCw,
  UserCheck,
  Trash2,
  Upload,
  Check,
} from 'lucide-react'
import { useRef } from 'react'

type TabType = 'overview' | 'matches' | 'calendar' | 'impact' | 'profile' | 'settings'

const availabilityDayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const volunteerSkillOptions = [
  { id: 'conversation', label: 'Great Listener' },
  { id: 'reading', label: 'Reading Aloud' },
  { id: 'music', label: 'Music & Arts' },
  { id: 'games', label: 'Games & Activities' },
  { id: 'errands', label: 'Running Errands' },
  { id: 'transport', label: 'Transportation' },
]
const volunteerAvailabilityOptions = [
  { id: 'weekday-morning', label: 'Weekday Mornings' },
  { id: 'weekday-afternoon', label: 'Weekday Afternoons' },
  { id: 'weekday-evening', label: 'Weekday Evenings' },
  { id: 'weekend-morning', label: 'Weekend Mornings' },
  { id: 'weekend-afternoon', label: 'Weekend Afternoons' },
  { id: 'weekend-evening', label: 'Weekend Evenings' },
]
const volunteerTravelDistanceOptions = [
  { id: '5', label: 'Walking Distance', description: 'Up to 5 km' },
  { id: '15', label: 'Short Drive', description: 'Up to 15 km' },
  { id: '30', label: 'Willing to Drive', description: 'Up to 30 km' },
  { id: '50', label: 'Anywhere', description: 'Distance no problem' },
]

const EMPTY_VOLUNTEER_PROFILE = {
  id: '',
  email: '',
  first_name: '',
  role: 'VOLUNTEER',
  phone_number: '',
  profile_picture_url: '',
}

export default function VolunteerDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  
  // Hooks for data
  const stats = useStats()
  const { requests, acceptRequest, fetchRequests, completeRequest } = useCompanionRequests()
  const { messages, loading: messagesLoading, sending: messageSending, error: messagesError, fetchMessages, sendMessage } = useCompanionMessages()
  const { preferences, updateNotifications, updateAccessibility, updatePrivacy, updateRolePreferences, saved } = usePreferences()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [selectedAvailabilitySlots, setSelectedAvailabilitySlots] = useState<string[]>([])
  const [selectedHelpCategories, setSelectedHelpCategories] = useState<string[]>([])
  const [travelDistance, setTravelDistance] = useState<string>('')
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(user || EMPTY_VOLUNTEER_PROFILE)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture_url || '')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setAvatarPreview(result)
      setProfileData({ ...profileData, profile_picture_url: result })
    }
    reader.readAsDataURL(file)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Zap className="w-4 h-4" /> },
    { id: 'matches', label: 'Companion Requests', icon: <Heart className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'impact', label: 'Impact', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        if (user && user.role?.toLowerCase() !== 'volunteer') {
          const target = user.role?.toLowerCase() === 'elder'
            ? '/elder-dashboard'
            : user.role?.toLowerCase() === 'family'
            ? '/family-dashboard'
            : '/dashboard'
          router.replace(target)
          return
        }
        if (user) {
          setProfileData(user)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, toast, router])

  useEffect(() => {
    const tab = typeof router.query.tab === 'string' ? router.query.tab : ''
    if (tab === 'matches') setActiveTab('matches')
    if (tab === 'calendar') setActiveTab('calendar')
    if (tab === 'impact') setActiveTab('impact')
    if (tab === 'profile') setActiveTab('profile')
    if (tab === 'settings') setActiveTab('settings')
    if (tab === 'overview') setActiveTab('overview')
  }, [router.query.tab])

  useEffect(() => {
    setSelectedAvailabilitySlots(Array.isArray(preferences.availabilityDays) ? preferences.availabilityDays : [])
    setSelectedHelpCategories(Array.isArray(preferences.preferredActivityTypes) ? preferences.preferredActivityTypes : [])
    setTravelDistance(typeof preferences.volunteerTravelDistance === 'string' ? preferences.volunteerTravelDistance : '')
  }, [preferences.availabilityDays, preferences.preferredActivityTypes, preferences.volunteerTravelDistance])

  const handleAcceptRequest = async (requestId: string) => {
    const accepted = await acceptRequest(requestId)
    if (accepted) {
      toast.success('Companion request accepted')
      await fetchRequests()
      return
    }
    toast.error('Failed to accept request')
  }

  const handleCompleteRequest = async (requestId: string) => {
    const completed = await completeRequest(requestId)
    if (!completed) {
      toast.error('Failed to complete request')
      return
    }
    toast.success('Request marked as completed')
    await fetchRequests()
  }

  const toggleValue = (current: string[], value: string, set: (next: string[]) => void) => {
    if (current.includes(value)) {
      set(current.filter((item) => item !== value))
    } else {
      set([...current, value])
    }
  }

  const handleSaveAvailability = async () => {
    setSavingAvailability(true)
    try {
      const ok = await updateRolePreferences({
        preferredActivityTypes: selectedHelpCategories,
        availabilityDays: selectedAvailabilitySlots,
        volunteerTravelDistance: travelDistance
      })
      if (!ok) {
        toast.error('Failed to save availability')
        return
      }
      toast.success('Availability updated')
      setShowAvailabilityModal(false)
    } finally {
      setSavingAvailability(false)
    }
  }

  const handleOpenChat = async (requestId: string) => {
    const nextId = activeChatRequestId === requestId ? null : requestId
    setActiveChatRequestId(nextId)
    setChatInput('')
    if (nextId) {
      await fetchMessages(nextId)
    }
  }

  const handleSendChatMessage = async () => {
    if (!activeChatRequestId) return
    const sent = await sendMessage(activeChatRequestId, chatInput)
    if (!sent) {
      toast.error('Failed to send message')
      return
    }
    setChatInput('')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const fullName = profileData?.first_name || 'User'
  const completionNeedsVolunteer = requests.filter(
    (r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'VOLUNTEER'
  ).length
  const completionWaitingOnElder = requests.filter(
    (r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'ELDER'
  ).length
  const prioritizedRequests = [
    ...requests.filter(
      (r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'VOLUNTEER'
    ),
    ...requests.filter(
      (r) => !((r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'VOLUNTEER')
    ),
  ]

  const getInitials = () => {
    if (!fullName || fullName === 'User') return 'U'
    return fullName[0].toUpperCase()
  }

  const renderVolunteerPreferenceFields = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Help Categories</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {volunteerSkillOptions.map((option) => {
            const isSelected = selectedHelpCategories.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleValue(selectedHelpCategories, option.id, setSelectedHelpCategories)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left relative ${
                  isSelected
                    ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-sm text-gray-900">{option.label}</span>
                {isSelected && <Check className="w-4 h-4 absolute top-2 right-2 text-green-600" />}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {volunteerAvailabilityOptions.map((option) => {
            const isSelected = selectedAvailabilitySlots.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleValue(selectedAvailabilitySlots, option.id, setSelectedAvailabilitySlots)}
                className={`p-2 rounded-lg border-2 text-xs font-medium transition-all text-left ${
                  isSelected
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Travel Distance</label>
        <div className="space-y-3">
          {volunteerTravelDistanceOptions.map((option) => {
            const isSelected = travelDistance === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTravelDistance(option.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                  isSelected
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                {isSelected && <Check className="w-5 h-5 text-green-600" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Volunteer Dashboard - ElderConnect+</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          {/* Header with Profile */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                {profileData?.profile_picture_url ? (
                  <Image
                    src={profileData.profile_picture_url}
                    alt={fullName}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white bg-opacity-30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{getInitials()}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold">{fullName || 'User'}</h1>
                  <p className="text-emerald-100">{profileData?.email || 'Not available'}</p>
                  <div className="flex gap-4 mt-3">
                    <Badge variant="default">{profileData?.role || 'VOLUNTEER'}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.companionRequestsPending}</p>
                  <p className="text-xs text-gray-500">Awaiting response</p>
                  <p className="text-xs text-amber-600 mt-1">Need your completion: {completionNeedsVolunteer}</p>
                </div>
                <Clock className="w-12 h-12 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Matches</p>
                  <p className="text-3xl font-bold text-green-600">{stats.upcomingVisits}</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
                <Heart className="w-12 h-12 text-green-200" />
              </div>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.companionRequestsCompleted}</p>
                  <p className="text-xs text-gray-500">Matches finished</p>
                </div>
                <CheckCircle className="w-12 h-12 text-purple-200" />
              </div>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Connections</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.eldersConnected}</p>
                  <p className="text-xs text-gray-500">Elders connected</p>
                </div>
                <Users className="w-12 h-12 text-orange-200" />
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={tabs.map(t => ({ ...t, id: t.id as TabType }))}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as TabType)}
          />

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Matched Companions */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Matches</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">No matches yet. Check back soon!</p>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">No recent activity yet</p>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full" variant="secondary" onClick={() => setShowAvailabilityModal(true)}>
                      Update Availability
                    </Button>
                    <Button className="w-full" variant="secondary" onClick={() => setActiveTab('matches')}>
                      View Messages
                    </Button>
                  </div>
                </Card>

                {/* Next Scheduled */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Scheduled</h3>
                  <p className="text-sm text-gray-600">No upcoming matches</p>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Tab - Profile & Preferences */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Profile Section */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profile"
                        width={96}
                        height={96}
                        unoptimized
                        className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-gray-600">{getInitials()}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Photo
                      </label>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-2">PNG or JPG up to 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900 mt-1">{fullName || 'User'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900 mt-1">{profileData?.email || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900 mt-1">{profileData?.phone_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="text-gray-900 mt-1">{profileData?.role || 'VOLUNTEER'}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => updateNotifications(e.target.checked, preferences.smsNotifications, preferences.pushNotifications)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive companion request updates via email</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => updateNotifications(preferences.emailNotifications, e.target.checked, preferences.pushNotifications)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Get urgent requests as text messages</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => updateNotifications(preferences.emailNotifications, preferences.smsNotifications, e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">In-app notifications for new matches</p>
                    </div>
                  </label>
                </div>
                {saved && <p className="text-sm text-green-600 mt-3">✓ Preferences saved!</p>}
              </Card>

              {/* Accessibility */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.accessibilityLargeFonts}
                      onChange={(e) => updateAccessibility(e.target.checked, preferences.accessibilityHighContrast, preferences.accessibilityVoiceEnabled, preferences.preferredLanguage)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Large Fonts</p>
                      <p className="text-sm text-gray-600">Increase text size for easier reading</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.accessibilityHighContrast}
                      onChange={(e) => updateAccessibility(preferences.accessibilityLargeFonts, e.target.checked, preferences.accessibilityVoiceEnabled, preferences.preferredLanguage)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">High Contrast</p>
                      <p className="text-sm text-gray-600">Improve visibility with high contrast colors</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.accessibilityVoiceEnabled}
                      onChange={(e) => updateAccessibility(preferences.accessibilityLargeFonts, preferences.accessibilityHighContrast, e.target.checked, preferences.preferredLanguage)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Voice Guidance</p>
                      <p className="text-sm text-gray-600">Enable voice-over assistance</p>
                    </div>
                  </label>

                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                    <select
                      value={preferences.preferredLanguage}
                      onChange={(e) => updateAccessibility(preferences.accessibilityLargeFonts, preferences.accessibilityHighContrast, preferences.accessibilityVoiceEnabled, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
                {saved && <p className="text-sm text-green-600 mt-3">✓ Preferences saved!</p>}
              </Card>

              {/* Privacy */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.dataSharingConsent}
                      onChange={(e) => updatePrivacy(e.target.checked, preferences.marketingEmails)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Share Activity Data</p>
                      <p className="text-sm text-gray-600">Allow anonymous volunteer statistics collection</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketingEmails}
                      onChange={(e) => updatePrivacy(preferences.dataSharingConsent, e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive tips and volunteer opportunities</p>
                    </div>
                  </label>
                </div>
                {saved && <p className="text-sm text-green-600 mt-3">✓ Preferences saved!</p>}
              </Card>

              {/* Volunteer Preferences */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Settings</h3>
                <div className="space-y-6">
                  {renderVolunteerPreferenceFields()}
                  <div>
                    <Button onClick={handleSaveAvailability} disabled={savingAvailability}>
                      {savingAvailability ? 'Saving...' : 'Save Volunteer Settings'}
                    </Button>
                  </div>
                </div>
                {saved && <p className="text-sm text-green-600 mt-3">✓ Preferences saved!</p>}
              </Card>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Companion Requests</h3>
              {completionNeedsVolunteer > 0 && (
                <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-2">Needs Your Confirmation ({completionNeedsVolunteer})</p>
                  <div className="space-y-2">
                    {prioritizedRequests
                      .filter((r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'VOLUNTEER')
                      .map((req) => (
                        <div key={`confirm-${req.id}`} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-amber-900">
                            {req.activity_type} • {req.description || 'No description'}
                          </span>
                          <Button
                            variant="secondary"
                            onClick={() => handleCompleteRequest(req.id)}
                          >
                            Confirm Complete
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {requests.length === 0 ? (
                <p className="text-sm text-gray-600">No companion requests available right now.</p>
              ) : (
                <div className="space-y-3">
                  {prioritizedRequests.map((req) => (
                    <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="font-semibold text-gray-900">{req.activity_type}</p>
                          <p className="text-sm text-gray-600">{req.description || 'No description provided'}</p>
                          {req.status === 'PENDING' && typeof req.matching?.score === 'number' && (
                            <div className="inline-flex flex-wrap items-center gap-2 text-xs mt-1">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Match {req.matching.score}%
                              </span>
                              {req.matching.activity_match && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                  Category fit
                                </span>
                              )}
                              {req.matching.availability_match && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                  Time fit
                                </span>
                              )}
                            </div>
                          )}
                          <div className="space-y-1 text-sm text-gray-700">
                            <p>
                              <span className="font-medium">Posted by:</span>{' '}
                              {req.elder?.first_name || 'Elder'} {req.elder?.last_name || ''}
                            </p>
                            {req.elder?.email && (
                              <p>
                                <span className="font-medium">Email:</span> {req.elder.email}
                              </p>
                            )}
                            {req.elder?.phone_number && (
                              <p>
                                <span className="font-medium">Phone:</span> {req.elder.phone_number}
                              </p>
                            )}
                            {(req.elder?.address_line_1 || req.elder?.city || req.elder?.postcode) && (
                              <p>
                                <span className="font-medium">Address:</span>{' '}
                                {[req.elder?.address_line_1, req.elder?.city, req.elder?.postcode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}
                            {req.preferred_time_start && (
                              <p>
                                <span className="font-medium">Preferred start:</span>{' '}
                                {req.preferred_time_start}
                              </p>
                            )}
                            {req.preferred_time_end && (
                              <p>
                                <span className="font-medium">Preferred end:</span>{' '}
                                {req.preferred_time_end}
                              </p>
                            )}
                            {(req.location_latitude !== undefined && req.location_longitude !== undefined) && (
                              <p>
                                <span className="font-medium">Location:</span>{' '}
                                {Number(req.location_latitude).toFixed(5)}, {Number(req.location_longitude).toFixed(5)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              req.status === 'PENDING'
                                ? 'warning'
                                : req.status === 'ACCEPTED' || req.status === 'COMPLETED'
                                ? 'success'
                                : req.status === 'IN_PROGRESS'
                                ? 'info'
                                : req.status === 'CANCELLED'
                                ? 'error'
                                : 'default'
                            }
                          >
                            {req.status}
                          </Badge>
                          {req.status === 'PENDING' && (
                            <Button
                              variant="secondary"
                              onClick={() => handleAcceptRequest(req.id)}
                            >
                              Accept
                            </Button>
                          )}
                          {(req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') && (
                            req.completion?.waiting_for === 'ELDER' ? (
                              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                Completion requested. Waiting for elder confirmation.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {req.completion?.waiting_for === 'VOLUNTEER' && (
                                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    Elder requested completion. Please confirm to finish this request.
                                  </p>
                                )}
                                <Button
                                  variant="secondary"
                                  onClick={() => handleCompleteRequest(req.id)}
                                >
                                  {req.completion?.waiting_for === 'VOLUNTEER' ? 'Confirm Complete' : 'Request Completion'}
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status) && (
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenChat(req.id)}
                          >
                            {activeChatRequestId === req.id ? 'Hide Chat' : 'Open Chat'}
                          </Button>

                          {activeChatRequestId === req.id && (
                            <div className="mt-3 space-y-3">
                              {messagesError && <p className="text-sm text-red-600">{messagesError}</p>}
                              <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                                {messagesLoading ? (
                                  <p className="text-sm text-gray-600">Loading messages...</p>
                                ) : messages.length === 0 ? (
                                  <p className="text-sm text-gray-600">No messages yet. Start the conversation.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {messages.map((message) => (
                                      <div key={message.id} className="text-sm">
                                        <p className="font-medium text-gray-900">
                                          {message.sender?.first_name || (message.sender_id === req.volunteer_id ? 'You' : 'Elder')}
                                          <span className="ml-2 text-xs text-gray-500 font-normal">
                                            {new Date(message.created_at).toLocaleString()}
                                          </span>
                                        </p>
                                        <p className="text-gray-700">{message.message_text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  placeholder="Type message..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <Button
                                  onClick={handleSendChatMessage}
                                  disabled={messageSending || !chatInput.trim()}
                                >
                                  {messageSending ? 'Sending...' : 'Send'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {completionWaitingOnElder > 0 && (
                <p className="text-xs text-blue-700 mt-3">
                  Waiting on elder confirmation for {completionWaitingOnElder} request(s).
                </p>
              )}
            </Card>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Upcoming Visits</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.upcomingVisits}</p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Accepted Requests</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.companionRequestsAccepted}</p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.companionRequestsCompleted}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Impact Tab */}
          {activeTab === 'impact' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">Activities this month</span>
                  <span className="font-semibold text-gray-900">{stats.activitiesThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">Pending requests</span>
                  <span className="font-semibold text-gray-900">{stats.companionRequestsPending}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">Cancelled requests</span>
                  <span className="font-semibold text-gray-900">{stats.companionRequestsCancelled}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{fullName || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{profileData?.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{profileData?.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-gray-900">{profileData?.role || 'VOLUNTEER'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Layout>

      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4 sm:p-6 my-4 sm:my-0 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Availability</h3>
            <div className="space-y-6">
              {renderVolunteerPreferenceFields()}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowAvailabilityModal(false)} disabled={savingAvailability}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAvailability} disabled={savingAvailability}>
                  {savingAvailability ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
