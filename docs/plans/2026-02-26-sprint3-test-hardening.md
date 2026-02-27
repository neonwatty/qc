# Sprint 3: Test Hardening & Webhook Completion

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the 4 `it.todo()` test stubs from sprint 2, add `shouldSendEmail` unit tests, add the `isAppRoute` missing routes, and harden CSP by adding nonce support — closing all remaining high-value gaps from the Feb 26 audit.

**Architecture:** Tasks 1-4 are pure test additions (no production code changes). Task 5 fixes a middleware bug where actual app routes are missing from `isAppRoute`. Task 6 adds CSP nonce support to eliminate `'unsafe-inline'` for scripts. All tasks are independent except Task 6 depends on the middleware-utils file from sprint 2.

**Tech Stack:** Next.js 16, Supabase, Vitest, Svix, Resend, TypeScript strict mode.

---

## Task 1: Implement Webhook Bounce Test

**Files:**

- Modify: `src/app/api/email/webhook/route.test.ts` (replace `it.todo` at line 124)

**Context:** The webhook route at `src/app/api/email/webhook/route.ts` handles `email.bounced` events by iterating over `payload.data.to` and calling `supabase.from('profiles').update({ email_bounced_at: <timestamp> }).eq('email', <address>)`. The test file already has mocks for `svix` (via `mockVerify`) and `supabase` (via `createMockSupabaseClient`). We need to replace the `it.todo('marks profile email as bounced on bounce event')` stub with a real test.

**Step 1: Write the test**

Replace the `it.todo('marks profile email as bounced on bounce event')` at line 124 with:

```typescript
it('marks profile email as bounced on bounce event', async () => {
  const { POST } = await import('./route')

  const payload = {
    type: 'email.bounced',
    data: {
      email_id: 'email-456',
      to: ['bounced@example.com'],
      created_at: '2025-01-01T00:00:00Z',
    },
  }

  mockVerify.mockReturnValueOnce(payload)

  // Configure the chainable mock for the update call
  mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)
  mockSupabase._queryBuilder.eq = vi.fn().mockResolvedValue({ data: null, error: null })

  const request = new NextRequest('http://localhost:3000/api/email/webhook', {
    method: 'POST',
    headers: {
      'svix-id': 'msg_456',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,valid',
    },
    body: JSON.stringify(payload),
  })

  const response = await POST(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data).toEqual({ received: true })
  expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  expect(mockSupabase._queryBuilder.update).toHaveBeenCalledWith(
    expect.objectContaining({ email_bounced_at: expect.any(String) }),
  )
  expect(mockSupabase._queryBuilder.eq).toHaveBeenCalledWith('email', 'bounced@example.com')
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/api/email/webhook/route.test.ts`
Expected: 5 tests pass (was 4 + 2 todo, now 5 + 1 todo).

**Step 3: Commit**

```bash
git add src/app/api/email/webhook/route.test.ts
git commit -m "$(cat <<'EOF'
test: implement webhook bounce event test

Replaces it.todo stub with real test verifying that email.bounced
events update the profile's email_bounced_at timestamp.
EOF
)"
```

---

## Task 2: Implement Webhook Complaint Test

**Files:**

- Modify: `src/app/api/email/webhook/route.test.ts` (replace `it.todo` at line 125)

**Context:** Same file as Task 1. The `email.complained` handler calls `supabase.from('profiles').update({ email_complained_at: <timestamp> }).eq('email', <address>)`. Replace the remaining `it.todo`.

**Step 1: Write the test**

Replace the `it.todo('marks profile email as complained on complaint event')` with:

```typescript
it('marks profile email as complained on complaint event', async () => {
  const { POST } = await import('./route')

  const payload = {
    type: 'email.complained',
    data: {
      email_id: 'email-789',
      to: ['complainer@example.com'],
      created_at: '2025-01-01T00:00:00Z',
    },
  }

  mockVerify.mockReturnValueOnce(payload)

  mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)
  mockSupabase._queryBuilder.eq = vi.fn().mockResolvedValue({ data: null, error: null })

  const request = new NextRequest('http://localhost:3000/api/email/webhook', {
    method: 'POST',
    headers: {
      'svix-id': 'msg_789',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,valid',
    },
    body: JSON.stringify(payload),
  })

  const response = await POST(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data).toEqual({ received: true })
  expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  expect(mockSupabase._queryBuilder.update).toHaveBeenCalledWith(
    expect.objectContaining({ email_complained_at: expect.any(String) }),
  )
  expect(mockSupabase._queryBuilder.eq).toHaveBeenCalledWith('email', 'complainer@example.com')
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/api/email/webhook/route.test.ts`
Expected: 6 tests pass, 0 todo.

