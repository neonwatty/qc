# Feature Plan 4: Settings — ReminderScheduler + PersonalizationPanel + Redo Onboarding

## Goal

Add three new settings panels:

1. **ReminderScheduler** — manage recurring reminder rules with day/time pickers
2. **PersonalizationPanel** — color presets, font size, reduced motion, high contrast
3. **"Redo Onboarding" button** — reset couple data and restart from scratch

## Current State

### Settings Tabs (`src/app/(app)/settings/settings-content.tsx`)

7 tabs: Profile, Relationship, Session Rules, Categories, Notifications, Appearance, Data & Privacy

### Appearance Tab

- Only `ThemeSelector` (light/dark toggle, 2 buttons)
- Theme stored in localStorage via `ThemeContext.tsx`
- No color customization, font size, or accessibility options

### Reminder Management

- Reminders exist in DB (`reminders` table) with `frequency`, `custom_schedule`, `scheduled_for`, `notification_channel`
- Reminders page (`/reminders`) handles CRUD for individual reminders
- No dedicated "scheduler" view that shows recurring rules and upcoming schedule
- Settings has no reminder-related panel

### Redo Onboarding

- `RelationshipSettings` has "Leave Couple" danger button
- No "redo" mechanism — leaving couple destroys the couple record
- No way to restart onboarding while keeping the couple intact

## New Files

### 1. `src/components/settings/ReminderScheduler.tsx` (~250 lines)

A settings panel for managing recurring reminder schedules with a visual calendar preview.

**Sections:**

**A. Active Reminders List**

- Fetch existing reminders for the couple from server (passed as prop)
- Each reminder shows: name, frequency badge, time, day(s), notification channels, enable/disable toggle
- Delete button (with confirmation)
- "Add Reminder" button opens inline form

**B. Add/Edit Reminder Form** (inline card, not modal)

- **Name** — text input, required
- **Type** — toggle: "Recurring" / "One-time"
- **Frequency** (if recurring) — select: Daily, Weekly, Bi-weekly, Monthly
- **Days of week** (if weekly) — 7-button grid, multi-select
- **Day of month** (if monthly) — number input 1-31
- **Time** — time input
- **Notification channel** — multi-select pills: In-app, Email, Both
- **Category** — select from couple's active categories
- Cancel / Save buttons

**C. Upcoming Schedule Preview**

- 7-day lookahead showing which reminders fire on which days
- Simple timeline with day labels and reminder names
- Computed client-side from reminder data

**Props:**

```typescript
interface ReminderSchedulerProps {
  reminders: DbReminder[]
  coupleId: string
  categories: { id: string; name: string; icon: string }[]
}
```

**Server Actions:**

- Reuses existing `createReminder`, `deleteReminder` from reminders page actions (import from `src/app/(app)/reminders/actions.ts`)
- Add new `updateReminderSchedule` action to `src/app/(app)/settings/actions/reminders.ts`:
  ```typescript
  export async function updateReminderSchedule(
    reminderId: string,
    updates: { is_active?: boolean; frequency?: string; custom_schedule?: object; scheduled_for?: string },
  ): Promise<{ error: string | null }>
  ```

### 2. `src/app/(app)/settings/actions/reminders.ts` (~60 lines)

New action file for reminder schedule management:

- `updateReminderSchedule` — Zod-validated, auth-guarded, updates reminder row
- `toggleReminderActive` — quick toggle for enable/disable

### 3. `src/components/settings/PersonalizationPanel.tsx` (~180 lines)

Extends the Appearance tab beyond just light/dark theme.

**Sections:**

**A. Primary Color** (color presets grid)

- 6 color swatches: Pink (default), Blue, Green, Purple, Orange, Teal
- Each is a button with HSL background color
- Selected state: border highlight + checkmark overlay
- Stores selection in `couples.settings.primaryColor` (JSONB) via `updateCoupleSettings`

**B. Text Size**

- 3 buttons: Small, Medium (default), Large
- Applies CSS variable `--font-size-base` to root
- Stores in `couples.settings.fontSize`

**C. Accessibility**

- **High Contrast** toggle — adds `high-contrast` class to HTML root
- **Reduce Motion** toggle — sets `prefers-reduced-motion` media override
- Stores in `couples.settings.highContrast` and `couples.settings.reducedMotion`

**D. Reset to Defaults** button

**Props:**

```typescript
interface PersonalizationPanelProps {
  coupleId: string
  currentSettings: {
    primaryColor?: string
    fontSize?: string
    highContrast?: boolean
    reducedMotion?: boolean
  }
}
```

**Implementation Note:** Color presets apply CSS custom properties at runtime. No Tailwind config changes needed — use `style={{ '--primary': hslValue }}` on root or use the existing `ThemeContext` extended with color support.

### 4. `src/components/settings/RedoOnboardingButton.tsx` (~50 lines)

A danger-zone button in the Relationship tab.

