import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Token, X-User-Id, apikey',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET' && req.method !== 'PUT') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const userId = getUserId(req)
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized - Please provide X-User-Token or X-User-Id' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('preferred_language, accessibility_large_fonts, accessibility_high_contrast, accessibility_voice_enabled, two_factor_enabled, data_consent')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to load user preferences' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const rolePreferences = await loadRolePreferences(supabase, userId)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          preferredLanguage: data.preferred_language ?? 'en',
          accessibilityLargeFonts: data.accessibility_large_fonts ?? false,
          accessibilityHighContrast: data.accessibility_high_contrast ?? false,
          accessibilityVoiceEnabled: data.accessibility_voice_enabled ?? false,
          twoFactorEnabled: data.two_factor_enabled ?? false,
          dataSharingConsent: data.data_consent ?? true,
          marketingEmails: typeof rolePreferences.marketingEmails === 'boolean' ? rolePreferences.marketingEmails : false,
          preferredActivityTypes: Array.isArray(rolePreferences.preferredActivityTypes) ? rolePreferences.preferredActivityTypes : [],
          availabilityDays: Array.isArray(rolePreferences.availabilityDays) ? rolePreferences.availabilityDays : [],
          volunteerTravelDistance: typeof rolePreferences.volunteerTravelDistance === 'string' ? rolePreferences.volunteerTravelDistance : '',
          notifyOnElderActivity: typeof rolePreferences.notifyOnElderActivity === 'boolean' ? rolePreferences.notifyOnElderActivity : true,
          shareMedicationReminders: typeof rolePreferences.shareMedicationReminders === 'boolean' ? rolePreferences.shareMedicationReminders : true,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const body = await req.json().catch(() => ({}))

  const updatePayload: Record<string, unknown> = {}
  if (typeof body.preferredLanguage === 'string') {
    updatePayload.preferred_language = body.preferredLanguage
  }
  if (typeof body.accessibilityLargeFonts === 'boolean') {
    updatePayload.accessibility_large_fonts = body.accessibilityLargeFonts
  }
  if (typeof body.accessibilityHighContrast === 'boolean') {
    updatePayload.accessibility_high_contrast = body.accessibilityHighContrast
  }
  if (typeof body.accessibilityVoiceEnabled === 'boolean') {
    updatePayload.accessibility_voice_enabled = body.accessibilityVoiceEnabled
  }
  if (typeof body.twoFactorEnabled === 'boolean') {
    updatePayload.two_factor_enabled = body.twoFactorEnabled
  }
  if (typeof body.dataSharingConsent === 'boolean') {
    updatePayload.data_consent = body.dataSharingConsent
  }

  const rolePreferenceChanges: Record<string, unknown> = {}
  if (Array.isArray(body.preferredActivityTypes)) rolePreferenceChanges.preferredActivityTypes = body.preferredActivityTypes
  if (Array.isArray(body.availabilityDays)) rolePreferenceChanges.availabilityDays = body.availabilityDays
  if (typeof body.volunteerTravelDistance === 'string') rolePreferenceChanges.volunteerTravelDistance = body.volunteerTravelDistance
  if (typeof body.marketingEmails === 'boolean') rolePreferenceChanges.marketingEmails = body.marketingEmails
  if (typeof body.notifyOnElderActivity === 'boolean') rolePreferenceChanges.notifyOnElderActivity = body.notifyOnElderActivity
  if (typeof body.shareMedicationReminders === 'boolean') rolePreferenceChanges.shareMedicationReminders = body.shareMedicationReminders

  if (Object.keys(updatePayload).length === 0 && Object.keys(rolePreferenceChanges).length === 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'No supported preference fields to update', data: {} }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  let updated: Record<string, unknown> = {}
  if (Object.keys(updatePayload).length > 0) {
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('preferred_language, accessibility_large_fonts, accessibility_high_contrast, accessibility_voice_enabled, two_factor_enabled, data_consent')
      .single()

    if (updateError || !updatedUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save user preferences' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
    updated = updatedUser as Record<string, unknown>
  } else {
    const { data: currentUser, error: currentError } = await supabase
      .from('users')
      .select('preferred_language, accessibility_large_fonts, accessibility_high_contrast, accessibility_voice_enabled, two_factor_enabled, data_consent')
      .eq('id', userId)
      .single()

    if (currentError || !currentUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to load user preferences' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
    updated = currentUser as Record<string, unknown>
  }

  let mergedRolePreferences: Record<string, unknown> = await loadRolePreferences(supabase, userId)
  if (Object.keys(rolePreferenceChanges).length > 0) {
    mergedRolePreferences = {
      ...mergedRolePreferences,
      ...rolePreferenceChanges,
    }
    const persisted = await persistRolePreferences(supabase, userId, mergedRolePreferences)
    if (!persisted) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save role preferences' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferredLanguage: updated.preferred_language ?? 'en',
        accessibilityLargeFonts: updated.accessibility_large_fonts ?? false,
        accessibilityHighContrast: updated.accessibility_high_contrast ?? false,
        accessibilityVoiceEnabled: updated.accessibility_voice_enabled ?? false,
        twoFactorEnabled: updated.two_factor_enabled ?? false,
        dataSharingConsent: updated.data_consent ?? true,
        marketingEmails: typeof mergedRolePreferences.marketingEmails === 'boolean' ? mergedRolePreferences.marketingEmails : false,
        preferredActivityTypes: Array.isArray(mergedRolePreferences.preferredActivityTypes) ? mergedRolePreferences.preferredActivityTypes : [],
        availabilityDays: Array.isArray(mergedRolePreferences.availabilityDays) ? mergedRolePreferences.availabilityDays : [],
        volunteerTravelDistance: typeof mergedRolePreferences.volunteerTravelDistance === 'string' ? mergedRolePreferences.volunteerTravelDistance : '',
        notifyOnElderActivity: typeof mergedRolePreferences.notifyOnElderActivity === 'boolean' ? mergedRolePreferences.notifyOnElderActivity : true,
        shareMedicationReminders: typeof mergedRolePreferences.shareMedicationReminders === 'boolean' ? mergedRolePreferences.shareMedicationReminders : true,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  )
})

