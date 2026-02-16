'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import { createClient } from '@/lib/supabase/client'
import { snakeToCamelObject, camelToSnakeObject } from '@/lib/utils'
import type { SessionSettings } from '@/types/index'

const DEFAULT_SETTINGS: Omit<SessionSettings, 'id' | 'coupleId'> = {
  sessionDuration: 30,
  timeoutsPerPartner: 2,
  timeoutDuration: 3,
  turnBasedMode: false,
  turnDuration: 5,
  allowExtensions: true,
  warmUpQuestions: true,
  coolDownTime: 2,
}

interface SessionSettingsContextValue {
  settings: SessionSettings | null
  isLoading: boolean
  error: string | null
  updateSettings: (updates: Partial<SessionSettings>) => Promise<void>
  resetToDefaults: () => Promise<void>
}

const SessionSettingsContext =
  createContext<SessionSettingsContextValue | null>(null)

interface SessionSettingsProviderProps {
  children: ReactNode
  coupleId: string | null
}

export function SessionSettingsProvider({
  children,
  coupleId,
}: SessionSettingsProviderProps): ReactNode {
  const [settings, setSettings] = useState<SessionSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coupleId) {
      setIsLoading(false)
      return
    }

    async function fetchSettings(): Promise<void> {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('session_settings')
        .select('*')
        .eq('couple_id', coupleId)
        .maybeSingle()

      if (fetchError) {
        setError(fetchError.message)
        setIsLoading(false)
        return
      }

      if (data) {
        setSettings(
          snakeToCamelObject<SessionSettings>(
            data as unknown as Record<string, unknown>,
          ),
        )
      } else {
        setSettings({
          id: '',
          coupleId: coupleId!,
          ...DEFAULT_SETTINGS,
        })
      }

      setIsLoading(false)
    }

    fetchSettings()
  }, [coupleId])

  const updateSettings = useCallback(
    async (updates: Partial<SessionSettings>): Promise<void> => {
      if (!coupleId) return
      setError(null)

      const supabase = createClient()
      const snakeUpdates = camelToSnakeObject<Record<string, unknown>>(
        updates as unknown as Record<string, unknown>,
      )

      const { data, error: updateError } = await supabase
        .from('session_settings')
        .upsert(
          { couple_id: coupleId, ...snakeUpdates },
          { onConflict: 'couple_id' },
        )
        .select()
        .single()

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSettings(
        snakeToCamelObject<SessionSettings>(
          data as unknown as Record<string, unknown>,
        ),
      )
    },
    [coupleId],
  )

  const resetToDefaults = useCallback(async (): Promise<void> => {
    await updateSettings(DEFAULT_SETTINGS)
  }, [updateSettings])

  const value = useMemo<SessionSettingsContextValue>(
    () => ({
      settings,
      isLoading,
      error,
      updateSettings,
      resetToDefaults,
    }),
    [settings, isLoading, error, updateSettings, resetToDefaults],
  )

  return (
    <SessionSettingsContext.Provider value={value}>
      {children}
    </SessionSettingsContext.Provider>
  )
}

export function useSessionSettings(): SessionSettingsContextValue {
  const context = useContext(SessionSettingsContext)
  if (!context) {
    throw new Error(
      'useSessionSettings must be used within a SessionSettingsProvider',
    )
  }
  return context
}
