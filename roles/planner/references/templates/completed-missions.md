<!--
TEMPLATE — the Planner's post-completion record.
Copy to `completed-missions.md` at the fleet repo root, fill in, keep current, commit + push.
Holds missions whose work is COMPLETE (PR merged) but still owe winding down.
This is the file shape only; the model behind it lives in the `planner` role
(`~/repos/shellicar/skills/roles/planner/ROLE.md`, the Mission lifecycle section).
Replace <…> placeholders. Delete the example row once you have real ones.
Keep it fleet-generic: no host-specific conventions.
-->

# Completed Missions — <fleet> (post-completion record)

The Planner's record of missions whose work is **complete** — PR merged, mission declared done — that still owe winding down. By the Planner, for the Planner. **Scope: <fleet> only.**

## What this is

Merged missions winding down: **cleanup → post-mortem**, then **retired** (struck from every board entirely — a retired mission lives only in git history and the `claude-threads` bookends). Full states/transitions: the Planner ROLE's Mission lifecycle.

- **The handler conversation id is the asset** — a post-mortem can only come from the cast that was there, so its conv id is **non-regenerable**; preserve it until the retro is done.
- **Unbounded, off the planning surface** — this grows as missions deliver and drains slowly, so it lives apart from `active-missions.md` (which stays short). Consulted when draining, not on every boot.
- **Durability:** survives a machine death only once **committed and pushed**.

## Winding down — the phases

Two phases after completion, in order: **cleanup** (mechanical winding-down — worktree and PR housekeeping) then **post-mortem** (the retrospective owed to the cast that ran it). The `Phase` column tracks where each sits; append **wip** when the current phase is in progress. Drain stale-first (oldest merge date). The casts live in the `post-mortem` tmux session, tagged `@state=post-mortem-<PR>-<date>`.

| Mission | Project | PR · merged | Handler conv id (live · pane-confirmed) | Handler worktree | Branch | Phase |
|---|---|---|---|---|---|---|
| <name> | <project> | #<n> · <date> | `<uuid>` | `…--<worktree>` | `<branch>` | cleanup / post-mortem |

## Notes

- <anything that lives nowhere else: approximate merge dates to re-confirm from `gh`, conv-id re-seats, branch pivots where the delivery branch differs from the handler worktree branch (the Branch column keeps the handler/recovery branch, the PR column is the delivery), missions with no dedicated worktree, etc.>
