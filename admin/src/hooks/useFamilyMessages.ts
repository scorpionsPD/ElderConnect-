import { useCallback, useState } from 'react'
import apiClient from '@/utils/api-client'

export interface FamilyMessage {
  id: string
  elder_id: string
  sender_id: string
  message_text: string
  created_at: string
  sender?: {
    id: string
    first_name: string
    email: string
    role: string
  }
}

export const useFamilyMessages = () => {
  const [messages, setMessages] = useState<FamilyMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async (elderUserId: string): Promise<FamilyMessage[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getFamilyMessages(elderUserId)
      if (!response.success) {
        const message = response.error || 'Failed to fetch family messages'
        setError(message)
        return []
      }
      const next = Array.isArray(response.data) ? (response.data as FamilyMessage[]) : []
      setMessages(next)
      return next
    } catch {
      setError('Failed to fetch family messages')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (elderUserId: string, messageText: string): Promise<boolean> => {
    const text = messageText.trim()
    if (!text) return false

    setSending(true)
    setError(null)
    try {
      const response = await apiClient.sendFamilyMessage(elderUserId, text)
      if (!response.success || !response.data) {
        setError(response.error || 'Failed to send family message')
        return false
      }
      const created = response.data as FamilyMessage
      setMessages((prev) => [...prev, created])
      return true
    } catch {
      setError('Failed to send family message')
      return false
    } finally {
      setSending(false)
    }
  }, [])

  return {
    messages,
    loading,
    sending,
    error,
    fetchMessages,
    sendMessage,
  }
}
