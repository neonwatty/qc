# Gap Remediation Plan — Security, Testing, and Integration Fixes

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical and high-severity gaps identified in the Feb 26 audit: 3 critical security issues, 7 high-severity issues across security/testing/integration, and 3 high-value next-sprint items.

**Architecture:** Each task is self-contained with tests. Security fixes come first (redirect validation, storage RLS, input validation), then integration bug fixes (action items display), then test coverage for previously-untested critical paths (middleware, OAuth callback). Tasks are ordered by dependency — later tasks may depend on utilities introduced by earlier ones.

**Tech Stack:** Next.js 16, Supabase (Postgres + RLS), Vitest, Zod, TypeScript strict mode.

---

## Sprint 1: Immediate (Critical + High)

### Task 1: Revoke Exposed Supabase Token

**Files:**

- Check: `.env` (line 1)
- Check: `.gitignore`

**Step 1: Verify .gitignore excludes .env files**

Run: `grep -n '\.env' .gitignore`
Expected: Lines showing `.env*` or `.env` are gitignored (except `.env.example`).

**Step 2: Verify .env is NOT tracked in git history**

Run: `git log --all --full-history -- .env`
Expected: Empty output (file was never committed). If output is NOT empty, the token is compromised — revoke immediately in Supabase dashboard at https://supabase.com/dashboard/project/ldgognycaszwblydglod/settings/api.

**Step 3: Revoke and rotate the token**

Go to the Supabase dashboard → Settings → API → Service Role Key and regenerate. Update the token in Doppler (production secrets manager).

**Step 4: Commit — N/A (no code change)**

---

### Task 2: Fix Open Redirect Vulnerability

**Files:**

- Create: `src/lib/redirect.ts`
- Create: `src/lib/redirect.test.ts`
- Modify: `src/app/(auth)/login/page.tsx:12`
- Modify: `src/app/auth/callback/route.ts:8,30`

**Step 1: Write the failing test**

Create `src/lib/redirect.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { sanitizeRedirect } from './redirect'

describe('sanitizeRedirect', () => {
  it('allows simple relative paths', () => {
    expect(sanitizeRedirect('/dashboard')).toBe('/dashboard')
  })

  it('allows paths with query params', () => {
    expect(sanitizeRedirect('/notes?filter=shared')).toBe('/notes?filter=shared')
  })

  it('falls back for absolute URLs', () => {
    expect(sanitizeRedirect('https://evil.com')).toBe('/dashboard')
  })

  it('falls back for protocol-relative URLs', () => {
    expect(sanitizeRedirect('//evil.com')).toBe('/dashboard')
  })

  it('falls back for javascript: URLs', () => {
    expect(sanitizeRedirect('javascript:alert(1)')).toBe('/dashboard')
  })

  it('falls back for null/undefined/empty', () => {
    expect(sanitizeRedirect(null)).toBe('/dashboard')
    expect(sanitizeRedirect(undefined)).toBe('/dashboard')
    expect(sanitizeRedirect('')).toBe('/dashboard')
  })

  it('falls back for paths not starting with /', () => {
    expect(sanitizeRedirect('evil.com/path')).toBe('/dashboard')
  })

  it('allows custom fallback', () => {
    expect(sanitizeRedirect('https://evil.com', '/home')).toBe('/home')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/redirect.test.ts`
Expected: FAIL — `sanitizeRedirect` does not exist.

**Step 3: Write minimal implementation**

Create `src/lib/redirect.ts`:

```typescript
export function sanitizeRedirect(url: string | null | undefined, fallback = '/dashboard'): string {
  if (!url || typeof url !== 'string') return fallback
  // Must start with exactly one slash and not be protocol-relative (//)
  if (!url.startsWith('/') || url.startsWith('//')) return fallback
  return url
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/redirect.test.ts`
Expected: All 8 tests PASS.

**Step 5: Apply to login page**

In `src/app/(auth)/login/page.tsx`, replace line 12:

```typescript
// BEFORE
const redirect = searchParams.get('redirect') ?? '/dashboard'

// AFTER
import { sanitizeRedirect } from '@/lib/redirect'
// ...
const redirect = sanitizeRedirect(searchParams.get('redirect'))
```

Also update `handleOAuth` (line 57) — the `redirect` variable is already sanitized, so no change needed there.

**Step 6: Apply to OAuth callback**

In `src/app/auth/callback/route.ts`, replace line 8 and line 30:

