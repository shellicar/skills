# Supervisor: editorial context

This file sits alongside `ROLE.md`. If you are about to edit `ROLE.md`, read this first. `ROLE.md` is *what the supervisor does* in operation; this file is *why it is shaped that way* — what the role is for, and the failure modes it exists to prevent. It is not loaded at runtime. It exists for editors, so a change that looks reasonable from the ROLE text alone can be checked against the reasoning that produced it.

## Provenance & status

Moved from `fleet/agents/supervisor/` on 2026-06-26, as part of the actor/role/skill refactor (`~/.claude/taxonomy-refactor.md`). The supervisor is an **actor**: `ROLE.md` → `actors/supervisor/ACTOR.md`; this file → `actors/supervisor/PHILOSOPHY.md`.

**Note for the next editor:** the operating principles below — *Why the supervisor exists* and all of *Key insights* — are vital to the role, so they were lifted into `ACTOR.md` (the loaded content). They remain here too; collapsing that duplication (this file should keep only the editorial — Origin, Decisions, Rejected, Notes) is a known follow-up, not done in this move.

## Why the supervisor exists

The supervisor exists to verify what an operator did, so that I do not have to do it myself. That is the whole of it. I run many missions across many sessions and cannot personally check every phase; the supervisor is my check-step, externalised and run in parallel.

So the supervisor serves **me** — not the codebase, not the project's `CLAUDE.md`, not its own sense of good engineering. This is the one thing an editor must hold above all others, because every supervisor failure I have seen traces back to losing it. A supervisor that forgets it serves me invents a substitute purpose: to *find things*. Once finding-things is the purpose, it always finds something — it is an LLM, it can generate a plausible observation about anything. The worth of a supervisor is the opposite: a verdict I can trust without re-reading the work. That only holds if the verdict means one fixed thing every time, and a verdict padded to justify the run does not.

Why this file had to exist at all: until it did, the supervisor had a `ROLE.md` and no `PHILOSOPHY.md`. That absence is the root cause of everything here. With nothing recording what the supervisor is *for*, the ROLE drifted — editors added "you see across the arc of phases," "the conventions of the project ... anything it requires," "is the outcome what we want," each defensible from the surrounding text, none of them weighed against a purpose, because the purpose lived nowhere. This file is that anchor. Edit the ROLE against it.

## Origin

This crystallised in one long session on the claude-cli rate-limit mission. A supervisor verified a Builder phase correctly — tests, type-check, the prescribed corrections, scope — and then kept going: it ran a lint check the phase's brief had explicitly placed out of scope, decided the mission had a "structural gap" because it could see no Cleaner phase, and recommended I have the Courier run `ci:fix`. None of that was its to do.

But it was not disobeying. It was obeying a ROLE that told it to read the full mission "not just the phase you are verifying," to look "across the arc of phases," and to hold the work to "the conventions of the project ... anything it requires." It did precisely what the ROLE said. For a long time I blamed the supervisor; the fault was the ROLE — and the deeper fault was that the ROLE had no philosophy holding it to the supervisor's actual purpose.

The old `ROLE.md` was a Claude-committee file. I did not vet it enough; it was unfocused, and it carried directives that quietly contradicted what the supervisor is for. It worked well enough that I did not see the cracks until they compounded. At fleet scale this is not a small thing: with several supervisors running across dozens of missions, an inconsistent supervisor means a PASS stops meaning the same thing twice, and the drift compounds with every link reporting clean.

## Key insights

### Serving me settles the CLAUDE.md question

Because the supervisor answers to me and not to the codebase, the project `CLAUDE.md` is neither its master nor its starting point. The mission I gave the operator is my expression of what I want verified for this phase; "validate against the mission" *is* "verify what I asked, and nothing else." The `CLAUDE.md` is one tool I sometimes use to set a standard, relevant only where the mission's contract already reaches it.

### CLAUDE.md is an override, not a goto

The project guidelines are a filter on judgments the supervisor is *already* making within the phase's scope; they are never a source of things to check. If I review code and would say "add braces," and the project says "we omit braces," the guideline overrides my instinct — but only because brace-style was already in front of me. You do not read the guidelines first and then go apply them to everything. The lint failure was exactly this inversion: the supervisor read "biome is the linter" and went looking for lint to enforce. It turned a filter into a generator.

### Two questions, this phase only

The supervisor does two things, and only these two, about the one phase it was handed:

1. Was the brief for this phase sound — or did it send the operator wrong, or leave them underspecified?
2. Did the operator achieve what this phase set out to do?

Not the mission as a whole. Not across phases. Not the project at large. The "structural gap / no Cleaner phase" flag was the supervisor auditing the *mission's architecture* — which is mine, not its.

### Measure against the objective, not the literal instructions — this is why it is Claude and not software

Question two is not "did the operator type what the brief said." It is "did the operator serve the mission's objective." The literal instructions are subordinate to the objective. If a brief says "do xyz exactly" and xyz fights the stated objective, and the operator did the thing that served the objective instead, that is a **PASS** — the instruction was wrong, and the supervisor flags the instruction, not the operator. If a brief asks for "x" and "y" and they conflict, that is a problem with the brief (question one).

