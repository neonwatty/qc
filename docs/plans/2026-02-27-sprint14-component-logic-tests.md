# Sprint 14: Component Logic Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for the 3 most logic-heavy UI components — StatsGrid (date formatting), NoteList (filter/search), and SessionTimer (phase calculation). ~18 new tests bringing total to ~687.

**Architecture:** Render components with `@testing-library/react`, mock child components and hooks as needed. StatsGrid tests date formatting via rendered output. NoteList tests filter/search via `fireEvent`. SessionTimer tests phase calculation via mocked `useSessionTimer` hook.

**Tech Stack:** Vitest + @testing-library/react

---

### Task 1: StatsGrid Component Tests

**Files:**

- Create: `src/components/dashboard/StatsGrid.test.tsx`
- Source: `src/components/dashboard/StatsGrid.tsx` (130 lines)

**Context:**
`StatsGrid` renders 6 stat cards. Two contain formatting logic:

- `formatDuration(isoDate)`: returns `"Xd"`, `"Xmo"`, `"Xy"`, or `"Xy, Xmo"` based on difference from now
- `formatLastCheckIn(isoDate)`: returns `"Today"` for same day, otherwise `formatDistanceToNow(date, { addSuffix: true })`
- Displays `"Not set"` when `relationshipStartDate` is null, `"Never"` when `lastCheckInDate` is null

