# iOS Workflows

> Workflow documentation for QC (Quality Couple) — tested in Safari on iOS Simulator
> Last updated: 2026-03-03
> Base URL: https://tryqc.co (production) / http://localhost:3000 (dev)
> Platform: Capacitor iOS app loading remote URL in WKWebView

## iOS UX Evaluation Criteria

Every screenshot captured during workflow execution should be evaluated against these criteria. Flag any violations as issues in the report.

### Navigation (CRITICAL)

| Criterion                              | Pass                                           | Fail                                                   |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Primary nav uses bottom tab bar        | Tab bar visible at bottom with 4+ items        | Hamburger menu (☰) used for primary navigation        |
| Back navigation uses iOS pattern       | Single back chevron with previous screen title | Breadcrumbs, "Back" text links, or Android-style arrow |
| No Floating Action Buttons as sole CTA | Primary actions in nav bar or inline           | Floating circle button as the only way to create       |
| Modals slide up from bottom            | Sheets/modals animate upward                   | Modals appear centered or fade in from top             |

### Touch Targets & Interaction

| Criterion                        | Pass                                           | Fail                                             |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| All tap targets >= 44x44pt       | Buttons, links, icons are comfortably tappable | Tiny links, small icon buttons, cramped controls |
| Toggle switches (not checkboxes) | iOS-style toggle for boolean settings          | Web checkboxes for on/off states                 |
| Adequate spacing between targets | No accidental taps on adjacent elements        | Controls packed tightly together                 |
| Form inputs >= 44pt height       | Text fields are comfortable to tap into        | Small, thin input fields                         |

### Visual Design

| Criterion                          | Pass                                              | Fail                                                   |
| ---------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| iOS-style form controls            | Native-feeling pickers, toggles, selects          | Web dropdowns, Material Design inputs, outlined fields |
| Subtle shadows and rounded corners | iOS card styling (soft shadows, ~12px radius)     | Heavy Material elevation shadows, sharp corners        |
| System font or equivalent          | SF Pro, -apple-system, or similar system stack    | Custom serif fonts, non-standard type                  |
| Proper dark mode support           | All elements respect dark theme, no white flashes | Hardcoded colors that break in dark mode               |
| Generous spacing and hierarchy     | iOS-standard padding (16pt+), clear hierarchy     | Dense cramped layouts, unclear content grouping        |

### Layout & Safe Areas

| Criterion                  | Pass                                                        | Fail                                                 |
| -------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| Safe area insets respected | Content not hidden behind notch, home indicator, or tab bar | Text/buttons overlap system UI or are cut off        |
| Keyboard avoidance         | Forms scroll up when keyboard opens                         | Input fields hidden behind keyboard                  |
| No horizontal overflow     | Content fits within viewport width                          | Horizontal scroll appears, content bleeds off-screen |
| Scroll feels native        | Smooth momentum scrolling, rubber-band at edges             | Janky scroll, no overscroll bounce                   |

### Feedback & State

| Criterion                | Pass                                                     | Fail                                           |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------- |
| Loading states visible   | Skeletons, spinners, or progress indicators during loads | Blank screen while loading, no feedback        |
| Error states are clear   | Red styling + text message, not just color               | Errors only indicated by color (inaccessible)  |
| Empty states are helpful | Illustration or message + CTA when no data exists        | Blank page or "No results" with no guidance    |
| Success confirmation     | Visual/haptic feedback after actions complete            | Action completes silently with no confirmation |

### Anti-Patterns to Flag

Any of these should be reported as issues:

- **Hamburger menu** as primary navigation (should be tab bar)
- **FAB (floating action button)** as only creation mechanism
- **Web-style dropdowns** (`<select>`) instead of iOS pickers
- **Checkboxes** instead of toggle switches for settings
- **Toast/snackbar** notifications (Android pattern) instead of iOS banners/alerts
- **Material Design** styling (outlined inputs, heavy elevation, ripple effects)
- **Text smaller than 16px** in input fields (triggers iOS auto-zoom)
- **Fixed headers** that cover scrollable content
- **Horizontal scroll** on any non-carousel element
- **Missing safe area insets** causing content overlap with system UI

## Simulator Setup (one-time)

