import type { SupabaseClient } from '@supabase/supabase-js'
import { format, subMonths } from 'date-fns'

export interface MoodDataPoint {
  date: string // formatted date label
  moodBefore: number | null
  moodAfter: number | null
}

export async function getCheckInMoodHistory(
  coupleId: string,
  supabase: SupabaseClient,
  months: number = 3,
): Promise<MoodDataPoint[]> {
  const cutoff = subMonths(new Date(), months).toISOString()

  const { data, error } = await supabase
    .from('check_ins')
    .select('completed_at, mood_before, mood_after')
    .eq('couple_id', coupleId)
    .eq('status', 'completed')
    .gte('completed_at', cutoff)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((row) => ({
    date: format(new Date(row.completed_at as string), 'MMM d'),
    moodBefore: row.mood_before as number | null,
    moodAfter: row.mood_after as number | null,
  }))
}
