'use server'

import { redirect } from 'next/navigation'

import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeDbError } from '@/lib/utils'

const COUPLE_TABLES = [
  'love_actions',
  'love_languages',
  'love_language_discoveries',
  'milestones',
  'action_items',
  'notes',
  'check_ins',
  'reminders',
  'requests',
  'couple_invites',
  'session_settings',
  'categories',
] as const

export async function redoOnboarding(): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) return { error: 'You must be in a couple to redo onboarding' }

  const coupleId = profile.couple_id
  const admin = createAdminClient()

  for (const table of COUPLE_TABLES) {
    const { error } = await admin.from(table).delete().eq('couple_id', coupleId)
    if (error) return { error: sanitizeDbError(error, `redoOnboarding:${table}`) }
  }

  const { error: profileError } = await admin.from('profiles').update({ couple_id: null }).eq('couple_id', coupleId)
  if (profileError) return { error: sanitizeDbError(profileError, 'redoOnboarding:profiles') }

  const { error: coupleError } = await admin.from('couples').delete().eq('id', coupleId)
  if (coupleError) return { error: sanitizeDbError(coupleError, 'redoOnboarding:couple') }

  redirect('/onboarding')
}
