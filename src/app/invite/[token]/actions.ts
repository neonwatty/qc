'use server'

import { redirect } from 'next/navigation'

import { requireAuth } from '@/lib/auth'
import { acceptInvite, getInviteByToken } from '@/lib/couples'

interface ActionResult {
  success: boolean
  error?: string
}

export async function acceptInviteAction(token: string): Promise<ActionResult> {
  await requireAuth()

  const { data: invite, error: lookupError } = await getInviteByToken(token)
  if (lookupError || !invite) {
    return { success: false, error: lookupError ?? 'Invite not found or expired' }
  }

  const { error } = await acceptInvite(token)
  if (error) return { success: false, error }

  redirect('/dashboard')
}
