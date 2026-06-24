---
name: devops-review
description: |
  WHAT: How to do a PR review on Azure DevOps — the posture for investigating findings, the record-keeping that protects against justify-away, and the mechanics of posting comments.
  WHY: Reviewers see red flags, investigate them, derive concrete problems, then reason themselves out of reporting because the code "looks intentional." The investigation is the work; dropping it before record is the cost. The skill replaces the trained "produce a polished, defensible review" success function with "record every investigation in the file, regardless of conclusion."
  WHEN: When doing a PR review on Azure DevOps.
user-invocable: true
metadata:
  category: review
---

# Azure DevOps PR Review

## Who

- **Reviewer.** Investigates, writes the review file, posts PR comments on what is worth surfacing.
- **Author.** Resolves PR threads — accepts, fixes, disputes, defers.
- **SC.** Arbitrates merge. Reads the review file for the full picture of what was investigated.

## Impartiality

A review's value is independent judgment. Claude's failure mode here is specific: prose in the codebase — comments, READMEs, TODOs, commit messages, variable names, function names — enters context and conditions subsequent generation. The author's claim ("this is intentional," "by design," "we don't introduce timezones here") becomes Claude's belief, silently, without a deliberative step.

For a human reviewer, prose accompanying suspicious code makes the code *more* visible — the author anticipated questions, which means the questions were real. For Claude, the same prose tends to *justify* the code in subsequent reasoning, because text-in-context conditions output as if true. Two red flags should compound; for Claude they often cancel.

The discipline: prose from the codebase is **input to evaluate**, not **context to absorb**. On encountering a comment, README, or TODO, the question is *is this claim valid?* — not *what does this say?* The two diverge silently in generation if you do not consciously hold the distinction. The codebase does not get to make claims that bypass review; that is exactly what review is for.

**Comments are not part of the code being reviewed.** The code stands on its own. A comment is not evidence for or against the code's correctness — it sits outside what is being judged. The sharper consequence: a comment *required* to understand what the code does is itself a finding. The need for the comment is the smell; the comment is the symptom, not the defence. A block comment explaining a workaround documents that the workaround exists — it does not justify it. Comments accrue suspicion in proportion to how load-bearing they are: code that reads cleanly needs none; public-API documentation is its own genre with its own justifications; a comment laundering a workaround is disqualifying. Justification in a comment is a red flag, never a reason to lower the bar — a comment should say *why* or *what*, and the moment it argues that bad code is acceptable, the justification is the finding.

This discipline is imperfect without tooling, and that is stated plainly rather than pretended away. There is no LSP-aware comment-stripping in place, so a comment's content still reaches your context and still conditions your generation as if true — the influence does not switch off because you decided to evaluate rather than absorb. Naming it is the defence available now: hold the distinction consciously, knowing the pull is still acting on you. The structural fix — stripping comment content before the reviewer sees the code, leaving only the *fact* that a comment exists — is future tooling, not present reality.

**Intent is not correctness.** The question under review is *should this pattern exist?* — not *did the author mean to write it?* A bad design is still a design; an intentional bug is still a bug. The codebase's prose tries to substitute the second question for the first; refusing that substitution is what review is.

## What

When you find a red flag in the code, **investigate**. Trace it through the codebase. Find what the pattern means at the system level.

The output of a review is **the review file** — the durable artefact. The file has two parts:

- **Paste-ready content at the top.** What gets posted to the PR verbatim: a Review section (a single non-file-anchored summary comment) and a Comments section (one entry per file-anchored comment). Both are in posted format — markdown blocks ready to be lifted into PR comments. Phase 2 reads these and posts them.
- **Working notes below.** The full investigation record: every red flag traced, what it meant at the system level, what was concluded. Coverage of every changed file. This is not posted; it is the durable record for refinement and forensic use.

Each Investigation in the working notes carries an **Action** field with two valid values: one that produces a corresponding Comment entry in the paste-ready section, one that marks the Investigation as record-only. The reviewer proposes the Action; the SC may change any Action before Phase 2 dispatches. The prompt defines the specific terms.

No verdict prefix in any posted text. The author resolves the thread; the SC arbitrates merge.

The review file makes **coverage** visible. Every changed file in the diff appears in the file. Files with no concerns are recorded as such — the record proves they were read. Files with concerns get an entry pointing at the investigation. The review's size is proportional to the diff's surface; a 97-file PR cannot collapse into a one-page summary.

