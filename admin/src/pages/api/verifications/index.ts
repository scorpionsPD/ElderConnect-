import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { status } = req.query

    let query = supabase.from('verification_requests').select('*')

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('submitted_at', { ascending: false })

    if (error) throw error

    res.status(200).json({ verifications: data })
  } catch (error: any) {
    console.error('Error fetching verification requests:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}
