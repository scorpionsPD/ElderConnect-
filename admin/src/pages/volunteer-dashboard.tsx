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
  LogOut,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'

type TabType = 'overview' | 'matches' | 'calendar' | 'impact' | 'profile' | 'settings'

const PLACEHOLDER_VOLUNTEER = {
  id: 'vol-001',
  email: 'volunteer@elderconnect.dev',
  first_name: 'Volunteer',
  last_name: 'User',
  role: 'VOLUNTEER',
  phone_number: '',
  profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
}

const PLACEHOLDER_STATS = {
  hoursThisWeek: 0,
  hoursThisMonth: 0,
  matchesThisMonth: 0,
  upcomingMatches: 0,
  averageRating: 0,
  totalReviews: 0,
}

export default function VolunteerDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const toast = useToast()
  
  // Hooks for data
  const stats = useStats()
  const { requests, createRequest } = useCompanionRequests()
  const { preferences, updateNotifications, updateAccessibility, updatePrivacy, saved } = usePreferences()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(user || PLACEHOLDER_VOLUNTEER)
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

  const firstName = profileData?.first_name || 'User'
  const lastName = profileData?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()

  const getInitials = () => {
    if (!fullName || fullName === 'User') return 'U'
    return fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

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
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.companionRequestsPending}</p>
                  <p className="text-xs text-gray-500">Awaiting response</p>
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
                    <Button className="w-full" variant="secondary">
                      Update Availability
                    </Button>
                    <Button className="w-full" variant="secondary">
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Hours Per Week</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      defaultValue={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Hours available per week"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Activity Types</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">Conversation & Companionship</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">Recreational Activities</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">Help with Technology</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">Errands & Shopping</span>
                      </label>
                    </div>
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
              {requests.length === 0 ? (
                <p className="text-sm text-gray-600">No companion requests available right now.</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{req.activity_type}</p>
                          <p className="text-sm text-gray-600">{req.description || 'No description provided'}</p>
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
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
    </>
  )
}
