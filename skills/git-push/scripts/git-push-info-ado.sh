#!/bin/sh
# Azure DevOps-specific push info: protected branches and PRs
#
# Usage: git-push-info-ado.sh <branch> <org> <project>
#
# Output: JSON object with protected_branches, open_pr, merged_pr

set -e

BRANCH="$1"
ORG="$2"
PROJECT="$3"
if [ -z "$BRANCH" ] || [ -z "$ORG" ] || [ -z "$PROJECT" ]; then
  printf 'Usage: git-push-info-ado.sh <branch> <org> <project>\n' >&2
  exit 1
fi

PROTECTED_BRANCHES=$(az rest --method GET \
  --url "https://dev.azure.com/$ORG/$PROJECT/_apis/policy/configurations?api-version=7.1" \
  --resource 499b84ac-1321-427f-aa17-267ca6975798 2>/dev/null \
  | jq '[.value[] | .settings.scope[]? | .refName // empty | select(startswith("refs/heads/")) | ltrimstr("refs/heads/")] | unique' 2>/dev/null) || PROTECTED_BRANCHES='[]'

OPEN_PR=$(az repos pr list --source-branch "$BRANCH" --status active --project "$PROJECT" -o json \
  | jq '[.[] | {id: .pullRequestId, title: .title}]' 2>/dev/null) || OPEN_PR='[]'

MERGED_PR=$(az repos pr list --source-branch "$BRANCH" --status completed --project "$PROJECT" -o json \
  | jq '[.[] | {id: .pullRequestId, title: .title}]' 2>/dev/null) || MERGED_PR='[]'

jq -n \
  --argjson protected_branches "$PROTECTED_BRANCHES" \
  --argjson open_pr "$OPEN_PR" \
  --argjson merged_pr "$MERGED_PR" \
  '{protected_branches: $protected_branches, open_pr: $open_pr, merged_pr: $merged_pr}'
