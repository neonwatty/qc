import { NextRequest, NextResponse } from 'next/server'

import { sendEmail } from '@/lib/email/send'
import { ReminderEmail } from '@/lib/email/templates/reminder'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // Query active reminders that are due and have email notifications
  const { data: reminders, error: queryError } = await supabase
    .from('reminders')
    .select('id, couple_id, created_by, title, message, notification_channel')
    .eq('is_active', true)
    .in('notification_channel', ['email', 'both'])
    .lte('scheduled_for', now)

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({
      status: 'ok',
      sent: 0,
      timestamp: now,
    })
  }

  // Get unique user IDs that need emails
  const userIds = [...new Set(reminders.map((r) => r.created_by))]

  const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', userIds)

  const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) ?? [])

  let sent = 0
  let failed = 0
  const errors: string[] = []

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

  for (const reminder of reminders) {
    const email = emailMap.get(reminder.created_by)
    if (!email) continue

    const { error: sendError } = await sendEmail({
      to: email,
      subject: `Reminder: ${reminder.title}`,
      react: ReminderEmail({
        title: reminder.title,
        message: reminder.message ?? `Your reminder "${reminder.title}" is due.`,
        dashboardUrl: `${baseUrl}/reminders`,
      }),
    })

    if (sendError) {
      failed++
      errors.push(`${reminder.id}: ${sendError.message}`)
    } else {
      sent++
    }
  }

  // Deactivate one-time reminders that were sent
  const sentReminderIds = reminders.map((r) => r.id)
  if (sentReminderIds.length > 0) {
    await supabase.from('reminders').update({ is_active: false }).in('id', sentReminderIds).eq('frequency', 'once')
  }

  return NextResponse.json({
    status: 'ok',
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: now,
  })
}
