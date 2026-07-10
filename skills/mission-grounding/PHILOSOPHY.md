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

## 2026-07-08 (late): provenance-first — the skill redesigned from its purpose

A fleet-wide survey of all fifteen `provenance.md` files, prompted by the SC, found the original design congenitally broken, and the skill was rewritten around one inversion: **provenance is written first, and the mission is composed from it.**

What the survey showed:

- Every file, every claim: `keep`. Not one recorded invention. The one mission known to be wrong (stage2-speak) carried a fully passing trace.
- The all-pass outcome was structural, not lazy scribes. The original pass (write mission → list own claims → judge own claims) is self-review: the author's blind spots are the entire threat, and a trace can't record what its author couldn't see.
- Worse than useless for the verifier: a post-hoc trace anchors the independent check on the author's account — the author's claim selection, excerpts, and map of where to look. Contamination of the one independent step.

Where the broken shape came from (traced through git by the SC's direction):

- The procedure was copied from `devops-review` — a skill where Claude reviews *someone else's* work, where a verdict is native. Pointed at the scribe's own draft it became self-review.
- The artefact format was extruded from the skill's own teaching table — the #303 hook-path example, a what-NOT-to-do exhibit whose `INVENTED | cut` rows are unreachable in any finished file (a cut claim leaves the mission before the file is final). The template was a picture of failure-detection that could only ever be filled with `keep`.
- The source taxonomy was read off the same exhibit: "Codebase" was a legitimate source in #303 (an Investigator had run) and incoherent for a scribe (who never reads code) — congenital, not drift; later papered over as "Project".
- The #303 material is real — `projects/claude-cli/investigation/2026-04-21_303_*` and `prompts/2026-04/2026-04-21_303_hook-improvements.md` in the fleet repo — but it was a judging demonstration, never a provenance artefact, and the skill carried it uncited from birth (`71e921b`).

The redesign, and its honest limit:

- Extraction first (Evidence rows: decided item, enum Source `SC | Project | Fleet`, Text you must actually produce), mission composed from the rows, `Carried` filled as rows land, Coverage for goal/objectives, Gaps sent upstream.
- No verdict column anywhere: the author judges nothing. The verifier walks two legs — provenance ← sources, mission ← provenance.
- Nothing can *force* generation to take the order; Claude can still compose everything at once. The SC's ruling: this direction is the only way the skill provides value — it puts the sources in front of the scribe before/while the words form, which is the only moment grounding can happen. It primes; it does not enforce. Same mechanism-class as the teapot markers.

Rejected en route: keeping a `Verdict: keep | cut` column (self-verdict, 100% pass rate across the fleet); an `INVENTED` enum value (unreachable in a finished file — nobody ever writes it about their own claim); free-written source labels (the fleet invented seven categories in four days).
