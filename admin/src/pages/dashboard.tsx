import React, { useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import StatCard from '@/components/StatCard'
import { Users, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { formatCurrency } from '@/utils/formatters'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

type DashboardStats = {
  totalUsers: number
  pendingVerifications: number
  totalDonations: number
  monthlyGrowth: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalDonations: 0,
    monthlyGrowth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [userGrowthData, setUserGrowthData] = useState<any[]>([])
  const [donationData, setDonationData] = useState<any[]>([])

  const fetchMonthlyUserGrowth = useCallback(async () => {
    return [
      { month: 'Jan', users: 120 },
      { month: 'Feb', users: 145 },
      { month: 'Mar', users: 178 },
      { month: 'Apr', users: 210 },
      { month: 'May', users: 245 },
      { month: 'Jun', users: 289 },
    ]
  }, [])

  const fetchDonationTrends = useCallback(async () => {
    return [
      { month: 'Jan', amount: 2500 },
      { month: 'Feb', amount: 3200 },
      { month: 'Mar', amount: 2800 },
      { month: 'Apr', amount: 4100 },
      { month: 'May', amount: 3800 },
      { month: 'Jun', amount: 5200 },
    ]
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Fetch pending verifications
      const { count: pendingCount } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch total donations
      const { data: donations } = await supabase
        .from('donations')
        .select('amount')
        .eq('status', 'completed')

      const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0

      // Calculate monthly growth
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      
      const { count: lastMonthUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', lastMonth.toISOString())

      const growthRate = lastMonthUsers 
        ? ((usersCount! - lastMonthUsers) / lastMonthUsers) * 100 
        : 0

      setStats({
        totalUsers: usersCount || 0,
        pendingVerifications: pendingCount || 0,
        totalDonations,
        monthlyGrowth: Math.round(growthRate * 10) / 10,
      })

      // Fetch user growth data (last 6 months)
      const monthlyData = await fetchMonthlyUserGrowth()
      setUserGrowthData(monthlyData)

      // Fetch donation trends
      const donationTrends = await fetchDonationTrends()
      setDonationData(donationTrends)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchDonationTrends, fetchMonthlyUserGrowth])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - ElderConnect+ Admin</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
              trend={{
                value: `${stats.monthlyGrowth}% this month`,
                isPositive: stats.monthlyGrowth > 0,
              }}
            />
            <StatCard
              title="Pending Verifications"
              value={stats.pendingVerifications}
              icon={CheckCircle}
              color="yellow"
            />
            <StatCard
              title="Total Donations"
              value={formatCurrency(stats.totalDonations)}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Monthly Growth"
              value={`${stats.monthlyGrowth}%`}
              icon={TrendingUp}
              color={stats.monthlyGrowth > 0 ? 'green' : 'red'}
              trend={{
                value: 'vs last month',
                isPositive: stats.monthlyGrowth > 0,
              }}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#0284c7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Donation Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <ActivityItem
                  action="New user registered"
                  user="John Doe"
                  time="2 minutes ago"
                />
                <ActivityItem
                  action="Verification approved"
                  user="Jane Smith"
                  time="15 minutes ago"
                />
                <ActivityItem
                  action="Donation received"
                  user="Anonymous"
                  time="1 hour ago"
                  amount="$50.00"
                />
                <ActivityItem
                  action="New verification request"
                  user="Bob Johnson"
                  time="2 hours ago"
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

function ActivityItem({ action, user, time, amount }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-sm text-gray-500">{user} • {time}</p>
      </div>
      {amount && (
        <span className="text-sm font-semibold text-green-600">{amount}</span>
      )}
    </div>
  )
}
