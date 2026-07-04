# mission-grounding: editorial context

Not loaded at runtime. Read before you change `SKILL.md`. The reasoning that shapes behaviour lives in the SKILL; this holds the history, the decisions, and what was rejected. The mechanical shape is copied from the `devops-review` skill.

## Where it came from

The scribe kept inventing — inflating a compact intent into prescriptive detail, re-opening things already decided. Its grounding was steps living in the scribe role, so they never fired. The fix moves grounding into a skill and makes it mechanical.

## Decisions

- A fixed, batched-by-step provenance pass, modelled on `devops-review`'s fixed six-call shape: list every claim, then source every claim, then cut the unsourced. Batched so a claim and its source can't be composed together in your head, which is where invention hides.
- The trace is a colocated `provenance.md` artefact (the SC's call), not inline tags stripped before commit — so it is an audit surface, not a judgement.
- It is a written pass, not a final read: plausible invention is invisible to a reader, and the handler can't catch it either; only a per-claim trace can.

## What was rejected

- Grounding as a disposition in the role (didn't fire).
- Catching invention by review — a same-kind reader can't tell a made-up specific from a grounded one.
- Inline source tags scrubbed before commit — the SC chose the durable artefact.

## Notes for future editors

- The fixed call-count is the mechanism — it makes the discipline countable from outside. Don't soften it into "trace your claims".
- The examples are real (the #303 hook prompt); keep them grounded.
