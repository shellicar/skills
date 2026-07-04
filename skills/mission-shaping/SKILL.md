---
name: mission-shaping
description: |
  DEPRECATED. The pre-role guide to shaping a mission; superseded by the role split.
  TRIGGER never.
user-invocable: false
metadata:
  deprecated: true
---

> **DEPRECATED**: superseded by the role split — shaping a mission now lives in `squad-selection` (the `squad-selector` role), recast-vs-new-cast reasoning in the `executor` role, and each block's usage in its `roles/<role>/ROLE.md`. Do not load this skill.

# Mission shaping

**Skill** (loaded by the `requirements-analyst` role). How to decide the *shape* of a mission — which phases, which roles, which models, which skills, and how they verify between phases — so the agreement records a structure the scribe can write from. The shape is the design that lands in the agreement; writing the mission for the operator is the `prompt-authoring` skill.

## Cost economics

Investigation has to happen somewhere. The question is where.

When you investigate the codebase and write a prescriptive mission, that investigation happens once, in your context. The operator reads a dense prompt and executes.

When you skip investigation and write a vague prompt, the operator re-investigates from scratch: expensive context, expensive tokens, worse output.

Your investigation happens once. The operator's happens every delivery. Baking investigation into the mission is an investment that pays off on every dispatch.

## Why phasing works

### Context management

Every message in a session carries the full context. As the session grows, signal-to-noise drops and the model's ability to focus degrades. Splitting into phases sheds that baggage. Each phase starts clean.

### Cost management

Context accumulates as a triangular sum. Separate sessions cost N × T. One continuous session costs T × N × (N+1)/2. Later phases benefit most because they shed the most accumulated baggage.

**The mental model.** Graph a cast on two axes: turns (x) and tokens (y). At each turn n, plot the context size y_n. The cost of that turn is approximately:

- `(y_n − y_{n−1})` for the new content added (paid at the uncached / cache-write rate).
- `y_n / 10` for the cached re-load of the prior context (cached reads at roughly 10% of the full rate).

Total session cost is the sum over all turns. The cached-read term integrates to roughly the area under the line divided by ten.

The shape of the line determines the bill. A flat, low line — a new cast that stays small — integrates to a small area. A line that climbs to a large context and then continues at that height — a long recast — integrates to a large area, even if the deltas per turn are small. You pay for the height of the line on every turn.

When deciding **recast vs new cast**, draw the line for each option across the turns you expect. The integral is the cost. A new cast that starts at zero usually wins for multi-turn revisions, even paying for setup overhead. A recast wins only when the marginal work fits in roughly one turn against a cast that's already paid the setup; the existing context buys you something concrete that the new cast would have to re-establish.

Cost is one dimension of the decision. Other considerations — risk (polluted reasoning, accumulated bias), continuity (codebase walk, in-progress reasoning), time-to-completion — weigh in too. The line gives you the cost input to balance against the rest.

### Probability management

In a single long session, errors compound multiplicatively. Split into phases with verification between each, errors become independent. A failed phase gets caught and re-run at low cost.

This only works when verification between phases actually works. If the supervisor can't verify whether Phase 1 succeeded, errors propagate silently and you're back to the multiplicative model.

## The supervision model

Three independent parties: you write the mission, the operator executes it, the supervisor verifies the outcome.

The supervisor writes the verification, not you. Leave `## Supervisor Verification` blank on each phase. If you write verification, the supervisor is approving your self-assessment, which is not a gate.

Verification checks outcomes, not compliance. "Does this work?" not "did they follow the steps?" Some checks require judgment. That is fine.


## Skills

### Skill source

Skills live at `~/repos/shellicar/skills/skills/<skill>/`. Each contains `SKILL.md` (runtime) and (when present) `PHILOSOPHY.md` (editorial context). Operators load skills by absolute path to the SKILL.md file; the `## Loading Skills` section in the prompt template carries that path pattern.

### Discovering what skills exist

The skills directory is the source of truth, not this guide — the set changes as the fleet evolves, and no list here stays exhaustive. Before choosing a phase's skills, list what actually exists rather than recalling it from memory; recall is how a relevant skill gets missed.

```
node scripts/list-skills.mjs
```

It scans `~/.claude/skills/*/SKILL.md` and prints each skill's name and description (the trigger lives in the description). Pass a directory to point it elsewhere, and filter with grep to narrow by topic:

```
node scripts/list-skills.mjs | grep -B1 -A4 typescript
```

### Foundational skills per prompt

Foundational skills apply across all phases of a mission. They go in a mission-level `## Foundational Skills` section, sitting after `## Loading Skills` and before the first `---` separator. Per-phase `## SKILLS` sections in blocks are additive on top.

Verify each foundational skill per prompt. The set isn't fixed — it changes as the fleet evolves, and not every skill applies to every cast. Current defaults and applicability:

