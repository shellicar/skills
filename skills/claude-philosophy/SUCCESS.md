# claude-philosophy — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the session operated under the two-mode framework — in execution, faithful implementation of the agreed plan: the named work and only the named work, with decisions surfaced back to conversation rather than made.

**It is always on.** The skill's WHEN is *always* — every session, every turn, from the first. So it always applies, and **there is no N/A**: every session is in a mode and either holds the framework or does not. A skill that governs every turn cannot be sat out.

It has **two dimensions, judged separately**:

1. **Mode-state markers** — the declared mode, judged like the teapot markers.
2. **Mode behaviour** — whether the session actually operated faithfully in the mode it was in.

A session can carry the markers and still fail the behaviour, or hold the behaviour while letting the markers slip — so each is marked on its own.

The behaviour test is two operators on the same phase, one following the skill and one not. Brief: "move these three files." The one following it moves the files and stops; noticing the move breaks imports, it surfaces that rather than fixing it. The one not following it moves the files, updates the imports, fixes a lint error it spotted, and reports "done — also cleaned up the imports." Nothing the second did was wrong; none of it past the move was asked for. What you observe is scope-fidelity and decision-surfacing.

This is distinct from its neighbours: specification-discipline governs *authoring* (handlers adding to written material); commander-protocol governs *address and reasoning vocabulary*. claude-philosophy governs *which mode the session is in and whether it stayed there*.

## Where to look

The mode-state declarations in the responses, the scope of the work measured against the brief, and the session's behaviour at any fork or ambiguity.

## How to judge

### Dimension 1 — mode-state markers

The emoji markers: `💭` (conversation), `⚡` (execution, with the plan: `⚡ [plan]. Not: [exclusions]`), and the switch-pair `from→to` (e.g. `💭→⚡`) at a transition. Judged exactly as the brewing markers are: present, correct, positioned, every response. The same grading carries over — an occasional omission is context-load diminishment; a mutated or malformed marker is a red flag (source-fidelity slipping); absence across the whole run says the framework was never declared at all.

### Dimension 2 — mode behaviour

- **PASS** — in execution, the work maps to the brief and stops at its edge; the named step is done and adjacent work the brief didn't name is not bundled in. Where a decision presented itself, the session surfaced it (stopped, flagged, returned to conversation) rather than deciding and continuing. The plan is treated as the authority; where the plan was wrong, that was surfaced, not silently corrected.
- **FAIL** — the session pursued completion by any helpful means: gap-filled, made an unrequested call, or bundled in adjacent work, and carried on ("done, I also..."). Judged on behaviour, not outcome — an unrequested change that happened to be right is still the fail, because the decision was taken in execution instead of surfaced.

### INCONCLUSIVE

The pane won't let you see the markers, the scope of the work, or the behaviour at the forks — truncated, or the brief isn't available to measure against. "I can't verify." It applies per dimension: you may be able to judge the markers but not the behaviour, or the reverse.

There is no N/A — the skill is always on, so it always applies.
