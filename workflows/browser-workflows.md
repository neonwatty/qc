# Browser Workflows

> Workflow documentation for QC (Quality Couple) relationship wellness app
> Last updated: 2026-02-16
> App URL: https://tryqc.co
> Test account: neonwatty@gmail.com

## Quick Reference

| #   | Workflow                  | Purpose                                     | Steps |
| --- | ------------------------- | ------------------------------------------- | ----- |
| 1   | Signup & Onboarding       | Create account, onboard, land on dashboard  | 6     |
| 2   | Login & Navigation        | Log in, navigate all pages, verify layout   | 5     |
| 3   | Partner Invite Acceptance | Accept invite token, join couple            | 4     |
| 4   | Dark Mode Toggle          | Switch themes, verify UI updates            | 3     |
| 5   | Notes CRUD                | Create, filter, edit, delete notes          | 7     |
| 6   | Check-in Session          | Full wizard from prep to completion         | 10    |
| 7   | Growth & Milestones       | Create milestones, view timeline, photos    | 6     |
| 8   | Love Languages            | Add, edit, toggle privacy, delete languages | 6     |
| 9   | Love Actions              | Add, complete, filter, delete actions       | 6     |
| 10  | Reminders                 | Create, toggle, filter, delete reminders    | 5     |
| 11  | Requests                  | Send, respond, delete partner requests      | 5     |
| 12  | Settings                  | Update profile, relationship, session rules | 6     |
| 13  | Empty States              | Verify empty state messaging on all pages   | 4     |
| 14  | Note Editor UX            | Dialog close, errors, char/tag limits       | 5     |
| 15  | Navigation Mobile         | Bottom tab bar, More drawer, responsive     | 4     |

---

## Core Workflows

### Workflow 1: Signup & Onboarding

> Tests the complete new user journey from account creation through couple setup to landing on the dashboard.

**Prerequisites:** A fresh email address not already registered. Email confirmation is disabled in Supabase auth settings.

1. Navigate to signup page
   - Navigate to https://tryqc.co/signup
   - Verify the "Create your account" heading is visible
   - Verify the form has Display name, Email, and Password fields
   - Verify a "Sign in" link to /login is present

2. Fill out and submit the signup form
   - Type a display name in the "Display name" field
   - Type a valid email address in the "Email" field
   - Type a password (at least 8 characters) in the "Password" field
   - Click the "Create account" button
   - Verify the "Check your email" confirmation screen appears with the entered email

3. Log in with the new account
   - Navigate to https://tryqc.co/login
   - Type the email used in step 2 in the "Email" field
   - Type the password used in step 2 in the "Password" field
   - Click the "Sign in" button
   - Verify redirect to /onboarding (since user has no couple yet)

4. Complete onboarding step 1 - Display name
   - Verify the onboarding page loads with step indicator
   - Verify the display name field is pre-filled or empty
   - Type or confirm a display name
   - Click "Continue" or the next step button

5. Complete onboarding step 2 - Partner email
   - Verify the partner email step is shown
   - Type a partner email address (can be any valid email format)
   - Click "Continue"

6. Complete onboarding step 3 - Relationship date and finish
   - Verify the relationship start date step is shown (optional)
   - Optionally select a date
   - Click "Get Started" or the final submit button
   - Verify redirect to /dashboard
   - Verify the dashboard loads with the QC sidebar navigation
   - Verify the user's display name appears in the header

---

### Workflow 2: Login & Navigation

> Tests logging in with an existing account and navigating through all sidebar pages to verify layout and accessibility.

**Prerequisites:** An existing account with a couple (e.g., neonwatty@gmail.com).

1. Log in to existing account
   - Navigate to https://tryqc.co/login
   - Type email in the "Email" field
   - Type password in the "Password" field
   - Click "Sign in"
   - Verify redirect to /dashboard
   - Verify the sidebar navigation is visible with all 8 items

2. Navigate through all main pages
   - Click "Dashboard" in the sidebar
   - Verify the Dashboard page loads with heading and quick actions grid
   - Click "Check-in" in the sidebar
   - Verify the Check-in page loads with category cards
   - Click "Notes" in the sidebar
   - Verify the Notes page loads with search bar and filter pills (All/Shared/Private/Drafts)
   - Click "Growth" in the sidebar
   - Verify the Growth page loads with view toggle (Timeline/Progress/Memories)

