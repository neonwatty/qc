import type { SupabaseClient } from '@supabase/supabase-js'

export interface GrowthAreaScore {
  area: string
  label: string
  score: number
  color: string
}

export function computeScore(metrics: Array<{ actual: number; max: number; weight: number }>): number {
  const raw = metrics.reduce((sum, { actual, max, weight }) => {
    return sum + Math.min(actual / max, 1) * weight
  }, 0)

  return Math.min(Math.round(raw), 100)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = ReturnType<SupabaseClient['from']> extends { select: (...args: any[]) => infer R } ? R : any

async function countRows(
  supabase: SupabaseClient,
  table: string,
  coupleId: string,
  filters?: (query: QueryBuilder) => QueryBuilder,
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true }).eq('couple_id', coupleId) as QueryBuilder

  if (filters) {
    query = filters(query)
  }

  const { count } = await query
  return count ?? 0
}

export async function calculateGrowthScores(coupleId: string, supabase: SupabaseClient): Promise<GrowthAreaScore[]> {
  const [
    // Communication
    checkInsCompleted,
    sharedNotes,
    actionItemsTotal,

    // Emotional Connection
    checkInsImprovedMood,
    loveLanguagesShared,
    checkInsWithReflection,

    // Conflict Resolution
    actionItemsCompleted,
    requestsAccepted,

    // Future Planning
    milestonesCreated,
    remindersActive,
    actionItemsIncomplete,

    // Intimacy
    loveActionsCount,
    loveLanguagesSharedPrivacy,
  ] = await Promise.all([
    // Communication queries
    countRows(supabase, 'check_ins', coupleId, (q) => q.eq('status', 'completed')),
    countRows(supabase, 'notes', coupleId, (q) => q.eq('privacy', 'shared')),
    countRows(supabase, 'action_items', coupleId),

    // Emotional Connection queries
    countRows(supabase, 'check_ins', coupleId, (q) =>
      q
        .not('mood_before', 'is', null)
        .not('mood_after', 'is', null)
        .filter('mood_after', 'gt', 'mood_before' as unknown as string),
    ),
    countRows(supabase, 'love_languages', coupleId, (q) => q.eq('privacy', 'shared')),
    countRows(supabase, 'check_ins', coupleId, (q) => q.not('reflection', 'is', null)),

    // Conflict Resolution queries
    countRows(supabase, 'action_items', coupleId, (q) => q.eq('completed', true)),
    countRows(supabase, 'requests', coupleId, (q) => q.eq('status', 'accepted')),

    // Future Planning queries
    countRows(supabase, 'milestones', coupleId),
    countRows(supabase, 'reminders', coupleId, (q) => q.eq('is_active', true)),
    countRows(supabase, 'action_items', coupleId, (q) => q.eq('completed', false)),

    // Intimacy queries
    countRows(supabase, 'love_actions', coupleId),
    countRows(supabase, 'love_languages', coupleId, (q) => q.eq('privacy', 'shared')),
  ])

  return [
    {
      area: 'communication',
      label: 'Communication',
      score: computeScore([
        { actual: checkInsCompleted, max: 10, weight: 40 },
        { actual: sharedNotes, max: 20, weight: 30 },
        { actual: actionItemsTotal, max: 10, weight: 30 },
      ]),
      color: '#3B82F6',
    },
    {
      area: 'emotional-connection',
      label: 'Emotional Connection',
      score: computeScore([
        { actual: checkInsImprovedMood, max: 5, weight: 40 },
        { actual: loveLanguagesShared, max: 5, weight: 30 },
        { actual: checkInsWithReflection, max: 5, weight: 30 },
      ]),
      color: '#EC4899',
    },
    {
      area: 'conflict-resolution',
      label: 'Conflict Resolution',
      score: computeScore([
        { actual: actionItemsCompleted, max: 10, weight: 50 },
        { actual: requestsAccepted, max: 5, weight: 50 },
      ]),
      color: '#F59E0B',
    },
    {
      area: 'future-planning',
      label: 'Future Planning',
      score: computeScore([
        { actual: milestonesCreated, max: 5, weight: 40 },
        { actual: remindersActive, max: 10, weight: 30 },
        { actual: actionItemsIncomplete, max: 5, weight: 30 },
      ]),
      color: '#10B981',
    },
    {
      area: 'intimacy',
      label: 'Intimacy',
      score: computeScore([
        { actual: loveActionsCount, max: 10, weight: 50 },
        { actual: loveLanguagesSharedPrivacy, max: 5, weight: 50 },
      ]),
      color: '#8B5CF6',
    },
  ]
}
