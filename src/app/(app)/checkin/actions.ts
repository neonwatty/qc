'use server'

import { z } from 'zod'

import { requireAuth } from '@/lib/auth'

const createCheckInSchema = z.object({
  categories: z.array(z.string().min(1)).min(1),
  moodBefore: z.number().min(1).max(5),
})

const updateCheckInSchema = z.object({
  checkInId: z.string().uuid(),
  moodAfter: z.number().min(1).max(5).optional(),
  reflection: z.string().max(2000).optional(),
  categories: z.array(z.string().min(1)).optional(),
})

const completeCheckInSchema = z.object({
  checkInId: z.string().uuid(),
  moodAfter: z.number().min(1).max(5),
  reflection: z.string().max(2000).optional(),
})

const addNoteSchema = z.object({
  checkInId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  privacy: z.enum(['private', 'shared', 'draft']),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().nullable().default(null),
})

const addActionItemSchema = z.object({
  checkInId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().default(null),
  assignedTo: z.string().uuid().nullable().default(null),
  dueDate: z.string().nullable().default(null),
})

export async function createCheckIn(
  input: z.infer<typeof createCheckInSchema>,
): Promise<{ id: string } | { error: string }> {
  const { user, supabase } = await requireAuth()
  const parsed = createCheckInSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: 'You must be in a couple to start a check-in' }
  }

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      couple_id: profile.couple_id,
      categories: parsed.data.categories,
      mood_before: parsed.data.moodBefore,
      status: 'in-progress',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { id: data.id }
}

export async function updateCheckIn(
  input: z.infer<typeof updateCheckInSchema>,
): Promise<{ success: boolean } | { error: string }> {
  const { user, supabase } = await requireAuth()
  const parsed = updateCheckInSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: 'Not in a couple' }
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.moodAfter !== undefined) {
    updates.mood_after = parsed.data.moodAfter
  }
  if (parsed.data.reflection !== undefined) {
    updates.reflection = parsed.data.reflection
  }
  if (parsed.data.categories !== undefined) {
    updates.categories = parsed.data.categories
  }

  const { error } = await supabase
    .from('check_ins')
    .update(updates)
    .eq('id', parsed.data.checkInId)
    .eq('couple_id', profile.couple_id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function completeCheckIn(
  input: z.infer<typeof completeCheckInSchema>,
): Promise<{ success: boolean } | { error: string }> {
  const { user, supabase } = await requireAuth()
  const parsed = completeCheckInSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: 'Not in a couple' }
  }

  const { error } = await supabase
    .from('check_ins')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      mood_after: parsed.data.moodAfter,
      reflection: parsed.data.reflection ?? null,
    })
    .eq('id', parsed.data.checkInId)
    .eq('couple_id', profile.couple_id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function addNote(
  input: z.infer<typeof addNoteSchema>,
): Promise<{ id: string } | { error: string }> {
  const { user, supabase } = await requireAuth()
  const parsed = addNoteSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: 'Not in a couple' }
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      couple_id: profile.couple_id,
      author_id: user.id,
      check_in_id: parsed.data.checkInId,
      content: parsed.data.content,
      privacy: parsed.data.privacy,
      tags: parsed.data.tags,
      category_id: parsed.data.categoryId,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { id: data.id }
}

export async function addActionItem(
  input: z.infer<typeof addActionItemSchema>,
): Promise<{ id: string } | { error: string }> {
  const { user, supabase } = await requireAuth()
  const parsed = addActionItemSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: 'Not in a couple' }
  }

  const { data, error } = await supabase
    .from('action_items')
    .insert({
      couple_id: profile.couple_id,
      check_in_id: parsed.data.checkInId,
      title: parsed.data.title,
      description: parsed.data.description,
      assigned_to: parsed.data.assignedTo,
      due_date: parsed.data.dueDate,
      completed: false,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { id: data.id }
}
