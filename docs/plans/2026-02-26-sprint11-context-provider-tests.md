# Sprint 11: Context Provider Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for the 3 remaining untested context providers — SessionSettingsContext, LoveLanguagesContext, and CheckInContext. Completing this sprint means 100% of `src/contexts/` and `src/hooks/` files have test coverage. ~24 new tests bringing total to ~635.

**Architecture:** Each provider needs `createClient` mock, `useRealtimeCouple` mock, and operation module mocks. Use `renderHook` with JSX wrapper. Follow the pattern from `BookendsContext.test.tsx`. Split CheckInContext into 2 files (queries + mutations) to stay under 150-line limit.

**Tech Stack:** Vitest + @testing-library/react

---

### Task 1: SessionSettingsContext Tests

**Files:**

- Create: `src/contexts/SessionSettingsContext.test.tsx`
- Source: `src/contexts/SessionSettingsContext.tsx` (315 lines)

**Context:**
`SessionSettingsProvider` takes `coupleId`, loads settings from `session_settings` table and pending proposals from `session_settings_proposals` table on mount. `useSessionSettings()` returns `{ currentSettings, templates, pendingProposal, proposeSettings, respondToProposal, applyTemplate, getActiveSettings }`.

Key behaviors to test:

- `useSessionSettings` throws outside provider
- Provider loads default settings when none exist in DB
- Provider loads settings from DB when they exist
- `getActiveSettings()` returns defaults when no settings loaded
- `templates` returns the 3 default templates (quick, standard, deep-dive)
- Provider handles load error gracefully (falls back to defaults)

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })

const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
        maybeSingle: mockMaybeSingle,
      }),
    }),
  }),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
  },
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

const { SessionSettingsProvider, useSessionSettings } = await import('./SessionSettingsContext')

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return <SessionSettingsProvider coupleId="couple-1">{children}</SessionSettingsProvider>
}

beforeEach(() => {
  vi.clearAllMocks()
  mockMaybeSingle.mockResolvedValue({ data: null, error: null })
  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
        maybeSingle: mockMaybeSingle,
      }),
    }),
  })
})

