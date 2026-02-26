// WT-4 Cross-Feature Linking: Love language discovery operations
import { createClient } from '@/lib/supabase/client'
import type { DbLoveLanguageDiscovery, LoveLanguageDiscovery } from '@/types'

// Map DB row to domain object
export function mapDbDiscovery(row: DbLoveLanguageDiscovery): LoveLanguageDiscovery {
  return {
    id: row.id,
    coupleId: row.couple_id,
    userId: row.user_id,
    checkInId: row.check_in_id,
    discovery: row.discovery,
    convertedToLanguageId: row.converted_to_language_id,
    createdAt: row.created_at,
  }
}

// Fetch all discoveries for a user
export async function fetchDiscoveries(coupleId: string, userId: string): Promise<LoveLanguageDiscovery[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('love_language_discoveries')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapDbDiscovery)
}

// Create a new discovery
interface NewDiscoveryInput {
  discovery: string
  checkInId?: string | null
}

export async function insertDiscovery(
  coupleId: string,
  userId: string,
  input: NewDiscoveryInput,
): Promise<LoveLanguageDiscovery> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('love_language_discoveries')
    .insert({
      couple_id: coupleId,
      user_id: userId,
      discovery: input.discovery,
      check_in_id: input.checkInId ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Failed to create discovery')
  return mapDbDiscovery(data)
}

// Delete a discovery
export async function deleteDiscoveryDb(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('love_language_discoveries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// Convert discovery to love language
export async function convertDiscoveryToLanguage(
  discoveryId: string,
  languageId: string,
): Promise<LoveLanguageDiscovery> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('love_language_discoveries')
    .update({ converted_to_language_id: languageId })
    .eq('id', discoveryId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Failed to convert discovery')
  return mapDbDiscovery(data)
}
