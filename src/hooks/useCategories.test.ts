import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, cleanup, act } from '@testing-library/react'
import type { DbCategory } from '@/types/database'

type RealtimeOpts = {
  table: string
  coupleId: string
  onInsert?: (record: DbCategory) => void
  onUpdate?: (record: DbCategory) => void
  onDelete?: (oldRecord: Partial<DbCategory>) => void
}

let capturedOpts: RealtimeOpts | null = null

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: (opts: RealtimeOpts) => {
    capturedOpts = opts
  },
}))

const mockChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
}

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockChain),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

const { useCategories } = await import('@/hooks/useCategories')

function makeDbCategory(overrides: Partial<DbCategory> = {}): DbCategory {
  return {
    id: 'cat-1',
    couple_id: 'couple-abc',
    name: 'Communication',
    description: null,
    icon: '💬',
    is_active: true,
    is_system: true,
    sort_order: 1,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedOpts = null
    mockChain.order.mockResolvedValue({ data: [], error: null })
    cleanup()
  })

  it('returns empty and loading=false when coupleId is null', async () => {
    const { result } = renderHook(() => useCategories(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.categories).toEqual([])
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('loads categories from Supabase on mount', async () => {
    const dbRows: DbCategory[] = [
      makeDbCategory({ id: 'cat-1', name: 'Communication', sort_order: 1 }),
      makeDbCategory({ id: 'cat-2', name: 'Intimacy', sort_order: 2, icon: '❤️' }),
    ]
    mockChain.order.mockResolvedValue({ data: dbRows, error: null })

    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.categories).toHaveLength(2)
    expect(result.current.categories[0]).toEqual({
      id: 'cat-1',
      coupleId: 'couple-abc',
      name: 'Communication',
      description: null,
      icon: '💬',
      isActive: true,
      isSystem: true,
      sortOrder: 1,
      createdAt: '2025-01-01T00:00:00Z',
    })
    expect(result.current.categories[1].name).toBe('Intimacy')
  })

  it('handles Supabase error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockChain.order.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.categories).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load categories:', { message: 'DB error' })
    consoleSpy.mockRestore()
  })
})

describe('useCategories - realtime callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedOpts = null
    const initialRows: DbCategory[] = [
      makeDbCategory({ id: 'cat-1', name: 'Communication', sort_order: 1 }),
      makeDbCategory({ id: 'cat-2', name: 'Intimacy', sort_order: 2, icon: '❤️' }),
    ]
    mockChain.order.mockResolvedValue({ data: initialRows, error: null })
    cleanup()
  })

  it('adds new category on INSERT when active', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      capturedOpts!.onInsert!(makeDbCategory({ id: 'cat-3', name: 'Growth', sort_order: 3, icon: '🌱' }))
    })

    expect(result.current.categories).toHaveLength(3)
    expect(result.current.categories[2].name).toBe('Growth')
  })

  it('ignores INSERT for inactive category', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      capturedOpts!.onInsert!(makeDbCategory({ id: 'cat-3', name: 'Hidden', is_active: false }))
    })

    expect(result.current.categories).toHaveLength(2)
  })

  it('updates category on UPDATE', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      capturedOpts!.onUpdate!(makeDbCategory({ id: 'cat-1', name: 'Updated Name', sort_order: 1 }))
    })

    expect(result.current.categories.find((c) => c.id === 'cat-1')!.name).toBe('Updated Name')
  })

  it('removes category when deactivated via UPDATE', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      capturedOpts!.onUpdate!(makeDbCategory({ id: 'cat-1', is_active: false }))
    })

    expect(result.current.categories).toHaveLength(1)
    expect(result.current.categories[0].id).toBe('cat-2')
  })

  it('removes category on DELETE', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      capturedOpts!.onDelete!({ id: 'cat-1' })
    })

    expect(result.current.categories).toHaveLength(1)
    expect(result.current.categories[0].id).toBe('cat-2')
  })
})
