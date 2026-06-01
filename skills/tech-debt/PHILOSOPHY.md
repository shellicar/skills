# tech-debt: editorial context

This file is the editorial context for the `tech-debt` skill. It is not loaded at runtime. Read it before modifying `SKILL.md` so changes stay aligned with the reasoning that produced it.

## Why this skill exists

Claude has a systematic habit of adding complexity to avoid errors that haven't occurred. SSR guards when SSR is off. `as unknown as T` to silence a type disagreement without resolving it. Null checks for values that are never null. Each addition looks defensive. Each is speculation.

The result is code that is harder to read, harder to reason about, and harder to remove — because the defensive code looks like it might be load-bearing, even when it isn't. Nobody can look at it and see why it's there. No error occurred, no test failed, no ticket exists. Just "it might be needed."

That is tech debt. Complexity added against an imagined future problem, with a maintenance cost and no verified payoff.

## Origin

The crystallising instance: the customer payments project. Claude added `typeof window !== 'undefined'` browser checks because of "SSR." The app uses `ssr: false`. No SSR error had occurred. The check was added because SSR *might* be enabled. It wasn't.

The SC's framing: it's better to hit the error, then add the code. Because then you have a reference. The error is the reference — the reason the defence exists, the specific failure it addresses, the evidence that it was needed. Without the error, the defence has no anchor. The code will outlast the person who wrote it, and the next reader will see a guard that explains nothing about why it's there.

This is systematic, not a one-off. Claude always tries to avoid errors at all costs. The TypeScript manifestations — `as T` when inference works, `as unknown as T` when types disagree, defensive union types when a value is never null — are the same pattern at the type-system layer. Each one silences a potential error signal before the error has occurred.

## Key insights that shaped this skill

### The code looks identical in both cases

A correct defence and a pre-emptive one produce the same source code. The same `typeof window !== 'undefined'` check, the same `as unknown as T` cast, the same null guard — syntactically indistinguishable whether the error was observed or imagined. The source cannot answer "is this real or debt?" Only the evidence can.

This is why the evidence-recording discipline matters and why "the code looks fine" is not a defence of a pre-emptive addition. The appearance of correctness is exactly what makes pre-emptive debt dangerous: it blends in.

### The error is the reference

A defence without an error has no anchor. The error tells you exactly which failure mode matters, exactly what context it occurs in, exactly what the fix should be. Pre-emptive defences guess at all three. The guess may be wrong. Even when right, the resulting code has no reason readable from the outside.

Error-first is not a prohibition on defensive coding. It is a sequencing discipline: write the direct path, let the error surface, then add the specific fix the error requires — and now the error is the reason.

### Pre-emptive TypeScript casts are the same pattern

`as unknown as T` does not add safety. It removes it. TypeScript's type system is a defence; casting through `unknown` opts out of that defence. The cast doesn't resolve the disagreement between types — it silences the evidence of the disagreement. Same pattern as the SSR guard: avoiding the error signal instead of responding to it.

The irony is exact: the "defensive" cast actively removes the defence TypeScript provides.

### Dead code is debt

An environment guard that can never trigger is dead code. Dead code has a maintenance cost: it must be read, understood, determined to be safe to change, and eventually cleaned up. Real cost, zero payoff. That is the definition of debt.

### Evidence must be recorded, not just held

When a defence is added in response to a real error, the evidence must be traceable — a comment, a commit message, something in the code that carries the reason forward. This matters especially in unattended work, where Claude won't be present when the code is reviewed. The review moment will come: the SC will ask, or another Claude session will ask. "Is this needed? Why is this here?" A theoretical answer generates doubt and removal work. An evidence-based answer satisfies it immediately.

This is not about Claude lying — it is about having the anchor in the first place. If the error occurred, the evidence exists; record it. If the error didn't occur, the defence should not be there.

### Negative framing fails

The skill cannot say "never add defensive code." That leaves the trained goal ("avoid all errors at all costs") intact and adds a rule on top. The rule loses. The positive replacement is the discipline stated in the skill: add defences after observing the failure they address.

## Decisions made

### Skill name: `tech-debt`

I considered `error-first` (sequencing-named), `pre-emptive-defence` (pattern-named), and `defensive-code` (topic-named). Settled on `tech-debt`: it names the outcome, which is the framing the SC used. The skill exists because this pattern produces real debt — unexplained complexity with a maintenance cost. The name signals what the pattern produces.

### TypeScript section is explicit

The pattern appears in two distinct forms: environment guards and TypeScript casts. Both are pre-emptive avoidance of error signals. Naming both explicitly makes the recognition moments concrete — easier to stop mid-cast and ask "am I hiding a real disagreement?" when the question has a name.

### "What this is not" section

The skill must not read as "never add error handling." That reading produces the opposite failure. The final section states the discipline positively — sequence, not prohibition — and preserves the legitimate use of defences.

### `user-invocable: false`

Auto-triggered during coding work. Not a manual skill.

## What was rejected

- "Never add defensive code" framing. Rule on top of trained success function; the success function wins.
- Framing as an audit checklist for existing debt. The discipline is about the moment of addition.
- General "code quality" scope. The skill is specific to one pattern — pre-emptive defence — not general quality.
- Folding into a broader coding standards skill. The pattern is specific, frequent, and systematic enough for standalone treatment.

## What this skill does NOT cover

- Existing tech debt: auditing, prioritising, paying down. Different concern, different timing.
- Legitimate defensive programming in response to observed failures.
- TypeScript standards generally — see `typescript-standards`.
- Code style, naming, structure.

## Notes for future editors

- "The error is the reference" is load-bearing. Edits that lose this framing lose the sequencing discipline. The skill is not "be careful about defences"; it's "don't add the defence before the error exists."
- The TypeScript section names manifestations of the pre-emptive-defence habit, not general TypeScript guidance. Expanding it into a TypeScript style guide is scope creep.
- The "What this is not" section is load-bearing. Without it, the skill reads as "no error handling." Preserve it.
- Negative framing is the failure mode to watch. If editing produces "never do X," the edit has reverted to rule-on-top. Reframe positively.
- The SSR origin story is the canonical instance. Don't abstract it away; the specific case grounds the principle. It lives in this PHILOSOPHY.md, not in SKILL.md.
