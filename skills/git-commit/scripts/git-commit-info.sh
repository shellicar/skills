#!/bin/sh
# Gather all git state needed for a commit decision
# Outputs structured sections that Claude can parse in one read
#
# Usage: git-commit-info.sh [--github | --azure-devops --project <project>]
#
# Sections output:
#   BRANCH        - current branch name
#   MERGED_PR     - whether a merged PR exists for this branch (if platform specified)
#   STAGED_STAT   - staged changes summary (diffstat)
#   STATUS        - full git status output
#   STAGED_DIFF   - full staged diff content
#   RECENT_LOG    - recent commit messages for style reference

set -e

PLATFORM=""
PROJECT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --github)
      PLATFORM="github"
      shift
      ;;
    --azure-devops)
      PLATFORM="azure-devops"
      shift
      ;;
    --project)
      PROJECT="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

section() {
  printf '\n--- %s ---\n' "$1"
}

# Branch
section "BRANCH"
BRANCH=$(git branch --show-current)
echo "$BRANCH"

# Merged PR check
section "MERGED_PR"
if [ "$PLATFORM" = "github" ]; then
  gh pr list --head "$BRANCH" --state merged --json number,title 2>/dev/null || echo "[]"
elif [ "$PLATFORM" = "azure-devops" ]; then
  if [ -n "$PROJECT" ]; then
    az repos pr list --source-branch "$BRANCH" --status completed --project "$PROJECT" -o json 2>/dev/null || echo "[]"
  else
    echo "SKIP: --project required for azure-devops"
  fi
else
  echo "SKIP: no platform specified"
fi

# Staged changes summary
section "STAGED_STAT"
git diff --staged --stat 2>/dev/null || echo "(no staged changes)"

# Full status
section "STATUS"
git status

# Staged diff content
section "STAGED_DIFF"
git diff --staged 2>/dev/null || echo "(no staged changes)"

# Recent commits for style reference
section "RECENT_LOG"
git log --oneline -5 2>/dev/null || echo "(no commits)"
