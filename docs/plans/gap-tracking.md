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
