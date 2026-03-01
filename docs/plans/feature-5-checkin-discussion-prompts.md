# Feature Plan 5: Check-in Flow — DiscussionView + PromptManager + BasicTextInput

## Goal

Replace the current placeholder discussion step in check-ins with a rich **DiscussionView** containing private/shared note tabs, a **BasicTextInput** for note-taking, and a prompt display system. Also add a **PromptManager** to the settings for managing per-category discussion prompts.

## Current State

### Category Discussion Step (`src/app/(app)/checkin/steps.tsx`)

The `CategoryDiscussionStep` currently shows:

- Session timer
- Turn indicator
- Category icon, name, description
- Static text: "Take turns sharing your thoughts on this topic. Listen actively and respond with empathy."
- Navigation controls

**Missing:** No note-taking UI, no private/shared tabs, no prompt display, no draft save.

### Check-In Context (`src/contexts/CheckInContext.tsx`)

Already supports:

- `addDraftNote(note)` — creates a note in Supabase
- `updateDraftNote(id, updates)` — updates an existing draft
- `removeDraftNote(id)` — deletes a draft
- `draftNotes: Note[]` — array of drafts in session
- `updateCategoryProgress(categoryId, progress)` — marks category complete
- `saveSession()` — persists session state

### Warm-Up Prompts (`src/lib/warmup-prompts.ts`)

- 21 hardcoded prompts across 3 tones (light, medium, deep)
- `pickThreePrompts()` function used only in WarmUpStep
- No per-category prompts, no user-customizable prompts

### Categories (`src/hooks/useCategories.ts`)

- Fetches categories for couple
- Each category has `id`, `name`, `description`, `icon`
- No `prompts` field on categories

## Target State

1. `CategoryDiscussionStep` renders `DiscussionView` with note tabs + text input
2. `NoteTabs` component switches between private and shared note panes
3. `BasicTextInput` provides auto-saving textarea with character count
4. Category prompts displayed as suggestion cards during discussion
5. `PromptManager` in Settings for managing per-category prompts (separate tab or sub-panel in Categories)

## Database Migration

### `supabase/migrations/00018_category_prompts.sql`

Add a `prompts` JSONB column to the `categories` table:

```sql
ALTER TABLE categories ADD COLUMN prompts jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN categories.prompts IS 'Array of discussion prompt strings for this category';
```

**Schema:** `prompts` is a JSON array of strings, e.g. `["How did this topic come up?", "What would you like to change?"]`

No new RLS policies needed — `categories` already has couple-scoped RLS.

## New Files

### 1. `src/components/checkin/DiscussionView.tsx` (~200 lines)

The main discussion UI rendered inside `CategoryDiscussionStep`.

**Props:**

```typescript
interface DiscussionViewProps {
  categoryId: string
  categoryName: string
  categoryDescription?: string
  categoryIcon?: string
  prompts: string[]
  onComplete: () => void
}
```

**Layout:**

```
┌─────────────────────────────────┐
│  Category Header (icon + name)  │
│  Prompt Card (if prompts exist) │
├─────────────────────────────────┤
│  [Private] [Shared]  ← tabs    │
├─────────────────────────────────┤
│  BasicTextInput                 │
│  (placeholder changes per tab)  │
├─────────────────────────────────┤
│  [Save Progress]  [Complete →]  │
└─────────────────────────────────┘
```

**Behavior:**

- Loads existing drafts from `session.draftNotes` filtered by `categoryId`
- Two text areas (private + shared) managed as separate state
- Auto-save on 3-second debounce via `updateDraftNote`
- "Save Progress" button for manual save
- "Complete Discussion" button:
  1. Saves both notes
  2. Calculates time spent (`Date.now() - startTime`)
  3. Calls `updateCategoryProgress(categoryId, { isCompleted: true, timeSpent, notes })`
  4. Calls `onComplete()`
- Prompt card shows first prompt from category's `prompts` array with shuffle button

### 2. `src/components/checkin/NoteTabs.tsx` (~50 lines)

Simple tab bar switching between private and shared notes.

**Props:**

```typescript
interface NoteTabsProps {
  activeTab: 'private' | 'shared'
  onTabChange: (tab: 'private' | 'shared') => void
  hasPrivateContent: boolean
  hasSharedContent: boolean
}
```

**UI:**

- Two tab buttons with Lock/Globe icons
- Dot indicator when tab has content
- Private tab label: "Private Notes" (with lock icon)
- Shared tab label: "Shared Notes" (with globe icon)

### 3. `src/components/checkin/BasicTextInput.tsx` (~80 lines)

Textarea wrapper with helper text, character count, and auto-save.

**Props:**

```typescript
interface BasicTextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  helperText?: string
  maxLength?: number
  onSave?: () => void
  autoSave?: boolean
  autoSaveDelay?: number // ms, default 3000
}
```

**Features:**

- Textarea with character count (e.g., "142 / 2000")
- Helper text below (e.g., "Only you can see these notes")
- Auto-save indicator: "Saving..." → "Saved" with fade
- 3-second debounce for auto-save
- Minimum 4 rows, grows with content

### 4. `src/components/settings/PromptManager.tsx` (~200 lines)

Settings panel for managing per-category discussion prompts.

**Props:**

```typescript
interface PromptManagerProps {
  categories: { id: string; name: string; icon: string; prompts: string[] }[]
  coupleId: string
}
```

