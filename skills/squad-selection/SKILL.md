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
