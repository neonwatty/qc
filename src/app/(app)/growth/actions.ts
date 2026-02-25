'use server'

import { requireAuth } from '@/lib/auth'
import { sendEmail, shouldSendEmail } from '@/lib/email/send'
import { MilestoneEmail } from '@/lib/email/templates/milestone'

export async function sendMilestoneEmail(milestoneId: string): Promise<void> {
  try {
    const { supabase } = await requireAuth()

    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('couple_id, title, description, rarity')
      .eq('id', milestoneId)
      .single()

    if (milestoneError || !milestone) return

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email')
      .eq('couple_id', milestone.couple_id)

    if (profilesError || !profiles) return

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const growthUrl = `${baseUrl}/growth`

    for (const profile of profiles) {
      if (!profile.email) continue

      const canSend = await shouldSendEmail(profile.email)
      if (!canSend) continue

      await sendEmail({
        to: profile.email,
        subject: `Milestone Achieved: ${milestone.title}`,
        react: MilestoneEmail({
          title: milestone.title,
          description: milestone.description ?? undefined,
          rarity: milestone.rarity,
          growthUrl,
        }),
      })
    }
  } catch {
    // Email send failed -- non-blocking
  }
}
