---
name: github-version
description: |
 Determines the next semver version, updates CHANGELOG.md, and bumps package.json for @shellicar packages. Without it, version numbers drift between package.json, CHANGELOG, and tags, and security fixes get wrong semver bump types.
 TRIGGER when bumping versions, preparing a release, or updating the changelog.
 DO NOT TRIGGER for non-release tasks.
metadata:
  category: workflow
---

# GitHub Version Management

**Scope:** How to determine the next semantic version and update CHANGELOG.md. Release execution lives in github-release.

Determine the next version number and update CHANGELOG.md for a release.

## Quick Start

```
1. Get current version from package.json or git tags
2. Determine bump type: patch (fixes/deps), minor (features), major (breaking)
3. Confirm version with the user
4. Update CHANGELOG.md with new version section
5. Bump version in package.json
6. Stage changes (don't commit - let caller handle)
```

## Scope

- Determine next semantic version
- Update CHANGELOG.md
- Bump package.json version

## Release Philosophy

For npm packages:

- Releases are cheap - release often, especially for security fixes
- Keep releases small and focused
- Multiple PRs can go into one version, but prefer frequent small releases
- Pre-releases available for uncertain features

## Detect changelog flow

@shellicar repos use one of two CHANGELOG patterns:

1. **Direct edit**: `CHANGELOG.md` is hand-maintained. Phase 3a applies.
2. **`changes.jsonl` + generator**: per-package `changes.jsonl` files drive `CHANGELOG.md` generation. `CHANGELOG.md` is regenerated, not edited directly. Phase 3b applies.

Detect at the start:

```bash
find . -name 'changes.jsonl' -not -path './node_modules/*' | head -1
```

If any `changes.jsonl` is present in the repo (typically per-package under `packages/` or `apps/`), use the generator flow (Phase 3b). Otherwise, use the direct-edit flow (Phase 3a).

## Versioning mode: lockstep vs independent

A repo releases in one of two modes. Determine which before bumping versions.

### Which packages release is a judgment, not a formula

In either mode, the signals below — source changes since the last release, new `changes.jsonl` entries, a dependency that is bumping — produce a **candidate list, not a verdict**. They tell you which packages to consider; someone still decides each one, because each signal can mislead on its own:

- **A `changes.jsonl` entry is evidence, not a trigger.** An entry records that a change reached the package, but not every entry is a reason to release: an internal note ("updated build pipeline") delivers nothing to a consumer; a user-facing fix does. Telling them apart is the judgment.
- **A source diff can be trivial.** A comment or formatting change shows up in `git diff` but ships nothing worth a version.

The line to hold: **don't publish a package that is no different from what is already on the registry.** That is the only hard floor — this is not "release the bare minimum." Over-releasing is noise, not wrong; when a real fix is in the balance, err toward shipping it.

**Independent** — each package is versioned on its own. The candidates are the packages with source changes since their last release; leave the rest untouched. A single-package repo is always independent, and it is the default for a multi-package repo unless the repo's conventions say otherwise.

**Lockstep** — every released package shares one version number. When a release goes out, all participating packages move to the same next version. Two kinds of package are candidates:

- Every package with source changes since the last release.
- Every package whose released workspace dependency is bumping, even with no source change of its own. This is the *transitive bump*, and it exists because of how consumers' lockfiles work: a lockfile pins the whole resolved tree, `pnpm i` will not move an already-resolved transitive dependency, and `pnpm update -iL` shows a consumer only their *direct* dependencies. So a fix in a transitive package never reaches an existing consumer unless a package they directly depend on republishes — the republish re-pins the dependency, and the consumer's next update carries the fix through. A security fix in the transitive package is the sharp case: skip the transitive bump and locked-in consumers stay on the vulnerable version with no visible way to move off it. An otherwise-unchanged dependent republished for this reason is a real delivery, not noise.

The result is that all released packages carry the same version, and no published package references an unpublished dependency. When publishing a lockstep release, publish dependencies before dependents (leaves first) so that ordering also holds on the registry.

A repo's mode is set by its conventions and release history, not chosen per release. If unsure, check whether the packages currently share a version (lockstep) or diverge (independent).

## Phase 1: Determine Current Version

