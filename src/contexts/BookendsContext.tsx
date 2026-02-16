'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import type {
  BookendsState,
  PreparationTopic,
  QuickReflection,
  SessionPreparation,
} from '@/types/bookends'

interface BookendsContextValue extends BookendsState {
  openPreparation: () => void
  closePreparation: () => void
  openReflection: () => void
  closeReflection: () => void
  addTopic: (topic: Omit<PreparationTopic, 'id' | 'createdAt'>) => void
  removeTopic: (topicId: string) => void
  setPreparation: (preparation: SessionPreparation) => void
  submitReflection: (reflection: Omit<QuickReflection, 'id' | 'createdAt'>) => void
  markPrepReminderSeen: () => void
}

const initialState: BookendsState = {
  preparation: null,
  reflection: null,
  partnerReflection: null,
  isPreparationModalOpen: false,
  isReflectionModalOpen: false,
  hasSeenPrepReminder: false,
  reflectionStreak: 0,
}

const BookendsContext = createContext<BookendsContextValue | null>(null)

interface BookendsProviderProps {
  children: ReactNode
}

export function BookendsProvider({ children }: BookendsProviderProps): ReactNode {
  const [state, setState] = useState<BookendsState>(initialState)

  const openPreparation = useCallback(() => {
    setState((prev) => ({ ...prev, isPreparationModalOpen: true }))
  }, [])

  const closePreparation = useCallback(() => {
    setState((prev) => ({ ...prev, isPreparationModalOpen: false }))
  }, [])

  const openReflection = useCallback(() => {
    setState((prev) => ({ ...prev, isReflectionModalOpen: true }))
  }, [])

  const closeReflection = useCallback(() => {
    setState((prev) => ({ ...prev, isReflectionModalOpen: false }))
  }, [])

  const addTopic = useCallback(
    (topic: Omit<PreparationTopic, 'id' | 'createdAt'>) => {
      setState((prev) => {
        const newTopic: PreparationTopic = {
          ...topic,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }

        const preparation = prev.preparation ?? {
          id: crypto.randomUUID(),
          myTopics: [],
          partnerTopics: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return {
          ...prev,
          preparation: {
            ...preparation,
            myTopics: [...preparation.myTopics, newTopic],
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },
    [],
  )

  const removeTopic = useCallback((topicId: string) => {
    setState((prev) => {
      if (!prev.preparation) return prev
      return {
        ...prev,
        preparation: {
          ...prev.preparation,
          myTopics: prev.preparation.myTopics.filter((t) => t.id !== topicId),
          updatedAt: new Date().toISOString(),
        },
      }
    })
  }, [])

  const setPreparation = useCallback((preparation: SessionPreparation) => {
    setState((prev) => ({ ...prev, preparation }))
  }, [])

  const submitReflection = useCallback(
    (reflection: Omit<QuickReflection, 'id' | 'createdAt'>) => {
      const fullReflection: QuickReflection = {
        ...reflection,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        reflection: fullReflection,
        isReflectionModalOpen: false,
        reflectionStreak: prev.reflectionStreak + 1,
      }))
    },
    [],
  )

  const markPrepReminderSeen = useCallback(() => {
    setState((prev) => ({ ...prev, hasSeenPrepReminder: true }))
  }, [])

  const value = useMemo<BookendsContextValue>(
    () => ({
      ...state,
      openPreparation,
      closePreparation,
      openReflection,
      closeReflection,
      addTopic,
      removeTopic,
      setPreparation,
      submitReflection,
      markPrepReminderSeen,
    }),
    [
      state,
      openPreparation,
      closePreparation,
      openReflection,
      closeReflection,
      addTopic,
      removeTopic,
      setPreparation,
      submitReflection,
      markPrepReminderSeen,
    ],
  )

  return (
    <BookendsContext.Provider value={value}>{children}</BookendsContext.Provider>
  )
}

export function useBookends(): BookendsContextValue {
  const context = useContext(BookendsContext)
  if (!context) {
    throw new Error('useBookends must be used within a BookendsProvider')
  }
  return context
}
