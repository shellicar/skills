---
name: standing-up-handlers
description: |
  WHAT: How the planner stands up a per-mission handler — the fleet-repo worktree, the pre-generated conversation id, the recorded mission line, the launch carrying the SC's verbatim message.
  WHY: The sequence carries the recovery anchors (conversation id, active-missions record) — skip or reorder a step and a dead tmux server or machine takes the mission's thread with it.
  WHEN: Loaded by the launcher role, whenever a decided mission is brought to life.
user-invocable: false
metadata:
  category: standards
---

# Standing up a handler

**Skill** (loaded by the `planner` actor).

How the Planner stands up a per-mission Handler: create its fleet-repo worktree, launch the cast carrying the SC's verbatim mission message, hand off. Two scripts ([scripts/create-fleet-worktree.mjs](scripts/create-fleet-worktree.mjs), [scripts/launch-handler.mjs](scripts/launch-handler.mjs)), one sequence. Both read JSON from stdin — their docblocks are the authoritative field lists; the configs below are working examples.

## The sequence

1. **Pre-generate the conversation id** — `node -p 'crypto.randomUUID()'`. The recovery anchor: it must exist *before* launch so the handler can be `--resume`d after a tmux-server or machine death. Record it (step 3).
2. **Create the handler's fleet-repo worktree** — `create-fleet-worktree.mjs`. Makes `claude-fleet-shellicar--<mission>` with the `fleet/` submodule populated and on `main`. **This is the *handler's* worktree, where it authors the mission — not the operator's target-repo worktree.** The handler creates that later, via `dispatch-worktree.mjs`. Don't conflate the two.
3. **Record the mission** in `active-missions.md`: mission, project, conv id, worktree, branch, phase. The recovery record — commit and push it to survive a machine death.
4. **Launch the handler cast** — `launch-handler.mjs`. Creates the tmux window (`new-session` if the project's session doesn't exist yet, else `new-window`), tags it (`@state`/`@title`/`@colour`), and runs `claude-sdk-cli --resume <convId> --prompt <skills + the SC's verbatim message>`. No brief, no `--file` — see *The SC's verbatim message* below.
5. **Flip the status to in-progress and hand off.** The handler runs its own lifecycle from here, including writing the operator prompt.

## The SC's verbatim message — never authored by the Planner

The handler launches on the **SC's own words**, verbatim. The SC writes the mission message (the `--- … ---` block is a convenient way to mark it; the fences are optional), and the Planner passes it straight through as `scMessage` — never rewritten, never summarised, never dressed as an instruction sheet. It rides the envelope framed `<from>the SC</from> <via>the Planner</via>`: the message is the SC's, carried by the Planner.

This is load-bearing, and guards two failures:

- **The Planner authoring the message.** Earlier, planners took the SC's words and wrote *their* version — which put instructions the SC never wanted in front of the handler. Passing the SC's exact words removes that entirely: the Planner carries, it does not author.
- **A brief or mandate that names too much.** Tested n=4 each way on 2026-06-20: handed a brief that named specifics, a handler started interrogating the SC on fix mechanics ("is hono direct or transitive?"), reading having-the-facts as having-the-authority and taking the lead; handed a mandate envelope ("plan and run the lifecycle, dispatch the operators"), it barrelled in like a self-important PM. What the handler wakes to is only what the SC chose to write, and nothing the Planner added.

The shaped direction is worked out in the *conversation after* the cast lands — and in the operator prompt the handler then writes — not bolted onto its first breath.

## The two configs (working examples)

`create-fleet-worktree.mjs` stdin:

```json
{ "repoPath": "~/repos/fleet/claude-fleet-shellicar", "worktreePath": "~/repos/fleet/claude-fleet-shellicar--<mission>", "branch": "feature/<mission>" }
```

`launch-handler.mjs` stdin:

```json
{
  "session": "<project>",
  "cwd": "~/repos/fleet/claude-fleet-shellicar--<mission>",
  "convId": "<the pre-generated uuid>",
  "scMessage": "<the SC's verbatim mission message>",
  "name": "<mission>",
  "windowName": "<project>-<mission>",
  "title": "<project>-<mission>",
  "colour": "<per the Window Colours table>",
  "model": "opus"
}
```

## The inputs you decide, and the conventions

- **convId** — `crypto.randomUUID()`, recorded in `active-missions.md`. The recovery anchor.
- **session** — one tmux session per project; windows are missions. `launch-handler` creates the session on the first handler for that project.
- **cwd** — the fleet-repo worktree from step 2.
- **model** — required, never defaulted. A family name (`sonnet` | `opus` | `fable`), resolved to the current identifier at the launch seam (`shared/pane/models.mjs`); handlers run `opus`.
- **colour** — per the Window Colours table in the project `CLAUDE.md`; add a row for a new project, distinct from the others.
- **windowName / title** — `<project>-<mission>`.
- **branch / worktree** — `feature/<mission>` (or per the target repo's convention skill); worktree `claude-fleet-shellicar--<mission>`.
- **scMessage** — the SC's verbatim mission message, passed through untouched (see *The SC's verbatim message*).

## Worked example — winston-peer-deps (2026-06-19)

convId `c7784c2d-f12f-4581-9dab-8d18c5a82da1`; worktree `claude-fleet-shellicar--winston-peer-deps`; session `ecosystem` (created on launch, colour `colour214`); windowName `ecosystem-winston-peer-deps`; model `claude-opus-4-8`. Launched into pane `%353`, conv id pane-confirmed, recorded in `active-missions.md`. (This one predated the current process and went out with a brief; launch on the SC's verbatim `scMessage` now.)
