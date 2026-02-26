# Wave 4: UX & Design Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve perceived quality across the app by standardizing layout primitives, adding loading skeletons, fixing visual inconsistencies, and closing mobile responsive gaps.

**Architecture:** Foundation-first — create shared `PageContainer` component, then apply it everywhere. Add `loading.tsx` files that use existing Skeleton components. Fix visual inconsistencies (card radii, badge patterns, gradients) and responsive gaps.

**Tech Stack:** Next.js 16 App Router, React, Tailwind CSS 4, Framer Motion, class-variance-authority (cva)

---

## Task 1: PageContainer Component + PageHeader Fix + Adopt Across All Pages

Create a reusable `PageContainer` component and update all 7 data pages to use it, replacing their inconsistent inline header patterns.

**Files:**

- Create: `src/components/layout/PageContainer.tsx`
- Modify: `src/components/layout/PageHeader.tsx` (hardcoded colors → CSS vars)
- Modify: `src/app/(app)/dashboard/dashboard-content.tsx` (adopt PageContainer)
- Modify: `src/app/(app)/notes/notes-content.tsx` (adopt PageContainer)
- Modify: `src/app/(app)/reminders/reminders-content.tsx` (adopt PageContainer)
- Modify: `src/app/(app)/requests/requests-content.tsx` (adopt PageContainer)
- Modify: `src/app/(app)/growth/growth-content.tsx` (adopt PageContainer)
- Modify: `src/app/(app)/love-languages/page.tsx` (adopt PageContainer, remove PageHeader + manual container)
- Modify: `src/app/(app)/settings/settings-content.tsx` (adopt PageContainer)

### PageContainer spec

```tsx
// src/components/layout/PageContainer.tsx
interface PageContainerProps {
  /** Page title rendered as h1 */
  title?: string
  /** Subtitle below the title */
  description?: string
  /** Action slot (e.g., "New Note" button) rendered to the right of the title */
  action?: React.ReactNode
  /** Page content */
  children: React.ReactNode
  /** Additional class names on the outer wrapper */
  className?: string
}
```

Renders:

```
<div className="mx-auto w-full max-w-6xl">
  {title && (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )}
  <div className={cn('space-y-6', className)}>
    {children}
  </div>
</div>
```

### Current page patterns → PageContainer adoption

**Dashboard** (`dashboard-content.tsx`):

- Current: `<div className="space-y-8">` with centered `<h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>` and subtitle
- New: `<PageContainer title="Dashboard" description="Your relationship command center" className="space-y-8">`
- Remove: lines 49-53 (header div)

**Notes** (`notes-content.tsx`):

- Current: `<div className="space-y-6 p-4 sm:p-6">` with flex row h1 + New Note button
- New: `<PageContainer title="Notes" description="Keep track of your thoughts, insights, and reflections" action={<NewNoteButton />}>`
- Remove: lines with `p-4 sm:p-6` wrapper padding (AppShell already pads), remove inline h1 + subtitle + button flex row

**Reminders** (`reminders-content.tsx`):

- Current: `<div className="space-y-6">` with flex row h1 + New Reminder button
- New: `<PageContainer title="Reminders" action={<NewReminderButton />}>`
- Remove: inline h1 + button flex row

**Requests** (`requests-content.tsx`):

- Current: `<div className="space-y-6">` with flex row h1 + New Request button
- New: `<PageContainer title="Requests" action={<NewRequestButton />}>`
- Remove: inline h1 + button flex row + disabled helper text (move helper text below action)

**Growth** (`growth-content.tsx`):

- Current: `<MotionBox variant="page" className="space-y-8">` with centered h1 + icon + subtitle + New Milestone button
- New: `<PageContainer title="Growth Gallery" description="Track your relationship journey and celebrate your achievements together." action={<NewMilestoneButton />} className="space-y-8">`
- Keep: `<MotionBox>` wrapper around PageContainer for page animation
- Remove: centered header section with icon

**Love Languages** (`love-languages/page.tsx`):

- Current: Uses `<PageHeader>` component + `<main className="container mx-auto px-4 py-6 max-w-4xl">`
- New: `<PageContainer title="Love Languages" description="Discover and share the unique ways you feel loved" action={<AddLanguageButton />}>`
- Remove: `<PageHeader>` import and usage, remove `<main className="container...">` wrapper (PageContainer handles max-width)