```typescript
// BEFORE (line 8)
const redirect = searchParams.get('redirect')
// AFTER (line 8)
import { sanitizeRedirect } from '@/lib/redirect'
// ...
const redirect = sanitizeRedirect(searchParams.get('redirect'))

// BEFORE (line 30)
return NextResponse.redirect(`${origin}${redirect ?? '/dashboard'}`)
// AFTER (line 30)
return NextResponse.redirect(`${origin}${redirect}`)
```

Note: `sanitizeRedirect` already defaults to `/dashboard`, so the `?? '/dashboard'` is no longer needed.

**Step 7: Run all tests**

Run: `npx vitest run`
Expected: All pass.

**Step 8: Commit**

```bash
git add src/lib/redirect.ts src/lib/redirect.test.ts src/app/\(auth\)/login/page.tsx src/app/auth/callback/route.ts
git commit -m "$(cat <<'EOF'
fix: validate redirect parameter to prevent open redirect attacks

Adds sanitizeRedirect() utility that only allows relative paths starting
with a single /. Applied to login page and OAuth callback route.
EOF
)"
```

---

### Task 3: Restrict Milestone Photo Storage Access

**Files:**

- Create: `supabase/migrations/00023_restrict_milestone_photo_access.sql`

**Step 1: Write the migration**

Create `supabase/migrations/00023_restrict_milestone_photo_access.sql`:

```sql
-- Drop the overly-permissive public read policy
DROP POLICY IF EXISTS "Anyone can read milestone photos" ON storage.objects;

-- Replace with couple-scoped read policy
-- Photos are stored in folders named by user_id, and couple members share access.
-- Pattern: milestone-photos/{user_id}/{filename}
CREATE POLICY "Couple members can read milestone photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'milestone-photos'
    AND (
      -- Owner can always read their own photos
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Partner can read photos if they share a couple
      (storage.foldername(name))[1] IN (
        SELECT p2.id::text
        FROM public.profiles p1
        JOIN public.profiles p2 ON p1.couple_id = p2.couple_id
        WHERE p1.id = auth.uid() AND p2.id != auth.uid()
      )
    )
  );

-- Also allow partner to delete photos (not just the uploader)
DROP POLICY IF EXISTS "Owners can delete their photos" ON storage.objects;

CREATE POLICY "Couple members can delete milestone photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'milestone-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      (storage.foldername(name))[1] IN (
        SELECT p2.id::text
        FROM public.profiles p1
        JOIN public.profiles p2 ON p1.couple_id = p2.couple_id
        WHERE p1.id = auth.uid() AND p2.id != auth.uid()
      )
    )
  );
```

**Step 2: Apply locally**

Run: `make db-push`
Expected: Migration applies without errors.

**Step 3: Verify photo access works for couple members**

Run: `make supabase-start` (if not running), then test via Supabase Studio at http://localhost:54323.

**Step 4: Commit**

```bash
git add supabase/migrations/00023_restrict_milestone_photo_access.sql
git commit -m "$(cat <<'EOF'
fix: restrict milestone photo access to couple members only

Replaces public read policy on milestone-photos bucket with
couple-scoped policy. Also allows partner deletion, not just uploader.
EOF
)"
```

---

### Task 4: Validate JSON.parse in Onboarding with Zod

**Files:**

- Modify: `src/app/onboarding/actions.ts:74-92`
- Modify: `src/app/onboarding/actions.test.ts` (add test case)

**Step 1: Write the failing test**

Add to `src/app/onboarding/actions.test.ts` (in the existing test suite):

```typescript
it('handles malformed selectedLanguages JSON gracefully', async () => {
  // Setup auth mock to return a valid user
  // ... (use existing test setup pattern from this file)

  const formData = new FormData()
  formData.set('displayName', 'Test User')
  formData.set('partnerEmail', 'partner@test.com')
  formData.set('selectedLanguages', 'not-valid-json{{{')

  const result = await completeOnboarding({ error: null }, formData)
  // Should NOT throw — should continue without languages
  expect(result).not.toHaveProperty('error')
})

it('rejects selectedLanguages that parse to non-array', async () => {
  const formData = new FormData()
  formData.set('displayName', 'Test User')
  formData.set('partnerEmail', 'partner@test.com')
  formData.set('selectedLanguages', '"just a string"')

  const result = await completeOnboarding({ error: null }, formData)
  // Should NOT throw — should continue without languages
  expect(result).not.toHaveProperty('error')
})
```

