---
name: skill-philosophy
description: |
  WHAT: Every skill in this repo has two files: SKILL.md (runtime content) and PHILOSOPHY.md (editorial context). Creating or modifying a skill maintains both.
  WHY: SKILL.md alone loses the reasoning behind decisions. Future editors modify based on what the SKILL.md currently says without knowing why it says that. Reasoning drifts across edits. PHILOSOPHY.md anchors the why so edits stay aligned with the original intent.
  WHEN: TRIGGER when creating a new skill or modifying any existing one.
user-invocable: false
metadata:
  category: meta
---

# Skill Philosophy

## What

A skill in this repo has two files:

- **`SKILL.md`** — runtime content. Loaded into Claude's context when the skill is active. Operational instructions: who applies it, what it does, when it fires, how to perform the work.
- **`PHILOSOPHY.md`** — editorial context. *Not* loaded at runtime. Read before modifying `SKILL.md` so the modification stays aligned with the reasoning that produced the current content.

Both files are required. Creating a skill means writing both. Modifying a skill means reading the `PHILOSOPHY.md` first, then editing the `SKILL.md`, and updating the `PHILOSOPHY.md` if the reasoning has shifted.

## Why

A `SKILL.md` describes the *current shape* of the discipline. It does not document the reasoning that produced that shape — what alternatives were considered and rejected, what failure modes drove the current content, what to be careful about when modifying.

Without the philosophy, future editors modify `SKILL.md` based on what it currently says. Decisions made for specific reasons can be undone because the reasons are not apparent from the `SKILL.md` text alone. Reframing of original principles creeps in. Patterns that were deliberately rejected get reintroduced. Drift compounds across edits.

`PHILOSOPHY.md` is the anchor. It carries why the `SKILL.md` is shaped the way it is, what conversations produced it, what was rejected and why, what to watch for when editing. The next editor reads it, understands the constraints they operate under, and edits with that context.

## When

- **Creating a new skill**: both files exist before the skill is considered complete.
- **Modifying a `SKILL.md`**: read `PHILOSOPHY.md` first. Decide whether the change is consistent with the recorded reasoning, or whether the reasoning itself needs updating. Update `PHILOSOPHY.md` if the underlying reasoning has shifted.
- **Reviewing a skill edit**: check that the `PHILOSOPHY.md` was consulted. If the edit contradicts the recorded reasoning without updating it, the edit is incomplete.

## How

`PHILOSOPHY.md` follows a consistent shape (see existing `PHILOSOPHY.md` files for templates):

- **Opening paragraph**: names the file and its purpose. States that it is not loaded at runtime, and that it should be read before modifying `SKILL.md`.
- **Why this skill exists**: the foundational problem the skill addresses.
- **Origin** (when applicable): the founding moment or conversation that produced the skill.
- **Key insights that shaped this skill**: load-bearing ideas in their original form.
- **Decisions made**: choices that aren't obvious from `SKILL.md` alone — naming, scope boundaries, voice, structure.
- **What was rejected**: alternatives considered and not adopted, with why.
- **What this skill does NOT cover**: explicit boundaries.
- **Notes for future editors**: specific cautions about modification.

Voice in `PHILOSOPHY.md` is first-person SC, addressed to future editors. Not third-person observation. The `PHILOSOPHY.md` is the SC's editorial context shared with whoever will edit the `SKILL.md` next.

A skill without `PHILOSOPHY.md` is incomplete. Either write the `PHILOSOPHY.md` or do not create the skill.
