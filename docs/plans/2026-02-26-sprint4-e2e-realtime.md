# Sprint 4: E2E Check-In Wizard & Realtime Resilience

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add E2E coverage for the check-in wizard flow (start session through completion) and harden the `useRealtimeCouple` hook with reconnection/error handling tests.

**Architecture:** E2E tests use Playwright with the existing `authedPage` fixture (Alice+Bob couple with seeded session_settings and categories via trigger). Realtime unit tests extend the existing `useRealtimeCouple.test.ts` mock structure. No database migrations or source code changes are needed -- this sprint is test-only.

**Tech Stack:** Playwright (E2E), Vitest + @testing-library/react (unit), existing Supabase mock infrastructure

---

### Task 1: E2E -- Start a check-in session via Quick Start button

**Files:**

- Modify: `e2e/checkin.spec.ts`

**Step 1: Write the failing test**

Add a new `describe` block after the existing "Check-in landing page" tests:

```typescript
test.describe('Check-in wizard flow', () => {
  test('clicking Start Now begins a check-in session', async ({ authedPage: page }) => {
    await page.goto('/checkin')

    // Click the "Start Now" / "Now" button
    await page.getByRole('button', { name: /now/i }).click()

    // Should transition to the category selection step
    // CategorySelectionStep renders a CategoryGrid with category names
    await expect(page.getByText(/communication/i)).toBeVisible({ timeout: 10000 })

    // The landing page heading should no longer be visible
    await expect(page.getByRole('heading', { name: /relationship check-in/i })).not.toBeVisible()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/checkin.spec.ts --grep "clicking Start Now" --reporter=list`
