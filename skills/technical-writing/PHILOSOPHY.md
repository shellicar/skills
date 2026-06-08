# technical-writing: editorial context

This file is the editorial context for the `technical-writing` skill. Read it before modifying `SKILL.md`.

## Why this skill exists

The diff shows what changed. Writing shows what it means. These are different things, and writing that duplicates what the diff already shows contributes nothing.

"Move function to x.ts" is the canonical failure. The reader can see the move from the diff. The commit message that says "Move function to x.ts" uses its one opportunity to add meaning — and repeats what is already visible. The reader is no better informed than before they read it.

The same failure appears in PR descriptions that list which functions were added, work item titles that name the class being modified, code comments that restate the line they sit above. All of them describe the how; none of them supply the why.

## Origin

Claude defaults to describing implementation when writing technical text. Asked to write a commit message, it describes what was done: what was added, what was refactored, what was moved. This is what is visible in the work — the mechanics. It is not what is missing from the work. What is missing is intent: why this change, what it enables, what problem it solves.

The failure becomes obvious when you read history. A git log full of "Refactored X for clarity," "Move Y to z.ts," "Update A to use B" is a log where every entry describes the diff you could already read. It adds no information.

## Key insights

### Code shows the how; writing shows the why

You can use science to determine how a cake was made — what went into it, what temperature it was cooked at. You cannot use science to determine who made it, who it was for, or why it was made that day. Code and diffs show the mechanics. Writing supplies the layer the code cannot: intent, context, significance.

This is not a metaphor for being verbose. It is a constraint on what writing should contribute. If the writing says something the reader could learn by reading the code, it has not contributed anything.

### "Move function to x.ts" vs why it was moved

Both describe the same change. Only one adds something. "Move authentication logic out of the request handler so it can be tested without a network" — the reader now knows something the diff cannot show them: the reason, and what it enables.

### The test before writing

If a reader had the diff in one hand and the message in the other, does the message add something the diff does not? If not, rewrite it. If the verb could apply to almost any change in the codebase — *configure*, *update*, *improve*, *refactor* — it is a category label, not a description.

## What was rejected

- Treating this as a style preference. It is not about tone or voice; it is about whether writing contributes anything the code does not already say.

## What this skill does NOT cover

- Stephen's personal voice preferences — `sc-ghostwriting`
- Artifact-specific format rules — `sc-commit-writing`, `sc-pr-writing`, `sc-workitem-writing`
- Writing principles for non-technical audiences — `professional-writing` (when it exists)

## Notes for future editors

- "Effect not implementation" is load-bearing. Edits that soften this into general clarity advice have lost the principle.
- The test ("if a reader has to open the diff") is what makes the principle checkable. Keep it.
- The cake analogy is worth preserving — it captures the distinct contribution writing makes beyond what code already shows.
