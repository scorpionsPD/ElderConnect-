import { useState, useEffect, useCallback } from 'react'
import apiClient from '@/utils/api-client'

export interface CompanionRequest {
  id: string
  elder_id: string
  volunteer_id?: string
  activity_type: string
  description?: string
  status: string
  requested_date: string
  preferred_time_start?: string
  preferred_time_end?: string
  location_latitude?: number
  location_longitude?: number
  elder?: {
    id: string
    first_name: string
    last_name?: string
    email: string
    phone_number?: string
    address_line_1?: string
    city?: string
    postcode?: string
  }
  volunteer?: {
    id: string
    first_name: string
    email: string
  }
  completion?: {
    elder_confirmed: boolean
    volunteer_confirmed: boolean
    waiting_for: 'ELDER' | 'VOLUNTEER' | null
  }
  matching?: {
    score: number | null
    activity_match: boolean | null
    availability_match: boolean | null
    elder_alignment: boolean | null
  }
}

interface UseCompanionRequestsOptions {
  enabled?: boolean
}

export const useCompanionRequests = (options: UseCompanionRequestsOptions = {}) => {
  const { enabled = true } = options
  const [requests, setRequests] = useState<CompanionRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load requests from localStorage on mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true') {
      const stored = localStorage.getItem('dev_companion_requests')
      if (stored) {
        try {
          setRequests(JSON.parse(stored))
        } catch (e) {
          console.warn('Failed to parse stored requests:', e)
        }
      }
    }
  }, [])

  // Persist requests to localStorage whenever they change (in dev mode)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true' && requests.length > 0) {
      localStorage.setItem('dev_companion_requests', JSON.stringify(requests))
    }
  }, [requests])

  // Fetch all companion requests
  const fetchRequests = useCallback(async () => {
    if (!enabled) {
      setRequests([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getCompanionRequests()
      if (response.success && response.data) {
        setRequests(Array.isArray(response.data) ? response.data : [])
      } else {
        if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true') {
          setRequests([
            {
              id: '1',
              elder_id: 'user-1',
              volunteer_id: undefined,
              activity_type: 'SHOPPING',
              description: 'Need help with weekly groceries',
              status: 'PENDING',
              requested_date: new Date().toISOString(),
              elder: { id: 'user-1', first_name: 'John', email: 'john@example.com' }
            }
          ])
          setError(null)
        } else {
          setError(response.error || 'Failed to fetch requests')
        }
      }
    } catch (err) {
      console.error('Error fetching companion requests:', err)
      setError('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  // Create new companion request
  const createRequest = async (
    activity_type: string,
    description?: string,
    preferred_time_start?: string,
    preferred_time_end?: string,
    location_latitude?: number,
    location_longitude?: number
  ): Promise<CompanionRequest | null> => {
    setLoading(true)
    setError(null)
    try {
      // In development with mock auth, mock the creation
      if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true') {
        console.log('[DEV] Mocking companion request creation')
        const newRequest: CompanionRequest = {
          id: `req-${Date.now()}`,
          elder_id: 'user-1',
          activity_type,
          description,
          status: 'PENDING',
          requested_date: new Date().toISOString(),
          preferred_time_start,
          preferred_time_end,
          location_latitude,
          location_longitude
        }
        setRequests([newRequest, ...requests])
        return newRequest
      }
      
      const response = await apiClient.createCompanionRequest(
        activity_type,
        description,
        preferred_time_start,
        preferred_time_end,
        location_latitude,
        location_longitude
      )
      if (response.success && response.data) {
        const newRequest = response.data as CompanionRequest
        setRequests([newRequest, ...requests])
        return newRequest
      } else {
        setError(response.error || 'Failed to create request')
        return null
      }
    } catch (err) {
      console.error('Error creating companion request:', err)
      setError('Failed to create request')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Accept companion request
  const acceptRequest = async (requestId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true' && requestId === '1') {
        setRequests(
          requests.map((req) =>
            req.id === requestId ? { ...req, status: 'ACCEPTED' } : req
          )
        )
        return true
      }
      const response = await apiClient.acceptCompanionRequest(requestId)
      if (response.success) {
        const updatedRequest = response.data as CompanionRequest | undefined
        // Update request in local state
        setRequests(
          requests.map((req) =>
            req.id === requestId
              ? updatedRequest || { ...req, status: 'ACCEPTED' }
              : req
          )
        )
        return true
      } else {
        setError(response.error || 'Failed to accept request')
        return false
      }
    } catch (err) {
      console.error('Error accepting companion request:', err)
      setError('Failed to accept request')
      return false
    } finally {
      setLoading(false)
    }
  }

  const completeRequest = async (requestId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true' && requestId === '1') {
        setRequests(
          requests.map((req) =>
            req.id === requestId ? { ...req, status: 'COMPLETED' } : req
          )
        )
        return true
      }
      const response = await apiClient.completeCompanionRequest(requestId)
      if (response.success) {
        const updatedRequest = response.data as CompanionRequest | undefined
        setRequests(
          requests.map((req) =>
            req.id === requestId
              ? updatedRequest || { ...req, status: 'COMPLETED' }
              : req
          )
        )
        return true
      } else {
        setError(response.error || 'Failed to complete request')
        return false
      }
    } catch (err) {
      console.error('Error completing companion request:', err)
      setError('Failed to complete request')
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) {
      setRequests([])
      setLoading(false)
      setError(null)
      return
    }
    fetchRequests()
  }, [enabled, fetchRequests])

  // Get a single request by ID (for detail view)
  const getRequestDetail = (requestId: string): CompanionRequest | null => {
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true') {
      return requests.find(r => r.id === requestId) || null
    }
    // In production, would fetch from API
    return null
  }

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    acceptRequest,
    completeRequest,
    getRequestDetail
  }
}
