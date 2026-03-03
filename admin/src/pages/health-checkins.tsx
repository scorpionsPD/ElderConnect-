import React, { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Badge from '@/components/Badge'
import HealthCheckinModal, { HealthCheckinData } from '@/components/HealthCheckinModal'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { useHealthCheckins } from '@/hooks'
import { Heart, Moon, Utensils, Activity, Plus, Share2 } from 'lucide-react'

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0

export default function HealthCheckinsPage() {
  const toast = useToast()
  const { user } = useAuth()
  const { checkins, submitCheckin, loading } = useHealthCheckins()
  const [showHealthCheckin, setShowHealthCheckin] = useState(false)
  const averageEnergy = average(checkins.map((checkin) => checkin.energy_level))
  const averageSleep = average(checkins.map((checkin) => checkin.sleep_hours))
  const totalCheckins = checkins.length
  const checkinStreak = checkins.length > 0 ? Math.min(checkins.length, 7) : 0

  const handleHealthCheckinSubmit = async (data: HealthCheckinData) => {
    const created = await submitCheckin(
      data.mood,
      data.energy,
      data.sleep,
      true,
      data.moodDetails
    )

    if (created) {
      toast.success('Health check-in submitted successfully!')
      setShowHealthCheckin(false)
      return
    }

    toast.error('Failed to submit health check-in')
  }

  return (
    <>
      <Head>
        <title>Health Check-ins - ElderConnect+</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Check-ins</h1>
              <p className="text-sm text-gray-600">Track daily wellness, mood, and routines</p>
            </div>
            <Button
              text={loading ? 'Saving...' : 'New Check-in'}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowHealthCheckin(true)}
              disabled={loading}
            />
          </div>

          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {user?.profile_picture_url ? (
                  <Image
                    src={user.profile_picture_url}
                    alt={user.first_name || 'User'}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                    {(user?.first_name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{user?.first_name || 'Elder User'}</p>
                  <p className="text-sm text-gray-600">{user?.email || 'No email available'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="success">Check-in streak: {checkinStreak} day{checkinStreak === 1 ? '' : 's'}</Badge>
                <Badge variant="default">Next reminder: 7:00 PM</Badge>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Average Energy</p>
                  <p className="text-3xl font-bold text-green-900">{averageEnergy}/10</p>
                </div>
                <Activity className="w-10 h-10 text-green-400" />
              </div>
            </Card>
            <Card className="bg-indigo-50 border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-700">Average Sleep</p>
                  <p className="text-3xl font-bold text-indigo-900">{averageSleep}/10</p>
                </div>
                <Moon className="w-10 h-10 text-indigo-400" />
              </div>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">Total Check-ins</p>
                  <p className="text-3xl font-bold text-amber-900">{totalCheckins}</p>
                </div>
                <Utensils className="w-10 h-10 text-amber-400" />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {checkins.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No check-ins yet</h3>
                  <p className="text-gray-600">Start by adding your first wellness check-in</p>
                </div>
              </Card>
            ) : (
              checkins.map((checkin) => (
              <Card key={checkin.id} className="border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{new Date(checkin.checkin_date).toLocaleDateString()}</h3>
                      <span className="text-2xl">
                        {checkin.mood === 'Happy' ? '😊' : checkin.mood === 'Okay' ? '😐' : '😔'}
                      </span>
                      <Badge variant="default">{checkin.mood}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{checkin.notes || 'No notes added'}</p>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[220px]">
                    <div>
                      <p className="text-xs text-gray-500">Energy</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(checkin.energy_level / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sleep</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${(checkin.sleep_hours / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Medication</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {checkin.medications_taken ? 'Taken' : 'Not taken'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
            )}
          </div>

          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-rose-500" />
                <div>
                  <p className="font-semibold text-gray-900">Share with family or care team</p>
                  <p className="text-sm text-gray-600">Send today’s wellness summary to your trusted contacts</p>
                </div>
              </div>
              <Button text="Share Summary" variant="secondary" size="sm" icon={<Share2 className="w-4 h-4" />} />
            </div>
          </Card>
        </div>

        <HealthCheckinModal
          isOpen={showHealthCheckin}
          onClose={() => setShowHealthCheckin(false)}
          onSubmit={handleHealthCheckinSubmit}
        />
      </Layout>
    </>
  )
}
