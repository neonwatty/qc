# Sprint 7: Middleware, Activity, Data Export & Theme Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for critical untested modules — auth middleware (security), activity aggregation (dashboard), data export (compliance), and ThemeContext (provider). ~22 new tests bringing total to ~555.

**Architecture:** Mock Supabase clients and Next.js request/response objects. Test pure data functions with chainable mock builders. Test ThemeContext via renderHook with provider wrapper.

**Tech Stack:** Vitest, @testing-library/react, vi.mock, vi.fn, createMockSupabaseClient

---

### Task 1: Middleware updateSession Tests

**Files:**

- Create: `src/lib/supabase/middleware.test.ts`
- Source: `src/lib/supabase/middleware.ts` (85 lines)

**Context:**
`updateSession(request)` is the core auth middleware. It:

1. Creates a Supabase server client with cookie handling
2. Gets the current user via `supabase.auth.getUser()`
3. Blocks users not on the allowlist (signs out + redirects to `/login?error=Access restricted`)
4. Redirects unauthenticated users on protected routes to `/login?redirect=<path>`
5. Redirects authenticated users without a couple to `/onboarding`
6. Redirects authenticated users WITH a couple away from `/onboarding` to `/dashboard`
7. Adds security headers to all responses

We need to mock `@supabase/ssr`'s `createServerClient` and the `middleware-utils` functions.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock middleware-utils
vi.mock('./middleware-utils', () => ({
  addSecurityHeaders: vi.fn(),
  isAllowedEmail: vi.fn().mockReturnValue(true),
  isAppRoute: vi.fn().mockReturnValue(false),
  isPublicRoute: vi.fn().mockReturnValue(false),
}))

const mockGetUser = vi.fn()
const mockSignOut = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser, signOut: mockSignOut },
    from: mockFrom,
  }),
}))

import { updateSession } from './middleware'
import { isAllowedEmail, isAppRoute, isPublicRoute, addSecurityHeaders } from './middleware-utils'

function makeRequest(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`)
  return {
    headers: new Headers(),
    cookies: { getAll: vi.fn().mockReturnValue([]), set: vi.fn() },
    nextUrl: { pathname, clone: () => url, searchParams: url.searchParams },
  } as unknown as Parameters<typeof updateSession>[0]
}

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: null } })
    vi.mocked(isAllowedEmail).mockReturnValue(true)
    vi.mocked(isAppRoute).mockReturnValue(false)
    vi.mocked(isPublicRoute).mockReturnValue(false)
  })

  it('adds security headers to all responses', async () => {
    vi.mocked(isPublicRoute).mockReturnValue(true)
    await updateSession(makeRequest('/login'))
    expect(addSecurityHeaders).toHaveBeenCalled()
  })

  it('allows public routes for unauthenticated users', async () => {
    vi.mocked(isPublicRoute).mockReturnValue(true)
    const response = await updateSession(makeRequest('/login'))
    expect(response.status).not.toBe(307)
  })

  it('redirects unauthenticated users on protected routes to /login', async () => {
    const response = await updateSession(makeRequest('/settings'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
    expect(response.headers.get('location')).toContain('redirect=%2Fsettings')
  })

  it('blocks users not on allowlist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'bad@example.com' } } })
    vi.mocked(isAllowedEmail).mockReturnValue(false)
    const response = await updateSession(makeRequest('/dashboard'))
    expect(mockSignOut).toHaveBeenCalled()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('error=Access+restricted')
  })

  it('redirects authenticated user without couple to /onboarding', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'ok@test.com' } } })
    vi.mocked(isAppRoute).mockReturnValue(true)
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { couple_id: null } }),
        }),
      }),
    })
    const response = await updateSession(makeRequest('/dashboard'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/onboarding')
  })

  it('redirects user with couple away from /onboarding to /dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'ok@test.com' } } })
    vi.mocked(isAppRoute).mockReturnValue(false)
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { couple_id: 'c1' } }),
        }),
      }),
    })
    const response = await updateSession(makeRequest('/onboarding'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/supabase/middleware.test.ts`
Expected: 6 tests pass

**Step 3: Commit**

```bash
git add src/lib/supabase/middleware.test.ts
git commit -m "test: add auth middleware unit tests"
```

---

### Task 2: Activity Aggregation Tests

**Files:**

- Create: `src/lib/activity.test.ts`
- Source: `src/lib/activity.ts` (119 lines)

**Context:**
`getRecentActivity(coupleId, supabase, limit)` queries 5 tables in parallel, maps results to `ActivityItem[]`, sorts by timestamp descending, and returns the top `limit` items. Takes a Supabase client as parameter (easy to mock).

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getRecentActivity } from './activity'

