# scheduler: editorial context

Not loaded at runtime. Read before you change `ROLE.md`. The planner-actor decomposition this role belongs to is in `actors/planner/PHILOSOPHY.md`.

## Where it came from

One of the three roles the planner actor was split into (scheduler / launcher / coach), decided by placing each planner job on SAM and finding three distinct positions. The scheduler is the planner holding the boards and sequencing the work.

## Decisions

- SAM position: new / material / prose — it proposes an order and shapes work into missions (new), from the live fleet state (material), and puts the call to the SC (prose).
- Named for the job; "planner" is the actor's name, so the role cannot share it.
- Recovery was dropped from the planner entirely (tmux-snapshot's job now); "singleton" removed as jargon while keeping "one planner on main" in plain words.

## What was rejected

- Keeping the planner as one bundled role — SAM showed three distinct positions.

## Notes for future editors

- The three planner roles share their decomposition story in `actors/planner/PHILOSOPHY.md`; keep the file-specific reasoning here.
