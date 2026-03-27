import React from 'react'
import { APP_STORE_URL } from '@/utils/app-store'

interface AppStoreBadgeProps {
  compact?: boolean
  className?: string
}

export default function AppStoreBadge({
  compact = false,
  className = '',
}: AppStoreBadgeProps) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-3 rounded-2xl bg-black px-4 py-3 text-white transition-transform hover:-translate-y-0.5 hover:bg-gray-900 ${className}`.trim()}
      aria-label="Find us on the App Store"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={compact ? 'h-6 w-6' : 'h-7 w-7'}
        fill="currentColor"
      >
        <path d="M17.05 12.54c.03 3.28 2.88 4.37 2.91 4.38-.02.08-.45 1.55-1.49 3.08-.89 1.32-1.82 2.63-3.27 2.66-1.42.03-1.88-.84-3.5-.84-1.62 0-2.13.81-3.48.87-1.4.05-2.46-1.41-3.36-2.73-1.84-2.67-3.25-7.55-1.36-10.82.94-1.62 2.62-2.64 4.44-2.67 1.39-.03 2.7.94 3.5.94.8 0 2.31-1.16 3.89-.99.66.03 2.52.27 3.71 2.01-.1.06-2.22 1.29-2.19 4.11ZM14.39 4.7c.75-.91 1.25-2.17 1.11-3.43-1.08.04-2.39.72-3.17 1.63-.7.81-1.31 2.11-1.15 3.35 1.21.09 2.45-.62 3.21-1.55Z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">
          Find us on the
        </span>
        <span className={`block font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
          App Store
        </span>
      </span>
    </a>
  )
}
