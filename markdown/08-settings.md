# Plan 08: Settings Expansion

**Priority**: MEDIUM | **Effort**: Medium | **Parallel Group**: C | **Dependencies**: Plan 03 (session settings fields)

## Problem

Settings has 3 tabs (Profile, Relationship, Session Rules). The prototype had 7+ sections including discussion categories manager, notification settings, privacy/sharing controls, appearance, and check-in scheduling. The settings feel sparse.

## Current State

- Profile: display name, avatar, email (read-only)
- Relationship: couple info, partner invite, leave couple
- Session Rules: SessionSettingsPanel with templates

## Plan

### Phase 1: Discussion Categories Manager

1. **Create `CategoryManager.tsx`** (`src/components/settings/CategoryManager.tsx`):
   - List of current check-in categories (Emotional Connection, Communication, Intimacy, Goals)
   - Add custom category form (name, emoji icon, description)
   - Reorder with drag handles
   - Delete custom categories (not default ones)
   - Edit descriptions

2. **Schema consideration**: Categories are currently hardcoded in the CheckInContext. Options:
   - **Option A**: Store custom categories in `couples.settings` JSONB field
   - **Option B**: Create a `categories` table
   - **Recommendation**: Option A — simpler, no migration needed, couples.settings JSONB already exists

3. **Add "Categories" tab** to settings page

### Phase 2: Notification Settings

4. **Create `NotificationSettings.tsx`** (`src/components/settings/NotificationSettings.tsx`):
   - Check-in reminder toggle
   - Reminder frequency (daily/weekly)
   - Preferred reminder time
   - Email notifications toggle (for when Resend is enabled)
   - In-app notifications toggle

5. **Store in** `couples.settings` JSONB:

   ```json
   {
     "notifications": {
       "checkInReminder": true,
       "reminderFrequency": "weekly",
       "reminderTime": "09:00",
       "emailNotifications": false,
       "inAppNotifications": true
     }
   }
   ```

6. **Add "Notifications" tab** to settings page

### Phase 3: Privacy & Sharing Defaults

7. **Create `PrivacySettings.tsx`** (`src/components/settings/PrivacySettings.tsx`):
   - Default note privacy (shared/private) toggle
   - Default love language privacy toggle
   - Share progress metrics with partner toggle

8. **Store in** `couples.settings` JSONB:

   ```json
   {
     "privacy": {
       "defaultNotePrivacy": "shared",
       "defaultLanguagePrivacy": "shared",
       "shareProgress": true
     }
   }
   ```

9. **Wire defaults** into NoteEditor and AddLanguageDialog (use stored default as initial value)

### Phase 4: Check-in Schedule

10. **Create `CheckInSchedule.tsx`** (`src/components/settings/CheckInSchedule.tsx`):
    - Frequency picker: weekly (default), biweekly, monthly
    - Preferred day of week selector
    - Preferred time of day
    - Display next scheduled check-in date

11. **Store in** `couples.settings` JSONB:

    ```json
    {
      "schedule": {
        "frequency": "weekly",
        "preferredDay": "sunday",
        "preferredTime": "19:00"
      }
    }
    ```

12. **Use schedule data** in PrepBanner and Dashboard to show "Next check-in: Sunday at 7 PM"

### Phase 5: Update Settings Tabs

13. **Reorganize settings** into 6 tabs:
    - Profile
    - Relationship
    - Session Rules
    - Categories
    - Notifications
    - Privacy

## Files to Create/Modify

| File                                               | Action                       |
| -------------------------------------------------- | ---------------------------- |
| `src/components/settings/CategoryManager.tsx`      | Create                       |
| `src/components/settings/NotificationSettings.tsx` | Create                       |
| `src/components/settings/PrivacySettings.tsx`      | Create                       |
| `src/components/settings/CheckInSchedule.tsx`      | Create                       |
| `src/app/(app)/settings/settings-content.tsx`      | Add new tabs                 |
| `src/app/(app)/settings/actions.ts`                | Add actions for new settings |
| `src/types/index.ts`                               | Add settings subtypes        |

## Verification

- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — clean
- [ ] `npm test` — all pass
- [ ] Manual: Add custom category, verify it appears in check-in
- [ ] Manual: Change notification settings, verify persistence
- [ ] Manual: Set privacy defaults, verify they apply to new notes/languages
- [ ] Manual: Set check-in schedule, verify next date shows on dashboard

## Task List

| #   | Task                                              | Can Parallel?        |
| --- | ------------------------------------------------- | -------------------- |
| 8.1 | Create CategoryManager component                  | Yes (parallel start) |
| 8.2 | Create NotificationSettings component             | Parallel with 8.1    |
| 8.3 | Create PrivacySettings component                  | Parallel with 8.1    |
| 8.4 | Create CheckInSchedule component                  | Parallel with 8.1    |
| 8.5 | Add server actions for new settings               | After 8.1-8.4        |
| 8.6 | Wire defaults into NoteEditor + AddLanguageDialog | After 8.3            |
| 8.7 | Reorganize settings tabs                          | After 8.1-8.4        |
| 8.8 | Run full validation                               | After all above      |
