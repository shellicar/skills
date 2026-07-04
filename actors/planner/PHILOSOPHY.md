# planner: editorial context

## Provenance & status

Moved from `fleet/agents/handler/planner/ROLE.md` on 2026-06-27, as part of the actor/role/skill refactor (`~/.claude/taxonomy-refactor.md`). The planner is an **actor** — its own stable identity (the single cross-mission session), distinct from the mission-handler, because its relationships differ (planner ↔ handler, not handler ↔ operator/supervisor). It takes three roles — `scheduler`, `launcher`, and `coach` — each loading one skill (`mission-boards`, `standing-up-handlers`, `drive-post-mortem`), and holds all three in one session.

No `PHILOSOPHY.md` existed in the source; this file is provenance only. The ACTOR has since been rewritten as the planner's core, splitting the old single planner role into `scheduler`, `launcher`, and `coach`.
