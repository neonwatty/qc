# Sprint 5: Settings Sub-Action & useCategories Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit test coverage for the 5 untested settings server actions (`createCategory`, `updateCategory`, `toggleCategoryActive`, `updateCoupleSettings`, `exportUserData`) and the `useCategories` client hook.

**Architecture:** Tests follow the existing mock pattern in `settings/actions.test.ts` — mock `requireAuth`, use `createMockSupabaseClient()`, import via barrel file. The `useCategories` hook test uses the same pattern as `useRealtimeCouple.test.ts` — mock the Supabase client module and `renderHook`. All test-only, no source changes.

**Tech Stack:** Vitest, @testing-library/react (for hook tests), existing Supabase mock infrastructure

---

### Task 1: Unit — createCategory server action

**Files:**

- Modify: `src/app/(app)/settings/actions.test.ts`

**Step 1: Write the tests**

Add a new `describe('createCategory', ...)` block at the end of `src/app/(app)/settings/actions.test.ts`:

```typescript
describe('createCategory', () => {
  it('creates a category with valid data', async () => {
    const { createCategory } = await import('./actions')

    // Profile lookup: from('profiles').select().eq().single()
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    // Categories query for max sort_order: from('categories').select().eq().order().limit()
    mockSupabase._queryBuilder.limit = vi.fn().mockResolvedValue({
      data: [{ sort_order: 3 }],
      error: null,
    })

    // Insert: from('categories').insert()
    mockSupabase._queryBuilder.insert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    const fd = makeFormData({ name: 'New Category', description: 'A test category', icon: '🔥' })
    const result = await createCategory({}, fd)

    expect(result).toEqual({ success: true })
    expect(mockSupabase.from).toHaveBeenCalledWith('categories')
  })

  it('returns error when user has no couple', async () => {
    const { createCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const fd = makeFormData({ name: 'Test', icon: '💬' })
    const result = await createCategory({}, fd)

    expect(result.error).toBe('You must be in a couple to create categories')
  })

  it('returns error when name is empty', async () => {
    const { createCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const fd = makeFormData({ name: '', icon: '💬' })
    const result = await createCategory({}, fd)

    expect(result.error).toBeTruthy()
  })

  it('returns error on database failure', async () => {
    const { createCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.limit = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })
    mockSupabase._queryBuilder.insert = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Insert failed' },
    })

    const fd = makeFormData({ name: 'Test', icon: '💬' })
    const result = await createCategory({}, fd)

    expect(result.error).toBe('Insert failed')
  })

  it('uses default icon when none provided', async () => {
    const { createCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.limit = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })
    mockSupabase._queryBuilder.insert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    const fd = makeFormData({ name: 'No Icon Category' })
    const result = await createCategory({}, fd)

    expect(result).toEqual({ success: true })
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/\(app\)/settings/actions.test.ts`
Expected: All tests pass (existing + new).

**Step 3: Commit**

```bash
git add src/app/\(app\)/settings/actions.test.ts
git commit -m "test: add createCategory server action tests"
```

---

### Task 2: Unit — updateCategory server action

**Files:**

- Modify: `src/app/(app)/settings/actions.test.ts`

**Step 1: Write the tests**

Add a `describe('updateCategory', ...)` block:

```typescript
describe('updateCategory', () => {
  it('updates a category with valid data', async () => {
    const { updateCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    // Chain: from('categories').update().eq(id).eq(couple_id)
    // The last .eq() is terminal
    const updateBuilder = {
      eq: vi.fn().mockReturnThis(),
    }
    updateBuilder.eq = vi.fn().mockReturnValueOnce(updateBuilder).mockReturnValueOnce({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(updateBuilder)

    const fd = makeFormData({ name: 'Updated Name', description: 'Updated desc', icon: '✨' })
    const result = await updateCategory('cat-id-1', {}, fd)

    expect(result).toEqual({ success: true })
    expect(mockSupabase.from).toHaveBeenCalledWith('categories')
  })

  it('returns error when user has no couple', async () => {
    const { updateCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const fd = makeFormData({ name: 'Test', icon: '💬' })
    const result = await updateCategory('cat-id-1', {}, fd)

    expect(result.error).toBe('You must be in a couple to update categories')
  })

  it('returns error on database failure', async () => {
    const { updateCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const updateBuilder = {
      eq: vi.fn().mockReturnThis(),
    }
    updateBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce({ data: null, error: { message: 'Update failed' } })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(updateBuilder)

    const fd = makeFormData({ name: 'Valid', icon: '💬' })
    const result = await updateCategory('cat-id-1', {}, fd)

    expect(result.error).toBe('Update failed')
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/\(app\)/settings/actions.test.ts`
Expected: All pass.