function mockSupabase(tableData: Record<string, unknown[]>) {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      const data = tableData[table] ?? []
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
      }
      return chain
    }),
  } as never
}

describe('getRecentActivity', () => {
  it('returns empty array when no data', async () => {
    const supabase = mockSupabase({})
    const result = await getRecentActivity('c1', supabase)
    expect(result).toEqual([])
  })

  it('maps check-in rows to ActivityItems', async () => {
    const supabase = mockSupabase({
      check_ins: [{ completed_at: '2025-06-01T12:00:00Z', categories: ['Communication'] }],
    })
    const result = await getRecentActivity('c1', supabase)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('check-in')
    expect(result[0].description).toBe('Communication')
  })

  it('truncates long note content to 50 chars', async () => {
    const longContent = 'A'.repeat(60)
    const supabase = mockSupabase({
      notes: [{ content: longContent, created_at: '2025-06-01T12:00:00Z' }],
    })
    const result = await getRecentActivity('c1', supabase)
    expect(result[0].title).toBe('A'.repeat(50) + '...')
  })

  it('sorts all items by timestamp descending', async () => {
    const supabase = mockSupabase({
      notes: [{ content: 'older note', created_at: '2025-01-01T00:00:00Z' }],
      milestones: [
        { title: 'newer milestone', achieved_at: '2025-06-01T00:00:00Z', created_at: '2025-06-01T00:00:00Z' },
      ],
    })
    const result = await getRecentActivity('c1', supabase)
    expect(result[0].type).toBe('milestone')
    expect(result[1].type).toBe('note')
  })

  it('respects the limit parameter', async () => {
    const supabase = mockSupabase({
      notes: [
        { content: 'a', created_at: '2025-06-01T00:00:00Z' },
        { content: 'b', created_at: '2025-06-02T00:00:00Z' },
        { content: 'c', created_at: '2025-06-03T00:00:00Z' },
      ],
    })
    const result = await getRecentActivity('c1', supabase, 2)
    expect(result).toHaveLength(2)
  })

  it('handles check-in with null categories', async () => {
    const supabase = mockSupabase({
      check_ins: [{ completed_at: '2025-06-01T12:00:00Z', categories: null }],
    })
    const result = await getRecentActivity('c1', supabase)
    expect(result[0].description).toBe('General check-in')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/activity.test.ts`
Expected: 6 tests pass

**Step 3: Commit**

```bash
git add src/lib/activity.test.ts
git commit -m "test: add activity aggregation unit tests"
```

---

### Task 3: Data Export Tests

**Files:**

- Create: `src/lib/data-export.test.ts`
- Source: `src/lib/data-export.ts` (197 lines)

**Context:**
`exportUserData(supabase, userId)` fetches profile, couple, notes, check-ins, action items, milestones, reminders, requests, love languages, and love actions. Returns `{ data: UserData, error: null }` on success. If profile fetch fails, returns error. If user has no couple, couple-scoped data is empty arrays.

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { exportUserData } from './data-export'

function mockChain(data: unknown = null, error: unknown = null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
        order: vi.fn().mockResolvedValue({ data: data ?? [], error }),
        or: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: data ?? [], error }),
        }),
      }),
      or: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: data ?? [], error }),
      }),
    }),
  }
}

function mockSupabase(profileData: unknown, coupleData: unknown = null) {
  const calls: string[] = []
  return {
    from: vi.fn().mockImplementation((table: string) => {
      calls.push(table)
      if (table === 'profiles') return mockChain(profileData)
      if (table === 'couples') return mockChain(coupleData)
      // All other tables return empty arrays
      return mockChain([])
    }),
    _calls: calls,
  } as never
}

describe('exportUserData', () => {
  it('returns error when profile not found', async () => {
    const supabase = mockSupabase(null, null)
    const result = await exportUserData(supabase, 'u1')
    expect(result.error).toBe('Profile not found')
    expect(result.data).toBeNull()
  })

  it('exports profile data successfully', async () => {
    const profile = { id: 'u1', display_name: 'Alice', email: 'alice@test.com', couple_id: null }
    const supabase = mockSupabase(profile)
    const result = await exportUserData(supabase, 'u1')
    expect(result.error).toBeNull()
    expect(result.data!.profile.id).toBe('u1')
    expect(result.data!.profile.display_name).toBe('Alice')
    expect(result.data!.version).toBe('1.0.0')
  })

  it('includes couple data when user has a couple', async () => {
    const profile = { id: 'u1', display_name: 'Alice', email: 'a@t.com', couple_id: 'c1' }
    const couple = { id: 'c1', relationship_start_date: '2024-01-01', settings: {} }
    const supabase = mockSupabase(profile, couple)
    const result = await exportUserData(supabase, 'u1')
    expect(result.data!.couple).toEqual(couple)
  })

  it('returns empty arrays for couple-scoped data when no couple', async () => {
    const profile = { id: 'u1', display_name: 'Solo', email: 's@t.com', couple_id: null }
    const supabase = mockSupabase(profile)
    const result = await exportUserData(supabase, 'u1')
    expect(result.data!.checkIns).toEqual([])
    expect(result.data!.actionItems).toEqual([])
    expect(result.data!.milestones).toEqual([])
    expect(result.data!.loveActions).toEqual([])
  })

  it('catches thrown errors and returns error message', async () => {
    const supabase = {
      from: vi.fn().mockImplementation(() => {
        throw new Error('DB connection failed')
      }),
    } as never
    const result = await exportUserData(supabase, 'u1')
    expect(result.error).toBe('DB connection failed')
    expect(result.data).toBeNull()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/data-export.test.ts`
Expected: 5 tests pass

**Step 3: Commit**

```bash
git add src/lib/data-export.test.ts
git commit -m "test: add data export unit tests"
```

---

### Task 4: ThemeContext Provider Tests

**Files:**

- Create: `src/contexts/ThemeContext.test.tsx`
- Source: `src/contexts/ThemeContext.tsx` (77 lines)

**Context:**
`ThemeProvider` manages light/dark theme via localStorage, applies `dark` class and `data-theme` attribute to `document.documentElement`, and updates `meta[name="theme-color"]`. `useTheme()` throws outside provider.

**Step 1: Write the tests**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'

// Mock localStorage
const storage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key]
  }),
})