3. Navigate remaining pages
   - Click "Reminders" in the sidebar
   - Verify the Reminders page loads with "New Reminder" button
   - Click "Love Languages" in the sidebar
   - Verify the Love Languages page loads with "My Languages" / "Partner's" tabs
   - Click "Requests" in the sidebar
   - Verify the Requests page loads with "Received" / "Sent" tabs
   - Click "Settings" in the sidebar
   - Verify the Settings page loads with Profile / Relationship / Session Rules tabs

4. Verify header elements
   - Verify the QC heart logo and "Quality Control" text are visible in the header
   - Verify the theme toggle (sun/moon icon) is visible
   - Verify the user avatar and display name are in the header

5. Verify web platform conventions
   - Verify all interactive elements have hover states (buttons, nav items, cards)
   - Verify browser back button works correctly between pages
   - Verify the URL updates when navigating to each page
   - Verify each page URL is deep-linkable (reload the page and verify it loads correctly)

---

### Workflow 3: Partner Invite Acceptance

> Tests the invite link flow for a partner joining an existing couple.

**Prerequisites:** A valid invite token from a completed onboarding. Check couple_invites table for a pending token.

1. Navigate to the invite link
   - Navigate to https://tryqc.co/invite/{token}
   - If not logged in: verify redirect to signup page with redirect param back to invite
   - If logged in: verify the invite acceptance page loads

2. Verify invite details
   - Verify the inviter's name is displayed
   - Verify an "Accept Invite" or "Join" button is visible

3. Accept the invite
   - Click the accept/join button
   - Verify redirect to /dashboard after acceptance
   - Verify the couple data loads (partner info visible in sidebar or header)

4. Verify couple connection
   - Navigate to /settings
   - Click the "Relationship" tab
   - Verify the partner's name appears
   - Verify the couple name and relationship start date are shown

---

### Workflow 4: Dark Mode Toggle

> Tests switching between light and dark themes.

1. Verify initial theme state
   - Navigate to https://tryqc.co/dashboard
   - Note the current theme (light or dark based on system preference)
   - Verify the theme toggle icon is visible in the header (sun or moon icon)

2. Toggle to opposite theme
   - Click the theme toggle button in the header
   - Verify the background color changes (light: white/gray, dark: dark gray/black)
   - Verify text colors invert appropriately
   - Verify sidebar colors update
   - Verify card/widget backgrounds update

3. Toggle back and verify persistence
   - Click the theme toggle again
   - Verify the theme returns to the original state
   - Reload the page
   - Verify the theme persists after reload

---

## Feature Workflows

### Workflow 5: Notes CRUD

> Tests the full lifecycle of notes: create, read, filter, edit, and delete with tags and privacy settings.

**Prerequisites:** Logged in with an active couple.

1. Navigate to Notes page
   - Click "Notes" in the sidebar
   - Verify the Notes page loads
   - Verify the filter pills are visible: All, Shared, Private, Drafts
   - Verify the "+ New Note" button is visible (gradient pink/coral)

2. Create a shared note
   - Click the "+ New Note" button
   - Verify the New Note dialog/modal opens
   - Verify the privacy selector shows: Shared, Private, Draft
   - Click "Shared" in the privacy selector
   - Click in the textarea and type "This is a test shared note"
   - Click in the "Add tags" input and type "test" then press Enter
   - Verify the tag "#test" appears as a badge
   - Verify the word count shows "7 words" and character count updates
   - Click the "Save" button
   - Verify the dialog closes automatically
   - Verify the note appears in the note list as a card with "Shared" badge

3. Create a private note
   - Click "+ New Note"
   - Click "Private" in the privacy selector
   - Type "This is a private note" in the textarea
   - Click "Save"
   - Verify the dialog closes
   - Verify the note appears with a "Private" badge

4. Create a draft note
   - Click "+ New Note"
   - Verify "Draft" is the default privacy selection
   - Type "This is a draft" in the textarea
   - Click "Save"
   - Verify the note appears with "Draft" badge

5. Filter notes by privacy
   - Click "Shared" filter pill
   - Verify only the shared note is visible
   - Click "Private" filter pill
   - Verify only the private note is visible
   - Click "Drafts" filter pill
   - Verify only the draft note is visible
   - Click "All" filter pill
   - Verify all three notes are visible

