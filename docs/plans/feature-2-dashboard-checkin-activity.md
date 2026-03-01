# Feature Plan 2: Dashboard — CheckInCard + ActivityFeed Enhancements

## Goal

Replace the current text-based "last check-in" display on the dashboard with a rich **CheckInCard** widget (countdown timer, progress ring, frequency tracking) and enhance the existing **RecentActivity** widget with type filters and a "load more" mechanism.

## Current State

### Dashboard (`src/app/(app)/dashboard/page.tsx`)

- Server component fetches 15 parallel queries including `lastCheckIn` date
- Passes data to `DashboardContent` client component
- `DashboardContent` renders: PrepBanner, QuickActions, StreakDisplay, TodayReminders, RecentActivity, StatsGrid, LoveLanguagesWidget

### StatsGrid (`src/components/dashboard/StatsGrid.tsx`)

- Shows 6 stat cards including "Last Check-in" (relative time) and "Check-ins" (total count)
- Simple number display, no interactive elements

### RecentActivity (`src/components/dashboard/RecentActivity.tsx`)

- Shows 5 most recent activities across all types (check-ins, notes, milestones, action items, requests)
- No filtering, no pagination, fixed at 5 items
- Each item has icon, description, and relative timestamp

### Dashboard Data Fetch (`src/components/dashboard/DashboardContent.tsx`)

- Receives all data as props from server component
- No client-side data fetching except visibility-based refresh

## Target State

1. New `CheckInCard` widget replaces the "Last Check-in" stat card
2. `RecentActivity` gains type filter tabs and "Load more" button
3. Dashboard page fetches additional data for CheckInCard (frequency goal from couple settings)

## New Files

### 1. `src/components/dashboard/CheckInCard.tsx` (~150 lines)

A card widget showing check-in health and encouraging regular check-ins.

**Props:**

```typescript
interface CheckInCardProps {
  lastCheckInDate: string | null
  totalCheckIns: number
  currentStreak: number
  frequencyGoal: string | null // 'daily' | 'weekly' | 'biweekly' | 'monthly' | null
}
```

**UI Sections:**

1. **Progress Ring** (SVG circle, ~60px):
   - Green (0-50% of goal elapsed), Yellow (50-75%), Red (75-100%), Pulsing red (overdue)
   - Center shows days since last check-in or checkmark if within goal
   - Ring fills based on time elapsed vs. frequency goal

2. **Status Text**:
   - "Last check-in: {relative time}" or "No check-ins yet"
   - If overdue: "Overdue by {X days}" in red
   - If on track: "Next check-in in {X days}" in green

3. **Streak Badge**: Flame icon + current streak count (reuses StreakDisplay pattern)

4. **CTA Button**: "Start Check-in" linking to `/checkin`
   - Variant changes: `default` when on track, `destructive` when overdue

**Behavior:**

- Pure presentational — all data passed as props
- `frequencyGoal` defaults to 'weekly' if null (7-day cycle)
- Progress ring is SVG with `stroke-dasharray` animation
- No client-side timers — recalculates on render from `lastCheckInDate`

### 2. `src/components/dashboard/CheckInCard.test.tsx` (~80 lines)

Tests:

- Renders "No check-ins yet" when `lastCheckInDate` is null
- Shows relative time for recent check-in
- Shows "Overdue" when past frequency goal
- Shows "Next check-in in X days" when on track
- CTA button links to `/checkin`
- Progress ring color changes based on time elapsed
- Streak badge displays correctly

## Modified Files

### 3. `src/app/(app)/dashboard/page.tsx`

**Changes:**

- Add query for `checkInFrequency` from `couples.settings` JSONB:
  ```typescript
  const frequencyResult = await supabase.from('couples').select('settings').eq('id', coupleId).single()
  const frequencyGoal = frequencyResult.data?.settings?.checkInFrequency ?? null
  ```
- Pass `frequencyGoal` to `DashboardContent`

### 4. `src/components/dashboard/DashboardContent.tsx`

**Changes:**

- Accept new `frequencyGoal` prop
- Replace the "Last Check-in" stat in StatsGrid with `CheckInCard` widget
- Add `CheckInCard` to layout in a prominent position (above or alongside StreakDisplay)
- Pass `lastCheckIn`, `checkInCount`, `currentStreak`, `frequencyGoal` to CheckInCard

### 5. `src/components/dashboard/RecentActivity.tsx`

**Changes to add type filtering and load more:**

- Add `activityType` filter state: `'all' | 'check-in' | 'note' | 'milestone' | 'action-item' | 'request'`
- Add filter pill bar (same pattern as notes/reminders pages):
  ```tsx
  <div className="flex gap-2 overflow-x-auto">
    {FILTER_OPTIONS.map(f => <FilterPill key={f.id} ... />)}
  </div>
  ```
- Add `displayCount` state (starts at 5, increments by 5)
- Add "Show more" button when `filtered.length > displayCount`
- Filter activities client-side from existing data
- Reset `displayCount` to 5 when filter changes

**Note:** The server already fetches enough activity data (currently limited to 5). Need to increase server fetch limit to ~20 to support "load more":

- In `getRecentActivity()` helper, change `.limit(5)` to `.limit(20)` for each query

### 6. `src/components/dashboard/RecentActivity.test.tsx`

**Update tests:**

- Test filter pills render for each activity type
- Test filtering shows only matching type
- Test "Show more" button appears when > 5 items
- Test "Show more" increments visible items

### 7. `src/components/dashboard/DashboardContent.test.tsx`

**Update:** Add CheckInCard to expected rendering, pass new props.

## No Database Migration Needed

- `couples.settings` JSONB already stores `checkInFrequency` (from onboarding quiz in Plan 1)
- If Plan 1 isn't done first, `frequencyGoal` will be `null` and CheckInCard defaults to weekly — still works

## Dependencies

- **Soft dependency on Plan 1**: If onboarding quiz is implemented first, `checkInFrequency` will be populated in `couples.settings`. If not, CheckInCard falls back to weekly default.

## Implementation Order

1. `CheckInCard.tsx` + tests (standalone component)
2. `RecentActivity.tsx` modifications + test updates (standalone)
3. `page.tsx` (add frequency query)
4. `DashboardContent.tsx` (wire CheckInCard, pass new props)
5. `DashboardContent.test.tsx` updates
6. Run `npm run check` — verify all tests pass

## Complexity

- **New files:** 2 (CheckInCard + test)
- **Modified files:** 5 (page, DashboardContent, RecentActivity, 2 test files)
- **DB migrations:** 0
- **Estimated lines:** ~350 new, ~80 modified
- **Risk:** Low — CheckInCard is additive; RecentActivity changes are backwards-compatible