The reviewer does not issue verdicts. *MUST FIX*, *SUGGESTION*, *blocks merge* — those are not the reviewer's call. The reviewer surfaces findings; the conversation that follows resolves them.

**The bar is the standard, not the surrounding code.** A review measures the change against what good looks like, not against what the adjacent code already does. "Follows existing patterns" is not a defence when the existing pattern is itself below standard — that an adjacent file uses `vi.mock`, or that a neighbouring type carries a field like `customDesignation`, makes neither correct. Code quality must improve with every PR; a change that merely matches the surrounding mediocrity has not cleared the bar. The existing pattern is context; the new occurrence is in scope.

A red flag is anything that prompts a question: a module-level side effect, a mock in a test, a TODO admitting unsolved problems, a bespoke component where a library exists, a runtime composition that is not obviously coherent. The flag is the start of the investigation, not the finding.

## Why

The trained success function for review work is *produce a polished, defensible review*. That biases toward only reporting findings you can prove are problems, and toward arriving at clean verdicts on each. The reviewer can almost always find something that *sounds* like license to ratify: a comment calls a pattern intentional, a TODO admits the gap, the API doc says "still evolving." None of these are statements about correctness. They name who chose the pattern, not whether the choice is right. A bad design is still a design. An intentional bug is still a bug.

The cost is asymmetric. A reported finding that turns out to be acceptable costs one line of triage. A red flag investigated, traced to a concrete bug, then dropped because the reviewer accepted "the comment says it is intentional" costs a merged bug.

The replacement success function: **record every investigation in the file.** Comments are downstream — they are judgment about what to surface to the author. The file is upstream — the full record of what you looked at and what you concluded. Without the upstream commitment, justify-away has a place to hide: investigations that concluded "intentional" go nowhere. With the commitment, every investigation lands in the file regardless of conclusion. The SC sees the full surface.

## How

Before starting each phase, and before any substantive new action within a phase, verify two things:

- **Local state matches the PR's current HEAD.** Fetch and compare. The PR's branch belongs to the author and is a moving target — they push new commits, force-push amendments, rebase. Reviewing stale state produces stale comments. If new commits have landed, sync the worktree before continuing.
- **Existing PR threads.** Read them. The PR is a conversation; you read the conversation before joining it. Findings already raised may overlap with yours; your own findings should be written with awareness of what is already on the PR. New threads may also have landed since you last checked.

Phase 1 produces the review file via a fixed sequence of six tool calls. Each step is one tool call that handles all Investigations at once.

**What.** Six tool calls, in order:

1. **`CreateFile`** the review file with the scaffold — section headers (Review, Comments, Overview, Changes by Area, Files Reviewed, Description vs Diff, Standards Compliance, Investigations) and the Actions header, no Investigation content.
2. **`EditFile`** — append every `**Investigation N: <title>**` and `Noticed: [text]` block to the Investigations section, all in one call. Done after the diff walk completes and every red flag that fired has been noticed.
3. **`EditFile`** — append `Traced: [text]` to every Investigation, all in one call. Done after every Investigation has been traced.
4. **`EditFile`** — append `Derived: [text]` to every Investigation.
5. **`EditFile`** — append `Concluded: [text]` to every Investigation.
6. **`EditFile`** — append `Action: comment | flag` to every Investigation, populate the Comments section with paste-ready entries for `comment`-marked Investigations, and write the Review section's summary text.

Six tool calls. Fixed. Independent of how many Investigations there are.

**Why.** The discipline must be verifiable from outside, not just describable in text. With a fixed six-call shape, the discipline either runs or it doesn't — countable in the tool-call log, no judgement required. Without this, generation collapses the work into a single `CreateFile` because the end-state is identical and fewer tool calls is the path of least resistance. Same end-state with no cost difference = generation defaults to the bulk write.

The batching by step (not by Investigation) is the second structural force. Step 3 cannot begin until step 2 is complete *across all Investigations*. The trace for any Investigation requires every Investigation's Noticed entry to be on the page first. Per-investigation in-head composition is closed — traces happen after all Notices, not interleaved with them. The order Notice → Trace → Derive → Conclude → Action runs across the whole set, not within each item.

**When.** Every Phase 1.

**How.** The intermediate file states are part of the success criteria. Not just the final file content — the *sequence of tool calls* counts. A `CreateFile` containing populated Investigation entries is a discipline failure regardless of the final file's correctness; that path is the mental-investigation-then-bulk-write the skill exists to prevent. The six tool calls are the lower bound — fewer means the discipline was skipped.