describe('useSessionSettings', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useSessionSettings())).toThrow(
      'useSessionSettings must be used within a SessionSettingsProvider',
    )
  })

  it('returns 3 templates', () => {
    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    expect(result.current.templates).toHaveLength(3)
    expect(result.current.templates.map((t) => t.type)).toEqual(['quick', 'standard', 'deep-dive'])
  })

  it('returns default settings via getActiveSettings when no DB settings', async () => {
    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings).not.toBeNull()
    })
    const settings = result.current.getActiveSettings()
    expect(settings.sessionDuration).toBe(10)
    expect(settings.coupleId).toBe('couple-1')
  })

  it('loads settings from DB when available', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 'ss-1',
        couple_id: 'couple-1',
        session_duration: 20,
        timeouts_per_partner: 2,
        timeout_duration: 3,
        turn_based_mode: true,
        turn_duration: 120,
        allow_extensions: true,
        warm_up_questions: true,
        cool_down_time: 5,
        pause_notifications: false,
        auto_save_drafts: true,
        version: 3,
        agreed_by: ['user-1', 'user-2'],
      },
      error: null,
    })

    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings?.sessionDuration).toBe(20)
    })
    expect(result.current.currentSettings?.warmUpQuestions).toBe(true)
  })

  it('falls back to defaults on load error', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings).not.toBeNull()
    })
    expect(result.current.currentSettings?.sessionDuration).toBe(10)
  })

  it('pendingProposal is null initially', async () => {
    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings).not.toBeNull()
    })
    expect(result.current.pendingProposal).toBeNull()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/contexts/SessionSettingsContext.test.tsx`
Expected: 6 tests pass

**Step 3: Commit**

```bash
git add src/contexts/SessionSettingsContext.test.tsx
git commit -m "test: add SessionSettingsContext provider tests"
```

---

### Task 2: LoveLanguagesContext Tests

**Files:**

- Create: `src/contexts/LoveLanguagesContext.test.tsx`
- Source: `src/contexts/LoveLanguagesContext.tsx` (174 lines)

**Context:**
`LoveLanguagesProvider` takes `coupleId` and `userId`, loads languages, actions, and discoveries on mount via `fetchLanguages`, `fetchActions`, `fetchDiscoveries`. Delegates CRUD to `useLoveLanguageCrud`. Filters `languages` into `myLanguages` (userId matches) and `partnerLanguages` (different userId + shared privacy). Sets up 3 realtime subscriptions.

Key behaviors to test:

- `useLoveLanguages` throws outside provider
- Provider starts with isLoading true
- Provider finishes loading with data
- Filters languages correctly (my vs partner)
- Exposes CRUD methods from useLoveLanguageCrud

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

const mockFetchLanguages = vi.fn().mockResolvedValue([])
const mockFetchActions = vi.fn().mockResolvedValue([])
vi.mock('@/lib/love-language-operations', () => ({
  mapDbLanguage: vi.fn(),
  mapDbAction: vi.fn(),
  fetchLanguages: (...args: unknown[]) => mockFetchLanguages(...args),
  fetchActions: (...args: unknown[]) => mockFetchActions(...args),
}))

const mockFetchDiscoveries = vi.fn().mockResolvedValue([])
vi.mock('@/lib/love-language-discovery-operations', () => ({
  mapDbDiscovery: vi.fn(),
  fetchDiscoveries: (...args: unknown[]) => mockFetchDiscoveries(...args),
}))

vi.mock('./useLoveLanguageCrud', () => ({
  useLoveLanguageCrud: vi.fn().mockReturnValue({
    addLanguage: vi.fn(),
    updateLanguage: vi.fn(),
    deleteLanguage: vi.fn(),
    toggleLanguagePrivacy: vi.fn(),
    addAction: vi.fn(),
    updateAction: vi.fn(),
    deleteAction: vi.fn(),
    completeAction: vi.fn(),
    addDiscovery: vi.fn(),
    deleteDiscovery: vi.fn(),
    convertToLanguage: vi.fn(),
  }),
}))

const { LoveLanguagesProvider, useLoveLanguages } = await import('./LoveLanguagesContext')

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <LoveLanguagesProvider coupleId="couple-1" userId="user-1">
      {children}
    </LoveLanguagesProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchLanguages.mockResolvedValue([])
  mockFetchActions.mockResolvedValue([])
  mockFetchDiscoveries.mockResolvedValue([])
})

describe('useLoveLanguages', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useLoveLanguages())).toThrow(
      'useLoveLanguages must be used within LoveLanguagesProvider',
    )
  })

  it('starts with isLoading true', () => {
    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('finishes loading with empty arrays', async () => {
    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.languages).toEqual([])
    expect(result.current.actions).toEqual([])
    expect(result.current.discoveries).toEqual([])
  })

  it('filters my languages from partner languages', async () => {
    mockFetchLanguages.mockResolvedValue([
      { id: 'l1', userId: 'user-1', privacy: 'shared', name: 'Mine' },
      { id: 'l2', userId: 'user-2', privacy: 'shared', name: 'Partner' },
      { id: 'l3', userId: 'user-2', privacy: 'private', name: 'PartnerPrivate' },
    ])

    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.languages).toHaveLength(1)
    expect(result.current.languages[0].name).toBe('Mine')
    expect(result.current.partnerLanguages).toHaveLength(1)
    expect(result.current.partnerLanguages[0].name).toBe('Partner')
  })

  it('exposes CRUD methods from useLoveLanguageCrud', async () => {
    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(typeof result.current.addLanguage).toBe('function')
    expect(typeof result.current.deleteAction).toBe('function')
    expect(typeof result.current.convertToLanguage).toBe('function')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/contexts/LoveLanguagesContext.test.tsx`
Expected: 5 tests pass

**Step 3: Commit**

```bash
git add src/contexts/LoveLanguagesContext.test.tsx
git commit -m "test: add LoveLanguagesContext provider tests"
```

---

### Task 3: CheckInContext — Query Tests

**Files:**

- Create: `src/contexts/CheckInContext-queries.test.tsx`
- Source: `src/contexts/CheckInContext.tsx` (lines 195-222, useCheckInQueries)

**Context:**
`useCheckInQueries` provides 4 pure query functions based on session state: `canGoToStep(step)` checks if step is reachable, `getStepIndex(step)` returns STEPS index, `isStepCompleted(step)` checks completedSteps, `getCurrentCategoryProgress()` returns first incomplete category. These run through the provider.

