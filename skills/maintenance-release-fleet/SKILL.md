---
name: maintenance-release-fleet
description: |
  Fleet counterpart to maintenance-release. The workflow is identical to maintenance-release: same phases, same actors, same decisions. The only differences are mechanisms: the branch is set up by the PM via worktree rather than by preflight.sh; helper scripts live in this skill's own directory; audit identifiers are persisted to disk so they survive across phases or session boundaries. Without it, fleet maintenance prompts duplicate workflow logic, scripts get cross-referenced from the wrong skill, and audit identifiers are lost when the session ends.
  TRIGGER when running a fleet maintenance mission for an @shellicar npm package.
  DO NOT TRIGGER for coworking sessions (load maintenance-release instead), single targeted dependency changes, or non-npm projects.
metadata:
  category: workflow
---

# Maintenance Release Fleet

This skill is the fleet counterpart to `maintenance-release`. The workflow is the same. The agent does the same things in the same order. The user makes the same decisions. The only differences are mechanisms.

## This is an attended cast

Most fleet casts run unattended — the operator executes the mission end to end and the supervisor reviews the result. This one does not. This skill has a human-in-the-loop gate at Phase 2 that the cast cannot complete without.

The required output of Phase 2 is the recommended plan presented to the user, closing with "what would you like to adjust?", followed by a full stop. That presentation is the deliverable of the phase — not a courtesy, not an internal checkpoint. An execution that reaches Phase 4 without the user's reply in hand has skipped the deliverable, however complete the resulting work looks.

The user decides scope. The operator gathers and recommends; it does not choose. Which scenario applies, which updates to include or skip, which packages ship — every one is the user's call, surfaced in the Phase 2 output and settled by the user's reply. "The mission named this skill" is not authority to skip the gate: the mission invokes the workflow, and the Phase 2 gate is part of the workflow it invoked.

## Mechanism differences from maintenance-release

| Step | maintenance-release | maintenance-release-fleet |
|------|---------------------|---------------------------|
| Branch is created | `preflight.sh --branch <name>` runs `git switch -c` | PM creates the worktree (with branch) before the session starts; agent verifies it is on the right branch |
| Helper scripts location | `~/.claude/skills/maintenance-release/scripts/` | `~/.claude/skills/maintenance-release-fleet/scripts/` |
| Audit identifiers (GHSAs, CVE IDs) | Held in agent's session context | Captured to `.claude/audit/YYYY-MM-DD.json` so they survive if the session ends |
| Progress tracking | TODO list in working memory | Phase status fields |

Everything else is identical. The agent detects the scenario. The agent builds the plan. The agent asks the user "what would you like to adjust?" (in the response, not via tool). The user refines. The agent executes per the refined plan. The agent provides ncu commands for the user to run. The user runs them. The agent verifies, builds, tests, prepares the PR.

## Helper Scripts

Self-contained: scripts live in `~/.claude/skills/maintenance-release-fleet/scripts/`. Not shared from any other skill.

