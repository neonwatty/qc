---
name: gap-analysis
description: >
  One complete gap analysis iteration: compare the full-stack QC app against the
  client-side reference app (qc-app), fix discovered gaps, validate, PR, CI, merge.
  Use via Ralph Loop: /ralph-loop "/gap-analysis" --completion-promise "NO_GAPS_FOUND" --max-iterations 10
---

# Gap Analysis — Full Cycle

You are performing one complete gap analysis iteration. Report progress at each phase.

## Phase 1: Setup

1. Ensure you are on main with the latest code:

   ```bash
   git checkout main && git pull origin main
   ```

2. Read `docs/plans/gap-tracking.md` to find the last iteration number. Your iteration is N+1. If no iterations exist yet, you are iteration 1.

3. Create an iteration branch:

   ```bash
   git checkout -b gap-analysis/iteration-<N>
   ```

4. Clone or update the reference app:

   ```bash
   git clone https://github.com/neonwatty/qc-app /tmp/qc-app 2>/dev/null || git -C /tmp/qc-app pull origin main
   ```

5. Review which dimensions and files were already covered in prior iterations. Focus effort on uncovered ground.

## Phase 2: Systematic Comparison

Compare these six dimensions. For each, read the relevant source files in **both** repos. Use explorer agents in parallel to cover more ground.

1. **Pages & Routes** — Compare all pages in `/tmp/qc-app/src/app/` to `src/app/`. Missing pages, incomplete pages, layout differences.
2. **Components** — Compare component structure, props, variants, rendered output. Missing components, missing variants.
3. **Styling & Visual Design** — Compare Tailwind classes, colors, spacing, typography, responsive breakpoints, animations.
4. **Content & Copy** — Compare headings, labels, descriptions, button text, placeholders, error messages, empty states.
5. **UX Flows & Interactions** — Compare navigation, form behavior, loading states, transitions, modals.
6. **Assets & Media** — Compare icons, images, illustrations, SVGs.

### Exclusions

Flag these in the tracking file as "intentionally skipped" rather than fixing:

- Test/demo pages (`test-button`, `test-motion`, `test-skeletons`, `test-persistence`, `test-mobile-forms`, `test-session-settings`, `test-types`)
- Jest test files and test utilities (QC uses Vitest)
- Mock data patterns (QC has a real Supabase backend)

## Phase 3: Prioritize & Fix

1. List ALL gaps found across all dimensions
2. Classify: **HIGH** (missing feature, broken UX, major visual diff), **MEDIUM** (styling mismatch, missing copy), **LOW** (minor text, subtle spacing)
3. Fix all HIGH and MEDIUM gaps
4. Cap at ~12 files per iteration. If more need changes, fix the highest priority ones and defer the rest.
5. Adapt client-side patterns for the full-stack context:
   - Client components that fetch data → server components with `requireAuth()` + Supabase queries
   - Local state that should persist → wire to Supabase tables with couple-scoped RLS
   - Mock data → real queries scoped by `couple_id`
   - Client-side routing → Next.js App Router conventions

**Constraints**: Follow CLAUDE.md conventions. Respect server/client boundary. Do not modify database schema or migrations. Do not break existing tests.

## Phase 4: Validate

Run the same checks that CI and the pre-commit hook will run:

```bash
npm run lint:fix
npm run typecheck
npm run test
```

If any check fails, fix the issue and re-run. Max 3 fix attempts per check. If still failing after 3 attempts, revert the problematic change and note it as deferred.

## Phase 5: Update Tracking

Append a new entry to `docs/plans/gap-tracking.md`:

```markdown
### Iteration N (YYYY-MM-DD)

**Findings:** X
**Fixed:** Y
**Deferred:** Z
**Dimensions Covered:** [list which dimensions had gaps]

#### Fixed

- [x] Description (dimension: X, severity: HIGH/MEDIUM)

#### Deferred

- [ ] Description (reason)

#### Intentionally Skipped

- Description (reason)
```

## Phase 6: Ship

**If gaps were found and fixed:**

1. Stage specific changed files (do NOT use `git add -A` or `git add .`):
   ```bash
   git add <list of specific files>
   ```
2. Commit:
   ```bash
   git commit -m "fix: close gaps from gap analysis iteration N"
   ```
3. Push:
   ```bash
   git push -u origin gap-analysis/iteration-<N>
   ```
4. Create PR:
   ```bash
   gh pr create --title "Gap Analysis: Iteration N" --body "Automated gap analysis. See docs/plans/gap-tracking.md for details."
   ```

**If NO gaps were found across all six dimensions:** skip to Phase 8.

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
     git add <specific files> && git commit -m "fix: address CI failure in gap analysis iteration N"
     git push
     ```

Required CI checks (all must pass): Lint & Typecheck, Unit Tests, E2E Tests, Dead Code Detection.

## Phase 8: Signal

**If gaps were found and fixed:** exit normally. Ralph will re-invoke with the same prompt for the next iteration.

**If NO gaps were found across all six dimensions:** output exactly:

```
<promise>NO_GAPS_FOUND</promise>
```

Only output this promise if you genuinely compared all six dimensions and found nothing actionable. If coverage was incomplete, exit normally and let the next iteration continue.
