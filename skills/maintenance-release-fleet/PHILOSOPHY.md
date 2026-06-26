# maintenance-release-fleet: editorial context

This file is the editorial context for `maintenance-release-fleet`. It is not loaded at runtime. Read it before you modify `SKILL.md`, so a reasonable-looking edit doesn't quietly undo a decision made for a reason that isn't on the surface.

## Why this skill exists

@shellicar packages need routine maintenance — CVE fixes and dependency updates — run the same way every time, by casts that start from zero. Without a captured workflow, each cast re-derives it, and the expensive parts (how the fix mechanism actually behaves, which decisions are mine) get re-learned, or got wrong.

## Origin

Rebuilt for pnpm 11 in a long session on 2026-06-19/20. The skill had been written as if pnpm were versionless. It wasn't — the version was the whole problem.

The old fix path was `pnpm audit --fix` (which writes overrides) followed by deleting `pnpm-lock.yaml` and `node_modules` and reinstalling, to dodge pnpm's override-chaining bug (pnpm#6774). Deleting the lockfile re-resolves every dependency in-range — so a security fix silently drifted unrelated packages forward. That was tolerated only because, on pnpm 10, `audit --fix` couldn't reach transitive dependencies (where most CVEs live) any other way.

pnpm 11 changed the ground. `pnpm audit --fix=update` (v11.0.0) patches the vulnerable entries in the lockfile directly, with no overrides — so there is no override chain to break, no reason to delete the lockfile, and no drift. That one change retires the nuke and pnpm#6774 together.

The second discovery: the audit already tells you, per advisory, the installed version (`findings`) and the fix range (`patched_versions`). So you know *before* touching anything whether a fix needs a major — and you set those aside up front via `auditConfig.ignoreGhsas` (tested: `--fix=update` honours it) instead of applying them and trying to revert. There is no revert step in the workflow because nothing wrong is ever applied.

## Key insights

- **pnpm 11 is a hard floor.** 10.x `audit --fix` doesn't reach transitive deps; the upgrade is step one, not a nicety.
- **`--fix=update`, not `--fix=override`.** Surgical, lockfile-only; no config cruft, no drift, no nuke.
- **Majors are detected from the audit, ahead of time, and never auto-applied.** The committed `pnpm audit --json` is the record this turns on.
- **The committed audit JSON is the spine.** Generated, committed, read for the major analysis, re-committed after — the diff old→new is the change.
- **Config defaults are supply-chain hardening,** and on pnpm 11 they live in `pnpm-workspace.yaml`, not `.npmrc` (which pnpm no longer reads for them).

## Decisions

- **Written for pnpm 11, not versionless.** The version is load-bearing; pretending otherwise is what let the old skill drift.
- **`trustPolicy: no-downgrade` kept, exclusions applied only on the error.** `chokidar@4.0.3` is the known-acceptable one (pnpm's own docs use it as the example); a *new* `ERR_PNPM_TRUST_DOWNGRADE` stops and comes to me — it is not excluded on the cast's initiative.
- **`ignoreScripts: true` is the script default; no `allowBuilds` allowlist.** Tested: esbuild works with its postinstall blocked, because its binary ships as a platform optional-dependency, not from the script. Nothing in these repos needs a build script allowed.

## What was rejected

- **Fix-all-then-revert-the-majors.** `git restore` is all-or-nothing: to undo 5 majors it throws away the 145 good fixes. Useless. Up-front detection replaces it.
- **The override-pin-downgrade dance** to walk a major back. Fiddly and in pnpm#6774 territory; unnecessary once majors are never applied.
- **After-the-fact lockfile diffing** to spot majors. The audit tells you before you touch anything.
- **The lockfile/node_modules nuke.** It drifts everything; `--fix=update` makes it pointless.

## What this skill does NOT cover

- The dependency-update (ncu) flow is orthogonal to the CVE path and unchanged by pnpm 11.
- Version bumping and releases — handled by `github-version` / `github-release`.

## Notes for future editors

- pnpm 11 is the floor. If you find yourself documenting a pnpm-10 workaround, stop — the version assumption changed for a reason.
- The fix mechanism is `--fix=update`, never override+nuke. Reintroducing the nuke reintroduces the drift.
- Majors are detected from the committed audit and set aside via `ignoreGhsas` — never auto-applied, never reverted.
