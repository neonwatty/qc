# Ralph Loop Skills Design

Three autonomous skills for iterative codebase improvement, designed to run via the Ralph Loop plugin.

## Overview

| Skill             | Purpose                                                                                                 | Tracking File                           | Completion Promise |
| ----------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------ |
| `/gap-analysis`   | Compare full-stack QC app against client-side reference app, carry over missing features/content/design | `docs/plans/gap-tracking.md`            | `NO_GAPS_FOUND`    |
| `/test-coverage`  | Find untested business logic, write tests, reach 80% coverage                                           | `docs/plans/test-coverage-tracking.md`  | `FULL_COVERAGE`    |
| `/security-audit` | Full OWASP-aligned security sweep, fix regressions and add enhancements                                 | `docs/plans/security-audit-tracking.md` | `NO_ISSUES`        |

## Invocation

```bash
/ralph-loop "/gap-analysis" --completion-promise "NO_GAPS_FOUND" --max-iterations 10
/ralph-loop "/test-coverage" --completion-promise "FULL_COVERAGE" --max-iterations 10
/ralph-loop "/security-audit" --completion-promise "NO_ISSUES" --max-iterations 10
```

## Shared Lifecycle (8 Phases)

All three skills follow the same phase structure per iteration:

### Phase 1: Setup

- `git checkout main && git pull`
- Read tracking file to find last iteration N; this iteration is N+1
- Create branch: `<skill-name>/iteration-<N>`
- For gap-analysis: clone or update `/tmp/qc-app`
- Review prior iterations to focus on uncovered ground

### Phase 2: Analyze

Domain-specific (see per-skill sections below).

### Phase 3: Fix

- Classify findings: HIGH, MEDIUM, LOW
- Fix all HIGH and MEDIUM items
- Cap at ~12 files per iteration; defer the rest
- Adapt client-side patterns for full-stack context where needed
- Never weaken existing patterns to fix something else

### Phase 4: Validate

```bash
npm run lint:fix
npm run typecheck
npm run test
```

For test-coverage skill, also run:

```bash
npm run test:coverage
```

Max 3 fix attempts per failing check. If still failing, revert the problematic change and note as deferred.

### Phase 5: Track

Append iteration entry to the skill's tracking file with:

- Findings count, fixed count, deferred count
- Dimensions/categories covered
- Coverage percentage (test-coverage only)
- Lists of fixed items, deferred items, intentionally skipped items

### Phase 6: Ship

If issues were found and fixed:

1. Stage specific files (not `git add -A`)
2. Commit: `fix: close gaps from <skill-name> iteration N`
3. Push: `git push -u origin <skill-name>/iteration-<N>`
4. Create PR via `gh pr create`

If no issues found: skip to Phase 8.

### Phase 7: CI & Merge

1. Poll `gh pr checks <number>` every 45 seconds
2. Report status between polls
3. All pass: `gh pr merge <number> --squash --delete-branch`, then `git checkout main && git pull`
4. Any fail: read logs via `gh run view <run-id> --log-failed`, fix, push, re-poll (max 3 attempts)

Required CI checks: Lint & Typecheck, Unit Tests, E2E Tests, Dead Code Detection.

### Phase 8: Signal

- Issues found and fixed: skill exits normally (Ralph re-invokes with same prompt)
- No issues found across all dimensions/categories: output `<promise>COMPLETION_PROMISE</promise>`

Only signal completion if all dimensions/categories were genuinely checked and nothing actionable remains.

---

## Skill 1: Gap Analysis

### Reference App

Client-side prototype at `https://github.com/neonwatty/qc-app`, cloned to `/tmp/qc-app`.

- 130 components, 27 pages, no backend (mock data only)
- Uses Jest (QC uses Vitest), no Supabase/auth integration
- Heavy mobile UX patterns: swipe gestures, pull-to-refresh, haptics, animations

### Analysis Dimensions (6)

| Dimension        | What to compare                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Pages & Routes   | All pages in reference vs `src/app/`. Missing pages, incomplete pages, layout differences   |
| Components       | Component structure, props, variants, rendered output. Missing components, missing variants |
| Styling & Visual | Tailwind classes, colors, spacing, typography, responsive breakpoints, animations           |
| Content & Copy   | Headings, labels, descriptions, button text, placeholders, error messages, empty states     |
| UX Flows         | Navigation, form behavior, loading states, transitions, modals                              |
| Assets & Media   | Icons, images, illustrations, SVGs                                                          |

### Exclusions (flagged as "intentionally skipped")

- Test/demo pages (`test-button`, `test-motion`, `test-skeletons`, etc.)
- Jest test files (QC uses Vitest)
- Mock data patterns (QC has real Supabase backend)

### Adaptation Rules