**Step 3: Commit**

```bash
git add src/app/\(app\)/settings/actions.test.ts
git commit -m "test: add updateCategory server action tests"
```

---

### Task 3: Unit — toggleCategoryActive server action

**Files:**

- Modify: `src/app/(app)/settings/actions.test.ts`

**Step 1: Write the tests**

```typescript
describe('toggleCategoryActive', () => {
  it('activates a category', async () => {
    const { toggleCategoryActive } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const updateBuilder = {
      eq: vi.fn().mockReturnThis(),
    }
    updateBuilder.eq = vi.fn().mockReturnValueOnce(updateBuilder).mockReturnValueOnce({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(updateBuilder)

    const result = await toggleCategoryActive('cat-id-1', true)

    expect(result).toEqual({})
    expect(mockSupabase.from).toHaveBeenCalledWith('categories')
  })

  it('deactivates a category', async () => {
    const { toggleCategoryActive } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const updateBuilder = {
      eq: vi.fn().mockReturnThis(),
    }
    updateBuilder.eq = vi.fn().mockReturnValueOnce(updateBuilder).mockReturnValueOnce({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(updateBuilder)

    const result = await toggleCategoryActive('cat-id-1', false)

    expect(result).toEqual({})
  })

  it('returns error when user has no couple', async () => {
    const { toggleCategoryActive } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const result = await toggleCategoryActive('cat-id-1', true)

    expect(result.error).toBe('You must be in a couple to update categories')
  })

  it('returns error on database failure', async () => {
    const { toggleCategoryActive } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const updateBuilder = {
      eq: vi.fn().mockReturnThis(),
    }
    updateBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce({ data: null, error: { message: 'Toggle failed' } })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(updateBuilder)

    const result = await toggleCategoryActive('cat-id-1', true)

    expect(result.error).toBe('Toggle failed')
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/\(app\)/settings/actions.test.ts`
Expected: All pass.

**Step 3: Commit**

```bash
git add src/app/\(app\)/settings/actions.test.ts
git commit -m "test: add toggleCategoryActive server action tests"
```

---

### Task 4: Unit — updateCoupleSettings and exportUserData server actions

**Files:**

- Modify: `src/app/(app)/settings/actions.test.ts`

**Step 1: Write the tests**

Add mocks at the top for `data-export`:

```typescript
vi.mock('@/lib/data-export', () => ({
  exportUserData: vi.fn(),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))
vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(),
  shouldSendEmail: vi.fn(),
}))
```

Then add the describe blocks:

```typescript
describe('updateCoupleSettings', () => {
  it('updates a couple setting', async () => {
    const { updateCoupleSettings } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

    const result = await updateCoupleSettings('notifications_enabled', true)

    expect(result).toEqual({})
    expect(mockSupabase.rpc).toHaveBeenCalledWith('update_couple_setting', {
      p_couple_id: mockCoupleId,
      p_key: 'notifications_enabled',
      p_value: true,
    })
  })

  it('returns error when user has no couple', async () => {
    const { updateCoupleSettings } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const result = await updateCoupleSettings('key', true)

    expect(result.error).toBe('No couple found')
  })

  it('returns error on RPC failure', async () => {
    const { updateCoupleSettings } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })

    const result = await updateCoupleSettings('key', true)

    expect(result.error).toBe('RPC failed')
  })
})

describe('exportUserData', () => {
  it('exports user data successfully', async () => {
    const { exportUserData } = await import('./actions')
    const { exportUserData: mockExport } = await import('@/lib/data-export')

    const mockData = { version: '1.0.0', exportedAt: '2025-01-01', profile: { id: 'user-1' } }
    ;(mockExport as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockData, error: null })

    const result = await exportUserData()

    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('returns error when export fails', async () => {
    const { exportUserData } = await import('./actions')
    const { exportUserData: mockExport } = await import('@/lib/data-export')

    ;(mockExport as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null, error: 'Export failed' })

    const result = await exportUserData()

    expect(result.data).toBeNull()
    expect(result.error).toBe('Export failed')
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/\(app\)/settings/actions.test.ts`
Expected: All pass.

