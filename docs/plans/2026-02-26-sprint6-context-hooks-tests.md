# Sprint 6: Context Providers & Remaining Hook Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for untested hooks (`useCountUp`, `useLoveLanguageCrud`) and the `BookendsContext` provider, bringing total coverage to ~535 tests.

**Architecture:** Test pure hooks via `renderHook`, mock imported DB operations for CRUD hooks, mock Supabase client for context providers. Split test files to stay under 150-line ESLint `max-lines-per-function` limit.

**Tech Stack:** Vitest, @testing-library/react, vi.mock, vi.fn, fake timers

---

### Task 1: useCountUp Hook Tests

**Files:**

- Create: `src/hooks/useCountUp.test.ts`
- Source: `src/hooks/useCountUp.ts` (40 lines)

**Context:**
`useCountUp(target, duration)` uses `requestAnimationFrame` to animate from 0 to `target` over `duration` ms with ease-out cubic easing. Returns current animated value.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountUp } from '@/hooks/useCountUp'

describe('useCountUp', () => {
  let rafCallbacks: ((time: number) => void)[]
  let rafId: number

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts at 0', () => {
    const { result } = renderHook(() => useCountUp(100, 1000))
    expect(result.current).toBe(0)
  })

  it('reaches target value when animation completes', () => {
    const { result } = renderHook(() => useCountUp(100, 1000))

    // Simulate animation completing (progress = 1.0)
    ;(performance.now as ReturnType<typeof vi.fn>).mockReturnValue(1000)
    act(() => {
      rafCallbacks.forEach((cb) => cb(1000))
    })

    expect(result.current).toBe(100)
  })

  it('shows intermediate value mid-animation', () => {
    const { result } = renderHook(() => useCountUp(100, 1000))

    // Simulate halfway through (progress = 0.5, eased = 1-(0.5^3) = 0.875)
    ;(performance.now as ReturnType<typeof vi.fn>).mockReturnValue(500)
    act(() => {
      rafCallbacks.forEach((cb) => cb(500))
    })

    expect(result.current).toBe(88) // Math.round(0.875 * 100)
  })

  it('cancels animation on unmount', () => {
    const { unmount } = renderHook(() => useCountUp(50, 500))
    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/hooks/useCountUp.test.ts`
Expected: 4 tests pass

**Step 3: Commit**

```bash
git add src/hooks/useCountUp.test.ts
git commit -m "test: add useCountUp hook unit tests"
```

---

### Task 2: useLoveLanguageCrud - Language Operations Tests

**Files:**

- Create: `src/contexts/useLoveLanguageCrud-languages.test.ts`
- Source: `src/contexts/useLoveLanguageCrud.ts` (lines 74-109 — addLanguage, updateLanguage, deleteLanguage, toggleLanguagePrivacy)

**Context:**
`useLoveLanguageCrud` is a custom hook that takes `{ coupleId, userId, languages, actions, setLanguages, setActions, setDiscoveries }` and returns 11 CRUD callbacks. Each callback calls an imported DB operation, then updates local state via the setter. We mock the DB operations and pass mock setters.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock all DB operations
vi.mock('@/lib/love-language-operations', () => ({
  insertLanguage: vi.fn(),
  updateLanguageDb: vi.fn(),
  deleteLanguageDb: vi.fn(),
  insertAction: vi.fn(),
  updateActionDb: vi.fn(),
  deleteActionDb: vi.fn(),
  completeActionDb: vi.fn(),
}))

vi.mock('@/lib/love-language-discovery-operations', () => ({
  insertDiscovery: vi.fn(),
  deleteDiscoveryDb: vi.fn(),
  convertDiscoveryToLanguage: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

import { insertLanguage, updateLanguageDb, deleteLanguageDb } from '@/lib/love-language-operations'
import { useLoveLanguageCrud } from './useLoveLanguageCrud'

function makeParams(overrides: Record<string, unknown> = {}) {
  return {
    coupleId: 'couple-1',
    userId: 'user-1',
    languages: [] as never[],
    actions: [] as never[],
    setLanguages: vi.fn(),
    setActions: vi.fn(),
    setDiscoveries: vi.fn(),
    ...overrides,
  }
}

describe('useLoveLanguageCrud - languages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addLanguage calls insertLanguage and prepends to state', async () => {
    const lang = { id: 'lang-1', title: 'Words' }
    vi.mocked(insertLanguage).mockResolvedValue(lang as never)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() =>
      result.current.addLanguage({
        title: 'Words',
        description: null,
        category: 'words_of_affirmation',
        privacy: 'shared',
        importance: 'high',
        examples: [],
        tags: [],
      }),
    )

    expect(insertLanguage).toHaveBeenCalledWith('couple-1', 'user-1', expect.objectContaining({ title: 'Words' }))
    expect(params.setLanguages).toHaveBeenCalled()
  })

  it('updateLanguage calls updateLanguageDb and updates state', async () => {
    vi.mocked(updateLanguageDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.updateLanguage('lang-1', { title: 'Updated' }))

    expect(updateLanguageDb).toHaveBeenCalledWith('lang-1', { title: 'Updated' })
    expect(params.setLanguages).toHaveBeenCalled()
  })

  it('deleteLanguage calls deleteLanguageDb and removes from state', async () => {
    vi.mocked(deleteLanguageDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteLanguage('lang-1'))

    expect(deleteLanguageDb).toHaveBeenCalledWith('lang-1')
    expect(params.setLanguages).toHaveBeenCalled()
  })

  it('toggleLanguagePrivacy switches private to shared', async () => {
    vi.mocked(updateLanguageDb).mockResolvedValue(undefined)
    const langs = [{ id: 'lang-1', privacy: 'private' }]
    const params = makeParams({ languages: langs })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.toggleLanguagePrivacy('lang-1'))

    expect(updateLanguageDb).toHaveBeenCalledWith('lang-1', { privacy: 'shared' })
  })

  it('toggleLanguagePrivacy no-ops for unknown id', async () => {
    const params = makeParams({ languages: [] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.toggleLanguagePrivacy('nonexistent'))

    expect(updateLanguageDb).not.toHaveBeenCalled()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/contexts/useLoveLanguageCrud-languages.test.ts`
Expected: 5 tests pass

**Step 3: Commit**

```bash
git add src/contexts/useLoveLanguageCrud-languages.test.ts
git commit -m "test: add useLoveLanguageCrud language operation tests"
```

---

### Task 3: useLoveLanguageCrud - Actions & Discovery Tests

**Files:**

- Create: `src/contexts/useLoveLanguageCrud-actions.test.ts`
- Source: `src/contexts/useLoveLanguageCrud.ts` (lines 111-195 — addAction, updateAction, deleteAction, completeAction, addDiscovery, deleteDiscovery, convertToLanguage)

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@/lib/love-language-operations', () => ({
  insertLanguage: vi.fn(),
  updateLanguageDb: vi.fn(),
  deleteLanguageDb: vi.fn(),
  insertAction: vi.fn(),
  updateActionDb: vi.fn(),
  deleteActionDb: vi.fn(),
  completeActionDb: vi.fn(),
}))

