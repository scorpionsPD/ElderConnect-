import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Fetch total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Fetch pending verifications
    const { count: pendingVerifications } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Fetch total donations
    const { data: donations } = await supabase
      .from('donations')
      .select('amount')
      .eq('status', 'completed')

    const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0

    // Fetch new users this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: newUsersThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Calculate growth rate
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const { count: lastMonthUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', startOfMonth.toISOString())

    const growthRate = lastMonthUsers
      ? ((newUsersThisMonth! / lastMonthUsers) * 100).toFixed(1)
      : 0

    res.status(200).json({
      totalUsers,
      pendingVerifications,
      totalDonations,
      newUsersThisMonth,
      growthRate,
    })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}
