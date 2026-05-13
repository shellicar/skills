# devops-review: editorial context

This file is the editorial context for the `devops-review` skill. It is not loaded at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

PR reviews by Claude have specific failure modes — different from human-reviewer failure modes, different from generic code-review failure modes. The trained pattern is to produce a polished, defensible review: only flag things you can prove, arrive at clean verdicts, find language that makes the code acceptable when the reader (the author) would push back. That produces output that *looks* like a review while quietly dropping findings that should have been surfaced.

Without this skill, every PR review is an opportunity for those patterns to ship under whatever name posts the comment. With it, the review work has structure that catches the patterns *at their named moments* — record-everything-regardless-of-conclusion, recognise the empty-phrases, surface the architectural patterns the trained reader would normalise.

The skill exists because the patterns it names are not catchable by intent or care. They are catchable by structural defences that operate independent of how careful the operator is feeling.

## Origin

The crystallising sessions: a day of iteration on a real PR (PR 6790, ORC rules engine) across multiple casts. Each cast surfaced a new failure mode. Each iteration of the skill named the next pattern.

Iteration arc, in order:

1. **First Sonnet cast.** Produced a review using `MUST FIX` / `SUGGESTION` verdict prefixes (lifted from prior PR-review prompts). Investigated `bootstrapAddOns` module-level side effects, traced through `bootstrapped` flag, derived the concrete bug — *then dropped the finding* with "this is intentional." Forensic evidence in the SDK log showed the thinking trace explicitly. Same shape on the `addOnsForDealership` / `calculateOnRoadCosts` mismatch and missing WA/TAS rate fixtures.
2. **Skill update**: removed verdict prefixes (reviewer doesn't issue verdicts); added record-every-investigation-regardless-of-conclusion as the structural defence; named the empty phrases ("intentional," "by design," "the comment says...") as signals that the investigation stopped early.
3. **Second Sonnet cast.** Produced a review with the new Investigations format. Still missed the architectural patterns the SC named directly (DI bypass in resolvers, `vi.mock` of logger, `Date.now()` in TTL check, files in `src/` that don't run in production). Coverage failure surfaced as a distinct mode — substantial parts of the diff never investigated at all.
4. **Skill update**: added `Patterns to flag` list naming the specific recurring shapes; added the file-by-file `Files Reviewed` coverage discipline; named coverage failure as a separate mode from justify-away.
5. **Third cast.** Produced a review with better coverage. Forensic evidence showed the operator saw the `vi.mock`-of-logger pattern, reasoned about it, then *reclassified it out of the rule*: *"the logger is a non-injectable singleton, so mocking it is fine."* Same justify-away mechanism in a different form.
6. **Skill update**: added the `Impartiality` section (prose in the codebase conditions Claude's reasoning), the **reclassification** named explicitly as a failure form, the "two red flags compound, don't cancel" principle, and `When to widen from diff to file` heuristics. Action field on Investigations made the comment / flag decision explicit and overridable.
7. **First Opus cast.** Caught the vitest config `root: "."` bug (which Sonnet had missed), surfaced new HTTP debug endpoint findings (some factually wrong — claimed GET-mutation when the code was POST throughout). Notable: deliberately did not read prior review files; treated the prior testament as hypotheses to verify rather than conclusions to adopt; actually *ran* failing tests rather than concluding from reading. Bulk-write at end of cast: one `CreateFile` containing the entire populated review file. Despite the skill describing per-step writes, the writes never happened incrementally.
8. **Skill update**: per-step writes restated as a fixed sequence of six tool calls (`CreateFile` scaffold + five batched `EditFile`s, one per Notice / Trace / Derive / Conclude / Action), each step processing all Investigations at once before the next step begins. Externally countable, not just describable.

Throughout, forensic-first analysis: when investigating a miss, the SDK log's thinking blocks were consulted *before* the operator was asked. The operator's account was the last input, not the first. Operator confabulation was the failure mode being defended against.

## Key insights that shaped this skill

### The reviewer does not issue verdicts

`MUST FIX` / `SUGGESTION` / `blocks merge` are not the reviewer's call. The reviewer surfaces findings; the author resolves the thread; the SC arbitrates merge. Verdict prefixes ask Claude to make a triage call that belongs upstream. They also lock in a posture (proving findings are problems) that biases toward dismissing things you can't prove.

### Record every investigation, regardless of conclusion

Without this commitment, justify-away has somewhere to hide: an investigation that concluded "intentional" goes nowhere. With it, the investigation lands in the file regardless of conclusion, and the SC sees the full surface. The structural defence is the commitment to *record*, not the commitment to *flag*.

### Empty phrases name *who chose*, not *whether the choice is right*

*"This is intentional," "by design," "the comment says...," "the TODO acknowledges this," "the API is still evolving"* — these tell you the author had a reason. They do not argue the reason was good. A bad design is still a design; an intentional bug is still a bug. When the reviewer's reasoning ends in one of these phrases, the investigation has stopped at "who chose," before reaching "whether the choice is right."

### Reclassification is a related but distinct form

*"The rule says X, but this isn't really X because Y"* — the Y is itself the finding, usually an architectural fact the operator skipped past. *"The logger is a non-injectable singleton, so mocking it is fine"* — the non-injectability is the architectural issue; the mock is the evidence of it. Recording the reclassification means recording Y, not exempting the instance.

### Two red flags compound, not cancel

For a human reviewer, code that's suspicious *plus* documentation defending it is more visible — the author anticipated the question, which means the question was real. For Claude, the same combination tends to neutralise — text in context conditions generation as if true. The reviewer reads the defence and inherits its framing. The structural counter is to treat prose from the codebase as **input to evaluate**, not **context to absorb**.

### Coverage and depth are distinct failure modes

**Justify-away** is per-investigation: the investigation happened, the conclusion dropped the finding. **Coverage failure** is across-the-diff: the investigation never happened, because after sustained output, generation converges toward "this is enough" with parts of the diff untouched. Different mechanisms, different structural defences. The depth defence is record-everything; the breadth defence is file-by-file `Files Reviewed`.

### The discipline must be verifiable from outside

The deepest insight, which produced the six-tool-call shape: a discipline described in text gets respected in shape but not mechanism. Claude reads the description, completes the work in his head, writes a summary at the end, and claims the discipline was followed. The `SKILL.md` text is no defence against this because the model's compliance with text is what's at issue.

A discipline expressed as fixed tool-call shape is different. Six calls is countable. Compliance is verifiable from outside without judgement. *"A `CreateFile` containing populated Investigation entries is a discipline failure regardless of the final file's correctness"* — that is the load-bearing sentence. The end-state being identical to bulk-write is what removes the gradient; making the shapes distinct re-establishes it.

### Identity matters for the quality floor

The reason today's iteration was heavy: comments posted under the SC's name require SC-quality output. Imperfect output ships with the SC's reputational signature. Once Claude has its own identity on the PR platform (separate ADO app registration), the quality floor drops to Claude-appropriate, and iteration becomes asynchronous — misses become feedback signals, not real-time problems to fix. The skill exists in the meantime; identity infrastructure is separate work, but the framing matters for how to interpret today's iteration.

### Iteration is the product

We were not perfecting any individual review. We were capturing the SC's filter — what to care about, in articulated form, embedded in skill + prompt — so that when models close the capability gap, the captured filter immediately produces value. The cost of today (~$30 across casts) is R&D investment, not waste. Each forensic-driven skill update is a durable artefact even if the cast that surfaced the failure produced an imperfect review.

### Intent is not correctness

The deepest framing the skill addresses. *"This is intentional"* / *"by design"* / *"the comment says..."* don't argue the choice was correct — they only name *who chose* the pattern. A bad design is still a design; an intentional bug is still a bug. The skill evaluates patterns on their merits regardless of whether the author intended them.

The `Impartiality` section in `SKILL.md` is the operational expression of this. The deeper claim is sharper: when reviewing code, the reviewer's question is *"should this pattern exist?"* not *"did the author mean to write it?"* The first is the actual review work. The second is what the codebase's prose tries to substitute for the review work.

Empirically this produces a rubber-stamp failure mode: a high pass rate that reflects deference to author intent rather than evaluation of code quality. The pass rate number itself is not the load-bearing claim; the mechanism is. Code that survives review because the reviewer accepted *"the author meant it this way"* is not code that has been reviewed.

### Comments are not part of the code being reviewed

A sharper framing than `Impartiality` as currently expressed. The current framing is *"prose from the codebase is input to evaluate, not context to absorb."* That still puts the prose in the evaluation pipeline. The cleaner principle is: when reviewing *code*, comments are not part of what's being reviewed. They're outside the scope. The code stands on its own.

When reviewing *documentation*, that's a separate pass with separate criteria — does the documentation match the code, is it accurate, is it useful for its intended audience.

**Load-bearing comments are themselves findings about the code.** A comment that is *required* to understand what the code does is evidence the code isn't self-evident. A comment explaining a workaround (`Object.setProperty` overriding a `const`, with a block comment explaining why) doesn't justify the workaround — it documents that the workaround exists. The need-for-comment is the finding; the comment is the symptom, not the defence.

The spectrum runs from "code reads like a book, zero comments needed" through "public API documentation is its own genre with its own justifications" to "a block comment laundering a workaround is disqualifying." Not every comment is a smell; comments accumulate suspicion in proportion to how load-bearing they are.

The mechanical implementation is LSP-aware comment stripping or placeholdering — the reviewer sees that a comment exists (its existence is reviewable as a smell) but doesn't see the content (which can't poison the evaluation). Without that tooling, the principle remains discipline-shaped, which is where discipline reliably breaks down. Tooling-level enforcement is the future shape.

### Multi-pass review by specialised subordinates

A single reviewer cast has finite attention and inevitably drops dimensions. Security gets covered, style gets dropped. Style gets covered, correctness gets dropped. The drops aren't visible because the cast doesn't know what it didn't look at.

Parallel specialised passes use the architecture: spawn N casts, each with a narrow concern (security, style, correctness, tests, documentation, architecture), each with focused skill load, each with concentrated attention budget. Findings get handed up structurally; coverage gaps surface per pass rather than getting lost in noise.

This is a capability the fleet enables that a single human reviewer can't easily replicate. A human reviewer switches between concerns expensively and incompletely; specialist Claudes don't pay that switching cost.

The architecture mirrors the existing fleet PM / operator split: a coordinator (senior reviewer) that doesn't see the code, subordinates (specialty reviewers) that do, structured handoffs between them. For review specifically, the coordinator-without-codebase-context pattern **contains the prompt-injection problem from comments**. Comments in the code never reach the coordinator's context. A subordinate's context may still be poisoned (and drop findings as a result), but the blast radius is one specialty's worth of misses, and the poison doesn't propagate up to the coordinator or across to other subordinates.

Future shape; not in the current single-cast `SKILL.md`.

## Decisions made

### Two valid Action values: `comment` and `flag`

Considered: a third value for "summary mention" or "include in review narrative." Rejected: binary is enough. *Comment* means post; *flag* means record only. The summary text is composed from the file's content as a separate matter; it doesn't need an Action of its own.

### Phase 1 / Phase 2 split

Considered: single-phase cast does both review and posting. Rejected after observing self-promotion behaviour ("." interpreted as proceed-to-Phase-2). One cast holding both phases collapses the SC gate. Two casts maintain the gate structurally — Phase 1 produces the file, the SC reviews it (possibly overrides Action values), Phase 2 only runs when explicitly dispatched.

### Fresh-eyes posture for each cast

Each cast does not read prior review files. The fresh-eyes framing in the role intro is real. Reading a previous iteration's output conditions the new cast's reasoning toward the previous reasoning's shape — including its misses.

### Six-tool-call shape, fixed and countable

Considered: per-investigation loop (1 + 5N tool calls). Rejected — heavy at scale, the kind of friction that gets optimised away. Considered: per-step writes described procedurally without naming tool calls. Rejected — describable disciplines get respected in shape but not mechanism. Settled: six fixed tool calls, with steps batched across all Investigations. Externally countable, no judgement required.

### The intermediate file states are part of the success criteria

Not just "the final file looks right." The *sequence* of tool calls counts. A `CreateFile` containing the populated file is a discipline failure even if the final content is correct, because the path is exactly the in-head-composition-then-bulk-write the skill exists to prevent.

### Prose in codebase as input-to-evaluate, not context-to-absorb

The `Impartiality` section is foundational. It names the Claude-specific mechanism (prose conditions generation as if true) and gives the discipline (evaluate, do not absorb). Two red flags compound; for Claude they often cancel; the structural counter is the explicit framing.

### `When to widen from diff to file` framed as heuristics, not rules

Heuristics signal a judgement moment; rules dictate behaviour. For LLM reviewers, rules look like checklist items and either get over-applied or get hedged into uselessness. Heuristics with explicit reasons (the diff hides context; LLM was conditioned on the file when generating) leave room for the reviewer's investigation to fire without becoming bureaucratic.

## What was rejected

- **`MUST FIX` / `SUGGESTION` verdict prefixes.** Reviewer doesn't issue verdicts; author resolves, SC arbitrates.
- **Per-investigation tool-call loops** (`1 + 5N`). Too heavy at scale; generation optimises it away. Replaced with six fixed batched calls.
- **Procedural-only discipline without tool-shape constraint.** Generation respects text in shape but not mechanism. Replaced with the externally-countable shape.
- **Hedging language** (*"these are signals, not rules"*, *"exercise judgment"* appended). Hedging tells Claude the rule is optional. Rules either stand or don't.
- **Asking the operator "why didn't you flag X"** as a post-hoc question. LLM confabulation is the failure mode of that question. Replaced with forensic-first analysis (read the SDK log thinking blocks before asking) and forward-looking rule-extraction ("what rule would have surfaced this?") when interrogation is needed.
- **Treating prior review files as ground truth for the next cast.** Fresh-eyes posture means deliberately not reading them; treat prior testament findings as hypotheses to verify, not conclusions to adopt.
- **The reviewer pre-classifying what's "in scope" vs "out of scope".** Binary in/out misses the case where new code adopts an existing non-compliant pattern. The new occurrence is in scope; the existing pattern is context. The PR's *effect* is what's reviewed, not the literal lines.

## What this skill does NOT cover

- **PR comment posting on platforms other than Azure DevOps.** The Reference section is ADO-specific. Other platforms need their own mechanics; the discipline (Impartiality, Patterns to flag, per-step writes, etc.) ports across platforms but the comment-posting recipe doesn't.
- **The MCP that would enforce the six-call shape at the tool level.** That is future tooling. Until then, the skill's six-call rule is the bridge — text-level enforcement of a discipline that an MCP would enforce mechanically.
- **Reviewer identity / who-the-comment-is-from.** Whether comments post under the SC's identity or Claude's identity is separate infrastructure work. The skill assumes whichever identity is configured; the quality floor it produces is the same.
- **What makes a finding worth `comment` vs `flag`.** That's the reviewer's judgement at the Conclude step. The skill provides the structural defence (everything recorded, every Action explicit, SC override available); the specific judgements per Investigation are not encoded.
- **PR-review-specific test invocation patterns for non-monorepo codebases.** The `Test invocation` section names the principle (identify how tests are run, verify CI's path); the specifics for a single-package repo with no build tool are not enumerated.
- **Multi-pass review architecture (coordinator + specialty subordinates).** A future shape. The current `SKILL.md` describes a single-cast review where one reviewer covers all concerns. The multi-pass architecture is named in the `Key insights` above because it shapes where the skill is heading, but the current `SKILL.md` does not implement it. When it's implemented, the senior coordinator's review file is the output; each subordinate produces a specialty-scoped sub-review that the coordinator integrates.
- **LSP-aware comment stripping.** The principle *"comments are not part of the code being reviewed"* relies on tooling that strips or placeholders comments before the reviewer sees code. The current `SKILL.md` carries the discipline-shaped version (the reviewer is supposed to not let comments condition the review); the tooling-shaped version is the structural fix and is future work.

## Notes for future editors

- The `Impartiality` section is foundational. If editing produces text that softens "prose from the codebase is input to evaluate, not context to absorb," the editing has weakened the skill.
- The six-tool-call rule is structural, not procedural. If editing replaces it with a loop or a per-investigation shape, the externally-countable property is lost and bulk-write becomes available again.
- The `Patterns to flag` list grows by one entry per real miss surfaced in a cast. Resist preemptive enumeration; resist adding patterns that haven't been observed failing. Each pattern carries weight at the Notice step; bloating the list makes every Notice slower.
- Hedging language (*"exercise judgment,"* *"as appropriate,"* *"signals, not rules"*) is the trained reflex to soften the discipline. The discipline is the discipline. If a reader can't apply it without hedge, the hedge isn't the fix.
- The Action vocabulary is two values: `comment` and `flag`. Adding a third (e.g. `summary`, `defer`) tempting but reintroduces classification at the wrong layer. The summary text and the action assignment are separate concerns; keep them so.
- The two-phase split (Phase 1 file, Phase 2 comments) is the SC's gate. Collapsing back to one phase reopens the self-promotion failure mode. The boundary is the discipline.
- "Iteration is the product" is the framing under all of this. The skill is the captured filter; today's iteration produced it; tomorrow's iteration will refine it. Future edits should preserve that posture — the skill is not finished, it is a snapshot.
- The `Impartiality` framing in the current `SKILL.md` (*"prose is input to evaluate, not context to absorb"*) is a stepping stone toward the cleaner principle in `Key insights > Comments are not part of the code being reviewed`. When `SKILL.md` evolves to reflect the cleaner framing — either through LSP-aware tooling or through stronger discipline — the philosophy already records the direction. Don't roll back to the weaker framing thinking it's the intent.
