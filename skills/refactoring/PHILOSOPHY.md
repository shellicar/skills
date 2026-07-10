# refactoring: editorial context

Not loaded at runtime. Read before you change `SKILL.md`, so the edit stays aligned with the reasoning that produced it.

## Why this skill exists

Quality never happens unless it is someone's deliverable. Every operator optimises its phase's definition of done — plan implemented, tests pass — and steps over the mess ("pre-existing, not mine"); nobody itches to improve anything. On an agentic platform that is fatal at machine speed: the per-PR quality delta compounds, and if each PR leaves the code slightly worse, decay is monotonic. The Cleaner is the phase whose task completion *is* code quality; this skill is how the SC's expertise reaches it.

## Origin

Written 2026-07-09/10, in the session that also excavated the provenance-template failure. Triggering evidence: an operator found a real type error, wrote a memory warning the next session about it, and still filed it "another package's problem, out of scope." The SC's kitchen test (the flatmate who tip-toes through the mess) entered the coding roles the same night; this skill followed when the Cleaner gained refactoring as its mechanism.

Primary sources: the refactor-survey smell taxonomy (`claude-fleet-shellicar/projects/claude-cli/prompts/2026-05/2026-05-07_refactor-survey.md`, categories derived from PRs the SC approved) and a prior session's handover on the SC's refactoring frame (refactoring is continuous discipline owed to the next developer; the big refactor missions were forced remediation, and applayout was a rearchitect, not a refactor). The SC's raw words: sessions 08bba567 (2026-06-11) and ab3491b5 (2026-06-26).

Second evidence pass, 2026-07-10: five investigators each read one remediation PR (the diff, not the mission record) — findings in `claude-fleet-shellicar/projects/claude-cli/investigation/refactor-investigation-{246,247,316,339,381}.md`. What they established, now cited in the SKILL: #246 and #316 were deferral (a settled decision or an in-hand capability left unfinished for days — the "unfinished follow-through" smell); #339 and #381 were genuine rearchitecture with no incremental path (the coupling itself was the smell — the source of the one-small-step test); #247 was a disciplined small step that still silently dropped a repaint no test asserted (the "tests only prove what they check" caveat); #381's ride-along cleanups landed only because the files were open (the file-open sentence in When). A sixth candidate, PR #248, was cut: it was a feature swept into the list by filename proximity — itself a lesson in ungrounded labels.

## Key insights that shaped this skill

- **"What works today should still work after — that's it."** The SC's own fence. Behaviour preservation checked by the green suite is what makes refactoring one of the most *bounded* activities, not one of the riskiest — an early Claude claimed the opposite and was corrected.
- **Context over choreography.** The SC's philosophy: when Claude knows what he wants, Claude is smart enough to work it out. The skill transfers understanding (who you are, why this matters, what good is) and keeps mechanics minimal. It deliberately does not spell out a transformation loop.
- **Analogies are the teaching, not decoration.** The kitchen, the knife (Claude knows how to cut but has never held a knife — capability without the weight of experience; the SC provides the expertise, Claude the doing). These carry the disposition in a way checklists demonstrably do not.
- **The closed loop.** "Match the existing code" is forbidden as the fallback: the corpus is AI-written, so matching it is Claude copying Claude with no external correction. Authority lives in the SC's declared standards.
- **Refactor ≠ rearchitect.** Moving design boundaries is design and goes up. The applayout mission is the precedent for the confusion.
- **Scope = the mission's footprint.** The diff against main is the lens: the code this mission disturbed, and no further.

## Decisions made

- **A phase, not continuous, not a mission.** The SC ruled the WHEN: its own phase of a PR, once the work is done and working with tests as the net. The handover's "continuous, never a batch phase" describes the ideal disposition; the phase is how the structure carries it, and it prevents the forced remediation missions.
- **4W1H headings.** The SC's explicit direction, and the reason matters: each question is a piece of the understanding a competent engineer needs — the headings transfer context, they are not a form.
- **The smell list starts from the survey taxonomy, not from generation.** Seven categories from approved PRs plus the standards' items. Explicitly not exhaustive; it grows by the SC's word.
- **Elegance, readability, maintainability named as deliverables** even though unmeasurable — the SC: "may not be easy to measure, but they are important."

## What was rejected

- **Procedure-shaped drafting.** An earlier draft (written without consulting the SC, deleted at his order) was headings of method — precondition, loop, record. The rewrite leads with who/why; mechanics shrank to the fence and the footprint.
- **Leading-word compression (the mattpocock doctrine).** The SC hard-disagrees: analogies drawn in full are the best way to explain; compression bets on priors, analogies build understanding. Matt's skill is read for its diagnostic vocabulary only.
- **"Match the existing code" as the bar** — the closed loop above.
- **Verdict-style self-assessment** — the same session's provenance lesson; the record is the debrief, judged downstream.

## What this skill does NOT cover

- The Cleaner's lint duty and gate-is-not-scope rule — those live in the role.
- When a rearchitect is worth doing — that is design, decided with the SC.
- Repo-specific smell instances — the survey documents those per project.

## Notes for future editors

- The analogies are load-bearing. Editing them into abstract rules undoes the skill's mechanism.
- Keep the smell list grounded: additions come from PRs the SC approved or his word, never from generated best practice.
- The fence sentence is the SC's verbatim; do not paraphrase it.
