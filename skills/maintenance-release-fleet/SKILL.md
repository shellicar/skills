---
name: maintenance-release-fleet
description: |
  Fleet counterpart to maintenance-release: CVE fixes and dependency updates for an @shellicar npm package on pnpm 11, run as an attended cast (human-in-the-loop at Stage 2), ending in a PR and tier-ordered releases. The committed audit JSON is the record the workflow turns on. Differs from maintenance-release only in mechanism: the branch is set up by the PM via worktree, helper scripts live in this skill's directory, and audit identifiers persist to disk so they survive across stages or session boundaries.
  TRIGGER when running a fleet maintenance mission for an @shellicar npm package.
  DO NOT TRIGGER for coworking sessions (load maintenance-release instead), single targeted dependency changes, or non-npm projects.
metadata:
  category: workflow
---

# Maintenance Release Fleet

## Who

The cast running a fleet maintenance mission for one @shellicar npm package — the fleet counterpart to `maintenance-release` (same workflow, same decisions; only the mechanisms differ).

This is an **attended** cast. Most fleet casts run unattended — the operator executes the mission end to end and the supervisor reviews. This one does not: it has a human-in-the-loop gate at Stage 2 that the cast cannot complete without. The required output of Stage 2 is the recommended plan presented to the user, closing with "what would you like to adjust?", then a full stop. That presentation is the deliverable of the stage — not a courtesy, not an internal checkpoint. Reaching Stage 4 without the user's reply in hand has skipped the deliverable, however complete the work looks.

The user decides scope. The cast gathers and recommends; it does not choose. Which scenario applies, which updates to include or skip, which packages ship — every one is the user's call, surfaced in Stage 2 and settled by the user's reply. "The mission named this skill" is not authority to skip the gate: the mission invokes the workflow, and the gate is part of the workflow it invoked.

## What

CVE fixes and dependency updates for one repository, on **pnpm 11**, ending in a PR and — post-merge — tier-ordered npm releases.

- Single repository at a time
- Security fixes (CVEs)
- Dependency updates (major / minor / patch)

## When

TRIGGER when running a fleet maintenance mission for an @shellicar npm package. Do not run it for coworking sessions (use `maintenance-release`), single targeted dependency changes, or non-npm projects.

## How

### Mechanism differences from maintenance-release

| Step | maintenance-release | maintenance-release-fleet |
|------|---------------------|---------------------------|
| Branch is created | `preflight.sh --branch <name>` runs `git switch -c` | PM creates the worktree (with branch) before the session; the cast verifies it is on the right branch |
| Helper scripts location | `~/.claude/skills/maintenance-release/scripts/` | `~/.claude/skills/maintenance-release-fleet/scripts/` |
| Audit identifiers (GHSAs) | Held in session context | Captured to `.claude/audit/YYYY-MM-DD.json` so they survive if the session ends |
| Progress tracking | TODO list in working memory | Phase status fields |

Everything else is identical. The cast detects the scenario, builds the plan, asks "what would you like to adjust?" (in the response, not via tool), the user refines, the cast executes per the refined plan, provides ncu commands for the user to run, then verifies, builds, tests, and prepares the PR.

### Helper scripts

Self-contained: scripts live in `~/.claude/skills/maintenance-release-fleet/scripts/`.

| Script | Purpose |
|--------|---------|
| `fix-audit.sh` | Guard pnpm is 11, run `pnpm audit --fix=update`, re-audit, stop on residue |
| `fix-ghsa.mjs` | Apply a targeted pnpm override for a residue advisory `--fix=update` can't reach |
| `post-ncu.sh` | Restore corepack SHA + run biome migrate after ncu |
| `verify.sh` | Run build + test, show output only on failure (context-efficient) |

### Stage 0: Pre-flight

Verify the git environment. The PM created the worktree, so the branch already exists; do not run `git switch -c`.

```bash
git status
git branch --show-current
```

**pnpm must be 11+.** On pnpm 10, `audit --fix` does not reach transitive dependencies, where most CVEs live. If pnpm is on 10.x, update it first — safe here, since these are build-script projects with no application pipelines.

```bash
pnpm --version   # must be >= 11
```

Ensure the supply-chain defaults are in `pnpm-workspace.yaml` (pnpm 11 reads config there, not `.npmrc`):

```yaml
ignoreScripts: true        # block dependency install scripts (esbuild still works — its binary ships as an optional dep, not from the script)
minimumReleaseAge: 1440    # delay newly-published versions by a day
blockExoticSubdeps: true   # transitive deps must come from the registry, not git/tarball
trustPolicy: no-downgrade  # block a version whose trust evidence dropped
```

