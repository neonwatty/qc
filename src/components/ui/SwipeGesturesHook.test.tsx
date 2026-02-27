import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type React from 'react'

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { swipe: vi.fn(), select: vi.fn(), success: vi.fn(), longPress: vi.fn() },
}))

const { useSwipeGestures } = await import('./SwipeGesturesHook')

const createTouchEvent = (clientX: number, clientY: number) =>
  ({
    targetTouches: [{ clientX, clientY }],
  }) as unknown as React.TouchEvent

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSwipeGestures', () => {
  it('returns all 3 touch handlers', () => {
    const { result } = renderHook(() => useSwipeGestures())
    expect(result.current.onTouchStart).toBeDefined()
    expect(result.current.onTouchMove).toBeDefined()
    expect(result.current.onTouchEnd).toBeDefined()
  })

  it('detects left swipe', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGestures({ onSwipeLeft }))

    act(() => {
      result.current.onTouchStart(createTouchEvent(200, 100))
    })
    act(() => {
      result.current.onTouchMove(createTouchEvent(100, 100))
    })
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
  })

  it('detects right swipe', () => {
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipeGestures({ onSwipeRight }))

    act(() => {
      result.current.onTouchStart(createTouchEvent(100, 100))
    })
    act(() => {
      result.current.onTouchMove(createTouchEvent(200, 100))
    })
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
  })

  it('ignores swipe below threshold', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipeGestures({ onSwipeLeft, onSwipeRight }))

    act(() => {
      result.current.onTouchStart(createTouchEvent(200, 100))
    })
    act(() => {
      result.current.onTouchMove(createTouchEvent(180, 100))
    })
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('detects vertical swipe up', () => {
    const onSwipeUp = vi.fn()
    const { result } = renderHook(() => useSwipeGestures({ onSwipeUp }))

    act(() => {
      result.current.onTouchStart(createTouchEvent(100, 200))
    })
    act(() => {
      result.current.onTouchMove(createTouchEvent(100, 100))
    })
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeUp).toHaveBeenCalledTimes(1)
  })

  it('fires hapticFeedback.swipe() on swipe', async () => {
    const { hapticFeedback } = await import('@/lib/haptics')
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGestures({ onSwipeLeft }))

    act(() => {
      result.current.onTouchStart(createTouchEvent(200, 100))
    })
    act(() => {
      result.current.onTouchMove(createTouchEvent(100, 100))
    })
    act(() => {
      result.current.onTouchEnd()
    })

    expect(hapticFeedback.swipe).toHaveBeenCalledTimes(1)
  })

  it('custom threshold works', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGestures({ onSwipeLeft, threshold: 100 }))

    // Swipe 80px — below custom threshold
    act(() => {
      result.current.onTouchStart(createTouchEvent(200, 100))
    })
    act(() => {
      result.current.onTouchMove(createTouchEvent(120, 100))
    })
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()

    // Swipe 110px — above custom threshold
    act(() => {
      result.current.onTouchStart(createTouchEvent(300, 100))
    })
    act(() => {
      result.current.onTouchMove(createTouchEvent(190, 100))
    })
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
  })

  it('does nothing if no touchEnd recorded', () => {
    const onSwipeLeft = vi.fn()
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipeGestures({ onSwipeLeft, onSwipeRight }))

    act(() => {
      result.current.onTouchStart(createTouchEvent(200, 100))
    })
    // No onTouchMove — touchEnd ref stays null
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })
})
