# Plan 09: Error Handling & Toast System

**Priority**: MEDIUM | **Effort**: Small | **Parallel Group**: A | **Dependencies**: None

## Problem

No ErrorBoundary for graceful error handling — an unhandled error crashes the whole app. No consistent toast notification system for user feedback on actions (save, delete, error). The prototype used Sonner for toasts and had ErrorBoundary + FallbackUI components.

## Current State

- No error boundary component
- No toast library installed
- User feedback for actions is inconsistent (some show inline errors, most are silent)

## Plan

### Phase 1: Install Sonner

1. **`npm install sonner`**
2. **Add `<Toaster />`** to `src/app/providers.tsx`:
   ```tsx
   import { Toaster } from 'sonner'
   // Inside Providers:
   ;<Toaster position="top-center" richColors />
   ```

### Phase 2: Error Boundary

3. **Create `ErrorBoundary.tsx`** (`src/components/ui/ErrorBoundary.tsx`):
   - React class component (error boundaries require class components)
   - Catches render errors in child tree
   - Shows friendly error UI with "Something went wrong" message
   - "Try Again" button that resets the error state
   - "Go Home" button that navigates to dashboard
   - Optional: Log error to console or external service

4. **Create `error.tsx`** files for App Router error handling:
   - `src/app/(app)/error.tsx` — catches errors in protected routes
   - Shows branded error UI
   - "Try again" button

5. **Wrap key routes** with ErrorBoundary where needed (App Router `error.tsx` covers most cases)

### Phase 3: Add Toast Notifications

6. **Add success toasts** to key server actions:
   - Note saved/deleted: `toast.success('Note saved')`
   - Reminder created/toggled/deleted: `toast.success('Reminder updated')`
   - Request accepted/declined: `toast.success('Request accepted')`
   - Love language added/deleted: `toast.success('Language added')`
   - Milestone created: `toast.success('Milestone added!')`
   - Profile updated: `toast.success('Profile updated')`
   - Invite sent: `toast.success('Invite sent to [email]')`

7. **Add error toasts** for failures:
   - Generic: `toast.error('Something went wrong. Please try again.')`
   - Specific where possible: `toast.error('Failed to save note')`

8. **Create `lib/toast.ts`** helper (optional, for standardized messages):
   ```ts
   export const showSuccess = (message: string) => toast.success(message)
   export const showError = (message: string) => toast.error(message)
   ```

### Phase 4: Loading Skeletons (Bonus)

9. **Create `Skeleton.tsx`** (`src/components/ui/skeleton.tsx`):
   - Generic skeleton component with pulse animation
   - Variants: text line, card, circle (avatar), rectangular

10. **Add skeletons** to key loading states:
    - Dashboard stats grid
    - Notes list
    - Reminder list

## Files to Create/Modify

| File                                  | Action                          |
| ------------------------------------- | ------------------------------- |
| `package.json`                        | Add `sonner` dependency         |
| `src/app/providers.tsx`               | Add Toaster component           |
| `src/components/ui/ErrorBoundary.tsx` | Create                          |
| `src/components/ui/skeleton.tsx`      | Create                          |
| `src/app/(app)/error.tsx`             | Create — App Router error page  |
| `src/lib/toast.ts`                    | Create (optional helper)        |
| Various action files                  | Add toast calls after mutations |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] Manual: Save a note, verify success toast appears
- [ ] Manual: Trigger an error (e.g., offline), verify error toast
- [ ] Manual: Simulate render error, verify ErrorBoundary catches it
- [ ] Manual: Loading states show skeletons before data loads

## Task List

| #   | Task                                           | Can Parallel?     |
| --- | ---------------------------------------------- | ----------------- |
| 9.1 | Install sonner, add Toaster to providers       | No (first)        |
| 9.2 | Create ErrorBoundary component                 | Parallel with 9.1 |
| 9.3 | Create App Router error.tsx pages              | After 9.2         |
| 9.4 | Add success/error toasts to all server actions | After 9.1         |
| 9.5 | Create skeleton component                      | Parallel with 9.1 |
| 9.6 | Add skeletons to key loading states            | After 9.5         |
| 9.7 | Run full validation                            | After all above   |
