# Sprint 9: Haptics, Chart Data, Discovery Ops & Server Action Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for haptic feedback utilities, chart data, love language discovery operations, and remaining server actions (proposals + profile). ~30 new tests bringing total to ~538.

**Architecture:** Haptics tests mock `navigator.vibrate` and `isNativePlatform`. Chart data and discovery ops take supabase as a parameter or use `createClient` mock. Server action tests follow established `createMockSupabaseClient` + `vi.mock` patterns. Split haptics into 2 files to stay under 150-line limit.

**Tech Stack:** Vitest

---

### Task 1: Haptics — Core Functions Tests

**Files:**

- Create: `src/lib/haptics.test.ts`
- Source: `src/lib/haptics.ts` (lines 1-105)

**Context:**
`isHapticSupported()` checks for native platform or navigator.vibrate. `triggerHaptic(intensity)` triggers vibration with pattern from `HAPTIC_PATTERNS`. `triggerHapticPattern(pattern)` triggers with custom pattern. All check `isHapticSupported()` first. On web, they use `navigator.vibrate`. The `HAPTIC_PATTERNS` constant defines numeric patterns for each feedback type.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/capacitor', () => ({
  isNativePlatform: vi.fn(() => false),
}))

const { isHapticSupported, triggerHaptic, triggerHapticPattern, HAPTIC_PATTERNS } = await import('./haptics')

describe('HAPTIC_PATTERNS', () => {
  it('defines numeric patterns for all intensities', () => {
    expect(typeof HAPTIC_PATTERNS.light).toBe('number')
    expect(typeof HAPTIC_PATTERNS.medium).toBe('number')
    expect(typeof HAPTIC_PATTERNS.heavy).toBe('number')
  })

  it('defines array patterns for compound feedback', () => {
    expect(Array.isArray(HAPTIC_PATTERNS.success)).toBe(true)
    expect(Array.isArray(HAPTIC_PATTERNS.error)).toBe(true)
    expect(Array.isArray(HAPTIC_PATTERNS.checkInComplete)).toBe(true)
  })
})

describe('isHapticSupported', () => {
  const originalNavigator = globalThis.navigator

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true })
  })

  it('returns true when navigator.vibrate exists', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vi.fn() },
      configurable: true,
    })
    expect(isHapticSupported()).toBe(true)
  })

  it('returns false when navigator.vibrate does not exist', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      configurable: true,
    })
    expect(isHapticSupported()).toBe(false)
  })
})

describe('triggerHaptic', () => {
  let vibrateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vibrateMock = vi.fn()
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls navigator.vibrate with the correct pattern for light', () => {
    triggerHaptic('light')
    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.light)
  })

  it('calls navigator.vibrate with the correct pattern for medium', () => {
    triggerHaptic('medium')
    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.medium)
  })

  it('calls navigator.vibrate with the correct pattern for heavy', () => {
    triggerHaptic('heavy')
    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.heavy)
  })
})

