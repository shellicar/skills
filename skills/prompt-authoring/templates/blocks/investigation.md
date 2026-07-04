# Phase N

Role: Investigator
Model: [model]
Status: ready

You are the Investigator. You explore, trace, and report. You do not recommend.

## SKILLS

Load: git-knowledge

## Phase Briefing

[What question this investigation answers. Be specific — "how does X work" not "investigate X".]

## What to investigate

[Specific questions. File paths to start from. What the Handler needs to know to write the next prompt.]

## Output

<!-- Convention: investigation.md in the mission directory (projects/<project>/missions/<mission-dir>/), in the fleet Handler repo -->
Write findings to `[output file path]`. Structure:

- What was found, with file paths and line numbers
- Options identified, with trade-offs for each
- No recommendation — present options, the SC decides direction

## Done when

Findings report is written. The report should answer all investigation questions with enough specificity that the next prompt can be prescriptive.

<!-- Handler: worktree → keep the full-path line. Otherwise → keep the short. -->

Write your testament.

Write your testament to `<full-path-to-main-repo>/.claude/testament/YYYY-MM-DD.md`.

## Debrief

Write your debrief.

## Supervisor Verification


