import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockSet = vi.fn()
vi.mock('framer-motion', () => ({
  useMotionValue: () => ({ get: () => 0, set: mockSet }),
  useTransform: () => ({ get: () => 0 }),
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { success: vi.fn(), select: vi.fn(), swipe: vi.fn(), longPress: vi.fn() },
}))

const { usePullToRefresh } = await import('./PullToRefresh')

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePullToRefresh', () => {
  it('returns expected shape with initial values', () => {
    const { result } = renderHook(() => usePullToRefresh(vi.fn()))
    expect(result.current.isRefreshing).toBe(false)
    expect(result.current.isPulling).toBe(false)
    expect(typeof result.current.handleRefresh).toBe('function')
    expect(typeof result.current.setIsPulling).toBe('function')
  })

  it('handleRefresh calls onRefresh and hapticFeedback.success', async () => {
    const { hapticFeedback } = await import('@/lib/haptics')
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => usePullToRefresh(onRefresh))

    await act(async () => {
      await result.current.handleRefresh()
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(hapticFeedback.success).toHaveBeenCalledTimes(1)
  })

  it('handleRefresh sets isRefreshing to true during refresh', async () => {
    let resolveRefresh: () => void = () => {}
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve
        }),
    )
    const { result } = renderHook(() => usePullToRefresh(onRefresh))

    // Start refresh but don't resolve the promise yet
    let refreshPromise: Promise<void>
    act(() => {
      refreshPromise = result.current.handleRefresh()
    })

    // isRefreshing should be true while onRefresh is pending
    expect(result.current.isRefreshing).toBe(true)

    // Resolve and let it finish
    await act(async () => {
      resolveRefresh()
      await refreshPromise!
    })
  })

  it('handleRefresh resets isRefreshing after 500ms timeout', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => usePullToRefresh(onRefresh))

    await act(async () => {
      await result.current.handleRefresh()
    })

    // isRefreshing is still true because setTimeout hasn't fired
    expect(result.current.isRefreshing).toBe(true)

    // Advance timers by 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.isRefreshing).toBe(false)
    expect(mockSet).toHaveBeenCalledWith(0)
  })

  it('handleRefresh does nothing when disabled', async () => {
    const { hapticFeedback } = await import('@/lib/haptics')
    const onRefresh = vi.fn()
    const { result } = renderHook(() => usePullToRefresh(onRefresh, { disabled: true }))

    await act(async () => {
      await result.current.handleRefresh()
    })

    expect(onRefresh).not.toHaveBeenCalled()
    expect(hapticFeedback.success).not.toHaveBeenCalled()
    expect(result.current.isRefreshing).toBe(false)
  })

  it('handleRefresh does nothing when already refreshing', async () => {
    const { hapticFeedback } = await import('@/lib/haptics')
    let resolveRefresh: () => void = () => {}
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve
        }),
    )
    const { result } = renderHook(() => usePullToRefresh(onRefresh))

    // Start first refresh
    let firstPromise: Promise<void>
    act(() => {
      firstPromise = result.current.handleRefresh()
    })

    expect(result.current.isRefreshing).toBe(true)
    expect(onRefresh).toHaveBeenCalledTimes(1)

    // Try second refresh while first is still pending
    await act(async () => {
      await result.current.handleRefresh()
    })

    // onRefresh should NOT have been called a second time
    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(hapticFeedback.success).toHaveBeenCalledTimes(1)

    // Clean up
    await act(async () => {
      resolveRefresh()
      await firstPromise!
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })
  })
})
