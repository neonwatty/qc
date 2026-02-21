# Wave 3 Implementation Plan: Session Polish + Email Infrastructure

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add warm-up questions to check-in flow, turn duration extensions, email bounce/complaint handling, and unsubscribe infrastructure.

**Architecture:** Four independent tasks — two session UI features (warm-up step, turn extensions) and two email infrastructure features (webhook completion, unsubscribe). Tasks 3 and 4 share a single DB migration. All tasks are independent and can be implemented sequentially on one branch.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase Postgres, Resend email, Framer Motion, Vitest

---

## Task 1: Warm-Up Prompts Library

Create the curated prompt list and the `WarmUpStep` component, then wire it into the check-in flow.

### [01.1] Create warm-up prompts data file

**Files:**

- Create: `src/lib/warmup-prompts.ts`

**Code:**

```typescript
export type PromptTone = 'light' | 'medium' | 'deep'

export interface WarmUpPrompt {
  id: string
  text: string
  tone: PromptTone
}

export const WARMUP_PROMPTS: WarmUpPrompt[] = [
  // Light
  { id: 'l1', text: 'What made you smile this week?', tone: 'light' },
  { id: 'l2', text: 'Best meal you had recently?', tone: 'light' },
  { id: 'l3', text: 'What song has been stuck in your head?', tone: 'light' },
  { id: 'l4', text: "What's one thing you're looking forward to?", tone: 'light' },
  { id: 'l5', text: 'Describe your week in three words.', tone: 'light' },
  { id: 'l6', text: 'What was the highlight of your day?', tone: 'light' },
  { id: 'l7', text: "What's something small that made you happy recently?", tone: 'light' },

  // Medium
  { id: 'm1', text: "What's something I did this week that you appreciated?", tone: 'medium' },
  { id: 'm2', text: 'Is there anything you have been wanting to tell me?', tone: 'medium' },
  { id: 'm3', text: 'What is one thing we could do together this weekend?', tone: 'medium' },
  { id: 'm4', text: 'How are you feeling about us right now?', tone: 'medium' },
  { id: 'm5', text: 'When did you feel most connected to me recently?', tone: 'medium' },
  { id: 'm6', text: "What's something you wish we did more of?", tone: 'medium' },
  { id: 'm7', text: 'Is there something on your mind you have not shared yet?', tone: 'medium' },

  // Deep
  { id: 'd1', text: 'What is one way I can better support you right now?', tone: 'deep' },
  { id: 'd2', text: 'What does our relationship mean to you today?', tone: 'deep' },
  { id: 'd3', text: "What's a dream you have that we haven't talked about?", tone: 'deep' },
  { id: 'd4', text: 'How have we grown as a couple in the last few months?', tone: 'deep' },
  { id: 'd5', text: 'What is one fear you have about our future together?', tone: 'deep' },
  { id: 'd6', text: "What's something you admire about me that you don't say enough?", tone: 'deep' },
]

/** Pick one random prompt from each tone. */
export function pickThreePrompts(seed?: number): WarmUpPrompt[] {
  const byTone: Record<PromptTone, WarmUpPrompt[]> = { light: [], medium: [], deep: [] }
  for (const p of WARMUP_PROMPTS) {
    byTone[p.tone].push(p)
  }

  function pick(arr: WarmUpPrompt[]): WarmUpPrompt {
    const index = seed != null ? Math.abs(seed) % arr.length : Math.floor(Math.random() * arr.length)
    return arr[index]
  }

  return [pick(byTone.light), pick(byTone.medium), pick(byTone.deep)]
}
```

**Commit:** `feat: add warm-up prompts data library`

---

### [01.2] Write tests for warm-up prompts

**Files:**

- Create: `src/lib/warmup-prompts.test.ts`

**Code:**

