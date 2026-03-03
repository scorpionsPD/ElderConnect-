import { useState, useEffect } from 'react'
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

export const useElders = () => {
  const [elders, setElders] = useState<ElderConnection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch connected elders for family member
  const fetchElders = async () => {
    setLoading(true)
    setError(null)
    try {
      // For now, we'll use a mock API endpoint
      // In production, this would be: GET /family-elders or similar
      const response = await apiClient.request('/family-elders', {
        method: 'GET'
      })
      
      if (response.success && response.data) {
        setElders(Array.isArray(response.data) ? response.data : [])
      } else {
        // Fallback to empty list if endpoint not available
        setElders([])
      }
    } catch (err) {
      console.error('Error fetching elders:', err)
      // Don't set error state for missing endpoint
      setElders([])
    } finally {
      setLoading(false)
    }
  }

  // Add new elder to family
  const addElder = async (
    elderEmail: string,
    relationship: string
  ): Promise<ElderConnection | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.request('/family-elders', {
        method: 'POST',
        body: JSON.stringify({
          elder_email: elderEmail,
          relationship
        })
      })

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
      const response = await apiClient.request(`/family-elders/${connectionId}`, {
        method: 'DELETE'
      })

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
      const response = await apiClient.request(`/family-elders/${connectionId}`, {
        method: 'PUT',
        body: JSON.stringify({ relationship })
      })

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
    fetchElders()
  }, [])

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