1. Boot iOS Simulator (iPhone 15 Pro recommended)
2. Open Safari and navigate to base URL
3. Sign in with test account or create new account
4. Grant any permission prompts manually
5. Ensure network connectivity to tryqc.co (or local dev server)

## Quick Reference

| #   | Workflow                  | Purpose                                 | Steps |
| --- | ------------------------- | --------------------------------------- | ----- |
| 1   | Signup & Onboarding       | Account creation + 7-step onboarding    | 8     |
| 2   | Partner Invite Acceptance | Partner joins existing couple           | 6     |
| 3   | Dashboard Overview        | Stats, activity, quick actions          | 5     |
| 4   | Navigation & Tab Bar      | Mobile nav, More menu, swipe-back       | 6     |
| 5   | Check-In Session          | Full check-in flow with reflection      | 10    |
| 6   | Notes CRUD                | Create, edit, tag, privacy, bulk delete | 8     |
| 7   | Growth & Milestones       | Timeline, create milestone, photos      | 7     |
| 8   | Love Languages            | Add languages, actions, discoveries     | 8     |
| 9   | Reminders                 | Create, toggle, snooze, delete          | 6     |
| 10  | Requests                  | Create, respond, convert to reminder    | 7     |
| 11  | Settings                  | Profile, couple, session, theme         | 8     |
| 12  | Empty States              | Fresh account with no data              | 5     |
| 13  | Real-time Sync            | Partner changes appear live             | 6     |
| 14  | Error & Validation        | Form errors, network handling           | 5     |

---

## Core Workflows

### Workflow 1: Signup & Onboarding

> Tests the complete new user journey from signup through the 7-step onboarding wizard to the dashboard.

**URL:** https://tryqc.co/signup

1. Open signup page
   - Open Safari and navigate to https://tryqc.co/signup
   - Verify signup form is visible with email and password fields
   - Verify "Sign Up" button and social login options (Google, GitHub) are present

2. Create account with email
   - Tap the email field
   - Type a valid email address
   - Tap the password field
   - Type a password (8+ characters)
   - Tap "Sign Up" button
   - Verify redirect to /onboarding

3. Complete Step 1: Display Name
   - Verify onboarding wizard is visible with progress indicator
   - Tap the display name field
   - Type "Test User"
   - Tap "Next" or "Continue" button
   - Verify progress advances to step 2

4. Complete Step 2: Partner Email
   - Tap the partner email field
   - Type partner's email address
   - Tap "Next" button
   - Verify progress advances

5. Complete Step 3: Relationship Date
   - Tap the date field or date picker
   - Select a date
   - Tap "Next" button

6. Complete Step 4: Love Languages
   - Verify love language selection cards are visible
   - Tap to select at least one love language
   - Tap "Next" button

7. Complete Step 5-7: Preferences, Reminders, Tour
   - Complete remaining onboarding steps
   - Verify each step advances the progress indicator
   - On final step, tap "Get Started" or equivalent completion button

8. Verify dashboard access
   - Verify redirect to /dashboard
   - Verify dashboard widgets are visible (stats, quick actions)
   - Verify bottom tab bar navigation is present with 4 tabs + More

---

### Workflow 2: Partner Invite Acceptance

> Tests the partner invite flow from receiving the invite link through joining the couple.

**URL:** https://tryqc.co/invite/[token]

**Prerequisites:** Workflow 1 completed — a couple exists with a pending invite.

