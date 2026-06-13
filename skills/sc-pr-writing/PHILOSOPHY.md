# sc-pr-writing: editorial context

This file is the editorial context for the `sc-pr-writing` skill. Read it before modifying `SKILL.md`.

## Why this skill exists

A PR description is the written record a reviewer uses to understand what a change does and why. Claude's default fills it with implementation detail — which class was created, which method was wired, which function was renamed. The reviewer now has to extract the meaning from the mechanics, doing work the description should have done for them.

PR review comments have a second dimension: they go out under Stephen's name and represent his judgment to the author. Generic Claude review quality — technically correct but in a register that is not Stephen's — misrepresents his standards.

## Origin

PR descriptions written by Claude look like this: "Create ENV_PASSTHROUGH Set and buildSandboxEnv() function that filters process.env. Change DateFormatter.format() to use ISO 8601 instead of locale string in ExportService.ts." This describes what was done. A reviewer reading it knows the implementation; they do not know what changed from the product's perspective.

The same pattern applies to PR review comments. Claude reviewing a PR produces observations. But Stephen's review comments carry his voice, his judgment, his specific way of framing a concern or acknowledging good work. A review that sounds like a competent but anonymous reviewer misrepresents him to the author.

## Key insights

### PR titles and descriptions are one act

They are written at the same moment, serve the same reader, and answer the same question: what does this change do? Separating them into different skills creates overhead for no gain.

### The `## Summary` format enforces the right constraint

A reviewable PR description should be scannable in one pass. Prose requires parsing. A fixed heading with a short bullet list does not. The format exists because of how reviewers actually read: they want the shape before they go into the diff.

### 3-5 bullets surfaces scope problems at write time

If a PR cannot be summarised in effect-focused bullets, the PR may be too large. The constraint does not just improve the description — it surfaces a problem earlier.

### PR reviews represent Stephen

When Claude writes a review comment as Stephen, the author reads it as Stephen's judgment. The comment shapes the author's impression of the reviewer. A comment that does not reflect Stephen's actual standards and voice is a misrepresentation.

## What was rejected

- Separate skills for PR titles and descriptions. Same act, same moment, same reader.

## What this skill does NOT cover

- Commit messages — `sc-commit-writing`
- Work item text — `sc-workitem-writing`
- Code review process — closer to `devops-review`
- The underlying effect-not-implementation principle — `technical-writing`
- Stephen's voice (directness, no em dashes) — `sc-ghostwriting`, the required base loaded alongside this skill

## Notes for future editors

- The good/bad examples are load-bearing. Implementation-description bullets vs. effect-description bullets is the core distinction; examples make it concrete.
- If the `## Summary` format changes, check that the change is still driven by "scannable in one pass," not by habit or convention for its own sake.
