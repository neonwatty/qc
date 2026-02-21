# Plan 07: Growth Analytics & Data Visualization

**Priority**: MEDIUM | **Effort**: Medium | **Parallel Group**: C | **Dependencies**: None

## Problem

The Growth page has Timeline/Progress/Memories views but no data visualization. The prototype had a chart showing relationship health over time and progress bars for 5 growth areas. Without analytics, the app is a journaling tool, not a measurement system.

## Current State

- Growth page with 3 tab views (Timeline, Progress, Memories)
- Milestone cards with category, rarity, points
- MilestoneCreator with photo upload
- No chart library installed
- No computed growth metrics

## Plan

### Phase 1: Install Chart Library

1. **Install a lightweight chart library**:
   - Option A: `recharts` — React-native charts, popular, good API
   - Option B: `chart.js` + `react-chartjs-2` — Flexible, well-documented
   - **Recommendation**: `recharts` (smaller bundle, React-idiomatic, responsive out of box)
   - `npm install recharts`

### Phase 2: Growth Areas Progress Bars

2. **Define 5 growth areas** with scoring logic:
   - **Communication** — Score based on: check-in frequency + notes shared + discussions completed
   - **Emotional Connection** — Score based on: mood improvements + reflections completed + love languages shared
   - **Conflict Resolution** — Score based on: action items completed + requests handled
   - **Future Planning** — Score based on: milestones created + goals set (future) + reminders active
   - **Intimacy** — Score based on: love actions completed + quality time activities

3. **Create scoring function** `lib/growth-scoring.ts`:
   - `calculateGrowthScores(coupleId)` → returns scores (0-100) for each area
   - Queries relevant tables, applies weights, normalizes to percentage
   - Caches result (recompute on dashboard load, not per-render)

4. **Create `GrowthProgressBars.tsx`** component:
   - 5 horizontal progress bars with labels
   - Color-coded (green for high, yellow for medium, red for low)
   - Animated fill on mount
   - Show score percentage

5. **Wire into Growth page** Progress tab

### Phase 3: Relationship Health Chart

6. **Create `HealthChart.tsx`** component:
   - Line chart showing mood scores over time (from check-in reflections)
   - X-axis: dates (last 3 months by default)
   - Y-axis: mood score (1-5 emoji scale)
   - Two lines: mood_before and mood_after per check-in
   - Tooltip with check-in details
   - Responsive (full width)

7. **Create data aggregation function** `lib/chart-data.ts`:
   - `getCheckInMoodHistory(coupleId, range)` → returns time series data
   - Groups by week/month depending on range
   - Returns averages per period

8. **Add Analytics tab** to Growth page (or replace Progress tab with combined view):
   - Health chart at top
   - Growth area progress bars below
   - Time range selector (1 month, 3 months, 6 months, all time)

### Phase 4: Milestone Stats Enhancement

9. **Add milestone stats** to Growth page header:
   - Total points accumulated
   - Rarity breakdown (X common, Y rare, Z epic, W legendary)
   - Most recent achievement

## Files to Create/Modify

| File                                           | Action                                |
| ---------------------------------------------- | ------------------------------------- |
| `package.json`                                 | Add `recharts` dependency             |
| `src/lib/growth-scoring.ts`                    | Create — growth area scoring logic    |
| `src/lib/chart-data.ts`                        | Create — mood time series aggregation |
| `src/components/growth/GrowthProgressBars.tsx` | Create — 5-area progress display      |
| `src/components/growth/HealthChart.tsx`        | Create — mood line chart              |
| `src/app/(app)/growth/growth-content.tsx`      | Add Analytics tab, wire charts        |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] Manual: Growth page shows progress bars with computed scores
- [ ] Manual: Health chart renders with check-in mood data
- [ ] Manual: Time range selector changes chart data
- [ ] Manual: Responsive on mobile (chart scales down)

## Task List

| #   | Task                                            | Can Parallel?     |
| --- | ----------------------------------------------- | ----------------- |
| 7.1 | Install recharts, verify build                  | No (first)        |
| 7.2 | Create lib/growth-scoring.ts with scoring logic | After 7.1         |
| 7.3 | Create GrowthProgressBars component             | After 7.2         |
| 7.4 | Create lib/chart-data.ts mood aggregation       | Parallel with 7.2 |
| 7.5 | Create HealthChart component                    | After 7.1, 7.4    |
| 7.6 | Add Analytics tab to Growth page                | After 7.3, 7.5    |
| 7.7 | Add milestone stats to Growth header            | Parallel with 7.3 |
| 7.8 | Run full validation                             | After all above   |
