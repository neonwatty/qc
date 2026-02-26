import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTurnState } from './useTurnState'

describe('useTurnState — extensions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('extendTurn adds 60 seconds', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 120, enabled: true, allowExtensions: true }))
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    const timeBefore = result.current.turnTimeRemaining
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.turnTimeRemaining).toBe(timeBefore + 60)
    expect(result.current.extensionsUsed).toBe(1)
  })

  it('respects max extensions limit', () => {
    const { result } = renderHook(() =>
      useTurnState({ turnDuration: 120, enabled: true, allowExtensions: true, maxExtensions: 2 }),
    )
    act(() => {
      result.current.extendTurn()
    })
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.extensionsUsed).toBe(2)
    const timeBefore = result.current.turnTimeRemaining
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.turnTimeRemaining).toBe(timeBefore)
    expect(result.current.extensionsUsed).toBe(2)
  })

  it('resets extensions on manual turn switch', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 120, enabled: true, allowExtensions: true }))
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.extensionsUsed).toBe(1)
    act(() => {
      result.current.switchTurn()
    })
    expect(result.current.extensionsUsed).toBe(0)
  })

  it('resets extensions on auto turn switch', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 5, enabled: true, allowExtensions: true }))
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.extensionsUsed).toBe(1)
    act(() => {
      vi.advanceTimersByTime(65000)
    })
    expect(result.current.extensionsUsed).toBe(0)
  })

  it('does nothing when allowExtensions is false', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 120, enabled: true, allowExtensions: false }))
    const timeBefore = result.current.turnTimeRemaining
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.turnTimeRemaining).toBe(timeBefore)
    expect(result.current.extensionsUsed).toBe(0)
  })
})