6. Edit a note
   - Click on the shared note card to open it
   - Verify the Edit Note dialog opens with existing content pre-filled
   - Clear the text and type "Updated shared note content"
   - Click "Update"
   - Verify the dialog closes
   - Verify the note card shows the updated content

7. Delete a note
   - Hover over the draft note card
   - Verify a delete (trash) icon appears
   - Click the delete icon
   - Verify the note is removed from the list
   - Verify the note count decreases

---

### Workflow 6: Check-in Session

> Tests the full check-in wizard from topic preparation through completion celebration.

**Prerequisites:** Logged in with an active couple. Providers must be enabled (CheckInContext, BookendsContext, SessionSettingsContext).

1. Navigate to Check-in page
   - Click "Check-in" in the sidebar
   - Verify the check-in landing page loads
   - Verify category cards are visible (Emotional Connection, Communication, Physical & Emotional Intimacy, Shared Goals & Future)
   - Verify "Prepare Topics" and "Start Now" buttons are present

2. Prepare topics (optional bookend)
   - Click "Prepare Topics" button
   - Verify the Preparation Modal dialog opens
   - Verify quick topic suggestions are shown as clickable chips
   - Click on 2-3 suggested topics
   - Verify selected topics appear in "My Topics" list
   - Type a custom topic in the text input and press Enter or click Add
   - Verify the custom topic appears in the list
   - Click "Start Check-In with Topics" or close the modal

3. Start the check-in session
   - Click "Start Now" (or "Start Check-In with Topics" from preparation)
   - Verify the wizard loads at the category selection step
   - Verify the ProgressBar shows the current step highlighted

4. Select categories
   - Click on "Emotional Connection" category card
   - Verify it shows a selected state (visual highlight)
   - Click on "Communication" category card
   - Verify both are selected
   - Click "Continue" via NavigationControls
   - Verify transition to the Discussion step

5. Category discussion
   - Verify the discussion step loads for the first selected category
   - Verify the category name is displayed
   - Verify NavigationControls show "Back" and "Continue to Reflection"
   - Click "Continue to Reflection"

6. Reflection step
   - Verify the reflection step loads
   - Verify a "Write a Reflection" button is visible
   - Click "Write a Reflection"
   - Verify the ReflectionForm modal opens
   - Select a "before" mood emoji (e.g., the happy face)
   - Select an "after" mood emoji
   - Type something in the gratitude textarea
   - Type something in the key takeaway textarea
   - Toggle the "Share with partner" switch
   - Click "Save Reflection"
   - Verify the saved confirmation view appears
   - Click "Return to Dashboard" or close the modal

7. Action items step
   - If still in the wizard, navigate to the Action Items step
   - Verify the action items step loads
   - Click "Add Action Item"
   - Type an action item title
   - Verify it appears in the list
   - Toggle the action item checkbox to mark it complete
   - Click "Continue"

8. Completion celebration
   - Verify the CompletionCelebration screen loads
   - Verify a trophy/celebration animation plays
   - Verify session stats are displayed (duration, categories discussed)
   - Verify "Go Home" and "Start Another" buttons are visible

9. Return to dashboard
   - Click "Go Home"
   - Verify redirect to /dashboard

10. Verify check-in was recorded
    - Navigate to /dashboard
    - Verify the check-in count stat has increased

---

### Workflow 7: Growth & Milestones

> Tests creating milestones, viewing different views, and managing the growth timeline.

**Prerequisites:** Logged in with an active couple.

1. Navigate to Growth page
   - Click "Growth" in the sidebar
   - Verify the Growth page loads
   - Verify view toggles are visible: Timeline, Progress, Memories
   - Verify the "New Milestone" button is visible
   - Verify stats tiles show (milestones reached, in progress, total points, photos)

2. Create a milestone
   - Click "New Milestone"
   - Verify the MilestoneCreator modal opens with animation
   - Type "First Check-in Together" in the title field
   - Type a description in the description field
   - Select a category from the category grid
   - Select a rarity level
   - Adjust the points slider
   - Click "Create Milestone"
   - Verify success celebration overlay appears
   - Verify the milestone appears in the timeline view

3. View Timeline
   - Verify the Timeline view is the default or click "Timeline" toggle
   - Verify milestones are displayed chronologically
   - Verify each milestone card shows title, description, category, and date

