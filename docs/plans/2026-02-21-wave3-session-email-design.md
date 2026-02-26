# Wave 3 Design: Session Polish + Email Infrastructure

## Scope

Two themes, four tasks:

| #   | Task                                     | Theme   | Effort |
| --- | ---------------------------------------- | ------- | ------ |
| 1   | Warm-up Questions step in check-in flow  | Session | ~3h    |
| 2   | Turn Duration Extensions (+1 min button) | Session | ~1h    |
| 3   | Email Webhook Completion                 | Email   | ~2h    |
| 4   | Unsubscribe links + unsubscribe route    | Email   | ~3h    |

---

## Task 1: Warm-Up Questions Step

### Problem

The `warm_up_questions` setting exists in the DB, context, and settings UI, but enabling it does nothing. No warm-up content is shown during check-in.

### Design

Insert a new step between category selection and category discussion when `warmUpQuestions` is enabled.

**Content:** A curated list of ~20 icebreaker prompts organized by tone (light, medium, deep). The step shows 3 prompts (one from each tone) and the user can shuffle for new ones or skip the step entirely.

**Warm-up prompt examples:**

- Light: "What made you smile this week?", "Best meal you had recently?"
- Medium: "What's something I did this week that you appreciated?", "Is there anything you've been wanting to tell me?"
- Deep: "What's one way I can better support you right now?", "What does our relationship mean to you today?"

**Flow:**

1. Check-in starts → Category selection → **Warm-Up (if enabled)** → Discussion → Reflection → Action Items → Celebration
2. Warm-up step shows 3 prompts with a "Shuffle" button and "Skip" button
3. Selecting a prompt is optional — it's conversation fuel, not a form
4. "Continue" advances to discussion; "Skip" also advances

**Files:**

- Create: `src/components/checkin/WarmUpStep.tsx` — the warm-up UI
- Create: `src/lib/warmup-prompts.ts` — curated prompt list with categories
- Modify: `src/app/(app)/checkin/steps.tsx` — add WarmUpStep between category selection and discussion
- Create: `src/components/checkin/WarmUpStep.test.ts` — unit tests

### Data model

No DB changes. Prompts are static content. The `warm_up_questions` boolean on `session_settings` controls whether the step appears.

---

## Task 2: Turn Duration Extensions

### Problem

The `allow_extensions` setting exists in the DB and settings UI but does nothing during a check-in. When turn-based mode is active, there's no way to extend a turn.

### Design

Add a "+1 min" button to the `TurnIndicator` component when `allowExtensions` is enabled.

**Behavior:**

- Button appears next to the "Pass Turn" button
- Max 2 extensions per turn (resets when turn switches)
- Each tap adds 60 seconds to `turnTimeRemaining`
- Haptic feedback on tap
- Button disabled (grayed) after 2 extensions used
- Extensions counter resets on turn switch

**Files:**

- Modify: `src/hooks/useTurnState.ts` — add `extendTurn()` and `extensionsUsed` state
- Modify: `src/components/checkin/TurnIndicator.tsx` — add extension button UI
- Create: `src/hooks/useTurnState.test.ts` — unit tests for extension logic

### Data model

No DB changes. `allow_extensions` boolean on `session_settings` already exists.

---

## Task 3: Email Webhook Completion

### Problem

The email webhook handler at `src/app/api/email/webhook/route.ts` has 3 TODOs — bounce and complaint events are logged to console but not persisted.

### Design

**On bounce:** Add `email_bounced_at` timestamp column to `profiles`. When a bounce event arrives for an email matching a profile, set `email_bounced_at = now()`. The cron job and any email-sending code checks this column and skips bounced profiles.

**On complaint:** Same mechanism — add `email_complained_at` column. On complaint, set the timestamp. Email-sending code skips profiles with either column set.

**On delivery:** Log to console (no DB action needed for v1).

**Email-sending guard:** Add a helper `shouldSendEmail(email: string)` in `src/lib/email/send.ts` that queries the profile by email and returns `false` if bounced or complained.

**Files:**

- Create: `supabase/migrations/00013_email_status_columns.sql` — add `email_bounced_at` and `email_complained_at` to profiles
- Modify: `src/app/api/email/webhook/route.ts` — implement bounce/complaint handlers
- Modify: `src/lib/email/send.ts` — add `shouldSendEmail()` guard
- Modify: `src/app/api/cron/send-reminders/route.ts` — use `shouldSendEmail()` before sending
- Modify: `src/types/database.ts` — add new columns to DbProfile

---

## Task 4: Unsubscribe Links + Route

### Problem

Email templates have no unsubscribe mechanism. Users can't opt out of reminder emails.

### Design

**Unsubscribe token:** Add `email_unsubscribe_token` column to `profiles` (auto-generated UUID). This token is included in every email footer as an unsubscribe link.

**Unsubscribe route:** `GET /api/email/unsubscribe/[token]` — validates token, sets `email_opted_out_at` timestamp on the matching profile, returns a simple HTML confirmation page.

**Re-subscribe:** From the settings page, user can toggle email notifications back on (clears `email_opted_out_at`).

**Email template changes:** Both `InviteEmail` and `ReminderEmail` get an unsubscribe link in the footer. The link points to `https://tryqc.co/api/email/unsubscribe/[token]`.

**Email-sending guard update:** `shouldSendEmail()` also checks `email_opted_out_at`.

**Files:**

- Modify: `supabase/migrations/00013_email_status_columns.sql` — also add `email_unsubscribe_token` and `email_opted_out_at`
- Create: `src/app/api/email/unsubscribe/[token]/route.ts` — unsubscribe endpoint
- Modify: `src/lib/email/templates/invite.tsx` — add unsubscribe link
- Modify: `src/lib/email/templates/reminder.tsx` — add unsubscribe link
- Modify: `src/lib/email/send.ts` — update `shouldSendEmail()` to check opt-out
- Create: `src/app/api/email/unsubscribe/[token]/route.test.ts` — unit tests

### Migration (combined with Task 3)

```sql
-- 00013_email_status_columns.sql
ALTER TABLE public.profiles
  ADD COLUMN email_bounced_at TIMESTAMPTZ,
  ADD COLUMN email_complained_at TIMESTAMPTZ,
  ADD COLUMN email_unsubscribe_token TEXT DEFAULT gen_random_uuid()::text,
  ADD COLUMN email_opted_out_at TIMESTAMPTZ;
```

---

## Validation Criteria

- `npm run typecheck` — clean
- `npm run lint` — 0 errors, 0 warnings
- `npm run test` — all tests pass (existing + new)
- `npm run knip` — no dead code
- Warm-up step only appears when `warmUpQuestions` enabled in settings
- Extension button only appears when `allowExtensions` enabled and turn-based mode on
- Webhook correctly marks bounced/complained profiles
- Unsubscribe link works in email templates
- Emails skip bounced/complained/opted-out profiles
