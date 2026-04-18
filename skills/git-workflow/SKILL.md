---
name: git-workflow
description: |
  WHAT: Reference for commit messages, push mechanics, and branch conventions.
  WHY: Consistent git history across all casts.
  WHEN: Consult when committing or pushing.
metadata:
  category: reference
---

# Git Workflow

Reference for how commits and pushes should look. Not a step-by-step workflow. Your prompt and cast phases handle orchestration.

## Commit Messages

- Concise, single line, imperative mood ("Add feature" not "Added feature")
- No period at end
- Under 50 characters (hard limit: 72)
- No prefixes: no `feat:`, `fix:`, `chore:`, or any Conventional Commits pattern
- Detail belongs in PRs, not commits

Load the `writing-style` skill for tone guidance.

## Staging

- Always `git add <file>` with explicit paths
- Never `git add .`, `git add -A`, `git add *`
- Run the pre-commit check after staging to verify what's staged

## Pushing

For new branches (no upstream):

```bash
git push -u origin <branch-name>
```

For existing branches:

```bash
git push
```

## Pre-commit Hook Failures

If a pre-commit hook fails, stop and report the failure. If your role handles linting, fix the issue and create a new commit (do not amend the failed one). If not, report the failure to the supervisor.

## Convention Detection

Run the detect-convention script to identify which convention applies:

```bash
./detect-convention/scripts/detect-convention.sh
```

Returns JSON with `convention` and `default_branch`. Load the matching `*-conventions` skill for branch naming, PR format, and work item linking rules.