vi.mock('@/lib/love-language-discovery-operations', () => ({
  insertDiscovery: vi.fn(),
  deleteDiscoveryDb: vi.fn(),
  convertDiscoveryToLanguage: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
  }),
}))

import { insertAction, updateActionDb, deleteActionDb, completeActionDb } from '@/lib/love-language-operations'
import {
  insertDiscovery,
  deleteDiscoveryDb,
  convertDiscoveryToLanguage,
} from '@/lib/love-language-discovery-operations'
import { useLoveLanguageCrud } from './useLoveLanguageCrud'

function makeParams(overrides: Record<string, unknown> = {}) {
  return {
    coupleId: 'couple-1',
    userId: 'user-1',
    languages: [] as never[],
    actions: [] as never[],
    setLanguages: vi.fn(),
    setActions: vi.fn(),
    setDiscoveries: vi.fn(),
    ...overrides,
  }
}

describe('useLoveLanguageCrud - actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addAction calls insertAction and prepends to state', async () => {
    const action = { id: 'act-1', title: 'Hug daily' }
    vi.mocked(insertAction).mockResolvedValue(action as never)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() =>
      result.current.addAction({
        linkedLanguageId: null,
        title: 'Hug daily',
        description: null,
        status: 'active',
        frequency: 'daily',
        difficulty: 'easy',
      }),
    )

    expect(insertAction).toHaveBeenCalledWith('couple-1', expect.objectContaining({ title: 'Hug daily' }))
    expect(params.setActions).toHaveBeenCalled()
  })

  it('deleteAction calls deleteActionDb and removes from state', async () => {
    vi.mocked(deleteActionDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteAction('act-1'))

    expect(deleteActionDb).toHaveBeenCalledWith('act-1')
    expect(params.setActions).toHaveBeenCalled()
  })

  it('completeAction increments count and sets status', async () => {
    vi.mocked(completeActionDb).mockResolvedValue(undefined)
    const actions = [{ id: 'act-1', completedCount: 2 }]
    const params = makeParams({ actions })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.completeAction('act-1'))

    expect(completeActionDb).toHaveBeenCalledWith('act-1', 2)
    expect(params.setActions).toHaveBeenCalled()
  })

  it('completeAction no-ops for unknown id', async () => {
    const params = makeParams({ actions: [] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.completeAction('nonexistent'))

    expect(completeActionDb).not.toHaveBeenCalled()
  })
})