- Client components that fetch data -> server components with `requireAuth()` + Supabase queries
- Local state that should persist -> wire to Supabase tables with couple-scoped RLS
- Mock data -> real queries scoped by `couple_id`
- Client-side routing -> Next.js App Router conventions

### Completion

`<promise>NO_GAPS_FOUND</promise>` when all 6 dimensions compared, nothing actionable remains.

---

## Skill 2: Test Coverage

### Priority Order

| Priority | Target                                        | Rationale                                           |
| -------- | --------------------------------------------- | --------------------------------------------------- |
| P0       | Server actions (`**/actions.ts`)              | Business-critical mutations, auth, validation       |
| P1       | `lib/` utilities                              | Shared logic used everywhere                        |
| P2       | Contexts (`contexts/*.tsx`)                   | State management, complex logic                     |
| P3       | Hooks (`hooks/*.ts`)                          | Reusable behavior with edge cases                   |
| P4       | Middleware                                    | Auth flow, security headers, route protection       |
| P5       | Email templates (`lib/email/templates/*.tsx`) | Render correctness                                  |
| P6       | Page routes                                   | Only if they contain meaningful logic beyond layout |
| Skip     | UI primitives (`ui/button.tsx`, etc.)         | Thin Radix wrappers                                 |
| Skip     | Type-only files (`types/*.ts`)                | No runtime behavior                                 |
| Skip     | Test infrastructure (`test/mocks/*`)          | Not testable targets                                |

### Per-Iteration Approach

1. Glob for source files without adjacent `.test.` files
2. Cross-reference tracking file to skip already-covered files
3. Pick next 3-5 untested files by priority
4. Write tests following existing patterns: AAA, mock Supabase via `src/test/mocks/supabase.ts`, mock Next.js via `src/test/setup.ts`
5. Run `npm run test` to confirm passing

### Test Quality Rules

- Test behavior, not implementation details
- Happy path + at least one error case per function
- Server actions: test auth rejection, validation rejection, successful mutation
- Contexts: test state transitions and provider rendering
- Reset mocks in `beforeEach`

### Completion (Two-Part)

1. All P0-P5 files have tests
2. `npm run test:coverage` reports >= 80% across lines, branches, functions, and statements

Only then: `<promise>FULL_COVERAGE</promise>`

---

## Skill 3: Security Audit

### OWASP-Aligned Categories (10)

| Category                   | What to check                                                                                    | OWASP |
| -------------------------- | ------------------------------------------------------------------------------------------------ | ----- |
| Auth & Access Control      | Every server action calls `requireAuth()`, queries scope by `couple_id`, no privilege escalation | A01   |
| Input Validation           | All inputs validated with Zod, no raw string interpolation, max lengths enforced                 | A03   |
| RLS Completeness           | Every table has RLS, all 4 operations have policies, privacy filters on private tables           | A01   |
| Secret Management          | No hardcoded secrets, no secrets in client bundles, env vars validated before use                | A02   |
| Security Headers           | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy                | A05   |
| Dependency Vulnerabilities | `npm audit`, check for known CVEs                                                                | A06   |
| Rate Limiting              | Identify unprotected auth/mutation endpoints, add rate limiting where needed                     | A04   |
| Error Handling             | No stack traces leaked, generic messages for auth failures                                       | A09   |
| CSRF/Session               | Auth cookies use HttpOnly + SameSite, no session tokens in URLs                                  | A07   |
| Data Exposure              | No sensitive data in logs, URL params, or client-side state                                      | A02   |

### Per-Iteration Approach

Cover 1-2 categories thoroughly per iteration rather than all 10 shallowly. The tracking file records which categories have been fully audited.

### Fix Approach

- Regressions (missing auth, missing RLS): fix immediately
- Enhancements (rate limiting, audit logging): implement if straightforward, defer if complex
- Dependency vulnerabilities: `npm audit fix` for non-breaking, flag breaking as deferred
- Never weaken existing security to fix something else

### Completion

`<promise>NO_ISSUES</promise>` when all 10 categories audited and no HIGH or MEDIUM findings remain unfixed.

---

## Branch Naming

Distinct per skill to avoid collisions:

```
gap-analysis/iteration-N
test-coverage/iteration-N
security-audit/iteration-N
```

## Tracking File Format

```markdown
# <Domain> Tracking

<Description>

---

## Iteration Log

### Iteration N (YYYY-MM-DD)

**Findings:** X
**Fixed:** Y
**Deferred:** Z
**Dimensions/Categories Covered:** [list]
**Coverage:** XX% (test-coverage only)

#### Fixed

- [x] Description (severity: HIGH/MEDIUM, category: X)

#### Deferred

- [ ] Description (reason)

#### Intentionally Skipped

- Description (reason)
```
