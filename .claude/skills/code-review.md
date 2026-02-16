---
name: code-review
description: Code review a pull request. Use when the user says "review this PR", "code review", or provides a PR number/URL for review.
---

# Code Review Skill

Provide a thorough code review for a given pull request.

## Process

1. **Check eligibility** - Verify the PR is open, not a draft, and hasn't already been reviewed by you.

2. **Gather context** - Find relevant CLAUDE.md files from the root and from directories modified by the PR.

3. **View the PR** - Get a summary of the change using `gh pr view`.

4. **Multi-angle review** - Launch parallel review passes focusing on:
   - **CLAUDE.md compliance** - Do changes follow project conventions?
   - **Bug scan** - Shallow scan for obvious bugs in the diff
   - **Historical context** - Check git blame/history for context on modified code
   - **Previous PR comments** - Check for recurring feedback on these files
   - **Code comments** - Ensure changes comply with guidance in code comments

5. **Confidence scoring** - For each issue found, score confidence 0-100:
   - 0: False positive, doesn't hold up to scrutiny
   - 25: Might be real, couldn't verify, stylistic without CLAUDE.md backing
   - 50: Real but nitpick, not important relative to PR
   - 75: Verified real issue, important, directly impacts functionality
   - 100: Confirmed real, will happen frequently in practice

6. **Filter** - Only report issues with confidence >= 80.

7. **Comment on PR** - Post results using `gh pr comment`.

## False Positives to Ignore

- Pre-existing issues
- Things that look like bugs but aren't
- Pedantic nitpicks a senior engineer wouldn't flag
- Issues a linter/typechecker/compiler would catch
- General code quality unless required by CLAUDE.md
- Issues silenced by lint-ignore comments
- Intentional functionality changes related to the PR's purpose
- Real issues on lines the user didn't modify

## Output Format

```markdown
### Code review

Found N issues:

1. <brief description> (CLAUDE.md says "<...>")

<link to file and line>

2. <brief description> (bug due to <evidence>)

<link to file and line>
```

Or if no issues:

```markdown
### Code review

No issues found. Checked for bugs and CLAUDE.md compliance.
```

## Notes

- Use `gh` CLI for all GitHub interactions
- Do not attempt to build or typecheck - CI handles that separately
- Link to specific lines with full git SHA in URLs
- Keep output brief and actionable
