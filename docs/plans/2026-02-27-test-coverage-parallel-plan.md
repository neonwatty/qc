# Remaining Component Test Coverage — Parallel Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Achieve comprehensive unit test coverage for all 32 remaining untested UI components across 6 sprints.

**Architecture:** Each sprint tests 5-6 components in 3 parallel subagent pairs (2 files each). Sprints are ordered easy-first: pure/presentational components first, context-dependent ones last. Each subagent writes a colocated `*.test.tsx` file using the established patterns (vi.mock before imports, await import, fireEvent, <150 lines).

**Tech Stack:** Vitest, @testing-library/react, vi.mock, fireEvent

**Current Baseline:** 908 tests / 105 files on `main` (Sprint 21 complete)

---

## Sprint Batches

### Sprint 22: Simple Presentational Components (6 files)

All pure/stateless — no context, no async, no dialogs. Fastest sprint.

| Pair | File                                      | Lines | Notes                        |
| ---- | ----------------------------------------- | ----- | ---------------------------- |
| A1   | `src/components/Landing/Hero.tsx`         | 101   | Static hero, Link buttons    |
| A2   | `src/components/Landing/FeatureGrid.tsx`  | 132   | Static grid of feature cards |
| B1   | `src/components/Landing/HowItWorks.tsx`   | 79    | Static 3-step section        |
| B2   | `src/components/Landing/Footer.tsx`       | 77    | Static footer links          |
| C1   | `src/components/Landing/SocialProof.tsx`  | 37    | Static testimonial section   |
| C2   | `src/components/layout/PageContainer.tsx` | 32    | Simple wrapper div           |

**Estimated tests:** ~35-40
**Mocks needed:** lucide-react, next/link, framer-motion (if used)

---

### Sprint 23: Layout + Simple Settings (6 files)

Layout shell components + simple settings cards.

| Pair | File                                                | Lines | Notes                                              |
| ---- | --------------------------------------------------- | ----- | -------------------------------------------------- |
| A1   | `src/components/layout/PageHeader.tsx`              | 33    | Title + optional back link                         |
| A2   | `src/components/layout/Header.tsx`                  | 84    | App header with nav links                          |
| B1   | `src/components/settings/CategoryCard.tsx`          | 43    | Simple card, onEdit/onDelete                       |
| B2   | `src/components/settings/SessionProposalBanner.tsx` | 86    | Banner with accept/reject, uses useSessionSettings |
| C1   | `src/components/requests/RequestCard.tsx`           | 116   | Request display + status actions                   |
| C2   | `src/components/reminders/ReminderCard.tsx`         | 160   | Reminder display + toggle/delete                   |

**Estimated tests:** ~45-50
**Mocks needed:** lucide-react, next/link, framer-motion, @/contexts/SessionSettingsContext (for SessionProposalBanner), @/components/ui/\*

---

### Sprint 24: Love Language Cards + Growth Cards (6 files)

Mid-complexity components — some with dialogs, some with callbacks.

| Pair | File                                                       | Lines | Notes                                 |
| ---- | ---------------------------------------------------------- | ----- | ------------------------------------- |
| A1   | `src/components/love-languages/LoveLanguageCard.tsx`       | 132   | Card with expand, edit, delete        |
| A2   | `src/components/love-languages/LoveActionCard.tsx`         | 114   | Action card with complete toggle      |
| B1   | `src/components/love-languages/ConvertDiscoveryDialog.tsx` | 128   | Radix dialog — must pass open={true}  |
| B2   | `src/components/love-languages/DiscoveryCard.tsx`          | 101   | Card + renders ConvertDiscoveryDialog |
| C1   | `src/components/growth/MilestoneCard.tsx`                  | 270   | Large card — photos, dates, actions   |
| C2   | `src/components/growth/MilestoneCreatorForm.tsx`           | 195   | Form with date picker, categories     |

**Estimated tests:** ~50-55
**Mocks needed:** lucide-react, next/link, framer-motion, @/components/ui/dialog, date-fns

---

### Sprint 25: Growth Complex + Navigation (6 files)

Growth feature components with photo handling, plus main navigation.

| Pair | File                                                | Lines | Notes                                       |
| ---- | --------------------------------------------------- | ----- | ------------------------------------------- |
| A1   | `src/components/growth/PhotoGallery.tsx`            | 154   | Photo grid with lightbox                    |
| A2   | `src/components/growth/PhotoUpload.tsx`             | 290   | Drag-drop upload, preview, Supabase storage |
| B1   | `src/components/growth/MilestoneCreator.tsx`        | 173   | Orchestrates MilestoneCreatorForm           |
| B2   | `src/components/growth/Timeline.tsx`                | 243   | Full timeline with TimelineMonthGroups      |
| C1   | `src/components/layout/Navigation.tsx`              | 185   | Sidebar/bottom nav, active route detection  |
| C2   | `src/components/love-languages/AddActionDialog.tsx` | 228   | Radix dialog with form                      |

