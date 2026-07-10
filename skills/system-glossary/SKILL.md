---
name: system-glossary
description: |
  WHAT: The shared vocabulary of the system — one definition per term, the single source of truth for what each word means.
  WHY: Without one shared meaning a word drifts between sessions and Claude reaches for a synonym; this is the ubiquitous language every cast speaks, so a word means the same thing everywhere.
  WHEN: Always. Loaded by every session, so the words are already shared before any work begins.
user-invocable: false
metadata:
  category: foundational
---

# System glossary

The shared vocabulary of the system — the ubiquitous language every session speaks. Each term is defined here, in place. **This file is the single source of truth for what a word means.** Everything else *uses* these words; nothing here depends on anything else.

If another file's use of a term drifts from this one, **this file wins** — until it is updated. Which is right is a judgement call, but the default is the glossary, because it is the one thing every session loads.

**Bold terms** in a definition are themselves defined here — find them by their heading. Each entry ends with an _Avoid_ line: the synonyms not to use for it, so one word keeps one meaning.

These are definitions, not explanations. No examples, no rationale — for the why behind a term, read where it is used.

## role

A job a **cast** performs, defined by what it does, not what it is. One **actor** can take different roles across casts; a cast holds exactly one, for its whole life.

_Avoid_: hat, function, mode

## actor

The persistent identity behind a **cast** — handler, operator, supervisor, planner — defined by the set of **roles** it can take. A cast is that actor, running, in one of them.

_Avoid_: agent, persona

## cast

One short-lived run of work, doing one **role** start to finish. Its role is fixed before it starts.

_Avoid_: session, run, instance

## deliverable

What a **cast** hands to the next stage when its work is done — `intent.md` from the interlocutor, `mission.md` with its proof from the scribe, the published release from the postmaster. Not everything the cast said or produced along the way; the thing handed on.

_Avoid_: output, artefact (an artefact is a file in the mission directory; a deliverable is whatever is handed on, file or not)

## SAM

A lens for placing something on three dimensions: **substance**, **anchor**, **modality**. Describes; nothing rests on it.

_Avoid_: framework, taxonomy

## substance

How much of the **deliverable**'s matter is the cast's own — a dimension from 0 (carries entirely what exists) toward 1 (brings its own). `carried` and `new` name the low and high ends. It measures the deliverable, never the conversation: the interlocutor sits at 0 — `intent.md` carries only the SC's matter — and still thinks and contributes in the exchange.

_Avoid_: content, output

## anchor

Where the truth a piece of work draws from lives: the SC's head, the material, or what has already been decided. Sets what counts as invention.

_Avoid_: source, ground

## modality

Whether work lands as prose or as a tool result.

_Avoid_: medium, format

## intent

What the SC actually wants, drawn out and written down: the **goal** and its why, plus the decisions, model, and scope settled with the SC. Nothing invented.

_Avoid_: agreement, requirements, spec

## goal

What the work is for, and the why under it — what a **cast** steers by, and recovers to when a precise instruction turns out wrong. Not the steps beneath it, not the horizon beyond it.

_Avoid_: objective, aim, target

## objective

A concrete, measurable target the work delivers to reach the **goal** — the precise *what*.

_Avoid_: goal, requirement

## blueprint

The precise definition of what you want built — how it looks, how it works. Distinct from the **objective** (what is delivered) and the **means** (how it is built). The SC's, pinned with the handler while the **intent** is drawn out. Lands as `blueprint.md` in the mission directory; the mission references it rather than copying it.

_Avoid_: spec, plan, mockup

## means

The *how* — the steps and mechanism for building the thing. The operator works this out; the SC does not spell it out.

_Avoid_: approach, method, implementation

## vision

The horizon beyond the work — the larger end-state it steps toward without being on the hook for.

_Avoid_: roadmap, dream

## squad

The team a **mission** runs through — roles chosen from the real roster, proposed and settled with the SC.

_Avoid_: shape, crew, lineup

## mission

One piece of work, start to finish: a single **goal** carried from the SC's direction to a delivered result, run by a **squad** of **casts**. The operator's brief, `mission.md`, is one artefact inside the mission, not the mission itself.

_Avoid_: prompt, ticket, task, project

## area of influence

The declared surfaces and files a **mission** expects to touch, named before **dispatch**. A claim, not a final list. Lives as `influence.md` in the mission directory.

_Avoid_: touch-set, footprint, scope

## responsibility

Doing the work. Can be handed off without handing off **accountability**.

_Avoid_: accountability, duty

## accountability

Answering for something — authority and blame together. Cannot be handed off. Scoped: the handler is accountable for handling the mission; the SC is accountable for the mission itself.

_Avoid_: blame, responsibility, ownership

## purpose

Everything in the system — every **role**, **skill**, **mission**, **cast** — exists to serve the SC. The Claudes serve; the SC decides.

_Avoid_: goal, mission, reason

## phase

One step of a **mission**'s execution: one **cast**, one **role**, one **objective**, verified before the next phase runs.

_Avoid_: step, stage, task

## verdict

The supervisor's PASS/FAIL judgement on a **phase** — an input to the handler's own judgement, never a substitute for it.

_Avoid_: decision, ruling, approval

## marking template

A structure a skill's `SUCCESS.md` prescribes for recording its marking, item by item against each criterion. The operator's work is marked against it; the supervisor reproduces it filled as the coverage surface. Required wherever a `SUCCESS.md` defines one.

_Avoid_: matrix, rubric, table, grid

## phase report

The executor's own report to the SC on a verified **phase**: whether the verdict holds, and the decision or action that follows. Never a relay of the **verdict** itself, and not the per-cast **debrief**.

_Avoid_: verdict, debrief, handoff, status update

## project

A logical grouping of **missions**, generally one system or repository. Not itself a piece of work.

_Avoid_: mission, product, codebase

## mission complete

The moment a **mission**'s work is delivered and accepted — the deliverable landed. Not yet wound down; see **mission closed**.

_Avoid_: closed, done, retired

## mission closed

The moment a **mission** is fully wound down and retired — cleanup done, **post-mortem** written, off every board.

_Avoid_: complete, done, finished

## post-mortem

The retrospective on a delivered **mission**: what went well, what didn't, what to do better. Per-mission, the last thing done on it.

_Avoid_: debrief, retro, report

## debrief

The record a **cast** leaves at the end of its run: what it built, found, decided, and the gaps it hit and surfaced. Per-cast, where the **post-mortem** is per-mission.

_Avoid_: post-mortem, report, summary

## dispatch

Handing a **phase** to a **cast** to run. Transport, not a decision — what to dispatch was already decided.

_Avoid_: assign, deploy, kick off

## testament

The record a **cast** leaves of what it *learned*, kept as memories for the sessions that come after. Learning carried across a context boundary — not the **debrief** of one phase, not the whole-mission **post-mortem**.

_Avoid_: debrief, log, journal

## handover

The note a session writes for its successor when its context is ending: where things stand, what is in flight, and what to search the memory tool for. Comes after the **testament**; exists only for session continuity, not as a summary of what happened.

_Avoid_: summary, recap, handoff, briefing

## boot

What a **cast** does on waking: read the prior picture — its **testament**, the durable records, and what is actually running — before it acts.

_Avoid_: startup, init, bootstrap

## generate

To create a value or artefact that did not exist before — an id, a file, a schema.

_Avoid_: mint, minting, coin
