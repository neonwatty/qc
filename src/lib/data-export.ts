import type { SupabaseClient } from '@supabase/supabase-js'

export type UserData = {
  version: string
  exportedAt: string
  profile: {
    id: string
    display_name: string | null
    email: string | null
  }
  couple: {
    id: string
    relationship_start_date: string | null
    settings: Record<string, unknown> | null
  } | null
  notes: Array<{
    id: string
    title: string | null
    content: string | null
    tags: string[] | null
    privacy: string
    created_at: string
  }>
  checkIns: Array<{
    id: string
    mood: string | null
    notes: string | null
    created_at: string
  }>
  actionItems: Array<{
    id: string
    title: string
    completed: boolean
    created_at: string
  }>
  milestones: Array<{
    id: string
    title: string
    description: string | null
    rarity: string
    photo_url: string | null
    achieved_at: string
  }>
  reminders: Array<{
    id: string
    title: string
    message: string | null
    scheduled_for: string | null
    created_at: string
  }>
  requests: Array<{
    id: string
    title: string
    description: string | null
    category: string
    priority: string
    status: string
    created_at: string
  }>
  loveLanguages: Array<{
    id: string
    title: string
    category: string | null
    description: string | null
    privacy: string
    importance: string
    created_at: string
  }>
  loveActions: Array<{
    id: string
    title: string
    description: string | null
    created_at: string
  }>
}

/**
 * Export all user data from the database
 */
export async function exportUserData(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ data: UserData | null; error: string | null }> {
  try {
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, email, couple_id')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { data: null, error: profileError?.message ?? 'Profile not found' }
    }

    const coupleId = profile.couple_id

    // Get couple data
    let coupleData = null
    if (coupleId) {
      const { data: couple } = await supabase
        .from('couples')
        .select('id, relationship_start_date, settings')
        .eq('id', coupleId)
        .single()

      coupleData = couple
    }

    // Get notes (user's notes only)
    const { data: notes = [] } = await supabase
      .from('notes')
      .select('id, title, content, tags, privacy, created_at')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })

    // Get check-ins (couple's check-ins if part of couple)
    const { data: checkIns = [] } = coupleId
      ? await supabase
          .from('check_ins')
          .select('id, mood, notes, created_at')
          .eq('couple_id', coupleId)
          .order('created_at', { ascending: false })
      : { data: [] }

    // Get action items (couple's if part of couple)
    const { data: actionItems = [] } = coupleId
      ? await supabase
          .from('action_items')
          .select('id, title, completed, created_at')
          .eq('couple_id', coupleId)
          .order('created_at', { ascending: false })
      : { data: [] }

    // Get milestones (couple's if part of couple)
    const { data: milestones = [] } = coupleId
      ? await supabase
          .from('milestones')
          .select('id, title, description, rarity, photo_url, achieved_at')
          .eq('couple_id', coupleId)
          .order('achieved_at', { ascending: false })
      : { data: [] }

    // Get reminders (user's reminders)
    const { data: reminders = [] } = await supabase
      .from('reminders')
      .select('id, title, message, scheduled_for, created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    // Get requests (user's requests - sent or received)
    const { data: requests = [] } = await supabase
      .from('requests')
      .select('id, title, description, category, priority, status, created_at')
      .or(`requested_by.eq.${userId},requested_for.eq.${userId}`)
      .order('created_at', { ascending: false })

    // Get love languages (user's love languages)
    const { data: loveLanguages = [] } = await supabase
      .from('love_languages')
      .select('id, title, category, description, privacy, importance, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Get love actions (couple's if part of couple)
    const { data: loveActions = [] } = coupleId
      ? await supabase
          .from('love_actions')
          .select('id, title, description, created_at')
          .eq('couple_id', coupleId)
          .order('created_at', { ascending: false })
      : { data: [] }

    const exportData: UserData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: {
        id: profile.id,
        display_name: profile.display_name ?? null,
        email: profile.email ?? null,
      },
      couple: coupleData,
      notes: notes ?? [],
      checkIns: checkIns ?? [],
      actionItems: actionItems ?? [],
      milestones: milestones ?? [],
      reminders: reminders ?? [],
      requests: requests ?? [],
      loveLanguages: loveLanguages ?? [],
      loveActions: loveActions ?? [],
    }

    return { data: exportData, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to export data' }
  }
}
