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
    return jsonResponse(401, { success: false, error: 'Unauthorized - valid token or X-User-Token is required' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { success: false, error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const url = new URL(req.url)
  const requestId = url.searchParams.get('request_id') || ''

  if (!requestId) {
    return jsonResponse(400, { success: false, error: 'request_id is required' })
  }

  const { data: companionRequest, error: requestError } = await supabase
    .from('companion_requests')
    .select('id, elder_id, volunteer_id, status')
    .eq('id', requestId)
    .single()

  if (requestError || !companionRequest) {
    return jsonResponse(404, { success: false, error: 'Companion request not found' })
  }

  const allowedStatuses = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED']
  if (!allowedStatuses.includes(companionRequest.status)) {
    return jsonResponse(400, { success: false, error: 'Chat is available only after a request is accepted' })
  }

  const isElder = companionRequest.elder_id === userId
  const isVolunteer = companionRequest.volunteer_id === userId
  if (!isElder && !isVolunteer) {
    return jsonResponse(403, { success: false, error: 'You are not part of this companion request' })
  }

  if (!companionRequest.volunteer_id) {
    return jsonResponse(400, { success: false, error: 'No volunteer assigned to this request yet' })
  }

  if (req.method === 'GET') {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        message_text,
        is_read,
        created_at,
        sender:users!messages_sender_id_fkey(id, first_name, email)
      `)
      .or(
        `and(sender_id.eq.${companionRequest.elder_id},recipient_id.eq.${companionRequest.volunteer_id}),and(sender_id.eq.${companionRequest.volunteer_id},recipient_id.eq.${companionRequest.elder_id})`
      )
      .order('created_at', { ascending: true })

    if (messagesError) {
      return jsonResponse(500, { success: false, error: 'Failed to fetch messages' })
    }

    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .or(
        `and(sender_id.eq.${companionRequest.elder_id},recipient_id.eq.${companionRequest.volunteer_id}),and(sender_id.eq.${companionRequest.volunteer_id},recipient_id.eq.${companionRequest.elder_id})`
      )

    return jsonResponse(200, { success: true, data: messages || [] })
  }

  const body = await req.json().catch(() => ({}))
  const messageText = String(body.message_text || '').trim()
  if (!messageText) {
    return jsonResponse(400, { success: false, error: 'message_text is required' })
  }

  const recipientId = isElder ? companionRequest.volunteer_id : companionRequest.elder_id

  const { data: inserted, error: insertError } = await supabase
    .from('messages')
    .insert({
      sender_id: userId,
      recipient_id: recipientId,
      message_text: messageText,
      message_type: 'TEXT',
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(`
      id,
      sender_id,
      recipient_id,
      message_text,
      is_read,
      created_at,
      sender:users!messages_sender_id_fkey(id, first_name, email)
    `)
    .single()

  if (insertError || !inserted) {
    return jsonResponse(500, { success: false, error: 'Failed to send message' })
  }

  return jsonResponse(201, {
    success: true,
    message: 'Message sent',
    data: inserted,
  })
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