4. View Progress
   - Click "Progress" toggle
   - Verify upcoming milestones section is shown
   - Verify achieved milestones section is shown (if any)

5. View Memories (Photo Gallery)
   - Click "Memories" toggle
   - Verify the photo gallery view loads
   - Verify filter buttons (All, Photos) are present
   - If photos exist: click on a photo card
   - Verify the lightbox dialog opens with full image, description, date, and badges
   - Close the lightbox

6. Upload a photo to a milestone
   - [MANUAL] Click "Add Memory" or edit an existing milestone
   - [MANUAL] Select a photo file from the file picker dialog
   - Note: File upload dialogs cannot be automated by Claude-in-Chrome
   - Verify the photo appears in the milestone card after upload

---

### Workflow 8: Love Languages

> Tests adding, editing, toggling privacy, and deleting love languages.

**Prerequisites:** Logged in with an active couple.

1. Navigate to Love Languages page
   - Click "Love Languages" in the sidebar
   - Verify the page loads with "My Languages" and "Partner's" tabs
   - Verify "Add Language" button is visible

2. Add a love language
   - Click "Add Language"
   - Verify the AddLanguageDialog opens
   - Type "Words of Affirmation" in the title field
   - Type "I feel loved when my partner tells me how they feel" in the description
   - Select "Words of Affirmation" from the category dropdown
   - Select "High" importance
   - Select "Shared" privacy
   - Type an example in the examples input and click Add
   - Type a tag and click Add
   - Click "Add Love Language"
   - Verify the dialog closes
   - Verify the language card appears under "My Languages"

3. Edit a love language
   - Click the Edit button on the newly created language card
   - Verify the dialog opens with existing data pre-filled
   - Change the importance to "Essential"
   - Click "Save Changes"
   - Verify the card updates to show the new importance level

4. Toggle privacy
   - Click the Lock/Unlock toggle on the language card
   - Verify the privacy changes from "Shared" to "Private" (or vice versa)
   - Click "Partner's" tab
   - Verify the language no longer appears (if toggled to private)
   - Click "My Languages" tab and toggle back to shared

5. View partner's languages
   - Click "Partner's" tab
   - Verify partner's shared languages are displayed (if any)
   - If partner has a language: verify "Suggest Action" button is present on each card

6. Delete a love language
   - Click the Delete button on a language card
   - Verify a confirmation dialog appears
   - Confirm deletion
   - Verify the card is removed from the list

---

### Workflow 9: Love Actions

> Tests adding, completing, filtering, and deleting love actions.

**Prerequisites:** Logged in with an active couple. At least one love language exists.

1. Navigate to Love Actions page
   - Navigate to https://tryqc.co/love-languages/actions
   - Verify the page loads with tab filters: Pending, Recurring, Completed
   - Verify "Add Action" button is visible

2. Add a love action
   - Click "Add Action"
   - Verify the AddActionDialog opens
   - Type "Write a love letter" in the title field
   - Type a description
   - Select a linked love language from the dropdown
   - Select "Planned" status
   - Select "Once" frequency
   - Select "Easy" difficulty
   - Click "Add Action"
   - Verify the dialog closes
   - Verify the action card appears in the Pending tab

3. Edit an action
   - Click the Edit button on the action card
   - Change difficulty to "Moderate"
   - Click "Save Changes"
   - Verify the card updates

4. Complete an action
   - Click "Mark Complete" on a pending action card
   - Verify the action moves from Pending to Completed tab
   - Click the "Completed" tab
   - Verify the action appears there with completion info

5. Filter by status tabs
   - Click "Pending" tab - verify only pending actions show
   - Click "Recurring" tab - verify only recurring actions show (or empty state)
   - Click "Completed" tab - verify only completed actions show

6. Delete an action
   - Click the Delete button on an action card
   - Confirm deletion
   - Verify the card is removed

---

### Workflow 10: Reminders

> Tests creating, toggling, filtering, and deleting reminders.

**Prerequisites:** Logged in with an active couple.

1. Navigate to Reminders page
   - Click "Reminders" in the sidebar
   - Verify the page loads
   - Verify filter pills: All, Active, Inactive
   - Verify "New Reminder" button is visible

