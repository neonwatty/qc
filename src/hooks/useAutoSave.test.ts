import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useAutoSave } from '@/hooks/useAutoSave'

describe('useAutoSave — core behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct defaults', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() => useAutoSave({ value: 'hello', saveFn }))

    expect(result.current.isSaving).toBe(false)
    expect(result.current.lastSavedAt).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('does not save on initial render', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)

    renderHook(() => useAutoSave({ value: 'initial', saveFn }))

    vi.advanceTimersByTime(3000)

    expect(saveFn).not.toHaveBeenCalled()
  })

  it('fires debounced save after 2s when value changes', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)

    const { result, rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })

    expect(saveFn).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(saveFn).toHaveBeenCalledWith('updated')
    expect(result.current.lastSavedAt).toBeInstanceOf(Date)
  })

  it('resets debounce timer on rapid changes', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'v0' },
    })

    rerender({ value: 'v1' })
    vi.advanceTimersByTime(500)

    rerender({ value: 'v2' })
    vi.advanceTimersByTime(500)

    rerender({ value: 'v3' })
    vi.advanceTimersByTime(500)

    expect(saveFn).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(saveFn).toHaveBeenCalledWith('v3')
  })

  it('sets isSaving to true during save, false after', async () => {
    let resolveSave: () => void
    const saveFn = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve
        }),
    )

    const { result, rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.isSaving).toBe(true)

    await act(async () => {
      resolveSave!()
    })

    expect(result.current.isSaving).toBe(false)
  })

  it('does not save when value has not changed', () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'same' },
    })

    rerender({ value: 'same' })

    vi.advanceTimersByTime(3000)

    expect(saveFn).not.toHaveBeenCalled()
  })

  it('supports custom debounce delay', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn, debounceMs: 500 }), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })

    vi.advanceTimersByTime(400)
    expect(saveFn).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(saveFn).toHaveBeenCalledTimes(1)
  })
})

describe('useAutoSave — error handling and edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates lastSavedAt on successful save', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    vi.setSystemTime(new Date('2026-01-15T10:00:00Z'))

    const { result, rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'old' },
    })

    expect(result.current.lastSavedAt).toBeNull()

    rerender({ value: 'new' })

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.lastSavedAt).toEqual(new Date('2026-01-15T10:00:02Z'))
  })

  it('captures error when save function fails', async () => {
    const saveError = new Error('Network failure')
    const saveFn = vi.fn().mockRejectedValue(saveError)

    const { result, rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'start' },
    })

    rerender({ value: 'trigger-error' })

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.error).toEqual(saveError)
    expect(result.current.isSaving).toBe(false)
    expect(result.current.lastSavedAt).toBeNull()
  })

  it('clears previous error on successful save', async () => {
    const saveFn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined)

    const { result, rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'v0' },
    })

    rerender({ value: 'v1' })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.error).toBeTruthy()

    rerender({ value: 'v2' })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.lastSavedAt).toBeInstanceOf(Date)
  })

  it('uses the latest saveFn via ref', async () => {
    const firstSaveFn = vi.fn().mockResolvedValue(undefined)
    const secondSaveFn = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(({ value, saveFn }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'a', saveFn: firstSaveFn },
    })

    rerender({ value: 'b', saveFn: secondSaveFn })

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(firstSaveFn).not.toHaveBeenCalled()
    expect(secondSaveFn).toHaveBeenCalledTimes(1)
    expect(secondSaveFn).toHaveBeenCalledWith('b')
  })

  it('wraps non-Error rejections in Error', async () => {
    const saveFn = vi.fn().mockRejectedValue('string error')

    const { result, rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: 'x' },
    })

    rerender({ value: 'y' })

    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('string error')
  })

  it('works with object values (reference comparison)', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const objA = { text: 'hello' }
    const objB = { text: 'world' }

    const { rerender } = renderHook(({ value }) => useAutoSave({ value, saveFn }), {
      initialProps: { value: objA },
    })

    rerender({ value: objA })
    vi.advanceTimersByTime(3000)
    expect(saveFn).not.toHaveBeenCalled()

    rerender({ value: objB })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(saveFn).toHaveBeenCalledWith(objB)
  })
})
