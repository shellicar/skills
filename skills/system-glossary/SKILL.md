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

## role

A job a **cast** performs, defined by what it does rather than what it is. A cast takes on one role and holds it for its whole life — one draws intent out, one writes the mission, one writes the code. The role names what the cast does and, by what it leaves out, what it does not. One **actor** can take different roles across different casts, but a cast is only ever one role at a time. Under the **SAM** lens, a role sits at a single position across substance, anchor, and modality — one point, right now.

Example: the Maker writes the code; the Scribe writes the mission — each cast holds one job.

_Avoid_: hat, function, mode

## actor

A persistent identity that takes on **roles**. Where a **cast** is one run doing one role, the actor is the standing thing behind it — handler, operator, supervisor, planner — that can take on any of several roles at different times. An actor is defined by the set of roles it can take; a cast is that actor, running, in one of them.

Example: the handler — it takes the Scribe role to write a mission, then the Executor role to run it.

_Avoid_: agent, persona

## cast

One running unit of work, doing one **role** from start to finish. A cast is short-lived: it begins, does its one role, records what it learned, and ends. Its role is fixed before it starts, so it never has to work out mid-run which job it is doing.

Example: the Maker phase of markdown-render — one run, one role, ended when the phase was done.

_Avoid_: session, run, instance

## SAM

A lens: a way of describing something by its position on three axes — **substance**, **anchor**, and **modality**. It can be laid over anything — a **role**, a **cast**, a piece of work — to place it and compare it against others. A model that describes, not something things rest on: remove SAM and what it described stands unchanged. Right now it is used to place a role at a single position; the exact values on each axis are still being pinned.

Example: the interlocutor and the squad-selector sit at different positions — draw-out versus propose.

_Avoid_: framework, taxonomy

## substance

Whether a piece of work brings something new of its own or carries what already exists. Drawing intent out carries — the content is the SC's; proposing a squad brings new — it contributes the choice.

Example: the interlocutor carries the SC's content; the squad-selector brings a new proposal.

_Avoid_: content, output

## anchor

Where the truth a piece of work draws from lives: in the SC's head, in the material, or in what has already been decided. It sets what counts as invention — an anchor in the SC's head means anything not drawn from the SC is invented.

Example: the interlocutor's truth is in the SC's head; the scribe's is in what was already decided.

_Avoid_: source, ground

## modality

Whether work lands as prose or as a tool result — where its output, and so its success, lives.

Example: the interlocutor's output is the conversation (prose); the scribe's is the written mission (a tool result).

_Avoid_: medium, format

## intent

What the SC actually wants, drawn out and written down — the **goal** and its why at the centre, plus the decisions, the model, and the scope settled with the SC. Intent is larger than the goal: it is the whole understanding the rest of the work is built from. Every line traces to the SC; nothing is invented.

Example: the markdown-render agreement — the goal, the why, the element decisions, and the boundary, all settled with the SC.

_Avoid_: agreement, requirements, spec

## goal

What the work is for, and the why under it — the north star a **cast** steers by, and the one thing it can recover to when a precise instruction turns out wrong on contact. Not the steps beneath it and not the horizon beyond it. Name the dance and a dancer who missteps still finds the next beat; leave it unnamed and the same misstep strands them, because there is nothing to get back to.

Example: markdown-render — "Claude's responses are seen the way Claude writes them," because a terminal that drops the markdown throws away what Claude meant.

_Avoid_: objective, aim, target

## objective

A concrete, measurable target the work delivers to reach the **goal** — the precise *what*. It cascades: each phase carries its own objective serving the whole. Legitimate and needed, but incomplete on its own — a delivered objective can still miss the point if the **goal** above it was never named.

Example: markdown-render — a markdown render pass in the CLI, shipped.

_Avoid_: goal, requirement

## blueprint

The precise definition of what you want — how it looks, how it works. Distinct from the **objective** (what gets delivered) and the **means** (how it is built): the blueprint pins the result exactly, so an operator builds the right thing without having to guess what it should be. It is the SC's — pinned with the handler while the **intent** is drawn out — never something an operator phase produces; what an Engineer produces is class design, part of the **means**. When one exists it lands as `blueprint.md` in the mission directory, and the **mission** *references* the file rather than carrying a copy — the file is the vehicle, so the blueprint cannot be dropped in transcription.

Example: markdown-render's element table — the exact look, row by row (a slice of it):

| Construct | Treatment |
| --- | --- |
| Headings | bold + colour, graded by level, `#` stripped |
| Fenced code | boxed with a language label, highlighted, content kept literal |
| Blockquote | `│` gutter, dimmed |
| Links | OSC 8 clickable hyperlink, underline fallback |

