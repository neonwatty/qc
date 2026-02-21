import { requireAuth } from '@/lib/auth'
import { calculateGrowthScores } from '@/lib/growth-scoring'
import { getCheckInMoodHistory } from '@/lib/chart-data'
import type { GrowthAreaScore } from '@/lib/growth-scoring'
import type { MoodDataPoint } from '@/lib/chart-data'

import { GrowthContent } from './growth-content'

export const metadata = {
  title: 'Growth Gallery - Quality Control',
}

export default async function GrowthPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  let growthScores: GrowthAreaScore[] = []
  let moodHistory: MoodDataPoint[] = []

  if (coupleId) {
    ;[growthScores, moodHistory] = await Promise.all([
      calculateGrowthScores(coupleId, supabase),
      getCheckInMoodHistory(coupleId, supabase),
    ])
  }

  return <GrowthContent coupleId={coupleId} growthScores={growthScores} moodHistory={moodHistory} />
}
