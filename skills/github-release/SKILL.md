---
name: github-release
description: |
 Runs the full GitHub release sequence for @shellicar npm packages: precondition checks, release creation, note review, and npm publish monitoring. Without it, releases can run from the wrong commit, miss CHANGELOG entries, or duplicate existing tags.
 TRIGGER when publishing a release or creating a new version.
 DO NOT TRIGGER for querying release status or non-release operations.
user-invocable: true
metadata:
  category: workflow
---

# GitHub Release

**Scope:** Steps and CLI commands for creating a GitHub release to trigger npm publish.

Create a GitHub release for an npm package, triggering the npm-publish workflow.

## Quick Start

```bash
# 1. Verify version exists in package.json and CHANGELOG
# 2. Ensure PR is merged and main is up to date
# 3. Extract the CHANGELOG section for this version
# 4. Create release (no 'v' prefix for @shellicar repos)
gh release create "1.2.1" --title "1.2.1" --notes "$NOTES"
```

## Context Awareness

This skill can be invoked:

1. **From conversation context**: Repo and version already known from prior discussion (most common)
2. **From working directory**: If inside a specific repo directory
3. **Ambiguous**: If in a parent workspace (e.g., `@shellicar/`) with no prior context

### Priority Order

1. **Check conversation context first** - If repo/version discussed earlier, use that
2. **Check working directory** - If in a git repo with package.json, use that
3. **Ask user** - If ambiguous (parent workspace, no context), ask which repo to release

## Progress Tracking

Create TODOs at the start of this workflow. The post-release steps (monitor workflow, verify npm) are easy to lose track of if the conversation goes on a tangent — TODOs persist and serve as reminders.

```
- Gather pre-release state and verify preconditions
- Create release
- Review release notes
- Verify npm publish succeeded
```

## Steps

Releases follow the repo's versioning mode (see `github-version` > *Versioning mode: lockstep vs independent*):

- **Lockstep monorepo** — create one release per bumped package, in dependency order (dependencies before dependents), waiting for each package's publish workflow to finish before creating the next. All released packages share the version.
- **Independent repo or single package** — create a release for each package being released; order doesn't matter.

In a monorepo the steps below apply per package — pass the package directory to the scripts and use the package's `<shortname>@<version>` tag.

### 1. Gather pre-release state

Run the gather script to check all preconditions in one call:

```bash
# Monorepo: pass the package directory (e.g. packages/claude-core); omit for a single-package repo
~/.claude/skills/github-release/scripts/github-release-info.sh [package-dir]
```

The script outputs JSON. Key fields: `convention`, `owner`, `repo`, `branch`, `working_tree`, `version`, `changelog`, `main_sha`, `milestones`, `existing_release`. Must be a GitHub repo (`shellicar` or `shellicar-oss` convention) — stop if convention is missing or does not match.

### 2. Analyse the gathered state

From the script output, check the following — stop and inform the Supreme Commander if any fail:

