import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useCountUp } from '@/hooks/useCountUp'

describe('useCountUp', () => {
  let rafCallbacks: Array<(time: number) => void>
  let originalRaf: typeof requestAnimationFrame
  let originalCaf: typeof cancelAnimationFrame
  let originalNow: typeof performance.now

  beforeEach(() => {
    rafCallbacks = []
    let rafId = 0

    originalRaf = globalThis.requestAnimationFrame
    originalCaf = globalThis.cancelAnimationFrame
    originalNow = performance.now

    globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return ++rafId
    }) as unknown as typeof requestAnimationFrame

    globalThis.cancelAnimationFrame = vi.fn()
    performance.now = vi.fn(() => 0)
  })

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf
    globalThis.cancelAnimationFrame = originalCaf
    performance.now = originalNow
  })

  it('starts at 0', () => {
    const { result } = renderHook(() => useCountUp(100, 1000))

    expect(result.current).toBe(0)
  })

  it('reaches target when animation completes', () => {
    const { result } = renderHook(() => useCountUp(100, 1000))

    act(() => {
      const cb = rafCallbacks[rafCallbacks.length - 1]
      cb(1000)
    })

    expect(result.current).toBe(100)
  })

  it('shows intermediate value mid-animation', () => {
    const { result } = renderHook(() => useCountUp(100, 1000))

    act(() => {
      const cb = rafCallbacks[rafCallbacks.length - 1]
      // progress = 500/1000 = 0.5, eased = 1 - (0.5)^3 = 1 - 0.125 = 0.875
      // Math.round(0.875 * 100) = 88
      cb(500)
    })

    expect(result.current).toBe(88)
  })

  it('cancels animation on unmount', () => {
    const { unmount } = renderHook(() => useCountUp(100, 1000))

    unmount()

    expect(cancelAnimationFrame).toHaveBeenCalled()
  })
})
