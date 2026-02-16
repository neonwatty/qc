'use client'

import { useState, useCallback, useMemo } from 'react'

import type { DbNote } from '@/types'

interface UseNoteTagsReturn {
  allTags: string[]
  selectedTags: string[]
  toggleTag: (tag: string) => void
  clearSelection: () => void
  filterByTags: (notes: DbNote[]) => DbNote[]
  getTagCounts: (notes: DbNote[]) => Map<string, number>
}

export function useNoteTags(notes: DbNote[]): UseNoteTagsReturn {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Extract all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const note of notes) {
      for (const tag of note.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  }, [notes])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTags([])
  }, [])

  const filterByTags = useCallback(
    (noteList: DbNote[]): DbNote[] => {
      if (selectedTags.length === 0) return noteList
      return noteList.filter((note) => selectedTags.some((tag) => note.tags.includes(tag)))
    },
    [selectedTags],
  )

  const getTagCounts = useCallback((noteList: DbNote[]): Map<string, number> => {
    const counts = new Map<string, number>()
    for (const note of noteList) {
      for (const tag of note.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return counts
  }, [])

  return {
    allTags,
    selectedTags,
    toggleTag,
    clearSelection,
    filterByTags,
    getTagCounts,
  }
}
