import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Public routes that don't require authentication
const publicRoutes = [
  '/login', 
  '/signup', 
  '/welcome', 
  '/onboarding/elder', 
  '/onboarding/volunteer',
  '/safety-trust',
  '/faq',
  '/about',
  '/contact',
  '/donate',
  '/volunteer-resources',
  '/elder-guide',
  '/privacy',
  '/terms',
  '/partners'
]

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  const isPublicRoute = publicRoutes.some(route => router.pathname.startsWith(route))

  useEffect(() => {
    if (!authLoading) {
      setIsInitialized(true)
      
      // Redirect unauthenticated users to login (except for public routes)
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login')
      }
    }
  }, [authLoading, isAuthenticated, isPublicRoute, router])

  if (!isInitialized && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <Component {...pageProps} />
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent {...props} />
      </ToastProvider>
    </AuthProvider>
  )
}