Then capture the audit record and the update status:

```bash
mkdir -p .claude/audit
pnpm audit --json > .claude/audit/$(date +%Y-%m-%d).json
pnpm audit
pnpm exec npm-check-updates --workspaces
```

**The audit JSON is the record the workflow turns on — commit it.** It is the snapshot of what is vulnerable now: the major analysis (Stage 1.1) reads it, and the diff between this file and the one captured after the fix is the change. Capture it because `pnpm audit --fix` removes vulnerabilities from later audit output, and reconstructing GHSA IDs afterward is far more expensive than capturing them at first sight. Reference it from your testament.

#### Preconditions

1. **On the mission branch** (PM created it via worktree)
2. **Clean working tree** (no uncommitted changes)
3. **Synced with remote**

If preconditions are not met, report in the response and stop. The user replies with how to proceed.

#### Ecosystem dirty tree

After `pnpm install`, lefthook may create or move files (e.g. `scripts/verify-version.sh` becomes `.lefthook/pre-push/verify-version.sh`). The same change appears in every repo. These are expected and belong in the maintenance commit — not real uncommitted work.

If `git status` after `pnpm install` shows changes limited to lefthook/ecosystem files, include them. If it shows real work-in-progress, report in the response and stop.

### Stage 1: Information gathering

The audit and ncu output captured in Stage 0 is the source for this phase.

#### 1.1 Check for CVEs, and flag the majors up front

From the audit JSON, per advisory: severity, `module_name`, `findings` (the installed version), `patched_versions` (the fix range), and the dependency path.

**A fix needs a major when the floor of `patched_versions` has a higher major than the installed version** — computable straight from the JSON, before anything is applied:

```
installed 8.20.1, patched >=8.21.0  → minor, in-major
installed 4.7.0,  patched >=5.0.0   → MAJOR
```

Flag the majors now. They are the user's decision in Stage 2 — take the major, or set it aside — and they are never auto-applied. A major has no in-range fix (that is *why* it crosses a major), so setting it aside means tolerating the advisory, not fixing it another way.

#### 1.2 Check @shellicar package dependencies

If a CVE is found, check whether it affects other @shellicar packages. Most packages share dev/build dependencies, so a CVE in one likely affects all.

Update packages in dependency order (Tier 0 → Tier 1 → Tier 2). If `build-clean` has a CVE fix, release it first, before packages that depend on it. If an @shellicar dependency has a newer version with the fix, include it in the plan and note: "Includes CVE fix from @shellicar/build-clean 1.2.1".

#### 1.3 Trace dependency origins

```bash
pnpm why <package-name>
```

Reveals direct vs transitive, which packages pull it in, and whether the root is in `dependencies`, `devDependencies`, or an internal tool.

#### 1.5 Check for available updates

`pnpm outdated` respects semver ranges in package.json; `npm-check-updates` gives the complete picture (the Stage 0 capture already has it).

Always exclude syncpack from auto-updates. Major bumps cause breaking changes. Categorise:

- **Major** (X.0.0): breaking, skip by default in maintenance releases
- **Minor** (x.Y.0): new features, backwards compatible
- **Patch** (x.y.Z): bug fixes only

#### 1.6 Identify package context

For each update:

##### Dependency type and location

- **Production dependency** (`dependencies`): Ships to users, highest risk
- **Dev dependency** (`devDependencies`): Build/test only, medium risk
- **Internal tools** (`tools/`, `scripts/`): Internal use only, lowest risk
- **Peer dependency** (`peerDependencies`): Compatibility constraint

##### Risk assessment matrix

| Situation | Internal Tools | Dev Dependency | Prod Dependency |
|-----------|----------------|----------------|-----------------|
| CVE present | Lowest risk | Lower risk | Highest risk |
| Major update breaks | Easily caught | Caught in dev | Could break prod |
| Update liberally? | Yes | Yes | More caution |

A CVE in an internal tool is still worth fixing but has minimal real-world impact if something breaks.

##### Special package rules

- `syncpack` — never auto-update (major bumps break; always `--reject syncpack`)
- `@types/*` — should align with the main package version

##### Pin handling

This guidance applies only to versions in the `dependencies` and `devDependencies` fields of `package.json`. The `packageManager` field is not covered — it has its own SHA-pinned format, restored by `corepack up` after ncu runs.

Within `dependencies` and `devDependencies`, the absence of `^`/`~` (a pinned version like `4.5.1`) is not a signal to skip. Pin syntax tells you nothing about intent: some pins are intentional compatibility constraints, others are just how the version was recorded. If a pin matters, the user will say so when reviewing the analysis.

