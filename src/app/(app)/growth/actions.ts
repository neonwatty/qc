'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth'
import { validate } from '@/lib/validation'
import type { MilestoneCategory, MilestoneRarity } from '@/types'

const MILESTONE_CATEGORIES: MilestoneCategory[] = [
  'relationship',
  'communication',
  'intimacy',
  'growth',
  'adventure',
  'milestone',
  'custom',
]

const MILESTONE_RARITIES: MilestoneRarity[] = ['common', 'rare', 'epic', 'legendary']

const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  category: z.enum(MILESTONE_CATEGORIES as [string, ...string[]]),
  icon: z.string().max(10).optional(),
  achievedAt: z.string().optional(),
  rarity: z.enum(MILESTONE_RARITIES as [string, ...string[]]).default('common'),
  points: z.number().int().min(0).max(1000).default(10),
})

const updateMilestoneSchema = createMilestoneSchema.partial().extend({
  id: z.string().uuid('Invalid milestone ID'),
})

interface ActionResult {
  success: boolean
  error?: string
  data?: { id: string }
}

export async function createMilestone(formData: FormData): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { success: false, error: 'You must be in a couple to create milestones' }
  }

  const raw = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
    category: formData.get('category') as string,
    icon: (formData.get('icon') as string) || undefined,
    achievedAt: (formData.get('achievedAt') as string) || undefined,
    rarity: (formData.get('rarity') as string) || 'common',
    points: Number(formData.get('points') || 10),
  }

  const validated = validate(createMilestoneSchema, raw)
  if (validated.error) {
    return { success: false, error: validated.error }
  }

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      couple_id: profile.couple_id,
      title: validated.data.title,
      description: validated.data.description ?? null,
      category: validated.data.category,
      icon: validated.data.icon ?? null,
      achieved_at: validated.data.achievedAt ?? new Date().toISOString(),
      rarity: validated.data.rarity,
      points: validated.data.points,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: 'Failed to create milestone' }
  }

  revalidatePath('/growth')
  return { success: true, data: { id: data.id } }
}

export async function updateMilestone(formData: FormData): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { success: false, error: 'You must be in a couple to update milestones' }
  }

  const raw = {
    id: formData.get('id') as string,
    title: (formData.get('title') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    category: (formData.get('category') as string) || undefined,
    icon: (formData.get('icon') as string) || undefined,
    achievedAt: (formData.get('achievedAt') as string) || undefined,
    rarity: (formData.get('rarity') as string) || undefined,
    points: formData.get('points') ? Number(formData.get('points')) : undefined,
  }

  const validated = validate(updateMilestoneSchema, raw)
  if (validated.error) {
    return { success: false, error: validated.error }
  }

  const { id, ...fields } = validated.data
  const updateData: Record<string, unknown> = {}

  if (fields.title !== undefined) updateData.title = fields.title
  if (fields.description !== undefined) updateData.description = fields.description
  if (fields.category !== undefined) updateData.category = fields.category
  if (fields.icon !== undefined) updateData.icon = fields.icon
  if (fields.achievedAt !== undefined) updateData.achieved_at = fields.achievedAt
  if (fields.rarity !== undefined) updateData.rarity = fields.rarity
  if (fields.points !== undefined) updateData.points = fields.points

  const { error } = await supabase
    .from('milestones')
    .update(updateData)
    .eq('id', id)
    .eq('couple_id', profile.couple_id)

  if (error) {
    return { success: false, error: 'Failed to update milestone' }
  }

  revalidatePath('/growth')
  return { success: true, data: { id } }
}

export async function deleteMilestone(formData: FormData): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const id = formData.get('id') as string
  if (!id) {
    return { success: false, error: 'Milestone ID is required' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { success: false, error: 'You must be in a couple to delete milestones' }
  }

  // Delete photo from storage if exists
  const { data: milestone } = await supabase
    .from('milestones')
    .select('photo_url')
    .eq('id', id)
    .eq('couple_id', profile.couple_id)
    .single()

  if (milestone?.photo_url) {
    const path = `${profile.couple_id}/${id}`
    await supabase.storage.from('milestone-photos').remove([path])
  }

  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)
    .eq('couple_id', profile.couple_id)

  if (error) {
    return { success: false, error: 'Failed to delete milestone' }
  }

  revalidatePath('/growth')
  return { success: true }
}

export async function uploadPhoto(formData: FormData): Promise<ActionResult> {
  const { user, supabase } = await requireAuth()

  const milestoneId = formData.get('milestoneId') as string
  const file = formData.get('photo') as File

  if (!milestoneId || !file) {
    return { success: false, error: 'Milestone ID and photo are required' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Photo must be under 5MB' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { success: false, error: 'You must be in a couple to upload photos' }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `${profile.couple_id}/${milestoneId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('milestone-photos')
    .upload(storagePath, file, { upsert: true })

  if (uploadError) {
    return { success: false, error: 'Failed to upload photo' }
  }

  const { data: publicUrl } = supabase.storage
    .from('milestone-photos')
    .getPublicUrl(storagePath)

  const { error: updateError } = await supabase
    .from('milestones')
    .update({ photo_url: publicUrl.publicUrl })
    .eq('id', milestoneId)
    .eq('couple_id', profile.couple_id)

  if (updateError) {
    return { success: false, error: 'Failed to save photo URL' }
  }

  revalidatePath('/growth')
  return { success: true, data: { id: milestoneId } }
}