function getUserId(req: Request): string | null {
  const userTokenHeader = req.headers.get('X-User-Token')
  const userIdHeader = req.headers.get('X-User-Id')
  if (userTokenHeader) return userTokenHeader
  if (userIdHeader) return userIdHeader
  return null
}

async function loadRolePreferences(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Record<string, unknown>> {
  // Primary schema used by current edge functions.
  const primary = await supabase
    .from('audit_logs')
    .select('changes')
    .eq('user_id', userId)
    .eq('resource_type', 'USER_PREFERENCES')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!primary.error && primary.data?.changes && typeof primary.data.changes === 'object') {
    return primary.data.changes as Record<string, unknown>
  }

  // Fallback for legacy audit schema that stores JSON in new_values/table_name.
  const fallback = await supabase
    .from('audit_logs')
    .select('new_values')
    .eq('user_id', userId)
    .eq('table_name', 'USER_PREFERENCES')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!fallback.error && fallback.data?.new_values && typeof fallback.data.new_values === 'object') {
    return fallback.data.new_values as Record<string, unknown>
  }

  return {}
}

async function persistRolePreferences(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  rolePreferences: Record<string, unknown>
): Promise<boolean> {
  const now = new Date().toISOString()

  const primaryInsert = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action: 'UPDATE',
      resource_type: 'USER_PREFERENCES',
      resource_id: userId,
      changes: rolePreferences,
      created_at: now,
    })

  if (!primaryInsert.error) {
    return true
  }

  const fallbackInsert = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action: 'UPDATE',
      table_name: 'USER_PREFERENCES',
      record_id: userId,
      new_values: rolePreferences,
      created_at: now,
    })

  if (!fallbackInsert.error) {
    return true
  }

  console.error('Failed to persist role preferences', {
    primary: primaryInsert.error,
    fallback: fallbackInsert.error,
  })
  return false
}