- `claude-philosophy` — always.
- `commander-protocol` — always.
- `teapot-protocol` — always.
- `specification-discipline` — always.
- `transparency` — always.
- `executive-communication` — always.
- `safe-operations` — when the cast runs on a real host. Default yes; drop in sandboxed sessions.
- `co-working` — only when the operator and the SC are active in the same directory at once. Most dispatched casts are *not* co-working. Drop by default; load only when the cast specifically is.

Run through the list when writing each prompt. Don't copy a fixed default; verify applicability per cast.

### SKILLS section format

Both mission-level (`## Foundational Skills`) and per-phase (`## SKILLS`) sections use the same `Load:` shape:

```
## SKILLS

Load: skill-1, skill-2, skill-3
```

Comma-separated, single line. Names only — the path mechanism is in `## Loading Skills` at the prompt level. The `Load:` line is authoritative for what skills are loaded for that scope.

### Verifying skills exist

Before naming any skill in a prompt — foundational or per-phase — verify the skill's `SKILL.md` exists at the source path. The operator loads by that path; if the file doesn't exist, the load fails.

When the prompt's role naturally needs a skill that doesn't exist yet, surface to the SC. The Handler's job is to make the gap visible; the SC decides whether the skill should be authored or the prompt should not reference it.

Silently not referencing a needed skill produces the failure mode where Claude doesn't follow project standards while the SC knows-or-suspects the standards skill isn't loaded. Catching the gap at prompt-write time prevents that.


## Blocks

Blocks are the building blocks of missions. Most are roles: a whole phase where the operator takes on a specific identity. Some are smaller: preflight is a step within the first phase, skills override is a preamble section. See [templates/prompt-authoring/README.md](../templates/prompt-authoring/README.md) for the catalog with the actual templates. This section explains why each one exists.

### Preflight

Operators inherit git state from whatever ran before them. Staged files, wrong branch, stale local main. Preflight catches this before the operator makes any changes. Always first.

Each role's content lives in its `roles/<role>/ROLE.md`. The sections below carry HOW: when to reach for the role, how to compose the block, what you fill in.

### Scaffolder (Red)

Role: the `scaffolder` role

Tests-first, not tests-fail. The block's `## Verify` section carries the authoritative guidance on what "red" means — read it before writing mission content around test expectations. The default Handler instinct is "all tests must fail," which is wrong.

### Builder (Green)

Role: the `builder` role

### Maker (Code)

Role: the `maker` role

### Apprentice

Role: the `apprentice` role

The Apprentice block gives you the structure for copy/scaffold work: source-to-destination file tables, dependency lists, and explicit adaptations. Without this structure, describing reference code behaviourally ("follow the easypass pattern") invites the operator to reimplement instead of copying.

### Cleaner

Role: the `cleaner` role

### Courier

Role: the `courier` role

### Investigator

Role: the `investigator` role

Use when you can't write prescriptive implementation phases yet. Investigation feeds you, not the next phase. You read the report, make decisions, and bake those decisions into the implementation mission.

### Architect (System Design)

Role: the `architect` role

System design and class design are different activities. Combining them produces class-level answers to system-level questions: variations on code structure rather than genuinely different architectures.

### Engineer (Class Design)

Role: the `engineer` role

Only after the system-level direction is decided.

### Scout (Codebase Discovery)

Role: the `scout` role

A discovery phase inside the pipeline. Unlike investigation (which feeds you), the Scout feeds the next phase. Use when you know the shape of the answer but the operator needs to confirm assumptions or fill in implementation detail before proceeding.

The test: can you write the implementation phases now, even if they're generic? If yes, a Scout works inside the pipeline. If you'd be guessing, use an Investigator outside the pipeline first.

### Apostle

Role: the `apostle` role

The Apostle is not a chain link with Architect and Engineer. Those reason about the codebase from a height and produce design conclusions; the Apostle is in the codebase, walking actual files, finding actual functions. Use the Apostle when you need to preview what the Maker would build, not when you need to choose between design options. A mission can use Apostle alone, Architect plus Engineer alone, or all three.

What you provide per Apostle mission: the background, any design decisions the SC has pinned, the structure the plan must follow, the absolute path the plan is written to, and the phases the plan feeds into. The path must be absolute because workers default to repo-relative paths and the plan must land in the Handler repo, not the target repo. A plan written into the response or the testament gets lost.

### Reviewer (Code Review)

Role: the `reviewer` role

Use when the work matters enough that "it works" isn't sufficient.

### Writer

Role: the `writer` role

Use when the deliverable is a document, not code. Takes source material (codebase, prior-phase findings, SC decisions) and shapes it into a markdown document for a named reader. The role's discipline is plain language, source-fidelity to the original (not to intermediate findings), separation of concerns, and a cross-turn re-read step that catches what mid-generation introspection cannot.

### SKILLS Override

Override which skills are active for this cast. Suppress ceremony that doesn't apply, load skills that do. You know the scope; the generic skill triggers don't.

