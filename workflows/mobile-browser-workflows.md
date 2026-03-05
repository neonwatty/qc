# Mobile Browser Workflows

> Auto-generated workflow documentation for QC (Quality Couple)
> Last updated: 2026-03-04
> Base URL: https://tryqc.co
> Platform: Web app tested in Chrome with mobile viewport
> Device: iPhone 15 Pro (393x852)

## Quick Reference

| #   | Workflow                              | Category  | Steps |
| --- | ------------------------------------- | --------- | ----- |
| 1   | Landing → Signup → Onboarding         | Core      | 12    |
| 2   | Login → Dashboard                     | Core      | 7     |
| 3   | Bottom Tab Navigation + More Sidebar  | Core      | 8     |
| 4   | Check-In Session (Full Wizard)        | Core      | 14    |
| 5   | Notes — CRUD + Bulk Actions           | Feature   | 12    |
| 6   | Growth — Milestones + Photo Upload    | Feature   | 9     |
| 7   | Love Languages — Profiles + Actions   | Feature   | 11    |
| 8   | Reminders — Create + Manage           | Feature   | 10    |
| 9   | Requests — Create + Respond           | Feature   | 9     |
| 10  | Settings — Profile + Couple           | Feature   | 10    |
| 11  | Settings — Session Rules + Categories | Feature   | 11    |
| 12  | Empty States                          | Edge Case | 6     |
| 13  | Theme Toggle (Light/Dark)             | Edge Case | 5     |
| 14  | Partner Invite Acceptance             | Edge Case | 7     |

---

## Core Workflows

### Workflow 1: Landing → Signup → Onboarding

> Tests the complete new user journey from landing page through account creation and the 7-step onboarding wizard.

**URL:** https://tryqc.co
**Device:** iPhone 15 Pro (393x852)

1. Load landing page
   - Navigate to https://tryqc.co
   - Wait for page to load
   - Verify hero section is visible with app branding
   - Verify feature grid is displayed below the fold
   - Verify "Sign Up" and "Log In" CTAs are visible

2. Navigate to signup
   - Tap the "Sign Up" button
   - Wait for signup page to load
   - Verify email and password fields are visible
   - Verify OAuth buttons (Google, GitHub) are visible

3. Fill signup form
   - Tap the email input field
   - Verify input does NOT trigger iOS auto-zoom (font size should be 16px+)
   - Type a test email address
   - Tap the password input field
   - Type a test password
   - Verify password field masks input

4. Submit signup
   - Tap the "Sign Up" button
   - Wait for redirect to /onboarding
   - Verify onboarding page loads with Step 1

5. Onboarding Step 1 — Display Name
   - Verify progress indicator shows step 1 of 7
   - Tap the display name input
   - Verify input does NOT trigger iOS auto-zoom
   - Type a display name
   - Tap "Next" or "Continue"

6. Onboarding Step 2 — Partner Email
   - Verify step 2 content is visible
   - Tap the partner email input
   - Type partner email address
   - Tap "Next"

7. Onboarding Step 3 — Relationship Start Date
   - Verify date picker or date input is shown
   - Select or type a relationship start date
   - Tap "Next"

8. Onboarding Step 4 — Love Languages
   - Verify love language selection cards are visible
   - Tap to select at least one love language
   - Verify selected state is visually clear
   - Tap "Next"

9. Onboarding Step 5 — Preferences
   - Verify preferences options are shown
   - Select preferences
   - Tap "Next"

10. Onboarding Step 6 — Reminder Setup
    - Verify reminder day/time selectors are visible
    - Select preferred reminder day and time
    - Tap "Next"

11. Onboarding Step 7 — Complete
    - Verify completion/summary screen is shown
    - Tap "Complete" or "Get Started"
    - Wait for redirect to /dashboard

