# Philosophy — mission-boards

This file is the editorial context for `mission-boards`. It is not loaded at runtime. Read it before modifying `SKILL.md`, so the change stays aligned with the reasoning that produced the current content.

## Why this skill exists

The doctrine for the Planner's durable records used to live in two wrong places: spread through `ROLE.md`, and duplicated inside the board "templates". That meant the lifecycle model existed in more than one file, so a fix to one left the others stale. It also meant the templates carried instructional prose — explanations of the lifecycle, recovery procedures, narration of the phases — when a template is meant to be structure: headings, a table skeleton, placeholders. This skill is the single home for the content, so the templates can go back to being structure and the role can point here instead of restating.

## Origin

It surfaced on 29 June 2026, while correcting the lifecycle model. Two things happened in one sitting. First, the model was wrong: it said a mission "completed" on PR merge, which broke for review missions, documents, and investigations that never open a PR, and conflated *complete* (objective met) with *done* (won't be reopened). Second, while fixing the wording line by line, a `gh` reference was found baked into a template's instructions — a GitHub assumption sitting in a host-neutral skeleton, in an Azure DevOps shop. The `gh` leak was the tell: a template has nowhere to bake in a host assumption *unless* it is carrying instructions it shouldn't. That is what made the structural problem obvious, and this skill is the response.

## Key insights that shaped this skill

- **Complete is not done.** Achieving the objective is not the end. You still come back to base, return the equipment, debrief. Done is when you know you will not be sent out again. The gate to done is whether anything could still pull the cast back; an open PR is the main thing that can, because review can send work back. A mission with no PR has nothing to send back, so it is done the moment it is complete.
- **A template is structure, not content.** The moment a template explains *why*, it has become a second copy of the doctrine, and it will drift and it will leak assumptions. Structure is headings, a table skeleton, and `<…>` placeholders. The why lives in the skill.
- **One home for the doctrine.** The lifecycle exists in exactly one place now. The role references it; the templates reference it. Fixing it means editing one file.

## Decisions made

- **Name.** `mission-boards`. The SC offered `project-state` or `mission-boards` and did not mind which. The boards are the larger, more load-bearing part, so the skill is named for them, and it folds in the per-project `state.md` as the third durable record rather than splitting it out.
- **One skill, three records.** active board, completed board, and `state.md` share the same nature — durable, by-the-Planner-for-the-Planner, the thing that survives a context ending — so they are documented together, not split.
- **What stays in `ROLE.md`.** The Planner's identity and judgment work (who it is, boot, standing up missions, sequencing) stay in the role. The records doctrine moves here. The role points to this skill.

## What was rejected

- **Patching the templates line by line.** That is what exposed the problem; continuing it would have left the root cause (doctrine in the wrong place) untouched.
- **Duplicating the lifecycle across role and templates.** The drift we were fixing was caused by exactly that duplication.

## What this skill does NOT cover

- Standing up a handler (the `standing-up-handlers` skill) and dispatch mechanics (the `dispatch` skill / `router` role).
- The operator-repo `./CLAUDE.md` (the `project-memory` skill). `state.md` here is the fleet-side record, a different file with a different owner.
- Host-specific tooling. The records are host-neutral; the host's PR tool is named at the fleet, not here.

## Notes for future editors

- If you find yourself explaining the lifecycle inside a template again, stop: the explanation belongs here.
- Keep the lifecycle states in one voice with `ROLE.md`. If the model changes, this skill is where it changes, and the role's pointer should still be accurate afterward.
- Watch for host assumptions creeping back in (`gh`, a specific PR command). Anything host-specific is a fleet detail, not skill content.
