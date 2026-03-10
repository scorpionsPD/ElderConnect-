import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '@/utils/api-client'

export interface User {
  id: string
  email: string
  first_name: string
  role: string
  phone_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  profile_picture_url?: string
  bio?: string
  address?: string
  postcode?: string
  latitude?: number
  longitude?: number
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, otp: string) => Promise<User | undefined>
  signup: (email: string, role: string, first_name: string, phone_number?: string) => Promise<User | undefined>
  sendOTP: (email: string) => Promise<string | null>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  getProfile: () => Promise<User | undefined>
  updateUserProfile: (updates: Partial<User>) => Promise<User | undefined>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMockAuthEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true' &&
    typeof window !== 'undefined' &&
    (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const savedUserData = localStorage.getItem('user_data')
        
        if (token && savedUserData) {
          try {
            // Try to restore saved user data
            const userData = JSON.parse(savedUserData)
            apiClient.setToken(token)
            if (userData?.id) {
              apiClient.setUserId(userData.id)
            }
            setUser(userData)
            console.log('[DEV] Restored user from localStorage:', userData)
            setIsLoading(false)
            return
          } catch (parseError) {
            console.warn('Failed to parse saved user data:', parseError)
            localStorage.removeItem('user_data')
          }
        }

        // Signup flow can persist user_data without a JWT token.
        if (!token && savedUserData) {
          try {
            const userData = JSON.parse(savedUserData)
            if (userData?.id) {
              apiClient.setUserId(userData.id)
            }
            setUser(userData)
            setIsLoading(false)
            return
          } catch (parseError) {
            console.warn('Failed to parse saved signup user data:', parseError)
            localStorage.removeItem('user_data')
          }
        }
        
        if (token) {
          // Check if it's a dev test token
          if (isMockAuthEnabled && token.startsWith('dev-test-token-')) {
            // Set a mock user for development
            setUser({
              id: 'dev-test-user',
              email: 'test@elderconnect.dev',
              first_name: 'Test',
              role: 'elder',
              phone_number: '555-0000'
            })
            setIsLoading(false)
            return
          }

          apiClient.setToken(token)
          
          // Try to fetch user profile
          const response = await apiClient.getProfile()
          if (response.success && response.data) {
            setUser(response.data)
            // Save to localStorage for persistence
            localStorage.setItem('user_data', JSON.stringify(response.data))
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            apiClient.clearToken()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        apiClient.clearToken()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isMockAuthEnabled])

  const sendOTP = async (email: string): Promise<string | null> => {
    setIsLoading(true)
    try {
      const response = await apiClient.sendOTP(email)
      if (!response.success) {
        throw new Error(response.error || 'Failed to send OTP')
      }

      // In development, backend may return OTP for testing.
      return response.data?.otp || null
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, otp: string): Promise<User | undefined> => {
    setIsLoading(true)
    try {
      // Verify OTP via backend API
      const response = await apiClient.verifyOTP(otp, email)
      if (!response.success) {
        throw new Error(response.error || 'Invalid OTP')
      }

      // Set token
      const token = response.data?.token
      if (token) {
        apiClient.setToken(token)
        localStorage.setItem('auth_token', token)
      }

      const verifiedUserId = response.data?.user_id
      if (verifiedUserId) {
        apiClient.setUserId(verifiedUserId)
      }

      // If new user, return undefined to indicate signup flow is needed
      if (response.data?.is_new_user) {
        console.log('New user detected, signup flow needed')
        return undefined
      }

      // Build minimum session user from verify-otp response so login is not
      // blocked by get-profile CORS/header mismatches.
      const fallbackUser: User = {
        id: response.data?.user_id || `user-${Date.now()}`,
        email: response.data?.email || email,
        first_name: (response.data?.email || email).split('@')[0] || 'User',
        role: response.data?.role || 'ELDER',
        phone_number: ''
      }

      // Existing user - fetch full profile (best effort)
      const profileResponse = await apiClient.getProfile()
      console.log('Profile response:', profileResponse)
      if (profileResponse.success && profileResponse.data) {
        if ((profileResponse.data as User).id) {
          apiClient.setUserId((profileResponse.data as User).id)
        }
        localStorage.setItem('user_data', JSON.stringify(profileResponse.data))
        setUser(profileResponse.data)
        return profileResponse.data
      }

      // Fallback to verified OTP user identity if profile call fails.
      localStorage.setItem('user_data', JSON.stringify(fallbackUser))
      setUser(fallbackUser)
      return fallbackUser
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    email: string,
    role: string,
    first_name: string,
    phone_number?: string
  ): Promise<User | undefined> => {
    setIsLoading(true)
    try {
      // Always try backend signup first
      console.log('[AUTH] Calling backend signup API')
      try {
        const response = await apiClient.signup(email, role, first_name, phone_number)
        if (response.success) {
          const userData: User = {
            id: response.data?.user?.id || 'new-user',
            email,
            first_name,
            role,
            phone_number
          }
          
          const token = response.data?.token
          if (token) {
            apiClient.setToken(token)
            localStorage.setItem('auth_token', token)
          }

          // Keep userId for flows where backend signup doesn't return a JWT.
          if (response.data?.user?.id) {
            apiClient.setUserId(response.data.user.id)
            console.log('[AUTH] Set userId from signup response:', response.data.user.id)
          }
          
          localStorage.setItem('user_data', JSON.stringify(userData))
          setUser(userData)
          return userData
        }

        // Preserve backend-provided validation/business errors for UI.
        if (!isMockAuthEnabled) {
          throw new Error(response.error || 'Signup failed. Please try again.')
        }
      } catch (apiError) {
        console.error('[AUTH] Backend signup API failed:', apiError)

        if (!isMockAuthEnabled) {
          throw new Error(
            apiError instanceof Error
              ? apiError.message
              : 'Signup failed. Please try again.'
          )
        }
      }

      // Local mock signup fallback (explicitly opt-in only)
      console.log('[DEV] Creating user locally (mock auth enabled)')
      
      // Generate a proper JWT token format
      const userId = `user-${Date.now()}`
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const payload = btoa(JSON.stringify({ 
        user_id: userId,
        email: email,
        iss: 'supabase',
        role: 'authenticated'
      }))
      const signature = 'dev_signature'
      const mockToken = `${header}.${payload}.${signature}`
      apiClient.setToken(mockToken)
      
      // User created in dev mode - stored locally
      const userData: User = {
        id: `user-${Date.now()}`,
        email,
        first_name,
        role,
        phone_number
      }
      localStorage.setItem('user_data', JSON.stringify(userData))
      setUser(userData)
      
      console.log('[DEV] User stored in localStorage. In production, this would be in database.')
      return userData
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.clearToken()
    localStorage.removeItem('auth_token')
    // Keep user_data in localStorage so role/profile data is restored on re-login
    // localStorage.removeItem('user_data')
  }

  const updateUser = (updates: Partial<User>) => {
    setUser((current) => {
      const baseUser: User = current || {
        id: `user-${Date.now()}`,
        email: updates.email || '',
        first_name: updates.first_name || '',
        role: updates.role || 'ELDER',
        phone_number: updates.phone_number || ''
      }
      const nextUser = { ...baseUser, ...updates }
      localStorage.setItem('user_data', JSON.stringify(nextUser))
      return nextUser
    })
  }

  const getProfile = async (): Promise<User | undefined> => {
    try {
      const response = await apiClient.getProfile()
      if (response.success && response.data) {
        return response.data as User
      }
      return undefined
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      return undefined
    }
  }

  const updateUserProfile = async (updates: Partial<User>): Promise<User | undefined> => {
    try {
      // Update locally first
      updateUser(updates)
      
      // Try to update on backend
      const response = await apiClient.updateProfile(updates)
      if (response.success && response.data) {
        return response.data as User
      }
      return user || undefined
    } catch (error) {
      console.error('Failed to update profile:', error)
      return user || undefined
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    sendOTP,
    logout,
    updateUser,
    getProfile,
    updateUserProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
