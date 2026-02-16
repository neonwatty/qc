import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { ReminderEmail } from '@/lib/email/templates/reminder'
import type { DbReminder } from '@/types/database'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com'

function computeNextScheduledFor(
  currentDate: string,
  frequency: DbReminder['frequency'],
): string | null {
  const date = new Date(currentDate)

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    case 'weekly':
      date.setDate(date.getDate() + 7)
      return date.toISOString()
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      return date.toISOString()
    case 'once':
      return null
    case 'custom':
      return null
    default:
      return null
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: reminders, error: fetchError } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_active', true)
    .lte('scheduled_for', now)
    .in('notification_channel', ['email', 'both'])

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 },
    )
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({
      status: 'ok',
      sent: 0,
      timestamp: now,
    })
  }

  const creatorIds = [...new Set(reminders.map((r: DbReminder) => r.created_by))]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, couple_id')
    .in('id', creatorIds)

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; email: string; couple_id: string | null }) => [p.id, p]),
  )

  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const reminder of reminders as DbReminder[]) {
    const profile = profileMap.get(reminder.created_by)
    if (!profile?.email) {
      failed++
      errors.push(`No email for user ${reminder.created_by}`)
      continue
    }

    const { error: emailError } = await sendEmail({
      to: profile.email,
      subject: `Reminder: ${reminder.title}`,
      react: ReminderEmail({
        title: reminder.title,
        message: reminder.message,
        frequency: reminder.frequency,
        dashboardUrl: `${APP_URL}/reminders`,
      }),
    })

    if (emailError) {
      failed++
      errors.push(emailError.message)
      continue
    }

    sent++

    const nextDate = computeNextScheduledFor(reminder.scheduled_for, reminder.frequency)

    if (nextDate) {
      await supabase
        .from('reminders')
        .update({ scheduled_for: nextDate })
        .eq('id', reminder.id)
    } else {
      await supabase
        .from('reminders')
        .update({ is_active: false })
        .eq('id', reminder.id)
    }
  }

  return NextResponse.json({
    status: 'ok',
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: now,
  })
}
