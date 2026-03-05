# QC Mobile Browser HIG Audit Report

**Date:** 2026-03-03
**App:** QC (Quality Couple) -- https://tryqc.co
**Platform:** Mobile browser (Chrome, 500px viewport width, iPhone-like)
**Standard:** Apple Human Interface Guidelines (HIG) for iOS
**Auditor:** Claude Code (automated audit via browser tools)

---

## 1. Executive Summary

### Overall Compliance: **MODERATE -- Significant touch target gaps across all pages**

| Metric                               | Value                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| Pages audited                        | 8 (Dashboard, Notes, Settings, Check-in, Reminders, Growth, Love Languages, More Menu) |
| Total interactive elements evaluated | ~115                                                                                   |
| Elements below 44pt minimum          | ~89 (77%)                                                                              |
| Critical issues                      | 3                                                                                      |
| High issues                          | 5                                                                                      |
| Medium issues                        | 2                                                                                      |

The QC app has a solid structural foundation for mobile -- bottom tab bar, card-based layout, dark mode, and no hamburger menu. However, the majority of interactive elements fall below the iOS HIG minimum touch target of 44x44pt. The most pervasive issue is a consistent use of 40px-height buttons app-wide, just 4px short of the minimum. Settings uses web-style checkboxes instead of iOS toggle switches, and 14px input font sizes trigger Safari's auto-zoom behavior. The Reminders page is the worst offender with 18 of 23 elements undersized.

---

## 2. Methodology

### Test Environment

- **Browser:** Chrome DevTools mobile emulation
- **Viewport:** 500px width (iPhone-equivalent)
- **Orientation:** Portrait only
- **Evaluation criteria:** Apple HIG touch target minimums (44x44pt), iOS-native control expectations, layout overflow, font size auto-zoom thresholds

### Evaluation Criteria

| Criterion                      | Threshold                           | Source                           |
| ------------------------------ | ----------------------------------- | -------------------------------- |
| Minimum touch target           | 44x44pt (44x44px at 1x)             | Apple HIG -- Touch Targets       |
| Input font size (no auto-zoom) | >= 16px                             | Safari/WebKit behavior           |
| Toggle controls                | iOS Switch, not checkbox            | Apple HIG -- Controls            |
| Horizontal overflow            | Content must fit viewport           | Responsive design basics         |
| Destructive actions            | Require confirmation, adequate size | Apple HIG -- Destructive Actions |

---

## 3. Critical Issues

These issues directly violate iOS HIG guidelines and cause usability or functional problems.

---

### CRITICAL-01: Web-style checkboxes instead of iOS toggle switches (Settings)

**Page:** `/settings` > Session Rules
**Severity:** :red_circle: Critical
**Impact:** Non-native control pattern; confusing for iOS users

Five boolean settings render as 16x16px web checkboxes instead of iOS-style toggle switches:

| Setting             | Current Control | Current Size | Expected Control |
| ------------------- | --------------- | ------------ | ---------------- |
| Turn-Based Mode     | Checkbox        | 16x16px      | Toggle Switch    |
| Allow Extensions    | Checkbox        | 16x16px      | Toggle Switch    |
| Warm-Up Questions   | Checkbox        | 16x16px      | Toggle Switch    |
| Pause Notifications | Checkbox        | 16x16px      | Toggle Switch    |
| Auto-Save Drafts    | Checkbox        | 16x16px      | Toggle Switch    |

At 16x16px, these are **less than 37% of the minimum touch target size**. iOS users universally expect toggle switches for on/off settings.

**Fix:** Replace `<input type="checkbox">` with the shadcn `<Switch>` component (Radix Toggle primitive), which renders as an iOS-style toggle at 44x24px by default.

---

### CRITICAL-02: Input font size triggers iOS Safari auto-zoom

**Page:** `/settings` (all form inputs)
**Severity:** :red_circle: Critical
**Impact:** iOS Safari auto-zooms the viewport when users tap inputs with font-size < 16px, breaking layout

All form inputs on the Settings page use **14px font size**. When a user taps any input field on iOS Safari, the browser automatically zooms in to make the text readable, then fails to zoom back out, leaving the page in a broken zoomed state.

**Affected inputs:** Display Name, Email (disabled), all Session Rules number inputs

**Fix:** Add `text-base` (16px) class to all `<input>`, `<select>`, and `<textarea>` elements. Alternatively, add the following to `globals.css`:

```css
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  input,
  select,
  textarea {
    font-size: 16px;
  }
}
```

