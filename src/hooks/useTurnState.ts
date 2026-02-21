'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TurnOwner = 'user' | 'partner'

interface UseTurnStateOptions {
  /** Turn duration in seconds */
  turnDuration: number
  /** Only active when turn-based mode is enabled */
  enabled: boolean
  /** Called when turn auto-switches due to timer expiry */
  onTurnSwitch?: (newTurn: TurnOwner) => void
}

interface UseTurnStateReturn {
  /** Whose turn it currently is */
  currentTurn: TurnOwner
  /** Toggle between user and partner */
  switchTurn: () => void
  /** Seconds remaining in the current turn */
  turnTimeRemaining: number
  /** Formatted time string (MM:SS) */
  formattedTurnTime: string
  /** Whether the turn system is active */
  isActive: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function useTurnState({ turnDuration, enabled, onTurnSwitch }: UseTurnStateOptions): UseTurnStateReturn {
  const [currentTurn, setCurrentTurn] = useState<TurnOwner>('user')
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(turnDuration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTurnSwitchRef = useRef(onTurnSwitch)

  // Keep callback ref current
  useEffect(() => {
    onTurnSwitchRef.current = onTurnSwitch
  }, [onTurnSwitch])

  // Reset timer when turnDuration changes
  useEffect(() => {
    setTurnTimeRemaining(turnDuration)
  }, [turnDuration])

  const switchTurn = useCallback(() => {
    setCurrentTurn((prev) => {
      const next: TurnOwner = prev === 'user' ? 'partner' : 'user'
      onTurnSwitchRef.current?.(next)
      return next
    })
    setTurnTimeRemaining(turnDuration)
  }, [turnDuration])

  // Countdown interval
  useEffect(() => {
    if (!enabled || turnDuration <= 0) return

    intervalRef.current = setInterval(() => {
      setTurnTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-switch on expiry
          setCurrentTurn((currentOwner) => {
            const next: TurnOwner = currentOwner === 'user' ? 'partner' : 'user'
            onTurnSwitchRef.current?.(next)
            return next
          })
          return turnDuration
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, turnDuration])

  const formattedTurnTime = formatTime(turnTimeRemaining)

  return {
    currentTurn,
    switchTurn,
    turnTimeRemaining,
    formattedTurnTime,
    isActive: enabled,
  }
}
