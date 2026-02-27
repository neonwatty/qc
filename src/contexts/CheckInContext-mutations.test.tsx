import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

vi.mock('@/app/(app)/checkin/actions', () => ({
  sendCheckInSummaryEmail: vi.fn().mockResolvedValue(undefined),
}))

const mockFetchActiveCheckIn = vi.fn().mockResolvedValue({ data: null, error: null })
const mockInsertCheckIn = vi.fn().mockResolvedValue({ data: { id: 'ci-new' }, error: null })
const mockUpdateCheckInStatus = vi.fn().mockResolvedValue({ error: null })
const mockInsertNote = vi.fn().mockResolvedValue({
  data: {
    id: 'n1',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: 'ci-new',
    content: 'test',
    privacy: 'draft',
    tags: [],
    category_id: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  error: null,
})
const mockDeleteNote = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/lib/checkin-operations', () => ({
  mapDbActionItem: vi.fn((item) => item),
  fetchActiveCheckIn: (...args: unknown[]) => mockFetchActiveCheckIn(...args),
  fetchCheckInActionItems: vi.fn().mockResolvedValue({ data: [], error: null }),
  insertCheckIn: (...args: unknown[]) => mockInsertCheckIn(...args),
  updateCheckInStatus: (...args: unknown[]) => mockUpdateCheckInStatus(...args),
  insertNote: (...args: unknown[]) => mockInsertNote(...args),
  updateNote: vi.fn().mockResolvedValue({ error: null }),
  deleteNote: (...args: unknown[]) => mockDeleteNote(...args),
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

describe('CheckInContext mutations', () => {
  it('startCheckIn calls insertCheckIn and creates session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.startCheckIn(['communication'])
    })

    expect(mockInsertCheckIn).toHaveBeenCalledWith('uuid-test', 'couple-1', expect.any(String), ['communication'])
    expect(result.current.session).not.toBeNull()
    expect(result.current.session?.id).toBe('ci-new')
  })

  it('startCheckIn handles error gracefully', async () => {
    mockInsertCheckIn.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.startCheckIn(['trust'])
    })

    expect(result.current.session).toBeNull()
  })

  it('completeCheckIn updates status and clears session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.startCheckIn(['communication'])
    })
    expect(result.current.session).not.toBeNull()

    await act(async () => {
      await result.current.completeCheckIn()
    })

    expect(mockUpdateCheckInStatus).toHaveBeenCalledWith('ci-new', 'completed')
    expect(result.current.session).toBeNull()
  })

  it('abandonCheckIn updates status and clears session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.startCheckIn(['communication'])
    })

    await act(async () => {
      await result.current.abandonCheckIn()
    })

    expect(mockUpdateCheckInStatus).toHaveBeenCalledWith('ci-new', 'abandoned')
    expect(result.current.session).toBeNull()
  })

  it('completeCheckIn does nothing when no session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.completeCheckIn()
    })

    expect(mockUpdateCheckInStatus).not.toHaveBeenCalled()
  })

  it('addDraftNote inserts note and dispatches', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.startCheckIn(['communication'])
    })

    await act(async () => {
      await result.current.addDraftNote({
        coupleId: 'couple-1',
        authorId: 'user-1',
        checkInId: 'ci-new',
        content: 'test note',
        privacy: 'draft',
        tags: [],
        categoryId: null,
      })
    })

    expect(mockInsertNote).toHaveBeenCalledWith(expect.objectContaining({ coupleId: 'couple-1', content: 'test note' }))
    expect(result.current.session?.draftNotes).toHaveLength(1)
  })

  it('removeDraftNote deletes and dispatches', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.startCheckIn(['communication'])
    })

    await act(async () => {
      await result.current.addDraftNote({
        coupleId: 'couple-1',
        authorId: 'user-1',
        checkInId: 'ci-new',
        content: 'to delete',
        privacy: 'draft',
        tags: [],
        categoryId: null,
      })
    })

    await act(async () => {
      await result.current.removeDraftNote('n1')
    })

    expect(mockDeleteNote).toHaveBeenCalledWith('n1')
    expect(result.current.session?.draftNotes).toHaveLength(0)
  })
})
