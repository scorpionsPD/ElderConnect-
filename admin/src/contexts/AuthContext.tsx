import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '@/utils/api-client'

export interface User {
  id: string
  email: string
  first_name: string
  role: string
  phone_number?: string
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
            setUser(userData)
            console.log('[DEV] Restored user from localStorage:', userData)
            setIsLoading(false)
            return
          } catch (parseError) {
            console.warn('Failed to parse saved user data:', parseError)
            localStorage.removeItem('user_data')
          }
        }
        
        if (token) {
          // Check if it's a dev test token
          if (token.startsWith('dev-test-token-')) {
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
  }, [])

  const sendOTP = async (email: string): Promise<string | null> => {
    setIsLoading(true)
    try {
      // For development, generate a mock OTP locally
      const mockOTP = Math.floor(1000 + Math.random() * 9000).toString()
      console.log(`[DEV] Generated OTP for ${email}: ${mockOTP}`)
      
      // Still call the API to store the OTP
      const response = await apiClient.sendOTP(email)
      if (!response.success) {
        throw new Error(response.error || 'Failed to send OTP')
      }
      
      // Return the mock OTP for display
      return mockOTP
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, otp: string): Promise<User | undefined> => {
    setIsLoading(true)
    try {
      // Optional local mock login flow (explicitly opt-in only)
      if (isMockAuthEnabled && otp.match(/^\d{4}$/)) {
        console.log('[DEV] Accepting 4-digit OTP for development')
        
        // Create a proper JWT token for development (format: header.payload.signature)
        // This allows companion-requests and other endpoints to parse user_id from the token
        const userId = `user-${Date.now()}`
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
        const payload = btoa(JSON.stringify({ 
          user_id: userId,
          email: email,
          iss: 'supabase',
          role: 'authenticated'
        }))
        const signature = 'dev_signature'
        const devToken = `${header}.${payload}.${signature}`
        
        apiClient.setToken(devToken)
        localStorage.setItem('auth_token', devToken)

        // Reuse stored user data if it matches this email (preserves role/name)
        const storedUser = localStorage.getItem('user_data')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as User
            if (parsedUser?.email === email) {
              setUser(parsedUser)
              console.log('[DEV] Restored mock user from localStorage:', parsedUser)
              return parsedUser
            }
          } catch (error) {
            console.warn('[DEV] Failed to parse stored user data:', error)
          }
        }

        // Extract first name from email
        const firstName = email.split('@')[0]

        // Create mock user with the email (no last_name for single-name users)
        const mockUser: User = {
          id: userId,
          email,
          first_name: firstName,
          last_name: '',
          role: 'ELDER',
          phone_number: ''
        }

        // Save user data to localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(mockUser))

        console.log('[DEV] Created mock user:', mockUser)
        setUser(mockUser)
        return mockUser
      }

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

      // If new user, return undefined to indicate signup flow is needed
      if (response.data?.is_new_user) {
        console.log('New user detected, signup flow needed')
        return undefined
      }

      // Existing user - fetch profile
      const profileResponse = await apiClient.getProfile()
      console.log('Profile response:', profileResponse)
      if (profileResponse.success && profileResponse.data) {
        // Save user data to localStorage
        localStorage.setItem('user_data', JSON.stringify(profileResponse.data))
        setUser(profileResponse.data)
        return profileResponse.data
      } else {
        throw new Error(profileResponse.error || 'Failed to fetch user profile')
      }
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
          }
          localStorage.setItem('user_data', JSON.stringify(userData))
          setUser(userData)
          return userData
        }
      } catch (apiError) {
        console.error('[AUTH] Backend signup API failed:', apiError)
      }

      // Local mock signup fallback (explicitly opt-in only)
      if (!isMockAuthEnabled) {
        throw new Error('Signup failed. Please check backend API configuration.')
      }

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
        last_name: '',
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