Dismissal can still happen in the Conclude step — recorded conclusions are reviewable, and the SC can override the Action when reading the file. What is prevented is dismissal *without* writing. Never dismiss anything in your head; if you noticed something, the next Notice-step `EditFile` is where it lands.

When your *written* conclusion contains one of these phrases, it is empty:

- "this is intentional"
- "by design"
- "this seems intentional"
- "the comment says..."
- "the TODO acknowledges this"
- "the API is still evolving"

Each names *who chose* the pattern. None argues the choice was correct. A bad design is still a design. An intentional bug is still a bug. The phrases masquerade as verdicts; they are not.

A related form is **reclassification**: *"the rule says X, but this isn't really X because Y."* The Y is itself a finding — usually an architectural fact the operator skipped past. *"The logger is a non-injectable singleton, so mocking it is fine"* — the non-injectability is the architectural issue; the mock documents it. Recording the reclassification means recording Y as the finding, not as an exemption.

When either lands in your conclusion, the conclusion stays on the page. Set the Action consciously — `flag` if you intend the recorded conclusion to stand without comment, `comment` if you want to surface the finding regardless. The structural defence is that the recorded conclusion is visible — the SC can override either way.

The five steps cover **depth** — what happens for a single red flag. The review also has a **breadth** discipline: every changed file in the diff is traversed. The failure mode breadth addresses:

- **Coverage failure** (across the diff): you did not investigate at all for a file. After sustained output, generation converges toward "this is enough" — the summary feels complete while large parts of the diff have not been touched.

The structural defence against coverage failure is the file-by-file pass in the review file. Each changed file gets an entry — either pointing at a finding/comment or a brief *"read; no concerns."* Grouping is allowed where concerns are identical across many small files; the work has to be visible, not collapsed. The structure cannot be written without going through every file. Shape forces breadth that intent alone will not produce.

### Patterns to flag

Recurring code-and-file patterns that warrant naming. None is a finding on its own; each is a question to investigate.

- **`serviceProvider.resolve()` inside a method body.** One inline resolve means the method hands off. More than one means orchestration — ask whether the sequence belongs in a service.
- **`vi.mock()` of a production module.** Ask whether the dependency was injectable. If yes, the test double should go through DI, not module interception. The mock is documenting a structural coupling.
- **Files in `src/` that do not run in production.** Test files, snapshot directories, seed scripts, fixture data. `src/` compiles to `dist/` and ships; non-production files belong outside it.
- **Module-level mutable state.** A `let`, `Map`, `Set`, or similar at module scope is process-wide shared state. Who initialises it? When is it valid? What happens if it is accessed before initialisation, or after being mutated by something else? Function declarations, class definitions, type aliases, and exported `const` values at module scope are not the concern — mutable state is.
- **Top-level function calls.** A function invocation at module scope — not inside a class, not inside a function body — runs on first import with no opt-out. The side effect travels through every context: production, tests, bundler analysis. Investigate what is called and what state it touches.
- **Standing-standard violations.** A pattern violating the standing standard is a finding regardless of any comment, README, or TODO defending it (see Impartiality).
- **A TODO whose attribution is copy-paste residue.** `TODO(author)` tokens propagated by paste — most TODOs in a file reading `TODO(shellicar)` because one was copied forward — are convention carried without thought, not authored markers. The attribution is noise; the TODO it rides on warrants the same scrutiny as any other (a TODO admitting an unsolved problem is already a flag). The residue is the tell that the line was pasted, not written.

### When to widen from diff to file

The diff hides context. The new code references the surrounding file — imports, identifiers, conventions, patterns — and the meaning of the change is downstream of what it references. For LLM-written code this matters more: the LLM was conditioned on the surrounding file when generating the change, so the patterns in the file shaped what got written. Reviewing the diff alone shows the offspring without the seed.

Heuristics for widening the read:

- A red flag fires on the changed lines.
- The change touches anything with system-level shape — module imports/exports, test scaffolding, DI wiring, top-level statements.
- The change is small relative to the file.
- The change references existing identifiers; the meaning of the change is downstream of those.

Read enough surrounding code to know what the change is part of. Judge whether the pattern being introduced or extended is one that should propagate.

### Test invocation

