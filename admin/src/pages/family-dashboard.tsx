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
import { useElders } from '@/hooks/useElders'
import { usePreferences } from '@/hooks/usePreferences'
import {
  Heart,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Settings,
  Bell,
  MessageSquare,
  CheckCircle,
  Calendar,
  Shield,
  AlertCircle,
  Plus,
  LogOut,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'

type TabType = 'overview' | 'elders' | 'activities' | 'messages' | 'settings'

const PLACEHOLDER_FAMILY = {
  id: 'fam-001',
  email: 'family@elderconnect.dev',
  first_name: 'Family',
  role: 'FAMILY',
  phone_number: '',
  profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
}

const PLACEHOLDER_STATS = {
  eldersConnected: 0,
  recentActivities: 0,
  upcomingVisits: 0,
}

export default function FamilyDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const toast = useToast()
  
  // Hooks for data
  const stats = useStats()
  const { elders, addElder, removeElder } = useElders()
  const { preferences, updateNotifications, updateAccessibility, updatePrivacy, saved } = usePreferences()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(user || PLACEHOLDER_FAMILY)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture_url || '')
  const [showAddElderModal, setShowAddElderModal] = useState(false)
  const [newElderEmail, setNewElderEmail] = useState('')
  const [newElderRelationship, setNewElderRelationship] = useState('Parent')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleAddElder = async () => {
    if (!newElderEmail.trim()) {
      toast.error('Please enter elder email')
      return
    }

    const added = await addElder(newElderEmail.trim(), newElderRelationship)
    if (added) {
      toast.success('Elder added successfully')
      setShowAddElderModal(false)
      setNewElderEmail('')
      setNewElderRelationship('Parent')
      return
    }

    toast.error('Failed to add elder')
  }

  const handleRemoveElder = async (connectionId: string) => {
    const removed = await removeElder(connectionId)
    if (removed) {
      toast.success('Elder removed successfully')
      return
    }

    toast.error('Failed to remove elder')
  }

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
    { id: 'elders', label: 'Connected Elders', icon: <Users className="w-4 h-4" /> },
    { id: 'activities', label: 'Activities', icon: <Calendar className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
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

  const fullName = profileData?.first_name || 'User'

  const getInitials = () => {
    if (!fullName || fullName === 'User') return 'U'
    return fullName[0].toUpperCase()
  }

  return (
    <>
      <Head>
        <title>Family Dashboard - ElderConnect+</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          {/* Header with Profile */}
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg shadow-lg p-8 text-white">
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
                  <p className="text-rose-100">{profileData?.email || 'Not available'}</p>
                  <div className="flex gap-4 mt-3">
                    <Badge variant="default">{profileData?.role || 'FAMILY'}</Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Elders Connected</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.eldersConnected}</p>
                  <p className="text-xs text-gray-500">In your family</p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Volunteer Matches</p>
                  <p className="text-3xl font-bold text-green-600">{stats.upcomingVisits}</p>
                  <p className="text-xs text-gray-500">Active matches</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-200" />
              </div>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.activitiesThisMonth}</p>
                  <p className="text-xs text-gray-500">Activities</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-200" />
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
                {/* Connected Elders Summary */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Elders</h3>
                  <div className="space-y-3">
                    {elders.length === 0 ? (
                      <p className="text-sm text-gray-600">No connected elders yet</p>
                    ) : (
                      elders.slice(0, 3).map((elderConnection) => (
                        <div key={elderConnection.id} className="p-3 rounded-lg border border-gray-200">
                          <p className="font-medium text-gray-900">{elderConnection.elder?.first_name || 'Connected Elder'}</p>
                          <p className="text-xs text-gray-500">{elderConnection.relationship}</p>
                        </div>
                      ))
                    )}
                    <Button className="w-full" onClick={() => setShowAddElderModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Elder
                    </Button>
                  </div>
                </Card>

                {/* Recent Messages */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">No messages yet</p>
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
                      Contact Elder
                    </Button>
                    <Button className="w-full" variant="secondary">
                      View Calendar
                    </Button>
                  </div>
                </Card>

                {/* Health Alerts */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Health Alerts
                  </h3>
                  <p className="text-sm text-gray-600">No health alerts</p>
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
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition font-medium"
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
                      <p className="text-gray-900 mt-1">{profileData?.role || 'FAMILY'}</p>
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
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates about elder activities</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => updateNotifications(preferences.emailNotifications, e.target.checked, preferences.pushNotifications)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Urgent alerts via text message</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications}
                      onChange={(e) => updateNotifications(preferences.emailNotifications, preferences.smsNotifications, e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
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
                      className="w-4 h-4 text-rose-600 rounded"
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
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">High Contrast</p>
                      <p className="text-sm text-gray-600">Improve visibility with high contrast colors</p>
                    </div>
                  </label>
                  
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                    <select
                      value={preferences.preferredLanguage}
                      onChange={(e) => updateAccessibility(preferences.accessibilityLargeFonts, preferences.accessibilityHighContrast, preferences.accessibilityVoiceEnabled, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Share Elder Activity</p>
                      <p className="text-sm text-gray-600">Allow shared view of elder activities with other family members</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketingEmails}
                      onChange={(e) => updatePrivacy(preferences.dataSharingConsent, e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Wellness Tips</p>
                      <p className="text-sm text-gray-600">Receive elder care and wellness recommendations</p>
                    </div>
                  </label>
                </div>
                {saved && <p className="text-sm text-green-600 mt-3">✓ Preferences saved!</p>}
              </Card>

              {/* Family Preferences */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-600 rounded" />
                    <div>
                      <p className="font-medium text-gray-900">Notify on Elder Activity</p>
                      <p className="text-sm text-gray-600">Get notifications when elders use the app</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-rose-600 rounded" />
                    <div>
                      <p className="font-medium text-gray-900">Share Medication Reminders</p>
                      <p className="text-sm text-gray-600">View elder&apos;s medication and appointment reminders</p>
                    </div>
                  </label>
                </div>
              </Card>
            </div>
          )}

          {/* Elders Tab */}
          {activeTab === 'elders' && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Connected Elders</h3>
                  <Button onClick={() => setShowAddElderModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Elder
                  </Button>
                </div>

                {elders.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No elders connected yet</p>
                    <Button onClick={() => setShowAddElderModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Connect First Elder
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {elders.map((elderConnection) => (
                      <div
                        key={elderConnection.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {elderConnection.elder?.first_name || elderConnection.elder_user_id || 'Connected Elder'}
                          </p>
                          <p className="text-sm text-gray-600">Relationship: {elderConnection.relationship}</p>
                          <p className="text-xs text-gray-500">
                            Added: {new Date(elderConnection.added_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => handleRemoveElder(elderConnection.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Activities</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">Monthly activities</span>
                  <span className="font-semibold text-gray-900">{stats.activitiesThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">Upcoming visits</span>
                  <span className="font-semibold text-gray-900">{stats.upcomingVisits}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700">Connected elders</span>
                  <span className="font-semibold text-gray-900">{stats.eldersConnected}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
              {elders.length === 0 ? (
                <p className="text-sm text-gray-600">Connect an elder to start receiving message updates.</p>
              ) : (
                <div className="space-y-3">
                  {elders.map((elderConnection) => (
                    <div key={elderConnection.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">
                        {elderConnection.elder?.first_name || 'Connected Elder'}
                      </p>
                      <p className="text-sm text-gray-600">No new messages</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Other Tabs - Placeholder */}
          {activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'elders' && activeTab !== 'activities' && activeTab !== 'messages' && (
            <Card>
              <p className="text-gray-600">This section is currently unavailable.</p>
            </Card>
          )}
        </div>
      </Layout>

      {showAddElderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Elder Connection</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Elder Email</label>
                <input
                  type="email"
                  value={newElderEmail}
                  onChange={(e) => setNewElderEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="elder@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  value={newElderRelationship}
                  onChange={(e) => setNewElderRelationship(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Aunt/Uncle">Aunt/Uncle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowAddElderModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddElder}>Add Elder</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
