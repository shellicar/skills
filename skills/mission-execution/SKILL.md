---
name: mission-execution
description: |
  WHAT: The process for running a mission — execution (the phase loop), cleanup, and the post-mortem's mission wrapping — from dispatched to retired.
  WHY: The process lived scattered across role files, where each role saw only its fragment and the seams were claimed twice or not at all; one skill holds the whole run so every mission works the same seams.
  WHEN: Whenever a mission is being executed, from first dispatch to its retirement.
user-invocable: false
diagrams:
  - lifecycle
metadata:
  category: reference
---

# Mission Execution

**Skill** (loaded by the `executor` role). The process for running a mission. The lifecycle diagram delivered with this skill is the authority for the stages, states, and seams; this skill is the working of the stages it covers.

## Stages covered

This skill covers **stages 2–4** of the lifecycle:

- **2 · Execution** — the phase loop, from the seam `ready → dispatched (in-progress)`.
- **3 · Cleanup** — finishing the mission, from the seam `final verdict: Pass`.
- **4 · Post-mortem** — the mission wrapping only (when it starts, where the record lands); the retro's conduct is the `post-mortem` skill.

Exit seam: `post-mortem written → retired`. Stage 1 (planning) is `mission-preparation`; this skill picks up where it ends.

## Stage 2 — execution, the phase loop

One phase at a time: the router casts the operator (mechanics in the `dispatch` skill), the operator works and debriefs, a supervisor verifies and records its verdict, the executor weighs the verdict and brings the SC the phase report, the SC decides, the router routes. A passed phase's work is committed on the SC's approval — the commit in the operator worktree is the SC's, never the executor's. The next phase re-enters the loop. The judgment is the executor's and the SC's; the mechanical acts are the router's.

**Amendments mid-run.** When the mission file changes while dispatched — updated criteria, a re-scoped phase — the change is recorded in `## Delivery Notes` with what changed and why, and the disciplines that governed the mission's writing apply to the change: it is grounded (`mission-grounding`) and verified (`mission-verification`) like the material it amends.

**Pause.** A mission can be held mid-execution — parked on the SC's decision or blocked on a named mission — and un-parked on its recorded trigger. The states and boards are the `mission-boards` skill; execution resumes at the phase loop where it stopped.

## Stage 3 — cleanup

Cleanup starts when the final phase's supervisor verdict is Pass. It finishes a mission whose work is done; the post-mortem is a separate, later stage and does not happen here.

These steps complete the mission, in order:

1. Flip the phase's `Status` to `completed`; flip the top-level `Status` from `in-progress` to `completed`.
2. Commit the prompt.
3. Run this skill's `scripts/close-mission.mjs` to kill the operator and supervisor panes.

After these steps the mission is `completed`. The worktree stays while the work might re-open — for example, until the PR is merged; a `completed` mission can sit with its worktree still in place.

## The seam to post-mortem — completed · PR merged

The mission crosses from cleanup to post-mortem at **completed · PR merged**. A mission that opened a PR crosses when that PR merges; a mission with no PR (a review, a document, an investigation) has nothing that can send work back, so it crosses the moment it is completed.

At the seam, in order — these are steps of the process, not decisions; do not offer them or ask permission to run them:

1. Set the window state with this skill's script — never raw tmux:

   ```json
   {"commands": [
     {"program": "~/.claude/skills/mission-execution/scripts/set-handler-status.mjs", "stdin": "{\"status\":\"post-mortem-pending\"}"}
   ]}
   ```

2. Remove the worktree — nothing can pull the cast back now.

Then present the reference material to the SC: the delivery notes and the diff. Do not start the conversation. The SC drives the retro when they have time — *when* it runs is the SC's; *that the window says it is waiting* is the process's.

## Stage 4 — the post-mortem's mission wrapping

The conduct is the `post-mortem` skill: the two phases kept apart, identification before solutions, "we" not "I", and changes pitched so another session could act on them. This section holds only the mission-specific wrapping.

Each post-mortem is its own standalone file in the project's `post-mortems/` directory — for example, `projects/claude-cli/post-mortems/2026-06-09_239-streaming-tool-input.md`. Standalone by design: it should read without the mission, so the lessons aren't coloured by the prompt that produced them. The heading carries the mission's **name** — `# Post-mortem: <name> (<project>)` — the handle recorded in `mission.md`'s header. Cover the mission in a line or two, then what went well, what didn't, and what we'll change; record the root cause if there is one.

Fleet-wide changes — to roles, skills, blocks, the harness — are changes to the skills repo (`~/repos/shellicar/skills`); raise them with the SC. The fleet data repo's root `CLAUDE.md` carries open improvement work forward into the next session, so it survives across post-mortems.

Once the post-mortem is written, the mission retires: struck from every board (`mission-boards`), living only in git history.

## Scripts

- `scripts/close-mission.mjs` — kill the operator and supervisor panes in the Handler's window. Exits 1 if neither is present (called at the wrong time — worth surfacing).
- `scripts/set-handler-status.mjs` — set `@state` on the Handler's window. JSON stdin `{"status": "..."}`; defaults to `handler-running`.
