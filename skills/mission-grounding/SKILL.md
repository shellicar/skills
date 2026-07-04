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

## The other failure — dropping what the intent settled

That "short is correct" holds for one kind of shortness only: shortness from cutting invention. There is an opposite failure, and it is just as real — carrying *less* than the intent settled. A blueprint, an illustration, a decision the SC pinned in `intent.md` is *grounded* (its source is the SC), so it must land in the mission. Dropping it is not a short mission done right; it is a hole.

So the trace runs in two directions, and both are part of the mechanical pass below. Mission → source proves nothing in the mission is unsourced. Intent → mission proves nothing the intent settled is missing: every settled thing — blueprint, illustration, decision — is confirmed to have a home in the mission. A settled thing with no home is a drop, and it goes back in — dropping what the SC decided is as much a failure as inventing what they did not.

## The three sources

Every claim traces to exactly one of three:

1. **SC** — the SC decided it in the conversation; `intent.md` carries it.
2. **Project** — the project's own agent-facing files carry it: its `README.md`, its `CLAUDE.md`, and its brief. Those are the whole of what a project tells you — you do **not** read the code. A fact you would have to open the worktree to confirm is not grounded here; it is the operator's to establish.
3. **Fleet** — a harness rule or reference declares it.

No fourth source exists. A claim that traces to none is invented. "It follows from X," "the natural consequence," "presumably," "it should" — these are invention dressed as logic, not a fourth source.

**True is not a source either.** PBI 1089 (2026-06): a planning session wrote "credential-shaped" variables into the prompt as the secrets to map — name-vibes, never queried, never discussed. Told to audit them out, the audit *added* a package.json finding — verified, true, and still wrong, because nobody had agreed it. A verified fact that traces to none of the three sources is still cut; if it matters, it goes back upstream as a question, never in as a fact.

## The mechanical pass — list first, judge second

The mission body is written first (scaffold, then fill — you MUST use `create-mission.mjs`; see the scribe role). Then grounding runs as a short sequence of writes that produce a colocated `provenance.md` beside `mission.md`. One rule carries the whole discipline: **everything is listed before anything is judged, in separate writes.** A claim written down before its source is assigned cannot be quietly reworded to fit a source you are inventing for it; a settled item written down before it is checked cannot be quietly forgotten.

The sequence:

1. **List.** Create `provenance.md` from `TEMPLATE.md` with both lists complete and unjudged: every **Claim** — one line per statement in the mission the operator will act on, quoted from the draft — and every **Settled item** — one line per decision, blueprint, or illustration the SC pinned in `intent.md`. No sources, no verdicts yet.
2. **Judge.** In a second write, against the frozen lists: to every claim, append `Source:` (`SC — "<their words from intent.md>"`, `Project — <the CLAUDE.md / README / brief line>`, `Fleet — <ref>`, or `INVENTED`) and `Verdict: keep | cut` — `cut` = `INVENTED`, or a source you cannot actually point to. To every settled item, append `Carried: <where in the mission>` or `DROPPED`.
3. **Apply.** Edit `mission.md`: remove every `cut` claim, restore every `DROPPED` item.

The separation between listing and judging is the defence. Judging happens against a written list — not against a claim you are inventing as you justify it, and not against a memory of the intent that recalls selectively. Fold the pass into a single write and generation composes each claim and its source together, which is exactly where invention hides; the end-state mission looks identical either way, so the collapse is the path of least resistance. The file, not the head, because the pass must be visible from outside: the list write and the judge write either appear in the tool log or they do not.

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
