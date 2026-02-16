'use server'

import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { createCouple, createInvite } from '@/lib/couples'
import { sendEmail } from '@/lib/email/send'
import { InviteEmail } from '@/lib/email/templates/invite'
import { validate } from '@/lib/validation'

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be 100 characters or less'),
  avatarUrl: z
    .string()
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .optional()
    .or(z.literal('')),
})

const coupleInviteSchema = z.object({
  partnerEmail: z.string().email('Please enter a valid email address').min(1, 'Partner email is required'),
  relationshipStartDate: z
    .string()
    .min(1, 'Relationship start date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Must be a valid date'),
})

interface ActionResult {
  success: boolean
  error?: string
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAuth()

  const raw = {
    displayName: formData.get('displayName'),
    avatarUrl: formData.get('avatarUrl'),
  }

  const validated = validate(profileSchema, raw)
  if (!validated.data) return { success: false, error: validated.error }
  const { displayName, avatarUrl } = validated.data

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      avatar_url: avatarUrl || null,
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function createCoupleAndInvite(formData: FormData): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const raw = {
    partnerEmail: formData.get('partnerEmail'),
    relationshipStartDate: formData.get('relationshipStartDate'),
  }

  const validated = validate(coupleInviteSchema, raw)
  if (!validated.data) return { success: false, error: validated.error }
  const { partnerEmail, relationshipStartDate } = validated.data

  if (partnerEmail === user.email) {
    return { success: false, error: 'You cannot invite yourself' }
  }

  const { error: coupleError } = await createCouple()
  if (coupleError) return { success: false, error: coupleError }

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (profile?.couple_id) {
    await supabase
      .from('couples')
      .update({ relationship_start_date: relationshipStartDate })
      .eq('id', profile.couple_id)
  }

  const { data: invite, error: inviteError } = await createInvite(partnerEmail)
  if (inviteError) return { success: false, error: inviteError }
  if (!invite) return { success: false, error: 'Failed to create invite' }

  const { data: currentProfile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()

  const inviterName = currentProfile?.display_name ?? 'Your partner'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/${invite.token}`

  await sendEmail({
    to: partnerEmail,
    subject: `${inviterName} invited you to join QC`,
    react: InviteEmail({ inviterName, inviteUrl }),
  })

  return { success: true }
}