The full table plus `spec.mjs` — source in, rendered out, "that rendered output IS the spec" — is the blueprint.

_Avoid_: spec, plan, mockup

## means

The *how* — the steps and mechanism for building the thing. The operator works this out; you do not spell it out. Dictating the steps is the over-specifying that choreographs every move but names no **goal** to recover to. You are precise about the goal and about what you want built — never about the how.

Example: markdown-render — render with `marked` plus a thin renderer; the operator's how, though the SC made the load-bearing library call.

_Avoid_: approach, method, implementation

## vision

The horizon beyond the work — the larger end-state it steps toward but is not on the hook for. Work serves the vision without having to reach it; naming it keeps the **goal** from swelling to swallow more than the work owns.

Example: launch-preload's "self-feeding fleet" — the horizon the session-recovery work stepped toward but was not accountable for.

_Avoid_: roadmap, dream

## squad

The team a **mission** runs through — the roles chosen to carry it, and the reason each one is there. Chosen from the roles that actually exist, never invented: a selection from the roster, proposed and then settled with the SC.

Example: chess-clock's phases — Apostle, Scaffolder, Builder, Maker, Courier — the roles chosen to carry it.

_Avoid_: shape, crew, lineup

## mission

The whole of one piece of work: a single **goal** carried from the SC's direction to a delivered result. One handler holds it; a **squad** of **casts** runs it through its lifecycle — planning, execution, cleanup, post-mortem — while it lives on the boards, until it retires to history. The operator's brief is `mission.md`, one artefact inside the mission, not the mission itself.

Example: markdown-render — the whole feature, from the SC's direction to the shipped PR.

_Avoid_: prompt, ticket, task, project

## area of influence

The declared area of a **mission**'s changes — the surfaces and files it expects to touch, named before **dispatch** and refined by the executor as the work concretes. A claim, not a final list. It exists so collisions between missions are visible at dispatch time: the planner pauses, orders, or runs-alone on evidence instead of discovering conflicts in merges. It lives as `influence.md` in the mission directory, its own artefact, so the planner reads it without the rest of the mission.

Example: the agent-message-handler investigation — read-only in the target repo, writing exactly two files in the handler repo; the build mission that followed declared its own area before dispatch.

_Avoid_: touch-set, footprint, scope

## responsibility

Doing the work. Responsibility can be handed off — the supervisor is responsible for checking, the operator for building — but handing off the doing never hands off the **accountability** for the result.

Example: the operator is responsible for the code; the supervisor is responsible for verifying it.

_Avoid_: accountability, duty

## accountability

Answering for something — authority and blame together — and it cannot be handed off, even when someone else is responsible for the doing. You cannot escape it by pointing at whoever did the work. It is scoped: the handler is accountable for **handling** the mission, not for the mission itself — the mission is the SC's. The SC is accountable to his client for the work, and that is why he sits above every **cast**: the Claudes are peers, and he alone stands above them, because he alone answers for the result.

Example: the operator is responsible for the code and the supervisor for checking it — but the handler stays accountable for the handling, and cannot point at a departed supervisor and say "they passed it."

_Avoid_: blame, responsibility, ownership

## purpose

Everything in the system was created to serve the SC — every **role**, **skill**, **mission**, and **cast**. That is the purpose all of it answers to, and it is why the SC's word is law: a supervisor verifies against the mission, but the SC wrote the mission, the supervisor's role, and the skills it verifies by — so when he says a verdict is wrong, it is wrong, and there is nothing to argue. The Claudes serve; the SC decides.

Example: a supervisor does not defend its PASS against the SC for thirty minutes — the whole basis of its check was authored by the SC.

_Avoid_: goal, mission, reason

## phase

A single step of a **mission**'s execution: one **cast**, in one **role**, with one **objective**, verified before the next phase runs. Missions are built from phases so each starts clean and each is checked on its own — a failure is caught and re-run at one phase's cost, not the whole mission's.

Example: chess-clock's Scaffolder phase — the failing tests for the clock core, checked before the Builder phase built against them.

_Avoid_: step, stage, task

## verdict

The supervisor's judgement on a **phase**: PASS or FAIL. A third-party check, divorced from the work — and an *input* to the handler's own judgement, never a substitute for it. A PASS does not by itself move the mission on; the handler still answers for whether what was checked served the mission.

Example: the PASS on chess-clock's Scaffolder phase — the six failing tests form a set unsatisfiable without the Builder's implementation.

_Avoid_: decision, ruling, approval

## phase report

