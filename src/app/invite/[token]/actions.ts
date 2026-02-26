'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { acceptInvite, getInviteByToken } from '@/lib/couples'
import { createRateLimiter } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { validate } from '@/lib/validation'

const inviteLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 })

const tokenSchema = z.object({
  token: z.string().uuid('Invalid invite token'),
})

export type InviteState = {
  error: string | null
}

export async function validateInvite(token: string): Promise<{
  valid: boolean
  inviterEmail: string | null
  error: string | null
}> {
  if (!inviteLimiter.check(token)) {
    return { valid: false, inviterEmail: null, error: 'Too many requests. Please try again later.' }
  }

  const { error: validationError } = validate(tokenSchema, { token })

  if (validationError) {
    return { valid: false, inviterEmail: null, error: validationError }
  }

  const { data: invite, error } = await getInviteByToken(token)

  if (error || !invite) {
    return { valid: false, inviterEmail: null, error: 'This invite is invalid or has expired.' }
  }

  return { valid: true, inviterEmail: invite.invited_email, error: null }
}

export async function acceptInviteAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const { user } = await requireAuth()

  const token = formData.get('token')

  const { data: input, error: validationError } = validate(tokenSchema, { token })

  if (validationError || !input) {
    return { error: validationError ?? 'Validation failed' }
  }

  // Check that the user is not already in a couple
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (profile?.couple_id) {
    return { error: 'You are already in a couple. Leave your current couple first.' }
  }

  const { error: acceptError } = await acceptInvite(input.token)

  if (acceptError) {
    return { error: acceptError }
  }

  redirect('/dashboard')
}
