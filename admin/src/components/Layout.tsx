import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  DollarSign, 
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  UserCircle
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

type UserRole = 'admin' | 'elder' | 'volunteer' | 'family'

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Verifications', href: '/verifications', icon: CheckCircle },
  { name: 'Donations', href: '/donations', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const elderNavigation = [
  { name: 'Dashboard', href: '/elder-dashboard', icon: LayoutDashboard },
  { name: 'Companion Requests', href: '/companion-requests', icon: Users },
  { name: 'Health Check-ins', href: '/health-checkins', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const volunteerNavigation = [
  { name: 'Dashboard', href: '/volunteer-dashboard', icon: LayoutDashboard },
  { name: 'Companion Requests', href: '/companion-requests', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const familyNavigation = [
  { name: 'Family Dashboard', href: '/family-dashboard', icon: UserCircle },
  { name: 'Elder Updates', href: '/family-dashboard?tab=updates', icon: Heart },
  { name: 'Communication', href: '/family-dashboard?tab=communication', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  
  // Get user role - map from our User interface to local UserRole type
  const userRole: UserRole = user?.role?.toLowerCase() === 'elder' ? 'elder'
    : user?.role?.toLowerCase() === 'volunteer' ? 'volunteer'
    : user?.role?.toLowerCase() === 'family' ? 'family'
    : 'admin'
  
  // Get display name - use actual first and last name from user
  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User'
  const userEmail = user?.email || 'user@elderconnect.com'
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!userName) return 'U'
    return userName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const handleLogout = async () => {
    logout()
    router.push('/login')
  }

  const navigation = userRole === 'elder'
    ? elderNavigation
    : userRole === 'volunteer'
      ? volunteerNavigation
      : userRole === 'family'
        ? familyNavigation
        : adminNavigation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-primary-600">ElderConnect+</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userName || 'User'}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium text-sm">
                  {getInitials()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
