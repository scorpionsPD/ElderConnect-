'use client'

import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import apiClient from '@/utils/api-client'
import Tabs from '@/components/Tabs'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import HealthCheckinModal, { HealthCheckinData } from '@/components/HealthCheckinModal'
import CompanionRequestModal, { CompanionRequestData } from '@/components/CompanionRequestModal'
import { useStats, useHealthCheckins, useCompanionRequests, usePreferences, useCompanionMessages, useFamilyMessages } from '@/hooks'
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
  Edit2,
  Eye,
  Save,
  Check,
  UserPlus,
  Trash2,
  Upload,
} from 'lucide-react'

type TabType = 'overview' | 'companions' | 'health' | 'family' | 'settings'

type FamilyConnection = {
  id: string
  elder_user_id: string
  family_user_id: string
  relationship: string
  access_level: string
  verified: boolean
  added_date: string
  family_member?: {
    id: string
    first_name: string
    email: string
    role: string
  }
}

type FamilyInvitation = {
  id: string
  family_email: string
  relationship: string
  access_level: string
  status: string
  resend_count: number
  resend_available: boolean
  last_sent_at?: string
  created_at: string
}

// Placeholder data for when APIs don't return data yet
const EMPTY_ELDER_PROFILE = {
  id: '',
  email: '',
  first_name: '',
  role: 'ELDER',
  phone_number: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  profile_picture_url: '',
}

const elderActivityOptions = [
  { id: 'conversation', label: 'Friendly Conversation' },
  { id: 'reading', label: 'Reading Together' },
  { id: 'music', label: 'Music & Hobbies' },
  { id: 'games', label: 'Games & Activities' },
  { id: 'errands', label: 'Errands Support' },
  { id: 'transport', label: 'Transport Help' },
]

const elderPreferredTimeOptions = [
  { id: 'morning', label: 'Morning', description: '8 AM - 12 PM' },
  { id: 'afternoon', label: 'Afternoon', description: '12 PM - 5 PM' },
  { id: 'evening', label: 'Evening', description: '5 PM - 8 PM' },
  { id: 'flexible', label: 'Flexible', description: 'Anytime works' },
]

