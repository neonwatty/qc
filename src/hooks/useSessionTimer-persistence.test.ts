import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useSessionTimer } from '@/hooks/useSessionTimer'

describe('useSessionTimer — formatted time', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats single-digit minutes and seconds with leading zeros', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(55000)
    })

    expect(result.current.formattedTime).toBe('00:05')
  })

  it('formats double-digit minutes correctly', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 20 }))

    expect(result.current.formattedTime).toBe('20:00')
  })

  it('formats mixed minutes and seconds', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 10 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(127000)
    })

    // 600 - 127 = 473 seconds = 7:53
    expect(result.current.formattedTime).toBe('07:53')
  })

  it('shows 00:00 when timer expires', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 1 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(result.current.formattedTime).toBe('00:00')
  })
})

describe('useSessionTimer — sessionStorage persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('persists timer state to sessionStorage', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    const stored = JSON.parse(sessionStorage.getItem('qc-session-timer')!)
    expect(stored.timeRemaining).toBe(290)
    expect(stored.isRunning).toBe(true)
    expect(stored.isPaused).toBe(false)
    expect(stored.savedAt).toBeDefined()
  })

  it('clears sessionStorage on reset', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(sessionStorage.getItem('qc-session-timer')).not.toBeNull()

    act(() => {
      result.current.reset()
    })

    expect(sessionStorage.getItem('qc-session-timer')).toBeNull()
  })

  it('restores paused state from sessionStorage', () => {
    const stored = {
      timeRemaining: 180,
      isRunning: true,
      isPaused: true,
      savedAt: Date.now(),
    }
    sessionStorage.setItem('qc-session-timer', JSON.stringify(stored))

    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    expect(result.current.timeRemaining).toBe(180)
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(true)
  })

  it('subtracts elapsed time when restoring a running timer', () => {
    const twoSecondsAgo = Date.now() - 2000

    const stored = {
      timeRemaining: 100,
      isRunning: true,
      isPaused: false,
      savedAt: twoSecondsAgo,
    }
    sessionStorage.setItem('qc-session-timer', JSON.stringify(stored))

    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    expect(result.current.timeRemaining).toBe(98)
  })

  it('does not go below zero when restoring expired timer', () => {
    const longAgo = Date.now() - 999999000

    const stored = {
      timeRemaining: 10,
      isRunning: true,
      isPaused: false,
      savedAt: longAgo,
    }
    sessionStorage.setItem('qc-session-timer', JSON.stringify(stored))

    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 5 }))

    expect(result.current.timeRemaining).toBe(0)
  })

  it('handles missing sessionStorage gracefully', () => {
    const { result } = renderHook(() => useSessionTimer({ durationMinutes: 10 }))

    expect(result.current.timeRemaining).toBe(600)
    expect(result.current.isRunning).toBe(false)
  })
})
