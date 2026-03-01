import type { SupabaseClient } from '@supabase/supabase-js'

import { requireAuth } from '@/lib/auth'
import { getStreakData } from '@/lib/streaks'
import { getRecentActivity } from '@/lib/activity'
import type { StreakData } from '@/lib/streaks'
import type { ActivityItem } from '@/lib/activity'

import { DashboardContent } from './dashboard-content'

export const metadata = {
  title: 'Dashboard',
}

interface DashboardData {
  checkInCount: number
  noteCount: number
  milestoneCount: number
  actionItemCount: number
  totalLanguages: number
  sharedLanguages: number
  streakData: StreakData
  activities: ActivityItem[]
  relationshipStartDate: string | null
  lastCheckInDate: string | null
  topLanguages: Array<{ title: string; category: string }>
  todayReminders: Array<{ id: string; title: string; scheduledFor: string; category: string; isOverdue: boolean }>
  pendingRequestCount: number
  partnerTopLanguage: { title: string; category: string } | null
  todayActionCount: number
  frequencyGoal: string | null
}

async function fetchDashboardData(coupleId: string, userId: string, supabase: SupabaseClient): Promise<DashboardData> {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  const [
    checkIns,
    notes,
    milestones,
    actionItems,
    languages,
    shared,
    streak,
    activity,
    couple,
    lastCheckIn,
    topLangs,
    reminders,
    pendingReqs,
    partnerLang,
    actionCount,
  ] = await Promise.all([
    supabase.from('check_ins').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
    supabase.from('notes').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
    supabase.from('milestones').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
    supabase
      .from('action_items')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .eq('completed', false),
    supabase.from('love_languages').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
    supabase
      .from('love_languages')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .eq('privacy', 'shared'),
    getStreakData(coupleId, supabase),
    getRecentActivity(coupleId, supabase, 20),
    supabase.from('couples').select('relationship_start_date, settings').eq('id', coupleId).single(),
    supabase
      .from('check_ins')
      .select('completed_at')
      .eq('couple_id', coupleId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('love_languages')
      .select('title, category')
      .eq('couple_id', coupleId)
      .eq('privacy', 'shared')
      .limit(3),
    supabase
      .from('reminders')
      .select('id, title, scheduled_for, category')
      .eq('couple_id', coupleId)
      .eq('is_active', true)
      .gte('scheduled_for', todayStart)
      .lt('scheduled_for', todayEnd)
      .order('scheduled_for', { ascending: true })
      .limit(5),
    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .eq('requested_for', userId)
      .eq('status', 'pending'),
    supabase
      .from('love_languages')
      .select('title, category')
      .eq('couple_id', coupleId)
      .eq('privacy', 'shared')
      .neq('user_id', userId)
      .limit(1)
      .maybeSingle(),
    supabase.from('love_actions').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
  ])

  return {
    checkInCount: checkIns.count ?? 0,
    noteCount: notes.count ?? 0,
    milestoneCount: milestones.count ?? 0,
    actionItemCount: actionItems.count ?? 0,
    totalLanguages: languages.count ?? 0,
    sharedLanguages: shared.count ?? 0,
    streakData: streak,
    activities: activity,
    relationshipStartDate: couple.data?.relationship_start_date ?? null,
    frequencyGoal:
      ((couple.data?.settings as Record<string, unknown> | null)?.checkInFrequency as string | null) ?? null,
    lastCheckInDate: lastCheckIn.data?.completed_at ?? null,
    topLanguages: (topLangs.data ?? []).map((l) => ({ title: l.title, category: l.category })),
    todayReminders: (reminders.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      scheduledFor: r.scheduled_for,
      category: r.category,
      isOverdue: new Date(r.scheduled_for) < today,
    })),
    pendingRequestCount: pendingReqs.count ?? 0,
    partnerTopLanguage: partnerLang.data
      ? { title: partnerLang.data.title, category: partnerLang.data.category }
      : null,
    todayActionCount: actionCount.count ?? 0,
  }
}

const DEFAULTS: DashboardData = {
  checkInCount: 0,
  noteCount: 0,
  milestoneCount: 0,
  actionItemCount: 0,
  totalLanguages: 0,
  sharedLanguages: 0,
  streakData: { currentStreak: 0, longestStreak: 0, lastCheckInDate: null, totalCheckIns: 0 },
  activities: [],
  relationshipStartDate: null,
  lastCheckInDate: null,
  topLanguages: [],
  todayReminders: [],
  pendingRequestCount: 0,
  partnerTopLanguage: null,
  todayActionCount: 0,
  frequencyGoal: null,
}

export default async function DashboardPage() {
  const { user, supabase } = await requireAuth()
  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()
  const coupleId = profile?.couple_id
  const data = coupleId ? await fetchDashboardData(coupleId, user.id, supabase) : DEFAULTS

  return <DashboardContent {...data} hasCoupleId={!!coupleId} />
}