**Step 2: Run test to verify current behavior**

Run: `npx vitest run src/app/onboarding/actions.test.ts`
Expected: Check whether existing tests pass (they should). The new tests may already pass due to try-catch, but we're hardening the validation.

**Step 3: Replace unsafe JSON.parse with Zod validation**

In `src/app/onboarding/actions.ts`, replace lines 74-92:

```typescript
// BEFORE
const rawLanguages = input.selectedLanguages
if (rawLanguages) {
  try {
    const categories = JSON.parse(rawLanguages) as string[]
    if (Array.isArray(categories) && categories.length > 0) {
      // ... insert logic
    }
  } catch {
    // Love language insertion failed -- non-blocking, continue to redirect
  }
}

// AFTER
const rawLanguages = input.selectedLanguages
if (rawLanguages) {
  const languageResult = z.array(z.string()).safeParse(
    (() => {
      try {
        return JSON.parse(rawLanguages)
      } catch {
        return null
      }
    })(),
  )

  if (languageResult.success && languageResult.data.length > 0) {
    const languageRows = languageResult.data.map((category) => ({
      couple_id: couple.id,
      user_id: user.id,
      // eslint-disable-next-line security/detect-object-injection -- category is from user-selected values validated by Zod
      title: LANGUAGE_TITLES[category] ?? category,
      category,
      privacy: 'shared' as const,
      importance: 'high' as const,
    }))
    try {
      await supabase.from('love_languages').insert(languageRows)
    } catch {
      // Love language insertion failed -- non-blocking, continue to redirect
    }
  }
}
```

**Step 4: Run tests**

Run: `npx vitest run src/app/onboarding/actions.test.ts`
Expected: All pass.

**Step 5: Commit**

```bash
git add src/app/onboarding/actions.ts src/app/onboarding/actions.test.ts
git commit -m "$(cat <<'EOF'
fix: validate love language JSON with Zod in onboarding

Replaces unsafe JSON.parse + type assertion with Zod array validation.
Prevents crashes on malformed input.
EOF
)"
```

---

### Task 5: Fix Action Items Display in Check-In Wizard

**Files:**

- Modify: `src/app/(app)/checkin/steps.tsx:161-209`
- Modify: `src/contexts/CheckInContext.tsx` (expose actionItems)

**Step 1: Understand the bug**

In `steps.tsx:164`:

```typescript
const actionItems = session?.draftNotes ? [] : ([] as ActionItem[])
```

This is always `[]` regardless of the condition. The `CheckInContext` tracks `actionItems` via realtime subscription (line 230, 268-276) but never exposes them through the context value.

In `steps.tsx:201`:

```typescript
actionItemsCount={0}
```

Hardcoded to 0.

**Step 2: Expose actionItems from CheckInContext**

In `src/contexts/CheckInContext.tsx`, the `actionItems` state is already managed (line 230) and updated via realtime (lines 268-276), but it's not included in the context value.

Update the context value in `CheckInProvider` (around line 281):

```typescript
// BEFORE
const contextValue: CheckInContextValue = {
  ...state,
  coupleId,
  dispatch,
  ...mutations,
  ...queries,
}

// AFTER
const contextValue: CheckInContextValue = {
  ...state,
  coupleId,
  dispatch,
  actionItems,
  ...mutations,
  ...queries,
}
```

You'll also need to add `actionItems` to the `CheckInContextValue` type in `src/types/checkin.ts`. Find the interface and add:

```typescript
actionItems: ActionItem[]
```

**Step 3: Fix ActionItemsStep to use real data**

In `src/app/(app)/checkin/steps.tsx`, replace line 164:

```typescript
// BEFORE
const actionItems = session?.draftNotes ? [] : ([] as ActionItem[])

// AFTER
const { actionItems } = useCheckInContext()
```

Note: `actionItems` is already destructured from `useCheckInContext()` on line 162 via the spread, but we need to explicitly destructure it. Update line 162:

```typescript
// BEFORE
const { session, completeStep, goToStep, addActionItem, removeActionItem, toggleActionItem } = useCheckInContext()

// AFTER
const { session, completeStep, goToStep, addActionItem, removeActionItem, toggleActionItem, actionItems } =
  useCheckInContext()
```

Then remove line 164 entirely (the broken `const actionItems = ...`).

**Step 4: Fix CompletionStep to show real action item count**

