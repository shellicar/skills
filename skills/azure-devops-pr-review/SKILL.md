---
name: azure-devops-pr-review
description: |
  WHAT: Reviewing an Azure DevOps pull request — fetch the PR locally with the correct triple-dot diff, investigate the change, write a review file with per-file findings and severity, return a brief summary in the response.
  WHY: An LLM reviewer drifts toward ratification — prose in the codebase becomes silently accepted as established truth, and findings dissolve. Producing a durable file with explicit severity per finding makes the review a record, not a verdict, and surfaces over time the standards the team actually cares about.
  WHEN: When given an Azure DevOps PR URL and asked for a review.
user-invocable: true
metadata:
  category: review
---

# Azure DevOps PR Review

## Who

A senior software engineer reviewing a pull request. Independent judgment; the reviewer is not the author and not the merge authority. The output is investigation, not edict.

Prose in the codebase — comments, READMEs, TODOs, commit messages, variable and function names — is **input to evaluate**, not **context to absorb**. The trained reflex for an LLM is to take prose at face value: a comment saying *"this is intentional"* conditions subsequent generation as if the claim were established. For a human reviewer the same prose makes the code *more* suspicious — the author anticipated questions, so the questions were real. Hold prose as a claim under review, not as established truth. *"By design"* names who chose the pattern; it does not argue the choice was correct. A bad design is still a design. An intentional bug is still a bug.

## What

Two outputs:

- **A review file** — the durable artefact. Written to `pr-<id>-review.md` at the repo root. Two sections: an overall comment about the change as a whole, then per-file findings each tagged with severity.
- **A brief response summary** — three or four sentences in the response itself: PR scope, path to the review file, headline findings if any. The file is the artefact; the response points at it.

**Severity vocabulary** — descriptive, not imperative:

- `issue` — something is wrong. A bug, a broken contract, a missing test that should exist, a security concern.
- `concern` — something might be wrong, or trades off badly. Worth a conversation.
- `suggestion` — an alternative that may be better. Take or leave.

No `MUST FIX`, no `blocker`, no merge-gating language. The reviewer surfaces; the author resolves; the merge authority decides. Severity describes the weight of the finding, not the action the author must take.

Add `pr-*-review.md` to `.gitignore` so review files do not accidentally enter the repo.

## Why

Three reasons, in priority order:

1. **The review itself.** Catch bugs, design problems, weak or missing tests, conventions the change violates. The primary purpose; everything else is downstream.

2. **Refining the skill.** Each real review surfaces what this team actually cares about — library choices, testing patterns, conventions specific to this repo or family of repos. Those are not in any global rulebook; they emerge during real reviews. The skill grows with that knowledge, and the review file is the raw material.

3. **Forensic record.** When the PR was written with LLM assistance, the review file is a record of what was flagged and what was accepted. Useful later for understanding why something landed the way it did. Lightweight; the file existing is the mechanism.

## When

Manually, when given a PR URL and asked for a review. v1 — no automation, no triggers.

## How

Six steps, in order.

### 1. Parse the PR URL

ADO PR URLs take one of these shapes:

```
https://dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{id}
https://{org}@dev.azure.com/{org}/{project}/_git/{repo}/pullrequest/{id}
```

Extract `org`, `project`, `repo`, `id`. These four values drive every subsequent step.

### 2. Fetch PR metadata

```bash
az repos pr show --id <id> --org https://dev.azure.com/<org> --output json
```

From the response, capture:

- `sourceRefName` — the source branch (strip `refs/heads/`).
- `targetRefName` — the target branch.
- `lastMergeSourceCommit.commitId` — the SHA on the source branch as ADO sees it.
- `lastMergeTargetCommit.commitId` — the SHA on the target branch as ADO sees it.

The PR is a delta from source against target as of these SHAs. They are what step 5 uses.

### 3. Local pre-flight

Before fetching anything:

```bash
git status --porcelain
```

Must be empty. If the working tree has uncommitted or untracked changes, stop and surface the state. Reviewing against a dirty working tree mixes the author's change with whatever else is in flight.

Then:

```bash
git fetch origin
```

### 4. Check out the PR branch locally

Two acceptable mechanisms in v1; choose by context.

**Worktree**

```bash
git worktree add ../review-<repo>-<id> origin/<source-branch>
cd ../review-<repo>-<id>
```

Verify HEAD matches what ADO reported:

```bash
git rev-parse HEAD
```

Should equal `lastMergeSourceCommit.commitId` from step 2. If it does not, the local fetch did not pick up the latest push — fetch again or investigate why ADO and origin disagree.

**Nothing is pushed.** Nothing is committed back to the source branch. The local checkout exists so that suggestions are verified against real files, real imports, real configuration — not against the diff in isolation. If you want to test that a refactor compiles, do it in the worktree and discard it.

### 5. Generate the diff with triple-dot

```bash
git diff origin/<target-branch>...origin/<source-branch>
```

**The three dots are load-bearing.** Triple-dot gives the diff between `<source-branch>` and the merge base of source and target — *what the PR actually adds*. Double-dot (`..`) gives the diff between current target tip and source, which conflates changes that have happened on target since the branch was created with changes introduced by the PR. Reviewing a double-dot diff means reviewing the wrong delta; findings will be wrong in both directions — missing changes that are the PR's, and flagging changes that belong to target.

For per-file scope:

```bash
git diff --stat origin/<target-branch>...origin/<source-branch>
git diff --name-only origin/<target-branch>...origin/<source-branch>
```

### 6. Review and write

Walk the diff file by file. For each file:

- Read the changed lines.
- If the change references identifiers, imports, or conventions outside the diff, read the surrounding file. The diff is the offspring; the surrounding file is the seed that shaped it.
- Record findings against the file in the review file, each tagged with severity.

Write `pr-<id>-review.md` in this shape:

```markdown
# PR <id> Review

**URL:** <pr-url>
**Source:** <source-branch> @ <source-sha>
**Target:** <target-branch> @ <target-sha>

## Overall

<one to three paragraphs about the change as a whole — scope, shape, anything that crosses files>

## Files

### path/to/file.ts

- **issue** — <description, with line reference where useful>
- **suggestion** — <description>

### path/to/other.ts

- **nit** — <description>

### path/to/clean.ts

- (no concerns)
```

Files with no concerns are still listed. The record shows the file was read, not skipped.

Then the response: PR scope in one sentence, review file path, headline findings if any. Brief.

## Boundaries (v1)

This skill produces a review file. It does **not**:

- Post comments to the PR.
- Complete, merge, or vote on the PR.
- Run on a schedule or react to events.

Those are separate concerns. Keeping this skill scoped to the review artefact means the human stays in the loop on what reaches the PR.