### From Package.json

```bash
grep '"version"' packages/*/package.json | head -1
# or for root package
grep '"version"' package.json
```

### From Git Tags

```bash
git describe --tags --abbrev=0
```

### From CHANGELOG.md

```bash
grep -E '## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | head -1
```

## Phase 2: Determine Next Version

Based on semver and the type of changes:

| Change Type | Version Bump | Example |
| ----------- | ------------ | ------- |
| Security fix | Patch | 1.2.0 → 1.2.1 |
| Bug fix | Patch | 1.2.0 → 1.2.1 |
| Dependency updates (patch/minor) | Patch | 1.2.0 → 1.2.1 |
| New feature (backwards compatible) | Minor | 1.2.0 → 1.3.0 |
| Breaking change | Major | 1.2.0 → 2.0.0 |

### Pre-releases

A pre-release carries a hyphenated suffix: a channel identifier and a counter, e.g. `1.2.1-preview.1`, `1.0.0-beta.3`, `2.0.0-rc.1`. Two cases arise:

- **Pre-1.0 package.** Every release is a pre-release on the road to `1.0.0`, conventionally `1.0.0-<channel>.N` (e.g. `1.0.0-beta.9`). The next release increments the counter: `1.0.0-beta.8 → 1.0.0-beta.9`. The base `1.0.0` does not change until the package goes stable.
- **Pre-release of a future stable version.** For a feature you're not fully confident in, ship `1.2.1-preview.N` ahead of `1.2.1`. Increment the counter each iteration; the base is the eventual stable target.

Either way, determine the next pre-release by incrementing the counter on the current pre-release version — not by applying the stable patch/minor/major table above.

Changelog handling for a pre-release depends on the flow:

- **Generator flow (`changes.jsonl`)** — a pre-release does **not** write a release marker; every entry stays under `[Unreleased]` until the stable release. See Phase 3b.
- **Direct-edit flow** — write the entry under the eventual stable version heading; the pre-release suffix lives only in `package.json`.

### Confirm with User

**REQUIRED**: Ask the user to confirm the version before proceeding.

Example options:
- "1.2.1 (patch)" - Recommended version based on change type
- "1.3.0 (minor)" - Alternative if changes warrant it
- "Other" - User provides custom version

The question should include:
- Current version
- Recommended next version
- Reason for recommendation (security fix, bug fix, new feature, etc.)

## Phase 3a: Update CHANGELOG.md (direct edit flow)

Use this phase when no `changes.jsonl` files are present in the repo. For the generator flow, see Phase 3b.

### Check if CHANGELOG.md Exists

```bash
ls CHANGELOG.md
```

If not present, skip this phase.

### @shellicar CHANGELOG Format

All @shellicar repos use Keep a Changelog format:

```markdown
# Changelog

## [x.y.z] - YYYY-MM-DD

### Section

- Change description
```

**Note on dates:** The date is the planned/expected release date. It doesn't need to match the actual release date exactly - it's more about when the changelog entry was written.

#### Standard Sections

| Section | Use For |
| ------- | ------- |
| `### Added` | New features |
| `### Changed` | Changes to existing features, dependency updates |
| `### Fixed` | Bug fixes |
| `### Security` | Security fixes (include CVE reference) |
| `### Breaking Changes` | Breaking changes (major versions) |
| `### Structure` | Monorepo/project structure changes |

#### Security Fix Entry

```markdown
### Security

- Fixed CVE-2026-25547 in @isaacs/brace-expansion
```

#### Dependency Update Entry

For dependency updates, mention **notable** packages specifically rather than just "all dependencies". Notable means:

- Major version bumps (even in devDependencies)
- Packages users might recognize or care about
- Packages that could affect behavior (runtime deps especially)

**Good examples:**

```markdown
### Changed

- Updated typescript to 5.8, vitest to 3.0
- Updated all dependencies to latest versions
```

```markdown
### Changed

- Updated esbuild to 0.25, tsup to 8.5
```

**Avoid** listing every single package - no one cares about 10+ entries of patch updates. Group trivial updates under "Updated all dependencies" or omit if nothing notable.

**Rule of thumb:** If you wouldn't mention it in a conversation, don't list it separately.