| Script | Purpose |
|--------|---------|
| `fix-audit.sh` | Fix audit vulnerabilities with clean override resolution (handles pnpm#6774) |
| `fix-ghsa.mjs` | Apply targeted pnpm overrides from GHSA vulnerability data |
| `post-ncu.sh` | Restore corepack SHA + run biome migrate after ncu |
| `verify.sh` | Run build + test, only show output on failure (context-efficient) |

## Scope

- Single repository at a time
- Security fixes (CVEs)
- Dependency updates (major/minor/patch)

## Phase 0: Pre-flight Checks

Verify the git environment. The PM created the worktree, so the branch already exists; you do not run `git switch -c`.

```bash
git status
git branch --show-current
```

Then capture audit and update status:

```bash
mkdir -p .claude/audit
pnpm audit --json > .claude/audit/$(date +%Y-%m-%d).json
pnpm audit
pnpm exec npm-check-updates --workspaces
```

The audit JSON file is captured to disk because `pnpm audit fix` later in the workflow removes vulnerabilities from subsequent audit output. Reconstructing GHSA IDs retroactively (via search and version-range matching) is significantly more expensive than capturing at first sight. Reference the file from your testament.

### Preconditions

1. **On the mission branch** (PM has created it via worktree)
2. **Clean working tree** (no uncommitted changes)
3. **Synced with remote**

If preconditions are not met, report in the response and stop. The user replies with how to proceed.

### Ecosystem Dirty Tree

After `pnpm install`, lefthook may create or move files (e.g. `scripts/verify-version.sh` becomes `.lefthook/pre-push/verify-version.sh`). Same change appears in every repo.

These changes are expected and should be included in the maintenance commit. They are not real uncommitted work.

If `git status` after `pnpm install` shows changes limited to lefthook/ecosystem files, include them. If it shows real work-in-progress, report in the response and stop.

## Phase 1: Information Gathering

The audit and ncu output you captured in Phase 0 is the source for this phase.

### 1.1 Check for CVEs

From the audit output, identify:

- Severity (critical, high, moderate, low)
- Affected packages
- Vulnerable versions
- Patched versions
- Dependency paths

### 1.2 Check @shellicar Package Dependencies

If a CVE is found, check whether it affects other @shellicar packages. Most packages share dev/build dependencies, so a CVE in one likely affects all.

Update packages in dependency order (Tier 0 → Tier 1 → Tier 2). For example, if `build-clean` has a CVE fix, release it first before updating packages that depend on it.

If an @shellicar dependency has a newer version with the fix, include it in the plan and note: "Includes CVE fix from @shellicar/build-clean 1.2.1".

### 1.3 Trace Dependency Origins

For each CVE or notable update:

```bash
pnpm why <package-name>
```

This reveals direct vs transitive, which packages pull it in, and whether the root is in `dependencies`, `devDependencies`, or an internal tool.

### 1.5 Check for Available Updates

`pnpm outdated` respects semver ranges in package.json. Use `npm-check-updates` for a complete picture. The Phase 0 capture already has this.

Always exclude syncpack from auto-updates. Major bumps cause breaking changes.

Categorise:

- **Major** (X.0.0): breaking, skip by default in maintenance releases
- **Minor** (x.Y.0): new features, backwards compatible
- **Patch** (x.y.Z): bug fixes only

### 1.6 Identify Package Context

For each update:

#### Dependency Type and Location

- **Production dependency** (`dependencies`): Ships to users, highest risk
- **Dev dependency** (`devDependencies`): Build/test only, medium risk
- **Internal tools** (`tools/`, `scripts/`): Internal use only, lowest risk
- **Peer dependency** (`peerDependencies`): Compatibility constraint

#### Risk Assessment Matrix

| Situation | Internal Tools | Dev Dependency | Prod Dependency |
|-----------|----------------|----------------|-----------------|
| CVE present | Lowest risk | Lower risk | Highest risk |
| Major update breaks | Easily caught | Caught in dev | Could break prod |
| Update liberally? | Yes | Yes | More caution |

A CVE in an internal tool is still worth fixing but has minimal real-world impact if something breaks.

#### Special Package Rules

- `syncpack` - never auto-update (major bumps break; always `--reject syncpack`)
- `@types/*` - should align with main package version

#### Pin handling

This guidance applies only to versions in the `dependencies` and `devDependencies` fields of `package.json`. The `packageManager` field is not covered. It has its own SHA-pinned format and is restored by `corepack up` after ncu runs.

Within `dependencies` and `devDependencies`, the absence of `^`/`~` (a pinned version like `4.5.1`) is not a signal to skip. Pin syntax tells you nothing about intent: some pins are intentional compatibility constraints, others are just how the version was recorded. If a pin matters, the user will say so when reviewing the analysis.

`peerDependencies` need careful handling. Their ranges often span multiple majors (`^11`, `^11 | ^12`) to express compatibility with consumers. Only widen a peer range when the corresponding dependency or devDependency version has also moved.

## Phase 2: Present Recommended Plan

Present all information gathered, organised into recommended actions.

### Recommendation Scenarios

#### Scenario A: Critical/High CVE Present

- Goal: Fix security vulnerability with minimal risk
- Recommend: Security fixes + patch updates only
- Skip: Minor and major updates
- Reasoning: Don't risk breaking changes when shipping a security fix

#### Scenario B: Moderate/Low CVE Present

- Goal: Fix security, can be slightly more liberal
- Recommend: Security fixes + patch + minor updates
- Skip: Major updates
- Reasoning: Lower urgency allows safe feature updates

#### Scenario C: No CVEs, Routine Maintenance

- Goal: Stay current
- Recommend: All patch + minor updates
- Major: Present individually for user decision
- Reasoning: No security pressure, good time for broader updates

#### Scenario D: Major Update Focus

- Goal: Tackle a specific major version bump
- Recommend: Only the targeted major update
- Skip: Everything else
- Reasoning: Major updates should be tested in isolation

#### Scenario E: Quick Patch Run

- Goal: Minimal maintenance, minimal risk
- Recommend: Patch updates only
- Skip: Minor and major
- Reasoning: Bug fixes only, no new features

#### Scenario F: Nothing To Do

If no CVEs and no updates available, report "No security vulnerabilities found. All dependencies are up to date." and exit gracefully.

### Applying Scenarios

1. Detect which scenario applies based on the gathered information
2. State which scenario you are applying and why
3. The user can override (e.g., "I want scenario C even though there's a CVE")

### Format

```markdown
## Security Vulnerabilities

| Severity | Package | Type | Current | Fixed | Path |
|----------|---------|------|---------|-------|------|
| critical | @isaacs/brace-expansion | dev | 5.0.0 | 5.0.1 | tsup>sucrase>glob>... |

Note: This CVE is in a dev dependency (lower risk - doesn't ship to users).

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

**INCLUDE:**
- Security fix: @isaacs/brace-expansion (critical CVE)
- All minor updates (backwards compatible)
- All patch updates (bug fixes)

**SKIP:**
- zod 3 → 4 (major - significant migration work)
- @types/express 4 → 5 (main package still on v4)

**Reasoning:** Prioritising security and safe updates. Major updates flagged for separate consideration.

---

What would you like to adjust?
```

The closing question goes in the response. **This presentation is the required output of Phase 2.** The phase is not complete until you have produced it and the user has replied. Do not proceed to Phase 4 on your own reading of the plan — there is no reading of the mission under which the gate is skippable. Stop here and wait for the user's reply.

## Phase 3: User Refinement

The user replies in their next message. Possible replies:

- "Just security for now"
- "Include minor updates too"
- "Let's also do the zod update"
- "Skip minor, only patch and security"
- "Looks good, proceed"

Adjust the plan accordingly and confirm in your next response before proceeding.

## Phase 4: Execute Plan

### 4.1 Apply Security Fixes

```bash
~/.claude/skills/maintenance-release-fleet/scripts/fix-audit.sh
```

This runs `pnpm audit --fix`, then nukes lockfile + node_modules and reinstalls to work around the pnpm override chaining bug ([pnpm#6774](https://github.com/pnpm/pnpm/issues/6774)), then verifies the audit is clean.

If `fix-audit.sh` reports vulnerabilities still present:

1. Apply targeted overrides via `fix-ghsa.mjs`
2. Re-run `fix-audit.sh`

```bash
echo '[{"pkg":"<pkg>","vulnerable":"<range>","patched":"<version>"}]' \
  | node ~/.claude/skills/maintenance-release-fleet/scripts/fix-ghsa.mjs pnpm-workspace.yaml
```

If neither approach resolves the CVE, report in the response and wait for user direction. Do not invent a third path.

#### Known Issue: pnpm Override Chaining Bug

pnpm overrides do not re-evaluate after a first override changes the resolved version. The only reliable workaround is deleting both `pnpm-lock.yaml` AND `node_modules` then reinstalling. The `fix-audit.sh` script handles this automatically.

See: https://github.com/pnpm/pnpm/issues/6774

### 4.2 Apply Selected Updates

Do NOT run ncu with `-u` directly. The Phase 0 capture already shows all available updates.

#### Analyse the ncu output

Look for packages that need special handling:

- **Major bumps** - skip by default in maintenance releases
- **syncpack** - always reject
- **Packages the user has flagged as pinned-by-intent** - skip per the user's instruction

The absence of `^`/`~` is not, on its own, a signal to skip. See Phase 1.6 Pin handling.

#### Provide exact commands

Provide non-interactive commands in your response. Never rely on interactive selection.

**Simple case** (no pinned versions to worry about):

```bash
pnpm exec npm-check-updates --workspaces -u --reject syncpack
```

**When some packages must be skipped** (pinned versions or majors):

```bash
pnpm exec npm-check-updates --workspaces -u --reject syncpack,<pkg1>,<pkg2>
pnpm --filter <workspace-name> add <pkg>@^<version> -D
```

Example: if `@azure/cosmos` is pinned at `4.5.1` in an example workspace but uses `^4.9.0` elsewhere:

```bash
pnpm exec npm-check-updates --workspaces -u --reject syncpack,@azure/cosmos
pnpm --filter @shellicar/cosmos-query-builder add @azure/cosmos@^4.9.1 -D
pnpm --filter @shellicar/cosmos-query-builder-examples-cjs add @azure/cosmos@^4.9.1 -D
```

The user runs the commands. After the user reports back, verify `git diff` on package.json files:

- No pinned versions were changed
- No major bumps were introduced
- All expected packages were updated

### 4.3 Post-ncu Fixups

After ncu, two things typically break:

1. **packageManager SHA hash** - ncu strips the corepack SHA
2. **biome.json schema** - if biome was updated, the schema URL is stale

```bash
~/.claude/skills/maintenance-release-fleet/scripts/post-ncu.sh
```

Or manually:

```bash
corepack up
pnpm biome migrate
pnpm install
```

### 4.4 Verify

```bash
~/.claude/skills/maintenance-release-fleet/scripts/verify.sh
```

Runs `pnpm build` and `pnpm test`, capturing output. On success it prints a one-line summary per step. On failure it shows the full output for diagnosis.

If verification fails, report the failure in your response and wait for user direction.

### 4.5 Update changes.jsonl

Each published package has a `changes.jsonl` driving CHANGELOG.md generation.

- Schema: `ecosystem/schema/shellicar-changes.schema.json`
- Validator: `pnpm --filter scripts validate`
- Generator: `pnpm --filter scripts changelog packages/<pkg>` (release time, not now)

When an entry is needed — the governing test is whether the package's own published content changed:

**A package earns a `changes.jsonl` entry only if its own `package.json` or source changed.** Verify with the package's diff, excluding the changelog files it carries:

```bash
git diff origin/main...HEAD -- packages/<pkg> ':(exclude)packages/<pkg>/changes.jsonl' ':(exclude)packages/<pkg>/CHANGELOG.md'
```

An empty diff means the package did not change: **no entry, and no release** (Phase 6.2), however the fix reached it.

- **Direct dep bump in the package's own `package.json`**: yes, the package changed.
- **Override in the package's own `pnpm.overrides`** (it ships in the package's `package.json`): yes.
- **Fix via a root `pnpm-workspace.yaml` override, the package's `package.json` unchanged**: no entry, even if the package is transitively exposed to the CVE. A root override does not propagate to consumers (they resolve transitive deps from the upstream ranges, not our overrides), so the published artifact is byte-identical and the fix reaches no one installing the package.
- **Change confined to examples, workspace root, or lockfile-only**: no entry.

Exposure to a CVE is not the threshold; a change to the package's own published bytes is. Documenting a fix that is not in the published artifact, or releasing a package that did not change (worse, signalling that it did), is noise at best and a false security signal at worst.

Format:

```jsonl
{"description":"Fixed GHSA-xxxx-xxxx-xxxx in <pkg>","category":"security","metadata":{"ghsa":"GHSA-xxxx-xxxx-xxxx"}}
```

Categories: `added`, `changed`, `deprecated`, `removed`, `fixed`, `security`.

Description rules:

- Plain text. No URLs. The generator appends a markdown link from `metadata.ghsa`.
- Name the affected package and the action. "Fixed GHSA-... in <pkg>" beats "Fix audit".
- For routine multi-dep bumps, match the description to the actual scope of the run (the scenario from Phase 2):
  - **Scenario A (patch only)**: `"Updated patch dependencies"`.
  - **Scenario B (security + patch + minor)**: `"Updated patch and minor dependencies"`.
  - **Scenario C (full update across all deps)**: `"Updated all dependencies to latest versions"`.
  - **Scenario D (targeted major)**: name the specific major bump.
  - **Scenario E (patch only, no security)**: `"Updated patch dependencies"`.
- Name specific bumps only when there is a consumer-visible implication readers of the changelog should know about: a behaviour change in a runtime dep, a deprecation, a peer-range shift, or anything else that affects how consumers use the package. The diff is not the threshold; implication is. Listing every patch bump from `git diff` is noise.

Metadata rules:

- Security: use `metadata.ghsa`. `metadata.cve` is silently ignored by the generator.
- Issue-tied fix: `metadata.issue` produces `(#NN)`.

Append, never edit. Run `pnpm --filter scripts validate` after appending and confirm clean.

Do not add release markers. `{"type":"release",...}` lines are added at release time, not during maintenance fixes.

### 4.6 Version and Changelog (optional)

Version bumping and CHANGELOG.md updates are handled by the `github-version` skill.

Two workflow options:

1. **Same PR**: After verification passes, invoke `github-version` skill, then a second commit for version changes
2. **Separate PR**: Commit changes now, merge, then version management in a separate PR

Ask the user in your response:

```
Verification passed. Changes are ready.

Would you like to:
1. Include version bump in this PR (invoke github-version)
2. Commit changes only (version management later, separate PR)
```

Wait for the user's reply before proceeding.

## Phase 5: Prepare for Commit

### 5.1 Determine Branch Name

The PM has already set the branch via worktree. Confirm it matches the convention:

- `security/` - CVE fixes, `pnpm audit` remediations
- `feature/` - dependency updates, new tooling
- `fix/` - fixing a bug in our code (not upstream dependencies)

Examples:

- Single CVE: `security/<short-name>-CVE-YYYY-NNNNN`
- Multiple CVEs from one audit run: `security/audit-YYYY-MM-DD`
- Mixed security plus deps: `security/audit-YYYY-MM-DD` (security takes precedence)
- Dependency updates only: `feature/update-dependencies-YYYY-MM-DD`

### 5.2 Generate Commit Message

If the commit fixes any CVE, lead with the CVE. The security fix is the headline.

```
Fix [CVE-2026-22036](https://github.com/advisories/GHSA-xxxx-xxxx-xxxx) in undici
```

For dependencies only:

```
Update minor and patch dependencies
```

For mixed security + deps, lead with the CVE.

### 5.3 Ensure Labels Exist

```bash
~/.claude/skills/maintenance-release-fleet/scripts/ensure-labels.sh --repo <repo-name>
```

(If this script is not present in the fleet skill's scripts directory, skip this step. The github-pr skill handles labels at PR creation time.)

### 5.4 Create PR

Load and follow the `github-pr` skill to create the PR. Load the `github-milestone` skill to find or create the milestone before creating the PR.

After PR creation, include the PR URL in your response.

## Phase 6: Post-Merge

After the PR is merged:

### 6.1 Wait for Merge

```bash
gh pr view <number> --json state,mergedAt
```

If auto-merge is enabled, the PR will merge once checks pass. Do not proceed until `state` is `MERGED`.

### 6.2 Create Releases

For each affected package (every package whose own published content changed — its `package.json` or source, verified with the Phase 4.5 diff test; a changelog-only diff does not count), invoke the `github-release` skill in tier order (Tier 0 → Tier 1 → Tier 2 per Phase 1.2). Wait for each release's npm-publish workflow to complete before creating the next. If any workflow fails, stop and report. Within a tier, order does not matter.

### 6.3 Milestone

Do not close the milestone after a patch release. See the `github-milestone` skill.

### 6.4 Clean Up Branches

The fleet equivalent of `post-merge.sh` is the worktree cleanup, which the PM handles after the mission is complete. Confirm in your response that the PR is merged and the release is published; the worktree cleanup happens outside this skill.

## Notes

- The agent gathers information and recommends; the user decides.
- Major updates are always presented individually for conscious decision.
- The plan shows everything, even items recommended to skip.
- User context (deadlines, priorities) may override recommendations.
- When manual intervention is needed, report it in the response and wait for the user.
- Version bumping is out of scope for the workflow itself (handled by GitVersion / release process).