Expected: FAIL (test doesn't exist yet, then after adding it, verify it passes or identify issues)

**Step 3: Run test to verify it passes**

Run: `npx playwright test e2e/checkin.spec.ts --grep "clicking Start Now" --reporter=list`
Expected: PASS

**Step 4: Commit**

```bash
git add e2e/checkin.spec.ts
git commit -m "test(e2e): add check-in session start via Quick Start button"
```

---

### Task 2: E2E -- Navigate through category selection step

**Files:**

- Modify: `e2e/checkin.spec.ts`

**Step 1: Write the failing test**

Add inside the "Check-in wizard flow" describe block:

```typescript
test('category selection step shows categories and navigation', async ({ authedPage: page }) => {
  await page.goto('/checkin')

  // Start a session
  await page.getByRole('button', { name: /now/i }).click()

  // Wait for CategorySelectionStep to render
  await expect(page.getByText(/communication/i)).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(/quality time/i)).toBeVisible()
  await expect(page.getByText(/future planning/i)).toBeVisible()
  await expect(page.getByText(/challenges/i)).toBeVisible()

  // Cancel button should be visible (NavigationControls backLabel="Cancel")
  await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
})
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/checkin.spec.ts --grep "category selection step" --reporter=list`
Expected: FAIL initially (doesn't exist yet)

**Step 3: Run test to verify it passes**

Run: `npx playwright test e2e/checkin.spec.ts --grep "category selection step" --reporter=list`
Expected: PASS

**Step 4: Commit**

```bash
git add e2e/checkin.spec.ts
git commit -m "test(e2e): add category selection step verification"
```

---

### Task 3: E2E -- Progress through warm-up and discussion steps

**Files:**

- Modify: `e2e/checkin.spec.ts`

**Context:** The seeded `session_settings` for Alice & Bob has `warm_up_questions = true`, so the wizard will show the WarmUpStep. The warm-up step has a "Continue" button (`nextLabel="Continue"`) and also "Skip" and "Shuffle" buttons. After warm-up, the CategoryDiscussionStep renders with "Continue to Reflection" button.

**Step 1: Write the failing test**

```typescript
test('progresses through warm-up to discussion step', async ({ authedPage: page }) => {
  await page.goto('/checkin')

  // Start session
  await page.getByRole('button', { name: /now/i }).click()
  await expect(page.getByText(/communication/i)).toBeVisible({ timeout: 10000 })

  // CategorySelectionStep: select a category and start
  // The CategoryGrid renders category cards; clicking starts the check-in
  // The "Start Check-In" or similar button appears after selection
  // Quick Start auto-selects all categories, so we should see a proceed button
  // CategorySelectionStep uses onStartCheckIn which is triggered by CategoryGrid
  // Let's look for the proceed/continue button
  await page
    .getByRole('button', { name: /start|begin|continue/i })
    .first()
    .click()

  // Should show warm-up step (warm_up_questions is true in seed)
  await expect(page.getByRole('heading', { name: /warm-up questions/i })).toBeVisible({ timeout: 10000 })

  // Warm-up has Shuffle and Skip buttons
  await expect(page.getByRole('button', { name: /shuffle/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /skip/i })).toBeVisible()

  // Click Continue to advance to discussion
  await page.getByRole('button', { name: /continue/i }).click()

  // CategoryDiscussionStep shows the discussion heading and "Continue to Reflection"
  await expect(page.getByText(/continue to reflection/i)).toBeVisible({ timeout: 10000 })
})
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/checkin.spec.ts --grep "progresses through warm-up" --reporter=list`
Expected: FAIL initially

**Step 3: Adjust selectors if needed**

The CategoryGrid's "Start Check-In" button text and the navigation flow may need selector adjustments based on what actually renders. Use `page.pause()` or screenshots to debug. The key elements:

- CategoryGrid likely shows a "Start Check-In" button when categories are selected
- Quick Start pre-selects all categories from `useCategories`
- WarmUpStep heading: "Warm-Up Questions"
- WarmUpStep Continue button in NavigationControls with `nextLabel="Continue"`

**Step 4: Run test to verify it passes**

Run: `npx playwright test e2e/checkin.spec.ts --grep "progresses through warm-up" --reporter=list`
Expected: PASS

**Step 5: Commit**

```bash
git add e2e/checkin.spec.ts
git commit -m "test(e2e): add warm-up and discussion step progression"
```

---

### Task 4: E2E -- Complete full wizard flow through reflection and completion

**Files:**

- Modify: `e2e/checkin.spec.ts`

**Context:** After discussion, the wizard goes to ReflectionStep (heading "Reflection", button "Continue to Action Items"), then ActionItemsStep, then CompletionStep (renders CompletionCelebration with "Go Home" and "Start New" buttons).

**Step 1: Write the failing test**

```typescript
test('completes full wizard from start to completion celebration', async ({ authedPage: page }) => {
  await page.goto('/checkin')

  // Start session
  await page.getByRole('button', { name: /now/i }).click()
  await expect(page.getByText(/communication/i)).toBeVisible({ timeout: 10000 })

  // Category selection - proceed
  await page
    .getByRole('button', { name: /start|begin|continue/i })
    .first()
    .click()

  // Warm-up - skip ahead
  await expect(page.getByRole('heading', { name: /warm-up questions/i })).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /continue/i }).click()

  // Discussion - continue to reflection
  await expect(page.getByText(/continue to reflection/i)).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /continue to reflection/i }).click()

  // Reflection step
  await expect(page.getByRole('heading', { name: /reflection/i })).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /continue to action items/i }).click()

  // Action items step - look for next/complete button
  // ActionItems component has a "Complete Check-In" or similar navigation
  await expect(page.getByRole('button', { name: /complete|finish|done/i }).first()).toBeVisible({ timeout: 10000 })
  await page
    .getByRole('button', { name: /complete|finish|done/i })
    .first()
    .click()

  // Completion celebration
  // CompletionCelebration renders with "Go Home" and "Start New" buttons
  await expect(page.getByRole('button', { name: /go home|home/i })).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('button', { name: /start new/i })).toBeVisible()
})
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/checkin.spec.ts --grep "completes full wizard" --reporter=list`
Expected: FAIL initially

**Step 3: Debug and adjust selectors**

The ActionItems component's navigation buttons may have different labels. Check:

- `src/components/checkin/ActionItems.tsx` for button text
- `src/components/checkin/CompletionCelebration.tsx` for final buttons

Adjust button selectors to match actual rendered text.

**Step 4: Run test to verify it passes**

Run: `npx playwright test e2e/checkin.spec.ts --grep "completes full wizard" --reporter=list`
Expected: PASS

**Step 5: Commit**

```bash
git add e2e/checkin.spec.ts
git commit -m "test(e2e): add full check-in wizard completion flow"
```

---

### Task 5: Unit -- Realtime hook resubscribes on coupleId change

**Files:**

- Modify: `src/hooks/useRealtimeCouple.test.ts`

**Context:** The existing test file has 7 tests. The mock setup captures `capturedCallback` and `capturedFilter` from `mockChannel.on`. We need to test that when `coupleId` changes, the hook unsubscribes from the old channel and subscribes to a new one.

**Step 1: Write the failing test**

Add inside the existing `describe('useRealtimeCouple', ...)`:

```typescript
it('resubscribes when coupleId changes', () => {
  const onInsert = vi.fn()

  const { rerender } = renderHook(
    ({ coupleId }: { coupleId: string }) =>
      useRealtimeCouple({
        table: 'notes',
        coupleId,
        onInsert,
      }),
    { initialProps: { coupleId: 'couple-abc' } },
  )

  expect(mockSupabase.channel).toHaveBeenCalledWith('notes:couple:couple-abc')
  expect(mockSubscribe).toHaveBeenCalledTimes(1)

  // Change coupleId
  rerender({ coupleId: 'couple-xyz' })

  // Should have unsubscribed from old channel
  expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)

  // Should have subscribed to new channel
  expect(mockSupabase.channel).toHaveBeenCalledWith('notes:couple:couple-xyz')
  expect(mockSubscribe).toHaveBeenCalledTimes(2)
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useRealtimeCouple.test.ts --reporter=verbose`
Expected: FAIL (test doesn't exist yet, then once added, verify behavior)

**Step 3: Run test to verify it passes**

Run: `npx vitest run src/hooks/useRealtimeCouple.test.ts --reporter=verbose`
Expected: PASS -- the hook's `useEffect` depends on `[table, coupleId]`, so changing `coupleId` triggers cleanup (removeChannel) and re-subscribe.

**Step 4: Commit**

```bash
git add src/hooks/useRealtimeCouple.test.ts
git commit -m "test: add resubscribe on coupleId change test for useRealtimeCouple"
```

---

### Task 6: Unit -- Realtime hook ignores events when callback is undefined

**Files:**

- Modify: `src/hooks/useRealtimeCouple.test.ts`

**Context:** The hook checks `if (payload.eventType === 'INSERT' && onInsertRef.current)` before calling the callback. We should verify that passing no callback for a specific event type doesn't throw.

**Step 1: Write the failing test**

```typescript
it('ignores INSERT events when onInsert is not provided', () => {
  const onUpdate = vi.fn()

  renderHook(() =>
    useRealtimeCouple({
      table: 'notes',
      coupleId: 'couple-abc',
      onUpdate,
    }),
  )

  // Fire an INSERT event with no onInsert callback
  expect(() => {
    capturedCallback!({
      eventType: 'INSERT',
      new: { id: 'note-1' },
      old: {},
    })
  }).not.toThrow()

  // onUpdate should NOT be called for INSERT events
  expect(onUpdate).not.toHaveBeenCalled()
})

it('ignores DELETE events when onDelete is not provided', () => {
  const onInsert = vi.fn()

  renderHook(() =>
    useRealtimeCouple({
      table: 'notes',
      coupleId: 'couple-abc',
      onInsert,
    }),
  )

  expect(() => {
    capturedCallback!({
      eventType: 'DELETE',
      new: {},
      old: { id: 'note-1' },
    })
  }).not.toThrow()

  expect(onInsert).not.toHaveBeenCalled()
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useRealtimeCouple.test.ts --reporter=verbose`
Expected: FAIL initially (tests don't exist yet)

**Step 3: Run test to verify it passes**

Run: `npx vitest run src/hooks/useRealtimeCouple.test.ts --reporter=verbose`
Expected: PASS -- the hook already guards with `&& onInsertRef.current` etc.

**Step 4: Commit**

```bash
git add src/hooks/useRealtimeCouple.test.ts
git commit -m "test: add undefined callback guard tests for useRealtimeCouple"
```

---

### Task 7: Unit -- Realtime hook resubscribes when table changes

**Files:**

- Modify: `src/hooks/useRealtimeCouple.test.ts`

**Context:** The hook's `useEffect` depends on `[table, coupleId]`. Changing the `table` prop should trigger unsubscribe and resubscribe, similar to coupleId changes.

**Step 1: Write the failing test**

```typescript
it('resubscribes when table changes', () => {
  const { rerender } = renderHook(
    ({ table }: { table: 'notes' | 'check_ins' }) =>
      useRealtimeCouple({
        table,
        coupleId: 'couple-abc',
      }),
    { initialProps: { table: 'notes' as const } },
  )

  expect(mockSupabase.channel).toHaveBeenCalledWith('notes:couple:couple-abc')
  expect(mockSubscribe).toHaveBeenCalledTimes(1)

  rerender({ table: 'check_ins' as const })

  expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
  expect(mockSupabase.channel).toHaveBeenCalledWith('check_ins:couple:couple-abc')
  expect(mockSubscribe).toHaveBeenCalledTimes(2)
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useRealtimeCouple.test.ts --reporter=verbose`
Expected: FAIL initially

**Step 3: Run test to verify it passes**

Run: `npx vitest run src/hooks/useRealtimeCouple.test.ts --reporter=verbose`
Expected: PASS

**Step 4: Commit**

```bash
git add src/hooks/useRealtimeCouple.test.ts
git commit -m "test: add resubscribe on table change test for useRealtimeCouple"
```

---

## Summary

| Task | Type | File                                  | Tests Added                   |
| ---- | ---- | ------------------------------------- | ----------------------------- |
| 1    | E2E  | `e2e/checkin.spec.ts`                 | 1 (session start)             |
| 2    | E2E  | `e2e/checkin.spec.ts`                 | 1 (category selection)        |
| 3    | E2E  | `e2e/checkin.spec.ts`                 | 1 (warm-up + discussion)      |
| 4    | E2E  | `e2e/checkin.spec.ts`                 | 1 (full flow completion)      |
| 5    | Unit | `src/hooks/useRealtimeCouple.test.ts` | 1 (coupleId resubscribe)      |
| 6    | Unit | `src/hooks/useRealtimeCouple.test.ts` | 2 (undefined callback guards) |
| 7    | Unit | `src/hooks/useRealtimeCouple.test.ts` | 1 (table resubscribe)         |

**Total: 8 new tests across 2 files**

## Notes for implementer

- **E2E selectors may need adjustment.** The plan provides best-guess selectors based on source code. If a selector doesn't match, use `page.pause()` or `await page.screenshot()` to inspect the actual DOM and adjust.
- **Quick Start auto-selects all categories.** When you click "Start Now", the `handleStartQuickCheckIn` function passes all category IDs to `startCheckIn()`. The CategorySelectionStep then pre-populates `selectedCategories` from `session?.selectedCategories`. There should be a button to proceed from category selection.
- **Warm-up is enabled.** The seed `session_settings` has `warm_up_questions = true`, so the wizard goes: category-selection -> warm-up -> category-discussion -> reflection -> action-items -> completion.
- **No source code changes required.** This is a test-only sprint.
- **Vitest cleanup.** Each unit test file should call `cleanup()` in `beforeEach` (already done in the existing file). Do NOT leave dangling vitest processes -- run with `npx vitest run` (single pass), never `npx vitest` (watch mode).
