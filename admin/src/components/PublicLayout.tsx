import React from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND_ICON_ALT, BRAND_ICON_WITH_VERSION } from '@/utils/branding';
import { APP_STORE_URL } from '@/utils/app-store';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardHref =
    user?.role === 'volunteer' ? '/volunteer-dashboard' :
    user?.role === 'family'    ? '/family-dashboard' :
    '/elder-dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/welcome" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <img src={BRAND_ICON_WITH_VERSION} alt={BRAND_ICON_ALT} className="w-6 h-6 rounded" />
              </div>
              <span className="text-xl font-bold text-gray-900">ElderConnect+</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/elder-guide" className="text-gray-600 hover:text-gray-900 transition-colors">
                For Elders
              </Link>
              <Link href="/donate" className="text-gray-600 hover:text-gray-900 transition-colors">
                Donate
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Hi, {user?.first_name || user?.email}
                  </span>
                  <Link href={dashboardHref}>
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
                    <Button variant="secondary">Download on the App Store</Button>
                  </a>
                  <Button variant="ghost" onClick={logout} className="flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                  <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
                    <Button variant="secondary">Download App</Button>
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col gap-2">
                <Link href="/about" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  About
                </Link>
                <Link href="/elder-guide" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  For Elders
                </Link>
                <Link href="/donate" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  Donate
                </Link>
                <Link href="/contact" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  Contact
                </Link>
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Download App
                </a>
                <div className="flex gap-2 px-4 pt-4 border-t border-gray-100 mt-2">
                  {isAuthenticated ? (
                    <>
                      <Link href={dashboardHref} className="flex-1">
                        <Button variant="secondary" className="w-full">Dashboard</Button>
                      </Link>
                      <Button className="w-full flex-1" onClick={logout}>Log Out</Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="flex-1">
                        <Button variant="secondary" className="w-full">Log In</Button>
                      </Link>
                      <Link href="/signup" className="flex-1">
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <img src={BRAND_ICON_WITH_VERSION} alt={BRAND_ICON_ALT} className="w-6 h-6 rounded" />
              </div>
              <span className="text-xl font-bold text-white">ElderConnect+</span>
            </div>
            <p className="text-sm">
              Connecting generations through care, companionship, and community.
            </p>
            <div className="mt-5">
              <a href={APP_STORE_URL} target="_blank" rel="noreferrer">
                <Button variant="secondary">Download on the App Store</Button>
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2026 ScotiTech Solutions. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/partners" className="hover:text-white transition-colors">Partners</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
