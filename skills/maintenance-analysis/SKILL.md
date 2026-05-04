---
name: maintenance-analysis
description: |
  Analyse npm dependency state and update package.json accordingly: read pnpm audit and ncu output, categorise updates by major/minor/patch, apply risk and special-package rules, recommend a posture by scenario, then run ncu with the correct filters to update package.json. Without it, audit fixes get applied blindly, syncpack auto-bumps break builds, ncu runs with -u directly overwriting intentional pinned versions, and @types/* drifts ahead of its main package's major.
  TRIGGER when reviewing pnpm audit, npm-check-updates, or pnpm why output and deciding what to bump, or when applying agreed updates to package.json.
  DO NOT TRIGGER for executing the full maintenance-release workflow (use maintenance-release for that), for single targeted dependency changes, or for non-npm projects.
metadata:
  category: workflow
---

# Maintenance Analysis

**Scope:** read dependency state, recommend what to bump and what to skip, then update package.json with the agreed set via ncu. Does not run `pnpm audit fix`, does not run `pnpm install`, does not create branches, does not open PRs. Use `maintenance-release` for the end-to-end flow.

This skill exists for the case where the human is driving the maintenance release themselves (`pnpm audit fix`, branch creation, install, verify) and wants Claude's reasoning plus the package.json updates done correctly.

## Inputs

```bash
pnpm audit                                         # any remaining CVEs after audit fix
pnpm exec npm-check-updates --workspaces           # available updates (no `-u`)
pnpm why <pkg>                                     # dependency origin for each CVE or notable update
```

`pnpm outdated` respects semver ranges in `package.json` and will not show updates outside those ranges. Use `npm-check-updates` for a complete picture.

## Categorise updates

For each available update:

- **Major** (X.0.0 jumps): breaking. Skip by default.
- **Minor** (x.Y.0): new features, backwards compatible.
- **Patch** (x.y.Z): bug fixes only.

## Risk by location

| Where it lives | CVE in it | Major bump | Default posture |
|---|---|---|---|
| Production (`dependencies`) | Highest | Could break prod | Cautious |
| Dev (`devDependencies`) | Lower | Caught in dev | Liberal |
| Internal tools (`tools/`, `scripts/`) | Lowest | Easily caught | Most liberal |

A CVE in an internal tool is still worth fixing but has minimal real-world impact if something breaks.

## Special-package rules

- **syncpack**: never auto-update. Always `--reject syncpack`. Major bumps break.
- **@types/node**: always safe. Types only.
- **@types/<pkg>**: must track the main package's major. Don't bump `@types/express` to v5 if `express` is on v4.
- **Build tools** (esbuild, tsup, vitest, biome, typescript): dev only, can be aggressive.
- **Runtime libraries** (express, hono, the Anthropic/OpenAI SDKs, etc.): more caution.

The absence of `^`/`~` (a pinned version like `4.5.1`) is **not** a signal to skip. Some pins are intentional compatibility constraints (e.g. an example workspace pinned to a specific peer version); others are just how the version is recorded (e.g. `pnpm`). Pinning syntax tells you nothing about intent. If a pin matters, the human will say so when reviewing the analysis.

## Posture by scenario

| Scenario | Recommendation |
|---|---|
| Critical/High CVE present | Security fix + patch only. Skip minor and major. Don't risk breaking changes when shipping a security fix. |
| Moderate/Low CVE present | Security + patch + minor. Skip major. Lower urgency allows safe feature updates. |
| No CVEs, routine maintenance | All patch + minor. Major individually. Good time for broader updates. |
| Targeted major update | Only that major. Skip everything else. Major updates should be tested in isolation. |
| Quick patch run | Patch only. Bug fixes only, no new features. |

The human can override the scenario ("I want routine even though there's a CVE"). State the scenario you applied and why, so the override is informed.

## Present the recommendation

Use this format:

```markdown
## Security vulnerabilities

| Severity | Package | Type | Current | Fixed | Path |
|---|---|---|---|---|---|
| critical | <pkg> | dev | <cur> | <fix> | <chain> |

## Available updates

### Major (individual consideration)

| Package | Type | Current | Latest | Notes |
|---|---|---|---|---|

### Minor

| Package | Type | Current | Latest |
|---|---|---|---|

### Patch

| Package | Type | Current | Latest |
|---|---|---|---|

## Recommended

**INCLUDE:**
- ✅ <reason>

**SKIP:**
- ⏭️ <reason>

**Reasoning:** <one sentence on the scenario applied>
```

The plan shows everything, even items recommended to skip. The skip column carries information the human needs.

## Apply the agreed set

Once the human has confirmed the posture, run ncu yourself with filters that match the analysis. Do not pass `-u` until the analysis has been presented and confirmed; the analysis is what makes the filter list correct.

### Build the reject list

From the analysis, the reject list always includes:

- `syncpack` (always)
- Every package that ncu shows as a major bump (under default posture)
- Every package the human has explicitly excluded

Do not add packages just because they're pinned without `^`/`~`. Pinning syntax is not a skip signal.

### Run ncu

**Simple case** (no workspace-specific divergence):

```bash
pnpm exec npm-check-updates --workspaces -u --reject syncpack,<pkg1>,<pkg2>
```

**When the human has flagged a specific package as pinned-by-intent in some workspace** (e.g. an example workspace held at a peer-compatible version), run ncu with that package rejected globally, then update only the workspaces that should move:

```bash
pnpm exec npm-check-updates --workspaces -u --reject syncpack,<flagged-pkg>
pnpm --filter <workspace-that-should-move> add <flagged-pkg>@^<version> [-D]
```

This is for explicit human-flagged pins, not for every package that happens to lack a caret.

### Restore the corepack SHA

ncu strips the SHA hash from the `packageManager` field in the root `package.json`. Restore it:

```bash
corepack up
```

This is package.json cleanup directly caused by ncu, so the skill owns it.

### Targeted CVE override

If `pnpm audit fix` did not resolve a CVE (e.g. pnpm override chaining bug, [pnpm#6774](https://github.com/pnpm/pnpm/issues/6774)), apply a targeted override and let the human re-run their install + audit cycle:

```bash
echo '[{"pkg":"<pkg>","vulnerable":"<range>","patched":"<version>"}]' \
  | node ~/.claude/skills/maintenance-release/scripts/fix-ghsa.mjs pnpm-workspace.yaml
```

## Verify the diff

After ncu runs, show `git diff` on `package.json` files and confirm:

- The diff matches the agreed set: every package the analysis included is updated, every package it excluded is unchanged.
- No major bumps introduced beyond ones the human accepted.
- Pinning syntax preserved on lines that had it (no `^` or `~` introduced where there was none); the version on those lines may have moved, that is fine.
- The `packageManager` field still has its `#sha256:...` suffix (corepack up restored it).

If the diff does not match the agreed set, report and stop. Do not try to fix mid-flight.

## Suggested commit message

Hand the human a commit message that matches the change set. The skill does not commit; the human does.

**If the commit fixes any CVE, lead with the CVE.** This is true regardless of what else the commit also touches. The security fix is the headline; other dependency updates ride along but do not displace it from the subject line.

```
Fix [CVE-YYYY-NNNNN](https://github.com/advisories/GHSA-xxxx-xxxx-xxxx) in <package>
```

The markdown link renders in GitHub commit views.

**If there is no security fix, describe the scope of what was updated.**

```
Update minor and patch dependencies
```

## What this skill does not do

- Create branches, run preflight, switch checkout state
- Run `pnpm audit fix` (the human runs this themselves)
- Run `pnpm install` (the human runs this after the skill finishes)
- Run build / test / verify
- Run `pnpm biome migrate` (separate concern; touches `biome.json`, not `package.json`)
- Bump version numbers, write changelogs, generate release markers
- Open PRs, create labels, close milestones

For any of those, hand off to the human or load `maintenance-release`.
