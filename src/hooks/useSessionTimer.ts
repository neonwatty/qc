'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'qc-session-timer'

interface TimerState {
  timeRemaining: number
  isRunning: boolean
  isPaused: boolean
}

interface StoredTimerState {
  timeRemaining: number
  isRunning: boolean
  isPaused: boolean
  savedAt: number
}

interface UseSessionTimerOptions {
  durationMinutes: number
  onTimeUp?: () => void
}

interface UseSessionTimerReturn {
  timeRemaining: number
  isRunning: boolean
  isPaused: boolean
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  formattedTime: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function saveToStorage(state: TimerState): void {
  try {
    const stored: StoredTimerState = {
      ...state,
      savedAt: Date.now(),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // sessionStorage may be unavailable (SSR, private browsing)
  }
}

function loadFromStorage(): StoredTimerState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredTimerState
  } catch {
    return null
  }
}

function clearStorage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function useSessionTimer({ durationMinutes, onTimeUp }: UseSessionTimerOptions): UseSessionTimerReturn {
  const totalSeconds = durationMinutes * 60

  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    const stored = loadFromStorage()
    if (stored) {
      // If it was running, subtract elapsed time since save
      if (stored.isRunning && !stored.isPaused) {
        const elapsedSinceSave = Math.floor((Date.now() - stored.savedAt) / 1000)
        return Math.max(0, stored.timeRemaining - elapsedSinceSave)
      }
      return stored.timeRemaining
    }
    return totalSeconds
  })

  const [isRunning, setIsRunning] = useState<boolean>(() => {
    const stored = loadFromStorage()
    if (stored) return stored.isRunning
    return false
  })

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    const stored = loadFromStorage()
    if (stored) return stored.isPaused
    return false
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTimeUpRef = useRef(onTimeUp)
  const skipPersistRef = useRef(false)

  // Keep callback ref current without re-subscribing the interval
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  // Persist state to sessionStorage on changes
  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    saveToStorage({ timeRemaining, isRunning, isPaused })
  }, [timeRemaining, isRunning, isPaused])

  // Core interval logic
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const next = prev - 1
          if (next <= 0) {
            clearInterval(intervalRef.current!)
            intervalRef.current = null
            setIsRunning(false)
            setIsPaused(false)
            onTimeUpRef.current?.()
            return 0
          }
          return next
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, isPaused, timeRemaining])

  const start = useCallback(() => {
    setTimeRemaining(totalSeconds)
    setIsRunning(true)
    setIsPaused(false)
  }, [totalSeconds])

  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      setIsPaused(true)
    }
  }, [isRunning, isPaused])

  const resume = useCallback(() => {
    if (isRunning && isPaused) {
      setIsPaused(false)
    }
  }, [isRunning, isPaused])

  const reset = useCallback(() => {
    skipPersistRef.current = true
    setTimeRemaining(totalSeconds)
    setIsRunning(false)
    setIsPaused(false)
    clearStorage()
  }, [totalSeconds])

  const formattedTime = formatTime(timeRemaining)

  return {
    timeRemaining,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    formattedTime,
  }
}
