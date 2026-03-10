import { useState, useEffect, useCallback } from 'react'
import apiClient from '@/utils/api-client'
import { User } from '@/contexts/AuthContext'

export interface ElderConnection {
  id: string
  family_user_id: string
  elder_user_id: string
  relationship: string
  added_date: string
  elder?: User
}

interface UseEldersOptions {
  enabled?: boolean
}

export const useElders = (options: UseEldersOptions = {}) => {
  const { enabled = true } = options
  const [elders, setElders] = useState<ElderConnection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch connected elders for family member
  const fetchElders = useCallback(async () => {
    if (!enabled) {
      setElders([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getFamilyElders()
      
      if (response.success && response.data) {
        setElders(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.error || 'Failed to fetch elders')
        setElders([])
      }
    } catch (err) {
      console.error('Error fetching elders:', err)
      setError('Failed to fetch elders')
      setElders([])
    } finally {
      setLoading(false)
    }
  }, [enabled])

  // Add new elder to family
  const addElder = async (
    elderEmail: string,
    relationship: string
  ): Promise<ElderConnection | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.addFamilyElder(elderEmail, relationship)

      if (response.success && response.data) {
        const newElder = response.data as ElderConnection
        setElders([...elders, newElder])
        return newElder
      } else {
        setError(response.error || 'Failed to add elder')
        return null
      }
    } catch (err) {
      console.error('Error adding elder:', err)
      setError('Failed to add elder')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Remove elder from family
  const removeElder = async (connectionId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.removeFamilyElder(connectionId)

      if (response.success) {
        setElders(elders.filter(e => e.id !== connectionId))
        return true
      } else {
        setError(response.error || 'Failed to remove elder')
        return false
      }
    } catch (err) {
      console.error('Error removing elder:', err)
      setError('Failed to remove elder')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update elder relationship
  const updateElder = async (
    connectionId: string,
    relationship: string
  ): Promise<ElderConnection | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.updateFamilyElder(connectionId, relationship)

      if (response.success && response.data) {
        const updated = response.data as ElderConnection
        setElders(elders.map(e => (e.id === connectionId ? updated : e)))
        return updated
      } else {
        setError(response.error || 'Failed to update elder')
        return null
      }
    } catch (err) {
      console.error('Error updating elder:', err)
      setError('Failed to update elder')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) {
      setElders([])
      setLoading(false)
      setError(null)
      return
    }
    fetchElders()
  }, [enabled, fetchElders])

  return {
    elders,
    loading,
    error,
    fetchElders,
    addElder,
    removeElder,
    updateElder
  }
}
