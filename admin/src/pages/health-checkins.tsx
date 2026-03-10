import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

export default function HealthCheckinsRedirectPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const role = user?.role?.toLowerCase()
    if (role === 'elder') {
      router.replace('/elder-dashboard?tab=health')
      return
    }
    router.replace('/dashboard')
  }, [router, user])

  return null
}
