---
name: mission-grounding
description: |
  WHAT: How the scribe grounds a mission — a mechanical provenance pass that traces every claim to its source before the mission ships, so invention is caught by an artefact rather than left for a reader to spot.
  WHY: Plausible invention is invisible to a reader — a made-up specific reads exactly like a grounded one, so the handler's review cannot catch it. Only a per-claim trace catches it, and it must be the writing discipline, not an after-the-fact check. It is steps — so it loads as a skill, not baked into the role, where steps never fire.
  WHEN: Loaded by the scribe role, whenever a mission is being written — after the scaffold, before the mission is handed on.
user-invocable: false
metadata:
  category: standards
---

# Mission grounding

The scribe role tells you *who you are* — the one who transcribes what was decided and invents nothing. This is *how* you prove it: a mechanical pass that writes down every claim's source, so a made-up claim is caught by the trace instead of being left for a reader to spot.

## Why a trace, not a read

Plausible invention is invisible to a reader. "Persist the pointer in sqlite" (the SC's words) and "key the pointer on the conversation id" (yours, invented) read the same on the page — both sound like grounded fact. The handler reviewing the mission cannot tell them apart, because nothing on the surface separates a source you have from one you made up. A read cannot catch it.

A per-claim trace can. It forces each claim down next to its source, and the claim with no source is the invention, visible at last. So grounding is not a final read-through where you ask "does this feel sourced?" — that is the check that has failed every time. It is a pass that writes the source down, claim by claim, as an artefact.

## The replaced success function

The trained win is "produce a complete, thorough mission" — and thoroughness is exactly what invents. A compact decision ("map the CLAUDE.md watch") gets inflated into prescriptive detail ("trace the resume path, find the schema, check how the key is derived") because more detail looks more thorough. Each added clause is a new claim with no source.

The win this skill installs instead: every claim in the mission is traced to its source in the provenance file, and the untraceable ones are cut. A short grounded mission beats a thorough invented one, every time. If the trace comes out short, the mission is short — that is correct, not a gap.

## The three sources

Every claim traces to exactly one of three:

1. **SC** — the SC decided it in the conversation; `intent.md` carries it.
2. **Codebase** — the operator can open a file and verify it.
3. **Fleet** — a harness rule or reference declares it.

No fourth source exists. A claim that traces to none is invented. "It follows from X," "the natural consequence," "presumably," "it should" — these are invention dressed as logic, not a fourth source.

## The mechanical pass — fixed, batched, countable

The mission body is written first (scaffold, then fill — you MUST use `scaffold-prompt.mjs`; see the scribe role). Then grounding runs as a fixed sequence of tool calls that produce a colocated `provenance.md` beside `mission.md`. The sequence is fixed and **batched by step, not by claim** — so you cannot compose a claim and its source together in your head, which is where invention hides.

The fixed sequence:

1. **`CreateFile`** `provenance.md` — the scaffold: a header and an empty Claims section, no claim content.
2. **`EditFile`** — append every **Claim**: one line per statement in the mission the operator will act on, quoted from the draft. All claims, one call, after the draft is complete.
3. **`EditFile`** — append `Source:` to every claim, one call across all: `SC — "<their words from intent.md>"`, `Codebase — <path>`, `Fleet — <ref>`, or `INVENTED`.
4. **`EditFile`** — append `Verdict: keep | cut` to every claim, one call. `cut` = `INVENTED`, or a source you cannot actually point to.
5. **`EditFile`** `mission.md` — remove every `cut` claim from the mission.

Five calls, fixed, independent of how many claims there are. The batching is the defence: step 3 cannot begin until step 2 has listed every claim, so sourcing happens against a written list — not against a claim you are inventing as you justify it. This is the devops-review shape: Notice all, then Trace all, then Verdict — never per-item, because per-item is where in-head composition lives.

Why the file and not the head: the discipline must be countable from outside. With a fixed five-call shape the pass either ran or it did not — visible in the tool-call log, no judgement required. Fold it into a single write and generation collapses it to a plausible mission with no trace, because the end-state mission looks identical and fewer calls is the path of least resistance. Same end-state, no cost difference, and generation defaults to the bulk write. The fixed shape removes that default.

## The empty sources

When your written `Source` contains one of these, it is not a source — mark the claim `INVENTED`:

- "it follows from X"
- "the natural consequence of Y"
- "presumably / likely / it should"
- "this is how it usually works"
- "the operator will need to…" — a design decision, not one the SC made

Each is you doing a downstream role's job — the Architect's design, the Investigator's finding, the operator's build choice — leaking into the mission. A claim you cannot attribute to the SC, a file, or a fleet rule is one of those jobs in disguise. It gets cut. If cutting it leaves a real gap, the gap goes back upstream — to the interlocutor for a decision, or to an investigation — never filled in here.

### Example: tracing claims in a hook prompt

From the #303 hook path session, four claims from an early draft:

| Claim | Source | Verdict |
|-------|--------|---------|
| "Hook command paths don't support `~`." | `SC` — bug report; operator verifies by running with `~`. | keep |
| "`ApprovalNotifier` expands `~` before passing to spawn." | `INVENTED` — a design statement, nobody decided it. | cut |
| "Path resolution belongs in the config loader." | `SC` — said so. | keep |
| "`ConfigLoaderOptions` gains a `pathFields` option." | `INVENTED` — class design; the Engineer has not designed it. | cut |

Both cut claims looked like "natural consequences" of what was agreed. They were not — they were design work belonging to other roles, and each would have landed in the code.

## Problem, not design

A grounded claim states the problem; it does not design the solution. This is the substance the trace protects: a problem statement is grounded in observable behaviour the SC named or a file shows; a design statement — where code lives, what a class does, what method exists — has no source unless a decided blueprint carries it.

**Problem (grounded):**

> Hook command paths today must be absolute. `~`, `$HOME`, and relative paths fail. A relative path should resolve against the config file that defined it. Direction for where this logic lives is in the SC Direction section.

**Design (invented in prose):**

> Update `ApprovalNotifier` to expand `~` and `$HOME` using `expandPath` from sdk-tools. Export `expandPath` as a public module. Resolve relative paths against `configLoader.sources`.

The test: could the operator reasonably choose a different place for the logic? If yes, you described the problem. If no, you designed the code — and that claim traces to `INVENTED` unless a blueprint the SC decided carries it.
