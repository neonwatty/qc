# Plan 05: Reminder Enhancements

**Priority**: MEDIUM | **Effort**: Medium | **Parallel Group**: B | **Dependencies**: None

## Problem

Reminders are basic: a card list with active/inactive toggle. The prototype had a chat-like interface with snooze, reschedule, full text search, overdue tracking, and partner assignment. The current UX doesn't match user expectations for a reminder system.

## Current State

- `ReminderCard.tsx` — Card with title, message, category badge, frequency, active toggle, delete
- `ReminderForm.tsx` — Create/edit form with title, message, category, frequency, schedule, channel
- `reminders-content.tsx` — Filter buttons (All/Active/Inactive), list of cards
- DB schema: `reminders` table with `is_active` boolean, no snooze/overdue fields

## Plan

### Phase 1: Schema Migration

1. **Create migration** `make db-new name=enhance_reminders`:

   ```sql
   ALTER TABLE reminders
     ADD COLUMN is_snoozed boolean DEFAULT false,
     ADD COLUMN snooze_until timestamptz,
     ADD COLUMN last_notified_at timestamptz,
     ADD COLUMN assigned_to uuid REFERENCES profiles(id),
     ADD COLUMN related_check_in_id uuid REFERENCES check_ins(id),
     ADD COLUMN related_action_item_id uuid REFERENCES action_items(id);
   ```

2. **Update RLS policies** to allow the new columns (existing couple-scoped policies should cover this)

### Phase 2: Snooze Functionality

3. **Add snooze UI** to `ReminderCard.tsx`:
   - Snooze dropdown button with options: 15 minutes, 1 hour, Tomorrow morning
   - When snoozed: show "Snoozed until [time]" badge
   - Auto-unsnooze: `is_snoozed = false` when `snooze_until` passes (handled in cron or client)

4. **Create server action** `snoozeReminder(id, duration)` in `reminders/actions.ts`:
   - Sets `is_snoozed = true`, `snooze_until = now + duration`

5. **Add "Snoozed" filter** to the filter bar (All / Active / Snoozed / Inactive)

### Phase 3: Overdue Tracking

6. **Add overdue logic**:
   - A reminder is overdue when `scheduled_for < now` AND `is_active = true` AND NOT snoozed AND NOT completed
   - Add "Overdue" filter to filter bar
   - Overdue reminders show red/amber accent on card
   - Sort overdue to the top of the list

7. **Add overdue count badge** to the Reminders nav item (optional)

### Phase 4: Text Search

8. **Add search input** to reminders page header:
   - Search across `title` and `message` columns
   - Client-side filtering for instant feedback
   - Debounced with 300ms delay

### Phase 5: Partner Assignment

9. **Add "Assign to" field** in `ReminderForm.tsx`:
   - Dropdown: "Me" / "Partner" / "Both"
   - Maps to `assigned_to` column (null = both, user_id = specific)
   - Show assignment badge on `ReminderCard.tsx`

### Phase 6: Cross-Feature Linking (Foundation)

10. **Add optional link fields** in `ReminderForm.tsx`:
    - "Related check-in" dropdown (recent check-ins)
    - "Related action item" dropdown (incomplete action items)
    - Display links on reminder card as subtle badges

## Files to Create/Modify

| File                                              | Action                          |
| ------------------------------------------------- | ------------------------------- |
| `supabase/migrations/000XX_enhance_reminders.sql` | Create migration                |
| `src/app/(app)/reminders/actions.ts`              | Add snooze action               |
| `src/components/reminders/ReminderCard.tsx`       | Add snooze, overdue, assignment |
| `src/components/reminders/ReminderForm.tsx`       | Add assignment, linking         |
| `src/app/(app)/reminders/reminders-content.tsx`   | Add search, new filters         |
| `src/types/database.ts`                           | Update DbReminder type          |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] `make db-push` — migration applies
- [ ] Manual: Snooze a reminder, verify badge and filter
- [ ] Manual: Create past-due reminder, verify overdue state
- [ ] Manual: Search reminders by title text
- [ ] Manual: Assign reminder to partner, verify badge

## Task List

| #   | Task                                          | Can Parallel?     |
| --- | --------------------------------------------- | ----------------- |
| 5.1 | Create DB migration for new reminder columns  | No (first)        |
| 5.2 | Update types/database.ts for new columns      | After 5.1         |
| 5.3 | Add snooze server action + UI on ReminderCard | After 5.2         |
| 5.4 | Add overdue logic + visual state + filter     | Parallel with 5.3 |
| 5.5 | Add text search input with debounce           | Parallel with 5.3 |
| 5.6 | Add partner assignment field + badge          | Parallel with 5.3 |
| 5.7 | Add cross-feature linking (optional)          | After 5.2         |
| 5.8 | Run full validation                           | After all above   |
