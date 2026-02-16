'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'

const LOVE_LANGUAGES_PATH = '/love-languages'

// --- Zod schemas ---

const createLanguageSchema = z.object({
  coupleId: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(['words', 'acts', 'gifts', 'time', 'touch', 'custom']),
  privacy: z.enum(['private', 'shared']),
  importance: z.enum(['low', 'medium', 'high', 'essential']),
  examples: z.array(z.string().max(500)).max(10).default([]),
  tags: z.array(z.string().max(50)).max(10).default([]),
})

const updateLanguageSchema = createLanguageSchema.partial().omit({ coupleId: true })

const createActionSchema = z.object({
  coupleId: z.string().uuid(),
  linkedLanguageId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['suggested', 'planned', 'completed', 'recurring']).default('suggested'),
  frequency: z.enum(['once', 'weekly', 'monthly', 'surprise']).default('once'),
  difficulty: z.enum(['easy', 'moderate', 'challenging']).default('easy'),
})

const updateActionSchema = createActionSchema.partial().omit({ coupleId: true })

// --- Server action result type ---

interface ActionResult<T = unknown> {
  data?: T
  error?: string
}

// --- Love Language CRUD ---

export async function createLanguage(
  input: z.infer<typeof createLanguageSchema>,
): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(createLanguageSchema, input)

  if (validationError) {
    return { error: validationError }
  }

  const { data, error } = await supabase
    .from('love_languages')
    .insert({
      couple_id: validated.coupleId,
      user_id: user.id,
      title: validated.title,
      description: validated.description ?? null,
      category: validated.category,
      privacy: validated.privacy,
      importance: validated.importance,
      examples: validated.examples,
      tags: validated.tags,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(LOVE_LANGUAGES_PATH)
  return { data }
}

export async function updateLanguage(
  id: string,
  input: z.infer<typeof updateLanguageSchema>,
): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(updateLanguageSchema, input)

  if (validationError) {
    return { error: validationError }
  }

  const updates: Record<string, unknown> = {}
  if (validated.title !== undefined) updates.title = validated.title
  if (validated.description !== undefined) updates.description = validated.description
  if (validated.category !== undefined) updates.category = validated.category
  if (validated.privacy !== undefined) updates.privacy = validated.privacy
  if (validated.importance !== undefined) updates.importance = validated.importance
  if (validated.examples !== undefined) updates.examples = validated.examples
  if (validated.tags !== undefined) updates.tags = validated.tags

  const { data, error } = await supabase
    .from('love_languages')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(LOVE_LANGUAGES_PATH)
  return { data }
}

export async function deleteLanguage(id: string): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { error } = await supabase
    .from('love_languages')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(LOVE_LANGUAGES_PATH)
  return { data: { success: true } }
}

// --- Love Action CRUD ---

export async function createAction(
  input: z.infer<typeof createActionSchema>,
): Promise<ActionResult> {
  const { supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(createActionSchema, input)

  if (validationError) {
    return { error: validationError }
  }

  const { data, error } = await supabase
    .from('love_actions')
    .insert({
      couple_id: validated.coupleId,
      linked_language_id: validated.linkedLanguageId ?? null,
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      frequency: validated.frequency,
      difficulty: validated.difficulty,
      completed_count: 0,
      last_completed_at: null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(LOVE_LANGUAGES_PATH)
  return { data }
}

export async function updateAction(
  id: string,
  input: z.infer<typeof updateActionSchema>,
): Promise<ActionResult> {
  const { supabase } = await requireAuth()
  const { data: validated, error: validationError } = validate(updateActionSchema, input)

  if (validationError) {
    return { error: validationError }
  }

  const updates: Record<string, unknown> = {}
  if (validated.linkedLanguageId !== undefined) {
    updates.linked_language_id = validated.linkedLanguageId
  }
  if (validated.title !== undefined) updates.title = validated.title
  if (validated.description !== undefined) updates.description = validated.description
  if (validated.status !== undefined) updates.status = validated.status
  if (validated.frequency !== undefined) updates.frequency = validated.frequency
  if (validated.difficulty !== undefined) updates.difficulty = validated.difficulty

  const { data, error } = await supabase
    .from('love_actions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(LOVE_LANGUAGES_PATH)
  return { data }
}

export async function completeAction(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { data: existing, error: fetchError } = await supabase
    .from('love_actions')
    .select('completed_count')
    .eq('id', id)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  const { data, error } = await supabase
    .from('love_actions')
    .update({
      completed_count: (existing.completed_count as number) + 1,
      last_completed_at: new Date().toISOString(),
      status: 'completed',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(LOVE_LANGUAGES_PATH)
  return { data }
}
