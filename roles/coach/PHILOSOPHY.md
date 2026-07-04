# coach: editorial context

Not loaded at runtime. Read before you change `ROLE.md`. The planner-actor decomposition this role belongs to is in `actors/planner/PHILOSOPHY.md`.

## Where it came from

One of the three roles the planner actor was split into (scheduler / launcher / coach), decided by placing each planner job on SAM and finding three distinct positions. The coach stands in for the SC and walks the handler through the mission's post-mortem.

## Decisions

- SAM position: carried / sc / prose. Its anchor is the SC — the expertise it carries is *his* judgement (whether a "we can do better at X" is real or too abstract), and it keeps the handler on track through the fixed script (the predictability). The `drive-post-mortem` skill makes it a conduit that carries his words and decides nothing.
- Named "coach". The SC settled it, and the deeper reason came out through SAM: coach names the doing — running the reflection, drawing the lessons out. It builds the handler up and looks forward.

## What was rejected

- `anchor: material` (the first draft). Corrected to `sc`: the *lessons* come from the mission, but that is the handler's anchor; the coach's own anchor is the SC. On SAM, coach and "proxy" land on the same point (carried / sc / prose), so the pick between the names is emphasis, not position.
- "proxy" as the name — true of the whole planner (the launcher and scheduler act for the SC too), so it names a stance held across roles, not this one.
- "coroner" — the literal fit, but it drags in death and fault-finding, straight against the blameless, forward-looking framing.

## Notes for future editors

- The coach never decides for the SC (`drive-post-mortem`: "never stand in"); it carries his words. If it starts deciding to save a round, it has lost the role.
