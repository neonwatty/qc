# Feature Plan 1: Onboarding Enhancements

## Goal

Add two new onboarding steps — a **Quiz Step** (relationship preferences survey) and a **Reminder Setup Step** — between the existing Love Languages step and the Feature Tour step. This personalizes the experience and creates the user's first check-in reminder automatically.

## Current State

The onboarding flow is a 5-step wizard in `src/app/onboarding/page.tsx`:

```
Step 1: Display Name → Step 2: Partner Email → Step 3: Relationship Date
→ Step 4: Love Languages → Step 5: Feature Tour → Complete
```

State is managed with individual `useState` hooks. Form data is collected via hidden inputs and submitted to `completeOnboarding` server action which creates the couple, sends invites, and redirects to `/dashboard`.

## Target State

```
Step 1: Display Name → Step 2: Partner Email → Step 3: Relationship Date
→ Step 4: Love Languages → Step 5: Quiz → Step 6: Reminder Setup
→ Step 7: Feature Tour → Complete
```

## New Files

### 1. `src/components/onboarding/QuizStep.tsx` (~120 lines)

Three-question animated survey with sub-question navigation:

| Question            | Field                | Options                                                          |
| ------------------- | -------------------- | ---------------------------------------------------------------- |
| Communication style | `communicationStyle` | Face-to-face, Written notes, During activities, Mix of all       |
| Check-in frequency  | `checkInFrequency`   | Daily, Weekly, Bi-weekly, Monthly                                |
| Session style       | `sessionStyle`       | Quick & focused (10 min), Standard (20 min), Deep dive (30+ min) |

**Props:**

```typescript
interface QuizStepProps {
  preferences: { communicationStyle: string; checkInFrequency: string; sessionStyle: string }
  updatePreferences: (prefs: Partial<QuizStepProps['preferences']>) => void
  onNext: () => void
  onBack: () => void
}
```

**Behavior:**

- Internal `currentQuestion` state (0-2) with auto-advance on selection (300ms delay)
- Sub-question progress bar (3 segments)
- Framer Motion slide transitions between questions
- "Continue" enabled only when all 3 answered
- Option buttons with emoji + label, pink highlight when selected
- Back navigates to previous onboarding step, not previous question

### 2. `src/components/onboarding/ReminderStep.tsx` (~130 lines)

Day-of-week + time picker with optional personal reminder:

**Props:**

```typescript
interface ReminderStepProps {
  reminderDay: string
  reminderTime: string
  onUpdate: (day: string, time: string) => void
  onNext: () => void
  onBack: () => void
}
```

**UI Sections:**

1. **Day picker** — 7-button grid (Mon-Sun), single-select, default Sunday
2. **Time picker** — 4 preset cards with emoji (9 AM, 12 PM, 6 PM, 8 PM), default 8 PM
3. **Quick reminder templates** (optional) — 4 preset cards:
   - "Buy flowers for partner" / "Plan date night" / "Tell partner you love them" / "Give partner a compliment"
   - Uses partner's display name dynamically (passed as prop or "your partner" fallback)
4. **Preview banner** — shows "Every {Day} at {Time}" with preview button
5. **Helper text** — "You can add more reminders later in Settings"

**Behavior:**

- Day/time selection is immediate (no save button)
- "Continue" always enabled (defaults are sensible)
- Optional personal reminder stored in state but not required

### 3. `src/components/onboarding/QuizStep.test.tsx` (~80 lines)

Tests:

- Renders all 3 questions when navigating through
- Auto-advances to next question on selection
- "Continue" disabled until all questions answered
- Back button calls `onBack`
- Calls `updatePreferences` with correct values

### 4. `src/components/onboarding/ReminderStep.test.tsx` (~80 lines)

Tests:

- Renders day grid and time cards
- Default selection is Sunday + 8 PM
- Clicking a day updates selection
- Clicking a time updates selection
- Continue calls `onNext`
- Back calls `onBack`
- Preview shows selected day/time

## Modified Files

### 5. `src/app/onboarding/page.tsx`

**Changes:**

- `TOTAL_STEPS` from 5 to 7
- Add state: `preferences` object (`communicationStyle`, `checkInFrequency`, `sessionStyle`), `reminderDay`, `reminderTime`
- Add hidden inputs for new fields: `preferences`, `reminderDay`, `reminderTime`
- Insert `QuizStep` at step 5 and `ReminderStep` at step 6
- Shift `TourStep` to step 7, update its `onBack` to `setStep(6)`
- Import new components

### 6. `src/app/onboarding/actions.ts`

**Changes:**

- Extend `onboardingSchema` with optional fields:
  ```typescript
  preferences: z.string().optional(),  // JSON string
  reminderDay: z.string().optional(),
  reminderTime: z.string().optional(),
  ```
- After couple creation, if `preferences` provided:
  - Parse JSON, validate with inner schema
  - Store in `couples.settings` JSONB: `{ communicationStyle, checkInFrequency, sessionStyle }`
- After couple creation, if `reminderDay` + `reminderTime` provided:
  - Create a default check-in reminder in `reminders` table:
    ```sql
    INSERT INTO reminders (couple_id, created_by, title, message, category, frequency,
      scheduled_for, notification_channel, is_active)
    VALUES ($coupleId, $userId, 'Weekly Check-in',
      'Time for your check-in!', 'check-in', 'weekly',
      <computed next occurrence>, 'both', true)
    ```
  - Store `custom_schedule` JSONB: `{ dayOfWeek: reminderDay, time: reminderTime }`
- Both are non-blocking (try-catch, continue to redirect on failure)

### 7. `src/app/onboarding/actions.test.ts`

**Add tests:**

- `completeOnboarding` with preferences saves to `couples.settings`
- `completeOnboarding` with reminder day/time creates a reminder row
- Missing preferences/reminder fields still complete onboarding successfully
- Invalid preferences JSON is ignored (non-blocking)

### 8. `src/app/onboarding/onboarding-steps.test.tsx`

**Update:** Adjust any step number assertions if tests reference step indices.

## No Database Migration Needed

- `couples.settings` is already JSONB — adding new keys requires no schema change
- `reminders` table already exists with all needed columns (`frequency`, `custom_schedule`, `scheduled_for`, `notification_channel`)
- Quiz preferences are stored in `couples.settings` JSONB

## Implementation Order

1. `QuizStep.tsx` + tests
2. `ReminderStep.tsx` + tests
3. `page.tsx` (wire new steps, bump TOTAL_STEPS)
4. `actions.ts` (save preferences + create reminder)
5. `actions.test.ts` (new test cases)
6. Run `npm run check` — verify all tests pass

## Complexity

- **New files:** 4 (2 components + 2 test files)
- **Modified files:** 4 (page, actions, 2 test files)
- **DB migrations:** 0
- **Estimated lines:** ~500 new
- **Risk:** Low — additive-only, no existing behavior changes
