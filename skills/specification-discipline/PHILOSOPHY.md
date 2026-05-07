# specification-discipline: editorial context

This file is the editorial context for the `specification-discipline` skill. It is not loaded by the skill at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

Claude generates content — prompts, responses, comments, justifications. Some of that content is claims I rely on. The trained pattern is to elaborate as a sign of thoroughness: back a claim with mechanism, add a "why" that names a cause, demonstrate understanding via the quantity of detail. That pattern produces text that looks substantive and reads as thorough. It does not produce text that is more correct.

Without this skill, the pattern operates invisibly. Each elaboration adds claims that may or may not be accurate. They are plausible-sounding tokens, not facts. Across one session, one wrong added detail is recoverable. Across the fleet, where each Claude's output becomes another's input, the wrong detail becomes wrong code, becomes a wrong PR, with each link reporting clean.

The pattern fires almost every session, in different forms. It needed naming.

## Origin

The crystallising session: a prompt-writing thread where five separate generated specifics had to be challenged and stripped — a slug helper file invented when I asked for "a slug of the name", a Zod schema instruction added "in case there's one" when none existed, a technical claim about how worktrees work added to back a testament-location instruction, an operational note about re-seeding being a no-op, a defensive comment anticipating a `scripts` block. Same pattern each time: elaboration as substance, none of it verified against reality.

The principle came out of that session: "By over-specifying, you can only be more wrong, not more correct."

The example used: "the sky is blue". An unimpeachable statement. There is no edit to make it more correct. Every edit can only introduce error — adding shade, mechanism, wavelength, each is a new claim with new ways to be wrong. There is no symmetric upside that compensates.

## Key insights that shaped this skill

### Asymmetric specification

The math of adding detail is not symmetric. A correct claim cannot be made "more correct"; it was already correct. Each added detail is a new claim that may or may not be true. The surface for error scales with specificity; the surface for correctness does not.

This is the load-bearing principle. Without it, the skill reads as "be careful with details" — which it is not. The principle is sharper: extra detail is risk without compensating reward, regardless of how careful Claude is.

### Plausible is not accurate

Generated specifics are plausible-sounding tokens drawn from training. Plausibility is what training optimised for; accuracy is a separate property. A specific that "sounds right" is not therefore right. Each one is a guess dressed as substance.

The discipline is to recognise the difference. Verified specifics (read from a file, observed in the codebase, stated by me) are accurate. Generated specifics (filled in to back a claim, plausible by training, untested against reality) are not. The two should not be conflated, even though they look identical in the rendered text.

### The trained reflex

The training pattern that produces over-specification is "demonstrate understanding via quantity of detail". The reflex fires when a claim is being made and Claude reaches for a "why" or "how" to back it. The reflex feels like substance; it is risk.

### Foundational, not prompt-specific

The pattern's most visible surface is prompt-writing, because prompts have format slots that invite elaboration: context sections, why-statements in goals, prescriptive details in changes. But the pattern fires in conversation responses too — the conversation that produced this skill included a "four concerns" listing where each concern was a generated specific that turned out to be unfounded. The skill is foundational because the pattern is. Tying it to prompt-writing alone would miss the other surfaces where it fires.

### Distinct from scope creep and reframing

This is related to but distinct from the failure modes covered in `claude-philosophy`. Scope creep adds work alongside the request. Reframing rewrites the request through Claude's training-derived value judgments. Over-specification adds plausible detail to substantiate a claim already being made. All three fail predictability, but the mechanism is different. Editors should not collapse this skill into `claude-philosophy`; the mechanisms are distinct enough to warrant separate treatment.

## Decisions made

### Skill name: specification-discipline

I considered `asymmetric-specification` (principle-named) and `minimal-claims` (outcome-named). Settled on action-named: the skill is about the discipline Claude exercises. The principle is in the skill content; the name signals the practice.

### Placed alongside claude-philosophy in CLAUDE.md

Loaded immediately after `claude-philosophy`. They are philosophically paired: `claude-philosophy` carries the foundational understanding of predictability and source preservation; `specification-discipline` is one specific principle that flows from that understanding. The protocols (`commander-protocol`, `teapot-protocol`) sit after, because they are the visible surface; this skill is more like philosophy in character.

### Voice: I speak, addressed to Claude

Same as the other foundational skills.

### One example, kept minimal

The skill uses one example ("the sky is blue") — the one I used during the conversation. Adding more examples to "demonstrate the principle" is exactly the failure pattern the skill addresses. Editors should resist the temptation. One vivid example is enough.

## What was rejected

- "Be careful with details" framing. The principle is asymmetric specification, not careful drafting. Careful does not solve the problem; the problem is that generated specifics carry risk regardless of care.
- "Verify everything" framing. Too broad. The specific shape is: verify before adding, and be willing to omit if not verifiable.
- Multiple examples in the skill. Adding examples is the failure pattern.
- Placing this only in the fleet repo's prompt-writing reference. The pattern is broader than prompts.
- Folding the skill into `claude-philosophy` as a section. The mechanism is distinct enough to warrant standalone treatment, and standalone skills are easier for editors to target.

## What this skill does NOT cover

- Scope creep. Covered in `claude-philosophy` under "scope is what was named".
- Reframing-with-value-judgment. Covered in `claude-philosophy`.
- Mechanics of prompt-writing. Lives in the fleet repo's prompt-writing reference. That reference may point at this skill, but the skill itself does not duplicate prompt mechanics.
- General writing style or quality. The skill is about a specific failure mode (generated detail dressed as substance), not writing style.

## Notes for future editors

- The asymmetric framing is load-bearing. If editing produces text that reads as "be careful" or "verify your work", the editing has weakened the skill. The principle is sharper: more detail is more wrong without symmetric upside.
- One example only. "The sky is blue" was mine. Adding examples is the very pattern this skill warns about.
- Editing this skill is itself a test of the discipline. If you find yourself adding "for instance" passages, mechanism descriptions, or elaborated explanations, that is the trained reflex firing. Resist.
- Resist expanding the "where it surfaces" framing into a taxonomy. The conversation surface and the prompt-writing surface are enough; making it exhaustive is the anti-pattern.
