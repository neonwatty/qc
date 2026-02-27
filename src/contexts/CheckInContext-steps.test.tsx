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
const mockInsertCheckIn = vi.fn().mockResolvedValue({ data: { id: 'ci-1' }, error: null })

vi.mock('@/lib/checkin-operations', () => ({
  mapDbActionItem: vi.fn((item) => item),
  fetchActiveCheckIn: (...args: unknown[]) => mockFetchActiveCheckIn(...args),
  fetchCheckInActionItems: vi.fn().mockResolvedValue({ data: [], error: null }),
  insertCheckIn: (...args: unknown[]) => mockInsertCheckIn(...args),
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

async function startSession(result: { current: ReturnType<typeof useCheckInContext> }) {
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  await act(async () => {
    await result.current.startCheckIn(['communication'])
  })
}

describe('CheckInContext steps', () => {
  it('starts session at welcome step', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await startSession(result)

    expect(result.current.session?.progress.currentStep).toBe('welcome')
    expect(result.current.session?.progress.completedSteps).toEqual([])
  })

  it('goToStep changes current step', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await startSession(result)

    act(() => {
      result.current.goToStep('category-selection')
    })

    expect(result.current.session?.progress.currentStep).toBe('category-selection')
  })

  it('completeStep marks step completed and advances', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await startSession(result)

    act(() => {
      result.current.completeStep('welcome')
    })

    expect(result.current.session?.progress.completedSteps).toContain('welcome')
    expect(result.current.session?.progress.currentStep).toBe('category-selection')
  })

  it('completeStep advances through multiple steps', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await startSession(result)

    act(() => {
      result.current.completeStep('welcome')
    })
    act(() => {
      result.current.completeStep('category-selection')
    })

    expect(result.current.session?.progress.completedSteps).toContain('welcome')
    expect(result.current.session?.progress.completedSteps).toContain('category-selection')
    expect(result.current.session?.progress.currentStep).toBe('warm-up')
  })

  it('updateCategoryProgress updates progress for category', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await startSession(result)

    act(() => {
      result.current.updateCategoryProgress('communication', { isCompleted: true })
    })

    const progress = result.current.session?.categoryProgress.find((cp) => cp.categoryId === 'communication')
    expect(progress?.isCompleted).toBe(true)
  })

  it('saveSession dispatches without error', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await startSession(result)

    act(() => {
      result.current.saveSession()
    })

    // saveSession just dispatches SAVE_SESSION -- should not throw
    expect(result.current.error).toBeNull()
  })
})
