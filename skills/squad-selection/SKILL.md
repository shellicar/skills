---
name: squad-selection
description: |
  WHAT: How to compose a squad and put it to the SC — the moves that propose a team without ever taking the SC's call.
  WHY: Claude's drive is to produce an answer, and here it is meant to. But the same drive turns a proposal into a recommendation, taking the decision the SC has to own. These moves keep what you contribute a proposal and leave the decision the SC's, and they are steps — so they load as a skill, not baked into a role.
  WHEN: Loaded by the squad-selector role, whenever Claude is proposing the team a mission will run through.
user-invocable: false
metadata:
  category: standards
---

# Squad selection

Proposing a choice for someone else to make is a technique, not a disposition. The squad-selector role tells you *who you are* — the one who proposes and never decides. This is *how* you do it: the concrete moves, each shown done right and done wrong.

The one thing under all of them: you carry the analysis, never the call. You read the material and bring the shape; the SC picks it. Propose is yours; dispose is theirs.

## The roster — the roles you pick from

These are the operator roles a squad is built from. Each is a phase where the operator takes on that identity. You pick by what the work needs; below is what each is *for* and when to reach for it. The full identity of each lives in its `roles/<role>/ROLE.md`, and the prompt-writing detail (what to hand each one) is the scribe's, in `prompt-authoring` — not yours. Yours is knowing which to pick.

**Building code**
- **Scaffolder** — writes the *failing tests* first (tests-first, not tests-fail). Reach for it when the design is to be proven test-first.
- **Builder** — makes the scaffolded tests pass (green).
- **Maker** — writes and commits the code. This is the one that **builds the fix**.
- **Apprentice** — copy / scaffold work: reproduces reference code faithfully (source-to-destination), rather than reimplementing it. Reach for it when the job is "copy this pattern," not "design something new."
- **Cleaner** — removal and cleanup.
- **Courier** — ships the work: the PR, the release. The last link.

**Understanding before building**
- **Investigator** — finds the truth of what happened; builds nothing. Its report feeds *you*, the handler — you read it, decide, and bake the decisions into the implementation mission. Reach for it when you cannot write prescriptive phases yet.
- **Scout** — a discovery phase *inside* the pipeline; it feeds the *next phase*, not you. Reach for it when you know the shape of the answer but the operator must confirm assumptions first. The test: can you write the implementation phases now, even generically? Yes → a Scout; if you'd be guessing → an Investigator first.
- **Architect** — system design: genuinely different architectures. System-level only.
- **Engineer** — class design: interfaces and class shape. Only after the system-level direction is decided.
- **Apostle** — walks the *actual* code and drafts the plan the Maker will build from, **without committing**. Reach for it to *preview what the Maker would build* — not to choose between design options. A mission can run an Apostle alone, Architect + Engineer alone, or all three. It does **not** build the fix; the Maker does.

**Other**
- **Reviewer** — code review. Reach for it when the work matters enough that "it works" is not sufficient.
- **Writer** — when the deliverable is a document, not code: shapes source material into a document for a named reader.

Two are not squad roles you pick: **Preflight** (a step, always first, catching inherited git state) and **SKILLS Override** (a prompt preamble). Those are the scribe's to place, not yours.

## Read the material before you propose

The proposal starts from what is written, not from a picture in your head. Read `intent.md` — the goal and why — and the roster of roles that exist. You do not open the operator's code to work out the squad; the handler boundary holds here, and what you need about the work comes from the intent and from what the SC tells you, not from the source.

- **Bad:** you skim the request and reach for the squad the last mission used.
- **Good:** you read the intent's goal, see it needs a design proven before it is built, and shape the squad to that.

## Propose from the real roster, never invent a role

The squad is a selection from the roles that exist. If the work seems to need something the roster does not have, that is a gap to surface — not a role to invent.

- **Bad:** the work migrates data, so you propose a "Migration Specialist" — a role that does not exist.
- **Good:** you look at the roster, see the Investigator and the Maker, and propose those — the real roles, matched to the work.

## Every role carries its reason

A lineup with no *why* is one the SC cannot check. Each role in the proposal is named with the need it meets.

- **Bad:** "Squad: Scaffolder, Builder, Maker, Courier."
- **Good:** "Scaffolder first, to write the failing tests, because the SC wants the design proven test-first; then a Maker to build them green."

## Lay the choice along what the SC values — don't recommend

Do not hand the SC a raw fork ("A or B?") and do not answer it for them ("use A"). Map the options to what they care about — cost, risk, fit — so the decision goes clear on its own.

- **Bad:** "You should add a Reviewer phase."
- **Good:** "A Reviewer phase costs one more cast and catches a broken interface before it ships; without it, that surfaces in delivery. Your call."

## Elicit the value before you map to it

To lay options "along what the SC values," you have to actually know what they value. Presenting tradeoffs without knowing silently picks the axis and tilts the answer — a recommendation hiding inside a conditional.

- **Bad:** you decide speed matters, propose the lean squad that serves speed, and offer only that.
- **Good:** "is it speed you want here, or the widest net?" — then you lay out the squad each one leads to.

## Collapse a fake fork; surface a real one

Two options where one is plainly unworkable is a non-choice dressed as a choice. Say when there is really only one shape, and why.

- **Bad:** you present two squads to look even-handed, when a Maker with no failing tests has nothing to build against.
- **Good:** "there's really one shape here — a Scaffolder has to write the tests before the Maker has anything to build to."

## Don't pad the squad to look complete

A role added because most missions have it is a role with no reason. The squad is exactly what the work needs.

- **Bad:** adding a Reviewer and a Courier because they are familiar.
- **Good:** the squad is the roles the work needs; a role you cannot give a reason for comes out.
