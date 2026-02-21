# Plan 10: Streak Tracking & Gamification

**Priority**: HIGH | **Effort**: Small | **Parallel Group**: B | **Dependencies**: None

## Problem

No streak tracking or gamification. The prototype had a streak counter with CountUp animation, making consistent check-ins feel rewarding. Streaks are a proven engagement and retention mechanic.

## Current State

- Check-ins are tracked in `check_ins` table with `completed_at` timestamps
- No streak calculation exists
- No streak display on dashboard or check-in completion
- BookendsContext has a `reflectionStreak` field but it's not computed from real data

## Plan

### Phase 1: Streak Calculation Logic

1. **Create `lib/streaks.ts`**:

   ```ts
   export interface StreakData {
     currentStreak: number // consecutive weeks with a check-in
     longestStreak: number // all-time best
     lastCheckInDate: string | null
     totalCheckIns: number
   }

   export async function getStreakData(coupleId: string, supabase: SupabaseClient): Promise<StreakData>
   ```

2. **Streak logic**:
   - A "streak" = consecutive weeks where at least 1 check-in was completed
   - Query `check_ins` WHERE `couple_id = X` AND `status = 'completed'` ORDER BY `completed_at` DESC
   - Group by ISO week
   - Count consecutive weeks from current week backward
   - Track longest streak across all history
   - Edge case: current week counts if a check-in was completed this week

3. **Unit tests** for streak calculation:
   - No check-ins → streak 0
   - One check-in this week → streak 1
   - Check-ins every week for 4 weeks → streak 4
   - Gap breaks streak → correct current and longest
   - Multiple check-ins in one week count as one

### Phase 2: Dashboard Streak Display

4. **Create `StreakDisplay.tsx`** (`src/components/dashboard/StreakDisplay.tsx`):
   - Large flame icon with streak number
   - "X week streak!" text
   - Animated count-up on mount (from 0 to current)
   - Milestone badges at 4, 8, 12, 26, 52 weeks
   - Glow/pulse animation when streak is active
   - Gray state when streak is 0 ("Start your streak!")

5. **Create `useCountUp` hook** (`src/hooks/useCountUp.ts`):
   - Accepts target number and duration
   - Returns current animated value
   - Uses requestAnimationFrame for smooth counting

6. **Wire into dashboard** StatsGrid or as a standalone hero widget

### Phase 3: Streak Milestones

7. **Define streak milestones** in `lib/streaks.ts`:

   ```ts
   export const STREAK_MILESTONES = [
     { weeks: 4, label: '1 Month', emoji: '🔥' },
     { weeks: 8, label: '2 Months', emoji: '💪' },
     { weeks: 12, label: '3 Months', emoji: '⭐' },
     { weeks: 26, label: '6 Months', emoji: '🏆' },
     { weeks: 52, label: '1 Year', emoji: '👑' },
   ]
   ```

8. **Show milestone badge** on StreakDisplay when current streak matches a milestone
9. **Trigger confetti** (from Plan 01) when a new milestone is reached
10. **Create auto-milestone** in milestones table when streak milestones are hit

### Phase 4: Check-in Completion Integration

11. **Show streak update** on `CompletionCelebration.tsx`:
    - "Streak: X weeks → Y weeks!" with animation
    - Special celebration if a streak milestone was just reached
    - Warning if streak will break soon ("Check in by Sunday to keep your streak!")

## Files to Create/Modify

| File                                               | Action                                   |
| -------------------------------------------------- | ---------------------------------------- |
| `src/lib/streaks.ts`                               | Create — streak calculation + milestones |
| `src/lib/streaks.test.ts`                          | Create — unit tests                      |
| `src/hooks/useCountUp.ts`                          | Create — animated counter hook           |
| `src/components/dashboard/StreakDisplay.tsx`       | Create — streak widget                   |
| `src/components/checkin/CompletionCelebration.tsx` | Add streak update display                |
| `src/app/(app)/dashboard/page.tsx`                 | Wire streak data + display               |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass (including streak calculation tests)
- [ ] Manual: Dashboard shows correct streak based on check-in history
- [ ] Manual: Complete a check-in, verify streak updates on celebration screen
- [ ] Manual: Count-up animation plays on dashboard mount
- [ ] Manual: Streak milestone badge appears at 4+ weeks

## Task List

| #    | Task                                               | Can Parallel?      |
| ---- | -------------------------------------------------- | ------------------ |
| 10.1 | Create lib/streaks.ts with calculation logic       | No (first)         |
| 10.2 | Write unit tests for streak calculation            | After 10.1         |
| 10.3 | Create useCountUp hook                             | Parallel with 10.1 |
| 10.4 | Create StreakDisplay dashboard widget              | After 10.1, 10.3   |
| 10.5 | Define streak milestones + auto-milestone creation | After 10.1         |
| 10.6 | Add streak update to CompletionCelebration         | After 10.1         |
| 10.7 | Wire streak into dashboard page                    | After 10.4         |
| 10.8 | Run full validation                                | After all above    |
