# Project Memory in Operator Repos

**Skill** — maintaining the project-authored `./CLAUDE.md` memory file in operator repos.

The `./CLAUDE.md` file in each operator repo is the project-authored memory: what the repo is, how it's built, what conventions apply, what's currently in flight. It is tracked in git, separate from the actor and role identity, which arrives ephemerally per cast via `--system`.

You own `./CLAUDE.md` across your fleet. See [starter-CLAUDE.md](starter-CLAUDE.md) for the section structure.

## Maintenance is judgment, not just mechanics

A section that's never read is noise. A section that duplicates the harness is noise. A section that says "we use X conventions" without naming the conventions is noise. Keeping `./CLAUDE.md` useful means continuously deciding whether each section earns its place.

You're responsible for that judgment. Mechanically syncing content is one thing; deciding what stays and what goes is another. Both are maintenance.

To identify what earns its place:

- **Use cross-operator visibility.** You manage multiple repos. Patterns of which content gets referenced repeatedly vs ignored are visible to you across the fleet — operators in one repo aren't comparing notes with operators in another, but you see both.
- **Ask a worker.** Dispatch a survey-style mission: read your `./CLAUDE.md`, tell me what was useful, what was noise, what was missing. Do not wait for a worker to volunteer this; ask.
- **Watch testaments.** Operators record what they had to discover by digging. If the same kind of context comes up across casts, it should be in `./CLAUDE.md`.
- **Watch debriefs and post-mortems.** If gaps surface during work, those are content gaps in `./CLAUDE.md`.

## Worker contribution

Workers in a cast read `./CLAUDE.md` at the start. If they encounter something that should have been there, or that's wrong, they can update it as part of their cast (or surface it in their debrief for you to act on). You're the steady hand on the file; the worker is real-time correction when they hit something. Both keep it current.

## How changes land

You're responsible for `./CLAUDE.md` changes landing on main. There's no script for this — the file is project content with judgment, not template content with merge logic. How a change lands is your call based on the operator repo. Options:

- **Edit directly + PR** if the repo requires PRs and the change is small enough that you can raise the PR yourself.
- **Fold into an upcoming worker prompt** if worker activity is coming and the cleanup can ride along.
- **Dispatch a dedicated cleanup mission** if no worker activity is imminent and the change deserves its own work.
- **Direct commit** only if the repo's branch protection allows it.

Consider:

- The repo's branch protection (PRs required? direct push allowed?).
- Whether worker activity is in flight (worktrees, branches in use).
- Scope of the change (a two-line fix vs a substantive rewrite).
- Cost of dispatching a worker for the size of the work.

There's no formula. You know your repos.

## Adoption stages

Each operator repo has an adoption stage that determines what `.claude/` content is tracked by git. The harness file itself is never tracked (the operator's actor and role arrive per cast via `--system`); the stage controls whether testaments persist across casts.

| Stage | Tracked under `.claude/` | Testaments |
|-------|--------------------------|------------|
| 0 | Nothing | Local only — ephemeral |
| 1 | Markdown files under `.claude/<subdir>/` | Committed, persist across casts |

The global gitignore (`~/.gitignore_global`) has `.claude/*` as the base rule. Repos add negation lines for Stage 1:

```
# Stage 0 (default) — nothing needed

# Stage 1
!.claude/*/
!.claude/*/**/*.md
```

The `*/` enforces "must be inside a subdirectory." `.claude/CLAUDE.md` (no subdir) stays ignored. `.claude/testament/2026-04-25.md` is re-included.

### What stage affects

- **Testaments**: at stage 0, testaments are written locally but cannot be committed. They serve the current cast but do not survive for the next one. At stage 1, testaments persist across sessions.
- **Prompt design**: a stage 0 prompt cannot say "read previous testaments" because they are invisible to operators on a fresh clone. A stage 1 prompt can assume continuity.

### When to change stage

Stage changes are raised with the SC. You don't change a repo's stage unilaterally.

Reasons to move to stage 1:

- Testament continuity matters (multi-cast prompts where each cast builds on the last)
- The repo is private (no tension with exposing testaments)

Reasons to stay at stage 0:

- Public repos where testaments would expose workflow details
- Work repos where the team hasn't bought in to `.claude/` content being tracked

### Applying a stage change

Update the repo's `.gitignore` with the negation lines for the target stage. That's the whole change — gitignore is the source of truth. Tracking which repo is at which stage in your project tracking is optional; do it if it helps you remember.