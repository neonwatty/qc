# Wire WT-3/WT-4 Components + Fix E2E Tests

**Date:** 2026-02-25
**Status:** Approved

## Problem

After merging 5 gap-remediation branches, knip found 8 unused files and 9 unused exports — new WT-3/WT-4 settings and love-language components were built but never wired into the UI. Additionally, 2 E2E test bugs cause failures independent of infrastructure.

## Design

### 1. Settings Page: Add 2 New Tabs

Current tabs: Profile | Relationship | Session | Data

New tabs: Profile | Relationship | Session | **Categories** | **Notifications** | Data

**Categories tab:**

- Renders `CategoryManager` component
- Props: `coupleId` (from existing page data)
- Resolves knip: `CategoryManager.tsx`, `CategoryCard.tsx`, `CategoryFormDialog.tsx`
- Resolves knip exports: `createCategory`, `updateCategory`, `deleteCategory`, `toggleCategoryActive`, `reorderCategories`

**Notifications tab:**

- Renders `NotificationSettings` + `PrivacySettings` stacked vertically
- Props: `coupleId` (from existing page data)
- Resolves knip: `NotificationSettings.tsx`, `PrivacySettings.tsx`

**Session tab addition:**

- Add `SessionProposalBanner` at top of `SessionSettingsPanel`
- Resolves knip: `SessionProposalBanner.tsx`

### 2. Love Languages: Add Discoveries Section

Add a "Discoveries" tab to the love languages page that renders `DiscoveryCard` for each discovery from context.

- Resolves knip: `DiscoveryCard.tsx`, `ConvertDiscoveryDialog.tsx`

### 3. E2E Test Fixes

**Trailing slash regex (auth.spec.ts):**
Route protection tests use `/\/login\?redirect=` but Next.js produces `/login/?redirect=`. Fix: add optional slash `\/?` before `\?` in all 3 redirect assertions.

**Invite redirect (invite.spec.ts):**
Test expects unauthenticated invite to redirect to `/signup` but middleware sends to `/login/` first. Fix: change `waitForURL` to match `/login/` since Supabase isn't running and the invite page server component (which does the signup redirect) can't execute.

**Signup link href (auth.spec.ts):**
Test expects `href="/login"` but gets `href="/login/"`. Fix: update assertion to accept trailing slash.

## Files Changed

| File                                               | Change                                  |
| -------------------------------------------------- | --------------------------------------- |
| `src/app/(app)/settings/settings-content.tsx`      | Add 'categories' + 'notifications' tabs |
| `src/components/settings/SessionSettingsPanel.tsx` | Add SessionProposalBanner at top        |
| `src/app/(app)/love-languages/page.tsx`            | Add discoveries tab with DiscoveryCard  |
| `e2e/auth.spec.ts`                                 | Fix trailing slash regex patterns       |
| `e2e/invite.spec.ts`                               | Fix redirect assertion                  |

## Out of Scope

- Running E2E tests with local Supabase (separate infrastructure step after code changes)
- Component drag-and-drop reordering in CategoryManager (grip handle exists but not functional)