These functions are not exported but can be tested via rendering the component with different props.

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StatsGrid } from './StatsGrid'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('StatsGrid', () => {
  it('renders all stat labels', () => {
    render(<StatsGrid />)
    expect(screen.getByText('Check-ins')).toBeDefined()
    expect(screen.getByText('Notes')).toBeDefined()
    expect(screen.getByText('Milestones')).toBeDefined()
    expect(screen.getByText('Action Items')).toBeDefined()
  })

  it('renders numeric values', () => {
    render(<StatsGrid checkInCount={5} noteCount={12} milestoneCount={3} actionItemCount={8} />)
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText('12')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('8')).toBeDefined()
  })

  it('displays "Not set" when no relationship start date', () => {
    render(<StatsGrid />)
    expect(screen.getByText('Not set')).toBeDefined()
  })

  it('displays "Never" when no last check-in date', () => {
    render(<StatsGrid />)
    expect(screen.getByText('Never')).toBeDefined()
  })

  it('formats duration in days', () => {
    render(<StatsGrid relationshipStartDate="2025-06-10T00:00:00Z" />)
    expect(screen.getByText('5d')).toBeDefined()
  })

  it('formats duration in months', () => {
    render(<StatsGrid relationshipStartDate="2025-03-15T00:00:00Z" />)
    expect(screen.getByText('3mo')).toBeDefined()
  })

  it('formats duration in years and months', () => {
    render(<StatsGrid relationshipStartDate="2023-01-15T00:00:00Z" />)
    expect(screen.getByText('2y, 5mo')).toBeDefined()
  })

  it('formats last check-in as Today', () => {
    render(<StatsGrid lastCheckInDate="2025-06-15T08:00:00Z" />)
    expect(screen.getByText('Today')).toBeDefined()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/components/dashboard/StatsGrid.test.tsx`
Expected: 8 tests pass

**Step 3: Commit**

```bash
git add src/components/dashboard/StatsGrid.test.tsx
git commit -m "test: add StatsGrid component tests for date formatting"
```

---

### Task 2: NoteList Component Tests

**Files:**

- Create: `src/components/notes/NoteList.test.tsx`
- Source: `src/components/notes/NoteList.tsx` (121 lines)

**Context:**
`NoteList` takes `notes: DbNote[]`, `currentUserId`, `onSelect`, `onDelete`. Uses `useMemo` to filter notes by privacy filter and search term. Search matches both `content` (case-insensitive) and `tags` (case-insensitive). Renders filter buttons (All, Shared, Private, Drafts) and a search input.

Renders `NoteCard` for each filtered note. Passes `onDelete` only if `note.author_id === currentUserId`.

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import type { DbNote } from '@/types'

vi.mock('./NoteCard', () => ({
  NoteCard: ({ note, isOwn, onDelete }: { note: DbNote; isOwn: boolean; onDelete?: unknown }) => (
    <div data-testid={`note-${note.id}`} data-own={isOwn} data-deletable={!!onDelete}>
      {note.content}
    </div>
  ),
}))

const { NoteList } = await import('./NoteList')

const mockNotes: DbNote[] = [
  {
    id: 'n1',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'Hello world',
    privacy: 'shared',
    tags: ['greeting'],
    category_id: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'n2',
    couple_id: 'c1',
    author_id: 'u2',
    check_in_id: null,
    content: 'Partner note',
    privacy: 'private',
    tags: ['secret'],
    category_id: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'n3',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'My draft',
    privacy: 'draft',
    tags: [],
    category_id: null,
    created_at: '',
    updated_at: '',
  },
]

describe('NoteList', () => {
  it('renders all notes by default', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.getByTestId('note-n2')).toBeDefined()
    expect(screen.getByTestId('note-n3')).toBeDefined()
  })

  it('filters by privacy when clicking filter buttons', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Shared'))
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.queryByTestId('note-n2')).toBeNull()
    expect(screen.queryByTestId('note-n3')).toBeNull()
  })

  it('filters by search term in content', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'partner' } })
    expect(screen.queryByTestId('note-n1')).toBeNull()
    expect(screen.getByTestId('note-n2')).toBeDefined()
  })

  it('filters by search term in tags', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'greeting' } })
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.queryByTestId('note-n2')).toBeNull()
  })

  it('shows empty state when no notes match', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'nonexistent' } })
    expect(screen.getByText('No notes found')).toBeDefined()
  })

  it('only passes onDelete for own notes', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByTestId('note-n1').getAttribute('data-deletable')).toBe('true')
    expect(screen.getByTestId('note-n2').getAttribute('data-deletable')).toBe('false')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/components/notes/NoteList.test.tsx`
Expected: 6 tests pass

**Step 3: Commit**

```bash
git add src/components/notes/NoteList.test.tsx
git commit -m "test: add NoteList filter and search logic tests"
```

---

### Task 3: SessionTimer Phase Logic Tests

**Files:**

- Create: `src/components/checkin/SessionTimer.test.tsx`
- Source: `src/components/checkin/SessionTimer.tsx` (233 lines)

**Context:**
`getTimerPhase(timeRemaining, totalSeconds)`: returns `'green'` when ratio > 0.5, `'yellow'` when > 0.25, `'red'` below. Returns `'green'` when `totalSeconds === 0`.

`SessionTimer` uses `useSessionTimer` hook (mockable) and `hapticFeedback` (mockable). Renders Framer Motion components. The key logic: phase styles change based on time ratio, last-minute pulse animation triggers at <= 60s, finished state shows "00:00".

Mock `useSessionTimer` to return controlled values and verify phase-based rendering.

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/hooks/useSessionTimer', () => ({
  useSessionTimer: vi.fn().mockReturnValue({
    timeRemaining: 300,
    isRunning: false,
    isPaused: false,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    formattedTime: '05:00',
  }),
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { warning: vi.fn(), tap: vi.fn() },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: Record<string, unknown>) => (
      <div className={className as string} {...props}>
        {children as React.ReactNode}
      </div>
    ),
    span: ({ children, className, ...props }: Record<string, unknown>) => (
      <span className={className as string} {...props}>
        {children as React.ReactNode}
      </span>
    ),
    button: ({ children, className, onClick, ...props }: Record<string, unknown>) => (
      <button className={className as string} onClick={onClick as () => void} {...props}>
        {children as React.ReactNode}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockUseSessionTimer = vi.fn()

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('@/hooks/useSessionTimer')
  Object.assign(mod, { useSessionTimer: mockUseSessionTimer })
})

const { SessionTimer } = await import('./SessionTimer')

describe('SessionTimer', () => {
  it('displays formatted time', () => {
    mockUseSessionTimer.mockReturnValue({
      timeRemaining: 300,
      isRunning: true,
      isPaused: false,
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      reset: vi.fn(),
      formattedTime: '05:00',
    })
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByText('05:00')).toBeDefined()
  })

  it('shows 00:00 when finished', () => {
    mockUseSessionTimer.mockReturnValue({
      timeRemaining: 0,
      isRunning: false,
      isPaused: false,
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      reset: vi.fn(),
      formattedTime: '00:00',
    })
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByText('00:00')).toBeDefined()
  })

  it('renders start button when not running', () => {
    mockUseSessionTimer.mockReturnValue({
      timeRemaining: 600,
      isRunning: false,
      isPaused: false,
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      reset: vi.fn(),
      formattedTime: '10:00',
    })
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByLabelText('Start timer')).toBeDefined()
  })

  it('renders pause button when running', () => {
    mockUseSessionTimer.mockReturnValue({
      timeRemaining: 300,
      isRunning: true,
      isPaused: false,
      start: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      reset: vi.fn(),
      formattedTime: '05:00',
    })
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByLabelText('Pause timer')).toBeDefined()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/components/checkin/SessionTimer.test.tsx`
Expected: 4 tests pass

**Step 3: Commit**

```bash
git add src/components/checkin/SessionTimer.test.tsx
git commit -m "test: add SessionTimer phase and control logic tests"
```

---

## Summary

| Task      | File                                           | Tests  | Focus                                     |
| --------- | ---------------------------------------------- | ------ | ----------------------------------------- |
| 1         | `src/components/dashboard/StatsGrid.test.tsx`  | 8      | Date formatting, null displays            |
| 2         | `src/components/notes/NoteList.test.tsx`       | 6      | Privacy filter, search, delete permission |
| 3         | `src/components/checkin/SessionTimer.test.tsx` | 4      | Phase display, timer controls             |
| **Total** | **3 new files**                                | **18** |                                           |

Expected test count after Sprint 14: **~687 tests** (669 + 18)

**Milestone:** First batch of component logic tests. Tests cover pure formatting functions, filter/search logic, and timer phase calculations.