#### Combined Entry (Security + Deps)

```markdown
### Security

- Fixed CVE-2026-25547 in @isaacs/brace-expansion

### Changed

- Updated typescript to 5.8
- Updated all dependencies to latest versions
```

### Update Version Links

Add link at bottom of CHANGELOG (maintain alphabetical/version order):

```markdown
[1.2.1]: https://github.com/shellicar/<repo>/releases/tag/1.2.1
```

Insert after the most recent version link.

## Phase 3b: Append release markers and regenerate CHANGELOG.md (generator flow)

Use this phase when `changes.jsonl` files are present in the repo. For the direct-edit flow, see Phase 3a.

Do not edit `CHANGELOG.md` directly. The generator owns it.

For each affected published package (every package whose `package.json` will be bumped):

### 3b.1 Append the release marker to changes.jsonl

**Pre-releases skip this step.** A pre-release (the version contains a hyphen, e.g. `1.0.0-beta.9`) does not get a release marker — its entries stay under `[Unreleased]`. For a pre-1.0 package, every release is a pre-release, so no markers are written until `1.0.0` ships. The marker is what moves `[Unreleased]` entries into a dated version section, so it belongs only to a stable release.

For a stable release, append the marker. Format (per the schema):

```jsonl
{"type":"release","version":"<x.y.z>","date":"<YYYY-MM-DD>","tag":"<pkg-shortname>@<x.y.z>"}
```

Where:

- `pkg-shortname` is the package's `name` field with the `@shellicar/` prefix stripped (e.g., `claude-sdk`, `core-di`, `winston-azure-application-insights`). The directory name should equal this; if they do not match, stop and report.
- `date` is today's date.

Append, never edit existing entries.

### 3b.2 Bump package.json (Phase 4 below)

Run the standard package.json bump for the package.

### 3b.3 Regenerate CHANGELOG.md

```bash
pnpm --filter scripts changelog packages/<pkg>
```

(Or whatever path the repo uses for the changelog generator.)

### 3b.4 Validate

```bash
pnpm --filter scripts validate
```

Must be clean. If validation fails, stop and report.

### 3b.5 Stage all three files

For each affected package, stage `package.json`, `changes.jsonl`, and `CHANGELOG.md` together (Phase 5 below covers this).

## Phase 4: Bump Package.json Version

Use `pnpm version` to bump the version (avoids needing direct edit access to package.json):

```bash
# From the package directory
cd packages/<package-name>
pnpm version patch --no-git-tag-version   # 1.2.1 → 1.2.2
pnpm version minor --no-git-tag-version   # 1.2.1 → 1.3.0
pnpm version major --no-git-tag-version   # 1.2.1 → 2.0.0

# For pre-releases, use explicit version
pnpm version 1.2.1-preview.1 --no-git-tag-version
```

Use `--no-git-tag-version` to prevent pnpm from creating a git tag and commit automatically.

## Phase 5: Stage Changes

```bash
git add CHANGELOG.md
git add packages/*/package.json  # or just package.json
```

Do NOT commit - let the calling workflow handle commits.

## Integration with Other Skills

This skill is **independent and composable**. It can be called:

- **Same PR as changes**: `maintenance-release` → `github-version` → `git-workflow` → `github-pr`
- **Separate PR**: Changes merged first, then `github-version` → `git-workflow` → `github-pr` when ready to release

### Why Separate PRs?

- Work can be done without committing to a release
- Multiple changes can be batched before releasing
- Functionality and version management are orthogonal concerns
- Useful when "not sure if we plan to release yet"

### Typical Callers

- `maintenance-release` - optionally, after verification passes
- Standalone - when ready to release accumulated changes
- `github-pr` - may check if version is known for milestone

## Notes

- Always confirm version with user before proceeding
- Match existing CHANGELOG format
- Security fixes and dependency updates are patch releases (no functionality change)
- Pre-releases increment a counter on the current pre-release version; pre-1.0 packages stay `1.0.0-<channel>.N` until they go stable, and keep changelog entries under `[Unreleased]` (no release marker)
- CHANGELOG date is planned date, not necessarily actual release date
- For npm packages: release early, release often