2. Create a reminder
   - Click "New Reminder"
   - Verify the ReminderForm appears inline
   - Type "Weekly check-in reminder" in the title field
   - Type "Time to check in with your partner!" in the message field
   - Select "Check-in" from the category dropdown
   - Select "Weekly" from the frequency dropdown
   - Set a date/time in the schedule field
   - Select "In-app" from the notification channel dropdown
   - Click "Create Reminder"
   - Verify the form closes
   - Verify the reminder card appears in the list

3. Toggle reminder active/inactive
   - Click "Pause" on the reminder card
   - Verify the reminder shows as inactive/paused
   - Click "Inactive" filter pill
   - Verify the paused reminder appears
   - Click "Active" filter
   - Verify the paused reminder does NOT appear
   - Click "All" filter
   - Click "Resume" on the paused reminder
   - Verify it shows as active again

4. Filter reminders
   - Click "Active" pill - verify only active reminders show
   - Click "Inactive" pill - verify only inactive reminders show
   - Click "All" pill - verify all reminders show

5. Delete a reminder
   - Click "Delete" on a reminder card
   - Verify the reminder is removed from the list

---

### Workflow 11: Requests

> Tests sending, responding to, and deleting partner requests.

**Prerequisites:** Logged in with an active couple that has both partners.

1. Navigate to Requests page
   - Click "Requests" in the sidebar
   - Verify the page loads with "Received" and "Sent" tabs
   - Verify "New Request" button is visible

2. Create a new request
   - Click "New Request"
   - Verify the RequestForm appears inline
   - Type "Date Night This Weekend" in the title field
   - Type "Let's try that new restaurant downtown" in the description field
   - Select "Date Night" from the category dropdown
   - Select "Medium" priority
   - Optionally set a suggested date
   - Click "Send Request"
   - Verify the form closes
   - Click "Sent" tab
   - Verify the new request appears with "Pending" status

3. View received requests
   - Click "Received" tab
   - Verify any received requests from partner are shown
   - If a pending request exists: verify "Accept" and "Decline" buttons are visible

4. Respond to a request
   - Click "Accept" on a received pending request
   - Verify the request status changes to "Accepted"
   - Verify the Accept/Decline buttons are no longer visible for that request

5. Delete a sent request
   - Click "Sent" tab
   - Click "Delete" on a sent request
   - Verify the request is removed from the list

---

### Workflow 12: Settings

> Tests all three settings tabs: Profile, Relationship, and Session Rules.

**Prerequisites:** Logged in with an active couple.

1. Navigate to Settings page
   - Click "Settings" in the sidebar
   - Verify the Settings page loads
   - Verify three tabs are visible: Profile, Relationship, Session Rules

2. Update profile settings
   - Click "Profile" tab (should be default)
   - Verify email field is shown (read-only/disabled)
   - Verify display name field is editable
   - Clear the display name and type a new name
   - Optionally update the avatar URL field
   - Click "Save Profile"
   - Verify success feedback (no error message)
   - Verify the header updates with the new display name

