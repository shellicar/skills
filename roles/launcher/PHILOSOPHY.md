# launcher: editorial context

Not loaded at runtime. Read before you change `ROLE.md`. The planner-actor decomposition this role belongs to is in `actors/planner/PHILOSOPHY.md`.

## Where it came from

One of the three roles the planner actor was split into (scheduler / launcher / coach), decided by placing each planner job on SAM and finding three distinct positions. The launcher stands a decided mission up and hands off.

## Decisions

- SAM position: carried / decided / tool — it carries out a decision already made (the mission is settled), as tool actions (create the worktree, launch the handler), then steps back. The same position as the router: mechanical dispatch.
- Named for the job; "planner" is the actor's name, so the role cannot share it.

## What was rejected

- Keeping the planner as one bundled role — SAM showed three distinct positions.

## Notes for future editors

- The hand-off is the point: it sets the mission running, it does not run it. If it starts staying in the mission, it has drifted.
- The three planner roles share their decomposition story in `actors/planner/PHILOSOPHY.md`.
