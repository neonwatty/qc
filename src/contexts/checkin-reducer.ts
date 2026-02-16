import type {
  CheckInContextState,
  CheckInAction,
  CheckInSession,
  CheckInStep,
} from '@/types/checkin'

export const STEPS: CheckInStep[] = [
  'welcome',
  'category-selection',
  'category-discussion',
  'reflection',
  'action-items',
  'completion',
]

export function getStepIndex(step: CheckInStep): number {
  return STEPS.indexOf(step)
}

export function createInitialSession(categories: string[]): CheckInSession {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    baseCheckIn: {
      id: '',
      coupleId: '',
      startedAt: now,
      completedAt: null,
      status: 'in-progress',
      categories,
      moodBefore: null,
      moodAfter: null,
      reflection: null,
    },
    progress: {
      currentStep: 'welcome',
      completedSteps: [],
      totalSteps: STEPS.length,
      percentage: 0,
    },
    selectedCategories: categories,
    categoryProgress: categories.map((id) => ({
      categoryId: id,
      isCompleted: false,
      notes: [],
      timeSpent: 0,
      lastUpdated: now,
    })),
    draftNotes: [],
    startedAt: now,
    lastSavedAt: now,
  }
}

export const initialState: CheckInContextState = {
  session: null,
  isLoading: true,
  error: null,
}

export function checkInReducer(
  state: CheckInContextState,
  action: CheckInAction,
): CheckInContextState {
  switch (action.type) {
    case 'START_CHECKIN':
      return {
        ...state,
        session: createInitialSession(action.payload.categories),
        error: null,
      }

    case 'GO_TO_STEP': {
      if (!state.session) return state
      const stepIndex = getStepIndex(action.payload.step)
      return {
        ...state,
        session: {
          ...state.session,
          progress: {
            ...state.session.progress,
            currentStep: action.payload.step,
            percentage: Math.round(
              (stepIndex / (STEPS.length - 1)) * 100,
            ),
          },
        },
      }
    }

    case 'COMPLETE_STEP': {
      if (!state.session) return state
      const completed = new Set(state.session.progress.completedSteps)
      completed.add(action.payload.step)
      return {
        ...state,
        session: {
          ...state.session,
          progress: {
            ...state.session.progress,
            completedSteps: [...completed],
          },
        },
      }
    }

    case 'SET_CATEGORY_PROGRESS': {
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          categoryProgress: state.session.categoryProgress.map((cp) =>
            cp.categoryId === action.payload.categoryId
              ? {
                  ...cp,
                  ...action.payload.progress,
                  lastUpdated: new Date().toISOString(),
                }
              : cp,
          ),
        },
      }
    }

    case 'ADD_DRAFT_NOTE': {
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          draftNotes: [...state.session.draftNotes, action.payload.note],
        },
      }
    }

    case 'UPDATE_DRAFT_NOTE': {
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          draftNotes: state.session.draftNotes.map((n) =>
            n.id === action.payload.noteId
              ? { ...n, ...action.payload.updates }
              : n,
          ),
        },
      }
    }

    case 'REMOVE_DRAFT_NOTE': {
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          draftNotes: state.session.draftNotes.filter(
            (n) => n.id !== action.payload.noteId,
          ),
        },
      }
    }

    case 'SAVE_SESSION':
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          lastSavedAt: new Date().toISOString(),
        },
      }

    case 'COMPLETE_CHECKIN':
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          baseCheckIn: {
            ...state.session.baseCheckIn,
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
          progress: {
            ...state.session.progress,
            currentStep: 'completion',
            percentage: 100,
          },
        },
      }

    case 'ABANDON_CHECKIN':
      return { ...state, session: null, error: null }

    case 'RESTORE_SESSION':
      return {
        ...state,
        session: action.payload.session,
        isLoading: false,
      }

    default:
      return state
  }
}
