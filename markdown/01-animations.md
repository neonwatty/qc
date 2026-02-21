# Plan 01: Re-enable Animations & Expand Motion Library

**Priority**: HIGH | **Effort**: Small | **Parallel Group**: A | **Dependencies**: None

## Problem

Framer Motion is installed and `motion.tsx` has `MotionBox`, `StaggerContainer`, and `StaggerItem` components, but all three are **disabled** — they render plain `<div>`s with a comment: "Temporarily disable animations to fix content loading issue." The prototype had 20+ animation variants; production has only 3 (`slideUp`, `staggerContainer`, `staggerItem` in `animations.ts`).

The app feels static and lifeless without animations.

## Root Cause to Investigate

Before re-enabling, we must understand WHY animations were disabled. The comment says "content loading issue." This likely means:

- Server components rendered content, then client hydration caused a flash/layout shift
- Or Framer Motion's `AnimatePresence` conflicted with Next.js streaming

## Plan

### Phase 1: Diagnose and Fix the Loading Issue

1. **Read the git history** for `motion.tsx` to find when/why animations were disabled
2. **Test re-enabling** `MotionBox` with a simple `motion.div` wrapper using `fadeIn`
3. **Identify the fix** — likely one of:
   - Wrap animations in `useEffect` to only animate after hydration
   - Use `initial={false}` on `motion.div` to skip initial animation (prevents SSR flash)
   - Use CSS `@starting-style` for initial render, Framer for interactions only
   - Lazy-load motion components behind a `useIsMounted()` guard

### Phase 2: Re-enable Motion Components

4. **Restore `MotionBox`** with proper hydration handling:
   ```tsx
   // Use initial={false} to prevent SSR mismatch
   <motion.div initial={false} animate="animate" variants={variant}>
   ```
5. **Restore `StaggerContainer`** and **`StaggerItem`**
6. **Test across all pages** that use these components — verify no content flash

### Phase 3: Add Missing Animation Variants

7. **Expand `animations.ts`** with prototype variants:
   - `fadeIn` — simple opacity
   - `slideDown` — vertical slide from top
   - `slideInFromLeft` / `slideInFromRight` — horizontal slides
   - `scaleIn` — grow from 0.8
   - `bounceIn` — spring scale entrance
   - `modalBackdrop` / `modalContent` — modal animations
   - `cardHover` — lift + shadow on hover
   - `buttonTap` — scale on press (0.97)
   - `pulse` — breathing opacity + scale
   - `spinner` — infinite rotate
   - Fast/slow/reverse stagger containers

8. **Add spring configs**:
   - `snappy` (already exists) — stiffness: 500, damping: 30
   - `smooth` (already exists) — stiffness: 300, damping: 25
   - `bouncy` — stiffness: 600, damping: 15

### Phase 4: Install canvas-confetti

9. **`npm install canvas-confetti`** + `@types/canvas-confetti`
10. **Create `lib/confetti.ts`** utility with preset patterns:
    - `celebrationBurst()` — check-in completion
    - `milestoneConfetti()` — milestone achievement
    - `streakConfetti()` — streak milestone

## Files to Modify

| File                                               | Action                                        |
| -------------------------------------------------- | --------------------------------------------- |
| `src/components/ui/motion.tsx`                     | Restore Framer Motion with hydration fix      |
| `src/lib/animations.ts`                            | Add 15+ animation variants and spring configs |
| `src/lib/confetti.ts`                              | Create (new) — confetti utility functions     |
| `package.json`                                     | Add `canvas-confetti` dependency              |
| `src/components/checkin/CompletionCelebration.tsx` | Wire up confetti on completion                |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] Manual: Navigate pages, verify no content flash or layout shift
- [ ] Manual: Verify animations play on page load, list rendering, modals
- [ ] Manual: Check-in completion triggers confetti

## Task List

| #   | Task                                                     | Can Parallel?       |
| --- | -------------------------------------------------------- | ------------------- |
| 1.1 | Investigate git history for why animations were disabled | No (first)          |
| 1.2 | Create hydration-safe motion components                  | After 1.1           |
| 1.3 | Re-enable MotionBox, StaggerContainer, StaggerItem       | After 1.2           |
| 1.4 | Add missing animation variants to animations.ts          | Parallel with 1.3   |
| 1.5 | Install canvas-confetti and create lib/confetti.ts       | Parallel with 1.3   |
| 1.6 | Wire confetti into CompletionCelebration                 | After 1.5           |
| 1.7 | Test all pages for animation correctness                 | After 1.3, 1.4, 1.6 |
| 1.8 | Run full validation (typecheck, lint, test)              | After 1.7           |
