import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { CoupleStats } from '@/components/dashboard/CoupleStats'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import type { ActivityItem } from '@/components/dashboard/RecentActivity'

async function getDashboardData(coupleId: string | null) {
  const supabase = await createClient()

  let daysTogether: number | null = null
  let checkInsCompleted = 0
  let milestonesEarned = 0
  let notesCount = 0
  let recentActivity: ActivityItem[] = []

  if (!coupleId) {
    return { daysTogether, checkInsCompleted, milestonesEarned, notesCount, recentActivity }
  }

  // Fetch couple for relationship_start_date
  const { data: couple } = await supabase.from('couples').select('relationship_start_date').eq('id', coupleId).single()

  if (couple?.relationship_start_date) {
    const start = new Date(couple.relationship_start_date)
    const now = new Date()
    daysTogether = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Count check-ins
  const { count: checkInCount } = await supabase
    .from('check_ins')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId)
    .eq('status', 'completed')
  checkInsCompleted = checkInCount ?? 0

  // Count milestones
  const { count: milestoneCount } = await supabase
    .from('milestones')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId)
  milestonesEarned = milestoneCount ?? 0

  // Count notes
  const { count: noteCount } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId)
  notesCount = noteCount ?? 0

  // Fetch recent activity (last 10 items across tables)
  const [checkIns, notes, milestones] = await Promise.all([
    supabase
      .from('check_ins')
      .select('id, started_at, status')
      .eq('couple_id', coupleId)
      .order('started_at', { ascending: false })
      .limit(5),
    supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('couple_id', coupleId)
      .eq('privacy', 'shared')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('milestones')
      .select('id, title, achieved_at')
      .eq('couple_id', coupleId)
      .not('achieved_at', 'is', null)
      .order('achieved_at', { ascending: false })
      .limit(5),
  ])

  const activities: ActivityItem[] = []

  if (checkIns.data) {
    for (const ci of checkIns.data) {
      activities.push({
        id: ci.id,
        type: 'check_in',
        title: `Check-in ${ci.status === 'completed' ? 'completed' : 'started'}`,
        createdAt: ci.started_at,
      })
    }
  }

  if (notes.data) {
    for (const note of notes.data) {
      activities.push({
        id: note.id,
        type: 'note',
        title: note.content.length > 60 ? note.content.slice(0, 60) + '...' : note.content,
        createdAt: note.created_at,
      })
    }
  }

  if (milestones.data) {
    for (const ms of milestones.data) {
      activities.push({
        id: ms.id,
        type: 'milestone',
        title: ms.title,
        createdAt: ms.achieved_at!,
      })
    }
  }

  recentActivity = activities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return { daysTogether, checkInsCompleted, milestonesEarned, notesCount, recentActivity }
}

export default async function DashboardPage(): Promise<React.ReactNode> {
  const { user } = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('display_name, couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null
  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'there'

  const { daysTogether, checkInsCompleted, milestonesEarned, notesCount, recentActivity } =
    await getDashboardData(coupleId)

  const greeting = getGreeting()

  return (
    <div className="space-y-6">
      <PageHeader title={`${greeting}, ${displayName}`} subtitle="Here's how your relationship is doing" />

      {/* Stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Your Stats
        </h2>
        <CoupleStats
          daysTogether={daysTogether}
          checkInsCompleted={checkInsCompleted}
          milestonesEarned={milestonesEarned}
          notesCount={notesCount}
        />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Quick Actions
        </h2>
        <QuickActions />
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Recent Activity
        </h2>
        <RecentActivity items={recentActivity} />
      </section>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