---

### CRITICAL-03: Horizontal overflow on Settings > Session Rules

**Page:** `/settings` > Session Rules section
**Severity:** :red_circle: Critical
**Impact:** Content overflows viewport, creates horizontal scroll on mobile

The Session Rules form labels and layout compute to approximately 896px width, well beyond the 500px viewport. This creates an unintended horizontal scrollbar and hides content off-screen.

**Fix:** Audit the Session Rules form layout. Likely causes:

- Fixed-width labels or containers not using responsive classes
- Missing `max-w-full` or `overflow-hidden` on the form container
- Grid/flex layout not wrapping at mobile breakpoints

Apply `max-w-full overflow-x-hidden` to the form container and ensure all child elements use responsive widths (`w-full` instead of fixed widths).

---

## 4. High Issues

These issues affect usability and deviate from HIG guidelines but do not break functionality.

---

### HIGH-01: Consistent 40px button height across all pages (should be 44px)

**Severity:** :orange_circle: High
**Impact:** Every primary and secondary button across the app is 4px below the minimum touch target

The app uses a consistent `h-10` (40px) button height. While consistent, this is universally below the 44pt HIG minimum. Every button listed below needs to increase to `h-11` (44px):

| Page           | Button                  | Current Size |
| -------------- | ----------------------- | ------------ |
| Dashboard      | "Start Check-in" (x2)   | --x40px      |
| Dashboard      | Quick Action cards      | --x40px      |
| Dashboard      | Banner dismiss          | 24x24px      |
| Check-in       | "Edit"                  | 77x36px      |
| Check-in       | "Prepare Topics"        | 109x40px     |
| Check-in       | "Start Now"             | 95x40px      |
| Notes          | "New Note" (if present) | --x40px      |
| Reminders      | "New Reminder"          | 136x40px     |
| Growth         | "New Milestone"         | 165x40px     |
| Love Languages | "Add Language"          | 167x40px     |
| Love Languages | "Edit"                  | 80x36px      |
| Settings       | "Save Profile"          | 118x40px     |

**Fix:** Global change -- update the default Button component height from `h-10` to `h-11`:

```tsx
// In src/components/ui/button.tsx or equivalent
// Change default size variant:
default: "h-11 px-4 py-2"  // was h-10
```

---

### HIGH-02: Filter chips and tabs severely undersized (26-36px)

**Severity:** :orange_circle: High
**Impact:** Small, closely-spaced filter controls are difficult to tap accurately on mobile

