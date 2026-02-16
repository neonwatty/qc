'use client'

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import type {
  LoveLanguage,
  LoveAction,
  LoveLanguageCategory,
  LoveLanguagePrivacy,
  LoveLanguageImportance,
  LoveActionStatus,
  LoveActionFrequency,
  LoveActionDifficulty,
  DbLoveLanguage,
  DbLoveAction,
} from '@/types'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import {
  mapDbLanguage,
  mapDbAction,
  fetchLanguages,
  fetchActions,
  insertLanguage,
  updateLanguageDb,
  deleteLanguageDb,
  insertAction,
  updateActionDb,
  deleteActionDb,
  completeActionDb,
} from '@/lib/love-language-operations'

interface NewLanguageInput {
  title: string
  description: string | null
  category: LoveLanguageCategory
  privacy: LoveLanguagePrivacy
  importance: LoveLanguageImportance
  examples: string[]
  tags: string[]
}

interface NewActionInput {
  linkedLanguageId: string | null
  title: string
  description: string | null
  status: LoveActionStatus
  frequency: LoveActionFrequency
  difficulty: LoveActionDifficulty
}

interface LoveLanguagesContextValue {
  languages: LoveLanguage[]
  partnerLanguages: LoveLanguage[]
  actions: LoveAction[]
  isLoading: boolean
  addLanguage: (input: NewLanguageInput) => Promise<void>
  updateLanguage: (id: string, updates: Partial<NewLanguageInput>) => Promise<void>
  deleteLanguage: (id: string) => Promise<void>
  toggleLanguagePrivacy: (id: string) => Promise<void>
  addAction: (input: NewActionInput) => Promise<void>
  updateAction: (id: string, updates: Partial<NewActionInput>) => Promise<void>
  deleteAction: (id: string) => Promise<void>
  completeAction: (id: string) => Promise<void>
}

const LoveLanguagesContext = createContext<LoveLanguagesContextValue | null>(null)

interface LoveLanguagesProviderProps {
  children: React.ReactNode
  coupleId: string
  userId: string
}

interface UseLoveLanguageCrudParams {
  coupleId: string
  userId: string
  languages: LoveLanguage[]
  actions: LoveAction[]
  setLanguages: React.Dispatch<React.SetStateAction<LoveLanguage[]>>
  setActions: React.Dispatch<React.SetStateAction<LoveAction[]>>
}

function useLoveLanguageCrud({
  coupleId,
  userId,
  languages,
  actions,
  setLanguages,
  setActions,
}: UseLoveLanguageCrudParams) {
  const addLanguage = useCallback(
    async (input: NewLanguageInput) => {
      const lang = await insertLanguage(coupleId, userId, input)
      setLanguages((prev) => [lang, ...prev])
    },
    [coupleId, userId, setLanguages],
  )

  const updateLanguage = useCallback(
    async (id: string, updates: Partial<NewLanguageInput>) => {
      await updateLanguageDb(id, updates)
      setLanguages((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l)),
      )
    },
    [setLanguages],
  )

  const deleteLanguage = useCallback(
    async (id: string) => {
      await deleteLanguageDb(id)
      setLanguages((prev) => prev.filter((l) => l.id !== id))
    },
    [setLanguages],
  )

  const toggleLanguagePrivacy = useCallback(
    async (id: string) => {
      const lang = languages.find((l) => l.id === id)
      if (!lang) return
      const newPrivacy: LoveLanguagePrivacy = lang.privacy === 'private' ? 'shared' : 'private'
      await updateLanguageDb(id, { privacy: newPrivacy })
      setLanguages((prev) => prev.map((l) => (l.id === id ? { ...l, privacy: newPrivacy } : l)))
    },
    [languages, setLanguages],
  )

  const addAction = useCallback(
    async (input: NewActionInput) => {
      const action = await insertAction(coupleId, input)
      setActions((prev) => [action, ...prev])
    },
    [coupleId, setActions],
  )

  const updateAction = useCallback(
    async (id: string, updates: Partial<NewActionInput>) => {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.linkedLanguageId !== undefined) dbUpdates.linkedLanguageId = updates.linkedLanguageId
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.status !== undefined) dbUpdates.status = updates.status
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency
      if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty
      await updateActionDb(id, dbUpdates)
      setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...dbUpdates } : a)))
    },
    [setActions],
  )

  const deleteAction = useCallback(
    async (id: string) => {
      await deleteActionDb(id)
      setActions((prev) => prev.filter((a) => a.id !== id))
    },
    [setActions],
  )

  const completeAction = useCallback(
    async (id: string) => {
      const action = actions.find((a) => a.id === id)
      if (!action) return
      await completeActionDb(id, action.completedCount)
      setActions((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'completed' as const,
                completedCount: a.completedCount + 1,
                lastCompletedAt: new Date().toISOString(),
              }
            : a,
        ),
      )
    },
    [actions, setActions],
  )

  return {
    addLanguage,
    updateLanguage,
    deleteLanguage,
    toggleLanguagePrivacy,
    addAction,
    updateAction,
    deleteAction,
    completeAction,
  }
}

export function LoveLanguagesProvider({ children, coupleId, userId }: LoveLanguagesProviderProps): React.ReactNode {
  const [languages, setLanguages] = useState<LoveLanguage[]>([])
  const [actions, setActions] = useState<LoveAction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const [langs, acts] = await Promise.all([fetchLanguages(coupleId, userId), fetchActions(coupleId)])
        if (!cancelled) {
          setLanguages(langs)
          setActions(acts)
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

  const myLanguages = languages.filter((l) => l.userId === userId)
  const partnerLanguages = languages.filter((l) => l.userId !== userId && l.privacy === 'shared')

  const crud = useLoveLanguageCrud({ coupleId, userId, languages, actions, setLanguages, setActions })

  const value: LoveLanguagesContextValue = {
    languages: myLanguages,
    partnerLanguages,
    actions,
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
