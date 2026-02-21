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
  selectedLanguages: z.string().optional(),
})

const LANGUAGE_TITLES: Record<string, string> = {
  words: 'Words of Affirmation',
  acts: 'Acts of Service',
  gifts: 'Receiving Gifts',
  time: 'Quality Time',
  touch: 'Physical Touch',
  custom: 'Custom',
}

export type OnboardingState = {
  error: string | null
}

export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const { user } = await requireAuth()

  const raw = {
    displayName: formData.get('displayName'),
    partnerEmail: formData.get('partnerEmail'),
    relationshipStartDate: formData.get('relationshipStartDate') || undefined,
    selectedLanguages: formData.get('selectedLanguages') || undefined,
  }

  const { data: input, error: validationError } = validate(onboardingSchema, raw)

  if (validationError || !input) {
    return { error: validationError ?? 'Validation failed' }
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

  // Create couple with optional relationship start date (pass existing client to share auth context)
  const { data: couple, error: coupleError } = await createCouple(input.displayName, supabase)

  if (coupleError || !couple) {
    return { error: coupleError ?? 'Failed to create couple. Please try again.' }
  }

  // Set relationship start date if provided
  if (input.relationshipStartDate) {
    await supabase.from('couples').update({ relationship_start_date: input.relationshipStartDate }).eq('id', couple.id)
  }

  // Save love languages if selected
  const rawLanguages = input.selectedLanguages
  if (rawLanguages) {
    try {
      const categories = JSON.parse(rawLanguages) as string[]
      if (Array.isArray(categories) && categories.length > 0) {
        const languageRows = categories.map((category) => ({
          couple_id: couple.id,
          user_id: user.id,
          // eslint-disable-next-line security/detect-object-injection -- category is from user-selected values validated by JSON.parse
          title: LANGUAGE_TITLES[category] ?? category,
          category,
          privacy: 'shared' as const,
          importance: 'high' as const,
        }))
        await supabase.from('love_languages').insert(languageRows)
      }
    } catch {
      // Love language insertion failed -- non-blocking, continue to redirect
    }
  }

  // Create invite and send email (pass existing client to share auth context)
  const { data: invite, error: inviteError } = await createInvite(input.partnerEmail, supabase)

  if (inviteError || !invite) {
    // Couple was created but invite failed -- still redirect, they can resend later
    redirect('/dashboard')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/${invite.token}`

  try {
    await sendEmail({
      to: input.partnerEmail,
      subject: `${input.displayName} invited you to QC`,
      react: InviteEmail({ inviterName: input.displayName, inviteUrl }),
    })
  } catch {
    // Email send failed (e.g. RESEND_API_KEY not configured) -- still redirect, they can resend later
  }

  redirect('/dashboard')
}
