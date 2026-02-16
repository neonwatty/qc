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

describe('useNoteEditor - reset', () => {
  it('restores initial values after changes', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.setContent('Changed content')
      result.current.setPrivacy('private')
      result.current.addTag('new-tag')
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.content).toBe('Hello world')
    expect(result.current.privacy).toBe('shared')
    expect(result.current.tags).toEqual(['love', 'growth'])
  })

  it('restores to empty defaults when no initialNote', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('Some content')
      result.current.setPrivacy('shared')
      result.current.addTag('tag')
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.content).toBe('')
    expect(result.current.privacy).toBe('draft')
    expect(result.current.tags).toEqual([])
  })
})

describe('useNoteEditor - isModified', () => {
  it('is false after reset', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.setContent('Changed')
    })
    expect(result.current.isModified).toBe(true)

    act(() => {
      result.current.reset()
    })
    expect(result.current.isModified).toBe(false)
  })

  it('is true when content changes', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.setContent('Different content')
    })

    expect(result.current.isModified).toBe(true)
  })

  it('is true when privacy changes', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.setPrivacy('private')
    })

    expect(result.current.isModified).toBe(true)
  })

  it('is true when tags change', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.addTag('new-tag')
    })

    expect(result.current.isModified).toBe(true)
  })

  it('is false when content is set back to original value', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.setContent('Changed')
    })
    expect(result.current.isModified).toBe(true)

    act(() => {
      result.current.setContent('Hello world')
    })
    expect(result.current.isModified).toBe(false)
  })
})

describe('useNoteEditor - canSave', () => {
  it('is true when content is non-empty, modified, and within limit', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('Valid content')
    })

    expect(result.current.canSave).toBe(true)
  })

  it('is false when content is empty', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setPrivacy('shared')
    })

    expect(result.current.canSave).toBe(false)
  })

  it('is false when content is only whitespace', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('   ')
    })

    expect(result.current.canSave).toBe(false)
  })

  it('is false when not modified', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    expect(result.current.canSave).toBe(false)
  })

  it('is true when initialized with note and content is changed', () => {
    const { result } = renderHook(() => useNoteEditor({ initialNote: mockNote }))

    act(() => {
      result.current.setContent('Updated content')
    })

    expect(result.current.canSave).toBe(true)
  })
})

describe('useNoteEditor - wordCount and charCount', () => {
  it('returns correct values for normal text', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('Hello beautiful world')
    })

    expect(result.current.wordCount).toBe(3)
    expect(result.current.charCount).toBe(21)
  })

  it('returns 0 word count for empty content', () => {
    const { result } = renderHook(() => useNoteEditor())

    expect(result.current.wordCount).toBe(0)
    expect(result.current.charCount).toBe(0)
  })

  it('handles multiple spaces between words', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('Hello   world')
    })

    expect(result.current.wordCount).toBe(2)
  })

  it('handles newlines as word separators', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('Hello\nworld\nagain')
    })

    expect(result.current.wordCount).toBe(3)
  })

  it('returns 0 word count for whitespace-only content', () => {
    const { result } = renderHook(() => useNoteEditor())

    act(() => {
      result.current.setContent('   \n  \n  ')
    })

    expect(result.current.wordCount).toBe(0)
  })
})
