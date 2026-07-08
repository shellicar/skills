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

## 2026-07-08: governing sources, intact-carriage, and the coverage trace

Three additions after the stage2-speak mission (claude-cli), where every downward trace passed and the mission was still wrong:

- **A governing document joins the sources.** The intent said "the blueprint governs"; the scribe grounded against the intent's summary of it and never opened the blueprint — then invented a requirement that surface-matched the real one while diverging in substance. Grounding is the act of reading the source, not the property of accidentally matching it; a near-right invention is the worst case because it sails through every check.
- **Carried means intact.** The old upward trace checked "appears somewhere," which a paraphrase passes. Paraphrase is where the behavioural requirement dropped — a drop with a citation. The check is now "appears intact, in the intent's own words."
- **The coverage trace.** Both old directions trace content; neither asked "where does this get done, and where does this get proven?" Stage2-speak carried an objective assigned to no phase and a behavioural goal no phase demonstrated. The Coverage table (goal and each objective → Done by / Proven at) is the upward trace extended to accountability; UNCOVERED goes back upstream to the SC, never resolved by the scribe — resolving it alone is exactly how the invented test happened.
