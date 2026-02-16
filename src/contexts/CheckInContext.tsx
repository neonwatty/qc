'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import type { ReactNode } from 'react'

import { createClient } from '@/lib/supabase/client'
import { snakeToCamelObject } from '@/lib/utils'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import type {
  CheckInContextValue,
  CheckInStep,
  CategoryProgress,
} from '@/types/checkin'
import type { CheckIn, Note, ActionItem } from '@/types/index'
import type { DbCheckIn } from '@/types/database'
import {
  checkInReducer,
  initialState,
  getStepIndex,
  STEPS,
} from './checkin-reducer'

const CheckInContext = createContext<CheckInContextValue | null>(null)

interface CheckInProviderProps {
  children: ReactNode
  coupleId: string | null
}

export function CheckInProvider({
  children,
  coupleId,
}: CheckInProviderProps): ReactNode {
  const [state, dispatch] = useReducer(checkInReducer, initialState)

  useEffect(() => {
    if (!coupleId) return

    async function fetchActive(): Promise<void> {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('status', 'in-progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        dispatch({ type: 'ABANDON_CHECKIN' })
        return
      }

      if (data) {
        const checkIn = snakeToCamelObject<CheckIn>(
          data as unknown as Record<string, unknown>,
        )
        dispatch({
          type: 'RESTORE_SESSION',
          payload: {
            session: {
              id: checkIn.id,
              baseCheckIn: checkIn,
              progress: {
                currentStep: 'category-discussion',
                completedSteps: ['welcome', 'category-selection'],
                totalSteps: STEPS.length,
                percentage: 40,
              },
              selectedCategories: checkIn.categories,
              categoryProgress: checkIn.categories.map((catId) => ({
                categoryId: catId,
                isCompleted: false,
                notes: [],
                timeSpent: 0,
                lastUpdated: checkIn.startedAt,
              })),
              draftNotes: [],
              startedAt: checkIn.startedAt,
              lastSavedAt: checkIn.startedAt,
            },
          },
        })
      } else {
        dispatch({ type: 'ABANDON_CHECKIN' })
      }
    }

    fetchActive()
  }, [coupleId])

  useRealtimeCouple<DbCheckIn>({
    table: 'check_ins',
    coupleId,
    onUpdate: useCallback((record: DbCheckIn) => {
      if (record.status === 'completed' || record.status === 'abandoned') {
        dispatch({ type: 'ABANDON_CHECKIN' })
      }
    }, []),
  })

  const startCheckIn = useCallback((categories: string[]) => {
    dispatch({ type: 'START_CHECKIN', payload: { categories } })
  }, [])

  const goToStep = useCallback((step: CheckInStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: { step } })
  }, [])

  const completeStep = useCallback((step: CheckInStep) => {
    dispatch({ type: 'COMPLETE_STEP', payload: { step } })
    const nextIndex = getStepIndex(step) + 1
    if (nextIndex < STEPS.length) {
      dispatch({ type: 'GO_TO_STEP', payload: { step: STEPS[nextIndex] } })
    }
  }, [])

  const updateCategoryProgress = useCallback(
    (categoryId: string, progress: Partial<CategoryProgress>) => {
      dispatch({
        type: 'SET_CATEGORY_PROGRESS',
        payload: { categoryId, progress },
      })
    },
    [],
  )

  const addDraftNote = useCallback(
    (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const fullNote: Note = {
        ...note,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_DRAFT_NOTE', payload: { note: fullNote } })
    },
    [],
  )

  const updateDraftNote = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      dispatch({ type: 'UPDATE_DRAFT_NOTE', payload: { noteId, updates } })
    },
    [],
  )

  const removeDraftNote = useCallback((noteId: string) => {
    dispatch({ type: 'REMOVE_DRAFT_NOTE', payload: { noteId } })
  }, [])

  const addActionItem = useCallback(
    (actionItem: Omit<ActionItem, 'id' | 'createdAt'>) => {
      dispatch({
        type: 'ADD_ACTION_ITEM',
        payload: {
          actionItem: {
            ...actionItem,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
        },
      })
    },
    [],
  )

  const updateActionItem = useCallback(
    (actionItemId: string, updates: Partial<ActionItem>) => {
      dispatch({
        type: 'UPDATE_ACTION_ITEM',
        payload: { actionItemId, updates },
      })
    },
    [],
  )

  const removeActionItem = useCallback((actionItemId: string) => {
    dispatch({ type: 'REMOVE_ACTION_ITEM', payload: { actionItemId } })
  }, [])

  const toggleActionItem = useCallback((actionItemId: string) => {
    dispatch({ type: 'TOGGLE_ACTION_ITEM', payload: { actionItemId } })
  }, [])

  const saveSession = useCallback(() => {
    dispatch({ type: 'SAVE_SESSION' })
  }, [])

  const completeCheckIn = useCallback(() => {
    dispatch({ type: 'COMPLETE_CHECKIN' })
  }, [])

  const abandonCheckIn = useCallback(() => {
    dispatch({ type: 'ABANDON_CHECKIN' })
  }, [])

  const canGoToStep = useCallback(
    (step: CheckInStep): boolean => {
      if (!state.session) return false
      const targetIndex = getStepIndex(step)
      const currentIndex = getStepIndex(state.session.progress.currentStep)
      return targetIndex <= currentIndex + 1
    },
    [state.session],
  )

  const isStepCompleted = useCallback(
    (step: CheckInStep): boolean => {
      if (!state.session) return false
      return state.session.progress.completedSteps.includes(step)
    },
    [state.session],
  )

  const getCurrentCategoryProgress = useCallback(
    (): CategoryProgress | undefined => {
      if (!state.session) return undefined
      return state.session.categoryProgress.find((cp) => !cp.isCompleted)
    },
    [state.session],
  )

  const value = useMemo<CheckInContextValue>(
    () => ({
      ...state,
      dispatch,
      startCheckIn,
      goToStep,
      completeStep,
      updateCategoryProgress,
      addDraftNote,
      updateDraftNote,
      removeDraftNote,
      addActionItem,
      updateActionItem,
      removeActionItem,
      toggleActionItem,
      saveSession,
      completeCheckIn,
      abandonCheckIn,
      canGoToStep,
      getStepIndex,
      isStepCompleted,
      getCurrentCategoryProgress,
    }),
    [
      state,
      startCheckIn,
      goToStep,
      completeStep,
      updateCategoryProgress,
      addDraftNote,
      updateDraftNote,
      removeDraftNote,
      addActionItem,
      updateActionItem,
      removeActionItem,
      toggleActionItem,
      saveSession,
      completeCheckIn,
      abandonCheckIn,
      canGoToStep,
      isStepCompleted,
      getCurrentCategoryProgress,
    ],
  )

  return (
    <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>
  )
}

export function useCheckIn(): CheckInContextValue {
  const context = useContext(CheckInContext)
  if (!context) {
    throw new Error('useCheckIn must be used within a CheckInProvider')
  }
  return context
}
