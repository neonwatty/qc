import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useSessionTimer } from '@/hooks/useSessionTimer'

describe('useSessionTimer — core', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct defaults', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 10 }))

    expect(result.current.timeRemaining).toBe(600)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.formattedTime).toBe('10:00')
  })

  it('starts countdown on start()', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    act(() => {
      result.current.start()
    })

    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.timeRemaining).toBe(300)
  })

  it('counts down each second while running', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.timeRemaining).toBe(57)
    expect(result.current.formattedTime).toBe('00:57')
  })

  it('fires onTimeUp callback when timer reaches zero', () => {
    const onTimeUp = vi.fn()
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1, onTimeUp }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(onTimeUp).toHaveBeenCalledTimes(1)
    expect(result.current.timeRemaining).toBe(0)
    expect(result.current.isRunning).toBe(false)
  })

  it('stops running when timer reaches zero', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.timeRemaining).toBe(0)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
  })

  it('start() resets time to full duration even if partially elapsed', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(result.current.timeRemaining).toBe(270)

    act(() => {
      result.current.start()
    })

    expect(result.current.timeRemaining).toBe(300)
  })

  it('uses latest onTimeUp callback via ref', () => {
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()

    const { result, rerender } = renderHook(({ onTimeUp }) => useSessionTimer({ durationMinutes: 1, onTimeUp }), {
      initialProps: { onTimeUp: firstCallback },
    })

    act(() => {
      result.current.start()
    })

    rerender({ onTimeUp: secondCallback })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledTimes(1)
  })
})

describe('useSessionTimer — pause/resume', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('pauses the countdown', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.isPaused).toBe(true)
    expect(result.current.isRunning).toBe(true)

    const timeAtPause = result.current.timeRemaining

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.timeRemaining).toBe(timeAtPause)
  })

  it('resumes countdown after pause', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    const timeBeforePause = result.current.timeRemaining

    act(() => {
      result.current.pause()
    })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.timeRemaining).toBe(timeBeforePause)

    act(() => {
      result.current.resume()
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.timeRemaining).toBe(timeBeforePause - 2)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.isRunning).toBe(true)
  })

  it('does not pause when not running', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.pause()
    })

    expect(result.current.isPaused).toBe(false)
    expect(result.current.isRunning).toBe(false)
  })

  it('does not resume when not paused', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      result.current.resume()
    })

    expect(result.current.isPaused).toBe(false)
  })

  it('resets timer to initial duration', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.timeRemaining).toBe(300)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isPaused).toBe(false)
    expect(result.current.formattedTime).toBe('05:00')
  })
})