12. Verify iOS platform conventions
    - Verify all input fields are at least 44px height
    - Verify all buttons are at least 44px height
    - Verify form inputs use 16px+ font (no iOS auto-zoom)
    - Verify progress indicator is clearly visible
    - Verify "Next" buttons are easily thumb-reachable
    - Verify content does not overflow horizontally at 393px width

---

### Workflow 2: Login → Dashboard

> Tests the returning user login flow and dashboard landing experience.

**URL:** https://tryqc.co/login
**Device:** iPhone 15 Pro (393x852)

1. Load login page
   - Navigate to https://tryqc.co/login
   - Wait for login page to load
   - Verify email and password fields are visible
   - Verify OAuth buttons are visible
   - Verify "Sign Up" link is accessible

2. Fill login form
   - Tap the email input field
   - Verify input does NOT trigger iOS auto-zoom (16px+ font)
   - Type test email address
   - Tap the password input field
   - Type test password

3. Submit login
   - Tap the "Log In" button
   - Wait for redirect to /dashboard
   - Verify dashboard page loads

4. Verify dashboard layout
   - Verify header is visible with QC branding, theme toggle, and avatar
   - Verify bottom tab bar is visible with 4 tabs + More
   - Verify Dashboard tab is active (highlighted)
   - Verify summary stats section is visible
   - Verify quick action cards are displayed

5. Verify dashboard content
   - Verify recent activity section is visible
   - Verify "Start Check-in" FAB is visible (bottom-right, 56px)
   - Scroll down to verify all dashboard sections load

6. Verify dashboard touch targets
   - Verify quick action cards are tappable (full card area)
   - Verify FAB is at least 56px (h-14 w-14)
   - Verify header theme toggle is at least 44px
   - Verify bottom nav tabs are at least 44px height

7. Verify iOS platform conventions
   - Verify bottom tab bar uses iOS tab bar pattern (not hamburger menu)
   - Verify active tab has clear visual indicator
   - Verify safe area spacing at bottom (below tab bar)
   - Verify content does not extend behind the notch area
   - Verify no horizontal overflow at 393px viewport

---

### Workflow 3: Bottom Tab Navigation + More Sidebar

> Tests the primary mobile navigation patterns: bottom tab bar switching and the "More" sidebar overlay.

**URL:** https://tryqc.co/dashboard
**Device:** iPhone 15 Pro (393x852)

1. Verify bottom tab bar
   - Verify 4 visible tabs: Dashboard, Check-in, Notes, Growth
   - Verify "More" button is visible as 5th item
   - Verify tab bar is fixed at bottom of viewport
   - Verify safe-area padding below tab bar
   - Verify each tab icon + label is visible

2. Navigate via tabs
   - Tap "Check-in" tab
   - Verify /checkin page loads
   - Verify "Check-in" tab is now active (highlighted)
   - Tap "Notes" tab
   - Verify /notes page loads
   - Tap "Growth" tab
   - Verify /growth page loads
   - Tap "Dashboard" tab
   - Verify /dashboard page loads (return to start)

3. Open More sidebar
   - Tap the "More" button in bottom tab bar
   - Wait for sidebar slide-in animation from right
   - Verify sidebar overlay is visible (w-64)
   - Verify backdrop blur/dim behind sidebar

4. Verify More sidebar content
   - Verify all 8 navigation items are listed
   - Verify items include: Dashboard, Check-in, Notes, Growth, Reminders, Requests, Love Languages, Settings
   - Verify "Sign Out" button is at the bottom
   - Verify each item has an icon and label

5. Navigate from sidebar
   - Tap "Reminders" in the sidebar
   - Verify sidebar closes
   - Verify /reminders page loads
   - Open More sidebar again
   - Tap "Requests"
   - Verify /requests page loads