In `src/app/(app)/checkin/steps.tsx`, update `CompletionStep`:

```typescript
// Add actionItems to destructuring (line ~181 area)
const { session, completeCheckIn, actionItems } = useCheckInContext()

// Replace line 201
// BEFORE
actionItemsCount={0}
// AFTER
actionItemsCount={actionItems.length}
```

**Step 5: Run type check**

Run: `npx tsc --noEmit`
Expected: No type errors.

**Step 6: Run all tests**

Run: `npx vitest run`
Expected: All pass.

**Step 7: Commit**

```bash
git add src/app/\(app\)/checkin/steps.tsx src/contexts/CheckInContext.tsx src/types/checkin.ts
git commit -m "$(cat <<'EOF'
fix: display real action items in check-in wizard

Exposes actionItems from CheckInContext (already tracked via realtime)
and wires them into ActionItemsStep and CompletionStep. Previously both
always showed 0 items due to broken ternary and hardcoded count.
EOF
)"
```

---

## Sprint 2: Next Sprint (High-Value Testing + Integration)

### Task 6: Add Middleware Unit Tests

**Files:**

- Create: `src/lib/supabase/middleware.test.ts`

**Step 1: Write the test file**

Create `src/lib/supabase/middleware.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the pure functions exported/defined in middleware.ts.
// Since isPublicRoute, isAppRoute, isAllowedEmail, and addSecurityHeaders
// are not exported, we test them through updateSession behavior,
// OR we refactor to export them for direct testing.
//
// Recommended approach: extract the pure functions into a separate
// testable module (middleware-utils.ts) and test directly.

// For now, test via updateSession behavior using mocked NextRequest/NextResponse.

describe('isPublicRoute (via updateSession)', () => {
  it('allows unauthenticated access to /login', () => {
    // Test that /login does NOT redirect to /login (infinite loop prevention)
  })

  it('allows unauthenticated access to /api/health', () => {
    // Test that /api/health passes through without auth
  })

  it('allows unauthenticated access to /invite/some-token', () => {
    // Test that invite paths are public
  })

  it('redirects unauthenticated access to /dashboard to /login', () => {
    // Test that protected routes redirect
  })

  it('redirects unauthenticated access to /notes to /login', () => {
    // Test that protected routes redirect
  })
})

describe('isAllowedEmail', () => {
  it('allows any email when ALLOWED_EMAILS is not set', () => {
    // No env var = no restriction
  })

  it('blocks email not in allowlist', () => {
    // Set ALLOWED_EMAILS=a@b.com, test with c@d.com
  })

  it('allows email in allowlist (case-insensitive)', () => {
    // Set ALLOWED_EMAILS=a@b.com, test with A@B.com
  })
})

describe('addSecurityHeaders', () => {
  it('sets X-Frame-Options to DENY', () => {})
  it('sets Content-Security-Policy', () => {})
  it('sets X-Content-Type-Options to nosniff', () => {})
  it('sets Referrer-Policy', () => {})
  it('sets Permissions-Policy', () => {})
})

describe('onboarding redirect', () => {
  it('redirects authenticated user without couple to /onboarding', () => {})
  it('redirects authenticated user WITH couple from /onboarding to /dashboard', () => {})
  it('allows authenticated user with couple to access /dashboard', () => {})
})
```

**Implementation note:** The pure functions `isPublicRoute`, `isAppRoute`, `isAllowedEmail`, and `addSecurityHeaders` are not currently exported. The cleanest approach is:

1. Extract them to `src/lib/supabase/middleware-utils.ts` (pure functions, no Supabase dependency)
2. Import them in `middleware.ts`
3. Test `middleware-utils.ts` directly (no mocking needed for pure functions)
4. Test `updateSession` integration with mocked NextRequest/NextResponse + mocked Supabase

**Step 2: Extract pure functions to middleware-utils.ts**

Create `src/lib/supabase/middleware-utils.ts` with `isPublicRoute`, `isAppRoute`, `isAllowedEmail`, `addSecurityHeaders` moved from `middleware.ts`.

**Step 3: Write comprehensive tests for middleware-utils.ts**

Test every route in PUBLIC_ROUTES, every route in isAppRoute, edge cases for isAllowedEmail, and all security headers.

**Step 4: Run tests**

Run: `npx vitest run src/lib/supabase/middleware-utils.test.ts`
Expected: All pass.

