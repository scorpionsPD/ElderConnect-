import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      res.status(200).json({ user: data })
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Internal server error' })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { verification_status } = req.body

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ verification_status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      res.status(200).json({ user: data })
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin.from('users').delete().eq('id', id)

      if (error) throw error

      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
