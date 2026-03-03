'use client'

import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import Tabs from '@/components/Tabs'
import Button from '@/components/Button'
import Input from '@/components/Input'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Bell, 
  Eye, 
  Shield, 
  Trash2, 
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Moon,
  Sun,
  Volume2,
  Settings as SettingsIcon
} from 'lucide-react'

type TabType = 'profile' | 'notifications' | 'accessibility' | 'privacy' | 'account'

export default function SettingsPage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [loading, setLoading] = useState(false)
  const { user, updateUser } = useAuth()

  // Profile settings state
  const [profileData, setProfileData] = useState({
    fullName: user ? user.first_name || '' : '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    address: '',
    dateOfBirth: '',
    bio: user?.bio || '',
    profilePictureUrl: user?.profile_picture_url || '',
  })
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture_url || '')

  useEffect(() => {
    if (!user) return
    setProfileData({
      fullName: user.first_name || '',
      email: user.email || '',
      phone: user.phone_number || '',
      address: '',
      dateOfBirth: '',
      bio: user.bio || '',
      profilePictureUrl: user.profile_picture_url || '',
    })
    setAvatarPreview(user.profile_picture_url || '')
  }, [user])

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    companionRequests: true,
    healthReminders: true,
    familyUpdates: true,
    systemUpdates: false,
  })

  // Accessibility settings state
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    language: 'en',
  })

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'connections',
    showLocation: true,
    showAge: true,
    allowMessages: true,
    dataSharing: false,
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Eye className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'account', label: 'Account', icon: <SettingsIcon className="w-4 h-4" /> },
  ]

  const normalizeFullName = (value: string) => value.trim().replace(/\s+/g, ' ')

  const splitFullName = (value: string) => {
    const normalized = normalizeFullName(value)
    const [firstName, ...rest] = normalized.split(' ')
    return { firstName: firstName || '', lastName: rest.join(' ') }
  }

  const getInitials = () => {
    const normalized = normalizeFullName(profileData.fullName)
    if (!normalized) return 'U'
    return normalized
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setAvatarPreview(result)
      setProfileData((prev) => ({ ...prev, profilePictureUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleProfileSave = () => {
    setLoading(true)
    updateUser({
      first_name: profileData.fullName,
      email: profileData.email,
      phone_number: profileData.phone,
      bio: profileData.bio,
      profile_picture_url: profileData.profilePictureUrl || avatarPreview || '',
    })
    // Simulate API call
    setTimeout(() => {
      toast.success('Profile updated successfully!')
      setLoading(false)
    }, 500)
  }

  const handleNotificationsSave = () => {
    setLoading(true)
    setTimeout(() => {
      toast.success('Notification preferences updated!')
      setLoading(false)
    }, 500)
  }

  const handleAccessibilitySave = () => {
    setLoading(true)
    setTimeout(() => {
      toast.success('Accessibility settings updated!')
      setLoading(false)
    }, 500)
  }

  const handlePrivacySave = () => {
    setLoading(true)
    setTimeout(() => {
      toast.success('Privacy settings updated!')
      setLoading(false)
    }, 500)
  }

  const handleChangePassword = () => {
    toast.info('Password change functionality coming soon!')
  }

  const handleExportData = () => {
    toast.success('Data export initiated. You will receive an email shortly.')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion functionality coming soon!')
    }
  }

  return (
    <>
      <Head>
        <title>Settings - ElderConnect+</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
          </div>

          <Card>
            <Tabs tabs={tabs as any} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabType)} />

            <div className="mt-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>

                    <div className="flex items-center gap-6 mb-6">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Profile"
                          width={80}
                          height={80}
                          unoptimized
                          className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                          <span className="text-xl font-semibold text-gray-600">{getInitials()}</span>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Photo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                        <p className="text-xs text-gray-500 mt-2">PNG or JPG up to 2MB</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+44 123 456 7890"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <AddressAutocomplete
                          value={profileData.address}
                          onChange={(value) => setProfileData({ ...profileData, address: value })}
                          placeholder="Search your address or postcode"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      text="Save Changes"
                      icon={<Save className="h-4 w-4" />}
                      onClick={handleProfileSave}
                      loading={loading}
                    />
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">Email Notifications</div>
                            <div className="text-sm text-gray-600">Receive updates via email</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">Push Notifications</div>
                            <div className="text-sm text-gray-600">Receive push notifications on your device</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">SMS Notifications</div>
                            <div className="text-sm text-gray-600">Receive text messages for important updates</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <span className="text-gray-900">Companion Requests</span>
                        <input
                          type="checkbox"
                          checked={notificationSettings.companionRequests}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, companionRequests: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <span className="text-gray-900">Health Reminders</span>
                        <input
                          type="checkbox"
                          checked={notificationSettings.healthReminders}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, healthReminders: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <span className="text-gray-900">Family Updates</span>
                        <input
                          type="checkbox"
                          checked={notificationSettings.familyUpdates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, familyUpdates: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <span className="text-gray-900">System Updates</span>
                        <input
                          type="checkbox"
                          checked={notificationSettings.systemUpdates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      text="Save Preferences"
                      icon={<Save className="h-4 w-4" />}
                      onClick={handleNotificationsSave}
                      loading={loading}
                    />
                  </div>
                </div>
              )}

              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size
                        </label>
                        <select
                          value={accessibilitySettings.fontSize}
                          onChange={(e) => setAccessibilitySettings({ ...accessibilitySettings, fontSize: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="extra-large">Extra Large</option>
                        </select>
                      </div>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <Sun className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">High Contrast Mode</div>
                            <div className="text-sm text-gray-600">Enhance text and UI visibility</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={accessibilitySettings.highContrast}
                          onChange={(e) => setAccessibilitySettings({ ...accessibilitySettings, highContrast: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <Moon className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">Reduce Motion</div>
                            <div className="text-sm text-gray-600">Minimize animations and transitions</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={accessibilitySettings.reduceMotion}
                          onChange={(e) => setAccessibilitySettings({ ...accessibilitySettings, reduceMotion: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <Volume2 className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">Screen Reader Support</div>
                            <div className="text-sm text-gray-600">Optimize for screen readers</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={accessibilitySettings.screenReader}
                          onChange={(e) => setAccessibilitySettings({ ...accessibilitySettings, screenReader: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Globe className="h-4 w-4 inline mr-2" />
                          Language
                        </label>
                        <select
                          value={accessibilitySettings.language}
                          onChange={(e) => setAccessibilitySettings({ ...accessibilitySettings, language: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="it">Italiano</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      text="Save Settings"
                      icon={<Save className="h-4 w-4" />}
                      onClick={handleAccessibilitySave}
                      loading={loading}
                    />
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Controls</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="public">Public - Visible to everyone</option>
                          <option value="connections">Connections Only</option>
                          <option value="private">Private - Only me</option>
                        </select>
                      </div>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Show Location</div>
                          <div className="text-sm text-gray-600">Display your approximate location</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.showLocation}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, showLocation: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Show Age</div>
                          <div className="text-sm text-gray-600">Display your age on your profile</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.showAge}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, showAge: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Allow Messages</div>
                          <div className="text-sm text-gray-600">Let others send you messages</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.allowMessages}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessages: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">Data Sharing</div>
                          <div className="text-sm text-gray-600">Share anonymized data for research</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings.dataSharing}
                          onChange={(e) => setPrivacySettings({ ...privacySettings, dataSharing: e.target.checked })}
                          className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      text="Save Settings"
                      icon={<Save className="h-4 w-4" />}
                      onClick={handlePrivacySave}
                      loading={loading}
                    />
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
                    
                    <div className="space-y-4">
                      <Button
                        text="Change Password"
                        icon={<Shield className="h-4 w-4" />}
                        variant="secondary"
                        onClick={handleChangePassword}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Export Your Data</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Download a copy of all your data in a machine-readable format
                        </p>
                        <Button
                          text="Request Data Export"
                          variant="secondary"
                          size="sm"
                          onClick={handleExportData}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                    
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        text="Delete My Account"
                        icon={<Trash2 className="h-4 w-4" />}
                        variant="danger"
                        size="sm"
                        onClick={handleDeleteAccount}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Layout>
    </>
  )
}
