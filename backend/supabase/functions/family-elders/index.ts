import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const userId = getUserId(req)
  if (!userId) {
    return jsonResponse(401, { success: false, error: 'Unauthorized - Please provide X-User-Token or X-User-Id' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse(500, { success: false, error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (currentUserError || !currentUser) {
    return jsonResponse(404, { success: false, error: 'User not found' })
  }

  if (currentUser.role !== 'FAMILY') {
    return jsonResponse(403, { success: false, error: 'Only family users can manage elder connections' })
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const connectionId = pathParts[pathParts.length - 1] !== 'family-elders' ? pathParts[pathParts.length - 1] : null

  if (req.method === 'GET' && !connectionId) {
    const { data, error } = await supabase
      .from('family_access')
      .select(`
        id,
        elder_id,
        family_member_id,
        relationship,
        created_at,
        users!family_access_elder_id_fkey (
          id,
          first_name,
          email,
          role
        )
      `)
      .eq('family_member_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to list family connections', error)
      return jsonResponse(500, { success: false, error: 'Failed to fetch family connections' })
    }

    const normalized = (data || []).map((row: any) => ({
      id: row.id,
      family_user_id: row.family_member_id,
      elder_user_id: row.elder_id,
      relationship: row.relationship || 'OTHER',
      added_date: row.created_at,
      elder: row.users
        ? {
            id: row.users.id,
            first_name: row.users.first_name,
            email: row.users.email,
            role: row.users.role,
          }
        : undefined,
    }))

    return jsonResponse(200, { success: true, data: normalized })
  }

  if (req.method === 'POST' && !connectionId) {
    const body = await req.json().catch(() => ({}))
    const elderEmail = String(body.elder_email || '').trim().toLowerCase()
    const relationship = String(body.relationship || 'OTHER').trim()

    if (!elderEmail) {
      return jsonResponse(400, { success: false, error: 'elder_email is required' })
    }

    const { data: elderUser, error: elderError } = await supabase
      .from('users')
      .select('id, first_name, email, role')
      .eq('email', elderEmail)
      .single()

    if (elderError || !elderUser) {
      return jsonResponse(404, { success: false, error: 'No elder account found with this email' })
    }

    if (elderUser.role !== 'ELDER') {
      return jsonResponse(400, { success: false, error: 'The provided email does not belong to an elder account' })
    }

    const { data: inserted, error: insertError } = await supabase
      .from('family_access')
      .insert({
        elder_id: elderUser.id,
        family_member_id: userId,
        relationship,
        access_level: 'VIEW_ALL',
        verified: true,
        verified_by_elder: true,
      })
      .select('id, elder_id, family_member_id, relationship, created_at')
      .single()

    if (insertError) {
      const message = insertError.code === '23505'
        ? 'This elder is already connected to your account'
        : 'Failed to add elder connection'
      return jsonResponse(400, { success: false, error: message })
    }

    return jsonResponse(201, {
      success: true,
      message: 'Elder connected successfully',
      data: {
        id: inserted.id,
        family_user_id: inserted.family_member_id,
        elder_user_id: inserted.elder_id,
        relationship: inserted.relationship,
        added_date: inserted.created_at,
        elder: {
          id: elderUser.id,
          first_name: elderUser.first_name,
          email: elderUser.email,
          role: elderUser.role,
        },
      },
    })
  }

  if (connectionId && req.method === 'PUT') {
    const body = await req.json().catch(() => ({}))
    const relationship = String(body.relationship || '').trim()

    if (!relationship) {
      return jsonResponse(400, { success: false, error: 'relationship is required' })
    }

    const { data: existing, error: existingError } = await supabase
      .from('family_access')
      .select('id, elder_id, family_member_id')
      .eq('id', connectionId)
      .eq('family_member_id', userId)
      .single()

    if (existingError || !existing) {
      return jsonResponse(404, { success: false, error: 'Connection not found' })
    }

    const { data: updated, error: updateError } = await supabase
      .from('family_access')
      .update({ relationship, updated_at: new Date().toISOString() })
      .eq('id', connectionId)
      .eq('family_member_id', userId)
      .select('id, elder_id, family_member_id, relationship, created_at')
      .single()

    if (updateError || !updated) {
      return jsonResponse(500, { success: false, error: 'Failed to update connection' })
    }

    const { data: elder } = await supabase
      .from('users')
      .select('id, first_name, email, role')
      .eq('id', updated.elder_id)
      .single()

    return jsonResponse(200, {
      success: true,
      message: 'Relationship updated successfully',
      data: {
        id: updated.id,
        family_user_id: updated.family_member_id,
        elder_user_id: updated.elder_id,
        relationship: updated.relationship,
        added_date: updated.created_at,
        elder: elder
          ? {
              id: elder.id,
              first_name: elder.first_name,
              email: elder.email,
              role: elder.role,
            }
          : undefined,
      },
    })
  }

  if (connectionId && req.method === 'DELETE') {
    const { error } = await supabase
      .from('family_access')
      .delete()
      .eq('id', connectionId)
      .eq('family_member_id', userId)

    if (error) {
      return jsonResponse(500, { success: false, error: 'Failed to remove elder connection' })
    }

    return jsonResponse(200, { success: true, message: 'Elder connection removed' })
  }

  return jsonResponse(405, { success: false, error: 'Method not allowed' })
})

function getUserId(req: Request): string | null {
  const userTokenHeader = req.headers.get('X-User-Token')
  const userIdHeader = req.headers.get('X-User-Id')
  if (userTokenHeader) return userTokenHeader
  if (userIdHeader) return userIdHeader
  return null
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
