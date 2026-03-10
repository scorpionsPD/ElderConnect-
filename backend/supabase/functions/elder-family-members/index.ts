import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const userId = req.headers.get('X-User-Token') || req.headers.get('X-User-Id')
  if (!userId) {
    return jsonResponse(401, { success: false, error: 'Unauthorized - Please provide X-User-Token or X-User-Id' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse(500, { success: false, error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: elder, error: elderError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .single()

  if (elderError || !elder) return jsonResponse(404, { success: false, error: 'User not found' })
  if (elder.role !== 'ELDER') return jsonResponse(403, { success: false, error: 'Only elders can manage family members' })

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const connectionId = pathParts[pathParts.length - 1] !== 'elder-family-members' ? pathParts[pathParts.length - 1] : null

  if (req.method === 'GET' && !connectionId) {
    const { data, error } = await supabase
      .from('family_access')
      .select(`
        id,
        elder_id,
        family_member_id,
        relationship,
        access_level,
        verified,
        created_at,
        users!family_access_family_member_id_fkey (
          id,
          first_name,
          email,
          role
        )
      `)
      .eq('elder_id', userId)
      .order('created_at', { ascending: false })

    if (error) return jsonResponse(500, { success: false, error: 'Failed to fetch family members' })

    return jsonResponse(200, {
      success: true,
      data: (data || []).map((row: any) => ({
        id: row.id,
        elder_user_id: row.elder_id,
        family_user_id: row.family_member_id,
        relationship: row.relationship || 'OTHER',
        access_level: row.access_level || 'VIEW_ALL',
        verified: Boolean(row.verified),
        added_date: row.created_at,
        family_member: row.users
          ? {
              id: row.users.id,
              first_name: row.users.first_name,
              email: row.users.email,
              role: row.users.role,
            }
          : undefined,
      })),
    })
  }

  if (req.method === 'POST' && !connectionId) {
    const body = await req.json().catch(() => ({}))
    const familyEmail = String(body.family_email || '').trim().toLowerCase()
    const relationship = String(body.relationship || 'OTHER').trim()
    const accessLevel = String(body.access_level || 'VIEW_ALL').trim()

    if (!familyEmail) return jsonResponse(400, { success: false, error: 'family_email is required' })

    const { data: familyUser, error: familyErr } = await supabase
      .from('users')
      .select('id, first_name, email, role')
      .eq('email', familyEmail)
      .single()

    if (familyErr || !familyUser) return jsonResponse(404, { success: false, error: 'No family account found with this email' })
    if (familyUser.role !== 'FAMILY') return jsonResponse(400, { success: false, error: 'The provided email does not belong to a family account' })

    const { data: inserted, error: insertError } = await supabase
      .from('family_access')
      .insert({
        elder_id: userId,
        family_member_id: familyUser.id,
        relationship,
        access_level: accessLevel,
        verified: true,
        verified_by_elder: true,
      })
      .select('id, elder_id, family_member_id, relationship, access_level, verified, created_at')
      .single()

    if (insertError) {
      const message = insertError.code === '23505'
        ? 'This family member is already connected'
        : 'Failed to add family member'
      return jsonResponse(400, { success: false, error: message })
    }

    return jsonResponse(201, {
      success: true,
      message: 'Family member added successfully',
      data: {
        id: inserted.id,
        elder_user_id: inserted.elder_id,
        family_user_id: inserted.family_member_id,
        relationship: inserted.relationship,
        access_level: inserted.access_level,
        verified: Boolean(inserted.verified),
        added_date: inserted.created_at,
        family_member: {
          id: familyUser.id,
          first_name: familyUser.first_name,
          email: familyUser.email,
          role: familyUser.role,
        },
      },
    })
  }

  if (req.method === 'PUT' && connectionId) {
    const body = await req.json().catch(() => ({}))
    const relationship = String(body.relationship || '').trim()
    const accessLevel = String(body.access_level || '').trim()

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (relationship) updateData.relationship = relationship
    if (accessLevel) updateData.access_level = accessLevel
    if (Object.keys(updateData).length === 1) {
      return jsonResponse(400, { success: false, error: 'No update fields provided' })
    }

    const { data: updated, error } = await supabase
      .from('family_access')
      .update(updateData)
      .eq('id', connectionId)
      .eq('elder_id', userId)
      .select('id, elder_id, family_member_id, relationship, access_level, verified, created_at')
      .single()

    if (error || !updated) return jsonResponse(500, { success: false, error: 'Failed to update family member' })

    const { data: familyUser } = await supabase
      .from('users')
      .select('id, first_name, email, role')
      .eq('id', updated.family_member_id)
      .single()

    return jsonResponse(200, {
      success: true,
      data: {
        id: updated.id,
        elder_user_id: updated.elder_id,
        family_user_id: updated.family_member_id,
        relationship: updated.relationship,
        access_level: updated.access_level,
        verified: Boolean(updated.verified),
        added_date: updated.created_at,
        family_member: familyUser
          ? {
              id: familyUser.id,
              first_name: familyUser.first_name,
              email: familyUser.email,
              role: familyUser.role,
            }
          : undefined,
      },
    })
  }

  if (req.method === 'DELETE' && connectionId) {
    const { error } = await supabase
      .from('family_access')
      .delete()
      .eq('id', connectionId)
      .eq('elder_id', userId)

    if (error) return jsonResponse(500, { success: false, error: 'Failed to remove family member' })
    return jsonResponse(200, { success: true, message: 'Family member removed' })
  }

  return jsonResponse(405, { success: false, error: 'Method not allowed' })
})

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
