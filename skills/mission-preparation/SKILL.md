---
name: mission-preparation
description: |
  WHAT: The process for preparing a mission — stage 1 of the lifecycle: drawing out intent, picking the squad, writing the mission, and verifying it, from the SC's direction to ready.
  WHY: The pipeline lived only in the roles that run its steps, each seeing its own fragment; one skill holds the whole stage so the seam into execution is exact and nothing is claimed twice.
  WHEN: When a mission is being prepared — from the SC's direction until the mission is ready.
user-invocable: false
diagrams:
  - lifecycle
metadata:
  category: reference
---

# Mission Preparation

**Skill.** The process for stage 1 of the mission lifecycle. The lifecycle diagram delivered with this skill is the authority for the stages, states, and seams; this skill is the working of the stage it covers.

## Stages covered

This skill covers **stage 1 — planning** only: from the SC's direction to the mission being `ready`. Everything after the seam `ready → dispatched (in-progress)` is `mission-execution`.

## The pipeline

Four steps, in order, each owned by the skill named — this skill sequences them, it does not restate them:

1. **Intent** — drawn out of the SC's head, never invented: `active-listening` (the interlocutor). Lands as `intent.md`; a pinned blueprint lands whole as `blueprint.md` beside it.
2. **Squad** — the roles proposed from the roster and settled with the SC: `squad-selection`. Lands as `squad.md`.
3. **Mission** — written from what was settled, every line traced: `prompt-authoring` and `mission-grounding`. Lands as `mission.md` and `influence.md`.
4. **Verification** — every claim's source opened, the mission faithful to the intent, before the SC's review: `mission-verification`. Lands as `verification.md`.

What a mission is on disk — the directory, the artefacts, the equation binding them — is `mission-artefacts`.

## The exit seam — ready

A mission is `ready` when it is written, verified, reviewed by the SC, and committed — at which point it appears on the active board (`mission-boards`). `ready` is the whole of this stage's output: a mission an executor can run without coming back to ask what was meant.

## Amendments during preparation

When the SC changes something mid-write — the intent shifts, the squad changes — the change lands in the artefact that owns it (`intent.md`, `squad.md`), and everything downstream of that artefact is re-grounded and re-verified before the mission is `ready`. The pipeline's order is why: each step builds on the one before it, so a change upstream is not patched downstream.