**Step 3: Commit**

```bash
git add src/app/\(app\)/settings/actions.test.ts
git commit -m "test: add updateCoupleSettings and exportUserData tests"
```

---

### Task 5: Unit — useCategories hook initial load and null coupleId

**Files:**

- Create: `src/hooks/useCategories.test.ts`

**Step 1: Write the test file**

Create `src/hooks/useCategories.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'

type RealtimeCallback = (payload: Record<string, unknown>) => void

let capturedOnInsert: RealtimeCallback | null = null
let capturedOnUpdate: RealtimeCallback | null = null
let capturedOnDelete: RealtimeCallback | null = null

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnValue({
      select: mockSelect,
    }),
  }),
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn().mockImplementation((opts: Record<string, unknown>) => {
    capturedOnInsert = (opts.onInsert as RealtimeCallback) ?? null
    capturedOnUpdate = (opts.onUpdate as RealtimeCallback) ?? null
    capturedOnDelete = (opts.onDelete as RealtimeCallback) ?? null
  }),
}))

const { useCategories } = await import('@/hooks/useCategories')

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedOnInsert = null
    capturedOnUpdate = null
    capturedOnDelete = null
    cleanup()
  })

  it('returns empty categories and loading=false when coupleId is null', async () => {
    const { result } = renderHook(() => useCategories(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.categories).toEqual([])
  })

  it('loads categories from Supabase on mount', async () => {
    const mockCategories = [
      {
        id: 'cat-1',
        couple_id: 'couple-abc',
        name: 'Communication',
        description: 'How we talk',
        icon: '💬',
        is_active: true,
        is_system: true,
        sort_order: 1,
        created_at: '2025-01-01',
      },
      {
        id: 'cat-2',
        couple_id: 'couple-abc',
        name: 'Quality Time',
        description: 'Spending time',
        icon: '⏰',
        is_active: true,
        is_system: true,
        sort_order: 2,
        created_at: '2025-01-01',
      },
    ]

    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValueOnce({ eq: mockEq }).mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: mockCategories, error: null })

    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.categories).toHaveLength(2)
    expect(result.current.categories[0].name).toBe('Communication')
    expect(result.current.categories[1].name).toBe('Quality Time')
  })

  it('handles Supabase error gracefully', async () => {
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValueOnce({ eq: mockEq }).mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: null, error: { message: 'Load failed' } })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.categories).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load categories:', expect.any(Object))
    consoleSpy.mockRestore()
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/hooks/useCategories.test.ts`
Expected: All 3 tests pass.

**Step 3: Commit**

```bash
git add src/hooks/useCategories.test.ts
git commit -m "test: add useCategories hook initial load and error tests"
```

---

### Task 6: Unit — useCategories hook realtime callbacks

**Files:**

- Modify: `src/hooks/useCategories.test.ts`

**Step 1: Write realtime callback tests**

Add a new describe block after the existing one:

