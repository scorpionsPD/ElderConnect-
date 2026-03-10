import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key (server-side only)
const getSupabaseAdmin = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY on server')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

export const supabaseAdmin: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop) {
    const client = getSupabaseAdmin() as unknown as Record<string, unknown>
    return client[prop as keyof typeof client]
  },
})

// Database types
export type User = {
  id: string
  email: string
  full_name: string
  phone_number?: string
  role: 'elder' | 'volunteer'
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
  last_active?: string
  profile_image_url?: string
}

export type Donation = {
  id: string
  donor_name: string
  donor_email: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  stripe_payment_id?: string
  created_at: string
  purpose?: string
}

export type VerificationRequest = {
  id: string
  user_id: string
  user_email: string
  user_name: string
  document_type: string
  document_url: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
}

export type ActivityLog = {
  id: string
  user_id: string
  action: string
  details: string
  timestamp: string
}
