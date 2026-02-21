import { requireAuth } from '@/lib/auth'
import { getStreakData } from '@/lib/streaks'
import type { StreakData } from '@/lib/streaks'

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

  if (coupleId) {
    const [checkIns, notes, milestones, actionItems, languages, shared, streak] = await Promise.all([
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
    ])

    checkInCount = checkIns.count ?? 0
    noteCount = notes.count ?? 0
    milestoneCount = milestones.count ?? 0
    actionItemCount = actionItems.count ?? 0
    totalLanguages = languages.count ?? 0
    sharedLanguages = shared.count ?? 0
    streakData = streak
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
    />
  )
}