```typescript
import { describe, it, expect } from 'vitest'
import { WARMUP_PROMPTS, pickThreePrompts } from './warmup-prompts'

describe('warmup-prompts', () => {
  it('has prompts for all three tones', () => {
    const tones = new Set(WARMUP_PROMPTS.map((p) => p.tone))
    expect(tones).toEqual(new Set(['light', 'medium', 'deep']))
  })

  it('has at least 5 prompts per tone', () => {
    const counts: Record<string, number> = {}
    for (const p of WARMUP_PROMPTS) {
      counts[p.tone] = (counts[p.tone] ?? 0) + 1
    }
    expect(counts['light']).toBeGreaterThanOrEqual(5)
    expect(counts['medium']).toBeGreaterThanOrEqual(5)
    expect(counts['deep']).toBeGreaterThanOrEqual(5)
  })

  it('has unique IDs', () => {
    const ids = WARMUP_PROMPTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('pickThreePrompts returns one from each tone', () => {
    const picked = pickThreePrompts(42)
    expect(picked).toHaveLength(3)
    const tones = picked.map((p) => p.tone)
    expect(tones).toContain('light')
    expect(tones).toContain('medium')
    expect(tones).toContain('deep')
  })

  it('pickThreePrompts is deterministic with seed', () => {
    const a = pickThreePrompts(7)
    const b = pickThreePrompts(7)
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id))
  })
})
```

**Run:** `npm test -- src/lib/warmup-prompts.test.ts`
**Expected:** All 5 tests pass.

**Commit:** `test: add warm-up prompts unit tests`

---

### [01.3] Add 'warm-up' to CheckInStep type and STEPS array

**Files:**

- Modify: `src/types/checkin.ts` — add `'warm-up'` to `CheckInStep` union (line 3-9)
- Modify: `src/contexts/check-in-reducer.ts` — add `'warm-up'` to `STEPS` array after `'category-selection'` (line 6-13)

In `src/types/checkin.ts`, the `CheckInStep` type becomes:

```typescript
export type CheckInStep =
  | 'welcome'
  | 'category-selection'
  | 'warm-up'
  | 'category-discussion'
  | 'reflection'
  | 'action-items'
  | 'completion'
```

In `src/contexts/check-in-reducer.ts`, STEPS becomes:

```typescript
export const STEPS: CheckInStep[] = [
  'welcome',
  'category-selection',
  'warm-up',
  'category-discussion',
  'reflection',
  'action-items',
  'completion',
]
```

