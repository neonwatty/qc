'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { leaveCouple, resendInvite } from '@/lib/couples'
import { validate } from '@/lib/validation'

const profileSchema = z.object({
  display_name: z.string().min(1, 'Name is required').max(100),
  avatar_url: z.string().url().nullable().optional(),
})

const sessionSettingsSchema = z.object({
  session_duration: z.number().min(5).max(60),
  timeouts_per_partner: z.number().min(0).max(5),
  timeout_duration: z.number().min(1).max(10),
  turn_based_mode: z.boolean(),
  turn_duration: z.number().min(30).max(600),
  allow_extensions: z.boolean(),
  warm_up_questions: z.boolean(),
  cool_down_time: z.number().min(0).max(15),
})

export interface SettingsActionState {
  error?: string
  success?: boolean
}

export async function updateProfile(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const { user, supabase } = await requireAuth()

  const raw = {
    display_name: formData.get('display_name'),
    avatar_url: formData.get('avatar_url') || null,
  }

  const { data, error: validationError } = validate(profileSchema, raw)
  if (validationError) return { error: validationError }

  const { error } = await supabase.from('profiles').update(data).eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function updateSessionSettings(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) return { error: 'You must be in a couple to update session settings' }

  const raw = {
    session_duration: Number(formData.get('session_duration')),
    timeouts_per_partner: Number(formData.get('timeouts_per_partner')),
    timeout_duration: Number(formData.get('timeout_duration')),
    turn_based_mode: formData.getAll('turn_based_mode').includes('true'),
    turn_duration: Number(formData.get('turn_duration')),
    allow_extensions: formData.getAll('allow_extensions').includes('true'),
    warm_up_questions: formData.getAll('warm_up_questions').includes('true'),
    cool_down_time: Number(formData.get('cool_down_time')),
  }

  const { data, error: validationError } = validate(sessionSettingsSchema, raw)
  if (validationError) return { error: validationError }

  const { error } = await supabase.from('session_settings').update(data).eq('couple_id', profile.couple_id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function leaveCoupleAction(): Promise<{ error?: string }> {
  await requireAuth()
  const result = await leaveCouple()
  if (result.error) return { error: result.error }

  revalidatePath('/settings')
  redirect('/onboarding')
}

export async function resendInviteAction(inviteId: string): Promise<{ error?: string }> {
  await requireAuth()
  const result = await resendInvite(inviteId)
  if (result.error) return { error: result.error }

  revalidatePath('/settings')
  return {}
}
