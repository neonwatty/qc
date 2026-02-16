# Skill: monitor-ci

## Description

Watch GitHub Actions CI runs using the `gh` CLI. Report status, identify failures, and suggest fixes for common errors.

## Instructions

1. Check the current CI run status:

```bash
gh run list --limit 5
```

2. If there is an active or recent failed run, get details:

```bash
gh run view <run-id>
```

3. For failed jobs, fetch the logs:

```bash
gh run view <run-id> --log-failed
```

4. Analyze failures and categorize:

   **Common failure patterns and fixes:**

   | Pattern | Cause | Fix |
   |---------|-------|-----|
   | `npm ci` fails | Lock file mismatch | Run `npm install` and commit `package-lock.json` |
   | ESLint errors | Code style violations | Run `npx eslint --fix .` |
   | Type errors | TypeScript strictness | Fix the reported type issues |
   | Test failures | Broken tests or logic | Check test output for assertion failures |
   | Build failures | Import/export issues | Check for missing modules or circular deps |
   | Playwright failures | E2E test flakes | Check screenshots, retry flaky tests |
   | Supabase start fails | Port conflicts | Check if local Supabase is running |
   | OOM errors | Memory limits | Optimize build or increase Node memory |

5. Output format:

```
## CI Status Report

### Run #456 (feature/add-auth)
- Status: FAILED
- Duration: 3m 42s
- Triggered by: push

### Failed Jobs
1. unit-tests
   - Error: Test suite failed - 2 tests failing
   - File: src/lib/auth.test.ts
   - Details: Expected 'authenticated' but received 'unauthenticated'
   - Fix: Update mock to return valid session in auth tests

### Passing Jobs
- lint-and-typecheck: PASSED (1m 12s)
- knip: PASSED (0m 34s)
```

6. If all runs are passing, report the healthy status and latest successful deployment.
