'use client'

import React, { useState, useEffect, useRef } from 'react'
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
import { useStats, useHealthCheckins, useCompanionRequests, usePreferences } from '@/hooks'
import {
  Heart,
  MessageSquare,
  Clock,
  MapPin,
  Star,
  Calendar,
  AlertCircle,
  Plus,
  Pill,
  Users,
  TrendingUp,
  Phone,
  Mail,
  Settings,
  Bell,
  LogOut,
  Edit2,
  Eye,
  Save,
  UserPlus,
  Trash2,
  Upload,
} from 'lucide-react'

type TabType = 'overview' | 'companions' | 'health' | 'family' | 'settings'

// Placeholder data for when APIs don't return data yet
const PLACEHOLDER_ELDER = {
  id: 'elder-001',
  email: 'elder@elderconnect.dev',
  first_name: 'Elder',
  role: 'ELDER',
  phone_number: '',
  profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
}

const PLACEHOLDER_STATS = {
  companionVisitsThisMonth: 0,
  upcomingVisits: 0,
  familyConnections: 0,
  lastHealthCheckin: '',
  averageHealthScore: 0,
  emergencyContactsSetup: false,
}

export default function ElderDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const toast = useToast()
  const stats = useStats()
  const { checkins, submitCheckin } = useHealthCheckins()
  const { requests, createRequest } = useCompanionRequests()
  const { preferences, updateNotifications, updateAccessibility, saved } = usePreferences()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHealthCheckin, setShowHealthCheckin] = useState(false)
  const [showCompanionRequest, setShowCompanionRequest] = useState(false)
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(user || PLACEHOLDER_ELDER)
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
    { id: 'overview', label: 'Overview', icon: <Heart className="w-4 h-4" /> },
    { id: 'companions', label: 'Companions', icon: <Users className="w-4 h-4" /> },
    { id: 'health', label: 'Health & Wellness', icon: <Heart className="w-4 h-4" /> },
    { id: 'family', label: 'Family', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  // Load user data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
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
  }, [user, toast])

  const handleLogout = async () => {
    try {
      logout()
      localStorage.removeItem('auth_token')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  const handleHealthCheckinSubmit = async () => {
    try {
      await submitCheckin('good', 7, 8, true, 'Daily check-in')
      toast.success('Health check-in submitted successfully!')
      setShowHealthCheckin(false)
    } catch (error) {
      toast.error('Failed to submit health check-in')
    }
  }

  const handleCompanionRequestSubmit = async () => {
    try {
      const now = new Date().toISOString()
      await createRequest('CONVERSATION', 'Looking for companionship', now, now, 0, 0)
      toast.success('Companion request submitted successfully!')
      setShowCompanionRequest(false)
    } catch (error) {
      toast.error('Failed to submit companion request')
    }
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

  const getInitials = () => {
    if (!fullName || fullName === 'User') return 'U'
    return fullName[0].toUpperCase()
  }

  const filteredCompanionRequests = requests.filter((request) => {
    if (requestStatusFilter === 'ALL') return true
    return request.status === requestStatusFilter
  })

  const getRequestBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (status === 'PENDING') return 'warning'
    if (status === 'ACCEPTED' || status === 'COMPLETED') return 'success'
    if (status === 'IN_PROGRESS') return 'info'
    if (status === 'CANCELLED') return 'error'
    return 'default'
  }

  return (
    <>
      <Head>
        <title>Elder Dashboard - ElderConnect+</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          {/* Header with Profile */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-8 text-white">
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
                  <p className="text-primary-100">{profileData?.email || 'Not available'}</p>
                  <div className="flex gap-4 mt-3">
                    <Badge variant="default">{profileData?.role || 'ELDER'}</Badge>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Companion Visits</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.companionRequestsAccepted}</p>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Visits</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.upcomingVisits}</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-200" />
              </div>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="text-3xl font-bold text-green-600">{stats.averageHealthScore}%</p>
                  <p className="text-xs text-gray-500">Overall wellness</p>
                </div>
                <Heart className="w-12 h-12 text-green-200" />
              </div>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Check-in Streak</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.consecutiveDaysCheckin}</p>
                  <p className="text-xs text-gray-500">Days in a row</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200" />
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
                {/* Quick Actions */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleHealthCheckinSubmit}
                      className="flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Health Check-in
                    </Button>
                    <Button 
                      onClick={handleCompanionRequestSubmit}
                      className="flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Request Companion
                    </Button>
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
                {/* Emergency Contacts */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
                  <p className="text-sm text-gray-600">No emergency contacts configured</p>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                  <p className="text-sm text-gray-600">No upcoming events</p>
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
                        className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition font-medium"
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
                      <p className="text-gray-900 mt-1">{profileData?.role || 'ELDER'}</p>
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
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => updateNotifications(preferences.emailNotifications, e.target.checked, preferences.pushNotifications)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Receive text messages</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => updateNotifications(preferences.emailNotifications, preferences.smsNotifications, e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">In-app notifications</p>
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
                      className="w-4 h-4 text-primary-600 rounded"
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
                      className="w-4 h-4 text-primary-600 rounded"
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
                      className="w-4 h-4 text-primary-600 rounded"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      onChange={(e) => updateNotifications(preferences.emailNotifications, preferences.smsNotifications, preferences.pushNotifications)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Share Health Data</p>
                      <p className="text-sm text-gray-600">Allow family members to view health information</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketingEmails}
                      onChange={(e) => updateNotifications(preferences.emailNotifications, preferences.smsNotifications, preferences.pushNotifications)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive tips and wellness content</p>
                    </div>
                  </label>
                </div>
                {saved && <p className="text-sm text-green-600 mt-3">✓ Preferences saved!</p>}
              </Card>
            </div>
          )}

          {/* Other Tabs */}
          {/* Companions Tab - Companion Requests */}
          {activeTab === 'companions' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage and review companion support requests</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setRequestStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      requestStatusFilter === status
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {!filteredCompanionRequests || filteredCompanionRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No companion requests yet</p>
                    <button
                      onClick={handleCompanionRequestSubmit}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Create Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCompanionRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.activity_type}</h4>
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                          <Badge variant={getRequestBadgeVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                          {request.preferred_time_start && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(request.preferred_time_start).toLocaleDateString()}
                            </div>
                          )}
                          {request.location_latitude && request.location_longitude && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Location set
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Health Tab - Health Checkins */}
          {activeTab === 'health' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health & Wellness Tracking</h3>
              <div className="space-y-4">
                {!checkins || checkins.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No health check-ins yet</p>
                    <button
                      onClick={handleHealthCheckinSubmit}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Check-in
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkins.map((checkin) => (
                      <div
                        key={checkin.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">Check-in on {new Date(checkin.checkin_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">Mood: {checkin.mood} • Energy: {checkin.energy_level}/10</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600 mt-2">
                          <span>💤 {checkin.sleep_hours}h sleep</span>
                          <span>💊 {checkin.medications_taken ? 'Took medications' : 'No medications'}</span>
                        </div>
                        {checkin.notes && <p className="text-sm text-gray-600 mt-2">Notes: {checkin.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Family Tab - Placeholder for now */}
          {activeTab === 'family' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Connections</h3>
              <p className="text-gray-600">Manage family member access and shared information.</p>
            </Card>
          )}
        </div>
      </Layout>

      {/* Modals will be added in next iteration */}
    </>
  )
}
