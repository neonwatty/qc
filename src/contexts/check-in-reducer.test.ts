import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'

import type { CheckInContextState, CheckInSession } from '@/types/checkin'

import { STEPS, createInitialSession, checkInReducer } from './check-in-reducer'

// ---------------------------------------------------------------------------
// Fake timers -- lets us control `new Date()` so timestamp assertions are
// deterministic and never collide within the same millisecond.
// ---------------------------------------------------------------------------

const BASE_TIME = new Date('2025-06-01T12:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(BASE_TIME)
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Advance the fake clock so the next `new Date()` call produces a different ISO string. */
function tick(ms = 1000): void {
  vi.advanceTimersByTime(ms)
}

function makeState(sessionOverrides: Partial<CheckInSession> | null = {}): CheckInContextState {
  if (sessionOverrides === null) {
    return { session: null, isLoading: false, error: null }
  }
  const base = createInitialSession(['communication', 'intimacy'], 'couple-1')
  return {
    session: { ...base, ...sessionOverrides },
    isLoading: false,
    error: null,
  }
}

// ---------------------------------------------------------------------------
// createInitialSession
// ---------------------------------------------------------------------------

describe('createInitialSession', () => {
  it('returns a session with a UUID id', () => {
    const session = createInitialSession(['communication'], 'couple-1')
    expect(session.id).toEqual(expect.any(String))
    expect(session.id.length).toBeGreaterThan(0)
    // id should match the baseCheckIn id
    expect(session.id).toBe(session.baseCheckIn.id)
  })

  it('initialises progress to welcome step with 0 percentage', () => {
    const session = createInitialSession(['a', 'b'], 'couple-1')
    expect(session.progress).toEqual({
      currentStep: 'welcome',
      completedSteps: [],
      totalSteps: STEPS.length,
      percentage: 0,
    })
  })

  it('sets baseCheckIn with in-progress status and null moods/reflection', () => {
    const session = createInitialSession(['trust'], 'couple-1')
    expect(session.baseCheckIn.status).toBe('in-progress')
    expect(session.baseCheckIn.coupleId).toBe('couple-1')
    expect(session.baseCheckIn.categories).toEqual(['trust'])
    expect(session.baseCheckIn.moodBefore).toBeNull()
    expect(session.baseCheckIn.moodAfter).toBeNull()
    expect(session.baseCheckIn.reflection).toBeNull()
    expect(session.baseCheckIn.completedAt).toBeNull()
  })

  it('creates categoryProgress for each supplied category', () => {
    const session = createInitialSession(['a', 'b', 'c'], 'couple-1')
    expect(session.categoryProgress).toHaveLength(3)
    session.categoryProgress.forEach((cp, i) => {
      // eslint-disable-next-line security/detect-object-injection -- i is the forEach index over a fixed-length array
      expect(cp.categoryId).toBe(['a', 'b', 'c'][i])
      expect(cp.isCompleted).toBe(false)
      expect(cp.notes).toEqual([])
      expect(cp.timeSpent).toBe(0)
    })
  })

  it('starts with empty draftNotes and selectedCategories matching input', () => {
    const session = createInitialSession(['x', 'y'], 'couple-1')
    expect(session.draftNotes).toEqual([])
    expect(session.selectedCategories).toEqual(['x', 'y'])
  })
})

// ---------------------------------------------------------------------------
// START_CHECKIN
// ---------------------------------------------------------------------------

describe('START_CHECKIN', () => {
  it('clears isLoading and error', () => {
    const state: CheckInContextState = { session: null, isLoading: true, error: 'something broke' }
    const next = checkInReducer(state, { type: 'START_CHECKIN', payload: { categories: [] } })
    expect(next.isLoading).toBe(false)
    expect(next.error).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// GO_TO_STEP
// ---------------------------------------------------------------------------

describe('GO_TO_STEP', () => {
  it('changes the current step', () => {
    const state = makeState()
    const next = checkInReducer(state, { type: 'GO_TO_STEP', payload: { step: 'reflection' } })
    expect(next.session!.progress.currentStep).toBe('reflection')
  })

  it('updates lastSavedAt', () => {
    const state = makeState()
    const originalTimestamp = state.session!.lastSavedAt
    tick()
    const next = checkInReducer(state, { type: 'GO_TO_STEP', payload: { step: 'reflection' } })
    expect(next.session!.lastSavedAt).not.toBe(originalTimestamp)
  })

  it('is a no-op when there is no session', () => {
    const state = makeState(null)
    const next = checkInReducer(state, { type: 'GO_TO_STEP', payload: { step: 'reflection' } })
    expect(next).toBe(state)
  })
})

// ---------------------------------------------------------------------------
// COMPLETE_STEP
// ---------------------------------------------------------------------------

describe('COMPLETE_STEP', () => {
  it('adds the step to completedSteps and advances to the next step', () => {
    const state = makeState()
    const next = checkInReducer(state, { type: 'COMPLETE_STEP', payload: { step: 'welcome' } })
    expect(next.session!.progress.completedSteps).toContain('welcome')
    expect(next.session!.progress.currentStep).toBe('category-selection')
  })

  it('updates percentage based on completed steps', () => {
    const state = makeState()
    const next = checkInReducer(state, { type: 'COMPLETE_STEP', payload: { step: 'welcome' } })
    const expected = Math.round((1 / STEPS.length) * 100)
    expect(next.session!.progress.percentage).toBe(expected)
  })

  it('does not add duplicate completed steps', () => {
    let state = makeState()
    state = checkInReducer(state, { type: 'COMPLETE_STEP', payload: { step: 'welcome' } })
    state = checkInReducer(state, { type: 'COMPLETE_STEP', payload: { step: 'welcome' } })
    const count = state.session!.progress.completedSteps.filter((s) => s === 'welcome').length
    expect(count).toBe(1)
  })

  it('stays on the last step when completing completion', () => {
    let state = makeState()
    // Advance to completion step
    state = {
      ...state,
      session: {
        ...state.session!,
        progress: { ...state.session!.progress, currentStep: 'completion' },
      },
    }
    const next = checkInReducer(state, { type: 'COMPLETE_STEP', payload: { step: 'completion' } })
    expect(next.session!.progress.currentStep).toBe('completion')
  })

  it('is a no-op when there is no session', () => {
    const state = makeState(null)
    const next = checkInReducer(state, { type: 'COMPLETE_STEP', payload: { step: 'welcome' } })
    expect(next).toBe(state)
  })
})

// ---------------------------------------------------------------------------
// SET_CATEGORY_PROGRESS
// ---------------------------------------------------------------------------

describe('SET_CATEGORY_PROGRESS', () => {
  it('updates the matching category and preserves others', () => {
    const state = makeState()
    const next = checkInReducer(state, {
      type: 'SET_CATEGORY_PROGRESS',
      payload: { categoryId: 'communication', progress: { isCompleted: true, timeSpent: 120 } },
    })
    const updated = next.session!.categoryProgress.find((cp) => cp.categoryId === 'communication')!
    expect(updated.isCompleted).toBe(true)
    expect(updated.timeSpent).toBe(120)

    const unchanged = next.session!.categoryProgress.find((cp) => cp.categoryId === 'intimacy')!
    expect(unchanged.isCompleted).toBe(false)
    expect(unchanged.timeSpent).toBe(0)
  })

  it('sets lastUpdated on the modified category', () => {
    const state = makeState()
    const before = state.session!.categoryProgress.find((cp) => cp.categoryId === 'communication')!.lastUpdated
    tick()
    const next = checkInReducer(state, {
      type: 'SET_CATEGORY_PROGRESS',
      payload: { categoryId: 'communication', progress: { timeSpent: 5 } },
    })
    const after = next.session!.categoryProgress.find((cp) => cp.categoryId === 'communication')!.lastUpdated
    expect(after).not.toBe(before)
  })

  it('is a no-op when there is no session', () => {
    const state = makeState(null)
    const next = checkInReducer(state, {
      type: 'SET_CATEGORY_PROGRESS',
      payload: { categoryId: 'communication', progress: { isCompleted: true } },
    })
    expect(next).toBe(state)
  })
})
