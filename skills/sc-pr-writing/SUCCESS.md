# sc-pr-writing — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether a PR, where one was written, says what the change *does* — scannable, effect-focused — rather than how it was coded. The voice (em dashes, directness) is sc-ghostwriting's and is checked there, not here; this file checks the PR's shape and substance.

This is a marking guide based on evidence. No PR written, nothing to mark — see N/A.

## Where to look

The PR title and description, and the diff they describe.

## How to judge

### PASS

Read against the diff:

- the **title** describes the effect, fits one line (~70 chars), and matches what was actually shipped — not what was originally planned;
- the **description** is scannable: a `## Summary` of 3–5 short bullets, each a meaningful change rather than a file edit, with no rationale, test plans, or implementation notes. An empty body is fine when the title carries it.

### FAIL — judgment, read against the diff

The PR describes implementation — what was created, wired, which method was added — so a reviewer has to open the diff to learn what it does. Or the title claims something the diff didn't ship. The format specifics (bullet count, the heading) are supporting signal, not the gate: a description that runs long or lists files is a flag that it's carrying implementation detail — look there — not a fail on the count itself.

### N/A

No PR was written. Authorship triggers the skill; with none, it had no occasion — known not to apply.

### INCONCLUSIVE

The PR isn't visible — truncated pane, or created outside what you can see — so you can't check it. "I can't verify."
