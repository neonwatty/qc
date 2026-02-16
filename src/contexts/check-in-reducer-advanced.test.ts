import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'

import type { Note } from '@/types'
import type { CheckInContextState, CheckInSession } from '@/types/checkin'

import { createInitialSession, checkInReducer } from './check-in-reducer'

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

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    coupleId: 'couple-1',
    authorId: 'user-1',
    checkInId: null,
    content: 'Test note',
    privacy: 'draft',
    tags: [],
    categoryId: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
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
// Draft notes CRUD
// ---------------------------------------------------------------------------

describe('ADD_DRAFT_NOTE', () => {
  it('appends a note to draftNotes', () => {
    const state = makeState()
    const note = makeNote()
    const next = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note } })
    expect(next.session!.draftNotes).toHaveLength(1)
    expect(next.session!.draftNotes[0]).toEqual(note)
  })

  it('appends without removing existing notes', () => {
    const note1 = makeNote({ id: 'note-1' })
    const note2 = makeNote({ id: 'note-2' })
    let state = makeState()
    state = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note: note1 } })
    state = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note: note2 } })
    expect(state.session!.draftNotes).toHaveLength(2)
  })

  it('is a no-op when there is no session', () => {
    const state = makeState(null)
    const next = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note: makeNote() } })
    expect(next).toBe(state)
  })
})

describe('UPDATE_DRAFT_NOTE', () => {
  it('updates the matching note by id', () => {
    let state = makeState()
    state = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note: makeNote({ id: 'note-1' }) } })
    const next = checkInReducer(state, {
      type: 'UPDATE_DRAFT_NOTE',
      payload: { noteId: 'note-1', updates: { content: 'Updated content' } },
    })
    expect(next.session!.draftNotes[0].content).toBe('Updated content')
  })

  it('sets updatedAt on the modified note', () => {
    let state = makeState()
    const note = makeNote({ id: 'note-1' })
    state = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note } })
    const next = checkInReducer(state, {
      type: 'UPDATE_DRAFT_NOTE',
      payload: { noteId: 'note-1', updates: { content: 'new' } },
    })
    expect(next.session!.draftNotes[0].updatedAt).not.toBe(note.updatedAt)
  })

  it('leaves non-matching notes unchanged', () => {
    let state = makeState()
    state = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note: makeNote({ id: 'note-1' }) } })
    state = checkInReducer(state, {
      type: 'ADD_DRAFT_NOTE',
      payload: { note: makeNote({ id: 'note-2', content: 'original' }) },
    })
    const next = checkInReducer(state, {
      type: 'UPDATE_DRAFT_NOTE',
      payload: { noteId: 'note-1', updates: { content: 'changed' } },
    })
    expect(next.session!.draftNotes[1].content).toBe('original')
  })
})

describe('REMOVE_DRAFT_NOTE', () => {
  it('removes the note with the given id', () => {
    let state = makeState()
    state = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note: makeNote({ id: 'note-1' }) } })
    state = checkInReducer(state, { type: 'ADD_DRAFT_NOTE', payload: { note: makeNote({ id: 'note-2' }) } })
    const next = checkInReducer(state, { type: 'REMOVE_DRAFT_NOTE', payload: { noteId: 'note-1' } })
    expect(next.session!.draftNotes).toHaveLength(1)
    expect(next.session!.draftNotes[0].id).toBe('note-2')
  })

  it('is a no-op when there is no session', () => {
    const state = makeState(null)
    const next = checkInReducer(state, { type: 'REMOVE_DRAFT_NOTE', payload: { noteId: 'note-1' } })
    expect(next).toBe(state)
  })
})

// ---------------------------------------------------------------------------
// COMPLETE_CHECKIN / ABANDON_CHECKIN
// ---------------------------------------------------------------------------

describe('COMPLETE_CHECKIN', () => {
  it('sets session to null', () => {
    const state = makeState()
    const next = checkInReducer(state, { type: 'COMPLETE_CHECKIN' })
    expect(next.session).toBeNull()
  })
})

describe('ABANDON_CHECKIN', () => {
  it('sets session to null', () => {
    const state = makeState()
    const next = checkInReducer(state, { type: 'ABANDON_CHECKIN' })
    expect(next.session).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// RESTORE_SESSION
// ---------------------------------------------------------------------------

describe('RESTORE_SESSION', () => {
  it('restores session from payload and clears loading/error', () => {
    const restoredSession = createInitialSession(['trust'], 'couple-2')
    const state: CheckInContextState = { session: null, isLoading: true, error: 'stale' }
    const next = checkInReducer(state, { type: 'RESTORE_SESSION', payload: { session: restoredSession } })
    expect(next.session).toBe(restoredSession)
    expect(next.isLoading).toBe(false)
    expect(next.error).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Timestamp-only actions
// ---------------------------------------------------------------------------

describe('timestamp-only actions', () => {
  const timestampActions = [
    { type: 'ADD_ACTION_ITEM' as const, payload: { actionItem: {} as never } },
    { type: 'UPDATE_ACTION_ITEM' as const, payload: { actionItemId: 'x', updates: {} } },
    { type: 'REMOVE_ACTION_ITEM' as const, payload: { actionItemId: 'x' } },
    { type: 'TOGGLE_ACTION_ITEM' as const, payload: { actionItemId: 'x' } },
    { type: 'SAVE_SESSION' as const },
  ]

  it.each(timestampActions)('$type updates lastSavedAt', (action) => {
    const state = makeState()
    const original = state.session!.lastSavedAt
    tick()
    const next = checkInReducer(state, action)
    expect(next.session!.lastSavedAt).not.toBe(original)
  })

  it.each(timestampActions)('$type is a no-op when there is no session', (action) => {
    const state = makeState(null)
    const next = checkInReducer(state, action)
    expect(next).toBe(state)
  })
})
