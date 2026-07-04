# mission-verification: editorial context

Not loaded at runtime. Read before you change `SKILL.md`. The reasoning that shapes behaviour lives in the SKILL; this holds the history, the decisions, and what was rejected.

## Where it came from

A handler verifying a mission did a genuinely good trace by *improvising* it — and still mislabelled a header field (`Written against version`, the material SHA) as a target-repo commit and tried to check it against the wrong repo. Nobody had told the handler how to verify, so it was luck, not method. This skill makes the check systematic.

## Decisions

- It is the mirror of the scribe's `mission-grounding`: grounding writes the provenance trace, verification proves it holds. The two are a matched pair.
- Two checks, and only two: (1) every *content* claim in `mission.md` has provenance, and (2) `mission.md` represents `intent.md`. Passing both is the proof; the cross-check is the point.
- Loaded by the **executor**, because the executor is accountable for the mission. Accountability is why the check is theirs and why "cannot verify" means "does not ship."
- Scoped hard to content. Boilerplate header fields, spelling, wording, branch names are explicitly *not* what verification is about — chasing them is how the check drifts into noise and misses the real defect.

## What was rejected

- Reading `provenance.md`'s self-assessment and passing it — a plausible invention reads exactly like a grounded claim.
- Verifying against disk reality (does the worktree exist, is the hash a real commit). Those are boilerplate the executor *acts on* via `dispatch` and reads via `mission-artefacts`, not content to verify — and checking the version hash against the target repo was the exact mistake that motivated this skill.

## Notes for future editors

- The danger the skill guards is the *omitted* claim, not the badly-grounded one. If an edit reframes check one as "is the provenance trace honest," it has lost the point — the check is "does every mission claim appear in the trace."
- Keep it two checks. More checks dilute the two that actually prove the mission.