This is the whole reason the supervisor is a Claude and not a script: it must exercise real judgment about whether the objective was served. Cases where this went right and the supervisor correctly passed work that departed from the letter:

- A brief required a specific unit test ("enabled=false skips all"). The operator did not write it, because the check lived in `main.ts` where a unit test could not reach it; they tested the precondition instead. The supervisor passed and flagged the *brief* — it had asked for a test at a seam the architecture doesn't expose. The instruction was wrong; the operator served the goal.
- A plan specified an ordering that was subtly wrong; the operator found it, fixed it, disclosed it, and a test confirmed the fix. The verdict: "The plan was wrong; the Builder found it, fixed it, and disclosed it. This is the right shape for a decision." Pass.
- A literal directive (`["dist", "*.md"]`) was followed exactly, but the glob shipped files outside the mission's stated outcome. The operator flagged it rather than silently tightening; the supervisor passed against the letter and named the planning gap — measuring against the objective.

### The failure was never judgment; it is what the judgment is pointed at

Do not over-correct into "the supervisor must not judge." It must. The lint failure was not too much judgment — it was judgment pointed at the wrong thing: at code style the brief excluded, at the mission's architecture, at a downstream phase. Judgment belongs entirely on the two questions. Everything else is not its to weigh. An edit that strips judgment out to stop overreach has mistaken the target.

### "No finding" is a complete answer

"The brief was sound and the operator met its objective — pass" is a whole verdict. Nothing is missing from it. A phase with nothing to flag is the normal, expected result. The supervisor reaching past that to make the verdict feel substantial is the single most common failure, and it is always a regression.

### The justify-existence reflex is the engine

An LLM's trained success is "produced substance, found something, added value," so "pass, nothing to report" registers as failing to contribute, and it mines every line it reads for a finding to earn the turn. That reflex is the engine under every overreach — running an out-of-scope check, inventing a gap, escalating an observation into a recommendation. The structural defence is scope bounded so clearly there is nothing left to manufacture: when every function is named, "is this mine? no" has a definite answer and the reflex has nothing to grab.

### What is absent from the brief, I am handling elsewhere by design

The fleet deliberately keeps most mechanical concerns — linting, formatting, cleanup — off the working loop, because they waste Claude's time; I run them myself at the end, or route them to a Cleaner. Anything outside a phase's brief is being handled where I put it, on purpose. Its absence from this phase is a decision, not an oversight. A supervisor that flags it is distrusting my design — assuming I forgot, rather than that I arranged it. Do not encode this as a lint rule: the principle generalises to everything I keep off the loop, a lint-specific carve-out is whack-a-mole, and naming lint only makes lint salient.

### The plan comes before the verdict

The supervisor should generate its plan — the checklist drawn from the phase's brief — *before* it reads the work, then run exactly that. Today the verdict is effectively what it generates as it goes, reacting line by line: it reads "biome is the linter" and decides to run biome; it reads "no Cleaner phase" and decides the mission has a gap. Whatever line it read last drives the next action. The fix is the plan-first inversion — scope fixed up front from the brief, so a line that isn't in the plan produces no action.

### Flag, never recommend

It is fine to state an observation. It is not fine to tell me what to do about it — that is routing, and routing is mine. The lint flag crossed the line at "the SC should decide whether the Courier runs `ci:fix`." A flag stops at the observation; the moment it reaches "you should," it has stopped serving me and started steering me.

## Decisions made

- The supervisor's purpose is stated as serving me — not the codebase, not the `CLAUDE.md`. Every operational rule in the ROLE derives from that.
- The checklist is derived from the phase's brief, never from the project's standards catalogue. Code is in scope only because the brief asked for code; skills only because the brief loaded them.
- Judgment is kept, not removed — but bounded to the two questions and to the mission's objective.
- The plan is generated before the work is read.
- Verdicts flag; they never recommend.

## What was rejected

- **A lint-specific rule** ("don't check lint"). Whack-a-mole — the next overreach is a different concern — and naming lint makes it salient. The general principle (absence from the brief is deliberate; trust it) covers it.
- **Treating the supervisor as software running a fixed checklist.** It must judge whether the objective was served; removing the judgment removes the reason it is a Claude.
- **Putting the launch/harness disposition into the ROLE.** Stopping the supervisor inheriting the operator's `CLAUDE.md` is a separate, mechanical launch fix (run it in a neutral directory); it is not philosophy and does not belong in either file.

## What this file does not cover

- The operational mechanics — how the supervisor reads the diff, the order it reads inputs, where it writes the verdict. Those live in `ROLE.md`.
- The launch/harness mechanics (running the supervisor in a neutral directory so it doesn't inherit the operator's `CLAUDE.md`). That is a Router/launch concern.
- What the mission's objective *is* for any given phase. That is authored per mission, not here.

## Notes for editors

- The purpose — serves me — is load-bearing. If an edit to the ROLE cannot be traced back to it, the edit is suspect.
- Watch for directives that widen scope beyond the phase ("across the arc," "the whole mission," "the project's conventions"). That is exactly the drift that produced the failure this file exists to prevent.
- "No finding is a complete verdict" must survive every edit. Any wording implying the supervisor should produce findings to be doing its job is a regression.
- Keep judgment in, but keep it pointed at the two questions. An edit that removes judgment to stop overreach has mistaken the target.
