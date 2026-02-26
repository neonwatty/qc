# Wave 4 Design: UX & Design Polish

**Goal:** Improve perceived quality across the app by standardizing layout primitives, adding loading skeletons, fixing visual inconsistencies, and closing mobile responsive gaps.

**Approach:** Foundation-first — build shared primitives, then apply them everywhere. 4 independent tasks that build on each other.

---

## Task 1: Shared Layout Primitives

### PageContainer Component

Create `src/components/layout/PageContainer.tsx` — wraps page content with consistent max-width and optional title/description/action slot.

```tsx
<PageContainer title="Dashboard" description="Your relationship at a glance">
  {children}
</PageContainer>
```

**Renders:**

- Max-width container: `max-w-6xl mx-auto w-full`
- Title: `text-2xl sm:text-3xl font-bold text-foreground`
- Description: `text-sm text-muted-foreground`
- Optional `action` slot (React node) for page-level CTAs like "New Note"
- Optional `titleHidden` for pages that render their own custom header (e.g., check-in)

**Pages to adopt:** dashboard, notes, reminders, requests, growth, love-languages, settings (7 pages). Check-in keeps its custom layout.

**What changes per page:**

- Remove inline `<h1>` tags and surrounding spacing
- Remove inconsistent max-width wrappers
- Wrap content in `<PageContainer>`

### PageHeader Fix

Update `src/components/layout/PageHeader.tsx`:

- `text-gray-900 dark:text-white` → `text-foreground`
- `text-gray-700 dark:text-gray-300` → `text-muted-foreground`

---

## Task 2: Loading Skeletons

Add `loading.tsx` for every server-data-fetching page. Next.js uses these automatically during navigation.

### Pages (7 total)

| Page           | Skeleton Layout                                        |
| -------------- | ------------------------------------------------------ |
| dashboard      | 6 stat card skeletons (2x3 grid) + 2 section skeletons |
| notes          | Search bar + 3 note card skeletons                     |
| reminders      | Filter bar + 3 reminder card skeletons                 |
| requests       | Tab bar + 3 request card skeletons                     |
| growth         | Tab bar + 3 milestone card skeletons                   |
| love-languages | 3 language card skeletons                              |
| settings       | 3 section skeletons (profile, relationship, session)   |

Each file uses `PageContainer` + existing `Skeleton`/`SkeletonGroup` from `ui/skeleton.tsx`. ~20-30 lines each.

**Skipped:** Check-in (client-rendered via context, no server fetch on navigation).

---

## Task 3: Visual Consistency Pass

### A. Card Border Radius

- Standardize all data cards to `rounded-lg` (12px) — the Card component default
- Remove `rounded-xl` overrides from: NoteCard, CategoryCard, MilestoneCard (featured)
- Keep `rounded-xl` for modal/dialog surfaces

### B. Badge Size Variants

Add `size` prop to `src/components/ui/badge.tsx`:

- `sm` (default): current `px-2.5 py-0.5 text-xs`
- `xs`: `px-1.5 py-0 text-[10px]` for compact inline tags

Replace inline badge styling in TodayReminders, MilestoneCard rarity, NoteCard tags with `<Badge>`.

### C. Gradient Extraction

Add to `globals.css`:

- `.gradient-success` — green tones (for positive stats)
- `.gradient-energy` — orange/red (for streaks, check-ins)
- `.gradient-growth` — purple/pink (for milestones, growth)

Replace common inline `from-X to-Y` patterns in StatsGrid, StreakDisplay, GrowthProgressBars.

---

## Task 4: Mobile Responsive Gaps

### A. Grid Spacing

- Ensure all grids use responsive gaps: `gap-3 sm:gap-4 lg:gap-6`
- Review StatsGrid, QuickActions, and any grid with fixed `gap-6`

### B. Container Consistency

Handled by Task 1's PageContainer (`max-w-6xl` everywhere).

### C. PageHeader Colors

Handled by Task 1's PageHeader fix (CSS variables instead of hardcoded grays).

---

## Key Files

| File                                          | Action                                |
| --------------------------------------------- | ------------------------------------- |
| `src/components/layout/PageContainer.tsx`     | Create                                |
| `src/components/layout/PageHeader.tsx`        | Edit (color tokens)                   |
| `src/components/ui/badge.tsx`                 | Edit (add size variant)               |
| `src/app/globals.css`                         | Edit (add 3 gradient utilities)       |
| `src/app/(app)/*/loading.tsx`                 | Create (7 files)                      |
| `src/app/(app)/*/page.tsx` or `*-content.tsx` | Edit (adopt PageContainer, 7 pages)   |
| Various card components                       | Edit (border radius, badge, gradient) |

## Verification

1. `npm run typecheck` — clean
2. `npm run lint` — clean
3. `npm test` — all tests pass
4. `npm run knip` — clean (no dead code)
5. Visual check: pages render with consistent layout, skeletons appear during navigation
