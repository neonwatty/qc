// WT-4: Extracted CRUD hook to reduce file size
import { useCallback } from 'react'

import type {
  LoveLanguage,
  LoveAction,
  LoveLanguageDiscovery,
  LoveLanguageCategory,
  LoveLanguagePrivacy,
  LoveLanguageImportance,
  LoveActionStatus,
  LoveActionFrequency,
  LoveActionDifficulty,
} from '@/types'
import {
  insertLanguage,
  updateLanguageDb,
  deleteLanguageDb,
  insertAction,
  updateActionDb,
  deleteActionDb,
  completeActionDb,
} from '@/lib/love-language-operations'
import {
  insertDiscovery,
  deleteDiscoveryDb,
  convertDiscoveryToLanguage,
} from '@/lib/love-language-discovery-operations'
import { createClient } from '@/lib/supabase/client'

export interface NewLanguageInput {
  title: string
  description: string | null
  category: LoveLanguageCategory
  privacy: LoveLanguagePrivacy
  importance: LoveLanguageImportance
  examples: string[]
  tags: string[]
}

export interface NewActionInput {
  linkedLanguageId: string | null
  title: string
  description: string | null
  status: LoveActionStatus
  frequency: LoveActionFrequency
  difficulty: LoveActionDifficulty
}

export interface NewDiscoveryInput {
  discovery: string
  checkInId?: string | null
}

interface UseLoveLanguageCrudParams {
  coupleId: string
  userId: string
  languages: LoveLanguage[]
  actions: LoveAction[]
  setLanguages: React.Dispatch<React.SetStateAction<LoveLanguage[]>>
  setActions: React.Dispatch<React.SetStateAction<LoveAction[]>>
  setDiscoveries: React.Dispatch<React.SetStateAction<LoveLanguageDiscovery[]>>
}

export function useLoveLanguageCrud({
  coupleId,
  userId,
  languages,
  actions,
  setLanguages,
  setActions,
  setDiscoveries,
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
      const newPrivacy = lang.privacy === 'private' ? 'shared' : 'private'
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

  const addDiscovery = useCallback(
    async (input: NewDiscoveryInput) => {
      const discovery = await insertDiscovery(coupleId, userId, input)
      setDiscoveries((prev) => [discovery, ...prev])
    },
    [coupleId, userId, setDiscoveries],
  )

  const deleteDiscovery = useCallback(
    async (id: string) => {
      await deleteDiscoveryDb(id)
      setDiscoveries((prev) => prev.filter((d) => d.id !== id))
    },
    [setDiscoveries],
  )

  const convertToLanguage = useCallback(
    async (discoveryId: string, languageData: NewLanguageInput) => {
      const lang = await insertLanguage(coupleId, userId, languageData)
      setLanguages((prev) => [lang, ...prev])
      try {
        const updated = await convertDiscoveryToLanguage(discoveryId, lang.id)
        setDiscoveries((prev) => prev.map((d) => (d.id === discoveryId ? updated : d)))
      } catch (error) {
        // Rollback: remove the created language
        const supabase = createClient()
        await supabase.from('love_languages').delete().eq('id', lang.id)
        setLanguages((prev) => prev.filter((l) => l.id !== lang.id))
        throw error
      }
    },
    [coupleId, userId, setLanguages, setDiscoveries],
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
    addDiscovery,
    deleteDiscovery,
    convertToLanguage,
  }
}