**Step 5: Write integration test for updateSession**

This requires mocking `createServerClient` from `@supabase/ssr` and `NextRequest`/`NextResponse` from `next/server`. Test the three main flows:

- Unauthenticated user hitting protected route → redirect to /login
- Authenticated user without couple hitting app route → redirect to /onboarding
- Authenticated user with couple hitting app route → pass through

**Step 6: Run all tests**

Run: `npx vitest run`
Expected: All pass.

**Step 7: Commit**

```bash
git add src/lib/supabase/middleware-utils.ts src/lib/supabase/middleware-utils.test.ts src/lib/supabase/middleware.ts src/lib/supabase/middleware.test.ts
git commit -m "$(cat <<'EOF'
test: add unit tests for auth middleware

Extracts pure functions (isPublicRoute, isAppRoute, isAllowedEmail,
addSecurityHeaders) to middleware-utils.ts for direct testing.
Adds integration tests for updateSession redirect logic.
EOF
)"
```

---

### Task 7: Add OAuth Callback Route Tests

**Files:**

- Create: `src/app/auth/callback/route.test.ts`

**Step 1: Write the test file**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('GET /auth/callback', () => {
  it('redirects to /login with error when code is missing', async () => {
    // request URL: /auth/callback (no ?code=)
    // Expected: redirect to /login?error=Missing+authorization+code
  })

  it('redirects to /login with error when code exchange fails', async () => {
    // Mock supabase.auth.exchangeCodeForSession to return error
    // Expected: redirect to /login?error=<message>
  })

  it('redirects to /onboarding when user has no couple', async () => {
    // Mock successful code exchange, profile with couple_id = null
    // Expected: redirect to /onboarding
  })

  it('redirects to /dashboard when user has couple and no redirect param', async () => {
    // Mock successful code exchange, profile with couple_id = 'abc'
    // Expected: redirect to /dashboard
  })

  it('redirects to sanitized redirect param when user has couple', async () => {
    // request URL: /auth/callback?code=abc&redirect=/notes
    // Expected: redirect to /notes
  })

  it('ignores malicious redirect param', async () => {
    // request URL: /auth/callback?code=abc&redirect=https://evil.com
    // Expected: redirect to /dashboard (sanitized)
  })
})
```

**Step 2: Implement the tests using the mock supabase pattern from existing tests**

Follow the pattern in `src/app/onboarding/actions.test.ts` for mocking `createClient`.

**Step 3: Run tests**

Run: `npx vitest run src/app/auth/callback/route.test.ts`
Expected: All pass (including the malicious redirect test, since Task 2 already applied `sanitizeRedirect`).

**Step 4: Commit**

```bash
git add src/app/auth/callback/route.test.ts
git commit -m "$(cat <<'EOF'
test: add unit tests for OAuth callback route

Tests code exchange, couple lookup redirect, onboarding redirect,
and redirect parameter sanitization.
EOF
)"
```

---

### Task 8: Add Rate Limiting to Invite Token Endpoint

**Files:**

- Create: `src/lib/rate-limit.ts`
- Create: `src/lib/rate-limit.test.ts`
- Modify: `src/app/invite/[token]/actions.ts`

**Step 1: Write the failing test**

Create `src/lib/rate-limit.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', () => {
    const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 })
    for (let i = 0; i < 5; i++) {
      expect(limiter.check('key1')).toBe(true)
    }
  })

  it('blocks requests over the limit', () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 })
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(false)
  })

  it('resets after window expires', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 })
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key1')).toBe(false)
    vi.advanceTimersByTime(1001)
    expect(limiter.check('key1')).toBe(true)
  })

  it('tracks keys independently', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 })
    expect(limiter.check('key1')).toBe(true)
    expect(limiter.check('key2')).toBe(true)
    expect(limiter.check('key1')).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: FAIL — module not found.

**Step 3: Write implementation**

Create `src/lib/rate-limit.ts`:

```typescript
interface RateLimiterConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

export function createRateLimiter(config: RateLimiterConfig) {
  const store = new Map<string, RateLimitEntry>()

  return {
    check(key: string): boolean {
      const now = Date.now()
      const entry = store.get(key)

      if (!entry || now >= entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + config.windowMs })
        return true
      }

      if (entry.count >= config.maxRequests) {
        return false
      }

      entry.count++
      return true
    },
  }
}
```

**Step 4: Run tests**

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: All pass.

