import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
}

export default function Toast({ id, type, message, duration = 3000, onClose }: ToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right',
        config.bgColor,
        config.borderColor
      )}
    >
      <Icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <p className={clsx('flex-1 text-sm font-medium', config.textColor)}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={clsx('flex-shrink-0 hover:opacity-70 transition-opacity', config.textColor)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
