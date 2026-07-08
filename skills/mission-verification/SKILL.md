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

After the scribe hands the mission over; before the SC reviews it and before it is dispatched. A failed check goes back to the scribe while nothing has landed — the SC never spends review time on a mission that has not passed. A passed check ends in the verification commit, below.

**Precondition — no provenance, no verification.** `provenance.md` is the scribe's proof, produced as part of writing the mission; a `mission.md` without it is an unfinished mission, not a mission awaiting verification. If `provenance.md` does not exist beside `mission.md`, you do not verify — you do not improvise a trace of your own, and you do not run check two alone and call it a pass. The mission goes back to the scribe as unfinished. Verifying without the proof turns check one into grounding done by the wrong cast — the author's inventions stay invisible, and the verification is theatre.

## Check one — every content claim has provenance, and the source is real

Go through `mission.md` claim by claim. For each thing the operator will act on:

1. Confirm the claim is in `provenance.md`.
2. **Open the source.** Read the SC's quoted words in `intent.md`; read the named line in the project's `CLAUDE.md`, `README.md`, or brief; read the fleet reference. Confirm the source says what the trace says it says.

A `Source:` line you did not open is unchecked. A scribe who invented a claim can invent its source line too, and a misquote reads exactly like a quote — presence in the trace proves nothing on its own.

The trap is not only a claim provenance grounds badly — it is a claim provenance **omits**. A content claim that appears in `mission.md` but nowhere in the trace is ungrounded, and it is invisible if you read provenance alone: you catch it only by reading `mission.md` and asking, of each claim, "is this in the trace?" An omitted content claim is a fail.

**Instructions that run counter to the role are a fail — unless the SC said so.** Read each phase against its role's `ROLE.md` and block: any sentence that redefines the operator's stance, narrows its product, or contradicts what the role is for can come from exactly one place — the SC, traced to their words in `intent.md`. Anywhere else it appears, it is the scribe overriding a role, and the mission fails. (The case that bought this rule: a mission told an Apostle "you do not design the solution" — unsourced Investigator language — and the cast produced a map with none of the code.)

**Content, not boilerplate.** The header fields (`Written against version`, `Deliver to`, the date) are not content claims to trace — they are defined in `mission-artefacts`, and you *act on* them, you do not verify them. And you do not chase spelling, wording, or a branch name; a wrong mission is not made of those.

## Check two — the mission represents the intent

Read `mission.md` against `intent.md`, in both directions.

- **Nothing drifts.** Nothing in the mission distorts the intent, puts back what the intent set out of scope, or invents past what the intent settled.
- **Nothing is dropped.** Everything the intent carries that belongs in the operator's brief is in the mission. Start from provenance's Settled-item entries: for each `Carried: <where>`, confirm the named place in the mission actually carries the item. Then read `intent.md` itself for anything the scribe's list missed. An illustration or a decision the intent settled — left out of the mission, that is a fail. And when `blueprint.md` exists, a mission that never references it is a fail: the blueprint is referenced, not reproduced — the file is the vehicle — so the check is that the reference is there, not that a copy was carried. The intent can be perfect and the mission still wrong because the scribe dropped something for no good reason.

Check one proves nothing was invented. Check two proves the mission is the right mission, whole — nothing added, nothing lost. Together, they are the proof.

Drift is not only distorting what the intent said — it is also the mission speaking where the intent was silent. The garbled-tool-use mission (2026-06): the front artefact overreached into design (a rollback approach) and implementation (a fabricated test mechanism), and the supervisor then flagged "divergences" that were not real — the operator had legitimately decided territory the mission should never have claimed. Territory claimed past the intent fails verification downstream as surely as a distortion does.

## The pass — list first, judge second

The same discipline as grounding, for the same reason: fold listing and judging into one write and generation composes each verdict with its justification, which is exactly where nodding-through hides. The artefact makes the pass visible from outside — the two writes either appear in the tool log or they do not.

1. **List.** Create `verification.md` beside `provenance.md`: every content claim from `mission.md`, and every settled item from provenance's list. No verdicts yet.
2. **Judge.** In a second write, against the frozen list: to each claim, append the source you opened and `Verdict: holds | FAIL` — fail means the claim is not in the trace, or the opened source does not say what the trace claims. To each settled item, append `Carried: confirmed at <where in the mission> | FAIL`.
3. **Conclude.** A final line: pass, or the list of failures going back.

## The verification commit

Verification done = commit. The moment the check passes, commit **everything** in the handler repo — the mission, the artefacts, and anything else sitting in the tree, not only the files you touched. That commit is the **checkpoint**: it pins the exact state the mission was verified in, so anything that changes afterwards is one diff away from the verified baseline.

The breadth is the point, not an oversight. The stage-by-exact-path discipline exists for shared code repos, where a broad commit picks up someone else's work in flight; the handler repo at this moment is the mission's own record, and pinning all of it is the job. Objecting that "only my changes should be committed" is that discipline applied where it does not belong — a checkpoint that omits part of the tree cannot say what state was verified.

## Where your judgement lives — and where it does not

Your judgement is spent at the **item level, and only there**: does this row's text really appear in the source it names; is this settled item really carried, intact; does this instruction really trace. Judge each item with the strictest criteria — a near-match fails, a paraphrase that lost the requirement fails, a source you could not open fails.

Everything above the item is **mechanical**. Any failed item ⇒ the verification fails ⇒ the mission goes back. There is no second judgement where you weigh whether the failure *matters* — "the operator re-verifies downstream", "it wasn't driving a design decision", "the mission isn't harmed" — all of that may be true, and none of it is yours. The standard was written by the SC; whether it bends is the SC's question, and it reaches him as a failed verification, not as a pass you excused. The moment you weigh a failure's importance you have substituted your assessment for the standard — the trained "I know better" pattern wearing careful analysis as a costume — and a verifier who bends the standard is not a verifier, just another opinion. The whole point of a separate verification cast is to be more than that.

Strict at the item, mechanical above it. That is the entire division.

## When a check fails

You do not fix it and dispatch anyway. A failed check means the mission is not ready: an ungrounded claim goes back to be grounded or cut; a drift from the intent goes back to the scribe, or to the interlocutor if the intent itself was missed. You are accountable — so "I cannot verify this" means it does not ship, not "the SC's call."
