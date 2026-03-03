import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { status, start_date, end_date } = req.query

    let query = supabase.from('donations').select('*')

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (start_date) {
      query = query.gte('created_at', start_date)
    }

    if (end_date) {
      query = query.lte('created_at', end_date)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    res.status(200).json({ donations: data })
  } catch (error: any) {
    console.error('Error fetching donations:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}
