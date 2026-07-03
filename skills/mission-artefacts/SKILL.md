---
name: mission-artefacts
description: |
  WHAT: The single source for what a mission is on disk — the directory it lives in, the artefacts it holds (intent, squad, mission, post-mortem), and the equation that binds them into a mission.
  WHY: Without one definition, the artefacts drift — the role that writes intent.md and the scribe that reads it disagree on what it is, and the concrete shape gets lost (as it did once already).
  WHEN: Loaded by the roles that produce or consume a mission's artefacts — the interlocutor and squad-selector who write the front two, the scribe who writes the mission from them, and the executor who reads them to know the stage.
user-invocable: false
metadata:
  category: reference
---

# Mission artefacts

**Skill** — the single source for what a mission *is* on disk: the directory it lives in, the artefacts it holds, and the rule that binds them into a mission. Loaded by the roles that produce and consume those artefacts: the `interlocutor` and `squad-selector` who write the front two, the `scribe` who writes the mission from them, and the `executor` who reads them to know what stage the mission is in.

## The mission is a directory

A mission is a directory, not a file — `YYYY-MM-DD_NUM_description/` — holding the artefacts of its whole life colocated, from intent to post-mortem:

- `intent.md` — what the SC wants, and why (the `interlocutor`'s output).
- `squad.md` — the team the work runs through (the `squad-selector`'s output).
- `mission.md` — the operator's brief (the `scribe`'s output).
- `post-mortem.md` — the retrospective, written at the end.
- `investigations/`, `plans/` — the mission's other artefacts, colocated alongside.

Naming:

- `YYYY-MM-DD_NUM_description/` — underscores separate the three segments, hyphens within the description.
- `NUM` is the issue/work-item number. Omit it for missions with no issue (releases, maintenance).
- Examples: `2026-03-28_89_batch-message-processing/`, `2026-03-27_release/`.

Missions live directly under `projects/<project>/missions/`.

## The equation

`intent + squad + fleet material = mission`

This is the completeness test. When the intent and the squad, plus the reusable fleet material (the scaffold, the templates, the skills), are enough to produce the mission with nothing invented to fill a gap, the front of the pipeline is done. If the `scribe` has to invent to finish the mission, a decision was missed upstream — it goes back to the `interlocutor` or the `squad-selector` to be settled, never filled in.

## `intent.md` — what the SC wants, and why

The goal and the reason under it — the enduring objective an operator reconciles against when an instruction turns out wrong on contact. Not the approach (that is the plan), not the implementation (that is the code). Every line traces to the SC, the project, or a fleet rule; nothing is invented.

Its anatomy carries the negative space, because a downstream session cannot tell a deliberate exclusion from a mere omission unless it is written down:

- **Out of scope** — what is deliberately left out, *with the reason for each*. The reason is the point; the SC values knowing what was set aside and why.
- **Not agreed — must not appear** — a binding list of anything raised but not settled, so it cannot leak into the mission as though it had been decided.

## `squad.md` — the team, and why

The operator roles the work runs through — proposed from the real roster, with the reason each one is there. Claude proposes; the SC disposes. It is selection from what exists, not the invention of a structure.

## Why the front artefacts are two, not one

They are different kinds of decision with different protection. The intent is *drawn out* of the SC and must never be invented. The squad is *proposed* by Claude and confirmed by the SC — it can be wrong, and it is corrected downstream. Splitting them keeps the drawing-out honest and the proposing accountable, and hands the `scribe` two clean inputs instead of one fused document.