- **Working tree**: Must be clean
- **Version**: Must be found in package.json
- **CHANGELOG**: Must contain the release notes — a `## [<version>]` section for a stable release, or entries under `## [Unreleased]` for a pre-release
- **main_sha**: Must be non-empty — if empty, `origin/main` could not be resolved (PR may not be merged yet)
- **Milestone**: Should exist for the version (warn if missing, don't block)
- **Existing release**: If a release already exists, STOP — inform the Supreme Commander

### 3. Confirm with user

**Attended sessions** (interactive Claude Code etc.): ask the user to confirm release creation:

- "Create release" - Proceed with release
- "Cancel" - Do not create release

**Unattended sessions** (fleet casts dispatched by a PM): the confirmation is upstream. The mission prompt approved releases as part of its scope and the SC approved the dispatch. Proceed without prompting.

### 4. Extract release notes from CHANGELOG.md

Release notes come from the `CHANGELOG.md` section for this version. Do **not** use `--generate-notes`. GitHub's auto-generated notes anchor a "Full Changelog" comparison link to the previous tag chronologically, which in monorepos with package-prefixed tags (`pkg@version`) lands on an unrelated package. The CHANGELOG section is the curated, scope-correct source.

For a **stable** release the notes live under the `## [${VERSION}]` heading. For a **pre-release** (the version contains a hyphen) there is no versioned heading yet — the entries sit under `## [Unreleased]`. Pick the section accordingly:

```bash
case "$VERSION" in
  *-*) SECTION="Unreleased" ;;   # pre-release
  *)   SECTION="$VERSION" ;;     # stable
esac
```

Then extract that section — lines between `## [$SECTION]` and the next `## [` heading, excluding the link-definition lines (`[x.y.z]: https://...`):

```bash
NOTES=$(awk -v ver="$SECTION" '
  $0 ~ "^## \\["ver"\\]" { in_section=1; next }
  in_section && /^## \[/ { exit }
  in_section && !/^\[.*\]:/ { print }
' "$CHANGELOG_PATH")
```

For monorepos, `CHANGELOG_PATH` is the package's CHANGELOG (e.g. `packages/<pkg>/CHANGELOG.md`), not the repo root.

### 5. Create release

Detect whether the version is a pre-release by checking for a hyphen (e.g., `1.0.0-alpha.62`, `1.2.1-preview.1`). If it contains a hyphen, add the `--prerelease` flag.

```bash
# Tag: single-package repo → "${VERSION}" (no 'v' prefix); monorepo → "<pkg-shortname>@${VERSION}"
# e.g. TAG="claude-core@1.0.0-beta.9"
# Always target the exact merge commit SHA from origin/main.

PRERELEASE=""
case "$VERSION" in *-*) PRERELEASE="--prerelease" ;; esac   # hyphen ⇒ pre-release

gh release create "${TAG}" \
  --title "${TAG}" \
  --target "${MAIN_SHA}" \
  --notes "$NOTES" \
  $PRERELEASE
```

### 6. Verify release notes match CHANGELOG

```bash
gh release view "${VERSION}" --json body --jq '.body'
```

The body should match the `$NOTES` extracted from CHANGELOG.md. If it does not (e.g. extraction missed a section, or `--notes` was substituted by mistake), edit:

```bash
gh release edit "${VERSION}" --notes "$NOTES"
```

The CHANGELOG content is the source of truth. The review here is verifying the release reflects it, not re-evaluating the content.

### 7. Monitor post-release status

Run the status script to check workflow, npm, and milestone:

```bash
# Monorepo: pass the package directory as a second arg
~/.claude/skills/github-release/scripts/github-release-status.sh "${VERSION}" [package-dir]
```

The script outputs JSON. Key fields: `version`, `workflow` (latest npm-publish run or null), `npm` ({package, latest, published}), `milestones`.

From the output:

- **Workflow**: If in progress, wait and re-run the script. If failed, report to user — they may need to fix and re-run (`gh run rerun <run-id>`).
- **NPM**: Confirm the version is live. If pending, wait and re-run.
- **Milestone**: See `github-milestone` skill. Do **not** auto-close for patch releases — milestones use `x.y` format and stay open across the minor series.

**Publishing uses npm trusted publishing (OIDC) — there is no `NPM_TOKEN`.** If the publish step fails to authenticate, the trusted-publishing trust is not configured for this package and workflow on npmjs.com — it is not an expired token, so do not go hunting for one to rotate. Flag the trust configuration to the SC. (Legacy repos still on an automation token: a `404 Not Found - PUT https://registry.npmjs.org/...` means the token expired — rotate it and rerun `gh run rerun <id>`.)

**OIDC covers `npm publish` only — not tag management.** `npm dist-tag add` (moving `latest`, etc.) is a separate registry write that OIDC does not authorize; it needs a classic token. A token-free workflow must therefore not run a separate `dist-tag` step — publish directly onto the tag you want with `--tag`, and for a pre-1.0 package leave `latest` unmanaged until the first stable release. A run whose publish succeeds but whose `dist-tag` step fails with `E401` is this exact mismatch.

## Integration with Other Skills

**Typical flow:**
```
maintenance-release → github-version → git-workflow → github-pr → [PR merged] → github-release
```

When called after other skills, version context flows through the conversation - no need to re-discover.

## CLI Reference

```bash
# Create release with CHANGELOG-derived notes (no 'v' prefix for @shellicar repos)
gh release create "1.2.1" --title "1.2.1" --notes "$NOTES"

# --generate-notes is NOT used in this skill; see Step 4 for why

# View release
gh release view "1.2.1"

# List releases
gh release list

# Delete release (if needed)
gh release delete "1.2.1" --yes
```

## Notes

- Tag format: bare `<version>` for a single-package repo, `<shortname>@<version>` for a monorepo; never a `v` prefix
- Release title: Same as tag (version number only)
- Release notes: from the `## [<version>]` section (stable) or `## [Unreleased]` (pre-release), via `--notes`
- The npm-publish workflow is triggered by release creation
- Always confirm with user before creating release
- Pre-release versions (containing `-`) must use `--prerelease` flag
