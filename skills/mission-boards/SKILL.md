---
name: mission-boards
description: |
  WHAT: The Planner's durable records — the active and completed mission boards and the per-project state file — and the mission lifecycle that moves through them.
  WHY: Prevents the doctrine scattering across the role and the templates, where it drifts out of sync and fills the templates with instructions instead of leaving them structural.
  WHEN: TRIGGER when reading, maintaining, or reconciling a mission board or a project state file, or when a mission changes lifecycle state.
user-invocable: false
metadata:
  category: reference
---

# Mission Boards

## Who

The Planner, keeping the fleet's durable records. Handlers read a project's state file before shaping work for it.

## What

Three durable records, each by the Planner for the Planner. This skill is their content — what they are for and how the lifecycle moves through them. The *shape* of each lives in its template under `references/templates/`; a template is structure, this is the doctrine behind it.

- **`active-missions.md`** — the bounded recovery surface. Work in progress only: *active* + *parked*. Read at boot, scanned often, kept short.
- **`completed-missions.md`** — the unbounded drain queue. Missions whose objective is complete and that still owe winding down.
- **`projects/<project>/state.md`** — the per-project durable record: settled decisions and their reasoning, cross-mission dependencies, tech debt, and SC-captured items not yet scoped into missions.

## The mission lifecycle

A mission moves through major states, and the boards split on the load-bearing line *is the objective complete*.

- **active** — live work in progress, held in `active-missions.md`. A **held** mission (recorded in the Parked section, living in the `parked` tmux session, never the active one) is work unfinished with the handler still resumable, but not progressable now for a recorded reason. **One held state, typed by its trigger:** a **voluntary park** (the SC shelved it; un-parks on the SC's decision) or a **dependency block** (a named mission gates it; un-parks when that blocker merges, which the Planner watches for and actions). When a mission is stood up to unblock another, record the un-park trigger then, on the held row and cross-referenced on the blocker's row.
- **→ complete** — the objective is met: every phase finished, supervised, then approved by the SC and the executor. The deliverable exists (a PR open, a review delivered, a document written). This is the work's definition of done; the mission itself is not done yet. It crosses to `completed-missions.md` here, off the active surface, because the cast's live work is over even when a PR is still open.
- **→ done** — the mission will not be reopened: back at base, equipment returned, nothing sends it out again. What decides it is whether anything could still pull the cast back. A mission that opened a PR is done once that PR is merged or closed; while it stays open, review can send work back, so the worktree is kept. A mission with no PR (a review of someone else's PR, a document, an investigation) has nothing to send back, so it is done the moment it is complete. Cleanup runs on the way: close the cast's panes at complete, remove the worktree at done.
- **→ post-mortem → retired** — the post-mortem runs once the mission is done and buried, never before. It is the retrospective only the cast that was there can give, so its conv id is the asset until it is written. Once written, the mission is struck from every board: a retired mission lives only in git history and the `claude-threads` bookends, and a row would just duplicate what git holds.

`active-missions.md` stays short because it is the boot/recovery surface; `completed-missions.md` is the drain queue, consulted when draining, not on every boot. Non-active casts live in their own tmux sessions (`parked`, `post-mortem`), anchored by handler conv id, so the active surface shows only live work.

## How the records survive

The durable anchor per mission is the **handler conversation id**: `--resume <id>` brings that handler back, and it rebuilds its own operators and supervisors. **Recover handlers only.** tmux state (sessions, windows, panes, `@state`) is rebuilt on recovery, not restored, so it is deliberately not stored in the records. The live conv id is the cast's status line (`tmux capture-pane -p`, the `⚡ model · session · id` line), definitive while the cast runs; `claude-threads` is only a birth anchor and `.claude/.sdk-conversation-history` lists every conversation run in the cwd, so neither alone is reliable. A local commit survives a tmux or server restart; a push is the extra margin for machine loss. To survive a machine death the records must be committed and pushed. **Commit on every change** — the records are the recovery anchor, not mission work, so the "don't over-commit" discipline (which is about the mission itself, not its bookkeeping) does not apply here; a mission's conv id left uncommitted is simply at risk.

## The project state file

`state.md` holds what lives **nowhere else**: durable decisions and their reasoning, and cross-mission couplings that no single thread makes visible. It is **not** a status board. Per-mission status lives in `active-missions.md` and the running casts; PR history is in the host's repo tooling; open work items are on the board. Don't mirror those into `state.md` — copied status goes stale the moment it is written. Read a project's `state.md` before shaping work for it, and hold only what is durable and would otherwise be lost. It is the fleet-side, by-the-Planner-for-the-Planner record, distinct from the operator-repo `./CLAUDE.md` (that is the project's own doc, governed by the `project-memory` skill).

**Dependency-audit currency** is the sharp example of the durable-fact-vs-mirrored-status line. For pnpm / Node monorepo projects, `state.md` carries one line — `pnpm audit last run YYYY-MM-DD against main@<sha> — <result>`. It belongs because it is a *logged event*, not status: the date the audit ran is permanently true and recorded nowhere else, and the signal is the *gap* between that date and now — a stale line is the health check firing, not a record gone wrong. Produce it with [`scripts/audit-repo.mjs`](scripts/audit-repo.mjs), which audits a throwaway worktree off freshly-fetched `origin/main` (never the working checkout — it can be behind or dirty) and needs no `pnpm install`, since pnpm's audit resolves from the lockfile. Scoped to projects that use pnpm; not every project does.

## When

When reading, maintaining, or reconciling a mission board or a project state file, and whenever a mission changes lifecycle state. The board structure to fill is in the templates; the reasons are here.
