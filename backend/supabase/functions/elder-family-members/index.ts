import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const inviteEmailFrom = Deno.env.get('INVITE_EMAIL_FROM') || Deno.env.get('EMERGENCY_EMAIL_FROM') || 'info@elderconnect.app'

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

    const { data: pendingInvites } = await supabase
      .from('family_invitations')
      .select('id, family_email, relationship, access_level, status, resend_count, last_sent_at, created_at')
      .eq('elder_id', userId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })

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
      invitations: (pendingInvites || []).map((invite: any) => ({
        id: invite.id,
        family_email: invite.family_email,
        relationship: invite.relationship || 'OTHER',
        access_level: invite.access_level || 'VIEW_ALL',
        status: invite.status || 'PENDING',
        resend_count: Number(invite.resend_count || 0),
        resend_available: Number(invite.resend_count || 0) < 1,
        last_sent_at: invite.last_sent_at,
        created_at: invite.created_at,
      })),
    })
  }

  if (req.method === 'POST' && !connectionId) {
    const body = await req.json().catch(() => ({}))
    const resendInvitationId = String(body.resend_invitation_id || '').trim()
    const familyEmail = String(body.family_email || '').trim().toLowerCase()
    const relationship = String(body.relationship || 'OTHER').trim()
    const accessLevel = String(body.access_level || 'VIEW_ALL').trim()

    if (resendInvitationId) {
      const { data: invite, error: inviteError } = await supabase
        .from('family_invitations')
        .select('id, family_email, relationship, access_level, resend_count, status')
        .eq('id', resendInvitationId)
        .eq('elder_id', userId)
        .single()

      if (inviteError || !invite) {
        return jsonResponse(404, { success: false, error: 'Invitation not found' })
      }
      if (invite.status !== 'PENDING') {
        return jsonResponse(400, { success: false, error: 'Invitation is no longer pending' })
      }
      if (Number(invite.resend_count || 0) >= 1) {
        return jsonResponse(400, { success: false, error: 'Resend limit reached for this invitation' })
      }

      await sendFamilyInviteEmail(invite.family_email, invite.relationship || 'OTHER')

      const { data: updatedInvite, error: updateInviteError } = await supabase
        .from('family_invitations')
        .update({
          resend_count: Number(invite.resend_count || 0) + 1,
          last_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', resendInvitationId)
        .eq('elder_id', userId)
        .select('id, family_email, relationship, access_level, status, resend_count, last_sent_at, created_at')
        .single()

      if (updateInviteError || !updatedInvite) {
        return jsonResponse(500, { success: false, error: 'Failed to update invitation resend status' })
      }

      return jsonResponse(200, {
        success: true,
        message: 'Invitation resent successfully',
        invitation: {
          id: updatedInvite.id,
          family_email: updatedInvite.family_email,
          relationship: updatedInvite.relationship || 'OTHER',
          access_level: updatedInvite.access_level || 'VIEW_ALL',
          status: updatedInvite.status || 'PENDING',
          resend_count: Number(updatedInvite.resend_count || 0),
          resend_available: Number(updatedInvite.resend_count || 0) < 1,
          last_sent_at: updatedInvite.last_sent_at,
          created_at: updatedInvite.created_at,
        },
      })
    }

    if (!familyEmail) return jsonResponse(400, { success: false, error: 'family_email is required' })

    const { data: familyUser, error: familyErr } = await supabase
      .from('users')
      .select('id, first_name, email, role')
      .eq('email', familyEmail)
      .single()

    if (familyErr || !familyUser) {
      const { data: existingInvite } = await supabase
        .from('family_invitations')
        .select('id, resend_count, status')
        .eq('elder_id', userId)
        .eq('family_email', familyEmail)
        .maybeSingle()

      if (existingInvite && existingInvite.status === 'PENDING') {
        return jsonResponse(400, {
          success: false,
          error: Number(existingInvite.resend_count || 0) < 1
            ? 'Invitation already pending. You can resend once.'
            : 'Invitation already pending and resend limit reached.',
        })
      }

      const { data: createdInvite, error: inviteCreateError } = await supabase
        .from('family_invitations')
        .upsert({
          elder_id: userId,
          family_email: familyEmail,
          relationship,
          access_level: accessLevel,
          status: 'PENDING',
          resend_count: 0,
          last_sent_at: new Date().toISOString(),
          accepted_at: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'elder_id,family_email' })
        .select('id, family_email, relationship, access_level, status, resend_count, last_sent_at, created_at')
        .single()

      if (inviteCreateError || !createdInvite) {
        return jsonResponse(500, { success: false, error: 'Failed to create invitation' })
      }

      await sendFamilyInviteEmail(familyEmail, relationship)
      return jsonResponse(201, {
        success: true,
        invited: true,
        message: 'Invitation sent. Ask the family member to create a Family account with this email.',
        invitation: {
          id: createdInvite.id,
          family_email: createdInvite.family_email,
          relationship: createdInvite.relationship || 'OTHER',
          access_level: createdInvite.access_level || 'VIEW_ALL',
          status: createdInvite.status || 'PENDING',
          resend_count: Number(createdInvite.resend_count || 0),
          resend_available: Number(createdInvite.resend_count || 0) < 1,
          last_sent_at: createdInvite.last_sent_at,
          created_at: createdInvite.created_at,
        },
      })
    }
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

    await supabase
      .from('family_invitations')
      .update({
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('elder_id', userId)
      .eq('family_email', familyEmail)
      .eq('status', 'PENDING')

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

async function sendFamilyInviteEmail(email: string, relationship: string) {
  if (!resendApiKey || !email) return

  const appUrl = Deno.env.get('APP_BASE_URL') || 'https://elderconnect.app'
  const signupUrl = `${appUrl}/signup`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: inviteEmailFrom,
        to: [email],
        subject: 'Invitation to join ElderConnect+ family access',
        html: `<p>You have been invited to join ElderConnect+ as a family member (${relationship}).</p><p>Create your account to start supporting your elder:</p><p><a href="${signupUrl}">${signupUrl}</a></p>`,
      }),
    })
  } catch {
    // Invitation email failure should not block the flow.
  }
}
