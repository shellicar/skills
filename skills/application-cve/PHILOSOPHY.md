# application-cve: editorial context

This file is the editorial context for the `application-cve` skill. It is not loaded at runtime. Read it before modifying `SKILL.md`, so the change stays aligned with the reasoning that produced it.

## Why this skill exists

On the easypass #10603 mission I watched three handlers re-derive the same CVE-clearing workflow from scratch and flounder in the same places, because no process for it existed anywhere durable. The workflow being absent — not any failure of effort — was the highest-cost problem of that mission. This skill is that workflow, written down once so the next session inherits it instead of rebuilding it.

## Origin

easypass #10603, June 2026: clear the repo's `pnpm audit` advisories down to one accepted remainder (@apollo/server, deferred to v5). The audit started around 120 advisories and was cleared to that one. pnpm 10 → 11 was the pivot — it fixed the bug where `pnpm.overrides` could not reach transitive dependencies. The knowledge/wisdom writeup that is now the back half of the `SKILL.md` was first written into that mission file after a supervisor failed for lacking exactly it: it read the literal audit output and the version digit, and applied the wrong scenario's gate. Lifting it here is what the #10603 post-mortem asked for, before it rotted in a mission file.

## Key insights that shaped this skill

### An application is its lockfile

This is the defining line, and the reason it is a new skill rather than a tweak to `maintenance-release-fleet`. An application deploys what its lockfile resolves, so `pnpm audit` on the lockfile is the right gate. A published package is the opposite — its lockfile means nothing to its consumers — which is the shape `maintenance-release-fleet` serves. The library counterpart reached the opposite conclusion (drop `pnpm audit` from CI) for the same lockfile reason; it is recorded in `claude-fleet-shellicar/projects/claude-cli/post-mortems/2026-06-21_cve-strategy.md`. The two are complementary.

### Knowledge and wisdom travel together, in the runtime file

The #10603 supervisor failed precisely by having one without the other: without the knowledge it read the version digit; without the wisdom it applied the wrong gate. That is why the two are welded in the `SKILL.md` and not split into a reference skill and a process skill — splitting them institutionalises that failure, by making it possible to load the doing without the framing.

It is also why the knowledge/wisdom sits in the `SKILL.md` (runtime), not only here. It is needed to execute the skill safely, so it loads with it — the same call I made for `sc-commit-writing`, where the philosophy is combined into the runtime file because the work cannot be done well without it. This `PHILOSOPHY.md` holds the history; the execution-needed why is in the skill.

### pnpm 11 is the floor

I made this a pnpm 11 skill: updating to pnpm 11 is a precondition of following it, not the first option to try. pnpm 11 is what lets `pnpm audit --fix` reach transitive dependencies (pnpm 10 could not — pnpm#6774) and what provides the `update` method at all. So the skill's mechanism is `pnpm audit --fix`, not the hand-written overrides #10603 used; on pnpm 10 that mechanism does not exist. The bump can itself break things, so it is analysed, not taken blind (the CI traps in Gotchas). The general lesson still holds — a package-manager update can clear advisories a marathon of manual work otherwise would — but here it is settled as a requirement, not a step.

### "What changed and why" is a verification step, not a deliverable

Accounting for every moved version, and confirming each is CVE-driven, is how an unrelated change is stopped from riding along on a dependency sweep. On #10603 every version that moved bar one (a browserslist pin) was CVE-driven; that discipline is why.

### CVE volume is a drift signal

The #10603 audit climbed from ~123 to ~154 during the work — what unwatched drift looks like. Watching for it is a separate piece (a health check), not this skill, but the framing belongs in the lineage.

## Decisions made

- **Name: `application-cve`.** It names the load-bearing axis — application versus library — which is the whole reason the skill is distinct. Platform-agnostic; GitHub or Azure DevOps is irrelevant to it.
- **Category: standards.** It is a process held to a standard of done (audit clean bar agreed remainders), like the other standards skills.
- **Knowledge/wisdom in the runtime file.** Execution-needed, so it loads, following the `sc-commit-writing` precedent. See the key insight above.
- **Generic here, repo-specific in project memory.** The exact pnpm-11 CI fixes for a given repo, and that repo's override-alias keys, are repo-specific and live in its `CLAUDE.md`. The skill keeps the generic class of trap so it stays portable.
- **pnpm 11 is a precondition, not a step.** The skill's fix mechanism is `pnpm audit --fix`, which only works on pnpm 11. Rather than carry a pnpm-10 path, the skill requires the bump up front. The SC's call (2026-06-23): make it a pnpm-11 skill.
- **override vs update is a repo choice.** `pnpm audit --fix` takes `override` (forces via `package.json`, an explicit standing pin) or `update` (updates the lockfile where ranges allow, no pin). Neither is globally right; it is a per-repo policy recorded in project memory. The operator follows the repo's choice and raises it where none is recorded — it is not the skill's place to pick.
- **The audit JSON is a committed record, at `.claude/audit/<yyyy-mm-dd>.json`.** Cross-referenced from `maintenance-release-fleet`, which turns on the same spine. `pnpm audit --fix` removes advisories from later output, so once fixing starts the information is gone; the committed snapshot is the record, the reference, and — re-captured after the fix — the before/after diff of what changed.

## What was rejected

- **Tweaking `maintenance-release-fleet` instead of a new skill.** Wrong shape — it serves published packages, where the lockfile is meaningless to consumers. The application case is the opposite.
- **Splitting reference (knowledge) from process (wisdom/method) into two skills.** Recreates the supervisor's exact failure. They stay welded.
- **Hand-written `pnpm.overrides` as the primary mechanism.** What #10603 did, and what the first draft of this skill prescribed. Superseded: on pnpm 11 `pnpm audit --fix` writes the overrides (or updates the lockfile) for you. Manual overrides remain only as the fallback for what `--fix` cannot express — an aliased dependency, a version-scoped pin.
- **A mission to "build the skill."** The content was already discovered and proven by #10603; this is consolidation of verified material, not discovery, so it was authored directly rather than re-derived in a worktree.

## What this skill does NOT cover

- **Library / published-package CVEs.** That is `maintenance-release-fleet`, and the claude-cli post-mortem records the opposite conclusion for the same reason.
- **Repo-specific traps.** Exact CI fixes and override-alias keys for a given repo live in that repo's project memory.
- **The health check / radar** that watches audit drift across repos. Separate piece.
- **Whether the skill is marked for supervisor adherence (`SUCCESS.md`).** Not written; open for the SC.

## Notes for future editors

- The application-is-its-lockfile line is load-bearing. If an edit softens it, the skill loses the thing that distinguishes it from the library case, and the gate stops meaning what it means.
- Knowledge and wisdom stay together and stay in the runtime file. An edit that moves either out, or splits them, reintroduces the failure the skill was built from.
- Content is sourced from #10603 — proven on a real mission. New claims about pnpm mechanics, or new gotchas, should come from an observed mission, not from plausibility. Adding plausible-but-unverified detail is the `specification-discipline` failure.
