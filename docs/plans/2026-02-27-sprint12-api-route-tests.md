# Sprint 12: API Route Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for the 3 untested API routes — cron send-reminders, email webhook, and email unsubscribe. ~25 new tests bringing total to ~655.

**Architecture:** Each route exports a single HTTP handler (GET or POST). Tests call the handler directly with mock `NextRequest` objects. Mock `createAdminClient` for DB queries, `sendEmail` for email, and `Webhook` (svix) for signature verification. Pattern follows existing `health/route.test.ts`.

**Tech Stack:** Vitest

---

### Task 1: Cron Send-Reminders Route Tests

**Files:**

- Create: `src/app/api/cron/send-reminders/route.test.ts`
- Source: `src/app/api/cron/send-reminders/route.ts` (107 lines)

**Context:**
`GET` handler authenticates via `Bearer ${CRON_SECRET}` header (timing-safe comparison). Queries `reminders` table for active email-enabled reminders due now. Looks up profiles for email addresses, skipping bounced/complained/opted-out. Sends emails via `sendEmail`. Deactivates one-time reminders after send.

Key behaviors:

- Returns 401 when no auth header
- Returns 401 when wrong secret
- Returns `{ status: 'ok', sent: 0 }` when no reminders due
- Sends email for eligible reminders and returns sent count
- Skips bounced/complained/opted-out profiles
- Deactivates one-time (`frequency: 'once'`) reminders after sending
- Returns 500 on DB query error

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFrom = vi.fn()
const mockAdminClient = { from: mockFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

const mockSendEmail = vi.fn().mockResolvedValue({ error: null })
vi.mock('@/lib/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

vi.mock('@/lib/email/templates/reminder', () => ({
  ReminderEmail: vi.fn().mockReturnValue('mock-email-jsx'),
}))

const { GET } = await import('./route')

function makeRequest(authHeader?: string): NextRequest {
  const headers = new Headers()
  if (authHeader) headers.set('authorization', authHeader)
  return new NextRequest('http://localhost/api/cron/send-reminders', { headers })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('CRON_SECRET', 'test-secret')
})

describe('GET /api/cron/send-reminders', () => {
  it('returns 401 when no auth header', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when wrong secret', async () => {
    const res = await GET(makeRequest('Bearer wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('returns 401 when CRON_SECRET is unset', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const res = await GET(makeRequest('Bearer test-secret'))
    expect(res.status).toBe(401)
  })

  it('returns sent: 0 when no reminders due', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    })

    const res = await GET(makeRequest('Bearer test-secret'))
    const data = await res.json()
    expect(data.sent).toBe(0)
  })

  it('returns 500 on DB query error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB fail' } }),
          }),
        }),
      }),
    })

    const res = await GET(makeRequest('Bearer test-secret'))
    expect(res.status).toBe(500)
  })

  it('sends email and returns sent count', async () => {
    // First call: reminders query
    const remindersChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'r1',
                  couple_id: 'c1',
                  created_by: 'u1',
                  title: 'Test',
                  message: 'Do it',
                  notification_channel: 'email',
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }

    // Second call: profiles query
    const profilesChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'u1',
              email: 'test@example.com',
              email_unsubscribe_token: 'tok',
              email_bounced_at: null,
              email_complained_at: null,
              email_opted_out_at: null,
            },
          ],
        }),
      }),
    }

    // Third call: deactivate reminders
    const deactivateChain = {
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) return remindersChain
      if (callCount === 2) return profilesChain
      return deactivateChain
    })

    const res = await GET(makeRequest('Bearer test-secret'))
    const data = await res.json()
    expect(data.sent).toBe(1)
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('skips bounced profiles', async () => {
    const remindersChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'r1',
                  couple_id: 'c1',
                  created_by: 'u1',
                  title: 'Test',
                  message: null,
                  notification_channel: 'email',
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }

    const profilesChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'u1',
              email: 'test@example.com',
              email_unsubscribe_token: null,
              email_bounced_at: '2025-01-01',
              email_complained_at: null,
              email_opted_out_at: null,
            },
          ],
        }),
      }),
    }

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      return callCount === 1 ? remindersChain : profilesChain
    })

    const res = await GET(makeRequest('Bearer test-secret'))
    const data = await res.json()
    expect(data.sent).toBe(0)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/app/api/cron/send-reminders/route.test.ts`
Expected: 7 tests pass

**Step 3: Commit**

```bash
git add src/app/api/cron/send-reminders/route.test.ts
git commit -m "test: add cron send-reminders API route tests"
```

---

### Task 2: Email Webhook Route Tests

**Files:**

- Create: `src/app/api/email/webhook/route.test.ts`
- Source: `src/app/api/email/webhook/route.ts` (85 lines)

**Context:**
`POST` handler verifies Resend webhook signatures via `svix` library. Requires `RESEND_WEBHOOK_SECRET` env var and `svix-id`, `svix-timestamp`, `svix-signature` headers. On `email.bounced`, updates `email_bounced_at` on profile. On `email.complained`, updates `email_complained_at`. On `email.delivered`, just logs.

Key behaviors:

- Returns 401 when webhook secret not configured
- Returns 401 when signature headers missing
- Returns 401 when signature is invalid
- Returns `{ received: true }` for delivered event
- Updates `email_bounced_at` for bounce event
- Updates `email_complained_at` for complaint event

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
const mockAdminClient = {
  from: vi.fn().mockReturnValue({ update: mockUpdate }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

const mockVerify = vi.fn()
vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({ verify: mockVerify })),
}))

const { POST } = await import('./route')

function makeWebhookRequest(body: string, headers?: Record<string, string>): NextRequest {
  const h = new Headers({
    'svix-id': 'msg_123',
    'svix-timestamp': '1234567890',
    'svix-signature': 'v1_sig',
    ...headers,
  })
  return new NextRequest('http://localhost/api/email/webhook', {
    method: 'POST',
    headers: h,
    body,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('RESEND_WEBHOOK_SECRET', 'whsec_test')
  mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
})

describe('POST /api/email/webhook', () => {
  it('returns 401 when webhook secret not configured', async () => {
    vi.stubEnv('RESEND_WEBHOOK_SECRET', '')
    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(401)
  })

  it('returns 401 when signature headers missing', async () => {
    const req = new NextRequest('http://localhost/api/email/webhook', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when signature verification fails', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('invalid')
    })
    const res = await POST(makeWebhookRequest('{}'))
    expect(res.status).toBe(401)
  })

  it('returns received: true for delivered event', async () => {
    mockVerify.mockReturnValue({
      type: 'email.delivered',
      data: { email_id: 'e1', to: ['test@test.com'], created_at: '2025-01-01' },
    })
    const res = await POST(makeWebhookRequest('{}'))
    const data = await res.json()
    expect(data).toEqual({ received: true })
  })

  it('updates profile on bounce event', async () => {
    mockVerify.mockReturnValue({
      type: 'email.bounced',
      data: { email_id: 'e1', to: ['bounced@test.com'], created_at: '2025-01-01' },
    })

    const mockEq = vi.fn().mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })

    const res = await POST(makeWebhookRequest('{}'))
    const data = await res.json()
    expect(data).toEqual({ received: true })
    expect(mockAdminClient.from).toHaveBeenCalledWith('profiles')
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ email_bounced_at: expect.any(String) }))
  })

  it('updates profile on complaint event', async () => {
    mockVerify.mockReturnValue({
      type: 'email.complained',
      data: { email_id: 'e1', to: ['spam@test.com'], created_at: '2025-01-01' },
    })

    const mockEq = vi.fn().mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })

    const res = await POST(makeWebhookRequest('{}'))
    const data = await res.json()
    expect(data).toEqual({ received: true })
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ email_complained_at: expect.any(String) }))
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/app/api/email/webhook/route.test.ts`
Expected: 6 tests pass