**Settings** (`settings-content.tsx`):

- Current: `<div className="space-y-6">` with `<h1 className="text-2xl font-bold">`
- New: `<PageContainer title="Settings">`
- Remove: inline h1

### PageHeader fix

In `src/components/layout/PageHeader.tsx`:

- Line 26: `text-gray-900 dark:text-white` → `text-foreground`
- Line 27: `text-gray-700 dark:text-gray-300` → `text-muted-foreground`

### Verification

```bash
npm run typecheck && npm run lint && npm test && npm run knip
```

Commit: `feat: add PageContainer component and adopt across all pages`

---

## Task 2: Loading Skeletons for All Data Pages

Create `loading.tsx` for every page that fetches data server-side. Next.js automatically renders these during page transitions.

**Files:**

- Create: `src/app/(app)/dashboard/loading.tsx`
- Create: `src/app/(app)/notes/loading.tsx`
- Create: `src/app/(app)/reminders/loading.tsx`
- Create: `src/app/(app)/requests/loading.tsx`
- Create: `src/app/(app)/growth/loading.tsx`
- Create: `src/app/(app)/love-languages/loading.tsx`
- Create: `src/app/(app)/settings/loading.tsx`

### Pattern

Each `loading.tsx` uses `PageContainer` (from Task 1) + `Skeleton`/`SkeletonGroup` from `src/components/ui/skeleton.tsx`.

**Important:** `loading.tsx` files are server components by default. `PageContainer` must NOT be a client component (no `'use client'` directive). Verify this after Task 1.

### Dashboard loading.tsx

```tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <PageContainer title="Dashboard" description="Your relationship command center" className="space-y-8">
      {/* Quick Actions skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>

      {/* Reminders + Activity skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-48" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} variant="card" className="h-28" />
        ))}
      </div>
    </PageContainer>
  )
}
```

### Notes loading.tsx

```tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function NotesLoading() {
  return (
    <PageContainer title="Notes" description="Keep track of your thoughts, insights, and reflections">
      {/* Search bar skeleton */}
      <Skeleton variant="rectangular" className="h-10 rounded-xl" />
      {/* Note cards */}
      <SkeletonGroup count={3} variant="card" className="h-32" />
    </PageContainer>
  )
}
```

### Reminders loading.tsx

```tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function RemindersLoading() {
  return (
    <PageContainer title="Reminders">
      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {/* Reminder cards */}
      <SkeletonGroup count={3} variant="card" />
    </PageContainer>
  )
}
```

### Requests loading.tsx

```tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function RequestsLoading() {
  return (
    <PageContainer title="Requests">
      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      {/* Request cards */}
      <SkeletonGroup count={3} variant="card" />
    </PageContainer>
  )
}
```

### Growth loading.tsx

```tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton'

export default function GrowthLoading() {
  return (
    <PageContainer
      title="Growth Gallery"
      description="Track your relationship journey and celebrate your achievements together."
      className="space-y-8"
    >
      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      {/* Milestone cards */}
      <SkeletonGroup count={3} variant="card" className="h-40" />
    </PageContainer>
  )
}
```

### Love Languages loading.tsx

```tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { SkeletonGroup } from '@/components/ui/skeleton'

export default function LoveLanguagesLoading() {
  return (
    <PageContainer title="Love Languages" description="Discover and share the unique ways you feel loved">
      <SkeletonGroup count={3} variant="card" className="h-36" />
    </PageContainer>
  )
}
```

### Settings loading.tsx

```tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { SkeletonGroup } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <PageContainer title="Settings">
      <SkeletonGroup count={3} variant="card" className="h-48" />
    </PageContainer>
  )
}
```

### Verification

```bash
npm run typecheck && npm run lint && npm run knip
```

Verify visually: navigate between pages and confirm skeleton appears during transition.

Commit: `feat: add loading skeletons for all data pages`

---

## Task 3: Visual Consistency — Card Radii, Badge Sizes, Gradient Extraction

### A. Card border radius standardization

Standardize all data cards to `rounded-lg` (12px). Keep `rounded-xl` only for modal/dialog surfaces and inputs.

**Files to modify (change `rounded-xl` → `rounded-lg`):**

