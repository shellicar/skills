# devops-review — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the review's discipline actually ran — not whether the review found things. The skill exists to stop two failures: justify-away (a red flag investigated, then dismissed in the reviewer's head because a comment said "intentional") and coverage collapse (files never read behind a complete-sounding summary).

The key marks, all externally checkable: the **six-tool-call sequence** ran in order — a `CreateFile` landing with populated Investigations is the fail, the mental-investigation-then-bulk-write the shape exists to prevent; **every investigation recorded** regardless of conclusion, and a written conclusion resting on "this is intentional" / "by design" / "the TODO acknowledges it" is empty — those name who chose the pattern, not whether it is right; **coverage visible** — every changed file has an entry, "read; no concerns" included, review size proportional to the diff; **no verdicts** — no MUST-FIX prefixes, findings surfaced, resolution left to the author and the SC; and the bar is **the standard, not the surrounding code** — "follows existing patterns" defending a below-standard pattern is the finding, not the excuse.

N/A where no PR review was done. INCONCLUSIVE where the review file or the tool-call sequence isn't visible.
