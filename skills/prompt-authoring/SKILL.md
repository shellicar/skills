# Prompt authoring

**Skill** (loaded by the `scribe` role). The reusable craft of writing a prompt well — true for any prompt, anywhere.

## Writing for a literal reader

Operators run on the current top model (Opus 4.8). Older models are a false economy: in benchmarking, each pre-4.8 model resolved fewer problems, and the cheaper ones often cost *more* per resolved unit, not less. Drop to a cheaper model only when the absolute cost of the work is trivial regardless, where the choice doesn't matter. Either way, the operator follows prompts literally. Every fabricated specific ends up in the code. Write accordingly.

### Say what to do

Positive instructions. State the action, not its absence.

**Weak**: "Don't create helper scripts."
**Strong**: "Use the tools that already exist. If you reach for a helper, stop and report."

**Weak**: "Don't over-engineer."
**Strong**: "Build only what this mission names. If you notice something else that should change, record it in the debrief as a gap."

### Give the reason

The operator generalises better when they know why. A rule without a reason becomes a rule to work around.

**Rule only**: "Use `expandPath`."
**Rule with reason**: "Use `expandPath`. It already handles `~` and `$VAR` expansion via `IFileSystem`. Reimplementing produces a second path utility that can drift."

**Rule only**: "Stage explicitly. No `git add .`."
**Rule with reason**: "Stage by explicit filename. `git add .` pulls in files you didn't intend to commit, including unrelated work that was in the tree when you started."

### Match the style

Prompt style influences output style. A terse prompt produces terse code. A prompt that lists every edge case in excruciating detail produces a commit message that does the same. Write prompts in the voice you want the output in.

### Naming

Frame branch names, PR titles, and commit messages in terms of the user-visible effect, not the internal mechanism. The diff shows what changed. The name explains why.

## Findings, not rules

Two ways to write the same content:

**Rule**: "Do not modify files outside the ones listed."
**Finding**: "From the investigation, the cause is in `parser.ts:84`. The bug surfaces in `options.ts` but the fix lives in `parser.ts`."

The rule traps the operator if the fix actually requires a third file. They are caught between the rule and the goal — they fail one or the other. The finding gets updated when reality differs; nothing breaks.

A finding carries its WHY — *from the investigation*, *because the bug is at X*. The operator can see where the claim came from and revise it when they find more. A rule hides its source, which is what makes unsourced rules easy to write and dangerous in practice.

## Context

Inline the context the operator needs. When you have investigation findings, bake them in: file paths, line numbers, root cause analysis, decisions. The operator should not re-investigate what you already know.

Long-form investigation output belongs in a separate document the operator reads. Point to it. Do not paste it in full; the operator reads it if they need it.

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

## The operator follows what you write

The operator runs the prompt literally. Whatever you put in lands as work.

- A finding lands as a starting point the operator uses and updates as they learn more.
- A rule lands as obedience, including when the rule is wrong.
- An ambiguity lands as the operator's interpretation, which you cannot predict.
- An absence lands as the operator's initiative — they ask, or they fill in with their own judgment.

When something goes wrong, look at what you wrote.
