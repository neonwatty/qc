import { requireAuth } from '@/lib/auth'
import { snakeToCamelObject } from '@/lib/utils'
import { RemindersList } from '@/components/reminders/RemindersList'
import type { Reminder } from '@/types'
import type { DbReminder } from '@/types/database'

export const metadata = {
  title: 'Reminders',
  description: 'Manage your couple reminders and scheduled notifications',
}

export default async function RemindersPage() {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="mt-4 text-muted-foreground">
          You need to be part of a couple to use reminders.
        </p>
      </div>
    )
  }

  const { data: rows } = await supabase
    .from('reminders')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .order('scheduled_for', { ascending: true })

  const reminders: Reminder[] = (rows ?? []).map((row: DbReminder) =>
    snakeToCamelObject<Reminder>(row as unknown as Record<string, unknown>),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <RemindersList
        initialReminders={reminders}
        coupleId={profile.couple_id}
        currentUserId={user.id}
      />
    </div>
  )
}
