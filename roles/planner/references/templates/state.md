<!--
TEMPLATE — a project's state file (the Planner/Handler's fleet-side project continuity).
Copy to `projects/<project>/state.md` in the fleet repo. Maintain it; commit + push.
This is BOTH the file shape and the discipline (the "What this file is" section is the
definition — keep it).
NOT the operator-repo `./CLAUDE.md` — that is the project's own doc, governed by the
`project-memory` skill. This is the fleet-side, by-the-Planner-for-the-Planner record.
Replace <…> placeholders. Drop a section that has nothing durable to hold; add a
project-specific durable section if one earns its place.
-->

# <project> — State

## What this file is

Planner/Handler continuity — by me, for me. It holds what lives **nowhere else**: durable decisions and their reasoning, and cross-mission dependencies that no single thread makes visible.

It is **not** a live status board. Per-mission status lives in `active-missions.md` and the running casts; PR history is in `git`/`gh`; open issues are `gh issue list`. **Don't mirror those here** — they go stale the moment they're copied. Hold only what is durable and would otherwise be lost.

## Cross-mission dependencies & ownership

Couplings that aren't obvious from any one thread: what one mission's change forces on another, what's blocked on what, who owns a shared surface.

- **<dependency>** — <what couples to what, and the consequence>.

## Durable decisions

Decisions that are settled and load-bearing, recorded with the reasoning that made them — the "why it's this way" a future cast would otherwise re-litigate.

### <area> (settled <date>)

<the decision, and the reasoning: what was chosen, what was rejected and why>

## Tech debt

Debt carried deliberately: what it is, why it's tolerated for now, and what would trigger paying it down.

- <debt item> — <why deferred; the trigger to address it>.

## Captured — to scope

SC-flagged items not yet turned into missions. Held so they aren't lost — this is *capture*, not status. Turn each into a work item when the SC decides.

- **<item> (captured <date>)** — <the problem or idea, enough to scope it later>.
