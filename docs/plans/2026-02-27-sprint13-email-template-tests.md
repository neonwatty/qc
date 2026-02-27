# Sprint 13: Email Template Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add unit tests for all 6 email templates. Each template is a pure React component using `@react-email/components`. Tests verify rendering with defaults, custom props, conditional unsubscribe link, and template-specific logic (rarity mapping, priority colors, categories list). ~20 new tests bringing total to ~652.

**Architecture:** Use `@testing-library/react` `render` + `screen.getByText`/`queryByText` for content assertions. Split into 2 test files to stay under 150-line ESLint limit. No mocks needed — templates are pure components.

**Tech Stack:** Vitest + @testing-library/react

---

### Task 1: Simple Template Tests (Welcome, Invite, Reminder)

**Files:**

- Create: `src/lib/email/templates/simple-templates.test.tsx`
- Source: `welcome.tsx` (130 lines), `invite.tsx` (116 lines), `reminder.tsx` (105 lines)

**Context:**
All three follow the same pattern: accept props with defaults, render heading + body + CTA button, conditionally render unsubscribe link. No complex logic.

**Step 1: Write the tests**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { WelcomeEmail } from './welcome'
import { InviteEmail } from './invite'
import { ReminderEmail } from './reminder'

describe('WelcomeEmail', () => {
  it('renders with default props', () => {
    render(<WelcomeEmail />)
    expect(screen.getByText(/Welcome to QC, there!/)).toBeDefined()
  })

  it('renders custom name', () => {
    render(<WelcomeEmail name="Alice" />)
    expect(screen.getByText(/Welcome to QC, Alice!/)).toBeDefined()
  })

  it('shows unsubscribe link when URL provided', () => {
    render(<WelcomeEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(screen.getByText(/Unsubscribe from QC emails/)).toBeDefined()
  })

  it('hides unsubscribe link when no URL', () => {
    render(<WelcomeEmail />)
    expect(screen.queryByText(/Unsubscribe from QC emails/)).toBeNull()
  })
})

describe('InviteEmail', () => {
  it('renders with default props', () => {
    render(<InviteEmail />)
    expect(screen.getByText(/You have been invited to QC/)).toBeDefined()
  })

  it('renders custom inviter name', () => {
    render(<InviteEmail inviterName="Bob" />)
    expect(screen.getByText(/Bob has invited you/)).toBeDefined()
  })

  it('shows unsubscribe link when URL provided', () => {
    render(<InviteEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(screen.getByText(/Unsubscribe from QC emails/)).toBeDefined()
  })
})

describe('ReminderEmail', () => {
  it('renders with default props', () => {
    render(<ReminderEmail />)
    expect(screen.getByText(/Reminder: Reminder/)).toBeDefined()
  })

  it('renders custom title and message', () => {
    render(<ReminderEmail title="Date Night" message="Don't forget!" />)
    expect(screen.getByText(/Reminder: Date Night/)).toBeDefined()
    expect(screen.getByText(/Don't forget!/)).toBeDefined()
  })

  it('shows unsubscribe link when URL provided', () => {
    render(<ReminderEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(screen.getByText(/Unsubscribe from email notifications/)).toBeDefined()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/email/templates/simple-templates.test.tsx`
Expected: 10 tests pass

**Step 3: Commit**

```bash
git add src/lib/email/templates/simple-templates.test.tsx
git commit -m "test: add welcome, invite, and reminder email template tests"
```

---

### Task 2: Complex Template Tests (CheckInSummary, Milestone, RequestNotification)

**Files:**

- Create: `src/lib/email/templates/complex-templates.test.tsx`
- Source: `checkin-summary.tsx` (155 lines), `milestone.tsx` (166 lines), `request-notification.tsx` (163 lines)

**Context:**
These templates have conditional rendering and data mapping logic:

- `CheckInSummaryEmail`: conditionally renders categories list, singular/plural "action item(s)" text
- `MilestoneEmail`: maps rarity string to emoji (`common`→`⭐`, `rare`→`✨`, `epic`→`🌟`, `legendary`→`💎`) with `⭐` fallback
- `RequestNotificationEmail`: maps priority to color, capitalizes priority label

**Step 1: Write the tests**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CheckInSummaryEmail } from './checkin-summary'
import { MilestoneEmail } from './milestone'
import { RequestNotificationEmail } from './request-notification'

describe('CheckInSummaryEmail', () => {
  it('renders with default props', () => {
    render(<CheckInSummaryEmail />)
    expect(screen.getByText(/Check-In Complete/)).toBeDefined()
  })

  it('renders mood values', () => {
    render(<CheckInSummaryEmail yourMood="Happy" partnerMood="Calm" />)
    expect(screen.getByText(/You: Happy/)).toBeDefined()
    expect(screen.getByText(/Partner: Calm/)).toBeDefined()
  })

  it('renders categories when provided', () => {
    render(<CheckInSummaryEmail categories={['Communication', 'Trust']} />)
    expect(screen.getByText(/Communication/)).toBeDefined()
    expect(screen.getByText(/Trust/)).toBeDefined()
  })

  it('renders singular action item text', () => {
    render(<CheckInSummaryEmail actionItemCount={1} />)
    expect(screen.getByText(/1 action item/)).toBeDefined()
  })

  it('renders plural action items text', () => {
    render(<CheckInSummaryEmail actionItemCount={3} />)
    expect(screen.getByText(/3 action items/)).toBeDefined()
  })
})

describe('MilestoneEmail', () => {
  it('renders with default props', () => {
    render(<MilestoneEmail />)
    expect(screen.getByText(/Milestone Achieved!/)).toBeDefined()
  })

  it('renders custom title', () => {
    render(<MilestoneEmail title="First Check-in" />)
    expect(screen.getByText(/First Check-in/)).toBeDefined()
  })

  it('capitalizes rarity label', () => {
    render(<MilestoneEmail rarity="epic" />)
    expect(screen.getByText(/Epic Milestone/)).toBeDefined()
  })
})

describe('RequestNotificationEmail', () => {
  it('renders with default props', () => {
    render(<RequestNotificationEmail />)
    expect(screen.getByText(/New Request from Your partner/)).toBeDefined()
  })

  it('renders custom partner name and title', () => {
    render(<RequestNotificationEmail partnerName="Alice" title="Plan date night" />)
    expect(screen.getByText(/New Request from Alice/)).toBeDefined()
    expect(screen.getByText(/Plan date night/)).toBeDefined()
  })
})
```

**Step 2: Run the test**

Run: `npx vitest run src/lib/email/templates/complex-templates.test.tsx`
Expected: 10 tests pass

**Step 3: Commit**

```bash
git add src/lib/email/templates/complex-templates.test.tsx
git commit -m "test: add check-in summary, milestone, and request notification email template tests"
```

---

## Summary

| Task      | File                                                 | Tests  | Focus                                         |
| --------- | ---------------------------------------------------- | ------ | --------------------------------------------- |
| 1         | `src/lib/email/templates/simple-templates.test.tsx`  | 10     | Welcome, Invite, Reminder rendering + unsub   |
| 2         | `src/lib/email/templates/complex-templates.test.tsx` | 10     | Summary categories, Milestone rarity, Request |
| **Total** | **2 new files**                                      | **20** |                                               |

Expected test count after Sprint 13: **~652 tests** (632 + 20)

**Milestone:** After this sprint, all email templates have test coverage. Every non-component source file in the project is tested.
