'use client'

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import type {
  LoveLanguage,
  LoveAction,
  LoveLanguageDiscovery,
  DbLoveLanguage,
  DbLoveAction,
  DbLoveLanguageDiscovery,
} from '@/types'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import { mapDbLanguage, mapDbAction, fetchLanguages, fetchActions } from '@/lib/love-language-operations'
import { mapDbDiscovery, fetchDiscoveries } from '@/lib/love-language-discovery-operations'
import {
  useLoveLanguageCrud,
  type NewLanguageInput,
  type NewActionInput,
  type NewDiscoveryInput,
} from './useLoveLanguageCrud'

interface LoveLanguagesContextValue {
  languages: LoveLanguage[]
  partnerLanguages: LoveLanguage[]
  actions: LoveAction[]
  discoveries: LoveLanguageDiscovery[]
  isLoading: boolean
  addLanguage: (input: NewLanguageInput) => Promise<void>
  updateLanguage: (id: string, updates: Partial<NewLanguageInput>) => Promise<void>
  deleteLanguage: (id: string) => Promise<void>
  toggleLanguagePrivacy: (id: string) => Promise<void>
  addAction: (input: NewActionInput) => Promise<void>
  updateAction: (id: string, updates: Partial<NewActionInput>) => Promise<void>
  deleteAction: (id: string) => Promise<void>
  completeAction: (id: string) => Promise<void>
  addDiscovery: (input: NewDiscoveryInput) => Promise<void>
  deleteDiscovery: (id: string) => Promise<void>
  convertToLanguage: (discoveryId: string, languageData: NewLanguageInput) => Promise<void>
}

const LoveLanguagesContext = createContext<LoveLanguagesContextValue | null>(null)

interface LoveLanguagesProviderProps {
  children: React.ReactNode
  coupleId: string
  userId: string
}

export function LoveLanguagesProvider({ children, coupleId, userId }: LoveLanguagesProviderProps): React.ReactNode {
  const [languages, setLanguages] = useState<LoveLanguage[]>([])
  const [actions, setActions] = useState<LoveAction[]>([])
  const [discoveries, setDiscoveries] = useState<LoveLanguageDiscovery[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const [langs, acts, discs] = await Promise.all([
          fetchLanguages(coupleId, userId),
          fetchActions(coupleId),
          fetchDiscoveries(coupleId, userId),
        ])
        if (!cancelled) {
          setLanguages(langs)
          setActions(acts)
          setDiscoveries(discs)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [coupleId, userId])

  useRealtimeCouple<DbLoveLanguage>({
    table: 'love_languages',
    coupleId,
    onInsert: useCallback(
      (row: DbLoveLanguage) => {
        const mapped = mapDbLanguage(row)
        if (mapped.userId === userId || mapped.privacy === 'shared') {
          setLanguages((prev) => [mapped, ...prev.filter((l) => l.id !== mapped.id)])
        }
      },
      [userId],
    ),
    onUpdate: useCallback(
      (row: DbLoveLanguage) => {
        const mapped = mapDbLanguage(row)
        if (mapped.userId === userId || mapped.privacy === 'shared') {
          setLanguages((prev) => prev.map((l) => (l.id === mapped.id ? mapped : l)))
        } else {
          setLanguages((prev) => prev.filter((l) => l.id !== mapped.id))
        }
      },
      [userId],
    ),
    onDelete: useCallback((old: DbLoveLanguage) => {
      setLanguages((prev) => prev.filter((l) => l.id !== old.id))
    }, []),
  })

  useRealtimeCouple<DbLoveAction>({
    table: 'love_actions',
    coupleId,
    onInsert: useCallback((row: DbLoveAction) => {
      setActions((prev) => [mapDbAction(row), ...prev.filter((a) => a.id !== row.id)])
    }, []),
    onUpdate: useCallback((row: DbLoveAction) => {
      setActions((prev) => prev.map((a) => (a.id === row.id ? mapDbAction(row) : a)))
    }, []),
    onDelete: useCallback((old: DbLoveAction) => {
      setActions((prev) => prev.filter((a) => a.id !== old.id))
    }, []),
  })

  useRealtimeCouple<DbLoveLanguageDiscovery>({
    table: 'love_language_discoveries',
    coupleId,
    onInsert: useCallback(
      (row: DbLoveLanguageDiscovery) => {
        if (row.user_id === userId) {
          setDiscoveries((prev) => [mapDbDiscovery(row), ...prev.filter((d) => d.id !== row.id)])
        }
      },
      [userId],
    ),
    onUpdate: useCallback(
      (row: DbLoveLanguageDiscovery) => {
        if (row.user_id === userId) {
          setDiscoveries((prev) => prev.map((d) => (d.id === row.id ? mapDbDiscovery(row) : d)))
        }
      },
      [userId],
    ),
    onDelete: useCallback((old: DbLoveLanguageDiscovery) => {
      setDiscoveries((prev) => prev.filter((d) => d.id !== old.id))
    }, []),
  })

  const myLanguages = languages.filter((l) => l.userId === userId)
  const partnerLanguages = languages.filter((l) => l.userId !== userId && l.privacy === 'shared')

  const crud = useLoveLanguageCrud({
    coupleId,
    userId,
    languages,
    actions,
    setLanguages,
    setActions,
    setDiscoveries,
  })

  const value: LoveLanguagesContextValue = {
    languages: myLanguages,
    partnerLanguages,
    actions,
    discoveries,
    isLoading,
    ...crud,
  }

  return <LoveLanguagesContext.Provider value={value}>{children}</LoveLanguagesContext.Provider>
}

export function useLoveLanguages(): LoveLanguagesContextValue {
  const ctx = useContext(LoveLanguagesContext)
  if (!ctx) throw new Error('useLoveLanguages must be used within LoveLanguagesProvider')
  return ctx
}
