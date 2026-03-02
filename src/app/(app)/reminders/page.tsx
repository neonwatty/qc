import { requireAuth } from '@/lib/auth'

import { RemindersContent } from './reminders-content'

export default async function RemindersPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  const [{ data: reminders }, { data: partner }] = await Promise.all([
    coupleId
      ? supabase
          .from('reminders')
          .select('*')
          .eq('couple_id', coupleId)
          .order('scheduled_for', { ascending: true })
          .limit(100)
      : Promise.resolve({ data: [] as never[] }),
    coupleId
      ? supabase.from('profiles').select('id').eq('couple_id', coupleId).neq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return (
    <RemindersContent
      initialReminders={reminders ?? []}
      userId={user.id}
      coupleId={coupleId}
      partnerId={partner?.id ?? null}
    />
  )
}
