import { requireAuth } from '@/lib/auth'

import { RemindersContent } from './reminders-content'

export default async function RemindersPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  const { data: reminders } = coupleId
    ? await supabase.from('reminders').select('*').eq('couple_id', coupleId).order('scheduled_for', { ascending: true })
    : { data: [] }

  return <RemindersContent initialReminders={reminders ?? []} userId={user.id} coupleId={coupleId} />
}
