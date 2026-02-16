import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useNoteEditor } from '@/hooks/useNoteEditor'
import type { DbNote } from '@/types'

const mockNote: DbNote = {
  id: 'note-1',
  couple_id: 'couple-1',
  author_id: 'user-1',
  check_in_id: null,
  content: 'Hello world',
  privacy: 'shared',
  tags: ['love', 'growth'],
  category_id: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

describe('useNoteEditor - default state', () => {
  it('initializes with empty content, draft privacy, empty tags, not modified, cannot save', () => {
    const { result } = renderHook(() => useNoteEditor())

    expect(result.current.content).toBe('')
    expect(result.current.privacy).toBe('draft')
    expect(result.current.tags).toEqual([])
    expect(result.current.isModified).toBe(false)
    expect(result.current.canSave).toBe(false)
    expect(result.current.wordCount).toBe(0)
    expect(result.current.charCount).toBe(0)
  })
})

describe('useNoteEditor - with initialNote', () => {
  it('initializes content, privacy, and tags from the note', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    expect(result.current.content).toBe('Hello world')
    expect(result.current.privacy).toBe('shared')
    expect(result.current.tags).toEqual(['love', 'growth'])
  })

  it('is not modified when initialized with a note', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    expect(result.current.isModified).toBe(false)
  })
})

describe('useNoteEditor - setContent', () => {
  it('sets content and marks as modified', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('New content')
    })

    expect(result.current.content).toBe('New content')
    expect(result.current.isModified).toBe(true)
  })

  it('truncates content at maxLength', () => {
    const { result } = renderHook(() => useNoteEditor({ maxLength: 10 }))

    act(() => {
      result.current.setContent('This is way too long for the limit')
    })

    expect(result.current.content).toBe('This is wa')
    expect(result.current.charCount).toBe(10)
  })

  it('collapses 3+ consecutive newlines to 2', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('Hello\n\n\n\nWorld')
    })

    expect(result.current.content).toBe('Hello\n\nWorld')
  })

  it('collapses many consecutive newlines to exactly 2', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('A\n\n\n\n\n\nB')
    })

    expect(result.current.content).toBe('A\n\nB')
  })

  it('preserves exactly 2 consecutive newlines', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('Hello\n\nWorld')
    })

    expect(result.current.content).toBe('Hello\n\nWorld')
  })
})

describe('useNoteEditor - addTag', () => {
  it('adds a lowercase tag', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.addTag('Love')
    })

    expect(result.current.tags).toEqual(['love'])
  })

  it('trims whitespace from tags', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.addTag('  growth  ')
    })

    expect(result.current.tags).toEqual(['growth'])
  })

  it('does not add a duplicate tag', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.addTag('love')
    })
    act(() => {
      result.current.addTag('love')
    })

    expect(result.current.tags).toEqual(['love'])
  })

  it('does not exceed 10 tags', () => {
    const { result } = renderHook(() => useNoteEditor())

    for (let i = 0; i < 12; i++) {
      act(() => {
        result.current.addTag(`tag-${i}`)
      })
    }

    expect(result.current.tags).toHaveLength(10)
    expect(result.current.tags).not.toContain('tag-10')
    expect(result.current.tags).not.toContain('tag-11')
  })

  it('does not add an empty string', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.addTag('')
    })

    expect(result.current.tags).toEqual([])
  })
})

describe('useNoteEditor - removeTag', () => {
  it('removes a matching tag', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.removeTag('love')
    })

    expect(result.current.tags).toEqual(['growth'])
  })

  it('does nothing when tag does not exist', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.removeTag('nonexistent')
    })

    expect(result.current.tags).toEqual(['love', 'growth'])
  })
})
