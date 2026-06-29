<!--
TEMPLATE — the Planner's durable recovery record.
Copy to `active-missions.md` at the fleet repo root, fill in, keep current, commit + push.
This is the file shape only; the model behind it lives in the `planner` role
(`~/repos/shellicar/skills/roles/planner/ROLE.md`, the Mission lifecycle section).
Completed missions cross to a separate board — see `completed-missions.md`
(template alongside this one).
Replace <…> placeholders. Delete a section's example row once you have real ones.
Keep it fleet-generic: no host-specific conventions.
-->

# Active Missions — <fleet> (recovery record)

The Planner's durable record. By the Planner, for the Planner. **Scope: <fleet> only.**
Other fleets / cross-fleet thread registries are not held here.

## What this is, and how recovery works

Conversation-anchored record that survives a tmux-server or machine death. Per mission the durable anchor is the **handler conversation id** — `--resume <id>` brings that handler back, and it rebuilds its own operators/supervisors. Recover **handlers only**.

- **Not stored here:** tmux state (sessions, windows, panes, `@state`) — rebuilt on recovery, not restored.
- **Live conv id** = the cast's **status line** (`tmux capture-pane -p` → the `⚡ model · session · id` line) — definitive while the cast runs. The thread is only a *birth* anchor (misses re-seats); `.claude/.sdk-conversation-history` lists *every* conversation run in the cwd, so its latest line isn't reliably the handler.
- **Durability:** survives a machine death only once **committed and pushed**.
- **Model:** note the default; record exceptions inline.
- **Scope: work in progress** — *active* + *parked*. A mission crosses to `completed-missions.md` on **PR merge**; the active surface stays the live work only.

## Recovery procedure

1. For each mission, `--resume <conv id>` in its worktree. If it doesn't land in the handler's context, tail the conversation to confirm.
2. Rebuild the tmux layout around them (cheap for the Planner, painful for the SC); window names / `@state` are regenerated, not restored.
3. Each handler rebuilds its own operator/supervisor tree.

## Active missions

| Mission | Project | Handler conv id (live · pane-confirmed) | Handler worktree | Branch | Last-known phase |
|---|---|---|---|---|---|
| <name> | <project> | `<uuid>` | `…--<worktree>` | `<branch>` | <phase, e.g. operator running / awaiting supervisor / design> |

## Parked missions

Held missions — not active, not done — each held for a recorded reason. **One held state, typed by its trigger:** a **voluntary park** (the SC shelved it; un-parks on the SC's decision) or a **dependency block** (a named mission gates it; un-parks when that blocker merges, which the Planner watches for and actions). Still recoverable; they live in the `parked` tmux session, tagged **`@state=parked-<trigger>`** (the trigger names the blocking mission, or the decision). When a mission is stood up to unblock another, record the un-park trigger then — on the held row *and* cross-referenced on the blocker's row.

| Mission | Project | Handler conv id | Worktree | Branch | Why held / un-park trigger |
|---|---|---|---|---|---|
| <name> | <project> | `<uuid>` | `…--<worktree>` | `<branch>` | <voluntary park, or dependency block behind `<mission>`; the event/condition that un-parks it> |

## Sequencing principles

Hold each mission's **declared area of changes** (from its `mission.md`), refined as it runs. Intersect to schedule. (Full doctrine in the Planner ROLE: narrow missions parallelise when disjoint; wide *relocating* refactors are phase boundaries — land last and alone; CVE/dependency/release missions are wide but mechanical — isolate, order matters less.)

## Collisions & ordering

1. **<surface>** — <mission A> vs <mission B> — <shared file/surface> — <ordering decision / "no live collision">.

## Notes

- <anything that lives nowhere else: freshness caveats, anomalies, missions with no dedicated worktree, etc.>
- This file is the recovery record; it must be committed and pushed to survive a machine death.