**Step 3: Commit**

```bash
git add src/app/api/email/webhook/route.test.ts
git commit -m "test: add email webhook API route tests"
```

---

### Task 3: Email Unsubscribe Route Tests

**Files:**

- Create: `src/app/api/email/unsubscribe/[token]/route.test.ts`
- Source: `src/app/api/email/unsubscribe/[token]/route.ts` (76 lines)

**Context:**
`GET` handler takes a token from URL params. Validates token length >= 10. Looks up profile by `email_unsubscribe_token`. If already opted out, returns success message. Otherwise sets `email_opted_out_at`. Returns HTML pages for all states.

Key behaviors:

- Returns 400 for short/missing token
- Returns 404 when token not found in DB
- Returns success HTML when already unsubscribed
- Sets `email_opted_out_at` and returns success HTML
- Returns 500 on DB update error

**Step 1: Write the tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockMaybeSingle = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: mockEq,
      }),
    }),
  }),
}))

const { GET } = await import('./route')

function callGET(token: string): Promise<Response> {
  const req = new NextRequest(`http://localhost/api/email/unsubscribe/${token}`)
  return GET(req, { params: Promise.resolve({ token }) })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockEq.mockResolvedValue({ error: null })
})

describe('GET /api/email/unsubscribe/[token]', () => {
  it('returns 400 for short token', async () => {
    const res = await callGET('short')
    expect(res.status).toBe(400)
  })

  it('returns 404 when token not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    const res = await callGET('valid-token-1234')
    expect(res.status).toBe(404)
  })

  it('returns 200 when already unsubscribed', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'u1', email_opted_out_at: '2025-01-01' },
    })
    const res = await callGET('valid-token-1234')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('already unsubscribed')
  })

  it('sets email_opted_out_at and returns success', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'u1', email_opted_out_at: null },
    })
    mockEq.mockResolvedValue({ error: null })

    const res = await callGET('valid-token-1234')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('unsubscribed from QC emails')
  })

  it('returns 500 on DB update error', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'u1', email_opted_out_at: null },
    })
    mockEq.mockResolvedValue({ error: { message: 'DB fail' } })

    const res = await callGET('valid-token-1234')
    expect(res.status).toBe(500)
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/app/api/email/unsubscribe/\\[token\\]/route.test.ts`
Expected: 5 tests pass

**Step 3: Commit**

```bash
git add src/app/api/email/unsubscribe/\[token\]/route.test.ts
git commit -m "test: add email unsubscribe API route tests"
```

---

## Summary

| Task      | File                                                  | Tests  | Focus                                        |
| --------- | ----------------------------------------------------- | ------ | -------------------------------------------- |
| 1         | `src/app/api/cron/send-reminders/route.test.ts`       | 7      | Auth, send flow, skip bounced, deactivate    |
| 2         | `src/app/api/email/webhook/route.test.ts`             | 6      | Svix verification, bounce/complaint handling |
| 3         | `src/app/api/email/unsubscribe/[token]/route.test.ts` | 5      | Token validation, opt-out, error states      |
| **Total** | **3 new files**                                       | **18** |                                              |

Expected test count after Sprint 12: **~648 tests** (630 + 18)

**Milestone:** After this sprint, all API routes and all server-side logic files have test coverage. Only UI components remain untested.
