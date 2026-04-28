---
name: preflight
description: |
  WHAT: Verifies the working environment at the start of a cast: identity, remote, clean tree, branch divergence.
  WHY: Operating on wrong assumptions from the first step wastes the entire cast.
  WHEN: TRIGGER at the start of any cast that will modify the repo.
  DO NOT TRIGGER mid-cast or before read-only operations.
metadata:
  category: workflow
---

# Preflight

Run once at the start of your cast. Confirms the environment matches expectations before you start work.

## Usage

```bash
# Verify current state
~/.claude/skills/preflight/scripts/preflight.sh

# Create a branch and verify
~/.claude/skills/preflight/scripts/preflight.sh --branch feature/my-work
```

On success: JSON environment report on stdout. On failure: error message on stderr, non-zero exit.

## What it checks (hard failures)

These cause the script to exit with an error. Do not proceed.

- Not in a git repo
- Git identity not configured
- Remote origin not reachable
- Fetch failed
- Branch creation failed (if `--branch` was requested)

## What it reports (environment context)

The JSON output gives you a complete picture of the environment:

- **branch**: current branch name
- **branch_action**: what happened (`none`, `already_on_branch`, `created`)
- **default_branch**: the repo's default branch (e.g. `main`)
- **default_divergence**: how far the local default branch is behind origin (a non-zero `behind` means local main is stale)
- **convention**: detected convention name (load the matching `*-conventions` skill)
- **identity**: git name and email
- **worktree**: `true` if the current operation is in a linked git worktree, `false` if in the main worktree. By the SC's convention, a linked worktree means Claude is working in isolation and `co-working` is not loaded; the main worktree is the default co-working condition. The SC overrides explicitly when the default is wrong.
- **working_tree**: staged, unstaged, and untracked files
- **recent_log**: last 5 commits for context

## After preflight

You own the environment from this point forward. There is no need to re-verify state before each git operation. The only verification before a commit is the pre-commit check (see `pre-commit` skill).
