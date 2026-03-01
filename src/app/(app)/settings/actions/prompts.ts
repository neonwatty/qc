'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { sanitizeDbError } from '@/lib/utils'
import { validate } from '@/lib/validation'

const promptsSchema = z.object({
  categoryId: z.string().uuid(),
  prompts: z.array(z.string().min(1).max(200)).max(10),
})

export async function updateCategoryPrompts(categoryId: string, prompts: string[]): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const { data: validated, error: validationError } = validate(promptsSchema, { categoryId, prompts })
  if (validationError || !validated) return { error: validationError || 'Validation failed' }

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) return { error: 'You must be in a couple to manage prompts' }

  const { error } = await supabase
    .from('categories')
    .update({ prompts: validated.prompts })
    .eq('id', validated.categoryId)
    .eq('couple_id', profile.couple_id)

  if (error) return { error: sanitizeDbError(error, 'prompts') }

  revalidatePath('/settings')
  return { error: null }
}
