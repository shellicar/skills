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
- Run the pre-commit check after staging, before committing

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

If a pre-commit hook fails:

### Forbidden

- `--unsafe` or any biome unsafe fix flags
- `npx` / `pnpx`
- `git add .` / `git add -A`
- Manually editing files to pass hooks without permission
- `--filter` for running package scripts

### Fix sequence

1. Read hook config (`lefthook.yml`) and `package.json` scripts to find available fixers
2. Run fixers on changed files only (not the entire project)
3. Re-stage the fixed files
4. Create a new commit (do not amend)

#### Biome

```bash
pnpm biome check --diagnostic-level=error --write <file1> <file2> ...
```

#### ESLint

```bash
cd packages/<package-name>
pnpm eslint --fix <relative-file1> <relative-file2> ...
```

### If fixers cannot resolve everything

Check whether remaining issues are in files outside the changeset (pre-existing). If so, `--no-verify` is allowed but requires supervisor approval.

## Convention Detection

Run the detect-convention script to identify which convention applies:

```bash
detect-convention/scripts/detect-convention.sh
```

Returns JSON with `convention` and `default_branch`. Load the matching `*-conventions` skill for branch naming, PR format, and work item linking rules.
