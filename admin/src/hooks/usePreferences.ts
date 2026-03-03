import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/utils/api-client'

export interface UserPreferences {
  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  
  // Privacy & Accessibility
  accessibilityLargeFonts: boolean
  accessibilityHighContrast: boolean
  accessibilityVoiceEnabled: boolean
  preferredLanguage: string
  
  // Elder-specific preferences
  healthCheckInFrequency?: 'daily' | 'weekly' | 'custom' // How often reminder
  emergencyContactsSetup?: boolean
  
  // Volunteer-specific preferences
  maxCompanionshipHoursPerWeek?: number
  preferredActivityTypes?: string[]
  availabilityDays?: string[]
  
  // Family-specific preferences
  notifyOnElderActivity?: boolean
  shareMedicationReminders?: boolean
  
  // Data & Account
  dataSharingConsent: boolean
  marketingEmails: boolean
  twoFactorEnabled: boolean
}

export const usePreferences = () => {
  const { user, updateUserProfile } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    accessibilityLargeFonts: false,
    accessibilityHighContrast: false,
    accessibilityVoiceEnabled: false,
    preferredLanguage: 'en',
    dataSharingConsent: true,
    marketingEmails: false,
    twoFactorEnabled: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Load preferences from backend
  const loadPreferences = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to fetch preferences from backend
      const response = await apiClient.request('/user-preferences', {
        method: 'GET'
      })

      if (response.success && response.data) {
        setPreferences(prev => ({
          ...prev,
          ...response.data
        }))
      }
    } catch (err) {
      console.error('Error loading preferences:', err)
      // Use defaults if endpoint not available
    } finally {
      setLoading(false)
    }
  }

  // Save preferences to backend
  const savePreferences = async (updates: Partial<UserPreferences>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    setSaved(false)
    
    try {
      // Update local state first
      const newPreferences = { ...preferences, ...updates }
      setPreferences(newPreferences)

      // Save to backend
      const response = await apiClient.request('/user-preferences', {
        method: 'PUT',
        body: JSON.stringify(updates)
      })

      if (response.success) {
        setSaved(true)
        // Auto-dismiss saved indicator
        setTimeout(() => setSaved(false), 3000)
        return true
      } else {
        setError(response.error || 'Failed to save preferences')
        return false
      }
    } catch (err) {
      console.error('Error saving preferences:', err)
      setError('Failed to save preferences')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update notification preferences
  const updateNotifications = async (
    emailNotifications: boolean,
    smsNotifications: boolean,
    pushNotifications: boolean
  ): Promise<boolean> => {
    return savePreferences({
      emailNotifications,
      smsNotifications,
      pushNotifications
    })
  }

  // Update accessibility preferences
  const updateAccessibility = async (
    largeFonts: boolean,
    highContrast: boolean,
    voiceEnabled: boolean,
    language: string
  ): Promise<boolean> => {
    return savePreferences({
      accessibilityLargeFonts: largeFonts,
      accessibilityHighContrast: highContrast,
      accessibilityVoiceEnabled: voiceEnabled,
      preferredLanguage: language
    })
  }

  // Update privacy preferences
  const updatePrivacy = async (
    dataSharingConsent: boolean,
    marketingEmails: boolean
  ): Promise<boolean> => {
    return savePreferences({
      dataSharingConsent,
      marketingEmails
    })
  }

  // Update role-specific preferences
  const updateRolePreferences = async (rolePrefs: Record<string, any>): Promise<boolean> => {
    return savePreferences(rolePrefs)
  }

  useEffect(() => {
    loadPreferences()
  }, [user?.id])

  return {
    preferences,
    loading,
    error,
    saved,
    savePreferences,
    updateNotifications,
    updateAccessibility,
    updatePrivacy,
    updateRolePreferences
  }
}