describe('triggerHapticPattern', () => {
  let vibrateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vibrateMock = vi.fn()
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls navigator.vibrate with a custom number pattern', () => {
    triggerHapticPattern(100)
    expect(vibrateMock).toHaveBeenCalledWith(100)
  })

  it('calls navigator.vibrate with a custom array pattern', () => {
    triggerHapticPattern([50, 100, 50])
    expect(vibrateMock).toHaveBeenCalledWith([50, 100, 50])
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/haptics.test.ts`
Expected: 10 tests pass

**Step 3: Commit**

```bash
git add src/lib/haptics.test.ts
git commit -m "test: add haptic feedback core function tests"
```

---

### Task 2: Haptics — Feedback Helpers & HOF Tests

**Files:**

- Create: `src/lib/haptics-helpers.test.ts`
- Source: `src/lib/haptics.ts` (lines 136-215)

**Context:**
`hapticFeedback` is a constant object with methods like `.tap()`, `.success()`, `.error()` etc. that call `triggerHaptic` or `triggerNotification` internally. `withHaptic(handler, intensity)` wraps a handler to trigger haptic first. `createHapticHandler(handler, intensity)` does the same for event handlers. `useHapticFeedback()` returns an object with `isSupported`, `trigger`, `triggerPattern`, and `feedback`.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/capacitor', () => ({
  isNativePlatform: vi.fn(() => false),
}))

const { hapticFeedback, withHaptic, createHapticHandler, useHapticFeedback } = await import('./haptics')

describe('hapticFeedback', () => {
  let vibrateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vibrateMock = vi.fn()
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tap triggers vibration', () => {
    hapticFeedback.tap()
    expect(vibrateMock).toHaveBeenCalled()
  })

  it('success triggers vibration', () => {
    hapticFeedback.success()
    expect(vibrateMock).toHaveBeenCalled()
  })

  it('error triggers vibration', () => {
    hapticFeedback.error()
    expect(vibrateMock).toHaveBeenCalled()
  })

  it('checkInComplete triggers vibration', () => {
    hapticFeedback.checkInComplete()
    expect(vibrateMock).toHaveBeenCalled()
  })
})

describe('withHaptic', () => {
  let vibrateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vibrateMock = vi.fn()
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls the original handler and triggers haptic', () => {
    const handler = vi.fn(() => 'result')
    const wrapped = withHaptic(handler, 'medium')
    const result = wrapped()
    expect(handler).toHaveBeenCalled()
    expect(vibrateMock).toHaveBeenCalled()
    expect(result).toBe('result')
  })
})

describe('createHapticHandler', () => {
  let vibrateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vibrateMock = vi.fn()
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('wraps event handler with haptic feedback', () => {
    const handler = vi.fn()
    const wrapped = createHapticHandler(handler, 'light')
    const mockEvent = new Event('click')
    wrapped(mockEvent)
    expect(handler).toHaveBeenCalledWith(mockEvent)
    expect(vibrateMock).toHaveBeenCalled()
  })
})

describe('useHapticFeedback', () => {
  it('returns isSupported, trigger, triggerPattern, and feedback', () => {
    const result = useHapticFeedback()
    expect(result).toHaveProperty('isSupported')
    expect(result).toHaveProperty('trigger')
    expect(result).toHaveProperty('triggerPattern')
    expect(result).toHaveProperty('feedback')
    expect(typeof result.trigger).toBe('function')
    expect(typeof result.triggerPattern).toBe('function')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/haptics-helpers.test.ts`
Expected: 8 tests pass

**Step 3: Commit**

```bash
git add src/lib/haptics-helpers.test.ts
git commit -m "test: add haptic feedback helpers and HOF tests"
```

---

### Task 3: Chart Data & Discovery Operations Tests

**Files:**

- Create: `src/lib/chart-data.test.ts`
- Source: `src/lib/chart-data.ts` (35 lines)
- Create: `src/lib/love-language-discovery-operations.test.ts`
- Source: `src/lib/love-language-discovery-operations.ts` (83 lines)

**Context:**
`getCheckInMoodHistory(coupleId, supabase, months)` queries check_ins for mood data and returns `MoodDataPoint[]` with formatted dates. Returns `[]` on error. `mapDbDiscovery` maps DB rows to domain objects. `fetchDiscoveries`, `insertDiscovery`, `deleteDiscoveryDb`, `convertDiscoveryToLanguage` all use `createClient()` internally and need the client mock.

**Step 1: Write the tests**

```typescript
// src/lib/chart-data.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getCheckInMoodHistory } from './chart-data'

function createMockSupabase(resolvedValue: { data: unknown; error: unknown }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(resolvedValue),
              }),
            }),
          }),
        }),
      }),
    }),
  } as never
}

describe('getCheckInMoodHistory', () => {
  it('returns empty array on error', async () => {
    const supabase = createMockSupabase({ data: null, error: { message: 'fail' } })
    const result = await getCheckInMoodHistory('c1', supabase)
    expect(result).toEqual([])
  })

  it('returns empty array when no data', async () => {
    const supabase = createMockSupabase({ data: null, error: null })
    const result = await getCheckInMoodHistory('c1', supabase)
    expect(result).toEqual([])
  })

  it('maps mood data to formatted dates', async () => {
    const supabase = createMockSupabase({
      data: [
        { completed_at: '2025-06-15T12:00:00Z', mood_before: 3, mood_after: 5 },
        { completed_at: '2025-06-20T12:00:00Z', mood_before: 4, mood_after: 4 },
      ],
      error: null,
    })
    const result = await getCheckInMoodHistory('c1', supabase)
    expect(result).toHaveLength(2)
    expect(result[0].moodBefore).toBe(3)
    expect(result[0].moodAfter).toBe(5)
    expect(result[0].date).toMatch(/Jun/)
    expect(result[1].moodBefore).toBe(4)
  })

  it('handles null mood values', async () => {
    const supabase = createMockSupabase({
      data: [{ completed_at: '2025-06-15T12:00:00Z', mood_before: null, mood_after: null }],
      error: null,
    })
    const result = await getCheckInMoodHistory('c1', supabase)
    expect(result[0].moodBefore).toBeNull()
    expect(result[0].moodAfter).toBeNull()
  })
})
```

```typescript
// src/lib/love-language-discovery-operations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockChain = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
}

// Make each method return the chain for fluent API
for (const key of Object.keys(mockChain)) {
  ;(mockChain as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mockChain)
}

const mockSupabase = {
  from: vi.fn().mockReturnValue(mockChain),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

const { mapDbDiscovery, fetchDiscoveries, insertDiscovery, deleteDiscoveryDb, convertDiscoveryToLanguage } =
  await import('./love-language-discovery-operations')

const sampleRow = {
  id: 'd1',
  couple_id: 'c1',
  user_id: 'u1',
  check_in_id: 'ci1',
  discovery: 'We both love morning walks',
  converted_to_language_id: null,
  created_at: '2025-06-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  // Re-setup chain returns after clear
  for (const key of Object.keys(mockChain)) {
    ;(mockChain as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mockChain)
  }
  mockSupabase.from.mockReturnValue(mockChain)
})

describe('mapDbDiscovery', () => {
  it('maps snake_case DB row to camelCase domain object', () => {
    const result = mapDbDiscovery(sampleRow)
    expect(result).toEqual({
      id: 'd1',
      coupleId: 'c1',
      userId: 'u1',
      checkInId: 'ci1',
      discovery: 'We both love morning walks',
      convertedToLanguageId: null,
      createdAt: '2025-06-01T00:00:00Z',
    })
  })
})

describe('fetchDiscoveries', () => {
  it('returns mapped discoveries on success', async () => {
    mockChain.order.mockResolvedValue({ data: [sampleRow], error: null })
    const result = await fetchDiscoveries('c1', 'u1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('d1')
    expect(mockSupabase.from).toHaveBeenCalledWith('love_language_discoveries')
  })

  it('throws on error', async () => {
    mockChain.order.mockResolvedValue({ data: null, error: { message: 'fail' } })
    await expect(fetchDiscoveries('c1', 'u1')).rejects.toThrow('fail')
  })
})

describe('insertDiscovery', () => {
  it('inserts and returns mapped discovery', async () => {
    mockChain.single.mockResolvedValue({ data: sampleRow, error: null })
    const result = await insertDiscovery('c1', 'u1', { discovery: 'test' })
    expect(result.id).toBe('d1')
    expect(mockSupabase.from).toHaveBeenCalledWith('love_language_discoveries')
  })

  it('throws on insert error', async () => {
    mockChain.single.mockResolvedValue({ data: null, error: { message: 'insert fail' } })
    await expect(insertDiscovery('c1', 'u1', { discovery: 'test' })).rejects.toThrow('insert fail')
  })
})

describe('deleteDiscoveryDb', () => {
  it('deletes by id', async () => {
    mockChain.eq.mockResolvedValue({ error: null })
    await expect(deleteDiscoveryDb('d1')).resolves.toBeUndefined()
    expect(mockSupabase.from).toHaveBeenCalledWith('love_language_discoveries')
  })

  it('throws on delete error', async () => {
    mockChain.eq.mockResolvedValue({ error: { message: 'delete fail' } })
    await expect(deleteDiscoveryDb('d1')).rejects.toThrow('delete fail')
  })
})

describe('convertDiscoveryToLanguage', () => {
  it('updates and returns mapped discovery', async () => {
    const converted = { ...sampleRow, converted_to_language_id: 'lang-1' }
    mockChain.single.mockResolvedValue({ data: converted, error: null })
    const result = await convertDiscoveryToLanguage('d1', 'lang-1')
    expect(result.convertedToLanguageId).toBe('lang-1')
  })

  it('throws on update error', async () => {
    mockChain.single.mockResolvedValue({ data: null, error: { message: 'update fail' } })
    await expect(convertDiscoveryToLanguage('d1', 'lang-1')).rejects.toThrow('update fail')
  })
})
```

**Step 2: Run the tests**

Run: `npx vitest run src/lib/chart-data.test.ts src/lib/love-language-discovery-operations.test.ts`
Expected: 14 tests pass

**Step 3: Commit**

```bash
git add src/lib/chart-data.test.ts src/lib/love-language-discovery-operations.test.ts
git commit -m "test: add chart data and love language discovery operation tests"
```

---

### Task 4: Server Actions — Proposals & Profile Tests

**Files:**

- Create: `src/app/(app)/settings/actions-proposals.test.ts`
- Source: `src/app/(app)/settings/actions/proposals.ts` (59 lines)
- Create: `src/app/(app)/settings/actions-profile.test.ts`
- Source: `src/app/(app)/settings/actions/profile.ts` (116 lines)

**Context:**
`updateSessionSettings(_prev, formData)` validates form data with Zod, requires auth, gets couple_id from profiles, then updates `session_settings`. Returns `{ error }` or `{ success: true }`. `updateProfile(_prev, formData)` validates display_name/avatar_url, updates profile. `leaveCoupleAction()` calls `leaveCouple()` and redirects. `resendInviteAction(inviteId)` re-sends an invite email. `updateCoupleSettings(key, value)` updates couple settings via RPC. `exportUserData()` wraps the data-export lib. All follow `requireAuth` pattern from existing tests.

**Step 1: Write the tests**

```typescript
// src/app/(app)/settings/actions-proposals.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'user-1' }
let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()

  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  })
})

const { updateSessionSettings } = await import('./actions/proposals')

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const defaults: Record<string, string> = {
    session_duration: '10',
    timeouts_per_partner: '1',
    timeout_duration: '2',
    turn_based_mode: 'true',
    turn_duration: '90',
    allow_extensions: 'true',
    warm_up_questions: 'false',
    cool_down_time: '2',
    pause_notifications: 'false',
    auto_save_drafts: 'true',
  }
  const merged = { ...defaults, ...overrides }
  const fd = new FormData()
  for (const [key, value] of Object.entries(merged)) {
    fd.append(key, value)
  }
  return fd
}

describe('updateSessionSettings', () => {
  it('returns error when user has no couple', async () => {
    mockSupabase._resolve('profiles', 'select', { data: null, error: null })
    const result = await updateSessionSettings({}, makeFormData())
    expect(result.error).toContain('couple')
  })

  it('returns error on validation failure', async () => {
    mockSupabase._resolve('profiles', 'select', { data: { couple_id: 'c1' }, error: null })
    const fd = makeFormData({ session_duration: '0' }) // below min of 5
    const result = await updateSessionSettings({}, fd)
    expect(result.error).toBeDefined()
  })

  it('returns success when update succeeds', async () => {
    mockSupabase._resolve('profiles', 'select', { data: { couple_id: 'c1' }, error: null })
    mockSupabase._resolve('session_settings', 'update', { error: null })
    const result = await updateSessionSettings({}, makeFormData())
    expect(result.success).toBe(true)
  })

  it('returns error when database update fails', async () => {
    mockSupabase._resolve('profiles', 'select', { data: { couple_id: 'c1' }, error: null })
    mockSupabase._resolve('session_settings', 'update', { error: { message: 'db error' } })
    const result = await updateSessionSettings({}, makeFormData())
    expect(result.error).toBe('db error')
  })
})
```

```typescript
// src/app/(app)/settings/actions-profile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'user-1' }
let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('@/lib/couples', () => ({
  leaveCouple: vi.fn(),
  resendInvite: vi.fn(),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  })),
}))
vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(),
  shouldSendEmail: vi.fn().mockResolvedValue(true),
}))
vi.mock('@/lib/data-export', () => ({
  exportUserData: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()

  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  })
})

const { updateProfile, updateCoupleSettings, exportUserData } = await import('./actions/profile')

describe('updateProfile', () => {
  it('returns error on validation failure (empty name)', async () => {
    const fd = new FormData()
    fd.append('display_name', '')
    const result = await updateProfile({}, fd)
    expect(result.error).toBeDefined()
  })

  it('returns success when update succeeds', async () => {
    mockSupabase._resolve('profiles', 'update', { error: null })
    const fd = new FormData()
    fd.append('display_name', 'Jane')
    const result = await updateProfile({}, fd)
    expect(result.success).toBe(true)
  })

  it('returns error when database update fails', async () => {
    mockSupabase._resolve('profiles', 'update', { error: { message: 'db error' } })
    const fd = new FormData()
    fd.append('display_name', 'Jane')
    const result = await updateProfile({}, fd)
    expect(result.error).toBe('db error')
  })
})

describe('updateCoupleSettings', () => {
  it('returns error when user has no couple', async () => {
    mockSupabase._resolve('profiles', 'select', { data: null, error: null })
    const result = await updateCoupleSettings('some_key', true)
    expect(result.error).toContain('couple')
  })

  it('returns empty object on success', async () => {
    mockSupabase._resolve('profiles', 'select', { data: { couple_id: 'c1' }, error: null })
    mockSupabase._rpc = vi.fn().mockResolvedValue({ error: null })
    const result = await updateCoupleSettings('some_key', true)
    expect(result).toEqual({})
  })
})

describe('exportUserData', () => {
  it('calls exportData and returns result', async () => {
    const { exportUserData: mockExport } = await import('@/lib/data-export')
    ;(mockExport as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { profile: {} }, error: null })
    const result = await exportUserData()
    expect(result.data).toBeDefined()
    expect(result.error).toBeNull()
  })
})
```

**Step 2: Run the tests**

Run: `npx vitest run src/app/(app)/settings/actions-proposals.test.ts src/app/(app)/settings/actions-profile.test.ts`
Expected: 10 tests pass

**Step 3: Commit**

```bash
git add src/app/(app)/settings/actions-proposals.test.ts src/app/(app)/settings/actions-profile.test.ts
git commit -m "test: add session settings proposals and profile server action tests"
```

---

## Summary

| Task      | File                                                 | Tests  | Focus                                                                                            |
| --------- | ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| 1         | `src/lib/haptics.test.ts`                            | 10     | HAPTIC_PATTERNS, isHapticSupported, triggerHaptic, triggerHapticPattern                          |
| 2         | `src/lib/haptics-helpers.test.ts`                    | 8      | hapticFeedback, withHaptic, createHapticHandler, useHapticFeedback                               |
| 3a        | `src/lib/chart-data.test.ts`                         | 4      | getCheckInMoodHistory                                                                            |
| 3b        | `src/lib/love-language-discovery-operations.test.ts` | 10     | mapDbDiscovery, fetchDiscoveries, insertDiscovery, deleteDiscoveryDb, convertDiscoveryToLanguage |
| 4a        | `src/app/(app)/settings/actions-proposals.test.ts`   | 4      | updateSessionSettings                                                                            |
| 4b        | `src/app/(app)/settings/actions-profile.test.ts`     | 6      | updateProfile, updateCoupleSettings, exportUserData                                              |
| **Total** | **6 new files**                                      | **42** |                                                                                                  |

Expected test count after Sprint 9: **~550 tests** (508 + 42)