**UI:**

- Category selector (dropdown or pills)
- For selected category:
  - List of existing prompts with drag handles (reorder via `Reorder` from framer-motion)
  - Edit/delete buttons per prompt
  - "Add Prompt" button → inline text input
  - "Save" button to persist changes

**Behavior:**

- Uses `updateCategoryPrompts` server action
- Prompts are simple strings (no ID needed — ordered array)
- Maximum 10 prompts per category
- Drag-to-reorder changes array order

### 5. `src/app/(app)/settings/actions/prompts.ts` (~40 lines)

```typescript
export async function updateCategoryPrompts(categoryId: string, prompts: string[]): Promise<{ error: string | null }>
```

- Zod validation: array of strings, max 10, each max 200 chars
- Auth guard
- Updates `categories.prompts` JSONB column
- Revalidates `/settings`

### 6. Test files (~300 lines total)

- `src/components/checkin/DiscussionView.test.tsx`
- `src/components/checkin/NoteTabs.test.tsx`
- `src/components/checkin/BasicTextInput.test.tsx`
- `src/components/settings/PromptManager.test.tsx`
- `src/app/(app)/settings/actions/prompts.test.ts`

## Modified Files

### 7. `src/app/(app)/checkin/steps.tsx`

**Changes to `CategoryDiscussionStep`:**

Replace the current static content with `DiscussionView`:

```tsx
export function CategoryDiscussionStep(): React.ReactNode {
  const { completeStep, goToStep, getCurrentCategoryProgress, coupleId } = useCheckInContext()
  const { categories } = useCategories(coupleId)
  const currentCategory = getCurrentCategoryProgress()
  const category = categories.find((c) => c.id === currentCategory?.categoryId)

  return (
    <MotionBox variant="page" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <SessionTimer durationMinutes={settings.sessionDuration} />
      <TurnIndicator />
      <DiscussionView
        categoryId={category?.id ?? ''}
        categoryName={category?.name ?? 'Discussion'}
        categoryDescription={category?.description}
        categoryIcon={category?.icon}
        prompts={category?.prompts ?? []}
        onComplete={() => completeStep('category-discussion')}
      />
      <NavigationControls ... />
    </MotionBox>
  )
}
```

### 8. `src/hooks/useCategories.ts`

**Changes:**

- Ensure the `select` query includes `prompts` column:
  ```typescript
  .select('id, name, description, icon, sort_order, is_active, prompts')
  ```
- Map `prompts` through to the returned category objects

### 9. `src/types/database.ts`

**Changes:**

- Add `prompts: string[]` to `DbCategory` interface

### 10. `src/app/(app)/settings/settings-content.tsx`

**Changes:**

- Import `PromptManager`
- Option A: Add to existing "Categories" tab below `CategoryManager`
- Option B: Add as separate "Prompts" tab
- Recommendation: **Option A** — prompts are tied to categories, keep them together
- Pass `categories` (with prompts) to `PromptManager`

### 11. `src/app/(app)/settings/page.tsx`

**Changes:**

- Ensure categories query includes `prompts`:
  ```typescript
  .select('id, name, icon, description, prompts, sort_order, is_active')
  ```
- Pass full category data to `SettingsContent`

### 12. `src/app/(app)/checkin/steps.test.tsx`

**Update:** Mock `DiscussionView` or test integration with new component.

## Implementation Order

1. **Migration** `00018_category_prompts.sql` — add `prompts` column
2. `BasicTextInput.tsx` + test (standalone, no dependencies)
3. `NoteTabs.tsx` + test (standalone)
4. `DiscussionView.tsx` + test (uses BasicTextInput + NoteTabs)
5. `steps.tsx` modification (wire DiscussionView into CategoryDiscussionStep)
6. `useCategories.ts` + `database.ts` (add prompts to types/query)
7. `PromptManager.tsx` + `actions/prompts.ts` + tests
8. `settings-content.tsx` + `page.tsx` (wire PromptManager)
9. Run `npm run check` — verify all tests pass

## Complexity

- **New files:** 8 (4 components + 1 action file + 5 test files, some may merge)
- **Modified files:** 6 (steps, useCategories, database types, settings-content, settings page, steps test)
- **DB migrations:** 1 (simple ALTER TABLE)
- **Estimated lines:** ~900 new, ~80 modified
- **Risk:** Medium — DiscussionView integrates deeply with CheckInContext; need to test draft save/load cycle carefully. PromptManager uses drag-reorder which requires framer-motion's Reorder API (already a dependency).

## Design Decisions

### Why BasicTextInput instead of RichTextEditor?

The reference app has a `RichTextEditor` component, but it adds significant complexity (toolbar, formatting, markdown parsing). For v1, a simple textarea with auto-save is sufficient. Rich text can be added later as an enhancement to `BasicTextInput` without changing the component interface.

### Why prompts on categories instead of a separate table?

- Simple JSONB array is sufficient for 5-10 prompts per category
- No need for individual prompt IDs, metadata, or cross-category sharing
- If prompt templates become a feature later, a `prompt_templates` table can be added separately
- Keeps the migration minimal (one column add)

### Why not a full PromptLibrary?

The reference app has a `PromptLibrary` and `PromptTemplateEditor`. These are Plan 3 items (not selected). The PromptManager here is scoped to per-category prompts only — manageable and useful without the full library system.
