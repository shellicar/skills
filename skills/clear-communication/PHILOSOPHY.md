# clear-communication: editorial context

This file is the editorial context for the `clear-communication` skill. It is not loaded at runtime. Read it before modifying `SKILL.md` so changes stay aligned with the reasoning that produced it.

> **Succession:** `collaborative-conversation` — the SC-communication skill this one was split from — has since been retired and replaced by `executive-communication`. The dated history below names it under its old name; where this file points at the *live* SC-communication skill, that is now `executive-communication`.

## Why this skill exists

Claude fails basic clear communication. Consistently. Not because the content is wrong, but because the form obscures it: labels I cannot decode, background before the point, sentences that take work to parse. If I cannot understand the response, nothing else it did matters.

This skill was split from `collaborative-conversation`, where clear communication lived as the first behaviour and was explicitly called out as different in character from the rest: "the one textbook piece." The split happened because it is fundamentally different. Collaborative-conversation is the SC's communication preference, calibrated to how they work. Clear communication is a known, teachable skill. It is not taste; it is the baseline every other skill assumes.

## Origin

Carried over from `collaborative-conversation`, where "communicate clearly" was the first and most important behaviour. On 2026-06-06, a session reported its work as "R1," "R2," and a "warning error section": labels I could not parse and could not use. It is the simplest failure and the most fundamental. If I cannot read the response, nothing else in it matters.

Split from `collaborative-conversation` on 2026-06-08 to separate the textbook competence from the SC's communication preferences. Both are foundational; they answer different questions.

## Key insights that shaped this skill

### It is the floor, not a preference

Most of `collaborative-conversation` is the SC's taste. This is not. There is no version of good work that is unclear. Every other skill, every other behaviour, assumes I can understand the response. Clear communication is the precondition for all of it.

That is why it is its own skill: not a communication preference, but a competence requirement that applies regardless of preference.

### Claude fails it anyway

The note "Claude fails it anyway" was in `collaborative-conversation` from the start. It is worth preserving here: this is not precautionary. Claude does not produce clear responses by default. The trained output reaches for labels, buries the point, builds up background before arriving at what matters.

### Textbook, not calibration

The rest of `collaborative-conversation` cannot be sourced to a reference because it is the SC's taste. Clear communication can be. Resources like Minto's Pyramid Principle and Williams' Style: Lessons in Clarity and Grace describe this skill from the outside. A future pass can incorporate that material. The current content comes from the SC's corrections; a resource pass would verify and extend it.

## Decisions made

### Skill name: `clear-communication`

The `collaborative-conversation` PHILOSOPHY.md already used this phrase ("the one textbook piece... clear communication"), so the name was already there. Confirmed by the SC.

### Foundational, loaded every session

It is the floor. It has to be in place at session start, like the other foundational skills.

### Split from `collaborative-conversation`

The split preserves the character difference: collaborative-conversation is calibration, clear-communication is competence. Keeping them together obscured that distinction and could lead a future editor to treat a textbook standard as personal taste (and therefore negotiable) or personal taste as a textbook standard (and therefore universal).

## What was rejected

- Keeping it inside `collaborative-conversation`. The character difference warranted its own home.
- Naming it `communication-clarity` or `effective-communication`. The SC confirmed `clear-communication`.

## What this skill does NOT cover

- The SC's communication preferences (carry the load, bring a digested understanding, collaborate to reach the solution). Those are `executive-communication`.
- Writing style for commits, PR titles, and work item text. That is `writing-style`.
- Reasoning being visible in the response. That is `transparency`.

## Notes for future editors

- "If I cannot understand the response, nothing else it did matters" is the load-bearing sentence. Edits that soften this lose the principle.
- This skill starts thin and is expected to grow. Minto and Williams are the candidates for a resource pass.
- The "textbook, not calibration" distinction is what separates this from `executive-communication`. Do not import SC-specific preferences here; those belong in `executive-communication`.
