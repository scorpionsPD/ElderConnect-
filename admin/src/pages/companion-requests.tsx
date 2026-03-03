import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Input from '@/components/Input'
import CompanionRequestModal, { CompanionRequestData } from '@/components/CompanionRequestModal'
import { useToast } from '@/contexts/ToastContext'
import { useCompanionRequests } from '@/hooks'
import { Calendar, Clock, MapPin, AlertCircle, Filter, Plus, Eye, Search, X } from 'lucide-react'

export default function CompanionRequestsPage() {
  const toast = useToast()
  const { requests = [], createRequest, loading } = useCompanionRequests()
  const [showCompanionRequest, setShowCompanionRequest] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const statusTabs = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  const getBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (status === 'PENDING') return 'warning'
    if (status === 'ACCEPTED' || status === 'COMPLETED') return 'success'
    if (status === 'IN_PROGRESS') return 'info'
    if (status === 'CANCELLED') return 'error'
    return 'default'
  }

  const handleCompanionRequestSubmit = async (data: CompanionRequestData) => {
    const preferredStart = data.date && data.time ? new Date(`${data.date}T${data.time}`).toISOString() : undefined
    const preferredEnd = preferredStart
      ? new Date(new Date(preferredStart).getTime() + data.duration * 60 * 60 * 1000).toISOString()
      : undefined

    const created = await createRequest(
      data.serviceType,
      data.description,
      preferredStart,
      preferredEnd,
      data.locationLatitude,
      data.locationLongitude
    )

    if (created) {
      toast.success('Companion request submitted successfully!')
      setShowCompanionRequest(false)
      return
    }

    toast.error('Failed to submit companion request')
  }

  // Filter and search requests
  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        req.activity_type?.toLowerCase().includes(query) ||
        req.description?.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
  }

  const activeFiltersCount = (statusFilter !== 'ALL' ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <>
      <Head>
        <title>Companion Requests - ElderConnect+</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Companion Requests</h1>
              <p className="text-sm text-gray-600">Manage and review companion support requests</p>
            </div>
            <div className="flex gap-2">
              <Button text="New Request" variant="primary" size="sm" icon={<Plus className="w-4 w-4" />} onClick={() => setShowCompanionRequest(true)} />
              <Button 
                text={`Filters${activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}`} 
                variant="secondary" 
                size="sm" 
                icon={<Filter className="w-4 h-4" />} 
                onClick={() => setShowFilters(!showFilters)}
              />
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      text="Clear All"
                      variant="ghost"
                      size="sm"
                      icon={<X className="w-4 h-4" />}
                      onClick={clearFilters}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search requests..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {statusTabs.map((status) => (
                        <option key={status} value={status}>
                          {status === 'ALL' ? 'All Status' : status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    statusFilter === status
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">Open Requests</p>
                <p className="text-2xl font-bold text-blue-900">
                  {requests.filter((req) => req.status === 'PENDING').length}
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">Accepted</p>
                <p className="text-2xl font-bold text-green-900">
                  {requests.filter((req) => req.status === 'ACCEPTED').length}
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">Completed</p>
                <p className="text-2xl font-bold text-amber-900">
                  {requests.filter((req) => req.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search query</p>
                </div>
              </Card>
            ) : (
              filteredRequests.map((req) => (
              <Card key={req.id} className="border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{req.activity_type}</h3>
                      <Badge variant={getBadgeVariant(req.status)}>
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{req.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {req.preferred_time_start && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {new Date(req.preferred_time_start).toLocaleDateString()}
                        </span>
                      )}
                      {req.preferred_time_start && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {new Date(req.preferred_time_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {req.location_latitude && req.location_longitude && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> Location set
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-start lg:items-end">
                    <div className="flex gap-2">
                      <Button text="View Details" size="sm" variant="secondary" icon={<Eye className="w-4 h-4" />} />
                      <Button text={req.status === 'PENDING' ? 'Open' : 'View'} size="sm" variant="primary" disabled={loading} />
                    </div>
                  </div>
                </div>
              </Card>
            ))
            )}
          </div>
        </div>

        <CompanionRequestModal
          isOpen={showCompanionRequest}
          onClose={() => setShowCompanionRequest(false)}
          onSubmit={handleCompanionRequestSubmit}
        />
      </Layout>
    </>
  )
}