`peerDependencies` need careful handling. Their ranges often span multiple majors (`^11`, `^11 | ^12`) to express compatibility with consumers. Only widen a peer range when the corresponding dependency or devDependency version has also moved.

### Stage 2: Present the recommended plan

Present all information gathered, organised into recommended actions.

#### Recommendation scenarios

- **Scenario A — Critical/High CVE present.** Goal: fix the vulnerability with minimal risk. Recommend security fixes + patch updates only; skip minor and major. Don't risk breaking changes when shipping a security fix.
- **Scenario B — Moderate/Low CVE present.** Goal: fix security, slightly more liberal. Recommend security fixes + patch + minor; skip major.
- **Scenario C — No CVEs, routine maintenance.** Goal: stay current. Recommend all patch + minor; present majors individually for the user's decision.
- **Scenario D — Major update focus.** Goal: tackle a specific major bump in isolation. Recommend only the targeted major; skip everything else.
- **Scenario E — Quick patch run.** Goal: minimal maintenance, minimal risk. Recommend patch only; skip minor and major.
- **Scenario F — Nothing to do.** If no CVEs and no updates available, report "No security vulnerabilities found. All dependencies are up to date." and exit gracefully.

Detect which scenario applies, state which you are applying and why, and let the user override (e.g. "I want scenario C even though there's a CVE").

#### Format

```markdown
## Security Vulnerabilities

| Severity | Package | Type | Current | Fixed | Path |
|----------|---------|------|---------|-------|------|
| high | ws | prod | 8.20.0 | 8.21.0 | (direct) |

## Available Updates

### Major Updates (individual consideration required)

| Package | Type | Current | Latest | Notes |
|---------|------|---------|--------|-------|
| zod | prod | 3.24.0 | 4.0.0 | Breaking API changes (prod) |

### Minor Updates

| Package | Type | Current | Latest |
|---------|------|---------|--------|
| hono | prod | 4.6.0 | 4.7.0 |

### Patch Updates

| Package | Type | Current | Latest |
|---------|------|---------|--------|
| typescript | dev | 5.7.0 | 5.7.2 |

---

## Recommended Plan

**INCLUDE:** security fixes; all minor and patch updates.
**SET ASIDE (majors, your decision):** the advisories whose only fix is a major.
**SKIP:** major dependency updates (present individually).

**Reasoning:** prioritising security and safe updates; majors flagged for separate consideration.

---

What would you like to adjust?
```

The closing question goes in the response. **This presentation is the required output of Stage 2.** The stage is not complete until you have produced it and the user has replied. Do not proceed to Stage 4 on your own reading of the plan — there is no reading of the mission under which the gate is skippable. Stop here and wait.

### Stage 3: User refinement

The user replies in their next message ("just security for now", "include minor too", "let's also do the zod update", "looks good, proceed"). Adjust the plan accordingly and confirm in your next response before proceeding.

### Stage 4: Execute

#### 4.1 Apply security fixes

**Set the majors aside first.** For each advisory the user chose to set aside (from Stage 1.1 / Stage 2), add its GHSA to `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`. `--fix=update` honours the ignore list, so a set-aside advisory is skipped — never applied, so never reverted:

```yaml
auditConfig:
  ignoreGhsas:
    - GHSA-xxxx-xxxx-xxxx   # set aside: only fix is a major (the user's decision)
```

Then fix the rest:

```bash
~/.claude/skills/maintenance-release-fleet/scripts/fix-audit.sh
```

This runs `pnpm audit --fix=update` — a surgical lockfile update, no overrides, no nuke, no version drift — then re-audits and stops if anything remains.

If it stops with vulnerabilities remaining, that residue is what `--fix=update` couldn't reach in range (no patched version, or a blocked dependency graph). Apply a targeted override and re-run:

```bash
echo '[{"pkg":"<pkg>","vulnerable":"<range>","patched":"<version>"}]' \
  | node ~/.claude/skills/maintenance-release-fleet/scripts/fix-ghsa.mjs pnpm-workspace.yaml
```

If neither resolves it, report in the response and wait for the user. Do not invent a third path.

