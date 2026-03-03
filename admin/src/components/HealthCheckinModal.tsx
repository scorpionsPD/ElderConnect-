import React, { useState } from 'react'
import { X, Heart, Moon, Activity, Utensils } from 'lucide-react'
import Button from './Button'
import Badge from './Badge'

interface HealthCheckinModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: HealthCheckinData) => void
}

export interface HealthCheckinData {
  date: string
  mood: 'Happy' | 'Okay' | 'Sad'
  energy: number
  sleep: number
  mealsSinceLastCheck: number
  moodDetails: string
}

export default function HealthCheckinModal({ isOpen, onClose, onSubmit }: HealthCheckinModalProps) {
  const [formData, setFormData] = useState<HealthCheckinData>({
    date: new Date().toISOString().split('T')[0],
    mood: 'Okay',
    energy: 5,
    sleep: 5,
    mealsSinceLastCheck: 3,
    moodDetails: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Daily Health Check-in</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">How are you feeling today?</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Happy', 'Okay', 'Sad'] as const).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood })}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    formData.mood === mood
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {mood === 'Happy' ? '😊' : mood === 'Okay' ? '😐' : '😔'}
                  </div>
                  <p className="font-medium text-gray-900">{mood}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Activity className="w-4 h-4 inline mr-2" />
              Energy Level: {formData.energy}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.energy}
              onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Moon className="w-4 h-4 inline mr-2" />
              Sleep Quality: {formData.sleep}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.sleep}
              onChange={(e) => setFormData({ ...formData, sleep: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Meals */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Utensils className="w-4 h-4 inline mr-2" />
              Meals Since Last Check-in
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, mealsSinceLastCheck: num })}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    formData.mealsSinceLastCheck === num
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.moodDetails}
              onChange={(e) => setFormData({ ...formData, moodDetails: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="How are you feeling? Any concerns or highlights from your day?"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="button" text="Cancel" variant="secondary" onClick={onClose} />
            <Button type="submit" text="Submit Check-in" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  )
}
