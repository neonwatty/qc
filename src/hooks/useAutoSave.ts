'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_DEBOUNCE_MS = 2000

interface UseAutoSaveOptions<T> {
  value: T
  saveFn: (value: T) => Promise<void>
  debounceMs?: number
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSavedAt: Date | null
  error: Error | null
}

export function useAutoSave<T>({
  value,
  saveFn,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveFnRef = useRef(saveFn)
  const previousValueRef = useRef<T>(value)
  const isFirstRender = useRef(true)

  // Keep saveFn ref current without triggering re-runs
  useEffect(() => {
    saveFnRef.current = saveFn
  }, [saveFn])

  const save = useCallback(async (valueToSave: T): Promise<void> => {
    setIsSaving(true)
    setError(null)
    try {
      await saveFnRef.current(valueToSave)
      setLastSavedAt(new Date())
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsSaving(false)
    }
  }, [])

  useEffect(() => {
    // Skip the first render -- no save needed on mount
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Skip save when value hasn't changed
    if (Object.is(value, previousValueRef.current)) {
      return
    }

    previousValueRef.current = value

    // Clear any pending debounce timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      void save(value)
    }, debounceMs)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [value, debounceMs, save])

  return { isSaving, lastSavedAt, error }
}
