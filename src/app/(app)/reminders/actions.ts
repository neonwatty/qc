'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'
import type { DbReminder } from '@/types/database'

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().max(1000).optional(),
  category: z.enum(['habit', 'check-in', 'action-item', 'special-date', 'custom']),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'custom']),
  scheduled_for: z.string().min(1, 'Schedule date is required'),
  notification_channel: z.enum(['in-app', 'email', 'both', 'none']),
})

export interface ReminderActionState {
  error?: string
  success?: boolean
  reminder?: DbReminder
}

export async function createReminder(_prev: ReminderActionState, formData: FormData): Promise<ReminderActionState> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) {
    return { error: 'You must be in a couple to create reminders' }
  }

  const raw = {
    title: formData.get('title'),
    message: formData.get('message') || undefined,
    category: formData.get('category'),
    frequency: formData.get('frequency'),
    scheduled_for: formData.get('scheduled_for'),
    notification_channel: formData.get('notification_channel'),
  }

  const { data, error: validationError } = validate(reminderSchema, raw)
  if (validationError || !data) return { error: validationError ?? 'Validation failed' }

  const { data: reminder, error } = await supabase
    .from('reminders')
    .insert({
      couple_id: profile.couple_id,
      created_by: user.id,
      title: data.title,
      message: data.message ?? null,
      category: data.category,
      frequency: data.frequency,
      scheduled_for: data.scheduled_for,
      notification_channel: data.notification_channel,
      is_active: true,
      custom_schedule: null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/reminders')
  return { success: true, reminder: reminder as DbReminder }
}

export async function toggleReminder(reminderId: string, isActive: boolean): Promise<{ error?: string }> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('reminders').update({ is_active: isActive }).eq('id', reminderId)

  if (error) return { error: error.message }

  revalidatePath('/reminders')
  return {}
}

export async function deleteReminder(reminderId: string): Promise<{ error?: string }> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('reminders').delete().eq('id', reminderId)

  if (error) return { error: error.message }

  revalidatePath('/reminders')
  return {}
}
