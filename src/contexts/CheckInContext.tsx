'use client'

import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react'
import type { Note, ActionItem, DbCheckIn, DbActionItem } from '@/types'
import type { CheckInContextValue, CheckInStep, CategoryProgress } from '@/types/checkin'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import { checkInReducer, createInitialSession, STEPS } from './check-in-reducer'
import {
  mapDbActionItem,
  fetchActiveCheckIn,
  fetchCheckInActionItems,
  insertCheckIn,
  updateCheckInStatus,
  insertNote,
  updateNote,
  deleteNote,
  insertActionItem,
  updateActionItemDb,
  deleteActionItem,
  toggleActionItemDb,
} from '@/lib/checkin-operations'

const CheckInContext = createContext<CheckInContextValue | null>(null)

interface CheckInProviderProps {
  children: React.ReactNode
  coupleId: string
  userId: string
}

export function CheckInProvider({ children, coupleId, userId }: CheckInProviderProps): React.ReactNode {
  const [state, dispatch] = useReducer(checkInReducer, {
    session: null,
    isLoading: true,
    error: null,
  })
  const [actionItems, setActionItems] = useState<ActionItem[]>([])

  useEffect(() => {
    async function loadActiveCheckIn() {
      const { data, error } = await fetchActiveCheckIn(coupleId)
      if (error) {
        console.error('Failed to load active check-in:', error)
        dispatch({ type: 'SAVE_SESSION' })
        return
      }
      if (data) {
        const session = createInitialSession(data.categories || [], coupleId)
        session.id = data.id
        session.baseCheckIn.id = data.id
        session.baseCheckIn.startedAt = data.started_at
        session.baseCheckIn.moodBefore = data.mood_before
        session.baseCheckIn.moodAfter = data.mood_after
        session.startedAt = data.started_at
        const { data: items } = await fetchCheckInActionItems(data.id, coupleId)
        if (items) setActionItems(items.map(mapDbActionItem))
        dispatch({ type: 'RESTORE_SESSION', payload: { session } })
      } else {
        dispatch({ type: 'SAVE_SESSION' })
      }
    }
    loadActiveCheckIn()
  }, [coupleId])

  useRealtimeCouple<DbCheckIn>({
    table: 'check_ins',
    coupleId,
    onUpdate: (record) => {
      if (state.session && record.id === state.session.id && record.status !== 'in-progress') {
        dispatch({ type: 'COMPLETE_CHECKIN' })
      }
    },
  })

  useRealtimeCouple<DbActionItem>({
    table: 'action_items',
    coupleId,
    onInsert: (record) => setActionItems((prev) => [...prev, mapDbActionItem(record)]),
    onUpdate: (record) => {
      setActionItems((prev) => prev.map((item) => (item.id === record.id ? mapDbActionItem(record) : item)))
    },
    onDelete: (record) => setActionItems((prev) => prev.filter((item) => item.id !== record.id)),
  })

  const startCheckIn = useCallback(
    async (categories: string[]) => {
      const session = createInitialSession(categories, coupleId)
      const { data, error } = await insertCheckIn(session.id, coupleId, session.startedAt, categories)
      if (error) {
        console.error('Failed to start check-in:', error)
        return
      }
      session.id = data.id
      session.baseCheckIn.id = data.id
      dispatch({ type: 'RESTORE_SESSION', payload: { session } })
    },
    [coupleId],
  )

  const goToStep = useCallback((step: CheckInStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: { step } })
  }, [])

  const completeStep = useCallback((step: CheckInStep) => {
    dispatch({ type: 'COMPLETE_STEP', payload: { step } })
  }, [])

  const updateCategoryProgress = useCallback((categoryId: string, progress: Partial<CategoryProgress>) => {
    dispatch({ type: 'SET_CATEGORY_PROGRESS', payload: { categoryId, progress } })
  }, [])

  const addDraftNote = useCallback(
    async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await insertNote({
        coupleId,
        authorId: userId,
        checkInId: state.session?.id ?? null,
        content: note.content,
        privacy: note.privacy || 'draft',
        tags: note.tags || [],
        categoryId: note.categoryId ?? null,
      })
      if (error) {
        console.error('Failed to add note:', error)
        return
      }
      const newNote: Note = {
        id: data.id,
        coupleId: data.couple_id,
        authorId: data.author_id,
        checkInId: data.check_in_id,
        content: data.content,
        privacy: data.privacy,
        tags: data.tags || [],
        categoryId: data.category_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
      dispatch({ type: 'ADD_DRAFT_NOTE', payload: { note: newNote } })
    },
    [coupleId, userId, state.session?.id],
  )

  const updateDraftNote = useCallback(async (noteId: string, updates: Partial<Note>) => {
    await updateNote(noteId, updates)
    dispatch({ type: 'UPDATE_DRAFT_NOTE', payload: { noteId, updates } })
  }, [])

  const removeDraftNote = useCallback(async (noteId: string) => {
    await deleteNote(noteId)
    dispatch({ type: 'REMOVE_DRAFT_NOTE', payload: { noteId } })
  }, [])

  const addActionItem = useCallback(
    async (actionItem: Omit<ActionItem, 'id' | 'createdAt'>) => {
      await insertActionItem({
        coupleId,
        checkInId: state.session?.id ?? null,
        title: actionItem.title,
        description: actionItem.description ?? null,
        assignedTo: actionItem.assignedTo ?? null,
        dueDate: actionItem.dueDate ?? null,
      })
    },
    [coupleId, state.session?.id],
  )

  const handleUpdateActionItem = useCallback(async (actionItemId: string, updates: Partial<ActionItem>) => {
    await updateActionItemDb(actionItemId, updates)
  }, [])

  const handleRemoveActionItem = useCallback(async (actionItemId: string) => {
    await deleteActionItem(actionItemId)
  }, [])

  const handleToggleActionItem = useCallback(
    async (actionItemId: string) => {
      const item = actionItems.find((i) => i.id === actionItemId)
      if (!item) return
      await toggleActionItemDb(actionItemId, item.completed)
    },
    [actionItems],
  )

  const saveSession = useCallback(() => {
    dispatch({ type: 'SAVE_SESSION' })
  }, [])

  const completeCheckIn = useCallback(async () => {
    if (!state.session) return
    await updateCheckInStatus(state.session.id, 'completed')
    dispatch({ type: 'COMPLETE_CHECKIN' })
  }, [state.session])

  const abandonCheckIn = useCallback(async () => {
    if (!state.session) return
    await updateCheckInStatus(state.session.id, 'abandoned')
    dispatch({ type: 'ABANDON_CHECKIN' })
  }, [state.session])

  const canGoToStep = useCallback(
    (step: CheckInStep) => {
      if (!state.session) return false
      const stepIndex = STEPS.indexOf(step)
      const currentIndex = STEPS.indexOf(state.session.progress.currentStep)
      return stepIndex <= currentIndex + 1
    },
    [state.session],
  )

  const getStepIndex = useCallback((step: CheckInStep) => STEPS.indexOf(step), [])

  const isStepCompleted = useCallback(
    (step: CheckInStep) => {
      if (!state.session) return false
      return state.session.progress.completedSteps.includes(step)
    },
    [state.session],
  )

  const getCurrentCategoryProgress = useCallback(() => {
    if (!state.session || state.session.progress.currentStep !== 'category-discussion') return undefined
    return state.session.categoryProgress.find((cp) => !cp.isCompleted)
  }, [state.session])

  const contextValue: CheckInContextValue = {
    ...state,
    dispatch,
    startCheckIn,
    goToStep,
    completeStep,
    updateCategoryProgress,
    addDraftNote,
    updateDraftNote: updateDraftNote,
    removeDraftNote,
    addActionItem,
    updateActionItem: handleUpdateActionItem,
    removeActionItem: handleRemoveActionItem,
    toggleActionItem: handleToggleActionItem,
    saveSession,
    completeCheckIn,
    abandonCheckIn,
    canGoToStep,
    getStepIndex,
    isStepCompleted,
    getCurrentCategoryProgress,
  }

  return <CheckInContext.Provider value={contextValue}>{children}</CheckInContext.Provider>
}

export function useCheckInContext(): CheckInContextValue {
  const context = useContext(CheckInContext)
  if (!context) {
    throw new Error('useCheckInContext must be used within a CheckInProvider')
  }
  return context
}
