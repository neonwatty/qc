'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(2),
})

export interface SettingsActionState {
  error?: string
  success?: boolean
}

export async function createCategory(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) return { error: 'You must be in a couple to create categories' }

  const raw = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || '💬',
  }

  const { data: validated, error: validationError } = validate(categorySchema, raw)
  if (validationError || !validated) return { error: validationError || 'Validation failed' }

  const { data: categories } = await supabase
    .from('categories')
    .select('sort_order')
    .eq('couple_id', profile.couple_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const maxOrder = categories && categories.length > 0 ? categories[0].sort_order : 0

  const { error } = await supabase.from('categories').insert({
    couple_id: profile.couple_id,
    name: validated.name,
    description: validated.description || null,
    icon: validated.icon,
    sort_order: maxOrder + 1,
  })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function updateCategory(
  categoryId: string,
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) return { error: 'You must be in a couple to update categories' }

  const raw = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || '💬',
  }

  const { data: validated, error: validationError } = validate(categorySchema, raw)
  if (validationError || !validated) return { error: validationError || 'Validation failed' }

  const { error } = await supabase
    .from('categories')
    .update(validated)
    .eq('id', categoryId)
    .eq('couple_id', profile.couple_id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean): Promise<{ error?: string }> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) return { error: 'You must be in a couple to update categories' }

  const { error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', categoryId)
    .eq('couple_id', profile.couple_id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return {}
}

