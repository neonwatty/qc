'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'

const notePrivacySchema = z.enum(['private', 'shared', 'draft'])

const createNoteSchema = z.object({
  coupleId: z.string().uuid('Invalid couple ID'),
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(10000, 'Note must be 10,000 characters or less'),
  privacy: notePrivacySchema,
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').default([]),
  checkInId: z.string().uuid().nullable().default(null),
  categoryId: z.string().uuid().nullable().default(null),
})

const updateNoteSchema = z.object({
  id: z.string().uuid('Invalid note ID'),
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(10000, 'Note must be 10,000 characters or less')
    .optional(),
  privacy: notePrivacySchema.optional(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
  checkInId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
})

const deleteNoteSchema = z.object({
  id: z.string().uuid('Invalid note ID'),
})

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one note ID required').max(50),
})

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createNote(
  input: z.infer<typeof createNoteSchema>,
): Promise<ActionResult<{ id: string }>> {
  const { user, supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(createNoteSchema, input)

  if (validationError) {
    return { success: false, error: validationError }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.couple_id !== validated.coupleId) {
    return { success: false, error: 'You do not belong to this couple' }
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      couple_id: validated.coupleId,
      author_id: user.id,
      content: validated.content,
      privacy: validated.privacy,
      tags: validated.tags,
      check_in_id: validated.checkInId,
      category_id: validated.categoryId,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: 'Failed to create note' }
  }

  revalidatePath('/notes')
  return { success: true, data: { id: data.id } }
}

export async function updateNote(
  input: z.infer<typeof updateNoteSchema>,
): Promise<ActionResult<{ id: string }>> {
  const { user, supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(updateNoteSchema, input)

  if (validationError) {
    return { success: false, error: validationError }
  }

  const { data: existing } = await supabase
    .from('notes')
    .select('author_id')
    .eq('id', validated.id)
    .single()

  if (!existing) {
    return { success: false, error: 'Note not found' }
  }

  if (existing.author_id !== user.id) {
    return { success: false, error: 'You can only edit your own notes' }
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (validated.content !== undefined) updates.content = validated.content
  if (validated.privacy !== undefined) updates.privacy = validated.privacy
  if (validated.tags !== undefined) updates.tags = validated.tags
  if (validated.checkInId !== undefined) updates.check_in_id = validated.checkInId
  if (validated.categoryId !== undefined) updates.category_id = validated.categoryId

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', validated.id)
    .select('id')
    .single()

  if (error) {
    return { success: false, error: 'Failed to update note' }
  }

  revalidatePath('/notes')
  return { success: true, data: { id: data.id } }
}

export async function deleteNote(
  input: z.infer<typeof deleteNoteSchema>,
): Promise<ActionResult<null>> {
  const { user, supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(deleteNoteSchema, input)

  if (validationError) {
    return { success: false, error: validationError }
  }

  const { data: existing } = await supabase
    .from('notes')
    .select('author_id')
    .eq('id', validated.id)
    .single()

  if (!existing) {
    return { success: false, error: 'Note not found' }
  }

  if (existing.author_id !== user.id) {
    return { success: false, error: 'You can only delete your own notes' }
  }

  const { error } = await supabase.from('notes').delete().eq('id', validated.id)

  if (error) {
    return { success: false, error: 'Failed to delete note' }
  }

  revalidatePath('/notes')
  return { success: true, data: null }
}

export async function bulkDeleteNotes(
  input: z.infer<typeof bulkDeleteSchema>,
): Promise<ActionResult<{ deleted: number }>> {
  const { user, supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(bulkDeleteSchema, input)

  if (validationError) {
    return { success: false, error: validationError }
  }

  const { data: notes } = await supabase
    .from('notes')
    .select('id, author_id')
    .in('id', validated.ids)

  if (!notes || notes.length === 0) {
    return { success: false, error: 'No notes found' }
  }

  const unauthorized = notes.filter((n) => n.author_id !== user.id)
  if (unauthorized.length > 0) {
    return { success: false, error: 'You can only delete your own notes' }
  }

  const authorizedIds = notes.map((n) => n.id)
  const { error } = await supabase.from('notes').delete().in('id', authorizedIds)

  if (error) {
    return { success: false, error: 'Failed to delete notes' }
  }

  revalidatePath('/notes')
  return { success: true, data: { deleted: authorizedIds.length } }
}