Also test basic provider behavior: `useCheckInContext` throws outside provider, provider starts with isLoading true, and loads without active session to null.

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

const mockFetchActiveCheckIn = vi.fn().mockResolvedValue({ data: null, error: null })
const mockFetchCheckInActionItems = vi.fn().mockResolvedValue({ data: [], error: null })

vi.mock('@/lib/checkin-operations', () => ({
  mapDbActionItem: vi.fn((item) => item),
  fetchActiveCheckIn: (...args: unknown[]) => mockFetchActiveCheckIn(...args),
  fetchCheckInActionItems: (...args: unknown[]) => mockFetchCheckInActionItems(...args),
  insertCheckIn: vi.fn().mockResolvedValue({ data: { id: 'ci-1' }, error: null }),
  updateCheckInStatus: vi.fn().mockResolvedValue({ error: null }),
  insertNote: vi.fn().mockResolvedValue({
    data: {
      id: 'n1',
      couple_id: 'c1',
      author_id: 'u1',
      check_in_id: null,
      content: '',
      privacy: 'draft',
      tags: [],
      category_id: null,
      created_at: '',
      updated_at: '',
    },
    error: null,
  }),
  updateNote: vi.fn().mockResolvedValue({ error: null }),
  deleteNote: vi.fn().mockResolvedValue({ error: null }),
  insertActionItem: vi.fn().mockResolvedValue({ error: null }),
  updateActionItemDb: vi.fn().mockResolvedValue({ error: null }),
  deleteActionItem: vi.fn().mockResolvedValue({ error: null }),
  toggleActionItemDb: vi.fn().mockResolvedValue({ error: null }),
}))

vi.stubGlobal('crypto', { randomUUID: () => 'uuid-test' })

const { CheckInProvider, useCheckInContext } = await import('./CheckInContext')

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <CheckInProvider coupleId="couple-1" userId="user-1">
      {children}
    </CheckInProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchActiveCheckIn.mockResolvedValue({ data: null, error: null })
})

describe('useCheckInContext', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useCheckInContext())).toThrow(
      'useCheckInContext must be used within a CheckInProvider',
    )
  })

  it('starts with isLoading true', () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('finishes loading with null session when no active check-in', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.session).toBeNull()
  })

  it('canGoToStep returns false when no session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.canGoToStep('welcome')).toBe(false)
  })

  it('getStepIndex returns correct index', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.getStepIndex('welcome')).toBe(0)
    expect(result.current.getStepIndex('completion')).toBe(6)
  })

  it('isStepCompleted returns false when no session', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.isStepCompleted('welcome')).toBe(false)
  })

  it('exposes coupleId from props', async () => {
    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.coupleId).toBe('couple-1')
  })

  it('loads active check-in from DB when available', async () => {
    mockFetchActiveCheckIn.mockResolvedValue({
      data: {
        id: 'ci-1',
        couple_id: 'couple-1',
        started_at: '2025-06-01T00:00:00Z',
        categories: ['communication'],
        mood_before: null,
        mood_after: null,
      },
      error: null,
    })

    const { result } = renderHook(() => useCheckInContext(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.session).not.toBeNull()
    expect(result.current.session?.id).toBe('ci-1')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/contexts/CheckInContext-queries.test.tsx`
Expected: 8 tests pass

**Step 3: Commit**

```bash
git add src/contexts/CheckInContext-queries.test.tsx
git commit -m "test: add CheckInContext provider and query tests"
```

---

## Summary

| Task      | File                                           | Tests  | Focus                                           |
| --------- | ---------------------------------------------- | ------ | ----------------------------------------------- |
| 1         | `src/contexts/SessionSettingsContext.test.tsx` | 6      | Templates, default/DB settings, error fallback  |
| 2         | `src/contexts/LoveLanguagesContext.test.tsx`   | 5      | Loading, filtering, CRUD delegation             |
| 3         | `src/contexts/CheckInContext-queries.test.tsx` | 8      | Provider init, queries, active check-in loading |
| **Total** | **3 new files**                                | **19** |                                                 |

Expected test count after Sprint 11: **~630 tests** (611 + 19)

**Milestone:** After this sprint, 100% of `src/contexts/` and `src/hooks/` files have test coverage. Only components remain untested.
