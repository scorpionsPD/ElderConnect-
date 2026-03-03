import React, { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { useToast } from '@/contexts/ToastContext'
import { Search, Filter, Eye } from 'lucide-react'
import { supabase, User } from '@/utils/supabase'
import { formatDate, formatRelativeTime } from '@/utils/formatters'

export default function UsersPage() {
  const toast = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('users').select('*')

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ verification_status: newStatus })
        .eq('id', userId)

      if (error) throw error
      
      // Refresh users list
      fetchUsers()
      setShowDetailsModal(false)
      toast.success('User status updated successfully')
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (user: User) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-primary-700 font-medium">
              {user.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => (
        <Badge variant={user.role === 'elder' ? 'info' : 'success'}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'verification_status',
      label: 'Status',
      render: (user: User) => (
        <Badge status={user.verification_status}>
          {user.verification_status.charAt(0).toUpperCase() + user.verification_status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (user: User) => (
        <div>
          <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
          <p className="text-xs text-gray-500">{formatRelativeTime(user.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleViewDetails(user)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <>
      <Head>
        <title>Users - ElderConnect+ Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Roles</option>
                <option value="elder">Elder</option>
                <option value="volunteer">Volunteer</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <DataTable
            columns={columns}
            data={filteredUsers}
            keyExtractor={(user) => user.id}
            loading={loading}
            emptyMessage="No users found"
          />
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title="User Details"
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900">{selectedUser.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedUser.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <p className="text-gray-900 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge status={selectedUser.verification_status}>
                      {selectedUser.verification_status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Joined</label>
                  <p className="text-gray-900">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end space-x-3">
                {selectedUser.verification_status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'verified')}
                    >
                      Verify User
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'rejected')}
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
