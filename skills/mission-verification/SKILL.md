---
name: mission-verification
description: |
  WHAT: How the executor verifies a finished mission before dispatch — two cross-checks that prove mission.md is good: every content claim is grounded in provenance.md, and the mission represents intent.md.
  WHY: The executor is accountable for the mission — when the operator builds the wrong thing, that is on the executor, not the scribe. Reading the scribe's self-assessment and nodding is not verifying: a plausible invention reads exactly like a grounded claim, so only a cross-check catches it.
  WHEN: Loaded by the executor, on a finished mission, before it is dispatched.
user-invocable: false
metadata:
  category: standards
---

# Mission verification

You are the executor, and you are accountable for this mission. When the operator builds the wrong thing, that is on you, not the scribe — so you do not read `provenance.md`'s self-assessment and pass it. You cross-check. A made-up specific reads exactly like a grounded one; the only thing that catches it is checking it yourself.

This is the mirror of the scribe's `mission-grounding`: grounding writes the trace, verification proves the trace holds *and* that the mission is the one the SC actually wanted. Two checks — passing both is what proves `mission.md` is good.

## Check one — every content claim has provenance

Go through `mission.md` claim by claim. For each thing the operator will act on, confirm it is in `provenance.md` and traces to a real source.

The trap is not a claim provenance grounds badly — it is a claim provenance **omits**. A content claim that appears in `mission.md` but nowhere in the trace is ungrounded, and it is invisible if you read provenance alone: you catch it only by reading `mission.md` and asking, of each claim, "is this in the trace?" An omitted content claim is a fail.

**Content, not boilerplate.** The header fields (`Written against version`, `Deliver to`, the date) are not content claims to trace — they are defined in `mission-artefacts`, and you *act on* them, you do not verify them. And you do not chase spelling, wording, or a branch name; a wrong mission is not made of those.

## Check two — the mission represents the intent

Read `mission.md` against `intent.md`, in both directions.

- **Nothing drifts.** Nothing in the mission distorts the intent, puts back what the intent set out of scope, or invents past what the intent settled.
- **Nothing is dropped.** Everything the intent carries that belongs in the operator's brief is in the mission. A blueprint, an illustration, a decision the intent settled — left out of the mission, that is a fail. The intent can be perfect and the mission still wrong because the scribe dropped something for no good reason.

Check one proves nothing was invented. Check two proves the mission is the right mission, whole — nothing added, nothing lost. Together, they are the proof.

## When a check fails

You do not fix it and dispatch anyway. A failed check means the mission is not ready: an ungrounded claim goes back to be grounded or cut; a drift from the intent goes back to the scribe, or to the interlocutor if the intent itself was missed. You are accountable — so "I cannot verify this" means it does not ship, not "the SC's call."
