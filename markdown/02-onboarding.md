# Plan 02: Enrich Onboarding Flow

**Priority**: HIGH | **Effort**: Medium | **Parallel Group**: A | **Dependencies**: None

## Problem

Production onboarding has 3 steps (display name, partner email, relationship start date). The prototype had 6 steps including a personality quiz, love language selection, and feature tour. New users get no orientation and no personalization — they're dropped into the dashboard cold.

## Current State

- `src/app/onboarding/page.tsx` — 3-step wizard with progress bar
- `src/app/onboarding/actions.ts` — server action `completeOnboarding()` that creates couple + sends invite
- Steps: name input → partner email → relationship start date (optional)

## Plan

### Step 1: Add Love Language Selection (Step 3 of 5)

Insert after "Relationship Start Date" and before final step:

1. **UI**: Grid of 5 love language category cards + custom option
   - Words of Affirmation (💬)
   - Acts of Service (🤝)
   - Receiving Gifts (🎁)
   - Quality Time (⏰)
   - Physical Touch (🤗)
   - Custom (✨)
2. **Behavior**: Multi-select (pick top 2-3), optional step (can skip)
3. **Data flow**: Selected languages are saved to `love_languages` table after couple creation
4. **Server action**: Extend `completeOnboarding()` to accept `selectedLanguages` array, insert after couple is created

### Step 2: Add Feature Tour (Step 4 of 5)

Insert as the step before completion:

1. **UI**: Animated walkthrough of 4 key features:
   - Check-ins (MessageCircle icon) — "Guided conversations with your partner"
   - Notes (StickyNote icon) — "Shared and private notes for your journey"
   - Love Languages (Heart icon) — "Discover how you and your partner feel loved"
   - Growth (TrendingUp icon) — "Track milestones and celebrate wins"
2. **Behavior**: Auto-advance cards with manual navigation, skip button
3. **No server action needed** — purely informational step

### Step 3: Add Welcome Enhancement (Step 1)

Enhance the existing first step:

1. **Add heart icon animation** (Framer Motion scale-in with spring)
2. **Add setup promise**: "Takes about 2 minutes to set up"
3. **Add 3-icon preview grid** showing what they'll configure

### Step 4: Update Progress Bar

1. Update from 3 steps to 5 steps
2. Step labels: Welcome → Partner Details → Relationship → Love Languages → Feature Tour
3. Keep the gradient progress bar styling

### Step 5: Add Completion Celebration

1. After the final step, show a brief celebration before redirect
2. Confetti burst (from Plan 01) or simple scale-in animation
3. "You're all set!" message with partner name
4. Auto-redirect to dashboard after 2 seconds

## Files to Modify

| File                                 | Action                                                |
| ------------------------------------ | ----------------------------------------------------- |
| `src/app/onboarding/page.tsx`        | Add 2 new steps, enhance welcome, update progress bar |
| `src/app/onboarding/actions.ts`      | Extend to accept + save love languages                |
| `src/app/onboarding/actions.test.ts` | Add tests for new action params                       |

## New Files

| File                                                | Purpose        |
| --------------------------------------------------- | -------------- |
| None — all changes are in existing onboarding files | Keep it simple |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass (including updated action tests)
- [ ] Manual: Walk through all 5 onboarding steps
- [ ] Manual: Skip love languages, verify no crash
- [ ] Manual: Select love languages, verify they appear in Love Languages page after onboarding
- [ ] Manual: Feature tour navigates correctly
- [ ] Manual: Completion celebration shows, then redirects to dashboard

## Task List

| #   | Task                                                       | Can Parallel?     |
| --- | ---------------------------------------------------------- | ----------------- |
| 2.1 | Design 5-step onboarding flow with updated progress bar    | No (first)        |
| 2.2 | Build Love Language selection step UI                      | After 2.1         |
| 2.3 | Build Feature Tour step UI                                 | Parallel with 2.2 |
| 2.4 | Enhance Welcome step (animation, promise, preview)         | Parallel with 2.2 |
| 2.5 | Extend completeOnboarding server action for love languages | After 2.2         |
| 2.6 | Add completion celebration screen                          | After 2.3         |
| 2.7 | Update unit tests                                          | After 2.5         |
| 2.8 | Run full validation                                        | After all above   |
