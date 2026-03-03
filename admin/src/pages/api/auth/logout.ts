import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error: any) {
    console.error('Error logging out:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}