**Run:** `npm run typecheck`
**Expected:** Clean (the switch in `page.tsx` doesn't need a `warm-up` case since default falls through to `CategorySelectionStep`)

**Commit:** `feat: add warm-up step to check-in step types`

---

### [01.4] Create WarmUpStep component

**Files:**

- Create: `src/components/checkin/WarmUpStep.tsx`

**Code:**

```typescript
'use client'

import { useState, useCallback } from 'react'
import { Shuffle, ArrowRight, SkipForward, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MotionBox } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { NavigationControls } from '@/components/checkin/NavigationControls'
import { useCheckInContext } from '@/contexts/CheckInContext'
import { pickThreePrompts } from '@/lib/warmup-prompts'
import { hapticFeedback } from '@/lib/haptics'
import type { WarmUpPrompt } from '@/lib/warmup-prompts'

const TONE_LABELS: Record<string, { label: string; color: string }> = {
  light: { label: 'Light', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  deep: { label: 'Deep', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

function PromptCard({ prompt }: { prompt: WarmUpPrompt }): React.ReactNode {
  const tone = TONE_LABELS[prompt.tone] ?? TONE_LABELS.light
  return (
    <motion.div
      className="rounded-lg border border-border bg-card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium mb-2', tone.color)}>
        {tone.label}
      </span>
      <p className="text-lg font-medium text-foreground">{prompt.text}</p>
    </motion.div>
  )
}

export function WarmUpStep(): React.ReactNode {
  const { completeStep, goToStep } = useCheckInContext()
  const [prompts, setPrompts] = useState<WarmUpPrompt[]>(() => pickThreePrompts())

  const handleShuffle = useCallback(() => {
    hapticFeedback.tap()
    setPrompts(pickThreePrompts())
  }, [])

  const handleContinue = useCallback(() => {
    completeStep('warm-up')
  }, [completeStep])

  const handleSkip = useCallback(() => {
    completeStep('warm-up')
  }, [completeStep])

  return (
    <MotionBox variant="page" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">
          <Sparkles className="h-10 w-10 mx-auto text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Warm-Up Questions</h2>
        <p className="text-muted-foreground">Pick a question to get the conversation flowing, or skip ahead.</p>
      </div>

      <div className="space-y-3">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={handleShuffle} className="gap-2 text-muted-foreground">
          <Shuffle className="h-4 w-4" />
          Shuffle
        </Button>
      </div>

      <NavigationControls
        currentStep="warm-up"
        canGoBack
        canGoNext
        onBack={() => goToStep('category-selection')}
        onNext={handleContinue}
        nextLabel="Continue"
        variant="floating"
        showProgress
        currentStepIndex={2}
        totalSteps={7}
      >
        <Button variant="ghost" size="sm" onClick={handleSkip} className="gap-1 text-muted-foreground">
          <SkipForward className="h-4 w-4" />
          Skip
        </Button>
      </NavigationControls>
    </MotionBox>
  )
}
```

**Commit:** `feat: create WarmUpStep component`

---

### [01.5] Wire WarmUpStep into check-in flow

**Files:**

- Modify: `src/app/(app)/checkin/steps.tsx` — export `WarmUpStep` re-export from component
- Modify: `src/app/(app)/checkin/page.tsx` — add `warm-up` case to CheckInWizard switch, conditionally skip warm-up if setting disabled

In `src/app/(app)/checkin/steps.tsx`, add the export at the top:

```typescript
export { WarmUpStep } from '@/components/checkin/WarmUpStep'
```

In `src/app/(app)/checkin/page.tsx`, add the import and case:

```typescript
import {
  CHECK_IN_CATEGORIES,
  CategorySelectionStep,
  CategoryDiscussionStep,
  ReflectionStep,
  ActionItemsStep,
  CompletionStep,
  WarmUpStep,
} from './steps'
```

And in `CheckInWizard`, add the `warm-up` case in the switch (between `category-selection` and `category-discussion`):

```typescript
case 'warm-up': {
  // Skip warm-up if setting is disabled — auto-advance to discussion
  if (!sessionSettings?.warmUpQuestions) {
    return <CategoryDiscussionStep />
  }
  return <WarmUpStep />
}
```

This requires adding the settings hook to CheckInWizard. Add at the top of `CheckInWizard`:

```typescript
const { getActiveSettings } = useSessionSettings()
const sessionSettings = getActiveSettings()
```

**Run:** `npm run typecheck && npm run lint`
**Expected:** Clean.

**Commit:** `feat: wire warm-up step into check-in flow`

---

### [01.6] Validate warm-up feature

**Run:** `npm run typecheck && npm run lint && npm test && npm run knip`
**Expected:** All pass.

---

## Task 2: Turn Duration Extensions

### [02.1] Add extension logic to useTurnState hook

**Files:**

- Modify: `src/hooks/useTurnState.ts`

Add to the return interface:

```typescript
/** Extend current turn by 60 seconds. No-op if max extensions reached. */
extendTurn: () => void
/** Number of extensions used this turn */
extensionsUsed: number
/** Maximum extensions per turn */
maxExtensions: number
```

Add to the options interface:

```typescript
/** Maximum extensions per turn (default 2) */
maxExtensions?: number
/** Whether extensions are allowed */
allowExtensions?: boolean
```

Implementation changes in `useTurnState`:

- Add `const [extensionsUsed, setExtensionsUsed] = useState(0)`
- Add `const maxExt = maxExtensions ?? 2`
- Reset `extensionsUsed` to 0 inside `switchTurn` callback
- Reset `extensionsUsed` to 0 in the auto-switch interval when timer expires
- Add `extendTurn` function:

```typescript
const extendTurn = useCallback(() => {
  if (!allowExtensions || extensionsUsed >= maxExt) return
  setTurnTimeRemaining((prev) => prev + 60)
  setExtensionsUsed((prev) => prev + 1)
}, [allowExtensions, extensionsUsed, maxExt])
```

Return: `{ ...existing, extendTurn, extensionsUsed, maxExtensions: maxExt }`

**Commit:** `feat: add turn extension logic to useTurnState`

---

### [02.2] Write tests for turn extension logic

**Files:**

- Create: `src/hooks/useTurnState.test.ts`

**Tests:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTurnState } from './useTurnState'

