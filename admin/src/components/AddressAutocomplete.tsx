import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { MapPin } from 'lucide-react'
import { searchAddresses } from '@/utils/address-search'
import { AddressSuggestion } from '@/types/address'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (suggestion: AddressSuggestion) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  countryCodes?: string[]
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search address or postcode',
  required = false,
  disabled = false,
  className,
  countryCodes,
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hasSearched, setHasSearched] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const query = value.trim()
    if (query.length < 3) {
      setResults([])
      setLoading(false)
      setHasSearched(false)
      setActiveIndex(-1)
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      const data = await searchAddresses(query, { limit: 6, countryCodes })
      setResults(data)
      setHasSearched(true)
      setLoading(false)
      setOpen(true)
      setActiveIndex(-1)
    }, 300)

    return () => clearTimeout(timeout)
  }, [value, countryCodes])

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.formattedAddress)
    onSelect?.(suggestion)
    setResults([])
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0))
      return
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      handleSelect(results[activeIndex])
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className={clsx('relative', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Searching addresses...</div>
          ) : results.length > 0 ? (
            results.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className={clsx(
                  'w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-b-0',
                  activeIndex === index && 'bg-primary-50'
                )}
              >
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-900">{suggestion.formattedAddress}</div>
                  {(suggestion.postcode || suggestion.city) && (
                    <div className="text-xs text-gray-500">
                      {[suggestion.postcode, suggestion.city].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : hasSearched ? (
            <div className="px-3 py-2 text-sm text-gray-500">No results found. Try a postcode or full street.</div>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">Type at least 3 characters to search.</div>
          )}
        </div>
      )}
    </div>
  )
}