**Step 3: Commit**

```bash
git add src/app/api/email/webhook/route.test.ts
git commit -m "$(cat <<'EOF'
test: implement webhook complaint event test

Replaces it.todo stub with real test verifying that email.complained
events update the profile's email_complained_at timestamp.
EOF
)"
```

---

## Task 3: Implement Cron Reminder Email Sending Test

**Files:**

- Modify: `src/app/api/cron/send-reminders/route.test.ts` (replace `it.todo` at line 105)

**Context:** The cron route at `src/app/api/cron/send-reminders/route.ts` queries `reminders` table for due reminders, then for each reminder looks up the user profile, skips bounced/complained/opted-out emails, and calls `sendEmail`. The test file already mocks `createAdminClient`, `sendEmail` (as `mockSend`), and `ReminderEmail`. The chainable mock needs multi-table setup similar to `setupFromMock` in the checkin test, but since this route uses `createAdminClient` (not `requireAuth`), the mock is already wired up via `mockSupabase`.

The cron route uses a chained query: `.from('reminders').select(...).eq(...).in(...).lte(...)` — the `lte` mock was already used in the existing "no reminders" test (line 71). For the profiles query it uses `.from('profiles').select(...).in(...)`.

**Step 1: Write the test**

Replace the `it.todo('sends email for due reminders')` at line 105 with:

```typescript
it('sends email for due reminders', async () => {
  const { GET } = await import('./route')

  const mockReminder = {
    id: 'reminder-1',
    couple_id: 'couple-1',
    created_by: 'user-1',
    title: 'Date Night',
    message: 'Plan something fun!',
    notification_channel: 'email',
    frequency: 'once',
  }

  const mockProfile = {
    id: 'user-1',
    email: 'alice@example.com',
    email_unsubscribe_token: 'unsub-token',
    email_bounced_at: null,
    email_complained_at: null,
    email_opted_out_at: null,
  }

  // First .lte() call returns reminders
  mockSupabase._queryBuilder.lte.mockResolvedValueOnce({ data: [mockReminder], error: null })
  // Second chain: .from('profiles').select(...).in(...) returns profiles
  mockSupabase._queryBuilder.in
    .mockReturnValueOnce(mockSupabase._queryBuilder) // first .in() in reminders chain
    .mockResolvedValueOnce({ data: [mockProfile], error: null }) // second .in() in profiles chain

  mockSend.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null })

  // Mock the deactivation update (for one-time reminders)
  mockSupabase._queryBuilder.eq.mockResolvedValueOnce({ data: null, error: null })

  const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
    headers: { authorization: 'Bearer test-secret-key' },
  })

  const response = await GET(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data.sent).toBe(1)
  expect(mockSend).toHaveBeenCalledTimes(1)
  expect(mockSend).toHaveBeenCalledWith(
    expect.objectContaining({
      to: 'alice@example.com',
      subject: 'Reminder: Date Night',
    }),
  )
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/api/cron/send-reminders/route.test.ts`
Expected: 5 tests pass (was 3 + 2 todo, now 4 + 1 todo). Note: the chainable mock may need adjustment — if the `.in()` chaining doesn't work as expected, override `mockSupabase.from` to return different builders per table (use the `setupFromMock` pattern from `src/app/(app)/checkin/actions.test.ts`).

**Step 3: Commit**

```bash
git add src/app/api/cron/send-reminders/route.test.ts
git commit -m "$(cat <<'EOF'
test: implement cron reminder email sending test

Replaces it.todo stub with real test verifying that due reminders
trigger sendEmail calls with correct recipient and subject.
EOF
)"
```

---

## Task 4: Implement Cron Bounce-Skip Test

**Files:**

- Modify: `src/app/api/cron/send-reminders/route.test.ts` (replace `it.todo` at line 106)