describe('useTurnState — extensions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('extendTurn adds 60 seconds', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 120, enabled: true, allowExtensions: true }))
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    const timeBefore = result.current.turnTimeRemaining
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.turnTimeRemaining).toBe(timeBefore + 60)
    expect(result.current.extensionsUsed).toBe(1)
  })

  it('respects max extensions limit', () => {
    const { result } = renderHook(() =>
      useTurnState({ turnDuration: 120, enabled: true, allowExtensions: true, maxExtensions: 2 }),
    )
    act(() => {
      result.current.extendTurn()
    })
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.extensionsUsed).toBe(2)
    const timeBefore = result.current.turnTimeRemaining
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.turnTimeRemaining).toBe(timeBefore)
    expect(result.current.extensionsUsed).toBe(2)
  })

  it('resets extensions on manual turn switch', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 120, enabled: true, allowExtensions: true }))
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.extensionsUsed).toBe(1)
    act(() => {
      result.current.switchTurn()
    })
    expect(result.current.extensionsUsed).toBe(0)
  })

  it('resets extensions on auto turn switch', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 5, enabled: true, allowExtensions: true }))
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.extensionsUsed).toBe(1)
    act(() => {
      vi.advanceTimersByTime(65000)
    })
    expect(result.current.extensionsUsed).toBe(0)
  })

  it('does nothing when allowExtensions is false', () => {
    const { result } = renderHook(() => useTurnState({ turnDuration: 120, enabled: true, allowExtensions: false }))
    const timeBefore = result.current.turnTimeRemaining
    act(() => {
      result.current.extendTurn()
    })
    expect(result.current.turnTimeRemaining).toBe(timeBefore)
    expect(result.current.extensionsUsed).toBe(0)
  })
})
```

**Run:** `npm test -- src/hooks/useTurnState.test.ts`
**Expected:** All 5 tests pass.

**Commit:** `test: add turn extension unit tests`

---

### [02.3] Add extension button to TurnIndicator UI

**Files:**

- Modify: `src/components/checkin/TurnIndicator.tsx`

Pass `allowExtensions: settings.allowExtensions` to the `useTurnState` call. Destructure `extendTurn`, `extensionsUsed`, `maxExtensions` from the hook return.

Add a "+1 min" button next to the "Pass Turn" button in the center column:

```tsx
{
  settings.allowExtensions && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        hapticFeedback.tap()
        extendTurn()
      }}
      disabled={extensionsUsed >= maxExtensions}
      className="h-7 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40"
    >
      <Plus className="mr-1 h-3 w-3" />
      +1 min {extensionsUsed > 0 && `(${extensionsUsed}/${maxExtensions})`}
    </Button>
  )
}
```

Add `Plus` to lucide-react imports.

**Run:** `npm run typecheck && npm run lint`
**Expected:** Clean.

**Commit:** `feat: add turn extension button to TurnIndicator`

---

### [02.4] Validate turn extensions feature

**Run:** `npm run typecheck && npm run lint && npm test && npm run knip`
**Expected:** All pass.

---

## Task 3: Email Webhook Completion + Migration

### [03.1] Create email status migration

**Files:**

- Create: `supabase/migrations/00013_email_status_columns.sql`

**Code:**

```sql
-- Add email status tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN email_bounced_at TIMESTAMPTZ,
  ADD COLUMN email_complained_at TIMESTAMPTZ,
  ADD COLUMN email_unsubscribe_token TEXT DEFAULT gen_random_uuid()::text,
  ADD COLUMN email_opted_out_at TIMESTAMPTZ;

-- Backfill unsubscribe tokens for existing profiles
UPDATE public.profiles
  SET email_unsubscribe_token = gen_random_uuid()::text
  WHERE email_unsubscribe_token IS NULL;

-- Ensure unsubscribe tokens are unique
CREATE UNIQUE INDEX idx_profiles_unsubscribe_token ON public.profiles (email_unsubscribe_token);
```

**Commit:** `feat: add email status columns to profiles (migration 00013)`

---

### [03.2] Update DbProfile type

**Files:**

- Modify: `src/types/database.ts` — add 4 new optional columns to `DbProfile` interface (after line 12)

Add:

```typescript
email_bounced_at: string | null
email_complained_at: string | null
email_unsubscribe_token: string | null
email_opted_out_at: string | null
```

**Commit:** `feat: update DbProfile type with email status columns`

---

### [03.3] Add shouldSendEmail guard to email send module

**Files:**

- Modify: `src/lib/email/send.ts` — add `shouldSendEmail()` function

Add at the end of the file:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Check if we should send email to this address.
 * Returns false if the profile has bounced, complained, or opted out.
 */
export async function shouldSendEmail(email: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('email_bounced_at, email_complained_at, email_opted_out_at')
    .eq('email', email)
    .maybeSingle()

  if (!data) return true // Unknown email — allow sending (e.g., invite to non-user)
  if (data.email_bounced_at) return false
  if (data.email_complained_at) return false
  if (data.email_opted_out_at) return false
  return true
}
```

