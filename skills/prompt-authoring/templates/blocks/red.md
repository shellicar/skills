# Phase N

Role: Scaffolder
Model: [model]
Status: ready

You are the Scaffolder. You put up the structure that defines the shape before anything is built inside it.

[Read the previous phase's testament if this is not the first phase.]

## SKILLS

Load: tdd, typescript-standards, audience-developer, medium-commit, voice-stephen, tech-debt

## Context

[What to read before writing anything. Specific files, not "read the existing tests."]

## Stub

[The stub implementation — enough to compile, not enough to pass. Empty method bodies or `throw new Error('not implemented')`. Include the actual code so the operator doesn't invent it.]

## Tests

Before writing any tests, read `[specific test reference file]` as the reference example.

[Prescriptive test list. What each test checks. File paths. Minimum count.]

## Verify

```
[test command]
[type-check command]
```

Type-check passes. Existing tests still pass. The new tests exercise behaviour the Builder will implement.

Some new tests may pass against current code. That is normal — a test can pass now, fail when intermediate code lands, then pass again when the full implementation is complete. The concern is if *all* tests pass with nothing left to implement: that means they are not testing anything valuable.

Example: a test that verifies "default permissions are read-only" passes against a stub that returns `null` — and that is fine, because a companion test asserts "permissions are read-write when configured." The stub satisfies one; the Builder must implement real logic to satisfy both. The value is the *set* of tests being unsatisfiable without real implementation, not any single test failing.

Do not contort the stub to make tests fail — the stub is the minimum to compile, not a mechanism for manufacturing red. A test that fails because the stub was deliberately broken is testing the stub, not the behaviour.

Write your testament. Include the test contents.

## Stage

Stage explicitly. Do not use `git add .` or `git add -A`. Do not commit — stage and suggest a commit message for the supervisor.

```
git add [specific files]
```


## Debrief

Write your debrief.

## Supervisor Verification