**Context:** Same file as Task 3. The cron route skips profiles where `email_bounced_at`, `email_complained_at`, or `email_opted_out_at` is set (line 68 of route.ts). We need to verify that a reminder for a bounced email address does NOT trigger `sendEmail`.

**Step 1: Write the test**

Replace the `it.todo('skips reminders with bounced email addresses')` with:

```typescript
it('skips reminders with bounced email addresses', async () => {
  const { GET } = await import('./route')

  const mockReminder = {
    id: 'reminder-2',
    couple_id: 'couple-1',
    created_by: 'user-2',
    title: 'Check In',
    message: null,
    notification_channel: 'both',
    frequency: 'weekly',
  }

  const mockProfile = {
    id: 'user-2',
    email: 'bounced@example.com',
    email_unsubscribe_token: null,
    email_bounced_at: '2025-01-01T00:00:00Z', // bounced!
    email_complained_at: null,
    email_opted_out_at: null,
  }

  mockSupabase._queryBuilder.lte.mockResolvedValueOnce({ data: [mockReminder], error: null })
  mockSupabase._queryBuilder.in
    .mockReturnValueOnce(mockSupabase._queryBuilder) // reminders .in()
    .mockResolvedValueOnce({ data: [mockProfile], error: null }) // profiles .in()

  const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
    headers: { authorization: 'Bearer test-secret-key' },
  })

  const response = await GET(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data.sent).toBe(0)
  expect(mockSend).not.toHaveBeenCalled()
})
```

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/app/api/cron/send-reminders/route.test.ts`
Expected: 5 tests pass, 0 todo.

**Step 3: Commit**

```bash
git add src/app/api/cron/send-reminders/route.test.ts
git commit -m "$(cat <<'EOF'
test: implement cron bounce-skip test

Replaces it.todo stub with real test verifying that reminders
for bounced email addresses are skipped.
EOF
)"
```

---

## Task 5: Fix Missing App Routes in isAppRoute

**Files:**

- Modify: `src/lib/supabase/middleware-utils.ts:21-31`
- Modify: `src/lib/supabase/middleware-utils.test.ts` (add tests)

**Context:** The `isAppRoute` function in `middleware-utils.ts` determines which routes require a `couple_id`. Currently it checks for `/dashboard`, `/settings`, `/check-in`, `/notes`, `/milestones`, `/photos`, `/love-languages`. But the actual app routes under `src/app/(app)/` are: `checkin`, `dashboard`, `growth`, `love-languages`, `notes`, `reminders`, `requests`, `settings`. Several are missing:

- `/checkin` is the real route (not `/check-in`)
- `/growth` is missing (covers milestones + photos)
- `/reminders` is missing
- `/requests` is missing
- `/milestones` and `/photos` don't exist as standalone routes (they're under `/growth`)

**Step 1: Write the failing tests**

Add to `src/lib/supabase/middleware-utils.test.ts`, inside the existing `isAppRoute` describe block:

```typescript
it('matches /checkin', () => {
  expect(isAppRoute('/checkin')).toBe(true)
})

it('matches /growth', () => {
  expect(isAppRoute('/growth')).toBe(true)
})

it('matches /reminders', () => {
  expect(isAppRoute('/reminders')).toBe(true)
})

it('matches /requests', () => {
  expect(isAppRoute('/requests')).toBe(true)
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/supabase/middleware-utils.test.ts`
Expected: 4 new tests FAIL (these routes are not in `isAppRoute` yet).

**Step 3: Fix isAppRoute**

In `src/lib/supabase/middleware-utils.ts`, replace the `isAppRoute` function:

```typescript
export function isAppRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/checkin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/growth') ||
    pathname.startsWith('/love-languages') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/reminders') ||
    pathname.startsWith('/requests') ||
    pathname.startsWith('/settings')
  )
}
```

Remove `/check-in`, `/milestones`, `/photos` (those routes don't exist). Add `/checkin`, `/growth`, `/reminders`, `/requests`.

**Step 4: Update existing tests**

If there are existing tests for `/check-in`, `/milestones`, or `/photos` in the `isAppRoute` describe block, update them:

- Replace `/check-in` test with `/checkin`
- Replace `/milestones` test with `/growth`
- Remove `/photos` test (or make it expect `false`)

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/supabase/middleware-utils.test.ts`
Expected: All pass.

