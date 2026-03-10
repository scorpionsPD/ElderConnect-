import { useCallback, useState } from 'react'
import apiClient from '@/utils/api-client'

export interface CompanionMessage {
  id: string
  sender_id: string
  recipient_id: string
  message_text: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    first_name: string
    email: string
  }
}

export const useCompanionMessages = () => {
  const [messages, setMessages] = useState<CompanionMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async (requestId: string): Promise<CompanionMessage[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getCompanionMessages(requestId)
      if (!response.success) {
        const message = response.error || 'Failed to fetch messages'
        setError(message)
        return []
      }
      const next = Array.isArray(response.data) ? (response.data as CompanionMessage[]) : []
      setMessages(next)
      return next
    } catch (err) {
      setError('Failed to fetch messages')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (requestId: string, messageText: string): Promise<boolean> => {
    const text = messageText.trim()
    if (!text) return false

    setSending(true)
    setError(null)
    try {
      const response = await apiClient.sendCompanionMessage(requestId, text)
      if (!response.success || !response.data) {
        setError(response.error || 'Failed to send message')
        return false
      }
      const created = response.data as CompanionMessage
      setMessages((prev) => [...prev, created])
      return true
    } catch (err) {
      setError('Failed to send message')
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
    sendMessage
  }
}
