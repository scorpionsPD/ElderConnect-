import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query
  const verificationId = Array.isArray(id) ? id[0] : id
  if (!verificationId) {
    return res.status(400).json({ message: 'Missing verification id' })
  }
  const { status, rejection_reason } = req.body

  try {
    // Update verification request
    const { data: verification, error: verifyError } = await supabaseAdmin
      .from('verification_requests')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        rejection_reason: status === 'rejected' ? rejection_reason : null,
      })
      .eq('id', verificationId)
      .select()
      .single()

    if (verifyError) throw verifyError

    // Update user verification status
    const userStatus = status === 'approved' ? 'verified' : 'rejected'
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ verification_status: userStatus })
      .eq('id', verification.user_id)

    if (userError) throw userError

    res.status(200).json({ verification })
  } catch (error: any) {
    console.error('Error updating verification:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}
