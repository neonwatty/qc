# Plan 04: Dashboard Upgrades

**Priority**: HIGH | **Effort**: Medium | **Parallel Group**: A | **Dependencies**: Plan 10 (streak data)

## Problem

The dashboard is a link page, not a command center. It shows static counts and quick action buttons but lacks actionable context: no preparation banner, no today's reminders, no streak display, no dynamic activity feed, no relationship duration stat.

## Current State

- `dashboard-content.tsx` — Header + Partner pairing prompt + widgets
- `QuickActions.tsx` — 6 action cards (check-in, notes, growth, reminders, love languages, requests)
- `StatsGrid.tsx` — 4 stat cards (check-ins, notes, milestones, action items)
- `LoveLanguagesWidget.tsx` — Shows total + shared count

## Plan

### Phase 1: Preparation Banner

1. **Create `PrepBanner.tsx`** (`src/components/dashboard/PrepBanner.tsx`):
   - Appears when user has prepared topics in BookendsContext
   - Shows: "You have X topics prepared" with topic count badge
   - CTA: "Start Check-in" (goes to /checkin)
   - Gradient background (rose → pink)
   - Dismiss button
   - Only shows if topics exist and no active check-in session

2. **Wire PrepBanner** into dashboard-content above QuickActions

### Phase 2: Today's Reminders Widget

3. **Create `TodayReminders.tsx`** (`src/components/dashboard/TodayReminders.tsx`):
   - Query reminders where `scheduled_for` is today and `is_active = true`
   - Show up to 3 reminders with title + time + category badge
   - "View All" link to /reminders
   - Empty state: "No reminders today" with subtle message
   - Overdue reminders highlighted in amber/red

4. **Add server query** in dashboard page to fetch today's reminders

### Phase 3: Enhanced Stats Grid

5. **Add new stats** to StatsGrid:
   - **Current Streak** (flame icon, needs streak calculation) — depends on Plan 10
   - **Relationship Duration** (calendar icon, computed from `couples.relationship_start_date`)
   - **Last Check-in** (clock icon, computed from most recent `check_ins.completed_at`)

6. **Format helpers**:
   - Streak: "5 weeks" or "3 days"
   - Duration: "1 year, 3 months" or "45 days"
   - Last check-in: "2 days ago" or "Today"

7. **Update StatsGrid** to accept optional extra stats, or create `ExtendedStatsGrid`

### Phase 4: Dynamic Activity Feed

8. **Create `RecentActivity.tsx`** (`src/components/dashboard/RecentActivity.tsx`):
   - Query the 5 most recent events across tables:
     - Check-ins completed
     - Notes created/updated
     - Milestones achieved
     - Action items completed
     - Requests accepted
   - Display as a timeline with:
     - Icon per event type
     - Description text ("Completed a check-in on Communication")
     - Relative timestamp ("2 hours ago")
   - "View more" link or expandable

9. **Create server function** `getRecentActivity()` in `lib/activity.ts`:
   - UNION query across relevant tables
   - Ordered by timestamp DESC
   - Limit 5-10

### Phase 5: Love Languages Widget Enhancement

10. **Enhance `LoveLanguagesWidget.tsx`**:
    - Show actual top 2-3 love language names (not just counts)
    - Show partner's shared languages preview (if any)
    - Mini importance badges

## Files to Create/Modify

| File                                               | Action                                |
| -------------------------------------------------- | ------------------------------------- |
| `src/components/dashboard/PrepBanner.tsx`          | Create                                |
| `src/components/dashboard/TodayReminders.tsx`      | Create                                |
| `src/components/dashboard/RecentActivity.tsx`      | Create                                |
| `src/components/dashboard/StatsGrid.tsx`           | Enhance with new stats                |
| `src/components/dashboard/LoveLanguagesWidget.tsx` | Enhance with language names           |
| `src/app/(app)/dashboard/page.tsx`                 | Add new queries + wire new widgets    |
| `src/lib/activity.ts`                              | Create — recent activity query helper |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] Manual: Dashboard shows prep banner when topics exist
- [ ] Manual: Today's reminders display correctly
- [ ] Manual: Stats show streak, duration, last check-in
- [ ] Manual: Activity feed shows recent events across features
- [ ] Manual: Love languages widget shows actual language names

## Task List

| #   | Task                                           | Can Parallel?        |
| --- | ---------------------------------------------- | -------------------- |
| 4.1 | Create PrepBanner component                    | Yes (parallel start) |
| 4.2 | Create TodayReminders widget + server query    | Parallel with 4.1    |
| 4.3 | Create RecentActivity widget + lib/activity.ts | Parallel with 4.1    |
| 4.4 | Enhance StatsGrid (duration, last check-in)    | Parallel with 4.1    |
| 4.5 | Add streak stat to StatsGrid (after Plan 10)   | After Plan 10        |
| 4.6 | Enhance LoveLanguagesWidget                    | Parallel with 4.1    |
| 4.7 | Wire all new widgets into dashboard page       | After 4.1-4.4, 4.6   |
| 4.8 | Run full validation                            | After 4.7            |
