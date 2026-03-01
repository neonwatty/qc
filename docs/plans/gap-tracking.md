# Gap Analysis Tracking

Automated tracking of gaps found between the full-stack QC app and the client-side reference app ([qc-app](https://github.com/neonwatty/qc-app)).

Each iteration is appended below by the `/gap-analysis` skill.

---

## Iteration Log

### Iteration 1 (2026-02-28)

**Findings:** 12
**Fixed:** 4
**Deferred:** 8
**Dimensions Covered:** Pages & Routes, Components, Styling & Visual Design, Content & Copy, UX Flows, Assets

#### Fixed

- [x] Feature Grid missing 3 features: Session Rules, Unified View, Relationship Goals (dimension: Components/Content, severity: HIGH)
- [x] Feature Grid Reminders description missing "Chat-like reminder management" prefix (dimension: Content & Copy, severity: MEDIUM)
- [x] Hero feature pills using wrong copy — "Weekly Check-ins" etc. instead of "Structured Sessions" etc. (dimension: Content & Copy, severity: MEDIUM)
- [x] Updated tests to match new feature grid (9 features) and hero pill text (dimension: Tests, severity: MEDIUM)

#### Deferred

- [ ] Settings page missing 7-section sidebar navigation (too large for single iteration)
- [ ] Onboarding missing Welcome, Quiz, and Reminder steps (architectural change, needs planning)
- [ ] Check-in landing missing "Previous Check-ins" history section (needs UI + data query)
- [ ] Growth page missing 4-view toggle (Timeline, Progress, Analytics, Memories) (needs UI scaffolding)
- [ ] Notes missing dashboard view with bulk operations, advanced filters, search (large feature)
- [ ] Reminders missing chat-style interface (architectural change from card-based)
- [ ] Requests missing inbox view with sent/received tabs (architectural change)
- [ ] Missing public assets: favicon, manifest.json, service worker (needs asset creation)

#### Intentionally Skipped

- Test/demo pages in reference (test-button, test-motion, test-skeletons, etc.) — prototype artifacts
- Mock data patterns — QC uses real Supabase backend
- Jest test files — QC uses Vitest
- Reference root layout includes Header/Navigation/Footer in layout.tsx — QC uses route group layouts with auth-aware rendering
- Reference uses localStorage for onboarding state — QC uses server actions

### Iteration 2 (2026-02-28)

**Findings:** 10
**Fixed:** 5
**Deferred:** 5
**Dimensions Covered:** Components, Content & Copy, UX Flows

#### Fixed

- [x] Growth Progress view showed milestone cards instead of growth area scores — now shows GrowthProgressBars + completion stats (dimension: Components/UX, severity: HIGH)
- [x] Notes missing sort options — added sort dropdown (newest/oldest/title) and result count display (dimension: UX Flows, severity: MEDIUM)
- [x] Requests tabs missing pending-specific badge count — added pink pending badge on received/sent tabs (dimension: UX Flows, severity: MEDIUM)
- [x] Feature Grid CTA copy not matching reference tone — changed to "Ready to engineer a better relationship?" (dimension: Content & Copy, severity: MEDIUM)
- [x] Updated tests for growth progress view, notes sort/count, and feature grid CTA (dimension: Tests, severity: MEDIUM)

#### Deferred

- [ ] Settings page missing 7-section sidebar navigation (architectural change, too large for single iteration)
- [ ] Settings missing Check-in Schedule / ReminderScheduler section (new component needed)
- [ ] Settings PersonalizationPanel missing font size + accessibility options (needs UI expansion)
- [ ] Notes missing advanced filters: category, date range (needs UI + data changes)
- [ ] Check-in landing missing "Previous Check-ins" history section (needs data hook + UI)

#### Previously Deferred — Now Resolved

- [x] Growth page 4-view toggle — was already implemented (Timeline/Progress/Analytics/Memories)
- [x] Requests inbox with sent/received tabs — was already implemented with counts

#### Intentionally Skipped

- Onboarding step differences (Welcome/Quiz/Reminder) — architectural choice, QC uses server actions
- Reminders chat-style interface — architectural change from card-based, needs planning
- Missing public assets (favicon, manifest.json, service worker) — needs asset creation, not code gap

### Iteration 3 (2026-02-28)

**Findings:** 6
**Fixed:** 2
**Deferred:** 4
**Dimensions Covered:** Components, UX Flows

#### Fixed

- [x] Settings missing ThemeSelector / Appearance tab — added ThemeSelector component with Light/Dark toggle and new Appearance tab in settings (dimension: Components, severity: HIGH)
- [x] Reminders missing category filter badges — added horizontal scrollable category filter row (Habits, Check-ins, Action Items, Special Dates, Custom) with active highlighting (dimension: UX Flows, severity: MEDIUM)

#### Deferred

- [ ] NotificationSettings only 2 toggles vs reference's 5+ notification types with per-channel config (architectural expansion, needs planning)
- [ ] StatsGrid missing change indicators / trend arrows (needs historical comparison data, DB query change)
- [ ] Check-in landing missing "Previous Check-ins" history section (page is `'use client'`, needs server component wrapper refactor)
- [ ] CategoryCard in check-in flow missing prompt preview (production card is settings-context, different purpose)

#### Intentionally Skipped

- Reference's PersonalizationPanel (font size, color presets, HSL editing) — over-engineered for current product stage
- Reference's count-up animation hook in StatsGrid — cosmetic enhancement, low priority
- SessionSettingsPanel differences — reference uses Slider components (we don't have Slider primitive), production uses number inputs

### Iteration 4 (2026-02-28)

**Findings:** 7
**Fixed:** 5
**Deferred:** 2
**Dimensions Covered:** Components, Content & Copy, Styling & Visual Design

#### Fixed

- [x] AddLanguageDialog importance labels missing descriptive help text ("Nice to have", "Important to me", "Very important", "Critical for feeling loved") — data-driven radio options (dimension: Content & Copy, severity: MEDIUM)
- [x] AddLanguageDialog privacy labels missing clarification text ("Only visible to me", "Visible to your partner") (dimension: Content & Copy, severity: MEDIUM)
- [x] Notes search placeholder too brief — changed to "Search notes, categories, or tags..." (dimension: Content & Copy, severity: LOW)
- [x] Notes grid missing xl:grid-cols-4 breakpoint for large screens (dimension: Styling, severity: LOW)
- [x] Dashboard QuickActions missing badge counts — added pending request count and today's reminder count badges with pink pill styling (dimension: Components, severity: HIGH)

#### Deferred

- [ ] MilestoneCreator missing confetti celebration animation (frontend-only but large scope, needs particle system)
- [ ] Timeline missing multi-entry type support (milestones only vs milestones + check-ins + notes + goals in reference — architectural change)

#### Intentionally Skipped

- LoveActionCard missing notes/plannedFor/suggestedBy fields — these fields don't exist in production DB schema (reference uses mock data)
- Landing page, layout, navigation, global styles — production is significantly AHEAD of reference (dark mode, HowItWorks, SocialProof, theme toggle, sign out, etc.)
- Notes advanced features (tag manager, bulk actions, infinite scroll) — require DB schema changes or large architectural work
- Dashboard ActivityFeed filter tabs — architectural change, current RecentActivity is simpler but functional

### Iteration 5 (2026-02-28)

**Findings:** 6
**Fixed:** 3
**Deferred:** 3
**Dimensions Covered:** Components, Content & Copy, UX Flows

#### Fixed

- [x] Tour slides missing bullet points and feature titles not matching reference — added 3 numbered feature points per slide, renamed titles to "Structured Check-Ins", "Privacy Controls", "Growth Tracking", "Love Languages" with concise descriptions (dimension: Content & Copy, severity: MEDIUM)
- [x] RequestCard missing category icons, status icons, and priority icons — added lucide-react icons for all 6 categories (Heart, Briefcase, MessageSquare, Bell, Sparkles, MoreHorizontal), 4 statuses (Clock, Check, X, RefreshCw), and high-priority AlertCircle indicator with color-coded badges (dimension: Components, severity: MEDIUM)
- [x] Requests empty state missing icons — added Inbox icon for received tab and Send icon for sent tab with muted styling (dimension: UX Flows, severity: MEDIUM)

#### Deferred

- [ ] Check-in session missing PromptManager, PromptEditor, DiscussionView, RichTextEditor, NoteTabs, BasicTextInput (6 large components, architectural change to check-in flow)
- [ ] Onboarding missing Welcome, Quiz, Reminder, and Complete steps (architectural change, 4+ new components)
- [ ] Missing LoadingStates, FallbackUI, Animations UI component library (40+ specialized components)

#### Intentionally Skipped

- CompletionCelebration share/download/hearts — cosmetic enhancement, low user impact
- PreparationModal partner simulation — uses mock data in reference, not suitable for production
- CardStack swipeable interface — mobile UX enhancement, needs touch gesture library
- Reference onboarding hardcodes "Jeremy" and "Deb" — production correctly uses dynamic names
- Reference uses `mockUsers` for request cards — production uses real data
- Loading.tsx files for all routes — already implemented in production (dashboard, notes, growth, settings, reminders, requests, love-languages)

### Iteration 6 (2026-02-28)

**Findings:** 7
**Fixed:** 4
**Deferred:** 3
**Dimensions Covered:** Components, UX Flows, Styling & Visual Design

#### Fixed

- [x] Reminders filter buttons missing badge counts — added inline count badges with themed styling on all 5 status filters (dimension: UX Flows, severity: MEDIUM)
- [x] Reminders category filters missing emoji icons — added emoji (💜💬✅🎉⭐) to category filter buttons (dimension: Content & Copy, severity: MEDIUM)
- [x] LoveLanguagesWidget missing "Today's Actions" section and partner's top language — added Sparkles-headed section showing action count with link, and border-top partner language preview with Badge (dimension: Components, severity: MEDIUM)
- [x] PreparationModal dialog title missing gradient text — changed from flat rose-600 to gradient `from-rose-500 to-pink-500 bg-clip-text text-transparent` (dimension: Styling, severity: LOW)

#### Deferred

- [ ] Dashboard missing CheckInCard with countdown timer and progress ring (large component + new hook, architectural)
- [ ] Dashboard RecentActivity missing filter tabs, load more, privacy toggle (architectural change to ActivityFeed)
- [ ] Settings missing ReminderScheduler, PersonalizationPanel, and "Redo Onboarding" (3 large components)

#### Intentionally Skipped

- Dashboard QuickActions floating/FAB variant — mobile UX enhancement, needs haptic feedback library
- StatsGrid animated count-up and change indicators — needs historical comparison data, DB query change (previously deferred)
- NotificationPreview/NotificationDemo components — cosmetic demo UI, not functional
- ReminderSchedule timeline widget — needs different data shape than production uses
- Reminders chat-style 2-column layout — architectural change from single-column list
- CheckInCard countdown timer — needs useCheckInTimer hook + couple frequency settings not in production schema

### Iteration 7 (2026-03-01)

**Findings:** 10
**Fixed:** 4
**Deferred:** 6
**Dimensions Covered:** Pages & Routes, Components, Content & Copy, UX Flows, Styling & Visual Design, Assets & Media

#### Fixed

- [x] NotificationSettings only had 2 toggles — expanded to 5 notification types matching reference: Check-in Reminders, Partner Check-ins, Milestone Celebrations, Action Item Reminders, Weekly Summaries (dimension: Components, severity: HIGH)
- [x] NotificationSettings description copy "Control how and when..." → "Configure how and when..." and removed "(coming soon)" from Quiet Hours (dimension: Content & Copy, severity: MEDIUM)
- [x] Check-in landing page missing "Recent Check-ins" section — added RecentCheckInsSection with real data from Supabase (last 3 completed check-ins with category, time ago, duration) (dimension: Components/UX, severity: HIGH)
- [x] Love Languages alert text missing "as you discover more about yourself" suffix (dimension: Content & Copy, severity: MEDIUM)

#### Deferred

- [ ] Onboarding missing Quiz step (communication_style, checkInFrequency, sessionStyle preferences) — architectural change, needs new DB columns + step component
- [ ] Onboarding missing Reminder setup step — architectural, needs ReminderScheduler component
- [ ] Dashboard missing CheckInCard with countdown timer and progress ring (previously deferred, large component)
- [ ] Dashboard missing ActivityFeed with filtering, load more, privacy toggle (previously deferred, architectural)
- [ ] Settings missing PromptLibrary/PromptTemplateEditor — large scope (600+ lines each), needs DB schema for prompt storage
- [ ] Check-in missing DiscussionView, PromptManager, RichTextEditor — 6+ large components, architectural change to check-in flow

#### Intentionally Skipped

- Reference NotificationSettings uses local state with mock data; production uses Supabase-backed settings — adapted reference patterns for real backend
- Reference "Recent Check-ins" uses hardcoded mock data; production fetches real completed check-ins from Supabase
- Reference StatsGrid has 4 engagement metrics with count-up animations; production has 6 data-driven cards — different but both functional
- Reference QuickActions has 3 floating/embedded variants; production has 6 grid actions with badge counts — production is more feature-rich
- Missing UI primitive library (LoadingStates, FallbackUI, LazyComponents) — 40+ specialized components, cosmetic polish
- Missing Radix primitives (scroll-area, accordion, avatar, dropdown-menu, slider, tooltip) — will be added as needed by features

### Iteration 8 (2026-03-01)

**Findings:** 3
**Fixed:** 3
**Deferred:** 0
**Dimensions Covered:** Pages & Routes, Content & Copy, UX Flows

#### Fixed

- [x] Reminders page missing description — added "Stay connected with thoughtful reminders for your relationship" to PageContainer + loading skeleton (dimension: Content & Copy, severity: MEDIUM)
- [x] Requests page missing description — added "Send and receive thoughtful requests with your partner" to PageContainer + loading skeleton (dimension: Content & Copy, severity: MEDIUM)
- [x] Settings page missing description — added "Customize your Quality Control experience" to PageContainer + loading skeleton (dimension: Content & Copy, severity: MEDIUM)

#### Intentionally Skipped

- StatsGrid change indicators ("+1 this week", "vs last month") — requires historical data comparison queries not in production schema
- SessionRulesPanel section headers (uppercase tracking-wide labels) — minor styling preference, production uses different but functional section layout
- ReminderCard expanded detail section (frequency label, assignee display) — production already has these features in a different layout pattern
- All previously deferred architectural items remain deferred (onboarding quiz/reminder steps, CheckInCard, ActivityFeed, PromptLibrary, DiscussionView, etc.)
