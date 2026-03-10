import { useState, useEffect, useCallback } from 'react'
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

interface UseHealthCheckinsOptions {
  enabled?: boolean
}

export const useHealthCheckins = (options: UseHealthCheckinsOptions = {}) => {
  const { enabled = true } = options
  const [checkins, setCheckins] = useState<HealthCheckin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStorageKey = (): string => {
    if (typeof window === 'undefined') return 'health_checkins_anonymous'
    const userId = localStorage.getItem('user_id') || 'anonymous'
    return `health_checkins_${userId}`
  }

  // Load cached health check-ins from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(getStorageKey())
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCheckins(Array.isArray(parsed) ? parsed : [])
      } catch (e) {
        console.error('Failed to parse stored health check-ins:', e)
      }
    }
  }, [])

  // Persist health check-ins to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(getStorageKey(), JSON.stringify(checkins))
  }, [checkins])

  // Fetch health check-ins
  const shouldUseLocalFallback = (message?: string | null): boolean => {
    const text = (message || '').toLowerCase()
    return text.includes('invalid jwt') || text.includes('unauthorized') || text.includes('failed to fetch')
  }

  const readLocalCheckins = useCallback((): HealthCheckin[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(getStorageKey())
    if (!stored) return []
    try {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [])

  const writeLocalCheckins = useCallback((items: HealthCheckin[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(getStorageKey(), JSON.stringify(items))
  }, [])

  const fetchCheckins = useCallback(async (limit: number = 30, offset: number = 0) => {
    if (!enabled) {
      setCheckins([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getHealthCheckins(limit, offset)
      if (response.success && response.data) {
        const fetched = Array.isArray(response.data) ? response.data : []
        setCheckins(fetched)
        writeLocalCheckins(fetched)
      } else {
        if (shouldUseLocalFallback(response.error)) {
          setCheckins(readLocalCheckins())
          setError(null)
        } else {
          setError(response.error || 'Failed to fetch check-ins')
        }
      }
    } catch (err) {
      console.error('Error fetching health check-ins:', err)
      const local = readLocalCheckins()
      if (local.length > 0) {
        setCheckins(local)
        setError(null)
      } else {
        setError('Failed to fetch check-ins')
      }
    } finally {
      setLoading(false)
    }
  }, [enabled, readLocalCheckins, writeLocalCheckins])

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
        const updated = [newCheckin, ...checkins]
        setCheckins(updated)
        writeLocalCheckins(updated)
        return newCheckin
      } else {
        if (shouldUseLocalFallback(response.error)) {
          const localCheckin: HealthCheckin = {
            id: `local-${Date.now()}`,
            user_id: 'local-user',
            mood: mood.toUpperCase(),
            energy_level,
            sleep_hours,
            medications_taken,
            notes,
            checkin_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
          const updated = [localCheckin, ...checkins]
          setCheckins(updated)
          writeLocalCheckins(updated)
          setError(null)
          return localCheckin
        }
        setError(response.error || 'Failed to submit check-in')
        return null
      }
    } catch (err) {
      console.error('Error submitting health check-in:', err)
      const localCheckin: HealthCheckin = {
        id: `local-${Date.now()}`,
        user_id: 'local-user',
        mood: mood.toUpperCase(),
        energy_level,
        sleep_hours,
        medications_taken,
        notes,
        checkin_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      const updated = [localCheckin, ...checkins]
      setCheckins(updated)
      writeLocalCheckins(updated)
      setError(null)
      return localCheckin
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
    if (!enabled) {
      setCheckins([])
      setLoading(false)
      setError(null)
      return
    }
    fetchCheckins()
  }, [enabled, fetchCheckins])

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
