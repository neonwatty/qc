'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { sanitizeDbError } from '@/lib/utils'
import { validate } from '@/lib/validation'

const updateScheduleSchema = z.object({
  reminderId: z.string().uuid(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'custom']).optional(),
  scheduled_for: z.string().min(1).optional(),
  custom_schedule: z.record(z.string(), z.unknown()).nullable().optional(),
  notification_channel: z.enum(['in-app', 'email', 'both', 'none']).optional(),
  is_active: z.boolean().optional(),
})

export async function updateReminderSchedule(
  reminderId: string,
  updates: {
    frequency?: string
    scheduled_for?: string
    custom_schedule?: Record<string, unknown> | null
    notification_channel?: string
    is_active?: boolean
  },
): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const { data, error: validationError } = validate(updateScheduleSchema, { reminderId, ...updates })
  if (validationError || !data) return { error: validationError ?? 'Validation failed' }

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) return { error: 'You must be in a couple' }

  const { reminderId: id, ...updateData } = data
  const { error } = await supabase.from('reminders').update(updateData).eq('id', id).eq('couple_id', profile.couple_id)

  if (error) return { error: sanitizeDbError(error, 'updateReminderSchedule') }

  revalidatePath('/settings')
  revalidatePath('/reminders')
  return { error: null }
}

export async function toggleReminderActive(reminderId: string, isActive: boolean): Promise<{ error: string | null }> {
  return updateReminderSchedule(reminderId, { is_active: isActive })
}
