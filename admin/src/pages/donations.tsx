import React, { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import DataTable from '@/components/DataTable'
import Badge from '@/components/Badge'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { supabase, Donation } from '@/utils/supabase'
import { formatCurrency, formatDateTime, formatDate } from '@/utils/formatters'
import StatCard from '@/components/StatCard'

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    completed: 0,
  })

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('donations').select('*')

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (dateFilter === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        query = query.gte('created_at', today.toISOString())
      } else if (dateFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        query = query.gte('created_at', weekAgo.toISOString())
      } else if (dateFilter === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        query = query.gte('created_at', monthAgo.toISOString())
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setDonations(data || [])

      // Calculate stats
      const completedDonations = data?.filter(d => d.status === 'completed') || []
      const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0)
      
      const thisMonth = new Date()
      thisMonth.setMonth(thisMonth.getMonth() - 1)
      const thisMonthDonations = completedDonations.filter(
        d => new Date(d.created_at) >= thisMonth
      )
      const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0)

      setStats({
        total: totalAmount,
        thisMonth: thisMonthAmount,
        completed: completedDonations.length,
      })
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }, [dateFilter, statusFilter])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const columns = [
    {
      key: 'donor_name',
      label: 'Donor',
      render: (donation: Donation) => (
        <div>
          <p className="font-medium text-gray-900">{donation.donor_name}</p>
          <p className="text-sm text-gray-500">{donation.donor_email}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (donation: Donation) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(donation.amount, donation.currency)}
        </span>
      ),
    },
    {
      key: 'purpose',
      label: 'Purpose',
      render: (donation: Donation) => (
        <span className="text-sm text-gray-700">{donation.purpose || 'General'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (donation: Donation) => (
        <Badge status={donation.status}>
          {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (donation: Donation) => (
        <span className="text-sm text-gray-900">{formatDateTime(donation.created_at)}</span>
      ),
    },
    {
      key: 'stripe_payment_id',
      label: 'Payment ID',
      render: (donation: Donation) => (
        <span className="text-xs text-gray-500 font-mono">
          {donation.stripe_payment_id?.substring(0, 16) || 'N/A'}...
        </span>
      ),
    },
  ]

  return (
    <>
      <Head>
        <title>Donations - ElderConnect+ Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donations Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all platform donations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Donations"
              value={formatCurrency(stats.total)}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="This Month"
              value={formatCurrency(stats.thisMonth)}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={Calendar}
              color="green"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Donations Table */}
          <DataTable
            columns={columns}
            data={donations}
            keyExtractor={(donation) => donation.id}
            loading={loading}
            emptyMessage="No donations found"
          />

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Export Donations</h3>
                <p className="text-sm text-gray-500">Download donation records for reporting</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                  Export CSV
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
