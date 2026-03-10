import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

export default function CompanionRequestsRedirectPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const role = user?.role?.toLowerCase()
    if (role === 'elder') {
      router.replace('/elder-dashboard?tab=companions')
      return
    }
    if (role === 'volunteer') {
      router.replace('/volunteer-dashboard?tab=matches')
      return
    }
    router.replace('/dashboard')
  }, [router, user])

  return null
}
