# Skill: ship

## Description

Run the full quality pipeline and ship the current branch. If all checks pass and on a feature branch, create a PR. If on main, report deployment status.

## Instructions

1. Run the quality pipeline in order (stop on first failure):

```bash
# Lint
npx eslint .

# Type check
npx tsc --noEmit

# Unit tests
npx vitest run

# Build
npx next build
```

2. If any step fails:
   - Report the specific failure with error output
   - Suggest fixes for common issues
   - Do not proceed to shipping

3. If all checks pass, determine the current branch:

```bash
git branch --show-current
```

4. **If on a feature branch:**
   - Ensure all changes are committed
   - Push the branch to origin
   - Create a pull request using `gh pr create`:
     - Title: derive from branch name or recent commits
     - Body: summarize changes from commit log
     - Set appropriate labels if available
   - Report the PR URL

5. **If on main:**
   - Check Vercel deployment status:
     ```bash
     npx vercel ls --limit 1
     ```
   - Report the latest deployment URL and status
   - Warn if there are uncommitted changes on main

6. Output format:

```
## Ship Report

### Quality Checks
- Lint: PASSED
- Typecheck: PASSED
- Tests: PASSED (42 tests, 100% pass rate)
- Build: PASSED

### Shipped
- Branch: feature/add-projects
- PR: https://github.com/org/repo/pull/123
- Status: Ready for review
```
