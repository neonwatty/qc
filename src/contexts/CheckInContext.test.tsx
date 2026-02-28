import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

vi.mock('./check-in-reducer', () => ({
  checkInReducer: vi.fn((state) => state),
  createInitialSession: vi.fn(),
  STEPS: [
    'welcome',
    'category-selection',
    'warm-up',
    'category-discussion',
    'reflection',
    'action-items',
    'completion',
  ],
}))

const mockFetchActiveCheckIn = vi.fn((_coupleId: string) => Promise.resolve({ data: null, error: null }))
const mockFetchCheckInActionItems = vi.fn()

vi.mock('@/lib/checkin-operations', () => ({
  mapDbActionItem: vi.fn(),
  fetchActiveCheckIn: (coupleId: string) => mockFetchActiveCheckIn(coupleId),
  fetchCheckInActionItems: (checkInId: string, coupleId: string) => mockFetchCheckInActionItems(checkInId, coupleId),
  insertCheckIn: vi.fn(),
  updateCheckInStatus: vi.fn(),
  insertNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  insertActionItem: vi.fn(),
  updateActionItemDb: vi.fn(),
  deleteActionItem: vi.fn(),
  toggleActionItemDb: vi.fn(),
}))

const { CheckInProvider, useCheckInContext } = await import('./CheckInContext')

function TestConsumer() {
  const ctx = useCheckInContext()
  return (
    <div
      data-testid="ctx"
      data-couple-id={ctx.coupleId}
      data-loading={String(ctx.isLoading)}
      data-has-go-to-step={String(typeof ctx.goToStep === 'function')}
      data-has-complete-step={String(typeof ctx.completeStep === 'function')}
      data-action-items-count={String(ctx.actionItems.length)}
    />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchActiveCheckIn.mockImplementation(() => Promise.resolve({ data: null, error: null }))
})

describe('CheckInContext', () => {
  it('useCheckInContext throws when used outside provider', () => {
    expect(() => renderHook(() => useCheckInContext())).toThrow(
      'useCheckInContext must be used within a CheckInProvider',
    )
  })

  it('CheckInProvider renders children', () => {
    render(
      <CheckInProvider coupleId="c1" userId="u1">
        <span data-testid="child">Hello</span>
      </CheckInProvider>,
    )
    expect(screen.getByTestId('child')).toBeDefined()
    expect(screen.getByTestId('child').textContent).toBe('Hello')
  })

  it('CheckInProvider provides coupleId through context', () => {
    render(
      <CheckInProvider coupleId="c1" userId="u1">
        <TestConsumer />
      </CheckInProvider>,
    )
    expect(screen.getByTestId('ctx').getAttribute('data-couple-id')).toBe('c1')
  })

  it('CheckInProvider starts with isLoading true', () => {
    render(
      <CheckInProvider coupleId="c1" userId="u1">
        <TestConsumer />
      </CheckInProvider>,
    )
    expect(screen.getByTestId('ctx').getAttribute('data-loading')).toBe('true')
  })

  it('CheckInProvider provides goToStep function', () => {
    render(
      <CheckInProvider coupleId="c1" userId="u1">
        <TestConsumer />
      </CheckInProvider>,
    )
    expect(screen.getByTestId('ctx').getAttribute('data-has-go-to-step')).toBe('true')
  })

  it('CheckInProvider provides completeStep function', () => {
    render(
      <CheckInProvider coupleId="c1" userId="u1">
        <TestConsumer />
      </CheckInProvider>,
    )
    expect(screen.getByTestId('ctx').getAttribute('data-has-complete-step')).toBe('true')
  })

  it('CheckInProvider provides actionItems as empty array initially', () => {
    render(
      <CheckInProvider coupleId="c1" userId="u1">
        <TestConsumer />
      </CheckInProvider>,
    )
    expect(screen.getByTestId('ctx').getAttribute('data-action-items-count')).toBe('0')
  })

  it('CheckInProvider calls fetchActiveCheckIn on mount', async () => {
    render(
      <CheckInProvider coupleId="c1" userId="u1">
        <TestConsumer />
      </CheckInProvider>,
    )
    await waitFor(() => {
      expect(mockFetchActiveCheckIn).toHaveBeenCalledWith('c1')
    })
  })
})
