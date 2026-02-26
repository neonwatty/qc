# Plan 03: Check-in Session Enhancements

**Priority**: HIGH | **Effort**: Large | **Parallel Group**: B | **Dependencies**: None (01 is nice-to-have)

## Problem

The check-in session is missing key interactive elements from the prototype: session timer with countdown, turn indicator, confetti celebration, auto-save drafts, and the overall session feel is too simple. The prototype made check-ins feel like a structured, guided experience. Production feels like a form wizard.

## Current State

- 7 check-in components: ActionItems, CategoryCard, CategoryGrid, CompletionCelebration, NavigationControls, SessionRulesCard, ProgressBar
- CheckInContext manages session state with Supabase persistence
- BookendsContext handles preparation (topics) and reflection (mood/gratitude)
- SessionSettingsContext has 3 templates (Quick/Standard/Deep Dive) with duration, timeouts, turns, etc.
- Session settings stored in DB but timer/turn features are config-only — no active UI

## Plan

### Phase 1: Session Timer Component

1. **Create `useSessionTimer` hook** (`src/hooks/useSessionTimer.ts`):
   - Accepts `durationMinutes` from session settings
   - Returns `{ timeRemaining, isRunning, isPaused, start, pause, resume, reset }`
   - Counts down from session duration
   - Fires `onTimeUp` callback when timer expires
   - Persists timer state to avoid losing on page refresh (sessionStorage)

2. **Create `SessionTimer.tsx`** component (`src/components/checkin/SessionTimer.tsx`):
   - Circular or bar countdown display
   - Shows minutes:seconds remaining
   - Pause/resume button
   - Color transitions: green → yellow → red as time runs out
   - Pulse animation in last 60 seconds
   - Optional: gentle chime/haptic on time up

3. **Mount SessionTimer** in the check-in wizard during Category Discussion step

### Phase 2: Turn Indicator Component

4. **Create `TurnIndicator.tsx`** (`src/components/checkin/TurnIndicator.tsx`):
   - Shows whose turn it is to speak (user or partner)
   - Visual: Two avatars/initials with active highlight
   - Turn timer (countdown from `turn_duration` setting)
   - "Pass Turn" button
   - Only visible when `turn_based_mode` is enabled in session settings

5. **Integrate TurnIndicator** into CategoryDiscussionStep
6. **Add turn state** to CheckInContext: `currentTurn`, `switchTurn()`, `turnTimeRemaining`

### Phase 3: Auto-Save Drafts

7. **Create `useAutoSave` hook** (`src/hooks/useAutoSave.ts`):
   - Accepts a value and a save function
   - Debounced save (2 second delay after last change)
   - Returns `{ isSaving, lastSavedAt }`
   - Shows subtle "Saved" indicator

8. **Wire auto-save** into:
   - Reflection form (mood, gratitude, takeaway)
   - Action items (title, description)
   - In-session notes

### Phase 4: Enhanced Completion Celebration

9. **Upgrade `CompletionCelebration.tsx`**:
   - Canvas-confetti burst on mount (from Plan 01)
   - Animated stat counters (count-up from 0)
   - Session duration display (formatted: "12m 34s")
   - Categories discussed count
   - Action items created count
   - Mood improvement indicator (if mood_after > mood_before)
   - "Next check-in in 7 days" recommendation
   - "Start Another" and "Go Home" buttons with haptic feedback

### Phase 5: Session Settings Schema Update

10. **Create migration** `make db-new name=add_session_settings_fields`:

    ```sql
    ALTER TABLE session_settings
      ADD COLUMN pause_notifications boolean DEFAULT false,
      ADD COLUMN auto_save_drafts boolean DEFAULT true;
    ```

11. **Update SessionSettingsContext** to include new fields
12. **Update SessionSettingsPanel** in settings to expose toggles

## Files to Modify

| File                                                        | Action                             |
| ----------------------------------------------------------- | ---------------------------------- |
| `src/hooks/useSessionTimer.ts`                              | Create — countdown timer hook      |
| `src/hooks/useAutoSave.ts`                                  | Create — debounced auto-save hook  |
| `src/components/checkin/SessionTimer.tsx`                   | Create — timer UI component        |
| `src/components/checkin/TurnIndicator.tsx`                  | Create — turn-taking UI            |
| `src/components/checkin/CompletionCelebration.tsx`          | Enhance celebration                |
| `src/contexts/CheckInContext.tsx`                           | Add turn state + timer integration |
| `src/contexts/SessionSettingsContext.tsx`                   | Add new fields                     |
| `src/components/settings/SessionSettingsPanel.tsx`          | Add new toggles                    |
| `src/types/index.ts` or `src/types/checkin.ts`              | Add turn/timer types               |
| `supabase/migrations/000XX_add_session_settings_fields.sql` | New migration                      |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] `make db-push` — migration applies
- [ ] Manual: Start a check-in, verify timer counts down
- [ ] Manual: Enable turn-based mode, verify turn indicator appears and switches
- [ ] Manual: Edit reflection, verify auto-save indicator
- [ ] Manual: Complete check-in, verify confetti + animated stats

## Task List

| #    | Task                                                     | Can Parallel?     |
| ---- | -------------------------------------------------------- | ----------------- |
| 3.1  | Create useSessionTimer hook with tests                   | No (first)        |
| 3.2  | Create SessionTimer UI component                         | After 3.1         |
| 3.3  | Create TurnIndicator component                           | Parallel with 3.2 |
| 3.4  | Add turn state to CheckInContext                         | After 3.3         |
| 3.5  | Create useAutoSave hook with tests                       | Parallel with 3.2 |
| 3.6  | Wire auto-save into reflection + action items            | After 3.5         |
| 3.7  | Enhance CompletionCelebration (confetti, counters, mood) | Parallel with 3.2 |
| 3.8  | Create DB migration for session settings fields          | Parallel with 3.2 |
| 3.9  | Update SessionSettingsContext + Panel                    | After 3.8         |
| 3.10 | Integration test: full check-in flow with timer + turns  | After all above   |
| 3.11 | Run full validation                                      | After 3.10        |
