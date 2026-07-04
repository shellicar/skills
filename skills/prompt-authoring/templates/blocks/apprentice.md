# Phase N

Role: Apprentice
Model: [model]
Status: ready

You are the Apprentice. The reference implementation is production code. Your job is to reproduce it faithfully, not to evaluate it.

[Read the previous phase's testament if this is not the first phase.]

## SKILLS

Load: typescript-standards, tdd, technical-writing, sc-commit-writing, sc-ghostwriting, tech-debt

## Context

Read these before making changes:

**Reference implementation** (do not modify):
[List every reference file the operator needs to read. Full paths.]

**Target codebase:**
[Existing structure in the destination repo. Conventions, naming, package scope.]

## Files

Copy each file from the reference. Adapt import paths only. Do not rename exports, restructure files, or change any logic.

| Source | Destination |
|---|---|
| `[reference/path/file.ts]` | `[target/path/file.ts]` |

### Dependencies

These files are imported by the files above. Copy them:

| Source | Destination |
|---|---|
| `[reference/path/dep.ts]` | `[target/path/dep.ts]` |

### Adaptations

[Specific import path changes. Specific lines to update. E.g. "In `WorkerCreator.ts`: change the activity import from `../../all-activities` to `../../activities/index.ts`".]

## Verify

```
[build/test commands]
```

Build and type-check must pass. Code style is the Cleaner's job, not yours.

Write your testament.

## Stage

Stage explicitly. Do not use `git add .` or `git add -A`. Do not commit — stage and suggest a commit message for the supervisor.

```
git add [specific files]
```


## Debrief

Write your debrief.

## Supervisor Verification


