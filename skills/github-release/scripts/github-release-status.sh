#!/bin/sh
# Check post-release status: workflow, npm availability, milestone
# Outputs JSON that Claude can parse in one read
#
# Usage: github-release-status.sh <version> [package-dir]
#   version      the version being checked (e.g. 1.0.0-beta.9)
#   package-dir  optional. In a monorepo, the directory of the package being
#                released (e.g. packages/claude-core). Omit for a single-package repo.
#
# Output fields:
#   version     - the version being checked
#   package     - npm package name
#   workflow    - latest npm-publish workflow run object, or null
#   npm         - {package, tag, latest, published}
#   milestones  - array of milestone objects

set -e

VERSION="${1:-}"
PKG_DIR="${2:-}"
if [ -z "$VERSION" ]; then
  echo "Usage: github-release-status.sh <version> [package-dir]" >&2
  exit 1
fi

REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
REPO=$(echo "$REMOTE" | sed 's/.*github.com[:/]//' | sed 's/\.git$//' | cut -d'/' -f2)
OWNER=$(echo "$REMOTE" | sed 's/.*github.com[:/]//' | sed 's/\.git$//' | cut -d'/' -f1)

# Resolve which package.json to read: explicit package-dir wins, then the first
# monorepo package, then the repo root.
if [ -n "$PKG_DIR" ]; then
  PKG_JSON="$PKG_DIR/package.json"
elif ls packages/*/package.json >/dev/null 2>&1; then
  PKG_JSON=$(ls packages/*/package.json | head -1)
else
  PKG_JSON="package.json"
fi
PKG_NAME=""
if [ -f "$PKG_JSON" ]; then
  PKG_NAME=$(jq -r '.name // ""' "$PKG_JSON" 2>/dev/null)
fi

# Workflow status (latest npm-publish run)
WORKFLOW=$(gh run list --workflow=npm-publish.yml --limit=1 \
  --json status,conclusion,databaseId,displayTitle 2>/dev/null | jq '.[0] // null')

# Determine npm dist-tag from version (e.g. 1.0.0-beta.9 -> beta, 1.0.0 -> latest)
NPM_TAG=$(echo "$VERSION" | sed -n 's/^[0-9]*\.[0-9]*\.[0-9]*-\(.*\)\.[0-9]*$/\1/p')
if [ -z "$NPM_TAG" ]; then
  NPM_TAG="latest"
fi

# npm availability
NPM_LATEST=""
NPM_PUBLISHED="false"
if [ -n "$PKG_NAME" ] && [ "$PKG_NAME" != "null" ]; then
  NPM_LATEST=$(npm view "$PKG_NAME" "dist-tags.$NPM_TAG" 2>/dev/null || echo "")
  if [ "$NPM_LATEST" = "$VERSION" ]; then
    NPM_PUBLISHED="true"
  fi
fi

# Open milestones
MILESTONES=$(gh api "repos/$OWNER/$REPO/milestones" \
  --jq '[.[] | {title: .title, number: .number, state: .state, open_issues: .open_issues, closed_issues: .closed_issues}]' \
  2>/dev/null || echo "[]")

jq -n \
  --arg version "$VERSION" \
  --argjson workflow "$WORKFLOW" \
  --arg pkg_name "${PKG_NAME:-}" \
  --arg npm_tag "$NPM_TAG" \
  --arg npm_latest "${NPM_LATEST:-}" \
  --argjson npm_published "$NPM_PUBLISHED" \
  --argjson milestones "$MILESTONES" \
  '{version: $version, package: $pkg_name, workflow: $workflow, npm: {package: $pkg_name, tag: $npm_tag, latest: $npm_latest, published: $npm_published}, milestones: $milestones}'
