'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'

const noteSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be 5000 characters or less'),
  privacy: z.enum(['private', 'shared', 'draft']),
  tags: z.array(z.string()).max(10).default([]),
  category_id: z.string().nullable().default(null),
  check_in_id: z.string().nullable().default(null),
})

const updateNoteSchema = noteSchema.partial()

const deleteSchema = z.object({
  id: z.string().uuid(),
})

export type NoteActionState = {
  error: string | null
}

export async function createNote(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const { user, supabase } = await requireAuth()

  const raw = {
    content: formData.get('content'),
    privacy: formData.get('privacy') ?? 'draft',
    tags: JSON.parse((formData.get('tags') as string) || '[]'),
    category_id: formData.get('category_id') || null,
    check_in_id: formData.get('check_in_id') || null,
  }

  const { data: input, error: validationError } = validate(noteSchema, raw)

  if (validationError || !input) {
    return { error: validationError ?? 'Validation failed' }
  }

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) {
    return { error: 'You must be in a couple to create notes.' }
  }

  const { error: insertError } = await supabase.from('notes').insert({
    couple_id: profile.couple_id,
    author_id: user.id,
    content: input.content,
    privacy: input.privacy,
    tags: input.tags,
    category_id: input.category_id,
    check_in_id: input.check_in_id,
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/notes')
  return { error: null }
}

export async function updateNote(_prev: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const { user, supabase } = await requireAuth()

  const id = formData.get('id') as string
  if (!id) return { error: 'Note ID is required' }

  const raw: Record<string, unknown> = {}
  const content = formData.get('content')
  const privacy = formData.get('privacy')
  const tags = formData.get('tags')

  if (content !== null) raw.content = content
  if (privacy !== null) raw.privacy = privacy
  if (tags !== null) raw.tags = JSON.parse(tags as string)

  const { data: input, error: validationError } = validate(updateNoteSchema, raw)

  if (validationError || !input) {
    return { error: validationError ?? 'Validation failed' }
  }

  const { error: updateError } = await supabase.from('notes').update(input).eq('id', id).eq('author_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/notes')
  return { error: null }
}

export async function deleteNoteById(noteId: string): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const { data: input, error: validationError } = validate(deleteSchema, { id: noteId })

  if (validationError || !input) {
    return { error: validationError ?? 'Validation failed' }
  }

  const { error: deleteError } = await supabase.from('notes').delete().eq('id', input.id).eq('author_id', user.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/notes')
  return { error: null }
}
