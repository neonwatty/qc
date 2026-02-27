import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

const mockFetchActiveCheckIn = vi.fn().mockResolvedValue({ data: null, error: null })
const mockFetchCheckInActionItems = vi.fn().mockResolvedValue({ data: [], error: null })

vi.mock('@/lib/checkin-operations', () => ({
  mapDbActionItem: vi.fn((item) => item),
  fetchActiveCheckIn: (...args: unknown[]) => mockFetchActiveCheckIn(...args),
  fetchCheckInActionItems: (...args: unknown[]) => mockFetchCheckInActionItems(...args),
  insertCheckIn: vi.fn().mockResolvedValue({ data: { id: 'ci-1' }, error: null }),
  updateCheckInStatus: vi.fn().mockResolvedValue({ error: null }),
  insertNote: vi.fn().mockResolvedValue({
    data: {
      id: 'n1',
      couple_id: 'c1',
      author_id: 'u1',
      check_in_id: null,
      content: '',
      privacy: 'draft',
      tags: [],
      category_id: null,
      created_at: '',
      updated_at: '',
    },
    error: null,
  }),
  updateNote: vi.fn().mockResolvedValue({ error: null }),
  deleteNote: vi.fn().mockResolvedValue({ error: null }),
  insertActionItem: vi.fn().mockResolvedValue({ error: null }),
  updateActionItemDb: vi.fn().mockResolvedValue({ error: null }),
  deleteActionItem: vi.fn().mockResolvedValue({ error: null }),
  toggleActionItemDb: vi.fn().mockResolvedValue({ error: null }),
}))

vi.stubGlobal('crypto', { randomUUID: () => 'uuid-test' })

const { CheckInProvider, useCheckInContext } = await import('./CheckInContext')

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <CheckInProvider coupleId="couple-1" userId="user-1">
      {children}
    </CheckInProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchActiveCheckIn.mockResolvedValue({ data: null, error: null })
})

describe('useCheckInContext', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useCheckInContext())).toThrow(
      'useCheckInContext must be used within a CheckInProvider',
    )
  })

  it('starts with isLoading true', () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('has null session when no active check-in exists', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(mockFetchActiveCheckIn).toHaveBeenCalledWith('couple-1')
    })
    expect(result.current.session).toBeNull()
  })

  it('canGoToStep returns false when no session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(mockFetchActiveCheckIn).toHaveBeenCalled()
    })
    expect(result.current.canGoToStep('welcome')).toBe(false)
  })

  it('getStepIndex returns correct index', () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    expect(result.current.getStepIndex('welcome')).toBe(0)
    expect(result.current.getStepIndex('completion')).toBe(6)
  })

  it('isStepCompleted returns false when no session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(mockFetchActiveCheckIn).toHaveBeenCalled()
    })
    expect(result.current.isStepCompleted('welcome')).toBe(false)
  })

  it('exposes coupleId from props', () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    expect(result.current.coupleId).toBe('couple-1')
  })

  it('loads active check-in from DB when available', async () => {
    mockFetchActiveCheckIn.mockResolvedValue({
      data: {
        id: 'ci-1',
        couple_id: 'couple-1',
        started_at: '2025-06-01T00:00:00Z',
        categories: ['communication'],
        mood_before: null,
        mood_after: null,
      },
      error: null,
    })

    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.session).not.toBeNull()
    expect(result.current.session?.id).toBe('ci-1')
  })
})
