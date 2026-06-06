---
name: github-release
description: |
 Runs the full GitHub release sequence for @shellicar npm packages: precondition checks, release creation, note review, and npm publish monitoring. Without it, releases can run from the wrong commit, miss CHANGELOG entries, or duplicate existing tags.
 TRIGGER when publishing a release or cutting a new version.
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

### 1. Gather pre-release state

Run the gather script to check all preconditions in one call:

```bash
~/.claude/skills/github-release/scripts/github-release-info.sh
```

The script outputs JSON. Key fields: `convention`, `owner`, `repo`, `branch`, `working_tree`, `version`, `changelog`, `main_sha`, `milestones`, `existing_release`. Must be a GitHub repo (`shellicar` or `shellicar-oss` convention) — stop if convention is missing or does not match.

### 2. Analyse the gathered state

From the script output, check the following — stop and inform the Supreme Commander if any fail:

- **Working tree**: Must be clean
- **Version**: Must be found in package.json
- **CHANGELOG**: Must contain an entry for the version
- **main_sha**: Must be non-empty — if empty, `origin/main` could not be resolved (PR may not be merged yet)
- **Milestone**: Should exist for the version (warn if missing, don't block)
- **Existing release**: If a release already exists, STOP — inform the Supreme Commander

### 3. Confirm with user

**Attended sessions** (interactive Claude Code etc., where `AskUserQuestion` is available): use it to confirm release creation:

- "Create release" - Proceed with release
- "Cancel" - Do not create release

**Unattended sessions** (fleet casts dispatched by a PM, no `AskUserQuestion` tool): the confirmation is upstream. The mission prompt approved releases as part of its scope and the SC approved the dispatch. Proceed without prompting; do not stop on the absence of the tool.

### 4. Extract release notes from CHANGELOG.md

Release notes come from the `CHANGELOG.md` section for this version. Do **not** use `--generate-notes`. GitHub's auto-generated notes anchor a "Full Changelog" comparison link to the previous tag chronologically, which in monorepos with package-prefixed tags (`pkg@version`) lands on an unrelated package. The CHANGELOG section is the curated, scope-correct source.

Extract the section for `${VERSION}` — lines between `## [${VERSION}]` and the next `## [` heading, excluding the link-definition lines (`[x.y.z]: https://...`):

```bash
NOTES=$(awk -v ver="$VERSION" '
  $0 ~ "^## \\["ver"\\]" { in_section=1; next }
  in_section && /^## \[/ { exit }
  in_section && !/^\[.*\]:/ { print }
' "$CHANGELOG_PATH")
```

For monorepos, `CHANGELOG_PATH` is the package's CHANGELOG (e.g. `packages/<pkg>/CHANGELOG.md`), not the repo root.

### 5. Create release

Detect whether the version is a pre-release by checking for a hyphen (e.g., `1.0.0-alpha.62`, `1.2.1-preview.1`). If it contains a hyphen, add the `--prerelease` flag.

```bash
# @shellicar convention: no 'v' prefix
# Always target the exact merge commit SHA from origin/main

# Stable release:
gh release create "${VERSION}" \
  --title "${VERSION}" \
  --target "${MAIN_SHA}" \
  --notes "$NOTES"

# Pre-release (version contains a hyphen):
gh release create "${VERSION}" \
  --title "${VERSION}" \
  --target "${MAIN_SHA}" \
  --notes "$NOTES" \
  --prerelease
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
~/.claude/skills/github-release/scripts/github-release-status.sh "${VERSION}"
```

The script outputs JSON. Key fields: `version`, `workflow` (latest npm-publish run or null), `npm` ({package, latest, published}), `milestones`.

From the output:

- **Workflow**: If in progress, wait and re-run the script. If failed, report to user — they may need to fix and re-run (`gh run rerun <run-id>`).
- **NPM**: Confirm the version is live. If pending, wait and re-run.
- **Milestone**: See `github-milestone` skill. Do **not** auto-close for patch releases — milestones use `x.y` format and stay open across the minor series.

**npm publish failed with 404 on PUT to the registry.** If `npm publish` returns `404 Not Found - PUT https://registry.npmjs.org/...`, the automation token (`NPM_TOKEN`) has expired. This is not a true package-not-found; do not investigate package-naming or registry-path issues. Stop and flag to the SC for token rotation. After rotation, retry the failed workflow (`gh run rerun <id>`) and continue.

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

- Tag format: `${VERSION}` (e.g., `1.2.1`) - NO `v` prefix for @shellicar repos
- Release title: Same as tag (version number only)
- Release notes: Extracted from CHANGELOG.md section for the version (--notes)
- The npm-publish workflow is triggered by release creation
- Always confirm with user before creating release
- Pre-release versions (containing `-`) must use `--prerelease` flag
