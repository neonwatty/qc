import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { longPress: vi.fn() },
}))

vi.mock('@/components/ui/LongPressMenu', () => ({
  LongPressMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const { useLongPress } = await import('./LongPressMenuHook')

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useLongPress', () => {
  it('returns all event handlers', () => {
    const { result } = renderHook(() => useLongPress(vi.fn()))
    expect(result.current.onTouchStart).toBeDefined()
    expect(result.current.onTouchEnd).toBeDefined()
    expect(result.current.onTouchCancel).toBeDefined()
    expect(result.current.onMouseDown).toBeDefined()
    expect(result.current.onMouseUp).toBeDefined()
    expect(result.current.onMouseLeave).toBeDefined()
  })

  it('fires callback after default duration (500ms)', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback))

    act(() => {
      result.current.onMouseDown()
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('fires haptic feedback on long press', async () => {
    const { hapticFeedback } = await import('@/lib/haptics')
    const { result } = renderHook(() => useLongPress(vi.fn()))

    act(() => {
      result.current.onMouseDown()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(hapticFeedback.longPress).toHaveBeenCalledTimes(1)
  })

  it('does not fire callback when cancelled before duration', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback))

    act(() => {
      result.current.onMouseDown()
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    act(() => {
      result.current.onMouseUp()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('respects custom duration', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, { duration: 1000 }))

    act(() => {
      result.current.onMouseDown()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does nothing when disabled', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, { disabled: true }))

    act(() => {
      result.current.onMouseDown()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('cleans up timer on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useLongPress(callback))

    act(() => {
      result.current.onMouseDown()
    })

    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).not.toHaveBeenCalled()
  })
})
