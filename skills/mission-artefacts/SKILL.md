---
name: mission-artefacts
description: |
  WHAT: The single source for what a mission is on disk — the directory it lives in, the artefacts it holds (intent, squad, mission, provenance, verification, post-mortem), and the equation that binds them into a mission.
  WHY: Without one definition, the artefacts drift — the role that writes intent.md and the scribe that reads it disagree on what it is, and the concrete shape gets lost (as it did once already).
  WHEN: Whenever a mission's artefacts are written or read.
user-invocable: false
metadata:
  category: reference
---

# Mission artefacts

**Skill** — the single source for what a mission *is* on disk: the directory it lives in, the artefacts it holds, and the rule that binds them into a mission. Loaded by the roles that produce and consume those artefacts: the `interlocutor` and `squad-selector` who write the front two, the `scribe` who writes the mission from them, and the `executor` who reads them to know what stage the mission is in.

## The mission is a directory

A mission is a directory, not a file — `YYYY-MM-DD_NUM_description/` — holding the artefacts of its whole life colocated, from intent to post-mortem:

- `intent.md` — what the SC wants, and why (the `interlocutor`'s output).
- `blueprint.md` — the SC's pinned spec or walkthrough, when one exists (optional; the `interlocutor` writes it when the SC pins one).
- `squad.md` — the team the work runs through (the `squad-selector`'s output).
- `mission.md` — the operator's brief (the `scribe`'s output).
- `influence.md` — the mission's declared area of influence (the `scribe` declares it; the `executor` refines it as the work concretes).
- `provenance.md` — the scribe's per-claim trace of the mission's sources (the `mission-grounding` pass's output).
- `verification.md` — the executor's record of the cross-check (the `mission-verification` pass's output).
- `post-mortem.md` — the retrospective, written at the end.
- `investigation.md` — the Investigator's findings, when an investigation ran (referenced by the mission, like the blueprint — see below).
- `investigations/`, `plans/` — the mission's other artefacts, colocated alongside.

Naming:

- `YYYY-MM-DD_NUM_description/` — underscores separate the three segments, hyphens within the description.
- `NUM` is the issue/work-item number. Omit it for missions with no issue (releases, maintenance).
- Examples: `2026-03-28_89_batch-message-processing/`, `2026-03-27_release/`.

Missions live directly under `projects/<project>/missions/`.

**Every mission also has a name** — the human-readable title ("Ref + PreviewEdit persistence"), distinct from the directory slug. The executor picks it, and the pick is arbitrary: the name never determines success or failure, it is the handle people know the mission by. It is recorded in `mission.md`'s header and it is what the post-mortem's heading carries. It may change over time — a mission that pivots gets renamed to what it has become; the directory keeps its original slug.

## The equation

`intent + squad + fleet material = mission`

This is the completeness test. When the intent and the squad, plus the reusable fleet material (the scaffold, the templates, the skills), are enough to produce the mission with nothing invented to fill a gap, the front of the pipeline is done. If the `scribe` has to invent to finish the mission, a decision was missed upstream — it goes back to the `interlocutor` or the `squad-selector` to be settled, never filled in.

The equation runs one way: the front artefacts exist to *create* the mission. Once it is written, the mission stands alone — discard `intent.md` and `squad.md` and its chance of success must not change. The operator reads `mission.md`, so the mission never references the front artefacts by filename; it carries their content. The two deliberate exceptions are the mission's vehicles — `blueprint.md` and `investigation.md` — referenced, never reproduced (see below): they are not consumed inputs but artefacts with their own authors, shipped with the mission and read directly.

## `intent.md` — what the SC wants, and why

The goal and the reason under it — the enduring objective an operator reconciles against when an instruction turns out wrong on contact. Not the approach (that is the plan), not the implementation (that is the code). Every line traces to the SC, the project, or a fleet rule; nothing is invented.

Its anatomy carries the negative space, because a downstream session cannot tell a deliberate exclusion from a mere omission unless it is written down:

- **Out of scope** — what is deliberately left out, *with the reason for each*. The reason is the point; the SC values knowing what was set aside and why.
- **Not agreed — must not appear** — a binding list of anything raised but not settled, so it cannot leak into the mission as though it had been decided.

## `blueprint.md` — the pinned spec, when there is one

Any detailed spec or walkthrough the SC pinned — a model diagram, an element table, an exact function. It is the SC's, settled with the handler in conversation — at the front, or mid-mission when re-engagement settles one — never an operator phase's output.

The file exists only when a blueprint does, so its presence is a hard signal: no file, no blueprint; file present, the mission must use it. And the mission **references** the file — it never reproduces the content. A copy can be dropped or distorted in transcription; a reference cannot. The file itself is the vehicle, and the operator reads it directly.

## `investigation.md` — the findings, when an investigation ran

The Investigator's report: what was found, with paths and line numbers, options with trade-offs, no recommendation. It is the Investigator's — verified against code the scribe never reads — so the mission **references** the file and never transcribes the findings: transcription can drop or distort them, and a transcribed finding masquerades as a decided instruction when it is a starting point the operator confirms on contact. Same treatment as the blueprint, different author: the file is the vehicle, and the operator reads it directly. Decisions the SC made *about* the investigation (build on it, take option two) are intent content and land in the mission as carried rows.

## `squad.md` — the team, and why

The operator roles the work runs through — proposed from the real roster, with the reason each one is there. Claude proposes; the SC disposes. It is selection from what exists, not the invention of a structure.

## `influence.md` — the declared area of changes

The surfaces and files the mission expects to touch — a claim, not a final list. The `scribe` declares it when the mission is written, from what the intent and squad settled; the `executor` refines it as phases land and the real touch surfaces concrete.

It is its own artefact because two readers need it apart from the mission: the planner's `scheduler` reads every live mission's area for collisions without loading the missions, and the `executor` updates it mid-run without churning a dispatched `mission.md`. Collisions decided on it — pause, order, run alone — happen at dispatch time, on evidence, instead of being discovered in merges.

## The `mission.md` header fields

`mission.md` opens with header fields the `scribe` stamps and the `executor` reads. They are recorded facts about the mission — **boilerplate, not content claims** — so `mission-verification` does not trace them against provenance. But you have to know what each means, because misreading one (treating it as something to verify, or checking it against the wrong repo) is how verification goes wrong.

- **Name** — the mission's human-readable name, picked by the executor. Arbitrary — a handle, not a claim — and carried into the post-mortem's heading.
- **Created** — the date the mission was written.
- **Deliver to** — the worktree the operator's work lands in: `<base-repo>--<worktree-name>`. The handler creates this worktree with the `dispatch` skill.
- **Written against version** — the commit of the **fleet material** (the skills repo: the roles, skills, scaffold, and templates) the mission was authored from. It records which material version shaped the mission, so material drift stays traceable. Written as `<repo>@<commit>` so the repo is explicit.

## Why the front artefacts are two, not one

They are different kinds of decision with different protection. The intent is *drawn out* of the SC and must never be invented. The squad is *proposed* by Claude and confirmed by the SC — it can be wrong, and it is corrected downstream. Splitting them keeps the drawing-out honest and the proposing accountable, and hands the `scribe` two clean inputs instead of one fused document.
