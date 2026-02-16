'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { createClient } from '@/lib/supabase/client'
import { snakeToCamelObject } from '@/lib/utils'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import type {
  LoveLanguage,
  LoveAction,
  LoveLanguageCategory,
  LoveLanguagePrivacy,
  DbLoveLanguage,
  DbLoveAction,
} from '@/types'

// --- Context value type ---

interface LoveLanguagesContextValue {
  languages: LoveLanguage[]
  actions: LoveAction[]
  loading: boolean
  error: string | null
  currentUserId: string | null
  coupleId: string | null
  myLanguages: LoveLanguage[]
  partnerSharedLanguages: LoveLanguage[]
  filterLanguages: (
    category?: LoveLanguageCategory | null,
    privacy?: LoveLanguagePrivacy | null,
  ) => LoveLanguage[]
  refreshLanguages: () => Promise<void>
  refreshActions: () => Promise<void>
}

const LoveLanguagesContext = createContext<LoveLanguagesContextValue | null>(null)

// --- Helpers ---

function toLanguage(row: DbLoveLanguage): LoveLanguage {
  return snakeToCamelObject<LoveLanguage>(row as unknown as Record<string, unknown>)
}

function toAction(row: DbLoveAction): LoveAction {
  return snakeToCamelObject<LoveAction>(row as unknown as Record<string, unknown>)
}

// --- Provider props ---

interface LoveLanguagesProviderProps {
  children: ReactNode
  coupleId: string | null
  currentUserId: string | null
}

export function LoveLanguagesProvider({
  children,
  coupleId,
  currentUserId,
}: LoveLanguagesProviderProps): ReactNode {
  const [languages, setLanguages] = useState<LoveLanguage[]>([])
  const [actions, setActions] = useState<LoveAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Fetch languages ---

  const refreshLanguages = useCallback(async () => {
    if (!coupleId) return

    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('love_languages')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    const rows = (data ?? []) as unknown as DbLoveLanguage[]
    const all = rows.map(toLanguage)

    // Privacy filter: only show own private + all shared
    const visible = all.filter(
      (lang) => lang.privacy === 'shared' || lang.userId === currentUserId,
    )
    setLanguages(visible)
  }, [coupleId, currentUserId])

  // --- Fetch actions ---

  const refreshActions = useCallback(async () => {
    if (!coupleId) return

    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('love_actions')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    const rows = (data ?? []) as unknown as DbLoveAction[]
    setActions(rows.map(toAction))
  }, [coupleId])

  // --- Initial load ---

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      await Promise.all([refreshLanguages(), refreshActions()])
      setLoading(false)
    }
    load()
  }, [refreshLanguages, refreshActions])

  // --- Realtime for love_languages (via couple channel) ---

  useRealtimeCouple<Record<string, unknown>>({
    table: 'love_actions',
    coupleId,
    onInsert: () => void refreshActions(),
    onUpdate: () => void refreshActions(),
    onDelete: () => void refreshActions(),
  })

  // --- Derived data ---

  const myLanguages = languages.filter((l) => l.userId === currentUserId)

  const partnerSharedLanguages = languages.filter(
    (l) => l.userId !== currentUserId && l.privacy === 'shared',
  )

  const filterLanguages = useCallback(
    (category?: LoveLanguageCategory | null, privacy?: LoveLanguagePrivacy | null) => {
      return languages.filter((l) => {
        if (category && l.category !== category) return false
        if (privacy && l.privacy !== privacy) return false
        return true
      })
    },
    [languages],
  )

  const value: LoveLanguagesContextValue = {
    languages,
    actions,
    loading,
    error,
    currentUserId,
    coupleId,
    myLanguages,
    partnerSharedLanguages,
    filterLanguages,
    refreshLanguages,
    refreshActions,
  }

  return (
    <LoveLanguagesContext.Provider value={value}>
      {children}
    </LoveLanguagesContext.Provider>
  )
}

export function useLoveLanguages(): LoveLanguagesContextValue {
  const context = useContext(LoveLanguagesContext)

  if (!context) {
    throw new Error('useLoveLanguages must be used within a LoveLanguagesProvider')
  }

  return context
}