- `src/components/notes/NoteCard.tsx:38` — change `rounded-xl` to `rounded-lg`
- `src/components/checkin/CategoryCard.tsx:84` — change `rounded-xl` to `rounded-lg`
- `src/components/growth/MilestoneCard.tsx:111` — change `rounded-xl` to `rounded-lg`

**Keep `rounded-xl` (these are inputs/modals, not data cards):**

- `src/components/notes/NoteList.tsx:65` — search input (keep)
- `src/components/notes/NoteEditor.tsx:78,85` — editor buttons (keep)
- `src/components/growth/MilestoneCreator.tsx:117` — modal overlay (keep)
- `src/components/Landing/FeatureGrid.tsx:93` — landing page icon (keep)

### B. Badge size variants

Add `size` prop to `src/components/ui/badge.tsx`:

```tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-xs',
        xs: 'px-1.5 py-0 text-[10px] leading-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)
```

Update `BadgeProps` to include size. Then replace inline badge patterns:

- `src/components/dashboard/TodayReminders.tsx:60` — replace `className="px-1.5 py-0 text-[10px] capitalize leading-4"` with `size="xs" className="capitalize"`
- `src/components/growth/MilestoneCard.tsx` — replace inline rarity badge styles with `<Badge size="xs">` where applicable

### C. Gradient extraction

Add to `src/app/globals.css` after the existing `.gradient-blush` block:

```css
.gradient-success {
  background: linear-gradient(135deg, #22c55e, #059669);
}

.gradient-energy {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.gradient-growth {
  background: linear-gradient(135deg, #a855f7, #ec4899);
}
```

Dark mode variants (add after dark mode gradient vars):

```css
.dark .gradient-success {
  background: linear-gradient(135deg, #16a34a, #047857);
}

.dark .gradient-energy {
  background: linear-gradient(135deg, #ea580c, #dc2626);
}

.dark .gradient-growth {
  background: linear-gradient(135deg, #9333ea, #db2777);
}
```

Replace common inline gradient patterns in **StatsGrid** icon badges:

- `from-orange-500 to-red-500` → `gradient-energy` (Check-ins stat)
- `from-green-500 to-emerald-600` → `gradient-success` (Notes stat)
- `from-purple-500 to-pink-600` → `gradient-growth` (Milestones stat)

**Note:** StatsGrid passes gradients as Tailwind classes via a `gradient` prop to StatCard. The existing pattern uses `bg-gradient-to-br ${gradient}`. To use CSS class gradients, update StatCard to conditionally apply either the Tailwind gradient or a CSS class. However, this may overcomplicate things — an acceptable alternative is to just leave StatsGrid gradients as-is (they're consistent within the component) and only extract gradients used in 2+ separate components. Apply `gradient-growth` to: MilestoneCreatorForm button, GrowthProgressBars, ProgressBar.

### Verification

```bash
npm run typecheck && npm run lint && npm test && npm run knip
```

Commit: `feat: visual consistency — card radii, badge sizes, gradient utilities`

---

## Task 4: Mobile Responsive Gaps + Grid Spacing

### A. Grid responsive gap improvements

Review and fix grids that use fixed gaps:

**Files to check/modify:**

- `src/components/dashboard/QuickActions.tsx` — ensure gap is responsive: `gap-4 sm:gap-6`
- `src/components/dashboard/StatsGrid.tsx` — currently `gap-3 sm:gap-4` (already responsive, verify)
- `src/app/(app)/dashboard/dashboard-content.tsx` — grid sections use `gap-6` (add responsive: `gap-4 sm:gap-6`)
- `src/app/(app)/growth/growth-content.tsx` — check grid gaps

For each grid component:

1. Read the current gap value
2. If it's a single fixed value (e.g., `gap-6`), make it responsive: `gap-3 sm:gap-4 lg:gap-6`
3. If it's already responsive, leave it

### B. Verify container consistency

After Task 1, all pages use `PageContainer` with `max-w-6xl`. Verify no page has leftover inline max-width wrappers or conflicting padding.

### Verification

```bash
npm run typecheck && npm run lint && npm test && npm run knip
```

Visual check: test layouts at 375px, 768px, and 1440px widths.

Commit: `feat: responsive grid spacing improvements`

---

## Full Validation (after all tasks)

```bash
npm run check  # lint + typecheck + format:check + test
npm run knip   # dead code detection
```

All must pass clean before creating PR.