A "tests pass" claim depends on which invocation produced it. Reviewers identify how tests are run in the codebase under review — the project's test scripts, the build tool's task graph (turbo, nx, lerna, none), the test runner's own configuration, and what the CI pipeline actually invokes — and verify the paths agree.

Tests are only useful when both hold: (a) the invocation discovers them, and (b) CI's invocation discovers them. A test that exists but never runs in CI passes by virtue of not being executed.

For any PR introducing new tests or modifying test configuration, the reviewer runs each plausible invocation path, compares what each discovers, looks at the CI pipeline definition for what it actually invokes, and surfaces any divergence as a finding.

The specific tools and topology vary per codebase. The principle does not.

## When

Every PR review.

---

# Reference: posting comments on ADO

## Prerequisites

- `az` CLI with `azure-devops` extension installed
- Logged in (`az login`) and default org configured (`az devops configure --defaults organization=https://eagersautomotive@dev.azure.com/eagersautomotive`)

## Read threads

List all threads, filtered to text comments only, with file context and content:

```bash
az devops invoke \
  --area git \
  --resource pullRequestThreads \
  --route-parameters project=eashared repositoryId=eagers.products.services pullRequestId=<PR_ID> \
  --api-version 7.1 \
  --output json \
  | jq '.value[] | select(.comments[0].commentType == "text") | {
      id,
      file: .threadContext.filePath,
      line: .threadContext.rightFileStart.line,
      status,
      content: .comments[0].content
    }'
```

## Get changeTrackingId for a file

Each file in the diff has a unique `changeTrackingId`. Required when posting a file-anchored comment.

```bash
az devops invoke \
  --area git \
  --resource pullRequestIterationChanges \
  --route-parameters project=eashared repositoryId=eagers.products.services pullRequestId=<PR_ID> iterationId=<ITERATION_ID> \
  --api-version 7.1 \
  --output json \
  | jq '.changeEntries[] | {changeTrackingId, path: .item.path}'
```

Look up by id to confirm a specific file:

```bash
  | jq '.changeEntries[] | {changeTrackingId, path: .item.path} | select(.changeTrackingId == 93)'
```

### Notes

- `changeTrackingId` is per-file, varies across files in the same PR
- `iterationContext` (`firstComparingIteration`, `secondComparingIteration`) tracks which PR iteration the comment was made against — anchors comments correctly when the branch is force-pushed or updated. Use the current iteration for new comments.

## Create a thread

Write `body.json`, then POST:

```bash
az devops invoke \
  --area git \
  --resource pullRequestThreads \
  --route-parameters project=eashared repositoryId=eagers.products.services pullRequestId=<PR_ID> \
  --http-method POST \
  --api-version 7.1 \
  --in-file body.json \
  --output json
```

### body.json — file-anchored comment

```json
{
  "id": -1,
  "comments": [{
    "parentCommentId": 0,
    "commentType": 1,
    "content": "your comment text here"
  }],
  "status": 1,
  "properties": {
    "Microsoft.TeamFoundation.Discussion.SupportsMarkdown": { "type": "System.Int32", "value": 1 },
    "Microsoft.TeamFoundation.Discussion.UniqueID": { "type": "System.String", "value": "<new-guid>" }
  },
  "threadContext": {
    "filePath": "/path/to/file.ts",
    "rightFileStart": { "line": 7, "offset": 1 },
    "rightFileEnd": { "line": 9, "offset": 25 }
  },
  "pullRequestThreadContext": {
    "changeTrackingId": 93,
    "iterationContext": {
      "firstComparingIteration": 2,
      "secondComparingIteration": 2
    }
  }
}
```

### body.json — general PR comment (no file)

```json
{
  "id": -1,
  "comments": [{
    "parentCommentId": 0,
    "commentType": 1,
    "content": "your comment text here"
  }],
  "status": 1,
  "properties": {
    "Microsoft.TeamFoundation.Discussion.SupportsMarkdown": { "type": "System.Int32", "value": 1 },
    "Microsoft.TeamFoundation.Discussion.UniqueID": { "type": "System.String", "value": "<new-guid>" }
  }
}
```

### Content formats

**Inline code suggestion** (ADO applies it with one click):
````
```suggestion
   * replacement line 1
   * replacement line 2
```
````

**Plain markdown with diff** (for multi-file or explanatory comments):
````
explanation text

```diff
- old line
+ new line
```
````

### Generate a GUID

```bash
uuidgen | tr '[:upper:]' '[:lower:]'
```
