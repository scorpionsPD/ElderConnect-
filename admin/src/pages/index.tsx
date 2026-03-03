import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    
    if (user) {
      // Logged in - go to appropriate dashboard
      try {
        const userData = JSON.parse(user)
        const dashboards: Record<string, string> = {
          elder: '/elder-dashboard',
          volunteer: '/volunteer-dashboard',
          family: '/family-dashboard',
          admin: '/dashboard',
        }
        router.push(dashboards[userData.role] || '/dashboard')
      } catch {
        router.push('/dashboard')
      }
    } else {
      // Not logged in - show welcome page
      router.push('/welcome')
    }
  }, [router])

  return (
    <>
      <Head>
        <title>ElderConnect+</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    </>
  )
}
