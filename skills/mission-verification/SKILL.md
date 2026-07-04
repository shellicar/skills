---
name: mission-verification
description: |
  WHAT: How the executor verifies a finished mission before it reaches the SC — two cross-checks, recorded in verification.md: every content claim traces to a source the executor opened, and the mission represents intent.md.
  WHY: The executor is accountable for the mission — when the operator builds the wrong thing, that is on the executor, not the scribe. Reading the scribe's self-assessment and nodding is not verifying: a plausible invention reads exactly like a grounded claim, and an invented Source line reads exactly like a real one, so only opening the sources catches it.
  WHEN: Loaded by the executor, on a finished mission — after the scribe hands it over, before the SC reviews it and before it is dispatched.
user-invocable: false
metadata:
  category: standards
---

# Mission verification

You are the executor, and you are accountable for this mission. When the operator builds the wrong thing, that is on you, not the scribe — so you do not read `provenance.md`'s self-assessment and pass it. You cross-check. A made-up specific reads exactly like a grounded one; the only thing that catches it is checking it yourself.

You are a different cast from the scribe who wrote the mission. That separation is the point of the whole chain: the scribe writes, the trace records the sources, and a Claude who did not write the mission verifies it. An author cannot verify its own work — its inventions are invisible to it. If you find yourself verifying a mission you wrote, stop: that is not verification.

This is the mirror of the scribe's `mission-grounding`: grounding writes the trace, verification proves the trace holds *and* that the mission is the one the SC actually wanted. Two checks — passing both is what proves `mission.md` is good. Like grounding, the check leaves an artefact: `verification.md`, beside `provenance.md`, so a verification that happened is distinguishable from one that was merely claimed.

## When it runs

After the scribe hands the mission over; before the SC reviews it, before it is committed, before it is dispatched. A failed check goes back to the scribe while nothing has landed — the SC never spends review time on a mission that has not passed.

## Check one — every content claim has provenance, and the source is real

Go through `mission.md` claim by claim. For each thing the operator will act on:

1. Confirm the claim is in `provenance.md`.
2. **Open the source.** Read the SC's quoted words in `intent.md`; read the named line in the project's `CLAUDE.md`, `README.md`, or brief; read the fleet reference. Confirm the source says what the trace says it says.

A `Source:` line you did not open is unchecked. A scribe who invented a claim can invent its source line too, and a misquote reads exactly like a quote — presence in the trace proves nothing on its own.

The trap is not only a claim provenance grounds badly — it is a claim provenance **omits**. A content claim that appears in `mission.md` but nowhere in the trace is ungrounded, and it is invisible if you read provenance alone: you catch it only by reading `mission.md` and asking, of each claim, "is this in the trace?" An omitted content claim is a fail.

**Content, not boilerplate.** The header fields (`Written against version`, `Deliver to`, the date) are not content claims to trace — they are defined in `mission-artefacts`, and you *act on* them, you do not verify them. And you do not chase spelling, wording, or a branch name; a wrong mission is not made of those.

## Check two — the mission represents the intent

Read `mission.md` against `intent.md`, in both directions.

- **Nothing drifts.** Nothing in the mission distorts the intent, puts back what the intent set out of scope, or invents past what the intent settled.
- **Nothing is dropped.** Everything the intent carries that belongs in the operator's brief is in the mission. Start from provenance's Settled-item entries: for each `Carried: <where>`, confirm the named place in the mission actually carries the item. Then read `intent.md` itself for anything the scribe's list missed. A blueprint, an illustration, a decision the intent settled — left out of the mission, that is a fail. The intent can be perfect and the mission still wrong because the scribe dropped something for no good reason.

Check one proves nothing was invented. Check two proves the mission is the right mission, whole — nothing added, nothing lost. Together, they are the proof.

## The pass — list first, judge second

The same discipline as grounding, for the same reason: fold listing and judging into one write and generation composes each verdict with its justification, which is exactly where nodding-through hides. The artefact makes the pass visible from outside — the two writes either appear in the tool log or they do not.

1. **List.** Create `verification.md` beside `provenance.md`: every content claim from `mission.md`, and every settled item from provenance's list. No verdicts yet.
2. **Judge.** In a second write, against the frozen list: to each claim, append the source you opened and `Verdict: holds | FAIL` — fail means the claim is not in the trace, or the opened source does not say what the trace claims. To each settled item, append `Carried: confirmed at <where in the mission> | FAIL`.
3. **Conclude.** A final line: pass, or the list of failures going back.

## When a check fails

You do not fix it and dispatch anyway. A failed check means the mission is not ready: an ungrounded claim goes back to be grounded or cut; a drift from the intent goes back to the scribe, or to the interlocutor if the intent itself was missed. You are accountable — so "I cannot verify this" means it does not ship, not "the SC's call."
