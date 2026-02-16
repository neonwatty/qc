'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'

const requestSchema = z.object({
  requested_for: z.string().uuid('Invalid partner ID'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['activity', 'task', 'reminder', 'conversation', 'date-night', 'custom']),
  priority: z.enum(['low', 'medium', 'high']),
  suggested_date: z.string().optional(),
})

export interface RequestActionState {
  error?: string
  success?: boolean
}

export async function createRequest(_prev: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) {
    return { error: 'You must be in a couple to create requests' }
  }

  const raw = {
    requested_for: formData.get('requested_for'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    priority: formData.get('priority'),
    suggested_date: formData.get('suggested_date') || undefined,
  }

  const { data, error: validationError } = validate(requestSchema, raw)
  if (validationError || !data) return { error: validationError ?? 'Validation failed' }

  const { error } = await supabase.from('requests').insert({
    couple_id: profile.couple_id,
    requested_by: user.id,
    requested_for: data.requested_for,
    title: data.title,
    description: data.description ?? null,
    category: data.category,
    priority: data.priority,
    status: 'pending',
    suggested_date: data.suggested_date ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return { success: true }
}

export async function respondToRequest(
  requestId: string,
  status: 'accepted' | 'declined',
): Promise<{ error?: string }> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('requests').update({ status }).eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return {}
}

export async function deleteRequest(requestId: string): Promise<{ error?: string }> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('requests').delete().eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return {}
}
