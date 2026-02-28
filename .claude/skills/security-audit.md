---
name: security-audit
description: >
  One complete security audit iteration: systematically check 1-2 OWASP categories,
  fix regressions and add enhancements, validate, PR, CI, merge.
  Use via Ralph Loop: /ralph-loop "/security-audit" --completion-promise "NO_ISSUES" --max-iterations 10
---

# Security Audit — Full Cycle

You are performing one complete security audit iteration. Report progress at each phase.

## Phase 1: Setup

1. Ensure you are on main with the latest code:

   ```bash
   git checkout main && git pull origin main
   ```

2. Read `docs/plans/security-audit-tracking.md` to find the last iteration number. Your iteration is N+1. If no iterations exist yet, you are iteration 1.

3. Create an iteration branch:

   ```bash
   git checkout -b security-audit/iteration-<N>
   ```

4. Review which categories were already audited in prior iterations. Pick the next 1-2 unaudited categories from the list below.

## Phase 2: Audit Categories

Work through 1-2 categories per iteration, thoroughly. Read every relevant file.

### Category List

| #   | Category                       | What to check                                                                                                                                                                                                                                      | OWASP |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | **Auth & Access Control**      | Every server action calls `requireAuth()`. Every query scopes by `couple_id`. No privilege escalation paths. No way to access another couple's data.                                                                                               | A01   |
| 2   | **Input Validation**           | All user inputs validated with Zod before use. No raw string interpolation in queries. Max lengths enforced on all string fields. Enum validation on constrained fields.                                                                           | A03   |
| 3   | **RLS Completeness**           | Every table in `public` schema has RLS enabled. All 4 operations (SELECT, INSERT, UPDATE, DELETE) have policies. Privacy filters on notes and love_languages. Storage bucket policies on milestone-photos.                                         | A01   |
| 4   | **Secret Management**          | No hardcoded secrets anywhere. No secrets in `NEXT_PUBLIC_*` env vars. Service role key only in `lib/supabase/admin.ts`. Env vars validated before use (throw on missing).                                                                         | A02   |
| 5   | **Security Headers**           | CSP present and restrictive. X-Frame-Options: DENY. X-Content-Type-Options: nosniff. Referrer-Policy: strict-origin-when-cross-origin. Permissions-Policy restricts camera/mic/geo. All responses go through `addSecurityHeaders()`.               | A05   |
| 6   | **Dependency Vulnerabilities** | Run `npm audit`. Check for known CVEs. Apply `npm audit fix` for non-breaking fixes. Flag breaking changes as deferred.                                                                                                                            | A06   |
| 7   | **Rate Limiting**              | Check all public-facing endpoints and server actions. Invite acceptance has rate limiting. Identify any unprotected surfaces where rate limiting would prevent abuse (auth attempts, data creation). Add rate limiting where straightforward.      | A04   |
| 8   | **Error Handling**             | No stack traces or internal details in error responses. Generic messages for auth failures. No database column names or query details leaked. Email send failures wrapped in try-catch.                                                            | A09   |
| 9   | **CSRF/Session**               | Supabase auth cookies use HttpOnly + Secure + SameSite. No session tokens in URLs or query params. Auth refresh happens in middleware on every request. No session fixation vectors.                                                               | A07   |
| 10  | **Data Exposure**              | No sensitive data in console.log or server logs. No PII in URL parameters. Data export requires auth. Private notes and love languages respect privacy flags in all queries. No sensitive data in client-side React state that shouldn't be there. | A02   |

### How to Audit Each Category

For each category:

1. **Read every relevant file** — don't sample, be exhaustive
2. **Check positive cases** — verify the pattern IS applied where it should be
3. **Check negative cases** — verify the pattern is NOT violated anywhere
4. **Classify findings**: HIGH (exploitable vulnerability, missing auth/RLS), MEDIUM (defense-in-depth gap, missing rate limit), LOW (minor hardening opportunity)

### Files to Read by Category