describe('useLoveLanguageCrud - discoveries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addDiscovery calls insertDiscovery and prepends to state', async () => {
    const disc = { id: 'disc-1', discovery: 'They love notes' }
    vi.mocked(insertDiscovery).mockResolvedValue(disc as never)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.addDiscovery({ discovery: 'They love notes' }))

    expect(insertDiscovery).toHaveBeenCalledWith('couple-1', 'user-1', { discovery: 'They love notes' })
    expect(params.setDiscoveries).toHaveBeenCalled()
  })

  it('deleteDiscovery calls deleteDiscoveryDb and removes from state', async () => {
    vi.mocked(deleteDiscoveryDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteDiscovery('disc-1'))

    expect(deleteDiscoveryDb).toHaveBeenCalledWith('disc-1')
    expect(params.setDiscoveries).toHaveBeenCalled()
  })

  it('convertToLanguage creates language and links discovery', async () => {
    const lang = { id: 'lang-new', title: 'Words' }
    const updated = { id: 'disc-1', convertedLanguageId: 'lang-new' }
    const { insertLanguage } = await import('@/lib/love-language-operations')
    vi.mocked(insertLanguage).mockResolvedValue(lang as never)
    vi.mocked(convertDiscoveryToLanguage).mockResolvedValue(updated as never)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() =>
      result.current.convertToLanguage('disc-1', {
        title: 'Words',
        description: null,
        category: 'words_of_affirmation',
        privacy: 'shared',
        importance: 'high',
        examples: [],
        tags: [],
      }),
    )

    expect(insertLanguage).toHaveBeenCalled()
    expect(convertDiscoveryToLanguage).toHaveBeenCalledWith('disc-1', 'lang-new')
    expect(params.setLanguages).toHaveBeenCalled()
    expect(params.setDiscoveries).toHaveBeenCalled()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/contexts/useLoveLanguageCrud-actions.test.ts`
Expected: 7 tests pass

**Step 3: Commit**

```bash
git add src/contexts/useLoveLanguageCrud-actions.test.ts
git commit -m "test: add useLoveLanguageCrud action and discovery tests"
```

---

### Task 4: BookendsContext Provider Tests

**Files:**

- Create: `src/contexts/BookendsContext.test.tsx`
- Source: `src/contexts/BookendsContext.tsx` (257 lines)

**Context:**
`BookendsProvider` wraps children with context providing topic management (add/remove/reorder), reflection saving, and modal state. It loads last reflection data from Supabase on mount. We mock the Supabase client, render the provider, and test callbacks via the `useBookends()` hook.

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { PreparationTopic } from '@/types/bookends'

const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

// Stub crypto.randomUUID for deterministic IDs
let uuidCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: () => `uuid-${++uuidCounter}`,
})

const { BookendsProvider, useBookends } = await import('./BookendsContext')

function wrapper({ children }: { children: ReactNode }) {
  return (
    <BookendsProvider coupleId="couple-1" userId="user-1">
      {children}
    </BookendsProvider>
  )
}

describe('BookendsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uuidCounter = 0
  })

  it('useBookends throws outside provider', () => {
    expect(() => renderHook(() => useBookends())).toThrow('useBookends must be used within BookendsProvider')
  })

  it('starts with null preparation and reflection', () => {
    const { result } = renderHook(() => useBookends(), { wrapper })
    expect(result.current.preparation).toBeNull()
    expect(result.current.reflection).toBeNull()
  })

  it('addMyTopic creates preparation and adds topic', () => {
    const { result } = renderHook(() => useBookends(), { wrapper })
    act(() => result.current.addMyTopic('Talk about work'))
    expect(result.current.preparation).not.toBeNull()
    expect(result.current.preparation!.myTopics).toHaveLength(1)
    expect(result.current.preparation!.myTopics[0].content).toBe('Talk about work')
    expect(result.current.preparation!.myTopics[0].authorId).toBe('user-1')
  })

  it('removeMyTopic removes the topic', () => {
    const { result } = renderHook(() => useBookends(), { wrapper })
    act(() => result.current.addMyTopic('Topic A'))
    const topicId = result.current.preparation!.myTopics[0].id
    act(() => result.current.removeMyTopic(topicId))
    expect(result.current.preparation!.myTopics).toHaveLength(0)
  })

  it('reorderMyTopics replaces topics array', () => {
    const { result } = renderHook(() => useBookends(), { wrapper })
    act(() => {
      result.current.addMyTopic('First')
      result.current.addMyTopic('Second')
    })
    const reordered = [...result.current.preparation!.myTopics].reverse()
    act(() => result.current.reorderMyTopics(reordered))
    expect(result.current.preparation!.myTopics[0].content).toBe('Second')
  })

  it('clearPreparation resets preparation to null', () => {
    const { result } = renderHook(() => useBookends(), { wrapper })
    act(() => result.current.addMyTopic('Topic'))
    expect(result.current.preparation).not.toBeNull()
    act(() => result.current.clearPreparation())
    expect(result.current.preparation).toBeNull()
  })

  it('openPreparationModal and closePreparationModal toggle state', () => {
    const { result } = renderHook(() => useBookends(), { wrapper })
    expect(result.current.isPreparationModalOpen).toBe(false)
    act(() => result.current.openPreparationModal())
    expect(result.current.isPreparationModalOpen).toBe(true)
    act(() => result.current.closePreparationModal())
    expect(result.current.isPreparationModalOpen).toBe(false)
  })

  it('openReflectionModal resets reflection and opens modal', () => {
    const { result } = renderHook(() => useBookends(), { wrapper })
    expect(result.current.isReflectionModalOpen).toBe(false)
    act(() => result.current.openReflectionModal())
    expect(result.current.isReflectionModalOpen).toBe(true)
    expect(result.current.reflection).toBeNull()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/contexts/BookendsContext.test.tsx`
Expected: 8 tests pass

**Step 3: Commit**

```bash
git add src/contexts/BookendsContext.test.tsx
git commit -m "test: add BookendsContext provider unit tests"
```

---

## Summary

| Task      | File                                                 | Tests  | Focus                      |
| --------- | ---------------------------------------------------- | ------ | -------------------------- |
| 1         | `src/hooks/useCountUp.test.ts`                       | 4      | Animation hook             |
| 2         | `src/contexts/useLoveLanguageCrud-languages.test.ts` | 5      | Language CRUD              |
| 3         | `src/contexts/useLoveLanguageCrud-actions.test.ts`   | 7      | Action + discovery CRUD    |
| 4         | `src/contexts/BookendsContext.test.tsx`              | 8      | Provider callbacks + state |
| **Total** | **4 new files**                                      | **24** |                            |

Expected test count after Sprint 6: **~533 tests** (509 + 24)
