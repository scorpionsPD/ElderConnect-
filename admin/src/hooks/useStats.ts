import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCompanionRequests } from './useCompanionRequests'
import { useHealthCheckins } from './useHealthCheckins'
import { useElders } from './useElders'

export interface DashboardStats {
  // Companion Request Stats
  companionRequestsPending: number
  companionRequestsAccepted: number
  companionRequestsCompleted: number
  companionRequestsCancelled: number
  upcomingVisits: number
  
  // Health Stats
  lastHealthCheckinDate?: string
  averageHealthScore: number
  consecutiveDaysCheckin: number
  
  // Family/Elder Management Stats
  eldersConnected: number
  volunteersMatched: number
  familyMembers: number
  
  // Emergency Stats
  emergencyContactsSetup: boolean
  recentAlerts: number
  
  // Activity Stats
  messagesUnread: number
  activitiesThisMonth: number
}

export const useStats = () => {
  const { user } = useAuth()
  const role = user?.role?.toLowerCase()
  const isElder = role === 'elder'
  const isVolunteer = role === 'volunteer'
  const isFamily = role === 'family'

  const { requests } = useCompanionRequests({ enabled: isElder || isVolunteer })
  const { checkins } = useHealthCheckins({ enabled: isElder })
  const { elders } = useElders({ enabled: isFamily })
  const [stats, setStats] = useState<DashboardStats>({
    companionRequestsPending: 0,
    companionRequestsAccepted: 0,
    companionRequestsCompleted: 0,
    companionRequestsCancelled: 0,
    upcomingVisits: 0,
    averageHealthScore: 0,
    consecutiveDaysCheckin: 0,
    eldersConnected: 0,
    volunteersMatched: 0,
    familyMembers: 0,
    emergencyContactsSetup: false,
    recentAlerts: 0,
    messagesUnread: 0,
    activitiesThisMonth: 0
  })

  // Calculate stats from data
  useEffect(() => {
    const calculateStats = () => {
      // Companion request stats
      const pending = requests.filter(r => r.status === 'PENDING').length
      const accepted = requests.filter(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS').length
      const completed = requests.filter(r => r.status === 'COMPLETED').length
      const cancelled = requests.filter(r => r.status === 'CANCELLED').length
      
      // Filter upcoming visits (accepted requests with future dates)
      const upcoming = requests.filter(r => {
        if (r.status !== 'ACCEPTED' && r.status !== 'IN_PROGRESS') return false
        if (r.preferred_time_start) {
          const visitDate = new Date(r.preferred_time_start)
          return visitDate > new Date()
        }
        return false
      }).length

      // Health check-in stats
      let avgHealth = 0
      let lastCheckinDate: string | undefined
      let consecutive = 0

      if (checkins.length > 0) {
        lastCheckinDate = checkins[0].checkin_date
        // Calculate average energy level as health score (0-100)
        const avgEnergy = checkins.reduce((sum, c) => sum + c.energy_level, 0) / checkins.length
        avgHealth = Math.round((avgEnergy / 10) * 100) // Convert 0-10 to 0-100

        // Calculate consecutive days (simplified - count checkins in last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        consecutive = checkins.filter(c => new Date(c.checkin_date) > sevenDaysAgo).length
      }

      // Elder connection stats
      const elderCount = elders.length

      // This month's activities (requests from this month)
      const thisMonth = requests.filter(r => {
        const requestDate = new Date(r.requested_date)
        const now = new Date()
        return (
          requestDate.getMonth() === now.getMonth() &&
          requestDate.getFullYear() === now.getFullYear()
        )
      }).length

      setStats(prev => ({
        ...prev,
        companionRequestsPending: pending,
        companionRequestsAccepted: accepted,
        companionRequestsCompleted: completed,
        companionRequestsCancelled: cancelled,
        upcomingVisits: upcoming,
        lastHealthCheckinDate: lastCheckinDate,
        averageHealthScore: avgHealth,
        consecutiveDaysCheckin: consecutive,
        eldersConnected: elderCount,
        activitiesThisMonth: thisMonth,
        emergencyContactsSetup: !!(user?.emergency_contact_name && user?.emergency_contact_phone)
      }))
    }

    calculateStats()
  }, [requests, checkins, elders, user])

  return stats
}
