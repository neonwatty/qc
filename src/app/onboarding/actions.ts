'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { createCouple, createInvite } from '@/lib/couples'
import { sendEmail } from '@/lib/email/send'
import { InviteEmail } from '@/lib/email/templates/invite'
import { createClient } from '@/lib/supabase/server'
import { validate, emailSchema, nameSchema } from '@/lib/validation'

const onboardingSchema = z.object({
  displayName: nameSchema,
  partnerEmail: emailSchema,
  relationshipStartDate: z.string().optional(),
})

export type OnboardingState = {
  error: string | null
}

export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const { user } = await requireAuth()

  const raw = {
    displayName: formData.get('displayName'),
    partnerEmail: formData.get('partnerEmail'),
    relationshipStartDate: formData.get('relationshipStartDate') || undefined,
  }

  const { data: input, error: validationError } = validate(onboardingSchema, raw)

  if (validationError) {
    return { error: validationError }
  }

  // Update display name on profile
  const supabase = await createClient()
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ display_name: input.displayName })
    .eq('id', user.id)

  if (profileError) {
    return { error: 'Failed to update profile. Please try again.' }
  }

  // Create couple with optional relationship start date
  const { data: couple, error: coupleError } = await createCouple(input.displayName)

  if (coupleError || !couple) {
    return { error: coupleError ?? 'Failed to create couple. Please try again.' }
  }

  // Set relationship start date if provided
  if (input.relationshipStartDate) {
    await supabase.from('couples').update({ relationship_start_date: input.relationshipStartDate }).eq('id', couple.id)
  }

  // Create invite and send email
  const { data: invite, error: inviteError } = await createInvite(input.partnerEmail)

  if (inviteError || !invite) {
    // Couple was created but invite failed -- still redirect, they can resend later
    redirect('/dashboard')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/${invite.token}`

  await sendEmail({
    to: input.partnerEmail,
    subject: `${input.displayName} invited you to QC`,
    react: InviteEmail({ inviterName: input.displayName, inviteUrl }),
  })

  redirect('/dashboard')
}