**UI:**

- Red-outlined button: "Restart Onboarding"
- Confirmation dialog (AlertDialog): "This will clear your couple data and restart the setup process. Your partner will need to be re-invited. Are you sure?"
- Calls `redoOnboarding` server action on confirm

**Behavior:**

- Deletes: all reminders, requests, action_items, notes, check_ins, love_languages, love_actions, milestones for the couple
- Deletes: couple_invites
- Deletes: the couple record
- Clears: `couple_id` on both partner profiles
- Redirects to `/onboarding`

This is different from "Leave Couple" which only removes the current user. "Redo Onboarding" is a full reset.

### 5. `src/app/(app)/settings/actions/onboarding.ts` (~60 lines)

New action:

```typescript
export async function redoOnboarding(): Promise<{ error: string | null }>
```

- Uses admin client (service role) to cascade-delete couple data
- Clears `couple_id` on both profiles
- Redirects to `/onboarding`

### 6. Test files (~200 lines total)

- `src/components/settings/ReminderScheduler.test.tsx`
- `src/components/settings/PersonalizationPanel.test.tsx`
- `src/components/settings/RedoOnboardingButton.test.tsx`
- `src/app/(app)/settings/actions/reminders.test.ts`
- `src/app/(app)/settings/actions/onboarding.test.ts`

## Modified Files

### 7. `src/app/(app)/settings/settings-content.tsx`

**Changes:**

- Import `ReminderScheduler`, `PersonalizationPanel`, `RedoOnboardingButton`
- Add `reminders` and `categories` to Props interface
- Add new tab: `'reminders'` (or integrate into existing Notifications tab)
- Replace `ThemeSelector` in Appearance tab with `PersonalizationPanel` + `ThemeSelector`
- Add `RedoOnboardingButton` to Relationship tab (after existing danger zone)

**Tab structure decision:** Add "Reminders" as a new 8th tab, or nest inside "Notifications". Recommendation: new tab, since it's a distinct concern.

Updated TABS:

```typescript
const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'session', label: 'Session Rules' },
  { id: 'categories', label: 'Categories' },
  { id: 'reminders', label: 'Reminders' }, // NEW
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'data', label: 'Data & Privacy' },
]
```

### 8. `src/app/(app)/settings/page.tsx`

**Changes:**

- Add queries for reminders and categories:

  ```typescript
  const remindersResult = await supabase
    .from('reminders')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })

  const categoriesResult = await supabase
    .from('categories')
    .select('id, name, icon')
    .eq('couple_id', coupleId)
    .eq('is_active', true)
    .order('sort_order')
  ```

- Pass `reminders`, `categories`, and `coupleSettings` (for PersonalizationPanel) to `SettingsContent`

### 9. `src/app/(app)/settings/actions/profile.ts`

**Changes:**

- Add `primaryColor`, `fontSize`, `highContrast`, `reducedMotion` to the settings whitelist in `updateCoupleSettings`

### 10. `src/contexts/ThemeContext.tsx`

**Changes:**

- Extend to read `primaryColor`, `fontSize`, `highContrast`, `reducedMotion` from couple settings
- Apply CSS custom properties on mount and when settings change
- Keep localStorage as local override, couple settings as shared source of truth
- Add `setFontSize()`, `setHighContrast()`, `setReducedMotion()` methods

### 11. `src/components/settings/RelationshipSettings.tsx`

**Changes:**

- Add `RedoOnboardingButton` in the danger zone section (below "Leave Couple")

## No Database Migration Needed

- All personalization settings go in `couples.settings` JSONB (existing column)
- Reminders table already has all needed columns
- `redoOnboarding` uses cascade deletes on existing tables

## Dependencies

- **Plan 1** populates `checkInFrequency` in settings — but ReminderScheduler works independently
- **ThemeContext** changes needed for PersonalizationPanel to take effect globally

## Implementation Order

1. `ReminderScheduler.tsx` + `actions/reminders.ts` + tests (standalone, biggest piece)
2. `PersonalizationPanel.tsx` + tests (standalone UI)
3. `RedoOnboardingButton.tsx` + `actions/onboarding.ts` + tests (standalone)
4. `ThemeContext.tsx` (extend with color/font/accessibility)
5. `settings-content.tsx` + `page.tsx` (wire everything)
6. `actions/profile.ts` (whitelist new settings keys)
7. `RelationshipSettings.tsx` (add redo button)
8. Run `npm run check` — verify all tests pass

## Complexity

- **New files:** 8 (3 components + 2 action files + 5 test files, some may merge)
- **Modified files:** 6 (settings-content, page, profile actions, ThemeContext, RelationshipSettings, plus test updates)
- **DB migrations:** 0
- **Estimated lines:** ~800 new, ~100 modified
- **Risk:** Medium — ThemeContext changes affect global behavior; redoOnboarding cascade delete needs careful testing
