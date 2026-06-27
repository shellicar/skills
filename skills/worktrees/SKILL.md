# Worktrees

**Skill** — the worktree practice for operator missions: why, lifecycle, naming, creating, cleanup.

Operator missions deliver to a git worktree, not the main checkout.

## Placeholders in this guide

Two kinds of placeholder appear in the snippets below. They behave differently:

- `<angle-brackets>` are **Handler substitutions**. When you paste the snippet into a prompt, replace `<full-path-to-main-repo>`, `<repo>`, `<description>`, `<branch-name>` with the actual values.
- `YYYY-MM-DD` is **literal text**. Leave it as written. The operator's harness teaches them how to fill it (from `date '+%Y-%m-%d'`); the Handler does not substitute it.

The distinction matters most in the testament location snippets below. Substituting the date when you write the prompt encodes a specific day into a prompt that may be dispatched later. The placeholder belongs to the operator.

## Why

The main checkout is the SC's working environment. Operators run builds, tests, lint, and edits, all of which leave artefacts (`node_modules`, `dist`, `.turbo`, modified files) that interfere with parallel work. A worktree gives the operator a clean, isolated working tree that points at the same git repository. Multiple worktrees can exist at once, so missions can run in parallel without stomping on each other or on the SC's primary checkout.

## Lifecycle

The temporal order matters. Each step happens before the next.

1. **Draft the prompt.** Set `Deliver to:` to a path that does not yet exist. The prompt is the source of truth for what the worktree will be called.
2. **Review with the SC.** The path may change as scope changes. Renaming a string in a draft costs nothing.
3. **Commit the prompt.** Only after commit is the path stable.
4. **Create the worktree.** Run [scripts/dispatch-worktree.mjs](../scripts/dispatch-worktree.mjs) (see "Creating", below). It syncs the harness, creates the branch, and copies `.claude/` together — they are one concern, not multiple.
5. **Deliver.** The operator opens the worktree at the path the prompt already names.
6. **Operator works.** The harness is a snapshot from create-time. If the main repo's harness is updated mid-mission, that is fine; the worktree's snapshot serves the cast.
7. **Cleanup.** When the prompt is complete, remove the worktree (see "Cleanup", below).

**Do not pre-create worktrees for prompts that have not been committed.** Drafts change. A worktree created against a draft becomes orphaned filesystem state when the draft is rewritten or abandoned.

**If the path needs to change post-commit:** edit the prompt, recommit, then create. Do not rename a worktree directory out from under an operator.

## Naming

`<repo>--<short-description>`

Double-dash makes the worktree directory visually distinct from the main checkout. The description should match the prompt: `claude-cli--237-scout`, `claude-cli--release-beta5`, `mcp-exec--security-fix`.

## Creating

Run `dispatch-worktree.mjs` from the Handler repo to create the worktree:

```bash
echo '{
  "repoPath": "~/repos/<org>/<repo>",
  "worktreePath": "~/repos/<org>/<repo>--<description>",
  "branch": "<branch-name>"
}' | node scripts/dispatch-worktree.mjs
```

Required: `repoPath`, `worktreePath`, `branch`. Optional: `startingPoint` (defaults to `origin/main`).

It creates the worktree on a new branch at `origin/main` (`--no-track`, so the branch doesn't adopt main as its upstream), copies project memory and any root `.env` files, and installs dependencies when the repo declares pnpm. Writes go only to the worktree; the operator's main checkout is read but never written.

The script is the source of truth for exactly what it does — read its docblock rather than a copy here. (The operator's actor and role now arrive via `--system` at launch, not a harness file, so the script no longer delivers one.)

## In the prompt

Set `Deliver to:` in the frontmatter to the worktree path:

```yaml
Deliver to: ~/repos/@shellicar/claude-cli--237-scout
```

The Router uses this path as `-c <path>` when splitting the operator and supervisor panes (see the `dispatch` skill (`~/repos/shellicar/skills/skills/dispatch/SKILL.md`) > New operator cast / New supervisor cast). `claude-sdk-cli` inherits cwd at process start and never re-cds — this is how the cast loads the worktree's `.claude/CLAUDE.md` harness and operates against the worktree branch.

## Testament location

The scaffold script resolves the testament line automatically — do not pick manually. It probes the target repo with `git check-ignore -q .claude/testament/_sentinel_.md`:

- **Not ignored (tracked, exit 1)** → `Write your testament.` — the short form. The harness writes to the worktree's `.claude/testament/` and git preserves it, because the file is tracked in the repo.
- **Ignored (exit 0)** → `Write your testament to \`<baseRepo>/.claude/testament/YYYY-MM-DD.md\`.` — the full-path form, redirecting to the main checkout so the testament survives when the worktree is removed.

The scaffold substitutes the resolved line into every phase block. If you are writing a phase by hand (not via the scaffold), run the same probe to determine which form applies.

## Cleanup

Cleanup is the Handler's lane, mirroring creation in step 4 of the lifecycle.

Worktrees are throwaway. When a prompt is complete, remove its worktree. If work later reopens, that is a new prompt and a new worktree, not a reason to hang on.

```bash
git worktree remove ../<repo>--<description>
```

If the remove refuses because the working tree has uncommitted changes or untracked files, do not run `--force`. Present the `--force` variant to the SC; they vet and run it manually. `--force` discards working-tree state silently, and the cost asymmetry puts the call on the SC.