export default function ElderDashboard() {
  const router = useRouter()
  const { user, updateUserProfile } = useAuth()
  const toast = useToast()
  const stats = useStats()
  const { checkins, submitCheckin, fetchCheckins } = useHealthCheckins()
  const { requests, createRequest, fetchRequests, completeRequest } = useCompanionRequests()
  const { messages, loading: messagesLoading, sending: messageSending, error: messagesError, fetchMessages, sendMessage } = useCompanionMessages()
  const { messages: familyMessages, loading: familyMessagesLoading, sending: sendingFamilyMessage, error: familyMessagesError, fetchMessages: fetchFamilyMessages, sendMessage: sendFamilyMessage } = useFamilyMessages()
  const { preferences, updateNotifications, updateAccessibility, updatePrivacy, updateRolePreferences, saved } = usePreferences()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHealthCheckin, setShowHealthCheckin] = useState(false)
  const [showCompanionRequest, setShowCompanionRequest] = useState(false)
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL')
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(user || EMPTY_ELDER_PROFILE)
  const [avatarPreview, setAvatarPreview] = useState(user?.profile_picture_url || '')
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergency_contact_name || '')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergency_contact_phone || '')
  const [savingEmergencyContact, setSavingEmergencyContact] = useState(false)
  const [familyConnections, setFamilyConnections] = useState<FamilyConnection[]>([])
  const [familyInvitations, setFamilyInvitations] = useState<FamilyInvitation[]>([])
  const [familyLoading, setFamilyLoading] = useState(false)
  const [familyError, setFamilyError] = useState<string | null>(null)
  const [newFamilyEmail, setNewFamilyEmail] = useState('')
  const [newFamilyRelationship, setNewFamilyRelationship] = useState('CHILD')
  const [newFamilyAccessLevel, setNewFamilyAccessLevel] = useState('VIEW_ALL')
  const [addingFamilyMember, setAddingFamilyMember] = useState(false)
  const [editingFamilyConnectionId, setEditingFamilyConnectionId] = useState<string | null>(null)
  const [editFamilyRelationship, setEditFamilyRelationship] = useState('CHILD')
  const [editFamilyAccessLevel, setEditFamilyAccessLevel] = useState('VIEW_ALL')
  const [savingFamilyEdit, setSavingFamilyEdit] = useState(false)
  const [selectedCompanionCategories, setSelectedCompanionCategories] = useState<string[]>([])
  const [selectedPreferredTimeSlots, setSelectedPreferredTimeSlots] = useState<string[]>([])
  const [savingCompanionPreferences, setSavingCompanionPreferences] = useState(false)
  const [familyChatInput, setFamilyChatInput] = useState('')
  const [triggeringEmergency, setTriggeringEmergency] = useState(false)
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null)
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

  const fetchFamilyConnections = async () => {
    setFamilyLoading(true)
    setFamilyError(null)
    try {
      const response = await apiClient.getElderFamilyMembers()
      if (!response.success) {
        setFamilyError(response.error || 'Failed to load family connections')
        setFamilyConnections([])
        setFamilyInvitations([])
        return
      }
      setFamilyConnections(Array.isArray(response.data) ? response.data : [])
      const invitations = Array.isArray((response as any).invitations) ? (response as any).invitations : []
      setFamilyInvitations(invitations as FamilyInvitation[])
    } catch (error) {
      setFamilyError('Failed to load family connections')
      setFamilyConnections([])
      setFamilyInvitations([])
    } finally {
      setFamilyLoading(false)
    }
  }

  // Load user data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        if (user && user.role?.toLowerCase() !== 'elder') {
          const target = user.role?.toLowerCase() === 'volunteer'
            ? '/volunteer-dashboard'
            : user.role?.toLowerCase() === 'family'
            ? '/family-dashboard'
            : '/dashboard'
          router.replace(target)
          return
        }
        if (user) {
          setProfileData(user)
          setEmergencyContactName(user.emergency_contact_name || '')
          setEmergencyContactPhone(user.emergency_contact_phone || '')
          await fetchFamilyConnections()
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
    if (tab === 'companions') setActiveTab('companions')
    if (tab === 'health') setActiveTab('health')
    if (tab === 'family') setActiveTab('family')
    if (tab === 'settings') setActiveTab('settings')
    if (tab === 'overview') setActiveTab('overview')
  }, [router.query.tab])

  useEffect(() => {
    setSelectedCompanionCategories(Array.isArray(preferences.preferredActivityTypes) ? preferences.preferredActivityTypes : [])
    setSelectedPreferredTimeSlots(Array.isArray(preferences.availabilityDays) ? preferences.availabilityDays : [])
  }, [preferences.preferredActivityTypes, preferences.availabilityDays])

  useEffect(() => {
    if ((activeTab === 'overview' || activeTab === 'family') && user?.id) {
      fetchFamilyMessages(user.id)
    }
  }, [activeTab, user?.id, fetchFamilyMessages])

  const toggleValue = (current: string[], value: string, set: (next: string[]) => void) => {
    if (current.includes(value)) {
      set(current.filter((item) => item !== value))
    } else {
      set([...current, value])
    }
  }

  const mapMoodToApi = (mood: HealthCheckinData['mood']): string => {
    if (mood === 'Happy') return 'HAPPY'
    if (mood === 'Sad') return 'SAD'
    return 'OKAY'
  }

  const mapServiceTypeToApi = (serviceType: string): string => {
    const normalized = serviceType.toLowerCase()
    if (normalized.includes('shopping')) return 'SHOPPING'
    if (normalized.includes('doctor')) return 'VISIT'
    if (normalized.includes('social')) return 'SOCIAL_ACTIVITY'
    if (normalized.includes('errand')) return 'ERRANDS'
    if (normalized.includes('technology')) return 'OTHER'
    return 'OTHER'
  }

  const handleHealthCheckinSubmit = async (data: HealthCheckinData) => {
    try {
      const created = await submitCheckin(
        mapMoodToApi(data.mood),
        Math.max(1, Number(data.energy)),
        Number(data.sleep),
        true,
        data.moodDetails.trim() || undefined
      )

      if (!created) {
        toast.error('Failed to submit health check-in')
        return
      }

      await fetchCheckins()
      toast.success('Health check-in submitted successfully!')
      setShowHealthCheckin(false)
      setActiveTab('health')
    } catch (error) {
      toast.error('Failed to submit health check-in')
    }
  }

  const handleCompanionRequestSubmit = async (data: CompanionRequestData) => {
    try {
      const preferredStart = data.date && data.time ? new Date(`${data.date}T${data.time}`).toISOString() : undefined
      const preferredEnd = preferredStart
        ? new Date(new Date(preferredStart).getTime() + data.duration * 60 * 60 * 1000).toISOString()
        : undefined

      const created = await createRequest(
        mapServiceTypeToApi(data.serviceType),
        data.description.trim(),
        preferredStart,
        preferredEnd,
        data.locationLatitude,
        data.locationLongitude
      )

      if (!created) {
        toast.error('Failed to submit companion request')
        return
      }

      await fetchRequests()
      toast.success('Companion request submitted successfully!')
      setShowCompanionRequest(false)
      setActiveTab('companions')
    } catch (error) {
      toast.error('Failed to submit companion request')
    }
  }

  const handleCompleteCompanionRequest = async (requestId: string) => {
    const completed = await completeRequest(requestId)
    if (!completed) {
      toast.error('Failed to complete companion request')
      return
    }
    await fetchRequests()
    toast.success('Companion request marked as completed')
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

  const handleSaveEmergencyContact = async () => {
    const name = emergencyContactName.trim()
    const phone = emergencyContactPhone.trim()

    if ((name && !phone) || (!name && phone)) {
      toast.error('Please provide both emergency contact name and phone')
      return
    }

    setSavingEmergencyContact(true)
    try {
      const updated = await updateUserProfile({
        emergency_contact_name: name,
        emergency_contact_phone: phone
      })

      if (!updated) {
        toast.error('Failed to save emergency contact')
        return
      }

      setProfileData(updated)
      setEmergencyContactName(updated.emergency_contact_name || '')
      setEmergencyContactPhone(updated.emergency_contact_phone || '')
      toast.success(name && phone ? 'Emergency contact saved' : 'Emergency contact removed')
    } catch (error) {
      toast.error('Failed to save emergency contact')
    } finally {
      setSavingEmergencyContact(false)
    }
  }

  const handleEmergencyAlert = async () => {
    const phone = (profileData?.emergency_contact_phone || '').trim()
    if (!phone) {
      toast.error('Add an emergency contact phone first')
      setActiveTab('settings')
      return
    }

    setTriggeringEmergency(true)
    try {
      const response = await apiClient.triggerEmergencyAlert(
        'HEALTH_EMERGENCY',
        'Emergency alert triggered from elder dashboard'
      )

      if (!response.success) {
        toast.error(response.error || 'Failed to trigger emergency alert')
        return
      }

      toast.success('Emergency alert sent. Calling emergency contact now.')
      if (typeof window !== 'undefined') {
        const dialNumber = phone.replace(/\s+/g, '')
        window.location.href = `tel:${dialNumber}`
      }
    } finally {
      setTriggeringEmergency(false)
    }
  }

  const handleSendFamilyMessage = async () => {
    if (!user?.id) {
      toast.error('Unable to send message')
      return
    }
    const sent = await sendFamilyMessage(user.id, familyChatInput)
    if (!sent) {
      toast.error('Failed to send family message')
      return
    }
    setFamilyChatInput('')
  }

  const handleAddFamilyMember = async () => {
    if (!newFamilyEmail.trim()) {
      toast.error('Please enter family member email')
      return
    }
    setAddingFamilyMember(true)
    try {
      const response = await apiClient.addElderFamilyMember(
        newFamilyEmail.trim(),
        newFamilyRelationship,
        newFamilyAccessLevel
      )
      if (!response.success) {
        toast.error(response.error || 'Failed to add family member')
        return
      }

      if (response.data) {
        setFamilyConnections([response.data as FamilyConnection, ...familyConnections])
      } else if ((response as any).invitation) {
        setFamilyInvitations((prev) => [((response as any).invitation as FamilyInvitation), ...prev])
      }
      setNewFamilyEmail('')
      setNewFamilyRelationship('CHILD')
      setNewFamilyAccessLevel('VIEW_ALL')
      toast.success(response.message || 'Family invitation sent successfully')
    } finally {
      setAddingFamilyMember(false)
    }
  }

  const startEditFamilyConnection = (connection: FamilyConnection) => {
    setEditingFamilyConnectionId(connection.id)
    setEditFamilyRelationship(connection.relationship || 'CHILD')
    setEditFamilyAccessLevel(connection.access_level || 'VIEW_ALL')
  }

  const cancelEditFamilyConnection = () => {
    setEditingFamilyConnectionId(null)
    setEditFamilyRelationship('CHILD')
    setEditFamilyAccessLevel('VIEW_ALL')
  }

  const handleSaveFamilyConnection = async () => {
    if (!editingFamilyConnectionId) return
    setSavingFamilyEdit(true)
    try {
      const response = await apiClient.updateElderFamilyMember(editingFamilyConnectionId, {
        relationship: editFamilyRelationship,
        access_level: editFamilyAccessLevel
      })
      if (!response.success || !response.data) {
        toast.error(response.error || 'Failed to update family member')
        return
      }

      const updated = response.data as FamilyConnection
      setFamilyConnections((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      )
      cancelEditFamilyConnection()
      toast.success('Family member updated')
    } finally {
      setSavingFamilyEdit(false)
    }
  }

  const handleRemoveFamilyConnection = async (connectionId: string) => {
    const response = await apiClient.removeElderFamilyMember(connectionId)
    if (!response.success) {
      toast.error(response.error || 'Failed to remove family member')
      return
    }
    setFamilyConnections((prev) => prev.filter((item) => item.id !== connectionId))
    toast.success('Family member removed')
  }

  const handleResendInvitation = async (invitationId: string) => {
    setResendingInvitationId(invitationId)
    try {
      const response = await apiClient.resendElderFamilyInvitation(invitationId)
      if (!response.success) {
        toast.error(response.error || 'Failed to resend invitation')
        return
      }

      const updatedInvite = (response as any).invitation as FamilyInvitation | undefined
      if (updatedInvite) {
        setFamilyInvitations((prev) =>
          prev.map((item) => (item.id === invitationId ? updatedInvite : item))
        )
      }
      toast.success(response.message || 'Invitation resent')
    } finally {
      setResendingInvitationId(null)
    }
  }

  const handleSaveCompanionPreferences = async () => {
    setSavingCompanionPreferences(true)
    try {
      const ok = await updateRolePreferences({
        preferredActivityTypes: selectedCompanionCategories,
        availabilityDays: selectedPreferredTimeSlots
      })
      if (!ok) {
        toast.error('Failed to save companion preferences')
        return
      }
      toast.success('Companion preferences saved')
    } finally {
      setSavingCompanionPreferences(false)
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
  const prioritizedCompanionRequests = [
    ...filteredCompanionRequests.filter(
      (r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'ELDER'
    ),
    ...filteredCompanionRequests.filter(
      (r) => !((r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'ELDER')
    ),
  ]

  const getRequestBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (status === 'PENDING') return 'warning'
    if (status === 'ACCEPTED' || status === 'COMPLETED') return 'success'
    if (status === 'IN_PROGRESS') return 'info'
    if (status === 'CANCELLED') return 'error'
    return 'default'
  }

  const canChatOnRequest = (status: string) => ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)
  const formatPreferredStart = (preferredStart?: string, requestedDate?: string) => {
    if (!preferredStart) return null

    const timeOnlyMatch = preferredStart.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
    if (timeOnlyMatch) {
      const baseDate = requestedDate ? new Date(requestedDate) : null
      if (baseDate && !Number.isNaN(baseDate.getTime())) {
        const [, hh, mm, ss = '00'] = timeOnlyMatch
        baseDate.setHours(Number(hh), Number(mm), Number(ss), 0)
        return baseDate.toLocaleString()
      }
      return preferredStart
    }

    const parsed = new Date(preferredStart)
    if (Number.isNaN(parsed.getTime())) return preferredStart
    return parsed.toLocaleString()
  }
  const completionNeedsElder = requests.filter(
    (r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'ELDER'
  ).length
  const completionWaitingOnVolunteer = requests.filter(
    (r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'VOLUNTEER'
  ).length

  const hasEmergencyContact = Boolean(profileData?.emergency_contact_name && profileData?.emergency_contact_phone)

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
                  <p className="text-xs text-amber-600 mt-1">Need your completion: {completionNeedsElder}</p>
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
                <Card className="border-primary-200 bg-primary-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900">A gentle way to support our care community</h3>
                      <p className="text-sm text-primary-800 mt-1">
                        If you feel comfortable, your contribution helps us continue companion visits and wellness support for elders.
                      </p>
                    </div>
                    <Link href="/donate" className="sm:flex-shrink-0">
                      <Button className="w-full sm:w-auto flex items-center justify-center gap-2" variant="secondary">
                        <Heart className="w-4 h-4" />
                        Support with a Donation
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => setShowHealthCheckin(true)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Health Check-in
                    </Button>
                    <Button 
                      onClick={() => setShowCompanionRequest(true)}
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

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Family Group Chat</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Share updates with invited family members from your dashboard.
                  </p>
                  {familyMessagesError && <p className="text-sm text-red-600 mb-2">{familyMessagesError}</p>}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {familyMessagesLoading ? (
                      <p className="text-sm text-gray-600">Loading family messages...</p>
                    ) : familyMessages.length === 0 ? (
                      <p className="text-sm text-gray-600">No family messages yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {familyMessages.map((message) => (
                          <div key={message.id} className="text-sm">
                            <p className="font-medium text-gray-900">
                              {message.sender?.first_name || 'User'}
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
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={familyChatInput}
                      onChange={(e) => setFamilyChatInput(e.target.value)}
                      placeholder="Send message to family..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button onClick={handleSendFamilyMessage} disabled={sendingFamilyMessage || !familyChatInput.trim()}>
                      {sendingFamilyMessage ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-red-200 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Help</h3>
                  <p className="text-sm text-red-700 mb-3">
                    Press once to alert all family members by email and immediately open a call to your emergency contact.
                  </p>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleEmergencyAlert}
                    disabled={triggeringEmergency}
                  >
                    {triggeringEmergency ? 'Triggering Alert...' : 'Emergency Alert & Call'}
                  </Button>
                </Card>

                {/* Emergency Contacts */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
                  {hasEmergencyContact ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-800">
                        <UserPlus className="w-4 h-4 text-gray-500" />
                        <span>{profileData.emergency_contact_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-800">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{profileData.emergency_contact_phone}</span>
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full mt-2"
                        onClick={() => setActiveTab('settings')}
                      >
                        Edit Contact
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">No emergency contacts configured</p>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => setActiveTab('settings')}
                      >
                        Add Contact
                      </Button>
                    </div>
                  )}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="e.g. +44 7700 900123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleSaveEmergencyContact}
                      disabled={savingEmergencyContact}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingEmergencyContact ? 'Saving...' : 'Save Contact'}
                    </Button>
                    {(emergencyContactName || emergencyContactPhone) && (
                      <Button
                        variant="secondary"
                        disabled={savingEmergencyContact}
                        onClick={() => {
                          setEmergencyContactName('')
                          setEmergencyContactPhone('')
                        }}
                      >
                        Clear Form
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    This contact is shown in your dashboard and used when emergency workflows are triggered.
                  </p>
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
                      onChange={(e) => updatePrivacy(e.target.checked, preferences.marketingEmails)}
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
                      onChange={(e) => updatePrivacy(preferences.dataSharingConsent, e.target.checked)}
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

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Companion Preferences</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Activity Categories</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {elderActivityOptions.map((option) => {
                        const isSelected = selectedCompanionCategories.includes(option.id)
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleValue(selectedCompanionCategories, option.id, setSelectedCompanionCategories)}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-left relative ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50 shadow-md scale-[1.02]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-medium text-sm text-gray-900">{option.label}</span>
                            {isSelected && <Check className="w-4 h-4 absolute top-2 right-2 text-primary-600" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Time Slots</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {elderPreferredTimeOptions.map((option) => {
                        const isSelected = selectedPreferredTimeSlots.includes(option.id)
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleValue(selectedPreferredTimeSlots, option.id, setSelectedPreferredTimeSlots)}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-left relative ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50 shadow-md scale-[1.02]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-medium text-sm text-gray-900">{option.label}</span>
                            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                            {isSelected && <Check className="w-4 h-4 absolute top-2 right-2 text-primary-600" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <Button onClick={handleSaveCompanionPreferences} disabled={savingCompanionPreferences}>
                      {savingCompanionPreferences ? 'Saving...' : 'Save Companion Preferences'}
                    </Button>
                  </div>
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
              {completionNeedsElder > 0 && (
                <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-2">Needs Your Confirmation ({completionNeedsElder})</p>
                  <div className="space-y-2">
                    {prioritizedCompanionRequests
                      .filter((r) => (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') && r.completion?.waiting_for === 'ELDER')
                      .map((request) => (
                        <div key={`confirm-${request.id}`} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-amber-900">
                            {request.activity_type} • {request.description || 'No description'}
                          </span>
                          <Button
                            variant="secondary"
                            onClick={() => handleCompleteCompanionRequest(request.id)}
                          >
                            Confirm Complete
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
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
                      onClick={() => setShowCompanionRequest(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Create Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prioritizedCompanionRequests.map((request) => (
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
                        {['ACCEPTED', 'IN_PROGRESS'].includes(request.status) && (
                          <div className="mt-2">
                            {request.completion?.waiting_for === 'VOLUNTEER' ? (
                              <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                Completion requested. Waiting for volunteer confirmation.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {request.completion?.waiting_for === 'ELDER' && (
                                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    Volunteer requested completion. Please confirm to finish this request.
                                  </p>
                                )}
                                <Button
                                  variant="secondary"
                                  onClick={() => handleCompleteCompanionRequest(request.id)}
                                >
                                  {request.completion?.waiting_for === 'ELDER' ? 'Confirm Complete' : 'Request Completion'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                          {request.preferred_time_start && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatPreferredStart(request.preferred_time_start, request.requested_date)}
                            </div>
                          )}
                          {request.location_latitude && request.location_longitude && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Location set
                            </div>
                          )}
                        </div>

                        {canChatOnRequest(request.status) && (
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              variant="secondary"
                              onClick={() => handleOpenChat(request.id)}
                            >
                              {activeChatRequestId === request.id ? 'Hide Chat' : 'Open Chat'}
                            </Button>

                            {activeChatRequestId === request.id && (
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
                                            {message.sender?.first_name || (message.sender_id === request.elder_id ? 'You' : 'Volunteer')}
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
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              </div>
              {completionWaitingOnVolunteer > 0 && (
                <p className="text-xs text-blue-700 mt-3">
                  Waiting on volunteer confirmation for {completionWaitingOnVolunteer} request(s).
                </p>
              )}
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
                      onClick={() => setShowHealthCheckin(true)}
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

          {/* Family Tab */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Family Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="email"
                    value={newFamilyEmail}
                    onChange={(e) => setNewFamilyEmail(e.target.value)}
                    placeholder="family@example.com"
                    className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={newFamilyRelationship}
                    onChange={(e) => setNewFamilyRelationship(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="CHILD">Child</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="GRANDCHILD">Grandchild</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <select
                    value={newFamilyAccessLevel}
                    onChange={(e) => setNewFamilyAccessLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="VIEW_HEALTH_ONLY">View Health Only</option>
                    <option value="VIEW_ALL">View All</option>
                    <option value="EDIT_PROFILE">Edit Profile</option>
                  </select>
                </div>
                <div className="mt-3">
                  <Button onClick={handleAddFamilyMember} disabled={addingFamilyMember}>
                    {addingFamilyMember ? 'Adding...' : 'Add Family Member'}
                  </Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invited Family Members</h3>
                {familyInvitations.length === 0 ? (
                  <p className="text-sm text-gray-600">No pending invitations.</p>
                ) : (
                  <div className="space-y-3">
                    {familyInvitations.map((invite) => (
                      <div key={invite.id} className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{invite.family_email}</p>
                        <p className="text-xs text-gray-600">
                          {invite.relationship} · {invite.access_level} · Sent {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Resend used: {invite.resend_count}/1
                        </p>
                        <div className="mt-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleResendInvitation(invite.id)}
                            disabled={!invite.resend_available || resendingInvitationId === invite.id}
                          >
                            {resendingInvitationId === invite.id
                              ? 'Resending...'
                              : invite.resend_available
                                ? 'Resend Invitation'
                                : 'Resend Limit Reached'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Family Connections</h3>
                  <Button variant="secondary" onClick={fetchFamilyConnections} disabled={familyLoading}>
                    Refresh
                  </Button>
                </div>

                {familyError && <p className="text-sm text-red-600 mb-3">{familyError}</p>}

                {familyLoading ? (
                  <p className="text-sm text-gray-600">Loading family connections...</p>
                ) : familyConnections.length === 0 ? (
                  <p className="text-sm text-gray-600">No family members connected yet.</p>
                ) : (
                  <div className="space-y-3">
                    {familyConnections.map((connection) => (
                      <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {connection.family_member?.first_name || connection.family_user_id}
                            </p>
                            <p className="text-sm text-gray-600">{connection.family_member?.email || 'No email'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Added: {new Date(connection.added_date).toLocaleDateString()}
                            </p>
                          </div>

                          {editingFamilyConnectionId === connection.id ? (
                            <div className="flex flex-col gap-2 min-w-[240px]">
                              <select
                                value={editFamilyRelationship}
                                onChange={(e) => setEditFamilyRelationship(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="CHILD">Child</option>
                                <option value="SPOUSE">Spouse</option>
                                <option value="SIBLING">Sibling</option>
                                <option value="GRANDCHILD">Grandchild</option>
                                <option value="OTHER">Other</option>
                              </select>
                              <select
                                value={editFamilyAccessLevel}
                                onChange={(e) => setEditFamilyAccessLevel(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="VIEW_HEALTH_ONLY">View Health Only</option>
                                <option value="VIEW_ALL">View All</option>
                                <option value="EDIT_PROFILE">Edit Profile</option>
                              </select>
                              <div className="flex gap-2">
                                <Button onClick={handleSaveFamilyConnection} disabled={savingFamilyEdit}>
                                  {savingFamilyEdit ? 'Saving...' : 'Save'}
                                </Button>
                                <Button variant="secondary" onClick={cancelEditFamilyConnection} disabled={savingFamilyEdit}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-start md:items-end gap-2">
                              <Badge variant="default">{connection.relationship}</Badge>
                              <Badge variant="info">{connection.access_level}</Badge>
                              <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => startEditFamilyConnection(connection)}>
                                  Edit
                                </Button>
                                <Button variant="secondary" onClick={() => handleRemoveFamilyConnection(connection.id)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>
          )}
        </div>
      </Layout>

      <HealthCheckinModal
        isOpen={showHealthCheckin}
        onClose={() => setShowHealthCheckin(false)}
        onSubmit={handleHealthCheckinSubmit}
      />

      <CompanionRequestModal
        isOpen={showCompanionRequest}
        onClose={() => setShowCompanionRequest(false)}
        onSubmit={handleCompanionRequestSubmit}
      />
    </>
  )
}
