import { useState, useEffect } from 'react'
import apiClient from '@/utils/api-client'

export interface HealthCheckin {
  id: string
  user_id: string
  mood: string
  energy_level: number
  sleep_hours: number
  medications_taken: boolean
  notes?: string
  checkin_date: string
  created_at: string
}

export const useHealthCheckins = () => {
  const [checkins, setCheckins] = useState<HealthCheckin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load mock health check-ins from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true') {
      const stored = localStorage.getItem('dev_health_checkins')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setCheckins(Array.isArray(parsed) ? parsed : [])
        } catch (e) {
          console.error('Failed to parse stored health check-ins:', e)
        }
      }
    }
  }, [])

  // Persist health check-ins to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH_MOCK === 'true') {
      localStorage.setItem('dev_health_checkins', JSON.stringify(checkins))
    }
  }, [checkins])

  // Fetch health check-ins
  const fetchCheckins = async (limit: number = 30, offset: number = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getHealthCheckins(limit, offset)
      if (response.success && response.data) {
        setCheckins(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.error || 'Failed to fetch check-ins')
      }
    } catch (err) {
      console.error('Error fetching health check-ins:', err)
      setError('Failed to fetch check-ins')
    } finally {
      setLoading(false)
    }
  }

  // Submit new health check-in
  const submitCheckin = async (
    mood: string,
    energy_level: number,
    sleep_hours: number,
    medications_taken: boolean,
    notes?: string
  ): Promise<HealthCheckin | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.submitHealthCheckin(
        mood,
        energy_level,
        sleep_hours,
        medications_taken,
        notes
      )
      if (response.success && response.data) {
        const newCheckin = response.data as HealthCheckin
        setCheckins([newCheckin, ...checkins])
        return newCheckin
      } else {
        setError(response.error || 'Failed to submit check-in')
        return null
      }
    } catch (err) {
      console.error('Error submitting health check-in:', err)
      setError('Failed to submit check-in')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Get latest check-in
  const getLatestCheckin = (): HealthCheckin | null => {
    return checkins.length > 0 ? checkins[0] : null
  }

  // Get check-in by ID
  const getHealthCheckinDetail = (id: string): HealthCheckin | null => {
    return checkins.find(checkin => checkin.id === id) || null
  }

  useEffect(() => {
    fetchCheckins()
  }, [])

  return {
    checkins,
    loading,
    error,
    fetchCheckins,
    submitCheckin,
    getLatestCheckin,
    getHealthCheckinDetail
  }
}
