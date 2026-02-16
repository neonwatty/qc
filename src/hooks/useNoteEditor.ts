'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

import type { DbNote } from '@/types'

export type NotePrivacy = 'private' | 'shared' | 'draft'

interface UseNoteEditorOptions {
  initialNote?: DbNote | null
  maxLength?: number
}

interface UseNoteEditorReturn {
  content: string
  privacy: NotePrivacy
  tags: string[]
  isModified: boolean
  canSave: boolean
  wordCount: number
  charCount: number
  setContent: (content: string) => void
  setPrivacy: (privacy: NotePrivacy) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  reset: () => void
}

export function useNoteEditor({ initialNote, maxLength = 5000 }: UseNoteEditorOptions = {}): UseNoteEditorReturn {
  const [content, setContentRaw] = useState(initialNote?.content ?? '')
  const [privacy, setPrivacy] = useState<NotePrivacy>(initialNote?.privacy ?? 'draft')
  const [tags, setTags] = useState<string[]>(initialNote?.tags ?? [])

  const initialRef = useRef({
    content: initialNote?.content ?? '',
    privacy: (initialNote?.privacy as NotePrivacy) ?? 'draft',
    tags: initialNote?.tags ?? [],
  })

  useEffect(() => {
    if (initialNote) {
      setContentRaw(initialNote.content)
      setPrivacy(initialNote.privacy)
      setTags(initialNote.tags)
      initialRef.current = {
        content: initialNote.content,
        privacy: initialNote.privacy,
        tags: initialNote.tags,
      }
    }
  }, [initialNote])

  const setContent = useCallback(
    (value: string) => {
      // Remove excessive whitespace and enforce max length
      let processed = value.replace(/\n{3,}/g, '\n\n')
      if (processed.length > maxLength) {
        processed = processed.slice(0, maxLength)
      }
      setContentRaw(processed)
    },
    [maxLength],
  )

  const addTag = useCallback(
    (tag: string) => {
      const cleaned = tag.trim().toLowerCase()
      if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
        setTags((prev) => [...prev, cleaned])
      }
    },
    [tags],
  )

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const reset = useCallback(() => {
    setContentRaw(initialRef.current.content)
    setPrivacy(initialRef.current.privacy)
    setTags(initialRef.current.tags)
  }, [])

  const isModified =
    content !== initialRef.current.content ||
    privacy !== initialRef.current.privacy ||
    JSON.stringify(tags) !== JSON.stringify(initialRef.current.tags)

  const charCount = content.length
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  const canSave = content.trim().length > 0 && charCount <= maxLength && isModified

  return {
    content,
    privacy,
    tags,
    isModified,
    canSave,
    wordCount,
    charCount,
    setContent,
    setPrivacy,
    addTag,
    removeTag,
    reset,
  }
}
