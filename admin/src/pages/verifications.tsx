import React, { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import { useToast } from '@/contexts/ToastContext'
import { FileCheck, Eye, Check, X } from 'lucide-react'
import { supabase, VerificationRequest } from '@/utils/supabase'
import { formatDateTime } from '@/utils/formatters'

export default function VerificationsPage() {
  const toast = useToast()
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchVerificationRequests = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('verification_requests').select('*')

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query.order('submitted_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching verification requests:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchVerificationRequests()
  }, [fetchVerificationRequests])

  const handleViewDetails = (request: VerificationRequest) => {
    setSelectedRequest(request)
    setRejectionReason('')
    setShowDetailsModal(true)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      // Update verification request status
      const { error: verifyError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin', // Replace with actual admin ID
        })
        .eq('id', selectedRequest.id)

      if (verifyError) throw verifyError

      // Update user verification status
      const { error: userError } = await supabase
        .from('users')
        .update({ verification_status: 'verified' })
        .eq('id', selectedRequest.user_id)

      if (userError) throw userError

      toast.success('Verification approved successfully')
      fetchVerificationRequests()
      setShowDetailsModal(false)
    } catch (error) {
      console.error('Error approving verification:', error)
      toast.error('Failed to approve verification')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setProcessing(true)
    try {
      // Update verification request status
      const { error: verifyError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedRequest.id)

      if (verifyError) throw verifyError

      // Update user verification status
      const { error: userError } = await supabase
        .from('users')
        .update({ verification_status: 'rejected' })
        .eq('id', selectedRequest.user_id)

      if (userError) throw userError

      toast.success('Verification rejected')
      fetchVerificationRequests()
      setShowDetailsModal(false)
    } catch (error) {
      console.error('Error rejecting verification:', error)
      toast.error('Failed to reject verification')
    } finally {
      setProcessing(false)
    }
  }

  const columns = [
    {
      key: 'user_name',
      label: 'User',
      render: (request: VerificationRequest) => (
        <div>
          <p className="font-medium text-gray-900">{request.user_name}</p>
          <p className="text-sm text-gray-500">{request.user_email}</p>
        </div>
      ),
    },
    {
      key: 'document_type',
      label: 'Document Type',
      render: (request: VerificationRequest) => (
        <span className="text-sm text-gray-900 capitalize">
          {request.document_type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (request: VerificationRequest) => (
        <Badge status={request.status}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (request: VerificationRequest) => (
        <span className="text-sm text-gray-900">
          {formatDateTime(request.submitted_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (request: VerificationRequest) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleViewDetails(request)}
        >
          Review
        </Button>
      ),
    },
  ]

  return (
    <>
      <Head>
        <title>Verifications - ElderConnect+ Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
              <p className="text-gray-600 mt-1">Review and approve user verification documents</p>
            </div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-6 h-6 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </span>
              <span className="text-gray-600">Pending</span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'pending'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'approved'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'rejected'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Verifications Table */}
          <DataTable
            columns={columns}
            data={requests}
            keyExtractor={(request) => request.id}
            loading={loading}
            emptyMessage="No verification requests found"
          />
        </div>

        {/* Verification Details Modal */}
        {selectedRequest && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title="Verification Request Details"
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">User Name</label>
                  <p className="text-gray-900">{selectedRequest.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedRequest.user_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Document Type</label>
                  <p className="text-gray-900 capitalize">
                    {selectedRequest.document_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge status={selectedRequest.status}>{selectedRequest.status}</Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Submitted At</label>
                  <p className="text-gray-900">{formatDateTime(selectedRequest.submitted_at)}</p>
                </div>
              </div>

              {/* Document Preview */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Document Preview
                </label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Image
                    src={selectedRequest.document_url}
                    alt="Verification document"
                    width={800}
                    height={600}
                    unoptimized
                    className="max-w-full h-auto rounded"
                  />
                  <a
                    href={selectedRequest.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                  >
                    View full document →
                  </a>
                </div>
              </div>

              {/* Rejection Reason (for rejected requests) */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Rejection Reason</label>
                  <p className="text-gray-900 bg-red-50 p-3 rounded-lg">
                    {selectedRequest.rejection_reason}
                  </p>
                </div>
              )}

              {/* Rejection Input (for pending requests) */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t flex justify-end space-x-3">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                      onClick={handleApprove}
                      loading={processing}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      icon={<X className="w-4 h-4" />}
                      onClick={handleReject}
                      loading={processing}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </Layout>
    </>
  )
}
