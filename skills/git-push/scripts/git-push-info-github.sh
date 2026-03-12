#!/bin/sh
# GitHub-specific push info: protected branches and PRs
#
# Usage: git-push-info-github.sh <branch>
#
# Output: JSON object with protected_branches, open_pr, merged_pr

set -e

BRANCH="$1"
if [ -z "$BRANCH" ]; then
  printf 'Usage: git-push-info-github.sh <branch>\n' >&2
  exit 1
fi

PROTECTED_BRANCHES=$(gh api repos/{owner}/{repo}/branches \
  --jq '[.[] | select(.protected) | .name]' 2>/dev/null) || PROTECTED_BRANCHES='[]'

OPEN_PR=$(gh pr list --head "$BRANCH" --state open --json number,title \
  | jq '[.[] | {id: .number, title: .title}]' 2>/dev/null) || OPEN_PR='[]'

MERGED_PR=$(gh pr list --head "$BRANCH" --state merged --json number,title \
  | jq '[.[] | {id: .number, title: .title}]' 2>/dev/null) || MERGED_PR='[]'

jq -n \
  --argjson protected_branches "$PROTECTED_BRANCHES" \
  --argjson open_pr "$OPEN_PR" \
  --argjson merged_pr "$MERGED_PR" \
  '{protected_branches: $protected_branches, open_pr: $open_pr, merged_pr: $merged_pr}'
