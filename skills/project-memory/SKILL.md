---
name: project-memory
description: |
  WHAT: Maintaining the project-authored ./CLAUDE.md memory file in operator repos — what earns a place, how changes land.
  WHY: Stale or noisy content costs every cast that loads it. Keeping the file useful is judgment, not just mechanics, and the handler owns that judgment across its fleet.
  WHEN: Loaded by the handler actor, whenever an operator repo's ./CLAUDE.md is created or maintained.
user-invocable: false
metadata:
  category: standards
---

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
