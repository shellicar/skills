#!/bin/sh
# Gather all state needed before creating a GitHub release
# Outputs JSON that Claude can parse in one read
#
# Usage: github-release-info.sh [package-dir]
#   package-dir  optional. In a monorepo, the directory of the package being
#                released (e.g. packages/claude-core, apps/claude-sdk-cli).
#                Omit for a single-package repo.
#
# Output fields:
#   convention       - detected convention name
#   owner            - GitHub owner from git remote
#   repo             - GitHub repo name from git remote
#   branch           - current branch name
#   working_tree     - "clean" or "dirty"
#   package          - package name from package.json
#   version          - version from package.json
#   prerelease       - true/false (version contains a hyphen)
#   tag              - release tag (<shortname>@<version> in a monorepo, else bare version)
#   changelog_path   - the CHANGELOG.md that was checked
#   changelog        - "found" or "missing"
#   main_sha         - HEAD commit SHA of origin/main (used as --target for release)
#   existing_release - release object if exists, else null

set -e

PKG_DIR="${1:-}"

# Detect convention
DETECT_SCRIPT="$HOME/.claude/skills/detect-convention/scripts/detect-convention.sh"
CONVENTION=""
if [ -f "$DETECT_SCRIPT" ]; then
  CONVENTION=$( ("$DETECT_SCRIPT" 2>/dev/null || echo '{}') | jq -r '.convention // ""')
fi

# Repo owner/name from git remote
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
  echo "ERROR: no git remote found" >&2
  exit 1
fi
REPO=$(echo "$REMOTE" | sed 's/.*github.com[:/]//' | sed 's/\.git$//' | cut -d'/' -f2)
OWNER=$(echo "$REMOTE" | sed 's/.*github.com[:/]//' | sed 's/\.git$//' | cut -d'/' -f1)

# Branch
BRANCH=$(git branch --show-current)

# Working tree
if git diff --quiet HEAD 2>/dev/null; then
  WORKING_TREE="clean"
else
  WORKING_TREE="dirty"
fi

# Resolve which package.json to read: explicit package-dir wins, then the first
# monorepo package, then the repo root.
if [ -n "$PKG_DIR" ]; then
  PKG_JSON="$PKG_DIR/package.json"
elif ls packages/*/package.json >/dev/null 2>&1; then
  PKG_JSON=$(ls packages/*/package.json | head -1)
else
  PKG_JSON="package.json"
fi

PACKAGE=""
VERSION=""
if [ -f "$PKG_JSON" ]; then
  PACKAGE=$(jq -r '.name // ""' "$PKG_JSON" 2>/dev/null)
  VERSION=$(jq -r '.version // ""' "$PKG_JSON" 2>/dev/null)
fi

# Pre-release: version contains a hyphen (e.g. 1.0.0-beta.9)
PRERELEASE="false"
case "$VERSION" in
  *-*) PRERELEASE="true" ;;
esac

# Tag: a monorepo package (explicit package-dir) tags as <shortname>@<version>;
# a single-package repo uses the bare version.
SHORTNAME=$(echo "$PACKAGE" | sed 's@.*/@@')
if [ -n "$PKG_DIR" ]; then
  TAG="$SHORTNAME@$VERSION"
else
  TAG="$VERSION"
fi

# CHANGELOG: per-package when a package-dir is given, else repo root.
if [ -n "$PKG_DIR" ]; then
  CHANGELOG_PATH="$PKG_DIR/CHANGELOG.md"
else
  CHANGELOG_PATH="CHANGELOG.md"
fi

# A stable release needs a `## [<version>]` heading. A pre-release keeps its
# entries under `## [Unreleased]`, so check for that section instead.
CHANGELOG_STATUS="missing"
if [ -f "$CHANGELOG_PATH" ]; then
  if [ "$PRERELEASE" = "true" ]; then
    if grep -q "## \[Unreleased\]" "$CHANGELOG_PATH" 2>/dev/null; then
      CHANGELOG_STATUS="found"
    fi
  else
    if grep -q "## \[$VERSION\]" "$CHANGELOG_PATH" 2>/dev/null; then
      CHANGELOG_STATUS="found"
    fi
  fi
fi

# HEAD SHA of origin/main
MAIN_SHA=$(git ls-remote origin refs/heads/main 2>/dev/null | cut -f1)

# Open milestones
MILESTONES=$(gh api "repos/$OWNER/$REPO/milestones" \
  --jq '[.[] | {title: .title, number: .number, open_issues: .open_issues, closed_issues: .closed_issues}]' \
  2>/dev/null || echo "[]")

# Existing release (keyed by the release tag)
EXISTING_RELEASE="null"
if [ -n "$TAG" ]; then
  if gh release view "$TAG" >/dev/null 2>&1; then
    EXISTING_RELEASE=$(gh release view "$TAG" \
      --json tagName,publishedAt,url \
      --jq '{tag: .tagName, published: .publishedAt, url: .url}')
  fi
fi

jq -n \
  --arg convention "$CONVENTION" \
  --arg owner "$OWNER" \
  --arg repo "$REPO" \
  --arg branch "$BRANCH" \
  --arg working_tree "$WORKING_TREE" \
  --arg package "${PACKAGE:-}" \
  --arg version "${VERSION:-}" \
  --argjson prerelease "$PRERELEASE" \
  --arg tag "${TAG:-}" \
  --arg changelog_path "$CHANGELOG_PATH" \
  --arg changelog "$CHANGELOG_STATUS" \
  --arg main_sha "${MAIN_SHA:-}" \
  --argjson milestones "$MILESTONES" \
  --argjson existing_release "$EXISTING_RELEASE" \
  '{convention: $convention, owner: $owner, repo: $repo, branch: $branch, working_tree: $working_tree, package: $package, version: $version, prerelease: $prerelease, tag: $tag, changelog_path: $changelog_path, changelog: $changelog, main_sha: $main_sha, milestones: $milestones, existing_release: $existing_release}'
