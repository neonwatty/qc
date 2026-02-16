'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { leaveCouple as leaveCoupleLib, resendInvite } from '@/lib/couples'
import { validate } from '@/lib/validation'

const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or less'),
  avatarUrl: z.string().url('Must be a valid URL').nullable().optional(),
})

const coupleSettingsSchema = z.object({
  name: z
    .string()
    .max(100, 'Couple name must be 100 characters or less')
    .nullable()
    .optional(),
  relationshipStartDate: z.string().nullable().optional(),
})

const sessionSettingsSchema = z.object({
  sessionDuration: z.number().min(5).max(120),
  timeoutsPerPartner: z.number().min(0).max(5),
  timeoutDuration: z.number().min(1).max(10),
  turnBasedMode: z.boolean(),
  turnDuration: z.number().min(1).max(30),
  allowExtensions: z.boolean(),
  warmUpQuestions: z.boolean(),
  coolDownTime: z.number().min(0).max(15),
})

export async function updateProfile(
  formData: FormData,
): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const input = {
    displayName: formData.get('displayName') as string,
    avatarUrl: (formData.get('avatarUrl') as string) || null,
  }

  const result = validate(profileSchema, input)
  if (result.error) return { error: result.error }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: result.data.displayName,
      avatar_url: result.data.avatarUrl ?? null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { error: null }
}

export async function updateCoupleSettings(
  formData: FormData,
): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) return { error: 'Not in a couple' }

  const input = {
    name: (formData.get('name') as string) || null,
    relationshipStartDate:
      (formData.get('relationshipStartDate') as string) || null,
  }

  const result = validate(coupleSettingsSchema, input)
  if (result.error) return { error: result.error }

  const { error } = await supabase
    .from('couples')
    .update({
      name: result.data.name ?? null,
      relationship_start_date: result.data.relationshipStartDate ?? null,
    })
    .eq('id', profile.couple_id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { error: null }
}

export async function updateSessionSettings(
  formData: FormData,
): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) return { error: 'Not in a couple' }

  const input = {
    sessionDuration: Number(formData.get('sessionDuration')),
    timeoutsPerPartner: Number(formData.get('timeoutsPerPartner')),
    timeoutDuration: Number(formData.get('timeoutDuration')),
    turnBasedMode: formData.get('turnBasedMode') === 'true',
    turnDuration: Number(formData.get('turnDuration')),
    allowExtensions: formData.get('allowExtensions') === 'true',
    warmUpQuestions: formData.get('warmUpQuestions') === 'true',
    coolDownTime: Number(formData.get('coolDownTime')),
  }

  const result = validate(sessionSettingsSchema, input)
  if (result.error) return { error: result.error }

  const { error } = await supabase
    .from('session_settings')
    .upsert(
      {
        couple_id: profile.couple_id,
        session_duration: result.data.sessionDuration,
        timeouts_per_partner: result.data.timeoutsPerPartner,
        timeout_duration: result.data.timeoutDuration,
        turn_based_mode: result.data.turnBasedMode,
        turn_duration: result.data.turnDuration,
        allow_extensions: result.data.allowExtensions,
        warm_up_questions: result.data.warmUpQuestions,
        cool_down_time: result.data.coolDownTime,
      },
      { onConflict: 'couple_id' },
    )

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { error: null }
}

export async function leaveCoupleAction(): Promise<{ error: string | null }> {
  await requireAuth()
  const { error } = await leaveCoupleLib()

  if (error) return { error }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function resendPartnerInvite(
  inviteId: string,
): Promise<{ error: string | null }> {
  await requireAuth()

  if (!inviteId) return { error: 'Invite ID is required' }

  const { error } = await resendInvite(inviteId)

  if (error) return { error }

  revalidatePath('/settings')
  return { error: null }
}
