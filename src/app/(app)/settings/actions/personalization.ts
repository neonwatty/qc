'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { sanitizeDbError } from '@/lib/utils'
import { validate } from '@/lib/validation'

const personalizationSchema = z.object({
  primaryColor: z.string().max(50).optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  highContrast: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
})

export async function updatePersonalization(settings: Record<string, unknown>): Promise<{ error: string | null }> {
  const { user, supabase } = await requireAuth()

  const { data, error: validationError } = validate(personalizationSchema, settings)
  if (validationError || !data) return { error: validationError ?? 'Validation failed' }

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) return { error: 'No couple found' }

  const { data: couple } = await supabase.from('couples').select('settings').eq('id', profile.couple_id).single()
  const currentSettings = (couple?.settings as Record<string, unknown>) ?? {}

  const merged = { ...currentSettings }
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      merged[key] = value
    }
  }

  const { error } = await supabase.from('couples').update({ settings: merged }).eq('id', profile.couple_id)

  if (error) return { error: sanitizeDbError(error, 'updatePersonalization') }

  revalidatePath('/settings')
  return { error: null }
}