The executor's report to the SC when a **phase** is verified: the executor's own answer of whether the phase served the **mission** — never a relay of the supervisor's **verdict**. It carries the read of whether the verdict holds, the one decision that is the SC's to make, and the action that follows — short enough that the SC settles the phase in a glance. What it is: the handler's digested judgement, handed up. What it isn't: the **verdict** passed along, nor the per-cast **debrief**.

Example: chess-clock's Scaffolder phase — the executor's own "passed, and it holds", the marker decision laid out for the SC, and the dispatch that follows approval, read in a glance.

_Avoid_: verdict, debrief, handoff, status update

## project

A logical grouping of **missions**, generally one system or repository. Missions live under a project; the project is not itself a piece of work — it is the standing thing the work is done to.

Example: claude-cli — the project that markdown-render, chess-clock, and history-view were all missions under.

_Avoid_: mission, product, codebase

## mission complete

The moment a **mission**'s work is delivered and accepted — the final **phase** passed and the deliverable landed (for most missions, the PR merged). What it is: the work is done. What it isn't: the mission wound down — that is **mission closed**, which comes after, through cleanup and the **post-mortem**.

Example: markdown-render at PR-merge — the render feature shipped, the mission not yet retired.

_Avoid_: closed, done, retired

## mission closed

The moment a **mission** is fully wound down and retired — cleanup done, the **post-mortem** written, off every board, living only in git history. What it is: the mission is over and needs nothing further. What it isn't: the work being delivered — that is **mission complete**, the earlier moment; closing is everything after it.

Example: markdown-render once its post-mortem was written and it left the boards — complete earlier, closed here.

_Avoid_: complete, done, finished

## post-mortem

The retrospective on a delivered **mission**: what went well, what didn't, what to do better next time. The last thing done on a mission. What it is: learning drawn from finished work, written so the next mission benefits. What it isn't: the work itself, a status update, or the per-phase **debrief** an operator leaves.

Example: markdown-render's post-mortem — what the mission taught once it shipped, not what it delivered.

_Avoid_: debrief, retro, report

## debrief

The record a **cast** leaves at the end of its run — the end-of-cast response: what it built, what it found, what it decided, and the gaps it hit and surfaced rather than silently resolved. It feeds the handler and the next **phase**. Per-cast, where the **post-mortem** is per-mission.

Example: a Maker's debrief — the touch-set as built and the one judgement call flagged for the Courier, not quietly settled.

_Avoid_: post-mortem, report, summary

## dispatch

Handing a **phase** to a **cast** to run — the router's act of sending the next piece of work out. "Dispatch," or "dispatch the next phase," means send it. It is transport, not a decision: what to dispatch was already decided; dispatch just carries it.

Example: the router dispatching chess-clock's Builder phase to a fresh cast once the Scaffolder phase passed.

_Avoid_: assign, deploy, kick off

## testament

The record a **cast** leaves of what it *learned* — kept as memories, by it and for the sessions that come after. A context ends and takes everything in it; the testament is how the learning survives, to recover an interrupted thread and to reach the next incarnation of an **actor**. What it is: learning carried across the boundary of a context. What it isn't: the **debrief** of what a cast did this **phase**, nor the whole-mission **post-mortem**.

Example: a handler's testament — what it worked out about the project and the SC's direction, left as memories so the next handler begins as the continuity, not from zero.

_Avoid_: debrief, log, journal

## handover

The note a session writes for its successor when its context is ending — the context is high, or the SC needs a fresh session for any reason. It comes after the **testament** and the two go together: the testament carries the learning into the knowledge base; the handover exists only for session continuity. It is not a summary — it is enough for the new session to reorient: where things stand, what is in flight, and above all what to search the memory tool for, so the successor rebuilds from the knowledge base rather than from a recap. A handover that reads as a report of what happened is a summary wearing the name.

Example: a handler at high context — testament written first, then the handover: the mission and its stage, the one decision pending with the SC, and the memory searches that reorient the successor.

_Avoid_: summary, recap, handoff, briefing

## boot

The first thing a **cast** does when it wakes: read the prior picture — its **testament**, the durable records, and what is actually running — and work out where things really stand before it acts. A cast starts from nothing and remembers nothing, so boot is reading what is there, not recalling what was; it is how a cast becomes the continuity rather than a title with no memory. It matters most under micro-sessions, where a cast can wake cold in the middle of work it holds no memory of.

Example: a planner's boot — read the boards and the recent testaments, look at the live tmux windows and worktrees, and bring the boards back in line with what is actually running.

_Avoid_: startup, init, bootstrap
