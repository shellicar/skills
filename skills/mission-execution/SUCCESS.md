# mission-execution — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the mission ran on the lifecycle's seams — the phase loop, cleanup, and the post-mortem seam each entered where the process says, with the decisions staying where they belong.

The key marks: the phase loop held its shape — one phase at a time, operator then supervisor then the executor's own phase report to the SC, with commits in the operator worktree on the SC's approval, never the executor's own; amendments mid-run recorded in Delivery Notes and put through grounding and verification like the material they amend; cleanup entered only on the final Pass, its steps in order, through the scripts (`close-mission.mjs`, `set-handler-status.mjs`) rather than raw tmux; the post-mortem seam crossed at completed · PR merged, the reference material presented and the conversation **not** started — the retro runs on the SC's clock; and the seam steps run as process, not offered as questions.

N/A where the session was not executing a mission. INCONCLUSIVE where the seams aren't visible.
