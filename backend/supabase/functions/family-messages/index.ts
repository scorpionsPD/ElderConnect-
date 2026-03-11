import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse(200, 'ok', false)
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Method not allowed' })
  }

  const userId = extractUserId(req)
  if (!userId) {
    return jsonResponse(401, { success: false, error: 'Unauthorized - valid token or user header is required' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { success: false, error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data: currentUser, error: userError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (userError || !currentUser) {
    return jsonResponse(404, { success: false, error: 'User not found' })
  }

  const url = new URL(req.url)
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
  const elderUserIdParam = String(url.searchParams.get('elder_user_id') || body?.elder_user_id || '').trim()

  let elderUserId = elderUserIdParam
  if (currentUser.role === 'ELDER') {
    elderUserId = currentUser.id
  }

  if (!elderUserId) {
    return jsonResponse(400, { success: false, error: 'elder_user_id is required' })
  }

  if (currentUser.role !== 'ELDER' && currentUser.role !== 'FAMILY') {
    return jsonResponse(403, { success: false, error: 'Only elders and invited family members can use family chat' })
  }

  if (currentUser.role === 'FAMILY') {
    const { data: access, error: accessError } = await supabase
      .from('family_access')
      .select('id')
      .eq('elder_id', elderUserId)
      .eq('family_member_id', currentUser.id)
      .eq('verified', true)
      .maybeSingle()

    if (accessError) {
      return jsonResponse(500, { success: false, error: 'Failed to validate family access' })
    }
    if (!access) {
      return jsonResponse(403, { success: false, error: 'You are not connected to this elder' })
    }
  }

  if (req.method === 'GET') {
    const { data: messages, error: listError } = await supabase
      .from('family_messages')
      .select(`
        id,
        elder_id,
        sender_id,
        message_text,
        created_at,
        sender:users!family_messages_sender_id_fkey(
          id,
          first_name,
          email,
          role
        )
      `)
      .eq('elder_id', elderUserId)
      .order('created_at', { ascending: true })

    if (listError) {
      return jsonResponse(500, { success: false, error: 'Failed to fetch family messages' })
    }

    return jsonResponse(200, { success: true, data: messages || [] })
  }

  const messageText = String(body?.message_text || '').trim()
  if (!messageText) {
    return jsonResponse(400, { success: false, error: 'message_text is required' })
  }

  const { data: inserted, error: insertError } = await supabase
    .from('family_messages')
    .insert({
      elder_id: elderUserId,
      sender_id: currentUser.id,
      message_text: messageText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(`
      id,
      elder_id,
      sender_id,
      message_text,
      created_at,
      sender:users!family_messages_sender_id_fkey(
        id,
        first_name,
        email,
        role
      )
    `)
    .single()

  if (insertError || !inserted) {
    return jsonResponse(500, { success: false, error: 'Failed to send family message' })
  }

  return jsonResponse(201, { success: true, message: 'Message sent', data: inserted })
})

function extractUserId(req: Request): string | null {
  const authHeader = req.headers.get('Authorization')
  const userTokenHeader = req.headers.get('X-User-Token')
  const userIdHeader = req.headers.get('X-User-Id')

  let userId: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        userId = payload.user_id || payload.sub || null
      }
    } catch {
      userId = null
    }
  }

  if (!userId && userTokenHeader) userId = userTokenHeader
  if (!userId && userIdHeader) userId = userIdHeader
  return userId
}

function jsonResponse(status: number, payload: unknown, stringify: boolean = true) {
  return new Response(stringify ? JSON.stringify(payload) : String(payload), {
    status,
    headers: {
      ...(stringify ? { 'Content-Type': 'application/json' } : {}),
      ...corsHeaders,
    },
  })
}
