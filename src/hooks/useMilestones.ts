'use client'

import { useState, useEffect, useCallback } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Milestone, MilestoneCategory, MilestoneRarity } from '@/types'

export interface MilestoneInput {
  title: string
  description: string
  category: MilestoneCategory
  icon: string
  photoFile?: File
  rarity?: MilestoneRarity
  points?: number
}

export interface UseMilestonesReturn {
  milestones: Milestone[]
  isLoading: boolean
  error: string | null
  createMilestone: (input: MilestoneInput) => Promise<Milestone>
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<Milestone>
  deleteMilestone: (id: string) => Promise<void>
  achieveMilestone: (id: string) => Promise<Milestone>
  uploadPhoto: (milestoneId: string, file: File) => Promise<string>
  getMilestonesByCategory: (category: MilestoneCategory) => Milestone[]
  getAchievedMilestones: () => Milestone[]
  getUpcomingMilestones: () => Milestone[]
  refresh: () => Promise<void>
}

function dbRowToMilestone(row: Record<string, unknown>): Milestone {
  return {
    id: row.id as string,
    coupleId: row.couple_id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    category: row.category as MilestoneCategory,
    icon: (row.icon as string) ?? null,
    achievedAt: (row.achieved_at as string) ?? null,
    rarity: row.rarity as MilestoneRarity,
    points: row.points as number,
    photoUrl: (row.photo_url as string) ?? null,
  }
}

export function useMilestones(coupleId: string | null): UseMilestonesReturn {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const loadMilestones = useCallback(async () => {
    if (!coupleId) {
      setMilestones([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('milestones')
        .select('*')
        .eq('couple_id', coupleId)
        .order('achieved_at', { ascending: false, nullsFirst: false })

      if (fetchError) throw fetchError

      setMilestones((data ?? []).map(dbRowToMilestone))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load milestones'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [coupleId, supabase])

  useEffect(() => {
    void loadMilestones()
  }, [loadMilestones])

  const uploadPhoto = useCallback(
    async (milestoneId: string, file: File): Promise<string> => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${coupleId}/${milestoneId}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('milestone-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('milestone-photos').getPublicUrl(path)

      return publicUrl
    },
    [coupleId, supabase],
  )

  const createMilestone = useCallback(
    async (input: MilestoneInput): Promise<Milestone> => {
      if (!coupleId) throw new Error('No couple linked')

      try {
        setError(null)

        const { data, error: insertError } = await supabase
          .from('milestones')
          .insert({
            couple_id: coupleId,
            title: input.title,
            description: input.description,
            category: input.category,
            icon: input.icon,
            rarity: input.rarity ?? 'common',
            points: input.points ?? 10,
          })
          .select()
          .single()

        if (insertError) throw insertError

        let photoUrl: string | null = null
        if (input.photoFile) {
          photoUrl = await uploadPhoto(data.id as string, input.photoFile)
          await supabase.from('milestones').update({ photo_url: photoUrl }).eq('id', data.id)
        }

        const milestone = dbRowToMilestone({ ...data, photo_url: photoUrl ?? data.photo_url })
        setMilestones((prev) => [milestone, ...prev])
        return milestone
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create milestone'
        setError(message)
        throw new Error(message)
      }
    },
    [coupleId, supabase, uploadPhoto],
  )

  const updateMilestone = useCallback(
    async (id: string, updates: Partial<Milestone>): Promise<Milestone> => {
      try {
        setError(null)

        const dbUpdates: Record<string, unknown> = {}
        if (updates.title !== undefined) dbUpdates.title = updates.title
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon
        if (updates.achievedAt !== undefined) dbUpdates.achieved_at = updates.achievedAt
        if (updates.rarity !== undefined) dbUpdates.rarity = updates.rarity
        if (updates.points !== undefined) dbUpdates.points = updates.points
        if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl

        const { data, error: updateError } = await supabase
          .from('milestones')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError

        const milestone = dbRowToMilestone(data)
        setMilestones((prev) => prev.map((m) => (m.id === id ? milestone : m)))
        return milestone
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update milestone'
        setError(message)
        throw new Error(message)
      }
    },
    [supabase],
  )

  const deleteMilestone = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null)
        const { error: deleteError } = await supabase.from('milestones').delete().eq('id', id)
        if (deleteError) throw deleteError
        setMilestones((prev) => prev.filter((m) => m.id !== id))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete milestone'
        setError(message)
        throw new Error(message)
      }
    },
    [supabase],
  )

  const achieveMilestone = useCallback(
    async (id: string): Promise<Milestone> => {
      return updateMilestone(id, { achievedAt: new Date().toISOString() })
    },
    [updateMilestone],
  )

  const getMilestonesByCategory = useCallback(
    (category: MilestoneCategory): Milestone[] => {
      return milestones.filter((m) => m.category === category)
    },
    [milestones],
  )

  const getAchievedMilestones = useCallback((): Milestone[] => {
    return milestones.filter((m) => m.achievedAt !== null)
  }, [milestones])

  const getUpcomingMilestones = useCallback((): Milestone[] => {
    return milestones.filter((m) => m.achievedAt === null)
  }, [milestones])

  return {
    milestones,
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    achieveMilestone,
    uploadPhoto,
    getMilestonesByCategory,
    getAchievedMilestones,
    getUpcomingMilestones,
    refresh: loadMilestones,
  }
}