- **Auth (1)**: All files matching `**/actions.ts`, `**/actions/*.ts`, `src/app/api/**/*.ts`, `src/middleware.ts`, `src/lib/auth.ts`
- **Input Validation (2)**: Same action files + `src/lib/validation.ts` + any Zod schema definitions
- **RLS (3)**: All files in `supabase/migrations/` — read every migration
- **Secrets (4)**: `src/lib/supabase/admin.ts`, `src/lib/email/resend.ts`, `src/app/api/cron/*/route.ts`, `src/app/api/email/*/route.ts`, and grep for `process.env`
- **Headers (5)**: `src/middleware.ts`, `src/lib/supabase/middleware.ts`, `src/lib/supabase/middleware-utils.ts`
- **Dependencies (6)**: `package.json`, `package-lock.json`, run `npm audit`
- **Rate Limiting (7)**: Grep for `createRateLimiter` or rate-limit patterns, check all API routes and server actions
- **Error Handling (8)**: All API routes and server actions — check catch blocks and error responses
- **CSRF/Session (9)**: `src/lib/supabase/middleware.ts`, Supabase client configs, auth callback route
- **Data Exposure (10)**: Grep for `console.log`, check all server actions for data leakage, check client components for sensitive state

## Phase 3: Fix

1. List ALL findings across audited categories
2. Classify by severity (HIGH, MEDIUM, LOW)
3. Fix all HIGH and MEDIUM findings
4. For enhancements (new rate limiting, audit logging): implement if straightforward (< 50 lines), defer if complex
5. For dependency vulnerabilities: run `npm audit fix` for non-breaking, flag breaking as deferred
6. **Never weaken existing security to fix something else**
7. Cap at ~12 files per iteration; defer the rest

## Phase 4: Validate

```bash
npm run lint:fix
npm run typecheck
npm run test
```

If any check fails, fix the issue and re-run. Max 3 fix attempts per check. If still failing, revert the problematic change and note it as deferred.

## Phase 5: Update Tracking

Append a new entry to `docs/plans/security-audit-tracking.md`:

```markdown
### Iteration N (YYYY-MM-DD)

**Categories Audited:** [list]
**Findings:** X (Y HIGH, Z MEDIUM)
**Fixed:** A
**Deferred:** B

#### Fixed

- [x] Description (category: X, severity: HIGH/MEDIUM)

#### Deferred

- [ ] Description (category: X, severity: Y, reason)

#### Categories Remaining

- [list of unaudited categories]
```

## Phase 6: Ship

**If issues were found and fixed:**

1. Stage specific changed files (do NOT use `git add -A` or `git add .`):
   ```bash
   git add <list of specific files>
   ```
2. Commit:
   ```bash
   git commit -m "security: fix findings from security audit iteration N"
   ```
3. Push:
   ```bash
   git push -u origin security-audit/iteration-<N>
   ```
4. Create PR:
   ```bash
   gh pr create --title "Security Audit: Iteration N" --body "Automated OWASP security audit. See docs/plans/security-audit-tracking.md for details."
   ```

**If NO issues found across all audited categories AND all 10 categories have been audited:** skip to Phase 8.

## Phase 7: CI & Merge

1. Note the PR number from the create output.
2. Poll CI status every 45 seconds:
   ```bash
   gh pr checks <number>
   ```
3. Report the status of each check between polls.
4. When all checks complete:
   - **All pass** → merge and clean up:
     ```bash
     gh pr merge <number> --squash --delete-branch
     git checkout main && git pull origin main
     ```
   - **Any fail** → read logs, fix, push, re-poll (max 3 fix attempts):
     ```bash
     gh run view <run-id> --log-failed
     # fix the issue
     git add <specific files> && git commit -m "fix: address CI failure in security audit iteration N"
     git push
     ```

Required CI checks (all must pass): Lint & Typecheck, Unit Tests, E2E Tests, Dead Code Detection.

## Phase 8: Signal

Completion requires BOTH conditions:

1. All 10 OWASP categories have been audited (check tracking file)
2. No HIGH or MEDIUM findings remain unfixed

**If both conditions met**, output exactly:

```
<promise>NO_ISSUES</promise>
```

**If either condition is NOT met**, exit normally. Ralph will re-invoke for the next iteration.

Only output this promise if you genuinely audited all categories and verified no actionable findings remain.
