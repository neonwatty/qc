---
name: test-coverage
description: >
  One complete test coverage iteration: find untested business logic files, write tests,
  validate, PR, CI, merge. Prioritizes server actions, lib, contexts, hooks, middleware,
  email templates. Target: 80% coverage across all metrics.
  Use via Ralph Loop: /ralph-loop "/test-coverage" --completion-promise "FULL_COVERAGE" --max-iterations 10
---

# Test Coverage — Full Cycle

You are performing one complete test coverage iteration. Report progress at each phase.

## Phase 1: Setup

1. Ensure you are on main with the latest code:

   ```bash
   git checkout main && git pull origin main
   ```

2. Read `docs/plans/test-coverage-tracking.md` to find the last iteration number. Your iteration is N+1. If no iterations exist yet, you are iteration 1.

3. Create an iteration branch:

   ```bash
   git checkout -b test-coverage/iteration-<N>
   ```

4. Review which files were already covered in prior iterations. Focus on uncovered ground.

## Phase 2: Find Untested Files

1. Glob for all `.ts` and `.tsx` source files in `src/` (excluding test files, type-only files, and test infrastructure).

2. For each source file, check if an adjacent `.test.ts` or `.test.tsx` file exists.

3. Classify untested files by priority:

   | Priority | Target                                                                          | Rationale                                     |
   | -------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
   | P0       | Server actions (`**/actions.ts`, `**/actions/*.ts`)                             | Business-critical mutations, auth, validation |
   | P1       | `lib/` utilities (excluding `lib/supabase/client.ts`, `lib/supabase/server.ts`) | Shared logic used everywhere                  |
   | P2       | Contexts (`contexts/*.tsx`)                                                     | State management, complex logic               |
   | P3       | Hooks (`hooks/*.ts`)                                                            | Reusable behavior with edge cases             |
   | P4       | Middleware (`middleware.ts`, `lib/supabase/middleware.ts`)                      | Auth flow, security headers                   |
   | P5       | Email templates (`lib/email/templates/*.tsx`)                                   | Render correctness                            |
   | P6       | Page routes (`app/**/{page,loading,error}.tsx`)                                 | Only if they contain meaningful logic         |
   | Skip     | UI primitives (`ui/button.tsx`, `ui/input.tsx`, etc.)                           | Thin Radix wrappers                           |
   | Skip     | Type-only files (`types/*.ts`)                                                  | No runtime behavior                           |
   | Skip     | Test infrastructure (`test/mocks/*`, `test/setup.ts`)                           | Not testable targets                          |
   | Skip     | Index barrel files (`**/index.ts`)                                              | Re-exports only                               |

4. Cross-reference against the tracking file to skip files already covered in prior iterations.

5. Pick the next 3-5 untested files by priority order (lowest priority number first).

## Phase 3: Write Tests

For each selected file, write a test file following existing project patterns:

**Imports:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
```

**Mocking Supabase** (for server actions and lib files):

```typescript
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
```

**Mocking Next.js** (for middleware and route handlers):

```typescript
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}))
```

**Test quality rules:**

- AAA pattern (Arrange, Act, Assert) in every test
- Reset mocks in `beforeEach`
- Happy path + at least one error case per exported function
- For server actions: test auth rejection, validation rejection, successful mutation
- For contexts: test state transitions and provider rendering
- Test behavior, not implementation details

**File placement:** test file adjacent to source file:

- `src/lib/auth.ts` → `src/lib/auth.test.ts`
- `src/components/Foo.tsx` → `src/components/Foo.test.tsx`

## Phase 4: Validate

Run validation:

```bash
npm run lint:fix
npm run typecheck
npm run test
```

Then check coverage:

```bash
npm run test:coverage
```

Parse the coverage summary output for the "All files" line. Record the four metrics: lines, branches, functions, statements.

If any check fails, fix the issue and re-run. Max 3 fix attempts per check. If still failing, revert the problematic test file and note it as deferred.

## Phase 5: Update Tracking

Append a new entry to `docs/plans/test-coverage-tracking.md`:

```markdown
### Iteration N (YYYY-MM-DD)

**Files Tested:** X
**Coverage:** lines XX%, branches XX%, functions XX%, statements XX%
**Remaining P0-P5 Untested:** Y files

#### Tests Written

- [x] `path/to/file.ts` (priority: PX, Y tests)

#### Deferred

- [ ] `path/to/file.ts` (reason)
```

## Phase 6: Ship

**If tests were written:**

1. Stage specific changed files (do NOT use `git add -A` or `git add .`):
   ```bash
   git add <list of specific test files and any modified source files>
   ```
2. Commit:
   ```bash
   git commit -m "test: add tests from test coverage iteration N"
   ```
3. Push:
   ```bash
   git push -u origin test-coverage/iteration-<N>
   ```
4. Create PR:
   ```bash
   gh pr create --title "Test Coverage: Iteration N" --body "Automated test coverage improvement. See docs/plans/test-coverage-tracking.md for details."
   ```

**If NO untested P0-P5 files remain AND coverage >= 80%:** skip to Phase 8.

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
     git add <specific files> && git commit -m "fix: address CI failure in test coverage iteration N"
     git push
     ```

Required CI checks (all must pass): Lint & Typecheck, Unit Tests, E2E Tests, Dead Code Detection.

## Phase 8: Signal

Completion requires BOTH conditions:

1. All P0-P5 priority files have tests (no untested business logic files remain)
2. `npm run test:coverage` reports >= 80% across lines, branches, functions, AND statements

**If both conditions met**, output exactly:

```
<promise>FULL_COVERAGE</promise>
```

**If either condition is NOT met**, exit normally. Ralph will re-invoke for the next iteration.

Only output this promise if you genuinely verified both conditions. Do not estimate or assume coverage numbers.
