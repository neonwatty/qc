'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'
import type { DbReminder } from '@/types/database'

const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().max(2000).optional(),
  category: z.enum(['habit', 'check-in', 'action-item', 'special-date', 'custom']),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'custom']),
  scheduledFor: z.string().min(1, 'Scheduled date is required'),
  notificationChannel: z.enum(['in-app', 'email', 'both', 'none']),
  customSchedule: z.record(z.unknown()).nullable().optional(),
})

const updateReminderSchema = createReminderSchema.partial()

interface ActionResult {
  error?: string
}

export async function createReminder(formData: FormData): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: 'You must be part of a couple to create reminders' }
  }

  const raw = {
    title: formData.get('title'),
    message: formData.get('message') || undefined,
    category: formData.get('category'),
    frequency: formData.get('frequency'),
    scheduledFor: formData.get('scheduledFor'),
    notificationChannel: formData.get('notificationChannel'),
    customSchedule: null,
  }

  const { data: validated, error: validationError } = validate(createReminderSchema, raw)
  if (validationError) return { error: validationError }

  const row: Omit<DbReminder, 'id'> = {
    couple_id: profile.couple_id,
    created_by: user.id,
    title: validated.title,
    message: validated.message ?? null,
    category: validated.category,
    frequency: validated.frequency,
    scheduled_for: validated.scheduledFor,
    is_active: true,
    notification_channel: validated.notificationChannel,
    custom_schedule: validated.customSchedule ?? null,
  }

  const { error } = await supabase.from('reminders').insert(row)
  if (error) return { error: error.message }

  revalidatePath('/reminders')
  return {}
}

export async function updateReminder(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (value !== '') raw[key] = value
  }

  const { data: validated, error: validationError } = validate(updateReminderSchema, raw)
  if (validationError) return { error: validationError }

  const updates: Record<string, unknown> = {}
  if (validated.title !== undefined) updates.title = validated.title
  if (validated.message !== undefined) updates.message = validated.message
  if (validated.category !== undefined) updates.category = validated.category
  if (validated.frequency !== undefined) updates.frequency = validated.frequency
  if (validated.scheduledFor !== undefined) updates.scheduled_for = validated.scheduledFor
  if (validated.notificationChannel !== undefined) {
    updates.notification_channel = validated.notificationChannel
  }

  const { error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: error.message }

  revalidatePath('/reminders')
  return {}
}

export async function deleteReminder(id: string): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: error.message }

  revalidatePath('/reminders')
  return {}
}

export async function toggleActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { error } = await supabase
    .from('reminders')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) return { error: error.message }

  revalidatePath('/reminders')
  return {}
}
