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
