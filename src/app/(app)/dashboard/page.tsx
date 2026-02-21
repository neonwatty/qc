import { requireAuth } from '@/lib/auth'
import { getStreakData } from '@/lib/streaks'
import { getRecentActivity } from '@/lib/activity'
import type { StreakData } from '@/lib/streaks'
import type { ActivityItem } from '@/lib/activity'

import { DashboardContent } from './dashboard-content'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const { user, supabase } = await requireAuth()

  // Fetch the user's profile to get couple_id
  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id

  // Fetch stats in parallel if user has a couple
  let checkInCount = 0
  let noteCount = 0
  let milestoneCount = 0
  let actionItemCount = 0
  let totalLanguages = 0
  let sharedLanguages = 0
  let streakData: StreakData = { currentStreak: 0, longestStreak: 0, lastCheckInDate: null, totalCheckIns: 0 }
  let activities: ActivityItem[] = []
  let relationshipStartDate: string | null = null
  let lastCheckInDate: string | null = null
  let topLanguages: Array<{ title: string; category: string }> = []
  let todayReminders: Array<{ id: string; title: string; scheduledFor: string; category: string; isOverdue: boolean }> =
    []

  if (coupleId) {
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
      getRecentActivity(coupleId, supabase, 5),
      supabase.from('couples').select('relationship_start_date').eq('id', coupleId).single(),
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
    ])

    checkInCount = checkIns.count ?? 0
    noteCount = notes.count ?? 0
    milestoneCount = milestones.count ?? 0
    actionItemCount = actionItems.count ?? 0
    totalLanguages = languages.count ?? 0
    sharedLanguages = shared.count ?? 0
    streakData = streak
    activities = activity
    relationshipStartDate = couple.data?.relationship_start_date ?? null
    lastCheckInDate = lastCheckIn.data?.completed_at ?? null
    topLanguages = (topLangs.data ?? []).map((l) => ({ title: l.title, category: l.category }))
    todayReminders = (reminders.data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      scheduledFor: r.scheduled_for,
      category: r.category,
      isOverdue: new Date(r.scheduled_for) < today,
    }))
  }

  return (
    <DashboardContent
      checkInCount={checkInCount}
      noteCount={noteCount}
      milestoneCount={milestoneCount}
      actionItemCount={actionItemCount}
      totalLanguages={totalLanguages}
      sharedLanguages={sharedLanguages}
      hasCoupleId={!!coupleId}
      streakData={streakData}
      activities={activities}
      relationshipStartDate={relationshipStartDate}
      lastCheckInDate={lastCheckInDate}
      topLanguages={topLanguages}
      todayReminders={todayReminders}
    />
  )
}
