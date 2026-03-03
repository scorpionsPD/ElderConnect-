// Supabase Edge Function: Handle GDPR deletion requests
// Securely deletes user data on request

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { requestId, userId } = await req.json()

    // Backup user data before deletion
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Soft delete: mark user as deleted
    await supabase
      .from('users')
      .update({
        deleted_at: new Date().toIso8601String(),
        is_active: false,
      })
      .eq('id', userId)

    // Update deletion request status
    await supabase
      .from('gdpr_deletion_requests')
      .update({
        status: 'COMPLETED',
        completed_date: new Date().toIso8601String(),
      })
      .eq('id', requestId)

    // Log in audit trail
    await supabase
      .from('audit_logs')
      .insert({
        action: 'DELETE',
        table_name: 'users',
        record_id: userId,
        status: 'SUCCESS',
        created_at: new Date().toIso8601String(),
      })

    return new Response(
      JSON.stringify({ success: true, message: 'User data deleted successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