3. View relationship settings
   - Click "Relationship" tab
   - Verify couple name is displayed
   - Verify relationship start date is displayed (if set)
   - Verify partner info is shown (name, or "Pending invite" if partner hasn't joined)
   - If invite is pending: verify "Resend Invite" button is visible

4. Resend invite (if applicable)
   - If "Resend Invite" button is visible, click it
   - Verify success feedback or the invite status updates

5. Configure session rules
   - Click "Session Rules" tab
   - Verify the session settings form loads
   - Verify session duration input (5-60 min range)
   - Change the session duration value
   - Verify timeouts per partner input (0-5 range)
   - Verify timeout duration input (1-10 min range)
   - Verify cool down time input (0-15 min range)
   - Toggle the "Turn-based mode" checkbox
   - If turn-based is enabled: verify turn duration input appears (30-600s)
   - Toggle "Allow extensions" and "Warm-up questions" checkboxes
   - Click "Save Session Rules"
   - Verify success feedback

6. Verify settings persistence
   - Reload the page
   - Navigate back to Settings > Session Rules
   - Verify the saved values persisted (duration, toggles, etc.)

---

## Edge Case Workflows

### Workflow 13: Empty States

> Verifies all pages display appropriate empty state messaging when no data exists.

**Prerequisites:** A newly onboarded couple with no data created yet.

1. Verify dashboard empty state
   - Navigate to /dashboard
   - Verify stat cards show zero counts (0 check-ins, 0 notes, etc.)
   - Verify quick action cards are still clickable and navigate correctly

2. Verify list pages empty states
   - Navigate to /notes
   - Verify "No notes found" or similar empty state message
   - Verify "Start by creating your first note" or similar CTA
   - Navigate to /growth
   - Verify empty timeline/progress with encouraging message
   - Navigate to /reminders
   - Verify empty state when no reminders exist

3. Verify relationship features empty states
   - Navigate to /love-languages
   - Verify "Add Language" empty state prompt under "My Languages"
   - Click "Partner's" tab
   - Verify empty state message about partner's languages
   - Navigate to /love-languages/actions
   - Verify "Add Your First Action" empty state
   - Navigate to /requests
   - Verify empty received and sent tabs

4. Verify check-in empty state
   - Navigate to /checkin
   - Verify category cards are still interactive even with no prior check-ins
   - Verify "Start Now" button works from a clean state

---

### Workflow 14: Note Editor UX

> Tests NoteEditor dialog behavior including auto-close, error handling, and input limits.

**Prerequisites:** Logged in with an active couple.

1. Verify dialog opens and closes properly
   - Navigate to /notes
   - Click "+ New Note"
   - Verify dialog opens
   - Click "Cancel"
   - Verify dialog closes
   - Click "+ New Note" again
   - Click the X button in the top-right corner
   - Verify dialog closes
   - Click "+ New Note" again
   - Click the dark overlay outside the dialog
   - Verify dialog closes

2. Verify auto-close on successful save
   - Click "+ New Note"
   - Type "Auto-close test note" in the textarea
   - Click "Save"
   - Verify the dialog closes automatically (not staying open)
   - Verify the new note appears in the list

3. Verify character count and limits
   - Click "+ New Note"
   - Type a short message
   - Verify the word count updates (bottom-left of dialog)
   - Verify the character count shows "X/5000"
   - Verify the Save button is enabled when content exists
   - Clear the textarea
   - Verify the Save button is disabled when no content

4. Verify tag management
   - Click "+ New Note"
   - Type "tag1" in the tags input and press Enter
   - Verify "#tag1" appears as a badge
   - Type "TAG1" and press Enter
   - Verify duplicate tags are rejected (case-insensitive)
   - Add tags until reaching 10 tags
   - Verify additional tags cannot be added after 10
   - Click the X on a tag badge
   - Verify the tag is removed

5. Verify privacy selector
   - Click "+ New Note"
   - Verify "Draft" is the default privacy
   - Click "Shared" - verify it highlights
   - Click "Private" - verify it highlights and Shared deselects
   - Type content and click "Save"
   - Verify the saved note has the correct privacy badge

---

### Workflow 15: Navigation Mobile

> Tests mobile navigation patterns including bottom tab bar and More drawer.

**Prerequisites:** Logged in with an active couple. Browser viewport resized to mobile width (< 1024px).

1. Verify mobile bottom navigation
   - Resize browser viewport to 375px width (mobile)
   - Navigate to /dashboard
   - Verify the fixed bottom tab bar appears with 4 items + More button
   - Verify visible items: Dashboard, Check-in, Notes, Growth
   - Verify the sidebar is hidden on mobile
   - Click "Check-in" in bottom bar
   - Verify navigation to /checkin

2. Verify More drawer
   - Click the "More" button in the bottom tab bar
   - Verify a slide-in drawer opens from the right side
   - Verify all 8 navigation items are listed: Dashboard, Check-in, Notes, Growth, Reminders, Love Languages, Requests, Settings
   - Verify "Sign Out" button is at the bottom of the drawer
   - Click "Reminders" in the drawer
   - Verify navigation to /reminders
   - Verify the drawer closes after selection

3. Verify responsive breakpoint transition
   - Resize browser viewport to 1200px width (desktop)
   - Verify the sidebar navigation appears on the left
   - Verify the bottom tab bar disappears
   - Resize back to 375px
   - Verify the bottom tab bar reappears
   - Verify the sidebar hides

4. Verify web platform conventions on mobile
   - Verify all interactive elements are tap-friendly (adequate touch target size)
   - Verify the browser back button works correctly on mobile
   - Verify URLs still update when navigating via bottom tab or More drawer
   - Verify scrolling works properly on long content pages
