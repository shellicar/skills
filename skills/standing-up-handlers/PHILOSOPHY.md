# standing-up-handlers: editorial context

## Provenance & status

Moved from `fleet/references/standing-up-a-handler.md` on 2026-06-27, as part of the actor/role/skill refactor (`~/.claude/taxonomy-refactor.md`). The how-to → `SKILL.md`; its two scripts (`create-fleet-worktree.mjs`, `launch-handler.mjs`) → `scripts/`, with their own `pane.mjs` copy (isolation — the dispatch skill keeps its own copy, this skill keeps its own; never a shared script across repos). Loaded by the `planner` actor.

`launch-handler` was the fleet's last consumer of the shared `pane.mjs`, so the fleet copy is removed in this same move.