| Page           | Element                                                                                 | Height | Gap from 44px |
| -------------- | --------------------------------------------------------------------------------------- | ------ | ------------- |
| Reminders      | Status filter tabs (All, Active, Snoozed, Overdue, Inactive)                            | 28px   | -16px         |
| Reminders      | Category chips (All Categories, Habits, Check-ins, Action Items, Special Dates, Custom) | 26px   | -18px         |
| Growth         | View tabs (Timeline, Progress, Memories, Analytics)                                     | 36px   | -8px          |
| Growth         | Category filters                                                                        | 36px   | -8px          |
| Growth         | Sort buttons (Newest, Oldest, Category)                                                 | 36px   | -8px          |
| Growth         | Month label                                                                             | 28px   | -16px         |
| Love Languages | Tab buttons (My Languages, Partner's, Discoveries)                                      | 32px   | -12px         |

The Reminders page is the worst case, with filters as small as 26px -- barely more than half the minimum.

**Fix:** Set minimum height on all filter/tab components:

```css
/* Tailwind classes */
min-h-11  /* 44px minimum */
```

For horizontal scrollable filter rows, ensure adequate horizontal padding (`px-4` minimum) to meet the 44px width target as well.

---

### HIGH-03: Theme toggle undersized on every page

**Severity:** :orange_circle: High
**Impact:** Present on every page in the header; consistently 8px below minimum

The theme toggle button measures **36x36px** across all pages audited. As a persistent header element visible on every screen, this undersized target affects the entire app experience.

**Fix:** Increase the theme toggle container:

```tsx
// Add min-w-11 min-h-11 (44px) to the theme toggle button
<button className="min-w-11 min-h-11 ..." />
```

---

### HIGH-04: Destructive action buttons dangerously small

**Severity:** :orange_circle: High
**Impact:** Undersized destructive buttons are both a HIG violation and a UX risk -- accidental taps on adjacent elements, or inability to tap the intended delete action

| Page      | Button             | Current Size |
| --------- | ------------------ | ------------ |
| Notes     | Delete note button | 24x24px      |
| Reminders | Delete button      | --x36px      |
| Reminders | Pause button       | --x36px      |
| Reminders | Snooze button      | --x36px      |

The Notes delete button at 24x24px is particularly concerning -- it is barely half the minimum and sits adjacent to other interactive elements.

**Fix:** Increase all destructive action buttons to at least 44x44px touch targets. Even if the visible icon remains small, wrap it in a larger tappable area:

```tsx
<button className="min-w-11 min-h-11 flex items-center justify-center">
  <TrashIcon className="h-5 w-5" />
</button>
```

---

### HIGH-05: Sort dropdown SELECT element undersized (Notes)

**Severity:** :orange_circle: High
**Impact:** Native `<select>` at 33px height is below the minimum and difficult to tap

| Page  | Element       | Current Size |
| ----- | ------------- | ------------ |
| Notes | Sort dropdown | 124x33px     |

**Fix:** Increase the select element height to 44px minimum:

```tsx
<select className="h-11 text-base ..." />
```

---

## 5. Medium Issues

These are usability improvements that would enhance the iOS feel but are not strict HIG violations.

---

### MEDIUM-01: Form inputs at 40px height

**Severity:** :yellow_circle: Medium
**Impact:** While 40px is close to the minimum, iOS native text fields are typically 44px

All form inputs in Settings use 40px height. Increasing to 44px would improve tappability and align with the iOS-native feel.

**Fix:** Add `h-11` to the Input component's default styles or the Settings form specifically.

---

### MEDIUM-02: Empty states could be more helpful

**Severity:** :yellow_circle: Medium
**Impact:** Growth page and other sections with no data show minimal empty states

When no milestones or data exist, the empty state could include:

- An illustrative icon or image
- A brief description of what the feature does
- A prominent CTA button to create the first item

This follows the iOS HIG guidance on empty states providing context and next steps.

---

## 6. Positive Findings

These elements correctly follow iOS HIG patterns and demonstrate good mobile design.

---

### :white_check_mark: Bottom Tab Bar -- Properly Implemented

- 5 tabs: Dashboard, Check-in, Notes, Growth, More
- Each tab item: **98x56px** (well above 44pt minimum)
- Active tab has clear visual highlight
- Fixed to bottom of viewport
- Correct iOS tab bar pattern (no hamburger menu)

### :white_check_mark: More Menu -- Correct Sizing

- All 8 navigation items: **224x44px** (meets minimum exactly)
- Slides in from the right with dimmed backdrop overlay
- iOS-appropriate slide-over pattern
- Adequate spacing between items

### :white_check_mark: No Hamburger Menu

- The app correctly avoids the hamburger menu anti-pattern for iOS
- Uses a bottom tab bar (primary navigation) + "More" tab (secondary navigation)
- This matches iOS-native navigation conventions

### :white_check_mark: Card-Based Layout with Good Spacing

- Dashboard uses well-spaced cards for quick actions and stats
- Cards have adequate padding and clear visual separation
- Content is readable and well-organized at mobile widths

### :white_check_mark: Comprehensive Dark Mode

- Dark mode is fully implemented across all pages
- Theme toggle is accessible from every page (though undersized)
- Colors, backgrounds, and borders adapt correctly
- No contrast issues observed in dark mode

### :white_check_mark: Consistent Navigation Across Pages

- Bottom tab bar persists across all app pages
- Header with page title is consistent
- Back navigation where appropriate
- No disorienting layout shifts between pages

---

## 7. Recommended Fixes

Specific Tailwind CSS and component changes, ordered by impact.

---

### Fix 1: Global Button Height -- `h-10` to `h-11`

**Impact:** Fixes ~30+ buttons across all pages
**Files:** `src/components/ui/button.tsx` (or wherever the Button primitive is defined)

```diff
- default: "h-10 px-4 py-2",
+ default: "h-11 px-4 py-2",
```

For smaller variant buttons (icon-only, compact), ensure the touch target wrapper is still 44px even if the visual element is smaller.

---

### Fix 2: Input Font Size -- add `text-base` to prevent iOS auto-zoom

**Impact:** Fixes auto-zoom on all form inputs
**Files:** `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, `src/components/ui/textarea.tsx`

```diff
- "h-10 ... text-sm ..."
+ "h-11 ... text-base ..."
```

Alternatively, apply globally in `globals.css`:

```css
input,
select,
textarea {
  font-size: 16px !important;
}
```

---

### Fix 3: Filter Chips/Tabs -- increase min-height to 44px

**Impact:** Fixes ~25 filter/tab elements across Reminders, Growth, Love Languages
**Files:** Components for filter tabs, category chips, sort buttons

```diff
- "h-7 ..." or "h-8 ..." or "h-9 ..."
+ "min-h-11 ..."
```

Ensure horizontal padding is also adequate (`px-3` minimum) so the touch target meets 44px in both dimensions for narrow labels.

---

### Fix 4: Theme Toggle -- increase to 44px minimum

**Impact:** Fixes the theme toggle on every page
**Files:** Theme toggle component (likely in `src/components/layout/` or header)

```diff
- "h-9 w-9" or "h-8 w-8"
+ "min-w-11 min-h-11"
```

---

### Fix 5: Destructive/Action Buttons -- increase to 44px

**Impact:** Fixes delete, pause, snooze buttons on Notes and Reminders
**Files:** Note card actions, Reminder action buttons

```diff
- "h-6 w-6" or "h-9 ..."
+ "min-w-11 min-h-11 flex items-center justify-center"
```

Keep the icon size visually small (`h-5 w-5`) but expand the tappable wrapper.

---

### Fix 6: Replace Checkboxes with Toggle Switches

**Impact:** Fixes 5 boolean settings on the Settings page
**Files:** Settings > Session Rules form component

```diff
- <input type="checkbox" ... />
- <label>Turn-Based Mode</label>
+ <div className="flex items-center justify-between">
+   <Label htmlFor="turn-based">Turn-Based Mode</Label>
+   <Switch id="turn-based" ... />
+ </div>
```

Use the shadcn `Switch` component (built on Radix `@radix-ui/react-switch`), which renders as an iOS-style toggle.

---

### Fix 7: Fix Horizontal Overflow in Settings Session Rules

**Impact:** Fixes layout breakage on Settings page at mobile widths
**Files:** Settings > Session Rules form container

```diff
- <div className="...">
+ <div className="max-w-full overflow-x-hidden ...">
```

Also audit child elements for fixed widths and replace with responsive alternatives (`w-full`, `max-w-full`).

---

## 8. Page-by-Page Summary

| Page               | Total Elements | Below 44pt | Pass Rate | Worst Offender           | Severity                |
| ------------------ | -------------- | ---------- | --------- | ------------------------ | ----------------------- |
| **Dashboard**      | 36             | 31         | 14%       | Banner dismiss (24x24px) | :orange_circle: High    |
| **Notes**          | ~8             | 4          | 50%       | Delete button (24x24px)  | :orange_circle: High    |
| **Settings**       | ~15            | 10         | 33%       | Checkboxes (16x16px)     | :red_circle: Critical   |
| **Check-in**       | ~10            | 6          | 40%       | Edit button (77x36px)    | :orange_circle: High    |
| **Reminders**      | 23             | 18         | 22%       | Category chips (26px)    | :orange_circle: High    |
| **Growth**         | ~20            | 16         | 20%       | Month label (28px)       | :orange_circle: High    |
| **Love Languages** | ~14            | 9          | 36%       | Tab buttons (32px)       | :orange_circle: High    |
| **More Menu**      | 8              | 0          | 100%      | --                       | :white_check_mark: Pass |
| **Bottom Tab Bar** | 5              | 0          | 100%      | --                       | :white_check_mark: Pass |

---

## Appendix: iOS HIG Touch Target Reference

From Apple's Human Interface Guidelines:

> **Minimum touch target size: 44x44 points.**
> Provide ample touch targets for interactive elements. Try to maintain a minimum tappable area of 44x44 pt for all controls.

At 1x scaling (which maps to CSS pixels in a mobile browser context), 44pt = 44px. All measurements in this report use CSS pixels, which correspond directly to points in this context.

### Key Thresholds

| Size    | Status                      | Notes                               |
| ------- | --------------------------- | ----------------------------------- |
| >= 44px | :white_check_mark: Pass     | Meets HIG minimum                   |
| 40-43px | :yellow_circle: Close       | Minor fix needed (`h-10` to `h-11`) |
| 30-39px | :orange_circle: Below       | Needs attention                     |
| < 30px  | :red_circle: Well Below     | Urgent fix required                 |
| < 20px  | :no_entry: Critically Small | Unusable for many users             |

---

_Report generated 2026-03-03. Re-audit recommended after implementing fixes._