6. Navigate to Love Languages
   - Open More sidebar
   - Tap "Love Languages"
   - Verify /love-languages page loads
   - Verify tabs are visible (Mine, Partner's, Discoveries)

7. Navigate to Settings
   - Open More sidebar
   - Tap "Settings"
   - Verify /settings page loads

8. Verify iOS navigation conventions
   - Verify tab bar icons are at least 44px touch targets
   - Verify active tab has clear visual distinction (color + scale)
   - Verify sidebar slides in smoothly from right
   - Verify tapping backdrop closes sidebar
   - Verify no content jumps during navigation transitions
   - Verify tab bar remains fixed during scroll on all pages

---

### Workflow 4: Check-In Session (Full Wizard)

> Tests the complete check-in session flow through all 6 steps of the wizard.

**URL:** https://tryqc.co/checkin
**Device:** iPhone 15 Pro (393x852)

1. Load check-in page
   - Navigate to https://tryqc.co/checkin
   - Wait for page to load
   - Verify check-in landing content is visible
   - Verify session rules/info card is shown

2. Start check-in session
   - Tap "Start Check-in" button (or FAB from dashboard)
   - Wait for check-in wizard to initialize
   - Verify Step 1 (Category Selection) is shown

3. Step 1 — Category Selection
   - Verify category cards are displayed in grid
   - Verify each card is easily tappable (large touch target)
   - Tap to select one or more categories
   - Verify selected categories have visual indicator
   - Tap "Next" or "Continue"

4. Step 2 — Warm-Up Questions
   - Verify warm-up question content is displayed
   - Verify question text is readable at mobile font size
   - Read/interact with warm-up content
   - Tap "Next"

5. Step 3 — Category Discussion
   - Verify discussion interface loads
   - Verify selected category is shown
   - Verify text input area is available for notes
   - Tap the notes/response input
   - Verify input does NOT trigger iOS auto-zoom
   - Type a discussion response
   - Verify progress indicator shows current step

6. Step 4 — Reflection
   - Verify reflection prompt is displayed
   - Verify mood tracking UI is visible
   - Interact with mood selector (before/after)
   - Tap "Next"

7. Step 5 — Action Items
   - Verify action items interface is shown
   - Tap to add a new action item
   - Type action item title
   - Verify action item appears in list
   - Tap "Next"

8. Step 6 — Completion
   - Verify completion/celebration screen is shown
   - Verify celebration animation plays
   - Verify summary of session is displayed
   - Verify "Done" or "Back to Dashboard" button is visible

9. Complete session
   - Tap "Done" or return button
   - Verify redirect to dashboard or check-in landing
   - Verify session is saved

10. Verify session timer (if enabled)
    - Verify timer is visible during active steps
    - Verify timer counts down appropriately
    - Verify timer persists across step transitions

11. Verify turn-based mode UI (if enabled)
    - Verify turn indicator shows whose turn it is
    - Verify turn duration counter is visible

12. Verify progress through wizard
    - Verify progress bar/indicator updates at each step
    - Verify back navigation works between steps
    - Verify state is preserved when navigating back

13. Verify mobile interaction quality
    - Verify all buttons are at least 44px height
    - Verify text inputs use 16px+ font
    - Verify category cards are easily tappable
    - Verify no horizontal overflow in any step
    - Verify keyboard does not obscure important content

14. Verify iOS platform conventions
    - Verify wizard uses smooth transitions between steps
    - Verify haptic feedback on key interactions (if supported)
    - Verify completion celebration feels polished
    - Verify safe area is respected throughout wizard

---

## Feature Workflows

### Workflow 5: Notes — CRUD + Bulk Actions

> Tests creating, viewing, editing, deleting notes, and bulk operations.

**URL:** https://tryqc.co/notes
**Device:** iPhone 15 Pro (393x852)

1. Load notes page
   - Navigate to https://tryqc.co/notes
   - Wait for notes page to load
   - Verify note list or empty state is displayed
   - Verify "New Note" FAB is visible (bottom-right, blue/indigo gradient)

2. Create a new note
   - Tap the "New Note" FAB (Plus icon)
   - Wait for note editor to open (bottom sheet on mobile)
   - Verify editor has content textarea, privacy selector, and tag input

3. Fill note content
   - Tap the content textarea
   - Verify input does NOT trigger iOS auto-zoom
   - Type note content (e.g., "Test note from mobile browser workflow")
   - Verify word/character counter updates

4. Set privacy level
   - Verify privacy selector shows 3 options: Shared, Private, Draft
   - Tap "Private" option
   - Verify "Private" is selected/highlighted

5. Add tags
   - Tap the tag input field
   - Type a tag name (e.g., "test")
   - Press Enter to add the tag
   - Verify tag pill appears below input
   - Verify tag has a removal X button

6. Save the note
   - Tap "Save" button
   - Wait for editor to close
   - Verify note appears in the note list
   - Verify note shows correct privacy badge
   - Verify note shows correct tags

7. View a note
   - Tap on the created note card
   - Verify note detail view opens
   - Verify content is fully displayed
   - Verify privacy badge and tags are shown

8. Edit the note
   - Tap edit button or the note content
   - Modify the content text
   - Tap "Save"
   - Verify changes are reflected in the list

9. Delete a note
   - Hover/reveal the delete button on the note card
   - Tap the delete button (trash icon)
   - Verify note is removed from the list

10. Bulk delete (if multiple notes exist)
    - Enter select mode (if available)
    - Tap checkboxes on multiple notes
    - Tap "Delete Selected"
    - Verify selected notes are removed

11. Filter notes
    - Verify filter/search options are available
    - Filter by tag or category if available
    - Verify filtered results display correctly

12. Verify iOS platform conventions
    - Verify note editor slides up as bottom sheet
    - Verify delete button touch target is at least 44px
    - Verify FAB is positioned for thumb reach (bottom-right)
    - Verify privacy toggle buttons are large enough to tap
    - Verify tag removal X buttons have adequate touch area
    - Verify no horizontal overflow in note cards at 393px

---

### Workflow 6: Growth — Milestones + Photo Upload

> Tests milestone creation, timeline viewing, and photo upload functionality.

**URL:** https://tryqc.co/growth
**Device:** iPhone 15 Pro (393x852)

1. Load growth page
   - Navigate to https://tryqc.co/growth
   - Wait for growth page to load
   - Verify timeline or empty state is displayed
   - Verify "Add Milestone" FAB is visible (green/teal gradient, camera icon)

2. Open milestone creator
   - Tap the "Add Milestone" FAB
   - Wait for milestone creator sheet to appear
   - Verify form fields are visible (title, category, etc.)

3. Fill milestone details
   - Tap the title input
   - Verify input does NOT trigger iOS auto-zoom
   - Type milestone title
   - Select category if applicable
   - Select rarity if applicable

4. Upload a photo
   - Tap photo upload area or button
   - [MANUAL] Select a photo from device files
   - Wait for photo to upload
   - Verify photo preview is displayed
   - Note: File picker dialog requires manual interaction

5. Select an emoji
   - Verify emoji selector grid is displayed (8x2 grid)
   - Tap an emoji
   - Verify selected emoji is highlighted

6. Save milestone
   - Tap "Save" or "Create" button
   - Wait for milestone to be created
   - Verify milestone appears in timeline

7. View timeline
   - Scroll through timeline
   - Verify milestone cards show title, photo, emoji, date
   - Verify timeline is scrollable vertically

8. View photo gallery
   - Navigate to photo gallery view if available
   - Verify photos display correctly
   - Verify photo thumbnails are tappable

9. Verify iOS platform conventions
   - Verify milestone creator slides up as sheet
   - Verify emoji grid items are tappable (adequate spacing)
   - Verify photo upload area is clearly interactive
   - Verify all form inputs are 44px+ height
   - Verify timeline cards don't overflow horizontally
   - Verify FAB is accessible for thumb reach

---

### Workflow 7: Love Languages — Profiles + Actions

> Tests love language profile management, partner viewing, action tracking, and discoveries.

**URL:** https://tryqc.co/love-languages
**Device:** iPhone 15 Pro (393x852)

1. Load love languages page
   - Navigate to https://tryqc.co/love-languages
   - Wait for page to load
   - Verify tabs are visible: Mine, Partner's, Discoveries
   - Verify "Mine" tab is active by default

2. View "Mine" tab
   - Verify own love languages are listed (or empty state)
   - Verify each language card shows title, category, importance

3. Add a love language
   - Tap "Add" button
   - Wait for Add Language dialog to open
   - Verify form fields: title, category selector, importance, examples, tags

4. Fill language details
   - Tap the title input
   - Verify no iOS auto-zoom
   - Type a title (e.g., "Words of Affirmation")
   - Select a category from the dropdown
   - Verify dropdown opens properly at mobile viewport
   - Set importance level
   - Tap "Save"

5. Set privacy
   - Verify privacy toggle is available (shared/private)
   - Toggle privacy to "Shared"
   - Verify privacy badge updates

6. View "Partner's" tab
   - Tap "Partner's" tab
   - Verify tab switches
   - Verify partner's shared languages are displayed (or empty state)

7. View "Discoveries" tab
   - Tap "Discoveries" tab
   - Verify discoveries list is shown (or empty state)
   - Verify discovery cards show content and check-in reference

8. Navigate to Actions
   - Navigate to /love-languages/actions (via link or navigation)
   - Verify love actions list is displayed
   - Verify each action shows title, status, frequency

9. Add a love action
   - Tap "Add Action" button
   - Fill in action details (title, linked language, frequency, difficulty)
   - Tap "Save"
   - Verify action appears in list

10. Complete an action
    - Tap the completion checkbox or button on an action
    - Verify completed count updates
    - Verify visual feedback for completion

11. Verify iOS platform conventions
    - Verify tab bar for Mine/Partner's/Discoveries is at least 44px height
    - Verify language cards are tappable with adequate size
    - Verify dialog slides up from bottom on mobile
    - Verify dropdown/select fields use 16px+ font
    - Verify action checkbox touch targets are at least 44px
    - Verify toggle switches are used (not checkboxes)

---

### Workflow 8: Reminders — Create + Manage

> Tests reminder creation, scheduling, snoozing, and lifecycle management.

**URL:** https://tryqc.co/reminders
**Device:** iPhone 15 Pro (393x852)

1. Load reminders page
   - Navigate to https://tryqc.co/reminders
   - Wait for page to load
   - Verify reminder list or empty state is displayed

2. Create a reminder
   - Tap "Add Reminder" button or FAB
   - Verify reminder creation interface opens
   - Verify chat-style input or form is visible

3. Fill reminder details
   - Tap the title input
   - Verify no iOS auto-zoom
   - Type reminder title (e.g., "Weekly date night")
   - Set frequency (once/daily/weekly/monthly)
   - Set scheduled date/time
   - Select notification channel if applicable

4. Save reminder
   - Tap "Save" or "Create"
   - Verify reminder appears in list
   - Verify reminder shows title, frequency, next scheduled time

5. Toggle reminder active/inactive
   - Tap the toggle/switch on a reminder card
   - Verify reminder state changes visually
   - Verify toggle switch is iOS-style (not checkbox)

6. Snooze a reminder
   - Tap snooze button on a reminder
   - Verify snooze options appear (15 min, 1 hour, tomorrow)
   - Select a snooze option
   - Verify reminder shows snoozed state

7. Unsnooze a reminder
   - Find snoozed reminder
   - Tap unsnooze button
   - Verify reminder returns to active state

8. Delete a reminder
   - Tap delete button on a reminder card
   - Verify reminder is removed from list

9. Verify reminder card actions
   - Verify toggle switch is at least 44px touch area
   - Verify action buttons (snooze, delete) are at least 40px height
   - Verify cards display correctly at 393px width

10. Verify iOS platform conventions
    - Verify toggle switches are used (not checkboxes)
    - Verify action buttons have adequate spacing
    - Verify frequency selector uses appropriate iOS pattern
    - Verify date/time inputs use 16px+ font
    - Verify no horizontal overflow on reminder cards

---

### Workflow 9: Requests — Create + Respond

> Tests creating partner requests, responding to received requests, and converting to reminders.

**URL:** https://tryqc.co/requests
**Device:** iPhone 15 Pro (393x852)

1. Load requests page
   - Navigate to https://tryqc.co/requests
   - Wait for page to load
   - Verify request inbox or empty state is displayed

2. Create a request
   - Tap "Create Request" or "New Request" button
   - Verify request creation form opens

3. Fill request details
   - Tap the title input
   - Verify no iOS auto-zoom
   - Type request title
   - Select category (activity/task/reminder/conversation/date-night)
   - Set priority level
   - Add description if applicable
   - Set suggested date if applicable

4. Submit request
   - Tap "Send" or "Create" button
   - Verify request is sent
   - Verify request appears in sent/outbox view

5. View received request
   - Switch to received/inbox view if applicable
   - Verify incoming request cards show title, category, priority, sender

6. Accept a request
   - Tap "Accept" button on a request card
   - Verify request status updates to accepted
   - Verify visual feedback for acceptance

7. Decline a request
   - Tap "Decline" button on another request (or create a new test request)
   - Verify request status updates to declined

8. Delete a request
   - Tap delete button on a request
   - Verify request is removed

9. Verify iOS platform conventions
   - Verify Accept/Decline buttons are at least 44px height
   - Verify buttons have adequate spacing between them
   - Verify request cards display fully at 393px width
   - Verify category selector uses appropriate iOS pattern
   - Verify priority selector is touch-friendly
   - Verify form inputs use 16px+ font

---

### Workflow 10: Settings — Profile + Couple

> Tests profile settings, couple settings, and data export functionality.

**URL:** https://tryqc.co/settings
**Device:** iPhone 15 Pro (393x852)

1. Load settings page
   - Navigate to https://tryqc.co/settings
   - Wait for page to load
   - Verify settings sections are visible (Profile, Couple, Session Rules, Categories)

2. Edit profile display name
   - Find the profile section
   - Tap the display name input
   - Verify no iOS auto-zoom
   - Clear and type a new display name
   - Tap "Save" button
   - Verify success toast/message appears

3. View couple settings
   - Scroll to couple settings section
   - Verify couple name, relationship start date are displayed
   - Verify partner info is shown

4. Update couple settings
   - Tap editable couple fields
   - Modify a couple setting
   - Tap "Save"
   - Verify changes are saved

5. View pending invite
   - If partner hasn't joined, verify invite section is visible
   - Verify "Resend Invite" button is accessible

6. Export user data
   - Scroll to data export section
   - Tap "Export Data" button
   - Wait for export to process
   - Verify JSON data download or display

7. Scroll through all settings
   - Scroll through entire settings page
   - Verify all sections load and are visible
   - Verify no content is cut off at 393px width

8. Verify leave couple option
   - Verify "Leave Couple" button is visible (destructive styling)
   - Do NOT tap it (destructive action)
   - Verify it has appropriate warning styling

9. Verify form inputs
   - Verify all input fields are at least 44px height
   - Verify all inputs use 16px+ font
   - Verify all save buttons are at least 44px height

10. Verify iOS platform conventions
    - Verify settings uses clear section headers
    - Verify toggle switches (not checkboxes) for boolean settings
    - Verify destructive actions have red/warning styling
    - Verify adequate spacing between sections
    - Verify no horizontal overflow

---

### Workflow 11: Settings — Session Rules + Categories

> Tests session rules configuration with toggle switches and category management.

**URL:** https://tryqc.co/settings
**Device:** iPhone 15 Pro (393x852)

1. Navigate to session rules
   - Navigate to https://tryqc.co/settings
   - Scroll to "Session Rules" card
   - Verify section header and description are visible

2. Verify timing fields layout
   - Verify timing section shows: Session Duration, Timeouts Per Partner, Timeout Duration, Cool Down Time
   - Verify fields stack vertically on mobile (grid-cols-1)
   - Verify fields do NOT overflow horizontally
   - Verify each input is at least 44px height with 16px+ font

3. Edit timing fields
   - Tap "Session Duration" input
   - Verify no iOS auto-zoom
   - Change value to 20
   - Tap "Timeouts Per Partner" input
   - Change value to 2

4. Verify discussion toggles
   - Verify "Turn-Based Mode" uses iOS-style Switch (not checkbox)
   - Tap the Turn-Based Mode switch
   - Verify switch toggles with animation
   - Verify Turn Duration field appears when enabled

5. Verify feature toggles
   - Verify "Allow Extensions" uses Switch component
   - Verify "Warm-Up Questions" uses Switch component
   - Tap each switch to verify toggle behavior
   - Verify switches are at least 44px wide (w-11 = 44px)

6. Verify behavior toggles
   - Verify "Pause Notifications" uses Switch component
   - Verify "Auto-Save Drafts" uses Switch component
   - Verify toggle labels and descriptions are readable

7. Save session rules
   - Tap "Save Session Rules" button
   - Verify button is at least 44px height
   - Wait for save confirmation
   - Verify success toast appears

8. Navigate to categories
   - Scroll to Categories section
   - Verify category list is displayed
   - Verify each category shows name, icon, active status

9. Create a category
   - Tap "Create Category" button
   - Verify category form dialog opens
   - Fill in name, description, icon
   - Tap "Create"
   - Verify new category appears in list

10. Toggle category active/inactive
    - Tap the toggle on a category
    - Verify category state changes

11. Verify iOS platform conventions
    - Verify ALL toggles use iOS Switch (not web checkboxes)
    - Verify Switch components are sized appropriately (h-6 w-11)
    - Verify timing grid stacks on mobile (no 2-col overflow)
    - Verify form labels are clearly associated with inputs
    - Verify adequate spacing between toggle rows
    - Verify dialog slides up from bottom on mobile

---

## Edge Case Workflows

### Workflow 12: Empty States

> Tests how the app handles empty data states across all main pages.

**URL:** https://tryqc.co/dashboard
**Device:** iPhone 15 Pro (393x852)

1. Verify dashboard empty states
   - Navigate to /dashboard with a fresh couple (no check-ins)
   - Verify summary stats show zeros or appropriate defaults
   - Verify empty activity feed shows helpful message
   - Verify "Start Check-in" CTA is prominent

2. Verify notes empty state
   - Navigate to /notes with no notes
   - Verify empty state message is displayed
   - Verify "Create your first note" CTA or similar prompt
   - Verify FAB is still visible

3. Verify growth empty state
   - Navigate to /growth with no milestones
   - Verify empty timeline message is shown
   - Verify "Add your first milestone" prompt
   - Verify FAB is still visible

4. Verify love languages empty state
   - Navigate to /love-languages with no languages
   - Verify empty state on "Mine" tab
   - Switch to "Partner's" tab
   - Verify appropriate empty message
   - Switch to "Discoveries" tab
   - Verify empty state

5. Verify reminders empty state
   - Navigate to /reminders with no reminders
   - Verify empty state message

6. Verify iOS conventions for empty states
   - Verify empty state messages are centered and readable
   - Verify CTAs in empty states are at least 44px height
   - Verify empty states don't show broken layouts
   - Verify no horizontal overflow in empty state views

---

### Workflow 13: Theme Toggle (Light/Dark)

> Tests the light/dark theme toggle and visual consistency across both modes.

**URL:** https://tryqc.co/dashboard
**Device:** iPhone 15 Pro (393x852)

1. Verify current theme
   - Navigate to /dashboard
   - Note current theme (light or dark)
   - Verify header shows appropriate theme icon (Sun for dark, Moon for light)

2. Toggle theme
   - Tap the theme toggle button in the header
   - Verify theme toggle button is at least 44px touch target
   - Verify theme switches immediately
   - Verify Sun icon changes to Moon (or vice versa)

3. Verify dark mode styling
   - If now in dark mode:
   - Verify background is dark (gray-900)
   - Verify text is light colored
   - Verify cards have dark backgrounds
   - Verify bottom nav has dark styling
   - Verify no white flash or unstyled content

4. Verify light mode styling
   - Toggle back to light mode
   - Verify background is white/light
   - Verify text is dark colored
   - Verify cards have light backgrounds
   - Verify bottom nav has light styling

5. Verify theme persistence
   - Refresh the page
   - Verify theme preference is maintained
   - Navigate to another page
   - Verify theme is consistent across pages

---

### Workflow 14: Partner Invite Acceptance

> Tests the partner invite flow from email link to joining a couple.

**URL:** https://tryqc.co/invite/[token]
**Device:** iPhone 15 Pro (393x852)

1. Load invite page (unauthenticated)
   - Navigate to https://tryqc.co/invite/test-token (simulated)
   - Verify invite page loads
   - Verify partner's name or couple info is displayed
   - Verify "Accept Invite" or "Join" CTA is visible
   - If unauthenticated, verify redirect to signup/login

2. Sign up via invite
   - If redirected to signup, complete signup flow
   - Verify redirect back to invite page after signup

3. Accept invite (authenticated)
   - Verify invite details are shown
   - Tap "Accept" or "Join Couple" button
   - Wait for processing

4. Verify couple join
   - Verify redirect to /dashboard after acceptance
   - Verify couple data is loaded
   - Verify partner info is visible in header

5. Verify expired invite handling
   - Navigate to an expired invite URL
   - Verify appropriate error message is shown
   - Verify redirect or CTA to request new invite

6. Verify already-used invite handling
   - Navigate to an already-accepted invite URL
   - Verify appropriate message (already joined, or invalid)

7. Verify iOS platform conventions
   - Verify invite acceptance button is at least 44px height
   - Verify invite info is readable at mobile viewport
   - Verify error states are clearly communicated
   - Verify no horizontal overflow on invite page

---

## iOS HIG Compliance Checklist

> Run these checks on every page during workflow execution.

### Touch Targets

- [ ] All buttons are at least 44px height (h-11)
- [ ] All input fields are at least 44px height (h-11)
- [ ] Bottom tab bar items are at least 44px touch area
- [ ] FABs are at least 56px (h-14 w-14)
- [ ] Delete/action buttons have adequate touch area
- [ ] Toggle switches are appropriately sized (h-6 w-11)

### Typography & Inputs

- [ ] All form inputs use 16px+ font (text-base) to prevent iOS auto-zoom
- [ ] Select/dropdown triggers use 16px+ font
- [ ] Text is readable without zooming

### Layout

- [ ] No horizontal overflow at 393px viewport width
- [ ] Content respects safe area (top notch, bottom home indicator)
- [ ] Bottom nav has safe-area-bottom padding
- [ ] Forms stack vertically on mobile (no cramped 2-column grids)

### Navigation

- [ ] Primary navigation uses bottom tab bar (not hamburger)
- [ ] Active tab has clear visual indicator
- [ ] Tab bar remains fixed during scroll
- [ ] More menu slides in from right

### Components

- [ ] Toggle switches used instead of checkboxes (iOS convention)
- [ ] Dialogs/sheets slide up from bottom on mobile
- [ ] FABs positioned for thumb reach (bottom-right)
- [ ] Action sheets follow iOS patterns

### Visual

- [ ] Dark mode is fully styled (no white flashes)
- [ ] Smooth transitions between pages/states
- [ ] Loading states are visible
- [ ] Empty states are well-designed
