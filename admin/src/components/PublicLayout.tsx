import React from 'react';
import Link from 'next/link';
import { Heart, Menu, X } from 'lucide-react';
import Button from '@/components/Button';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/welcome" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-600" />
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
              <Link href="/volunteer-resources" className="text-gray-600 hover:text-gray-900 transition-colors">
                For Volunteers
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
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
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
                <Link href="/volunteer-resources" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  For Volunteers
                </Link>
                <Link href="/donate" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  Donate
                </Link>
                <Link href="/contact" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                  Contact
                </Link>
                <div className="flex gap-2 px-4 pt-4 border-t border-gray-100 mt-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="secondary" className="w-full">Log In</Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
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
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ElderConnect+</span>
              </div>
              <p className="text-sm">
                Connecting generations through care, companionship, and community.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Elders</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-white transition-colors">Find a Companion</Link></li>
                <li><Link href="/elder-guide" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/safety-trust" className="hover:text-white transition-colors">Safety & Trust</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Volunteers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-white transition-colors">Become a Volunteer</Link></li>
                <li><Link href="/volunteer-resources" className="hover:text-white transition-colors">Training Program</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Volunteer Stories</Link></li>
                <li><Link href="/volunteer-resources" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Organization</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/donate" className="hover:text-white transition-colors">Donate</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2026 ElderConnect+. All rights reserved.
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
