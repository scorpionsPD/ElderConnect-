import React, { useState } from 'react'
import { X, Calendar, Clock, MapPin, FileText } from 'lucide-react'
import Button from './Button'
import AddressAutocomplete from './AddressAutocomplete'
import { AddressSuggestion } from '@/types/address'

interface CompanionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CompanionRequestData) => void
}

export interface CompanionRequestData {
  serviceType: string
  description: string
  date: string
  time: string
  duration: number
  location: string
  locationLatitude?: number
  locationLongitude?: number
  postcode?: string
  urgency: 'normal' | 'high'
}

export default function CompanionRequestModal({ isOpen, onClose, onSubmit }: CompanionRequestModalProps) {
  const [formData, setFormData] = useState<CompanionRequestData>({
    serviceType: 'Shopping assistance',
    description: '',
    date: '',
    time: '',
    duration: 2,
    location: '',
    urgency: 'normal',
  })

  const handleLocationSelect = (suggestion: AddressSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      location: suggestion.formattedAddress,
      locationLatitude: suggestion.latitude,
      locationLongitude: suggestion.longitude,
      postcode: suggestion.postcode,
    }))
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const serviceTypes = [
    'Shopping assistance',
    'Doctor appointment',
    'Social visit',
    'Technology help',
    'Errands',
    'Other',
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Request Companion Support</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe what help you need..."
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Duration: {formData.duration} hour{formData.duration !== 1 ? 's' : ''}
            </label>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.5"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>30 min</span>
              <span>8 hours</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            <AddressAutocomplete
              value={formData.location}
              onChange={(value) => setFormData((prev) => ({
                ...prev,
                location: value,
                locationLatitude: undefined,
                locationLongitude: undefined,
                postcode: undefined,
              }))}
              onSelect={handleLocationSelect}
              placeholder="Search address or postcode"
              required
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Priority Level</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, urgency: 'normal' })}
                className={`p-3 border-2 rounded-lg text-center transition ${
                  formData.urgency === 'normal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">Normal</p>
                <p className="text-xs text-gray-600">Standard scheduling</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, urgency: 'high' })}
                className={`p-3 border-2 rounded-lg text-center transition ${
                  formData.urgency === 'high'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">High Priority</p>
                <p className="text-xs text-gray-600">Urgent assistance needed</p>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="button" text="Cancel" variant="secondary" onClick={onClose} />
            <Button type="submit" text="Submit Request" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  )
}
