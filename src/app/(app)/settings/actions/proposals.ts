'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'

const sessionSettingsSchema = z.object({
  session_duration: z.number().min(5).max(60),
  timeouts_per_partner: z.number().min(0).max(5),
  timeout_duration: z.number().min(1).max(10),
  turn_based_mode: z.boolean(),
  turn_duration: z.number().min(30).max(600),
  allow_extensions: z.boolean(),
  warm_up_questions: z.boolean(),
  cool_down_time: z.number().min(0).max(15),
  pause_notifications: z.boolean(),
  auto_save_drafts: z.boolean(),
})

const proposalSettingsSchema = z.object({
  session_duration: z.number().min(5).max(60).optional(),
  timeouts_per_partner: z.number().min(0).max(5).optional(),
  timeout_duration: z.number().min(1).max(10).optional(),
  turn_based_mode: z.boolean().optional(),
  turn_duration: z.number().min(30).max(600).optional(),
  allow_extensions: z.boolean().optional(),
  warm_up_questions: z.boolean().optional(),
  cool_down_time: z.number().min(0).max(15).optional(),
  pause_notifications: z.boolean().optional(),
  auto_save_drafts: z.boolean().optional(),
})

export interface SettingsActionState {
  error?: string
  success?: boolean
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
    pause_notifications: formData.getAll('pause_notifications').includes('true'),
    auto_save_drafts: formData.getAll('auto_save_drafts').includes('true'),
  }

  const { data, error: validationError } = validate(sessionSettingsSchema, raw)
  if (validationError) return { error: validationError }

  const { error } = await supabase.from('session_settings').update(data).eq('couple_id', profile.couple_id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function proposeSessionSettings(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) return { error: 'You must be in a couple to propose session settings' }

  const raw = {
    session_duration: Number(formData.get('session_duration')) || undefined,
    timeouts_per_partner: Number(formData.get('timeouts_per_partner')) || undefined,
    timeout_duration: Number(formData.get('timeout_duration')) || undefined,
    turn_based_mode: formData.get('turn_based_mode') === 'true' ? true : undefined,
    turn_duration: Number(formData.get('turn_duration')) || undefined,
    allow_extensions: formData.get('allow_extensions') === 'true' ? true : undefined,
    warm_up_questions: formData.get('warm_up_questions') === 'true' ? true : undefined,
    cool_down_time: Number(formData.get('cool_down_time')) || undefined,
    pause_notifications: formData.get('pause_notifications') === 'true' ? true : undefined,
    auto_save_drafts: formData.get('auto_save_drafts') === 'true' ? true : undefined,
  }

  const { data, error: validationError } = validate(proposalSettingsSchema, raw)
  if (validationError) return { error: validationError }

  const { error } = await supabase.from('session_settings_proposals').insert({
    couple_id: profile.couple_id,
    proposed_by: user.id,
    settings: data as Record<string, unknown>,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function respondToProposal(proposalId: string, accept: boolean): Promise<{ error?: string }> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) return { error: 'You must be in a couple to respond to proposals' }

  const { data: proposal, error: proposalError } = await supabase
    .from('session_settings_proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('couple_id', profile.couple_id)
    .single()

  if (proposalError || !proposal) return { error: 'Proposal not found' }

  if (proposal.proposed_by === user.id) {
    return { error: 'You cannot accept your own proposal' }
  }

  if (proposal.status !== 'pending') {
    return { error: 'Proposal has already been reviewed' }
  }

  if (accept) {
    const { data: currentSettings } = await supabase
      .from('session_settings')
      .select('*')
      .eq('couple_id', profile.couple_id)
      .single()

    const currentVersion = currentSettings?.version || 1
    const agreedBy = currentSettings?.agreed_by || []

    const mergedSettings = {
      ...currentSettings,
      ...(proposal.settings as Record<string, unknown>),
      version: currentVersion + 1,
      agreed_by: [...agreedBy, proposal.proposed_by, user.id],
    }

    await supabase.from('session_settings').update(mergedSettings).eq('couple_id', profile.couple_id)
  }

  await supabase
    .from('session_settings_proposals')
    .update({
      status: accept ? 'accepted' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', proposalId)

  revalidatePath('/settings')
  return {}
}
