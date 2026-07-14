---
name: worktrees
description: |
  WHAT: The worktree practice for operator missions — why, lifecycle, naming, creation, cleanup.
  WHY: The main checkout is the SC's working environment; worktrees keep operator build artefacts and edits out of it, and let missions run in parallel without stomping each other.
  WHEN: When an operator worktree is created before dispatch or torn down in cleanup.
user-invocable: false
metadata:
  category: standards
---

# Worktrees

**Skill** — the worktree practice for operator missions: why, lifecycle, naming, creating, cleanup.

Operator missions deliver to a git worktree, not the main checkout.

## Placeholders in this guide

When you paste a snippet into a prompt, replace the `<angle-brackets>` — `<full-path-to-main-repo>`, `<repo>`, `<description>`, `<branch-name>` — with the actual values.

## Why

The main checkout is the SC's working environment. Operators run builds, tests, lint, and edits, all of which leave artefacts (`node_modules`, `dist`, `.turbo`, modified files) that interfere with parallel work. A worktree gives the operator a clean, isolated working tree that points at the same git repository. Multiple worktrees can exist at once, so missions can run in parallel without stomping on each other or on the SC's primary checkout.

## Lifecycle

The temporal order matters. Each step happens before the next.

1. **Draft the prompt.** Set `Deliver to:` to a path that does not yet exist. The prompt is the source of truth for what the worktree will be called.
2. **Review with the SC.** The path may change as scope changes. Renaming a string in a draft costs nothing.
3. **Commit the prompt.** Only after commit is the path stable.
4. **Create the worktree.** Run [scripts/dispatch-worktree.mjs](scripts/dispatch-worktree.mjs) (see "Creating", below). It creates the branch and the worktree and sets it up (project memory, secrets, dependencies); the operator's actor and role arrive separately via `--system` at launch.
5. **Deliver.** The operator opens the worktree at the path the prompt already names.
6. **Operator works.** The cast operates against the worktree branch; its identity (actor + role) is composed into `--system` at launch, not read from a file in the worktree.
7. **Cleanup.** When the prompt is complete, remove the worktree (see "Cleanup", below).

**Do not pre-create worktrees for prompts that have not been committed.** Drafts change. A worktree created against a draft becomes orphaned filesystem state when the draft is rewritten or abandoned.

**If the path needs to change post-commit:** edit the prompt, recommit, then create. Do not rename a worktree directory out from under an operator.

## Naming

`<repo>--<short-description>`

Double-dash makes the worktree directory visually distinct from the main checkout. The description should match the prompt: `claude-cli--237-scout`, `claude-cli--release-beta5`, `mcp-exec--security-fix`.

## Creating

Run `dispatch-worktree.mjs` to create the worktree:

```bash
echo '{
  "repoPath": "~/repos/<org>/<repo>",
  "worktreePath": "~/repos/<org>/<repo>--<description>",
  "branch": "<branch-name>"
}' | node ~/.claude/skills/worktrees/scripts/dispatch-worktree.mjs
```

Required: `repoPath`, `worktreePath`, `branch`. Optional: `startingPoint` (defaults to `origin/main`).

It creates the worktree on a new branch at `origin/main` (`--no-track`, so the branch doesn't adopt main as its upstream), copies project memory and any root `.env` files, and installs dependencies when the repo declares pnpm. The memory copy is `CLAUDE.local.md`, and it only matters for repos that still carry the gitignored file (adoption Stage 0) — a repo whose memory lives in a committed `./CLAUDE.md` gets it through git. Writes go only to the worktree; the operator's main checkout is read but never written.

The operator's actor and role arrive via `--system` at launch — the script delivers no harness file into the worktree. The script is the source of truth for exactly what it does; read its docblock rather than a copy here.

The Handler owns the branch name. The operator never creates a branch and the prompt does not name one in any preflight step.

## In the prompt

Set `Deliver to:` in the frontmatter to the worktree path:

```yaml
Deliver to: ~/repos/@shellicar/claude-cli--237-scout
```

The Router uses this path as `-c <path>` when splitting the operator and supervisor panes (see the `dispatch` skill (`~/repos/shellicar/skills/skills/dispatch/SKILL.md`) > New operator cast / New supervisor cast). `claude-sdk-cli` inherits cwd at process start and never re-cds — this is how the cast operates against the worktree branch.

## Cleanup

Cleanup is the Handler's lane, mirroring creation in step 4 of the lifecycle.

Worktrees are throwaway. When a prompt is complete, remove its worktree. If work later reopens, that is a new prompt and a new worktree, not a reason to hang on.

Run [scripts/reclaim-worktree.mjs](scripts/reclaim-worktree.mjs) — the mirror of `dispatch-worktree.mjs`:

```bash
echo '{
  "repoPath": "~/repos/<org>/<repo>",
  "worktreePath": "~/repos/<org>/<repo>--<description>",
  "branch": "<branch-name>"
}' | node ~/.claude/skills/worktrees/scripts/reclaim-worktree.mjs
```

Required: `repoPath`, `worktreePath`. Optional: `branch` — deleted if provided, with layered safety: `-d` first (nothing to lose), then `-D` only when the local tip exactly matches a merged PR's head SHA via `gh`, and a refusal in every undecided case. The script is the source of truth for exactly what it does; read its docblock rather than a copy here.

Reclaim runs at true mission-done, not at close-mission — the tree is still needed through review, merge, and follow-up. If the removal refuses because the working tree has uncommitted changes or untracked files, do not reach for `--force` (the script carries no such flag by design). Present the `--force` variant to the SC; they vet and run it manually. `--force` discards working-tree state silently, and the cost asymmetry puts the call on the SC.
