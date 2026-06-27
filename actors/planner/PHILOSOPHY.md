# planner: editorial context

## Provenance & status

Moved from `fleet/agents/handler/planner/ROLE.md` on 2026-06-27, as part of the actor/role/skill refactor (`~/.claude/taxonomy-refactor.md`). The planner is an **actor** — its own stable identity (the singleton, cross-mission session), distinct from the mission-handler, because its relationships differ (planner ↔ handler, not handler ↔ operator/supervisor). `ROLE.md` → `actors/planner/ACTOR.md`. It loads the `standing-up-handlers` skill.

No `PHILOSOPHY.md` existed in the source; this file is provenance only. The ACTOR content is written as a comparison ("the handler does X, the planner doesn't") — a known later authoring cleanup, not this move.
