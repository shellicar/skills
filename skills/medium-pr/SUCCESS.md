# medium-pr — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether a PR, where one was written, tells the reviewer what the change does without making them do the work of understanding it.

The key marks, read against the diff: the title describes the effect in one line (~70 chars) and matches what actually shipped, not what was planned; the description is a `## Summary` of 3–5 short bullets, each a meaningful change rather than a file edit, with no rationale, test plans, or implementation notes; an empty body is fine when the title carries it. The FAIL is implementation-speak — what was created, wired, which method added — so the reviewer has to open the diff to learn what the PR does. The format specifics are supporting signal, not the gate: a long description is a flag that it's carrying implementation, not a fail on the count.

N/A where no PR was written. INCONCLUSIVE where it isn't visible.
