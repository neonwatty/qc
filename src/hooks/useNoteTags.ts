'use client'

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

interface UseNoteTagsOptions {
  coupleId: string | null
}

interface UseNoteTagsReturn {
  allTags: string[]
  selectedTags: string[]
  suggestions: string[]
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  setSelectedTags: (tags: string[]) => void
  getSuggestions: (query: string) => string[]
  isLoading: boolean
}

export function useNoteTags({ coupleId }: UseNoteTagsOptions): UseNoteTagsReturn {
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!coupleId) return

    async function fetchTags() {
      setIsLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('notes')
        .select('tags')
        .eq('couple_id', coupleId)

      if (data) {
        const tagSet = new Set<string>()
        for (const row of data) {
          if (Array.isArray(row.tags)) {
            for (const tag of row.tags) {
              tagSet.add(tag)
            }
          }
        }
        setAllTags(Array.from(tagSet).sort())
      }

      setIsLoading(false)
    }

    fetchTags()
  }, [coupleId])

  const addTag = useCallback(
    (tag: string) => {
      const normalized = tag.trim().toLowerCase()
      if (!normalized) return
      if (selectedTags.includes(normalized)) return

      setSelectedTags((prev) => [...prev, normalized])

      if (!allTags.includes(normalized)) {
        setAllTags((prev) => [...prev, normalized].sort())
      }
    },
    [selectedTags, allTags],
  )

  const removeTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const getSuggestions = useCallback(
    (query: string): string[] => {
      if (!query.trim()) return allTags.filter((t) => !selectedTags.includes(t))

      const lower = query.toLowerCase()
      return allTags
        .filter((t) => t.includes(lower) && !selectedTags.includes(t))
        .slice(0, 10)
    },
    [allTags, selectedTags],
  )

  const suggestions = allTags.filter((t) => !selectedTags.includes(t)).slice(0, 10)

  return {
    allTags,
    selectedTags,
    suggestions,
    addTag,
    removeTag,
    setSelectedTags,
    getSuggestions,
    isLoading,
  }
}
