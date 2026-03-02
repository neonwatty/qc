# Beta Audit Tracking

Holistic beta-readiness audit across feature completeness, error handling, UX polish, ops readiness, and performance.

---

## Iteration Log

### Iteration 1 (2026-03-01)

**Findings:** 90+ total across 5 dimensions (~20 HIGH, ~30 MEDIUM, ~40 LOW)
**Code fixes applied:** 12
**Manual to-dos added:** 8
**Deferred:** 60+ (LOW items + remaining MEDIUM for future iterations)

#### Fixed (Code)

- [x] Remove console.log placeholder handlers in PrimaryActionFAB and MobileActionBar — wire to real routes (dimension: feature, severity: HIGH)
- [x] Add useMemo to CheckInContext, LoveLanguagesContext, SessionSettingsContext to prevent unnecessary re-renders (dimension: performance, severity: HIGH)
- [x] Add error.tsx for onboarding route (dimension: error-handling, severity: HIGH)
- [x] Add error.tsx for invite/[token] route (dimension: error-handling, severity: HIGH)
- [x] Throttle dashboard router.refresh() on visibilitychange to once per 30s (dimension: performance, severity: HIGH)
- [x] Add List-Unsubscribe and List-Unsubscribe-Post headers to outgoing emails (dimension: ops, severity: HIGH)
- [x] Replace non-null assertions with explicit env var validation in Supabase clients (dimension: ops, severity: HIGH)
- [x] Add skip-to-content link for accessibility in root layout (dimension: polish, severity: HIGH)
- [x] Add id="main-content" to app shell and landing page main elements (dimension: polish, severity: HIGH)
- [x] Add aria-labels to icon-only buttons in NoteEditor (close, tag remove) (dimension: polish, severity: MEDIUM)
- [x] Fix misleading "No couple found" message on notes page to "Complete onboarding first" (dimension: error-handling, severity: MEDIUM)
- [x] Add .limit(100) to notes page query to prevent unbounded fetch (dimension: performance, severity: MEDIUM)
- [x] Add dashboard query error logging for silent failures (dimension: error-handling, severity: HIGH)
- [x] Add MotionConfig reducedMotion="user" to respect prefers-reduced-motion (dimension: polish, severity: MEDIUM)

#### Manual To-Dos Added

- Set up error monitoring service (Sentry/Datadog) (dimension: ops, severity: HIGH)
- Configure uptime monitoring (Pingdom/UptimeRobot) for tryqc.co (dimension: ops, severity: MEDIUM)
- Decide on and publish support contact method (email/GitHub) in legal pages (dimension: feature, severity: HIGH)
- Configure Resend with production domain email sender (dimension: ops, severity: MEDIUM)
- Monitor Resend email deliverability and bounce rates (dimension: ops, severity: MEDIUM)
- Verify all required env vars are set in Vercel dashboard (dimension: ops, severity: MEDIUM)
- Add account deletion functionality (promised in legal pages) (dimension: feature, severity: HIGH)
- Add password change and email change functionality (dimension: feature, severity: MEDIUM)

#### Deferred

- [ ] Add error.tsx to all remaining route segments (dimension: error-handling, severity: MEDIUM, will address in iteration 2)
- [ ] Add not-found.tsx pages for invalid routes (dimension: error-handling, severity: MEDIUM, will address in iteration 2)
- [ ] Offline/network failure detection (dimension: error-handling, severity: HIGH, requires architectural decision)
- [ ] Context provider route-based splitting (dimension: performance, severity: HIGH, requires architectural redesign)
- [ ] Dashboard N+1 queries — consolidate into DB view/RPC (dimension: performance, severity: HIGH, needs migration)
- [ ] Missing pagination on reminders/requests pages (dimension: performance, severity: MEDIUM)
- [ ] Dynamic imports for recharts, canvas-confetti (dimension: performance, severity: HIGH, bundle optimization)
- [ ] Replace raw img tags with next/image in PhotoGallery (dimension: performance, severity: MEDIUM)
- [ ] Add Suspense boundaries for streaming (dimension: performance, severity: MEDIUM)
- [ ] Health check endpoint — add DB connectivity check (dimension: ops, severity: MEDIUM)
- [ ] Rate limiting on public API endpoints (dimension: ops, severity: HIGH, needs rate-limit middleware)
- [ ] Missing focus trap in NoteEditor modal (dimension: polish, severity: HIGH)
- [ ] Add aria-live regions for dynamic content updates (dimension: polish, severity: MEDIUM)
- [ ] Cookie consent banner for GDPR (dimension: feature, severity: LOW)
- [ ] Email re-subscription UI (dimension: feature, severity: HIGH)
- [ ] Avatar upload via Supabase Storage (dimension: feature, severity: MEDIUM)
- [ ] File size validation for photo uploads (dimension: error-handling, severity: MEDIUM)
- [ ] Bulk delete undo/soft-delete for notes (dimension: error-handling, severity: MEDIUM)
- [ ] Relationship date format validation in onboarding (dimension: error-handling, severity: MEDIUM)
- [ ] Auth callback error details improvement (dimension: error-handling, severity: MEDIUM)