**Step 5: Apply to invite actions**

In `src/app/invite/[token]/actions.ts`, add rate limiting at the top of `validateInvite`:

```typescript
import { createRateLimiter } from '@/lib/rate-limit'

const inviteLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 })

// Inside validateInvite, at the top:
if (!inviteLimiter.check(token)) {
  return { data: null, error: 'Too many requests. Please try again later.' }
}
```

**Step 6: Run all tests**

Run: `npx vitest run`
Expected: All pass.

**Step 7: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/rate-limit.test.ts src/app/invite/\[token\]/actions.ts
git commit -m "$(cat <<'EOF'
feat: add in-memory rate limiter and apply to invite token lookup

Prevents brute-force token enumeration on the invite endpoint.
10 requests per minute per token.
EOF
)"
```

---

### Task 9: Add Email Server Action Tests

**Files:**

- Create: `src/app/(app)/checkin/actions.test.ts`
- Create: `src/app/(app)/growth/actions.test.ts`

**Step 1: Identify the functions to test**

Read `src/app/(app)/checkin/actions.ts` to find `sendCheckInSummaryEmail`. Read `src/app/(app)/growth/actions.ts` to find `sendMilestoneEmail`. Both follow the pattern:

1. Fetch check-in/milestone data
2. Fetch both partner profiles
3. Call `shouldSendEmail` + `sendEmail`
4. Silently catch errors

**Step 2: Write checkin actions test**

Create `src/app/(app)/checkin/actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server')
vi.mock('@/lib/email/send')

describe('sendCheckInSummaryEmail', () => {
  it('sends email to both partners when shouldSendEmail returns true', async () => {
    // Mock: supabase returns check-in with 2 profiles, both with emails
    // Mock: shouldSendEmail returns true for both
    // Assert: sendEmail called twice
  })

  it('skips partner whose email has bounced (shouldSendEmail false)', async () => {
    // Mock: shouldSendEmail returns false for one partner
    // Assert: sendEmail called once
  })

  it('does not throw when sendEmail fails', async () => {
    // Mock: sendEmail throws
    // Assert: function completes without throwing
  })

  it('does not throw when check-in not found', async () => {
    // Mock: supabase returns null for check-in
    // Assert: function returns gracefully
  })
})
```

**Step 3: Write growth actions test**

Create `src/app/(app)/growth/actions.test.ts` with similar pattern for `sendMilestoneEmail`.

**Step 4: Run tests**

Run: `npx vitest run src/app/\(app\)/checkin/actions.test.ts src/app/\(app\)/growth/actions.test.ts`
Expected: All pass.

**Step 5: Commit**

```bash
git add src/app/\(app\)/checkin/actions.test.ts src/app/\(app\)/growth/actions.test.ts
git commit -m "$(cat <<'EOF'
test: add unit tests for check-in summary and milestone email actions

Covers happy path, bounce skipping, error swallowing, and missing data.
EOF
)"
```

---

### Task 10: Remove `passWithNoTests` from Vitest Config

**Files:**

- Modify: `vitest.config.ts:10`

**Step 1: Remove the flag**

In `vitest.config.ts`, remove line 10:

```typescript
// BEFORE
passWithNoTests: true,

// AFTER
// (line removed)
```

**Step 2: Run tests to verify nothing breaks**

Run: `npx vitest run`
Expected: All pass. If any test files are empty/broken, fix them.

**Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "$(cat <<'EOF'
chore: remove passWithNoTests from vitest config

Empty test files will now correctly fail CI, preventing untested code
from silently passing the test suite.
EOF
)"
```

---

## Task Dependency Graph

```
Task 1 (revoke token)         — independent, do first
Task 2 (redirect validation)  — independent
Task 3 (storage RLS)          — independent
Task 4 (Zod onboarding)       — independent
Task 5 (action items display) — independent

Task 6 (middleware tests)     — independent
Task 7 (OAuth tests)          — depends on Task 2 (uses sanitizeRedirect)
Task 8 (rate limiting)        — independent
Task 9 (email action tests)   — independent
Task 10 (vitest config)       — do last (after all tests are written)
```

Tasks 1-5 can run in parallel. Tasks 6-9 can run in parallel. Task 10 should be last.

---

## Verification Checklist

After all tasks are complete, run the full quality pipeline:

```bash
npm run check   # lint + typecheck + format:check + test
npm run knip    # dead code detection
```

All must pass before creating the PR.