**Estimated tests:** ~50-55
**Mocks needed:** lucide-react, next/link, next/navigation, framer-motion, @/components/ui/dialog, @/lib/supabase/client (for PhotoUpload storage mock)

---

### Sprint 26: Settings Forms + Complex Dialogs (5 files)

Form-heavy components with useActionState and async handlers.

| Pair | File                                                  | Lines | Notes                                         |
| ---- | ----------------------------------------------------- | ----- | --------------------------------------------- |
| A1   | `src/components/settings/PrivacySettings.tsx`         | 92    | Toggle switches, Supabase fetch               |
| A2   | `src/components/settings/RelationshipSettings.tsx`    | 137   | Form with async submit handler                |
| B1   | `src/components/settings/ProfileSettings.tsx`         | 81    | useActionState form                           |
| B2   | `src/components/settings/SessionSettingsPanel.tsx`    | 251   | Complex: useActionState + useRef + validation |
| C1   | `src/components/love-languages/AddLanguageDialog.tsx` | 288   | Complex Radix dialog with multi-step form     |

**Estimated tests:** ~40-45
**Mocks needed:** lucide-react, @/components/ui/\*, react (useActionState mock), @/lib/supabase/client, server action mocks

---

### Sprint 27: Complex Check-in Components (3 files)

Heaviest mocking — context providers, timers, animations.

| Pair | File                                               | Lines | Notes                                  |
| ---- | -------------------------------------------------- | ----- | -------------------------------------- |
| A1   | `src/components/checkin/WarmUpStep.tsx`            | 96    | Uses CheckInContext                    |
| A2   | `src/components/checkin/TurnIndicator.tsx`         | 211   | Uses useSessionSettings + useTurnState |
| B1   | `src/components/checkin/CompletionCelebration.tsx` | 294   | Heavy animation, confetti, navigation  |

**Estimated tests:** ~25-30
**Mocks needed:** lucide-react, framer-motion, @/contexts/CheckInContext, @/contexts/SessionSettingsContext, next/navigation, canvas-confetti (if used)

---

## Execution Summary

| Sprint    | Files  | Est. Tests | Complexity     | Branch Name                           |
| --------- | ------ | ---------- | -------------- | ------------------------------------- |
| 22        | 6      | ~38        | Simple         | `sprint22/landing-layout-tests`       |
| 23        | 6      | ~48        | Simple-Medium  | `sprint23/layout-settings-tests`      |
| 24        | 6      | ~52        | Medium         | `sprint24/love-language-growth-tests` |
| 25        | 6      | ~52        | Medium-Complex | `sprint25/growth-nav-tests`           |
| 26        | 5      | ~42        | Complex        | `sprint26/settings-dialog-tests`      |
| 27        | 3      | ~28        | Complex        | `sprint27/checkin-complex-tests`      |
| **Total** | **32** | **~260**   |                |                                       |

**Projected final:** ~1168 tests / ~137 files

## Workflow Per Sprint

1. `git checkout main && git pull`
2. `git checkout -b sprintNN/name`
3. Dispatch 3 parallel subagent pairs (each writes 2 test files)
4. Verify all tests pass locally: `npx vitest run`
5. Squash into single commit: `git reset --soft main && git add -A && git commit`
6. Push + create PR: `git push -u origin HEAD && gh pr create`
7. Wait for CI green, then `gh pr merge --squash --delete-branch`

## Established Test Patterns

```tsx
// 1. Mocks BEFORE imports
vi.mock('lucide-react', () => ({
  IconName: () => <span data-testid="icon-name" />,
}))

vi.mock('framer-motion', () => ({
  motion: { div: (props) => <div {...props} />, span: (props) => <span {...props} /> },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h3>{children}</h3>,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}))

// 2. Import AFTER mocks
import { render, screen, fireEvent } from '@testing-library/react'

// 3. Dynamic import of component under test
const { ComponentName } = await import('./ComponentName')

// 4. Props helper using component param types
type Props = Parameters<typeof ComponentName>[0]
function renderComponent(overrides: Partial<Props> = {}) {
  const defaultProps: Props = { /* defaults */ }
  return render(<ComponentName {...defaultProps} {...overrides} />)
}

// 5. Clear mocks
beforeEach(() => { vi.clearAllMocks() })

// 6. Tests — max 150 lines per file
describe('ComponentName', () => {
  it('renders heading', () => { ... })
})
```

### Key Rules

- Use `fireEvent` (NOT `userEvent`)
- Use `Record<string, unknown>` for mock prop spread types
- Use `Boolean()` wrapper for unknown types in JSX conditionals
- Radix dialogs need `open={true}` to render children
- `useActionState` mock: `vi.mock('react', async () => ({ ...await vi.importActual('react'), useActionState: vi.fn(() => [state, action, isPending]) }))`
- Mock function typing: `DialogProps['onOpenChange'] & ReturnType<typeof vi.fn>` with `as typeof` casts
