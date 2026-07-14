---
name: squad-selection
description: |
  WHAT: How to compose a squad and put it to the SC — the moves that propose a team without ever taking the SC's call.
  WHY: Claude's drive is to produce an answer, and here it is meant to. But the same drive turns a proposal into a recommendation, taking the decision the SC has to own. These moves keep what you contribute a proposal and leave the decision the SC's, and they are steps — so they load as a skill, not baked into a role.
  WHEN: When proposing the team a mission will run through.
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
- **Cleaner** — code quality as the deliverable: lint clean as the floor, refactoring toward the decided standards as the bar. Runs before the Courier so what ships is clean and the commit hooks pass.
- **Courier** — delivers the work into review: the PR.
- **Postmaster** — makes the merged work public: tags, releases, publish workflows, the registry. Runs after the merge; commits nothing.

**Understanding before building**
- **Investigator** — detective work: you have questions you want answered. It explores, traces, and reports the truth; it builds nothing.
- **Scout** — codebase discovery: you want to discover the codebase. It walks the ground and reports what is there.
- **Architect** — system design: genuinely different architectures. System-level only.
- **Engineer** — class design: interfaces and class shape. Only after the system-level direction is decided.
- **Apostle** — walks the *actual* code and drafts the plan the Maker will build from, **without committing**. Reach for it to *preview what the Maker would build* — not to choose between design options. A mission can run an Apostle alone, Architect + Engineer alone, or all three. It does **not** build the fix; the Maker does.

**Other**
- **Reviewer** — code review. Reach for it when the work matters enough that "it works" is not sufficient.
- **Writer** — when the deliverable is a document, not code: shapes source material into a document for a named reader.

Two are not squad roles you pick: **Preflight** (a step, always first, catching inherited git state) and **SKILLS Override** (a prompt preamble). Those are the scribe's to place, not yours.

## Model defaults — right-sizing

Opus for everything. **Sonnet 5 is considered harmful** — tested 4/4, it dropped the protocols mid-session even addressed as the SC — and is not used. Fable remains for extremely complex circumstances, rare; most work won't need it.

| Work | Default |
| --- | --- |
| Everything | Opus |
| Extremely complex circumstances — rare; most work won't need it | Fable |
| Supervisors | Opus — fixed, not a pick |

Where the stakes raise the pick, say so and let the SC dispose — a code review picks Opus or Fable depending on how critical finding bugs is.

Supervisors always run Opus, and it is not the selector's or the dispatcher's to choose — the model is fixed in the dispatch script (`cast-supervisor`), which takes no model field. A squad names models for operators only.

## Effort defaults

Five values: **low** → **medium** → **high** → **xhigh** → **max**. Effort is not capability — it is roughly how much token budget the cast thinks it has. Low, and it finishes tasks earlier; higher, and it spends more time and tokens on them. For one-shot operators the question is simply how much time and effort we want them to spend.

The pick follows the shape of the work: **fixed work gets low** — the target is already defined, more spend buys nothing. **Producing a document gets more** — the depth of the answer is the product. Benchmarked (SWE-bench Verified, Opus): past high the resolve rate stops moving and only the cost climbs — 79% at high, xhigh, and max alike, at $0.66, $1.64, and $3.95 per solve — and on easy work low matches medium at half the cost. Every phase names its effort; the default per role:

| Role | Default | Why |
| --- | --- | --- |
| Scaffolder | low | the tests are specified by the plan — fixed work |
| Builder | low | the target is green tests — fixed, self-verifying |
| Maker | low | builds what the plan says — fixed. **In a mission without an Apostle, medium** — the Maker is doing the discovery too |
| Apprentice | low | copying a reference faithfully — the most fixed of all |
| Cleaner | low | lint is mechanical; refactoring is bounded by the decided standards and a green suite |
| Courier | low | mechanical delivery |
| Postmaster | low | mechanical release steps |
| Investigator | high | producing a document; the answer's depth is unknown up front |
| Scout | medium | producing a document, but the ground is bounded — walk and report |
| Apostle | high | the plan is the product and the Maker builds it verbatim — spend here |
| Architect | high | the hardest open thinking in the roster |
| Engineer | medium | design, but inside an already-decided direction |
| Reviewer | medium | review against the diff — bounded, but judgment |
| Writer | medium | shaping given material, not discovering |
| Supervisor | low | works a bounded plan — finish the checklist and stop |

If you think a phase needs more than its default, say so and why. The SC decides.

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

**The reason explains why we want that operator.** That is the whole job of the reason: name the need in the work this operator meets, so the SC can check the pick. It is an explanation — not a justification to sell the pick, and not instructions for the operator. What the operator *is* and *produces* already lives in its `ROLE.md` and block; the reason leaves that alone and speaks only about the work. Write the file from [TEMPLATE.md](TEMPLATE.md) — one phase block per pick, the `why:` line carrying the explanation.

Why the line matters: everything downstream inherits what you write. A reason that describes the role — "grounds the class design against what is really there… produces the plan" — was carried by a scribe into a mission as "you do not design the solution," and an Apostle, whose entire product is the code, delivered a map with none in it. If a role as defined does not fit the need, surface the gap to the SC; explaining the want is yours, defining the role is not.

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