**A trust-downgrade may appear.** With `trustPolicy: no-downgrade`, the fix may stop with `ERR_PNPM_TRUST_DOWNGRADE`. `chokidar@4.0.3` is acceptable — add it to `auditConfig.trustPolicyExclude` (pnpm's own docs use it as the example), and only if the error names it. Any *other* trust-downgrade is not the cast's call: report it and wait for the user.

After fixing, re-capture the audit JSON (`pnpm audit --json > .claude/audit/$(date +%Y-%m-%d).json`) — the diff against the Stage 0 capture is the record of what changed.

#### 4.2 Apply selected updates

Do NOT run ncu with `-u` directly. The Stage 0 capture already shows all available updates.

Analyse the ncu output for packages needing special handling: **major bumps** (skip by default), **syncpack** (always reject), **packages the user flagged as pinned-by-intent** (skip per the user). The absence of `^`/`~` is not, on its own, a signal to skip (see 1.6 Pin handling).

Provide non-interactive commands in your response; never rely on interactive selection.

```bash
# Simple case
pnpm exec npm-check-updates --workspaces -u --reject syncpack

# When some packages must be skipped (pinned versions or majors)
pnpm exec npm-check-updates --workspaces -u --reject syncpack,<pkg1>,<pkg2>
pnpm --filter <workspace-name> add <pkg>@^<version> -D
```

The user runs the commands. After they report back, verify `git diff` on the package.json files: no pinned versions changed, no major bumps introduced, all expected packages updated.

#### 4.3 Post-ncu fixups

After ncu, two things typically break: the **packageManager SHA** (ncu strips the corepack SHA) and the **biome.json schema** (stale if biome was updated).

```bash
~/.claude/skills/maintenance-release-fleet/scripts/post-ncu.sh
```

Or manually: `corepack up`, `pnpm biome migrate`, `pnpm install`.

#### 4.4 Verify

```bash
~/.claude/skills/maintenance-release-fleet/scripts/verify.sh
```

Runs `pnpm build` and `pnpm test`, capturing output. On success it prints a one-line summary per step; on failure it shows the full output. If verification fails, report it in your response and wait for the user.

#### 4.5 Update changes.jsonl

Each published package has a `changes.jsonl` driving CHANGELOG.md generation. Schema: `ecosystem/schema/shellicar-changes.schema.json`. Validator: `pnpm --filter scripts validate`.

**A package earns a `changes.jsonl` entry only if its own `package.json` or source changed.** Verify with the package's diff, excluding the changelog files it carries:

```bash
git diff origin/main...HEAD -- packages/<pkg> ':(exclude)packages/<pkg>/changes.jsonl' ':(exclude)packages/<pkg>/CHANGELOG.md'
```

An empty diff means the package did not change: **no entry, and no release** (Stage 6.2), however the fix reached it.

- **Direct dep bump in the package's own `package.json`**: yes, the package changed.
- **Override in the package's own `pnpm.overrides`** (ships in its `package.json`): yes.
- **Fix via a root `pnpm-workspace.yaml` override, the package's `package.json` unchanged**: no entry. A root override doesn't propagate to consumers (they resolve transitive deps from upstream ranges, not our overrides), so the published artifact is byte-identical and the fix reaches no one installing the package.
- **Change confined to examples, workspace root, or lockfile-only**: no entry.

Exposure to a CVE is not the threshold; a change to the package's own published bytes is. Documenting a fix not in the published artifact — or releasing a package that did not change — is noise at best, a false security signal at worst.

Format:

```jsonl
{"description":"Fixed GHSA-xxxx-xxxx-xxxx in <pkg>","category":"security","metadata":{"ghsa":"GHSA-xxxx-xxxx-xxxx"}}
```

Categories: `added`, `changed`, `deprecated`, `removed`, `fixed`, `security`.

Description rules:

- Plain text, no URLs. The generator appends a markdown link from `metadata.ghsa`.
- Name the affected package and the action. "Fixed GHSA-... in <pkg>" beats "Fix audit".
- For routine multi-dep bumps, match the description to the scope of the run (the scenario from Stage 2): A/E → `"Updated patch dependencies"`; B → `"Updated patch and minor dependencies"`; C → `"Updated all dependencies to latest versions"`; D → name the specific major bump.
- Name specific bumps only when there's a consumer-visible implication (a runtime behaviour change, a deprecation, a peer-range shift). The diff is not the threshold; implication is.

Metadata rules: security → `metadata.ghsa` (`metadata.cve` is silently ignored); issue-tied fix → `metadata.issue` produces `(#NN)`.

Append, never edit. Run `pnpm --filter scripts validate` after appending and confirm clean. Do not add release markers (`{"type":"release",...}`) — those are added at release time.

#### 4.6 Version and changelog (optional)

Version bumping and CHANGELOG.md updates are handled by the `github-version` skill. Two options — same PR (verify passes → invoke `github-version`, second commit for version changes) or separate PR (commit changes now, version management later). Ask the user in your response which they want, and wait for the reply.

### Stage 5: Prepare for commit

#### 5.1 Determine branch name

The PM already set the branch via worktree. Confirm it matches the convention: `security/` (CVE fixes, audit remediations), `feature/` (dependency updates, new tooling), `fix/` (a bug in our code, not an upstream dep). Examples: single CVE `security/<short-name>-CVE-YYYY-NNNNN`; multiple from one audit `security/audit-YYYY-MM-DD`; mixed security+deps `security/audit-YYYY-MM-DD` (security takes precedence); deps only `feature/update-dependencies-YYYY-MM-DD`.

#### 5.2 Generate commit message

If the commit fixes any CVE, lead with it — the security fix is the headline:

```
Fix [CVE-2026-22036](https://github.com/advisories/GHSA-xxxx-xxxx-xxxx) in undici
```

Dependencies only: `Update minor and patch dependencies`. Mixed: lead with the CVE.

#### 5.3 Ensure labels exist

```bash
~/.claude/skills/maintenance-release-fleet/scripts/ensure-labels.sh --repo <repo-name>
```

(If the script isn't present, skip this — the `github-pr` skill handles labels at PR creation time.)

#### 5.4 Create PR

Load and follow the `github-pr` skill to create the PR; load `github-milestone` to find or create the milestone first. Include the PR URL in your response.

### Stage 6: Post-merge

#### 6.1 Wait for merge

```bash
gh pr view <number> --json state,mergedAt
```

If auto-merge is enabled, the PR merges once checks pass. Do not proceed until `state` is `MERGED`.

#### 6.2 Create releases

For each affected package (every package whose own published content changed — verified with the 4.5 diff test; a changelog-only diff does not count), invoke `github-release` in tier order (Tier 0 → Tier 1 → Tier 2 per 1.2). Wait for each release's npm-publish workflow to complete before the next. If any fails, stop and report. Within a tier, order does not matter.

#### 6.3 Milestone

Do not close the milestone after a patch release. See the `github-milestone` skill.

#### 6.4 Clean up branches

Worktree cleanup is the PM's, after the mission completes. Confirm in your response that the PR is merged and the release is published; the worktree cleanup happens outside this skill.

### Notes

- The cast gathers and recommends; the user decides.
- Major updates are always presented individually for a conscious decision.
- The plan shows everything, even items recommended to skip.
- User context (deadlines, priorities) may override recommendations.
- When manual intervention is needed, report it and wait.

## Why

The user owns the call. The cast gathers and recommends so the decision happens in one place (Stage 2), with everything visible — including what's recommended to skip. Majors are always surfaced individually, never folded in silently.

The fixes are surgical. `--fix=update` patches only the vulnerable lockfile entries, so unrelated packages don't drift and a security fix stays a security fix. The majors that would drift or break are caught from the audit *before* anything is applied, set aside as the user's decision, and never reverted. The committed audit JSON is the spine: the snapshot the major analysis reads, and the before/after evidence of what changed.

# Philosophy

This skill is written **for pnpm 11**, deliberately — the version is the whole point. On pnpm 10, `audit --fix` cannot reach transitive dependencies, where most CVEs live; the old workaround was to delete the lockfile and `node_modules` and reinstall, which re-resolves everything in range and silently drifts unrelated packages forward. pnpm 11's `pnpm audit --fix=update` patches the vulnerable lockfile entries directly — no overrides, so no override-chaining (pnpm#6774), no nuke, no drift. That is why the fix mechanism is `--fix=update` and the nuke is gone.

Majors are the one thing `--fix=update` would apply that you don't want — a fix that crosses a major is a breaking change. The audit already carries the answer: per advisory it gives the installed version and the patched range, so you know a major is coming *before* you touch anything. You set those aside up front via `ignoreGhsas` (which the fix honours) and bring them to the user. That is why detection is from the audit, up front — and why there is no revert anywhere: nothing wrong is ever applied. Reverting a finished `--fix=update` would be all-or-nothing, throwing away every good fix to undo a few majors; up-front detection replaces it.

The committed `pnpm audit --json` is the spine the whole flow turns on — generated and committed, read for the major analysis, re-committed after, the diff being the change. The supply-chain config (`ignoreScripts`, `minimumReleaseAge`, `blockExoticSubdeps`, `trustPolicy`) hardens the install, and on pnpm 11 lives in `pnpm-workspace.yaml`, the only place pnpm reads it.

The deeper editorial context — the paths rejected on the way to this shape — is in `PHILOSOPHY.md`, which is not loaded at runtime.
