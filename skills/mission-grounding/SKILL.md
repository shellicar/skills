---
name: mission-grounding
description: |
  WHAT: Provenance first — the scribe extracts the evidence from the sources into provenance.md, then composes the mission from those rows and nothing else.
  WHY: Written after the mission, a trace justifies anything — the author self-approves, and the file anchors the verifier on the author's account. Written first, it puts the sources in front of the scribe at the moment the words form, which is the only moment grounding can happen.
  WHEN: Before mission.md is written.
user-invocable: false
metadata:
  category: standards
---

# Mission grounding

## Who

You are the scribe, writing. Your job is translation: the SC's wants and intent become the artefacts an operator acts on. The decisions were all made upstream — you carry them into the mission whole, in the SC's words. A translator who adds something of his own is inventing; one who drops something is losing what the SC decided. Both betray the text, and the operator builds the betrayal.

## Why

You write `provenance.md` **first**. Then you write `mission.md` from it. The order is the whole skill.

A trace written after the mission is a bibliography for a text that already says whatever it wanted — every fleet provenance file written that way approved its own author, including the one on a mission that was wrong. No procedure can force generation to take the right order; what this skill does is make the extraction the first deliverable, so you are thinking from the sources *while* the mission forms, not judging your own draft afterwards. Grounding happens before or during writing. Afterwards there is only justifying.

## What

`provenance.md` is your proof, part of the finished mission: the Evidence table (every decided thing, its source, its text, and where it landed), the Coverage table (the goal and each objective — done by which phase, proven where), and the Gaps (what no source supplies, sent upstream). `mission.md` without it is unfinished, and the verifier refuses it. You prove; the verifier — a different session — verifies.

## When

Writing posture, before `mission.md` exists. You have read everything in the mission directory and everything a source names as governing (see the scribe role: understanding before writing); the extraction is the first thing you produce.

## How

### The extraction

Sit with the sources and pull out every decided thing — each decision, illustration, and fact the mission will carry — into the Evidence table, with its text. `Source` is an enum, exactly three values:

1. **SC** — the SC decided it; `intent.md` carries the words.
2. **Project** — the project's agent-facing files: `README.md`, `CLAUDE.md`, the brief. Never the code — a fact you would have to open the worktree to confirm is the operator's to establish.
3. **Fleet** — a skill, a harness rule, or (for a role's stance) the role's own `ROLE.md` and phase block.

No other value. `Text` is the evidence itself — if you cannot produce the text, there is no row.

A document a source names as governing ("the blueprint governs; the spec wins on conflict") joins the sources: you read it, and you extract from it directly — never from a summary of it. When `blueprint.md` exists it gets a row, and the mission references the file rather than reproducing it.

True is not a source. A verified fact nobody decided is not a row; if it matters, it goes upstream as a question.

**An investigation is a vehicle, not a source.** `investigation.md` is the Investigator's — findings verified against code you never read, so you cannot attest them as Text; extracting them into rows would put an operator's word in the proof wearing the SC's standing. The findings never become rows. Decisions *about* the investigation are SC rows ("the fix follows the investigation", "option two"), because the SC made them and the intent carries them; when `investigation.md` exists it gets a row like the blueprint's, and the mission **references** the file — the operator reads the findings directly, whole, as findings: starting points to confirm on contact, never transcribed instructions.

### Composing from the rows

The mission is written from the Evidence table and nothing else. A sentence with no row behind it has nothing to be written from — if the mission needs something no source supplies, that is a **gap**: name it under Gaps and send it upstream to the SC. Never fill it.

Composing from rows means the mission **carries the content** — the row's text lands in the mission, in the intent's own words. It never points back at the front artefacts instead: `intent.md` and `squad.md` exist to create the mission, and once it is written they could be discarded with no change to the mission's chance of success. The operator reads `mission.md` — plus the mission's two possible vehicles, `blueprint.md` and `investigation.md`, which are referenced, never reproduced: they are not discarded inputs but artefacts with their own authors, shipped in the mission directory and read directly.

As each row lands, record where under `Carried` — intact, in the intent's own words. A row with no `Carried` at the end is a drop; it goes in, or the mission is not done.

Precision test for every line you compose: could the operator reasonably choose differently? If yes, you stated the problem — grounded. If no, you designed the solution, and no row carries design unless a decided blueprint does. "It follows from X", "presumably", "the operator will need to…" are not rows — they are downstream roles' jobs leaking into the mission.

### Coverage

The goal and every objective get a Coverage row: the phase that **does** it, and the place it is **proven**. A mission can carry every claim and still be a checklist that never touches its own purpose. An uncovered goal or objective goes upstream — how it gets done or proven is the SC's decision, never filled in here.

### What the verifier checks

Two legs, both mechanical, both able to fail visibly:

1. **provenance ← sources** — every row's text really is in the source it names.
2. **mission ← provenance** — everything in the mission traces to a row; every row is carried intact; coverage holds.

That check is `mission-verification`, run by a different session against this file. Write the extraction so those two legs can be walked without you in the room.
