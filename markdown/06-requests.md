# Plan 06: Request Enhancements

**Priority**: MEDIUM | **Effort**: Small | **Parallel Group**: C | **Dependencies**: Plan 05 (for request→reminder conversion)

## Problem

Requests are accept/decline only with no text response, no conversion to reminders, and no organizational features. The prototype envisioned requests as a richer communication tool.

## Current State

- `RequestCard.tsx` — Title, description, category, priority, status, accept/decline
- `RequestForm.tsx` — Title, description, category, priority, suggested date
- Received/Sent tabs
- DB: `requests` table with status (pending/accepted/declined/converted)

## Plan

### Phase 1: Schema Migration

1. **Create migration** `make db-new name=enhance_requests`:
   ```sql
   ALTER TABLE requests
     ADD COLUMN response_text text,
     ADD COLUMN responded_at timestamptz,
     ADD COLUMN converted_to_reminder_id uuid REFERENCES reminders(id),
     ADD COLUMN suggested_frequency text CHECK (suggested_frequency IN ('once', 'recurring')),
     ADD COLUMN tags text[] DEFAULT '{}';
   ```

### Phase 2: Response Text

2. **Add response textarea** to accept/decline action on `RequestCard.tsx`:
   - When clicking Accept/Decline, show a small inline form with optional text response
   - "Add a note (optional)" placeholder
   - Response text displays on the card after responding
   - `responded_at` auto-set on accept/decline

### Phase 3: Request-to-Reminder Conversion

3. **Add "Convert to Reminder" button** on accepted requests:
   - Opens a pre-filled `ReminderForm` with request title and description
   - On save, sets `converted_to_reminder_id` on the request and `status = 'converted'`
   - Shows "Converted to Reminder" badge on request card with link to reminder

### Phase 4: Suggested Frequency

4. **Add frequency field** to `RequestForm.tsx`:
   - Toggle: "One-time" / "Recurring"
   - Display frequency badge on `RequestCard.tsx`

### Phase 5: Tags

5. **Add tags input** to `RequestForm.tsx`:
   - Reuse the tag input pattern from Notes
   - Display tag pills on `RequestCard.tsx`

## Files to Create/Modify

| File                                             | Action                            |
| ------------------------------------------------ | --------------------------------- |
| `supabase/migrations/000XX_enhance_requests.sql` | Create migration                  |
| `src/app/(app)/requests/actions.ts`              | Add response, conversion actions  |
| `src/components/requests/RequestCard.tsx`        | Add response UI, conversion, tags |
| `src/components/requests/RequestForm.tsx`        | Add frequency, tags               |
| `src/types/database.ts`                          | Update DbRequest type             |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] `make db-push` — migration applies
- [ ] Manual: Accept request with response text, verify it displays
- [ ] Manual: Convert accepted request to reminder, verify badge + link
- [ ] Manual: Create request with tags and frequency

## Task List

| #   | Task                                         | Can Parallel?             |
| --- | -------------------------------------------- | ------------------------- |
| 6.1 | Create DB migration for request enhancements | No (first)                |
| 6.2 | Update types for new columns                 | After 6.1                 |
| 6.3 | Add response text UI + server action         | After 6.2                 |
| 6.4 | Add request-to-reminder conversion flow      | After 6.2 (needs Plan 05) |
| 6.5 | Add suggested frequency field                | Parallel with 6.3         |
| 6.6 | Add tags input                               | Parallel with 6.3         |
| 6.7 | Run full validation                          | After all above           |
