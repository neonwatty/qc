import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'

import { requireAuth } from '@/lib/auth'
import { snakeToCamelObject } from '@/lib/utils'
import type { Milestone } from '@/types'
import type { DbMilestone } from '@/types/database'
import { GrowthPageClient } from '@/components/growth/GrowthPageClient'

export const metadata = {
  title: 'Growth Gallery',
  description: 'Track your relationship milestones and growth together',
}

export default async function GrowthPage() {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    redirect('/dashboard')
  }

  const { data: dbMilestones, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .order('achieved_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Growth Gallery</h1>
        </div>
        <p className="text-muted-foreground">
          Something went wrong loading your milestones. Please try again.
        </p>
      </div>
    )
  }

  const milestones: Milestone[] = (dbMilestones ?? []).map((row: DbMilestone) =>
    snakeToCamelObject<Milestone>(row as unknown as Record<string, unknown>),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <GrowthPageClient
        milestones={milestones}
        coupleId={profile.couple_id}
      />
    </div>
  )
}
