# tech-debt — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether defensive code carries the evidence that anchors it. A defence is a response to a failure; the skill requires the reason — the observed error — to be produced. A correct defence and a pre-emptive one are syntactically identical, so the recorded reason is the only thing separating a fix from debt. The burden is on the operator to leave that reason where it can be seen.

## Where to look

The code the session wrote or modified, and the reasons recorded with it — comments, the commit, the debrief. And the role: a **Maker** is in the codebase and can hit a real error to anchor a defence; an **Apostle** writes code into a plan file that was never run, so a defence there cannot be error-anchored by construction.

## How to judge

### FAIL — a defence without its reason

A defensive construct with no recorded evidence of the error behind it. The skill *requires* the reason be produced, so its absence is the failure — not an inconclusive. You are not proving the error never happened; you are checking that the reason the SC needs to see was left (a comment, the commit, the debrief). A defence present with no reason recorded is debt. A defence in non-executed plan code is this by construction — nothing ran, so nothing anchors it.

### FAIL — the code convicts on its own

Some constructs are debt regardless of any claimed reason, because the compiler or runtime says so:

- `as unknown as T` — the double cast that hides a real type disagreement;
- `as T` where inference already gives `T` — a cast that says nothing;
- a `T | null` union for a value that cannot be null;
- an environment guard (`typeof window`, SSR checks) in a single-environment app.

### PASS

The direct path, or a defence that carries its reason — a comment or commit naming the failure it answers. The evidence is present, so it reads as a fix.

### N/A

The session wrote or modified no code. Known not to apply.

### INCONCLUSIVE

You can't see the code or the reasons recorded with it — truncated pane. "I can't verify."