**Step 6: Run full test suite**

Run: `npx vitest run`
Expected: All pass.

**Step 7: Commit**

```bash
git add src/lib/supabase/middleware-utils.ts src/lib/supabase/middleware-utils.test.ts
git commit -m "$(cat <<'EOF'
fix: align isAppRoute with actual app directory routes

Adds /checkin, /growth, /reminders, /requests. Removes /check-in,
/milestones, /photos which don't exist as routes.
EOF
)"
```

---

## Task 6: Add shouldSendEmail Unit Tests

**Files:**

- Modify: `src/lib/email/send.test.ts` (add describe block)

**Context:** The `shouldSendEmail` function in `src/lib/email/send.ts` (lines 71-84) checks if we should send email to an address by querying `profiles` for `email_bounced_at`, `email_complained_at`, `email_opted_out_at`. It returns `false` if any is set, `true` otherwise, and `true` if profile is not found (unknown email = allow, e.g. invite to non-user).

The test file at `src/lib/email/send.test.ts` already mocks `./resend` but does NOT mock `@/lib/supabase/admin` — we need to add that mock for `shouldSendEmail` tests. Note: `shouldSendEmail` calls `createAdminClient()` internally (not passed in), so we need a module-level mock.

**Step 1: Add the mock and tests**

Add to `src/lib/email/send.test.ts`, after the existing mocks at the top:

```typescript
import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockAdminSupabase = createMockSupabaseClient()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminSupabase),
}))
```

Then add a new describe block at the end of the file:

```typescript
describe('shouldSendEmail', () => {
  it('returns true when profile has no flags set', async () => {
    const { shouldSendEmail } = await import('./send')

    mockAdminSupabase._queryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { email_bounced_at: null, email_complained_at: null, email_opted_out_at: null },
      error: null,
    })

    expect(await shouldSendEmail('clean@example.com')).toBe(true)
  })

  it('returns false when email has bounced', async () => {
    const { shouldSendEmail } = await import('./send')

    mockAdminSupabase._queryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { email_bounced_at: '2025-01-01T00:00:00Z', email_complained_at: null, email_opted_out_at: null },
      error: null,
    })

    expect(await shouldSendEmail('bounced@example.com')).toBe(false)
  })

  it('returns false when email has complained', async () => {
    const { shouldSendEmail } = await import('./send')

    mockAdminSupabase._queryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { email_bounced_at: null, email_complained_at: '2025-01-01T00:00:00Z', email_opted_out_at: null },
      error: null,
    })

    expect(await shouldSendEmail('complained@example.com')).toBe(false)
  })

  it('returns false when email has opted out', async () => {
    const { shouldSendEmail } = await import('./send')

    mockAdminSupabase._queryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { email_bounced_at: null, email_complained_at: null, email_opted_out_at: '2025-01-01T00:00:00Z' },
      error: null,
    })

    expect(await shouldSendEmail('optedout@example.com')).toBe(false)
  })

  it('returns true when profile is not found (unknown email)', async () => {
    const { shouldSendEmail } = await import('./send')

    mockAdminSupabase._queryBuilder.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    expect(await shouldSendEmail('unknown@example.com')).toBe(true)
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `npx vitest run src/lib/email/send.test.ts`
Expected: 10 tests pass (5 existing + 5 new).

**Step 3: Commit**

```bash
git add src/lib/email/send.test.ts
git commit -m "$(cat <<'EOF'
test: add shouldSendEmail unit tests

Covers clean email, bounced, complained, opted-out, and unknown
profile cases for the email deliverability check.
EOF
)"
```

---

## Task Dependency Graph

```
Task 1 (webhook bounce test)     — independent
Task 2 (webhook complaint test)  — independent
Task 3 (cron send test)          — independent
Task 4 (cron bounce-skip test)   — independent
Task 5 (fix isAppRoute)          — independent
Task 6 (shouldSendEmail tests)   — independent
```

All tasks are fully independent and can run in any order.

---

## Verification Checklist

After all tasks are complete, run the full quality pipeline:

```bash
npm run check   # lint + typecheck + format:check + test
npm run knip    # dead code detection
```

All must pass before creating the PR.