import { ThemeProvider, useTheme } from './ThemeContext'

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(storage)) delete storage[key]
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  it('useTheme throws outside provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider')
  })

  it('defaults to light theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('setTheme changes to dark and persists to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => result.current.setTheme('dark'))
    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-theme', 'dark')
  })

  it('toggle switches between light and dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('light')
  })

  it('reads stored theme from localStorage on init', () => {
    storage['qc-theme'] = 'dark'
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/contexts/ThemeContext.test.tsx`
Expected: 5 tests pass

**Step 3: Commit**

```bash
git add src/contexts/ThemeContext.test.tsx
git commit -m "test: add ThemeContext provider unit tests"
```

---

## Summary

| Task      | File                                  | Tests  | Focus                                |
| --------- | ------------------------------------- | ------ | ------------------------------------ |
| 1         | `src/lib/supabase/middleware.test.ts` | 6      | Auth middleware redirects + security |
| 2         | `src/lib/activity.test.ts`            | 6      | Dashboard activity aggregation       |
| 3         | `src/lib/data-export.test.ts`         | 5      | GDPR/compliance data export          |
| 4         | `src/contexts/ThemeContext.test.tsx`  | 5      | Theme provider state + persistence   |
| **Total** | **4 new files**                       | **22** |                                      |

Expected test count after Sprint 7: **~555 tests** (533 + 22)