1. Open invite link
   - Navigate to the invite URL (https://tryqc.co/invite/[token])
   - Verify invite acceptance page is visible
   - Verify the inviting partner's name is shown

2. Sign up as partner (if not logged in)
   - If redirected to signup, create a new account
   - After signup, verify redirect back to invite page

3. Accept invite
   - Tap "Accept Invite" or "Join Couple" button
   - Wait for processing

4. Verify couple joined
   - Verify redirect to /dashboard (or /onboarding if partner needs onboarding)
   - Verify couple name is visible in the header or settings

5. Verify partner data visible
   - Navigate to /love-languages
   - Verify partner's shared love languages tab is accessible
   - Navigate to /dashboard
   - Verify partner avatar pair is shown in the header

6. Verify invite status updated
   - Navigate to /settings
   - Verify partner is listed in couple settings
   - Verify no pending invite banner is shown

---

### Workflow 3: Dashboard Overview

> Tests the dashboard hub with stats, activity feed, quick actions, and widgets.

**URL:** https://tryqc.co/dashboard

**Prerequisites:** Logged in with couple established.

1. Open dashboard
   - Navigate to https://tryqc.co/dashboard
   - Wait for page to load
   - Verify dashboard layout with stats grid, quick actions, and widgets

2. Review stats grid
   - Verify stats tiles are visible (check-ins count, notes count, milestones)
   - Verify streak display shows current streak
   - Tap a stats tile and verify it navigates to the relevant page

3. Check quick actions
   - Verify quick action buttons are visible
   - Tap "Start Check-In" quick action
   - Verify navigation to /checkin
   - Tap back or navigate back to /dashboard

4. Review widgets
   - Scroll down to see all dashboard widgets
   - Verify Today's Reminders widget shows relevant reminders (or empty state)
   - Verify Recent Activity feed shows recent actions
   - Verify Love Languages widget shows a summary

5. Verify iOS platform conventions
   - Verify bottom tab bar is visible with Dashboard highlighted
   - Verify all interactive elements are at least 44x44pt
   - Verify pull-to-refresh works on the dashboard (pull down)
   - Verify safe area insets are respected at bottom

---

### Workflow 4: Navigation & Tab Bar

> Tests the mobile navigation patterns including tab bar, More menu, and swipe-back gestures.

**URL:** https://tryqc.co/dashboard

1. Test bottom tab bar
   - Verify 4 tabs visible at bottom: Dashboard, Check-in, Notes, Growth
   - Verify "More" button is present (5th item)
   - Tap each tab and verify navigation to correct page
   - Verify active tab is highlighted

2. Test More menu
   - Tap "More" button in the tab bar
   - Verify slide-out panel appears from the right with backdrop blur
   - Verify all 8 navigation items visible: Dashboard, Check-in, Notes, Growth, Reminders, Love Languages, Requests, Settings
   - Tap "Reminders" in the More menu
   - Verify navigation to /reminders
   - Verify More menu closes

3. Test page transitions
   - Navigate between pages via tab bar
   - Verify smooth page transitions
   - Verify no layout shift or flash of unstyled content

4. Test swipe-back gesture
   - Navigate to a detail page or sub-page
   - Swipe right from the left edge of the screen
   - Verify swipe-back navigation works
   - Verify visual drag indicator appears during swipe

5. Test header elements
   - Verify QC logo is visible in the header
   - Verify theme toggle (light/dark) is accessible
   - Verify user avatar pair is shown

6. Verify iOS platform conventions
   - Verify tab bar uses iOS-style bottom navigation (not hamburger menu)
   - Verify tab bar respects safe area insets on notched devices
   - Verify no content is hidden behind the tab bar
   - Verify active states have appropriate visual feedback

---

## Feature Workflows

### Workflow 5: Check-In Session

> Tests the complete check-in flow: category selection, warm-up, discussion, reflection, action items, and celebration.

**URL:** https://tryqc.co/checkin

1. Start a new check-in
   - Navigate to /checkin
   - Verify category selection grid is visible with emoji icons
   - Verify at least 4 default categories: Communication, Quality Time, Future Planning, Challenges

2. Select categories
   - Tap 1-3 category cards
   - Verify selected cards show visual feedback (highlight, checkmark)
   - Verify haptic feedback on selection (test on device)
   - Tap "Start" or "Begin Check-In" button

3. Complete warm-up step
   - Verify warm-up prompt is displayed
   - Verify progress bar shows current step
   - Type a response in the text input
   - Tap "Next" to proceed

4. Complete discussion
   - Verify discussion view is visible with turn indicator
   - Verify session timer is counting down
   - Verify navigation controls (Previous/Next) are visible
   - Type responses for each discussion prompt
   - Tap "Next" to advance through prompts

5. Add action items
   - Verify action items section is visible
   - Tap "Add Action Item" button
   - Type an action item title
   - Verify action item appears in the list
   - Add 1-2 more action items

6. Record mood
   - Verify mood selector is visible (before/after ratings)
   - Select mood ratings
   - Verify selection is visually confirmed

7. Complete reflection
   - Verify reflection form is shown
   - Type reflection text
   - Tap "Complete" or "Finish Check-In" button

8. Verify celebration
   - Verify completion celebration animation plays
   - Verify confetti or success animation is visible
   - Verify haptic feedback fires (success pattern on device)

9. Review completed check-in
   - Verify check-in summary is displayed
   - Verify action items are listed
   - Verify mood scores are shown

10. Return to dashboard
    - Navigate back to /dashboard
    - Verify stats updated (check-in count incremented)
    - Verify Recent Activity shows the new check-in

---

### Workflow 6: Notes CRUD

> Tests creating, editing, tagging, privacy toggling, and bulk deleting notes.

**URL:** https://tryqc.co/notes

1. View notes page
   - Navigate to /notes
   - Verify notes list is visible (or empty state if no notes)
   - Verify "Add Note" button or FAB is visible

2. Create a new note
   - Tap the "Add Note" button or FAB
   - Verify note editor opens
   - Type "Test Note Title" in the title or content area
   - Type note body content with markdown formatting

3. Set note privacy
   - Find the privacy toggle (shared/private)
   - Tap to set note as "Private"
   - Verify privacy badge updates to show "Private"

4. Add tags to note
   - Find the tag input or tag selector
   - Add a tag (e.g., "important")
   - Verify tag appears on the note

5. Save and verify note
   - Tap "Save" button
   - Verify note appears in the notes list
   - Verify privacy badge and tags are shown on the note card

6. Edit an existing note
   - Tap on the note card to open it
   - Modify the content
   - Save changes
   - Verify changes are reflected in the notes list

7. Bulk select and delete
   - Long press on a note card to enter selection mode
   - Verify checkbox appears on notes
   - Select multiple notes
   - Tap "Delete" bulk action
   - Verify confirmation dialog appears
   - Confirm deletion
   - Verify notes are removed from the list

8. Verify iOS platform conventions
   - Verify note cards have appropriate touch targets
   - Verify long press menu activates with haptic feedback
   - Verify swipe actions work on note cards (if implemented)
   - Verify keyboard avoidance when editing notes

---

### Workflow 7: Growth & Milestones

> Tests the milestones timeline, creating milestones, uploading photos, and viewing the gallery.

**URL:** https://tryqc.co/growth

1. View growth page
   - Navigate to /growth
   - Verify timeline view is visible
   - Verify growth progress bars show category scores
   - Verify mood history chart is visible

2. View milestone timeline
   - Scroll through the timeline
   - Verify milestones are grouped by month
   - Verify milestone cards show title, description, icon, and rarity badge

3. Create a new milestone
   - Tap "Add Milestone" button or FAB
   - Verify milestone creator form opens
   - Type "First Check-In" as title
   - Type a description
   - Select a category and icon

4. Upload a photo
   - Tap the photo upload area
   - [MANUAL] Select a photo from the photo library
   - Note: Photo picker is a system dialog, may need manual interaction
   - Verify photo preview appears

5. Save milestone
   - Tap "Save" button
   - Verify milestone appears in the timeline
   - Verify photo thumbnail is visible on the milestone card

6. View photo gallery
   - Tap on a milestone with a photo
   - Verify photo gallery or lightbox opens
   - Verify photo displays at full size
   - Tap to close the gallery

7. Verify iOS platform conventions
   - Verify scroll momentum feels native on timeline
   - Verify milestone cards have appropriate spacing and sizing
   - Verify photo gallery supports pinch-to-zoom (if implemented)
   - Verify pull-to-refresh works on the growth page

---

### Workflow 8: Love Languages

> Tests adding love languages, toggling privacy, viewing partner's languages, and managing actions.

**URL:** https://tryqc.co/love-languages

1. View love languages page
   - Navigate to /love-languages
   - Verify tabs are visible: "Mine", "Partner's", "Discoveries"
   - Verify "Mine" tab is active by default

2. Add a love language
   - Tap "Add Language" button
   - Verify Add Language dialog opens
   - Select a category (e.g., "Words of Affirmation")
   - Type a title and description
   - Set importance level
   - Tap "Save"
   - Verify language card appears in the list

3. Toggle privacy on a language
   - Find the privacy toggle on a language card
   - Tap to change from "Shared" to "Private"
   - Verify privacy badge updates
   - Verify haptic feedback on toggle

4. View partner's languages
   - Tap "Partner's" tab
   - Verify partner's shared love languages are visible
   - Verify private languages are not shown

5. Navigate to love actions
   - Navigate to /love-languages/actions
   - Verify action tabs: "Pending", "Recurring", "Completed"

6. Create a love action
   - Tap "Add Action" button
   - Verify Add Action dialog opens
   - Link to a love language
   - Type action title and description
   - Set frequency and difficulty
   - Tap "Save"
   - Verify action appears in the pending list

7. Complete a love action
   - Tap the completion checkbox on an action card
   - Verify action moves to "Completed" tab
   - Verify completed count increments

8. Verify iOS platform conventions
   - Verify tab switching is smooth with proper transitions
   - Verify cards have adequate touch targets
   - Verify dialogs slide up from bottom like native iOS sheets
   - Verify toggle switches match iOS style (not checkboxes)

---

### Workflow 9: Reminders

> Tests creating, toggling, snoozing, and deleting reminders.

**URL:** https://tryqc.co/reminders

1. View reminders page
   - Navigate to /reminders
   - Verify reminders list is visible (or empty state)
   - Verify "Add Reminder" button is visible

2. Create a new reminder
   - Tap "Add Reminder" button
   - Verify reminder form opens
   - Type "Weekly Check-In" as title
   - Type a reminder message
   - Select category and frequency (e.g., "Weekly")
   - Set a scheduled time
   - Tap "Save"
   - Verify reminder appears in the list

3. View reminder details
   - Verify reminder card shows title, frequency, and time
   - Verify category is displayed

4. Toggle reminder active state
   - Find the active toggle on a reminder card
   - Tap to deactivate
   - Verify visual state changes (dimmed or inactive styling)
   - Tap again to reactivate

5. Snooze a reminder
   - Find the snooze action on a reminder
   - Tap snooze
   - Verify snoozed state is shown

6. Delete a reminder
   - Tap delete action on a reminder
   - Verify confirmation dialog appears
   - Confirm deletion
   - Verify reminder is removed from the list

---

### Workflow 10: Requests

> Tests creating partner requests, accepting/declining, and converting to reminders.

**URL:** https://tryqc.co/requests

1. View requests page
   - Navigate to /requests
   - Verify requests inbox is visible (or empty state)
   - Verify "New Request" button is visible

2. Create a new request
   - Tap "New Request" button
   - Verify request form opens
   - Type "Date Night This Week" as title
   - Type a description
   - Select a category and priority
   - Optionally suggest a date
   - Tap "Send" or "Submit"
   - Verify request appears in the list

3. View request details
   - Verify request card shows title, category, priority, and status
   - Verify sender info is displayed

4. Accept a request (as partner)
   - [MANUAL] Switch to partner account or use real-time sync test
   - Tap "Accept" button on a received request
   - Verify status changes to "Accepted"

5. Decline a request
   - Tap "Decline" button on a request
   - Verify status changes to "Declined"

6. Convert request to reminder
   - Find "Convert to Reminder" action on a request
   - Tap to convert
   - Verify confirmation or form appears
   - Confirm conversion
   - Verify request is converted
   - Navigate to /reminders and verify new reminder exists

7. Delete a request
   - Tap delete action on a request
   - Confirm deletion
   - Verify request is removed

---

### Workflow 11: Settings

> Tests profile editing, couple settings, session settings proposals, and theme switching.

**URL:** https://tryqc.co/settings

1. View settings page
   - Navigate to /settings
   - Verify settings panels are visible: Profile, Couple, Notifications, Session

2. Update profile
   - Find display name field
   - Triple-click to select all, type "Updated Name"
   - Tap "Save" button
   - Verify success confirmation
   - Verify name updates in the header

3. Update couple settings
   - Find couple settings section
   - Update couple name or relationship start date
   - Tap "Save"
   - Verify changes are saved

4. Propose session settings change
   - Find session settings panel
   - Change session duration or turn-based mode
   - Tap "Propose Changes" button
   - Verify proposal is created
   - Verify partner will see a proposal banner

5. Toggle theme
   - Find theme selector (light/dark/system)
   - Tap to switch from current theme to dark mode
   - Verify entire app updates to dark theme colors
   - Tap to switch to light mode
   - Verify app updates to light theme

6. Manage categories
   - Find category manager in settings
   - Tap "Add Category" button
   - Type category name, select icon
   - Tap "Save"
   - Verify new category appears
   - Toggle a category's active state

7. Export data
   - Find "Export Data" option
   - Tap export button
   - Verify data download initiates (JSON format)

8. Verify iOS platform conventions
   - Verify settings layout follows iOS grouped list style
   - Verify toggle switches match iOS style
   - Verify form inputs have proper keyboard types
   - Verify destructive actions (like "Leave Couple") are clearly marked in red

---

## Edge Case Workflows

### Workflow 12: Empty States

> Tests the app appearance and behavior when no data exists for each feature.

**URL:** https://tryqc.co/dashboard

**Prerequisites:** Fresh account with couple established but no data created.

1. Dashboard empty state
   - Navigate to /dashboard
   - Verify stats show zero values
   - Verify empty activity feed with helpful message
   - Verify quick actions are still functional

2. Notes empty state
   - Navigate to /notes
   - Verify empty state message is shown
   - Verify "Add Note" button or CTA is prominent
   - Verify no broken layouts or missing images

3. Growth empty state
   - Navigate to /growth
   - Verify empty timeline with introductory message
   - Verify growth progress bars show zero
   - Verify "Add Milestone" is accessible

4. Reminders and Requests empty states
   - Navigate to /reminders
   - Verify empty state with "Add Reminder" CTA
   - Navigate to /requests
   - Verify empty state with "New Request" CTA

5. Love Languages empty state
   - Navigate to /love-languages
   - Verify empty state on "Mine" tab with "Add Language" CTA
   - Tap "Partner's" tab
   - Verify appropriate empty state (partner hasn't shared yet)
   - Tap "Discoveries" tab
   - Verify empty state

---

### Workflow 13: Real-time Sync

> Tests that changes made by one partner appear in real-time for the other partner.

**URL:** https://tryqc.co

**Prerequisites:** Two accounts logged in as partners in the same couple. Requires two browser sessions (or simulator + desktop browser).

1. Setup two sessions
   - [MANUAL] Open Safari in simulator with Partner A logged in
   - [MANUAL] Open a desktop browser with Partner B logged in
   - Both navigate to /notes

2. Test note creation sync
   - Partner A: Create a new shared note titled "Sync Test"
   - Partner B: Verify note appears in their notes list without refresh
   - Verify note content and tags match

3. Test note update sync
   - Partner A: Edit the "Sync Test" note content
   - Partner B: Verify updated content appears in real-time

4. Test request sync
   - Both navigate to /requests
   - Partner A: Create a new request
   - Partner B: Verify request appears in their inbox

5. Test check-in status sync
   - Partner A: Start a new check-in on /checkin
   - Partner B: Navigate to /dashboard
   - Verify dashboard shows active check-in indicator

6. Test love language sync
   - Partner A: Navigate to /love-languages
   - Partner A: Add a new shared love language
   - Partner B: Navigate to /love-languages, tap "Partner's" tab
   - Verify new language appears

---

### Workflow 14: Error & Validation

> Tests form validation errors, network error handling, and edge case inputs.

**URL:** https://tryqc.co

1. Test signup validation
   - Navigate to /signup
   - Tap "Sign Up" with empty fields
   - Verify validation errors shown for email and password
   - Type an invalid email (e.g., "notanemail")
   - Verify email format error
   - Type a short password (< 8 chars)
   - Verify password length error

2. Test form validation on notes
   - Navigate to /notes
   - Try to save a note with empty content
   - Verify validation prevents saving
   - Verify error message is shown

3. Test form validation on reminders
   - Navigate to /reminders
   - Tap "Add Reminder"
   - Try to save with missing required fields
   - Verify validation errors appear for each required field
   - Verify error styling (red borders, error text)

4. Test network error handling
   - [MANUAL] Disable network connectivity on the simulator
   - Try to save a note or create a reminder
   - Verify appropriate error message is shown
   - [MANUAL] Re-enable network connectivity
   - Verify app recovers gracefully

5. Verify iOS platform conventions for errors
   - Verify error messages are clearly visible (not just red color)
   - Verify form inputs scroll into view when validation fails
   - Verify keyboard dismisses appropriately after errors
   - Verify haptic feedback on validation errors (error pattern)
