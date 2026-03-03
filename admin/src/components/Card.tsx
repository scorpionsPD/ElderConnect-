import React from 'react'
import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

export default function Card({ children, className, title, subtitle, icon }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {(title || subtitle || icon) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="flex-1">
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}