```typescript
describe('useCategories - realtime callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedOnInsert = null
    capturedOnUpdate = null
    capturedOnDelete = null
    cleanup()

    // Default: load returns 1 category
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValueOnce({ eq: mockEq }).mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({
      data: [
        {
          id: 'cat-1',
          couple_id: 'couple-abc',
          name: 'Communication',
          description: null,
          icon: '💬',
          is_active: true,
          is_system: true,
          sort_order: 1,
          created_at: '2025-01-01',
        },
      ],
      error: null,
    })
  })

  it('adds a new category on INSERT (active only)', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.categories).toHaveLength(1)

    capturedOnInsert!({
      id: 'cat-new',
      couple_id: 'couple-abc',
      name: 'New Category',
      description: null,
      icon: '🔥',
      is_active: true,
      is_system: false,
      sort_order: 2,
      created_at: '2025-01-02',
    })

    await waitFor(() => expect(result.current.categories).toHaveLength(2))
    expect(result.current.categories[1].name).toBe('New Category')
  })

  it('ignores INSERT for inactive category', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    capturedOnInsert!({
      id: 'cat-inactive',
      couple_id: 'couple-abc',
      name: 'Inactive',
      description: null,
      icon: '🚫',
      is_active: false,
      is_system: false,
      sort_order: 99,
      created_at: '2025-01-02',
    })

    // Should still be 1
    expect(result.current.categories).toHaveLength(1)
  })

  it('updates a category on UPDATE', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    capturedOnUpdate!({
      id: 'cat-1',
      couple_id: 'couple-abc',
      name: 'Updated Communication',
      description: 'New desc',
      icon: '🗣️',
      is_active: true,
      is_system: true,
      sort_order: 1,
      created_at: '2025-01-01',
    })

    await waitFor(() => expect(result.current.categories[0].name).toBe('Updated Communication'))
  })

  it('removes category on UPDATE when deactivated', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.categories).toHaveLength(1)

    capturedOnUpdate!({
      id: 'cat-1',
      couple_id: 'couple-abc',
      name: 'Communication',
      description: null,
      icon: '💬',
      is_active: false,
      is_system: true,
      sort_order: 1,
      created_at: '2025-01-01',
    })

    await waitFor(() => expect(result.current.categories).toHaveLength(0))
  })

  it('removes a category on DELETE', async () => {
    const { result } = renderHook(() => useCategories('couple-abc'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.categories).toHaveLength(1)

    capturedOnDelete!({ id: 'cat-1' })

    await waitFor(() => expect(result.current.categories).toHaveLength(0))
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/hooks/useCategories.test.ts`
Expected: All 8 tests pass (3 from Task 5 + 5 new).

**Step 3: Commit**

```bash
git add src/hooks/useCategories.test.ts
git commit -m "test: add useCategories realtime callback tests"
```

---

## Summary

| Task | Type | File                          | Tests Added                               |
| ---- | ---- | ----------------------------- | ----------------------------------------- |
| 1    | Unit | `settings/actions.test.ts`    | 5 (createCategory)                        |
| 2    | Unit | `settings/actions.test.ts`    | 3 (updateCategory)                        |
| 3    | Unit | `settings/actions.test.ts`    | 4 (toggleCategoryActive)                  |
| 4    | Unit | `settings/actions.test.ts`    | 5 (updateCoupleSettings + exportUserData) |
| 5    | Unit | `hooks/useCategories.test.ts` | 3 (initial load + error)                  |
| 6    | Unit | `hooks/useCategories.test.ts` | 5 (realtime callbacks)                    |

**Total: 25 new tests across 2 files**

## Notes for implementer

- **Existing test file is 205 lines.** The `settings/actions.test.ts` file will grow significantly. If `max-lines-per-function` lint rule triggers, split into two describe groups in separate files or split the existing `beforeEach` + mock setup into a shared setup module.
- **Mock chain complexity.** The `updateCategory` and `toggleCategoryActive` actions use `.eq(id).eq(couple_id)` double-eq chains. The mock must handle both `.eq()` calls — first returns builder, second returns terminal `{ data, error }`.
- **`useCategories` mock strategy.** The hook calls `createClient()` directly (not via import), so mock `@/lib/supabase/client` at module level. The `useRealtimeCouple` hook is mocked entirely — we capture its callbacks and invoke them manually.
- **No source changes needed.** This is test-only. If tests fail, the mock chain is wrong — never modify source to make mocks work.
- **`max-lines-per-function` rule (150 lines).** Keep each describe block under 100 lines. The settings test file already has 205 lines; adding ~120 more will push it to ~325. You MUST split into multiple describe blocks or separate test files to avoid the lint error. Recommended: create `src/app/(app)/settings/actions-categories.test.ts` for category tests and `src/app/(app)/settings/actions-couple.test.ts` for couple settings + export tests, sharing the mock setup pattern.