**Commit:** `feat: add shouldSendEmail guard`

---

### [03.4] Implement webhook bounce/complaint handlers

**Files:**

- Modify: `src/app/api/email/webhook/route.ts`

Replace the entire file with the completed implementation:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ResendEventType = 'email.delivered' | 'email.bounced' | 'email.complained'

interface ResendWebhookPayload {
  type: ResendEventType
  data: {
    email_id: string
    to: string[]
    created_at: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  const signature = request.headers.get('svix-signature')

  if (webhookSecret && !signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const payload = (await request.json()) as ResendWebhookPayload
  const supabase = createAdminClient()

  switch (payload.type) {
    case 'email.delivered': {
      console.log('Email delivered:', payload.data.email_id)
      break
    }

    case 'email.bounced': {
      console.log('Email bounced:', payload.data.to)
      for (const email of payload.data.to) {
        await supabase.from('profiles').update({ email_bounced_at: new Date().toISOString() }).eq('email', email)
      }
      break
    }

    case 'email.complained': {
      console.log('Email complaint:', payload.data.to)
      for (const email of payload.data.to) {
        await supabase.from('profiles').update({ email_complained_at: new Date().toISOString() }).eq('email', email)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

**Commit:** `feat: implement email webhook bounce/complaint handlers`

---

### [03.5] Use shouldSendEmail in cron job

**Files:**

- Modify: `src/app/api/cron/send-reminders/route.ts`

Add import:

```typescript
import { sendEmail, shouldSendEmail } from '@/lib/email/send'
```

In the `for (const reminder of reminders)` loop (line 50), add the guard before sending:

```typescript
const email = emailMap.get(reminder.created_by)
if (!email) continue

const canSend = await shouldSendEmail(email)
if (!canSend) continue
```

**Run:** `npm run typecheck`
**Expected:** Clean.

**Commit:** `feat: add email send guard to reminder cron job`

---

### [03.6] Validate email webhook task

**Run:** `npm run typecheck && npm run lint && npm test && npm run knip`
**Expected:** All pass.

---

## Task 4: Unsubscribe Links + Route

### [04.1] Create unsubscribe API route

**Files:**

- Create: `src/app/api/email/unsubscribe/[token]/route.ts`

**Code:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token } = await params

  if (!token || token.length < 10) {
    return new NextResponse(unsubscribePage('Invalid unsubscribe link.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email_opted_out_at')
    .eq('email_unsubscribe_token', token)
    .maybeSingle()

  if (!profile) {
    return new NextResponse(unsubscribePage('Unsubscribe link not found or already expired.', false), {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (profile.email_opted_out_at) {
    return new NextResponse(unsubscribePage('You are already unsubscribed from QC emails.', true), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  await supabase.from('profiles').update({ email_opted_out_at: new Date().toISOString() }).eq('id', profile.id)

  return new NextResponse(
    unsubscribePage('You have been unsubscribed from QC emails. You can re-enable emails in your settings.', true),
    { headers: { 'Content-Type': 'text/html' } },
  )
}

function unsubscribePage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribe - QC</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb}
.card{max-width:420px;padding:2rem;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);text-align:center}
h1{font-size:1.25rem;color:${success ? '#059669' : '#dc2626'};margin-bottom:.75rem}
p{color:#374151;line-height:1.6}
a{color:#e11d48;text-decoration:none}</style></head>
<body><div class="card"><h1>${success ? 'Unsubscribed' : 'Error'}</h1><p>${message}</p><p style="margin-top:1.5rem"><a href="https://tryqc.co">Back to QC</a></p></div></body></html>`
}
```

**Commit:** `feat: create unsubscribe API route`

---

### [04.2] Add unsubscribe link to ReminderEmail template

**Files:**

- Modify: `src/lib/email/templates/reminder.tsx`

Add `unsubscribeUrl` prop:

```typescript
interface ReminderEmailProps {
  title?: string
  message?: string
  dashboardUrl?: string
  unsubscribeUrl?: string
}
```

Add the unsubscribe link to the footer, after the existing footer text:

```tsx
{
  unsubscribeUrl && (
    <Text style={footer}>
      <Link href={unsubscribeUrl} style={link}>
        Unsubscribe from email notifications
      </Link>
    </Text>
  )
}
```

**Commit:** `feat: add unsubscribe link to reminder email template`

---

### [04.3] Add unsubscribe link to InviteEmail template

**Files:**

- Modify: `src/lib/email/templates/invite.tsx`

Add `unsubscribeUrl` prop:

```typescript
interface InviteEmailProps {
  inviterName?: string
  inviteUrl?: string
  unsubscribeUrl?: string
}
```

Add the unsubscribe link before the closing `</Container>`:

```tsx
{
  unsubscribeUrl && (
    <Text style={footer}>
      <Link href={unsubscribeUrl} style={link}>
        Unsubscribe from QC emails
      </Link>
    </Text>
  )
}
```

**Commit:** `feat: add unsubscribe link to invite email template`

---

### [04.4] Pass unsubscribe URL when sending emails

**Files:**

- Modify: `src/app/api/cron/send-reminders/route.ts`

After querying profiles (line 40), also select `email_unsubscribe_token`:

```typescript
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email, email_unsubscribe_token')
  .in('id', userIds)
```

Build the unsubscribe URL and pass it to the template:

```typescript
const unsubscribeToken = profiles?.find((p) => p.id === reminder.created_by)?.email_unsubscribe_token
const unsubscribeUrl = unsubscribeToken ? `${baseUrl}/api/email/unsubscribe/${unsubscribeToken}` : undefined
```

Pass to `ReminderEmail({ ..., unsubscribeUrl })`.

Similarly, update the invite email calls in `src/app/onboarding/actions.ts` and `src/app/(app)/settings/actions.ts` to fetch the sender's unsubscribe token and pass it to `InviteEmail`.

**Commit:** `feat: pass unsubscribe URLs when sending emails`

---

### [04.5] Validate unsubscribe feature

**Run:** `npm run typecheck && npm run lint && npm test && npm run knip`
**Expected:** All pass.

---

## Task 5: Full Validation

### [05.1] Run all quality checks

**Run (in parallel):**

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run knip`

**Expected:** All clean. Fix any issues.

### [05.2] Commit, push, create PR

**Branch:** `feat/wave3-session-email`
**PR title:** `feat: Wave 3 — warm-up questions, turn extensions, email infrastructure`

---

## File Ownership Map

| File                                                 | Task |
| ---------------------------------------------------- | ---- |
| `src/lib/warmup-prompts.ts`                          | 1    |
| `src/lib/warmup-prompts.test.ts`                     | 1    |
| `src/components/checkin/WarmUpStep.tsx`              | 1    |
| `src/types/checkin.ts`                               | 1    |
| `src/contexts/check-in-reducer.ts`                   | 1    |
| `src/app/(app)/checkin/steps.tsx`                    | 1    |
| `src/app/(app)/checkin/page.tsx`                     | 1    |
| `src/hooks/useTurnState.ts`                          | 2    |
| `src/hooks/useTurnState.test.ts`                     | 2    |
| `src/components/checkin/TurnIndicator.tsx`           | 2    |
| `supabase/migrations/00013_email_status_columns.sql` | 3+4  |
| `src/types/database.ts`                              | 3    |
| `src/lib/email/send.ts`                              | 3+4  |
| `src/app/api/email/webhook/route.ts`                 | 3    |
| `src/app/api/cron/send-reminders/route.ts`           | 3+4  |
| `src/app/api/email/unsubscribe/[token]/route.ts`     | 4    |
| `src/lib/email/templates/reminder.tsx`               | 4    |
| `src/lib/email/templates/invite.tsx`                 | 4    |
| `src/app/onboarding/actions.ts`                      | 4    |
| `src/app/(app)/settings/actions.ts`                  | 4    |
