'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'
import type { DbRequest } from '@/types/database'

const createRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['activity', 'task', 'reminder', 'conversation', 'date-night', 'custom']),
  priority: z.enum(['low', 'medium', 'high']),
  requestedFor: z.string().uuid('Invalid partner ID'),
  suggestedDate: z.string().optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['accepted', 'declined', 'converted']),
})

interface ActionResult {
  error?: string
}

export async function createRequest(formData: FormData): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: 'You must be part of a couple to create requests' }
  }

  const raw = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    priority: formData.get('priority'),
    requestedFor: formData.get('requestedFor'),
    suggestedDate: formData.get('suggestedDate') || undefined,
  }

  const { data: validated, error: validationError } = validate(createRequestSchema, raw)
  if (validationError) return { error: validationError }

  const row: Omit<DbRequest, 'id' | 'created_at'> = {
    couple_id: profile.couple_id,
    requested_by: user.id,
    requested_for: validated.requestedFor,
    title: validated.title,
    description: validated.description ?? null,
    category: validated.category,
    priority: validated.priority,
    status: 'pending',
    suggested_date: validated.suggestedDate ?? null,
  }

  const { error } = await supabase.from('requests').insert(row)
  if (error) return { error: error.message }

  revalidatePath('/requests')
  return {}
}

export async function updateRequestStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { data: validated, error: validationError } = validate(updateStatusSchema, { status })
  if (validationError) return { error: validationError }

  const { data: request } = await supabase
    .from('requests')
    .select('requested_for, status')
    .eq('id', id)
    .single()

  if (!request) return { error: 'Request not found' }

  if (validated.status === 'converted') {
    if (request.status !== 'accepted') {
      return { error: 'Only accepted requests can be converted' }
    }
  } else if (request.requested_for !== user.id) {
    return { error: 'Only the recipient can accept or decline requests' }
  }

  if (request.status !== 'pending' && validated.status !== 'converted') {
    return { error: 'This request has already been responded to' }
  }

  const { error } = await supabase
    .from('requests')
    .update({ status: validated.status })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return {}
}

export async function deleteRequest(id: string): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', id)
    .eq('requested_by', user.id)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  return {}
}
