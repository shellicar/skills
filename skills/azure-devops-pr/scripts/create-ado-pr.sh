#!/bin/sh
# Create an Azure DevOps PR, link work items, and set auto-complete.
# Does the full sequence in one shot.
#
# Usage: echo '{...}' | create-ado-pr.sh
#
# Input JSON fields:
#   org         (required) - Azure DevOps org name (e.g. "hopeventures")
#   project     (required) - Project name
#   repo        (required) - Repository name
#   branch      (required) - Source branch name (without refs/heads/)
#   title       (required) - PR title
#   description (required) - PR description (markdown)
#   task_id     (optional) - Task work item ID to link via CLI
#   target      (optional) - Target branch, defaults to "main"
#
# Sequence:
#   1. Create PR via REST API
#   2. Link task work item (if task_id provided)
#   3. Set auto-complete with merge message
#
# Output: JSON with pr_id, pr_url, and status of each step.
# Exit: non-zero if PR creation fails. Work item linking and auto-complete
#       failures are reported but do not cause a non-zero exit (the PR exists).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ADO_REST="$SCRIPT_DIR/ado-rest.sh"
PR_MERGE="$SCRIPT_DIR/pr-merge-message.sh"

INPUT=$(cat)

# Extract fields
ORG=$(printf '%s' "$INPUT" | jq -r '.org')
PROJECT=$(printf '%s' "$INPUT" | jq -r '.project')
REPO=$(printf '%s' "$INPUT" | jq -r '.repo')
BRANCH=$(printf '%s' "$INPUT" | jq -r '.branch')
TITLE=$(printf '%s' "$INPUT" | jq -r '.title')
DESCRIPTION=$(printf '%s' "$INPUT" | jq -r '.description')
TASK_ID=$(printf '%s' "$INPUT" | jq -r '.task_id // empty')
TARGET=$(printf '%s' "$INPUT" | jq -r '.target // "main"')

# Validate required fields
MISSING=""
[ -z "$ORG" ] || [ "$ORG" = "null" ]         && MISSING="$MISSING org"
[ -z "$PROJECT" ] || [ "$PROJECT" = "null" ]  && MISSING="$MISSING project"
[ -z "$REPO" ] || [ "$REPO" = "null" ]        && MISSING="$MISSING repo"
[ -z "$BRANCH" ] || [ "$BRANCH" = "null" ]    && MISSING="$MISSING branch"
[ -z "$TITLE" ] || [ "$TITLE" = "null" ]      && MISSING="$MISSING title"
[ -z "$DESCRIPTION" ] || [ "$DESCRIPTION" = "null" ] && MISSING="$MISSING description"

if [ -n "$MISSING" ]; then
  printf 'Error: Missing required fields:%s\n' "$MISSING" >&2
  exit 1
fi

ORG_URL="https://dev.azure.com/${ORG}"

# --- Step 1: Create PR ---

PR_RESPONSE=$(printf '{
  "org": "%s", "project": "%s", "method": "POST",
  "path": "git/repositories/%s/pullrequests",
  "params": {"api-version": "7.1"},
  "body": {
    "sourceRefName": "refs/heads/%s",
    "targetRefName": "refs/heads/%s",
    "title": %s,
    "description": %s
  }
}' "$ORG" "$PROJECT" "$REPO" "$BRANCH" "$TARGET" \
  "$(printf '%s' "$TITLE" | jq -Rs '.')" \
  "$(printf '%s' "$DESCRIPTION" | jq -Rs '.')" \
  | "$ADO_REST")

PR_ID=$(printf '%s' "$PR_RESPONSE" | jq -r '.pullRequestId // empty')

if [ -z "$PR_ID" ]; then
  echo "Failed to create PR." >&2
  printf '%s' "$PR_RESPONSE" >&2
  exit 1
fi

PR_URL="${ORG_URL}/${PROJECT}/_git/${REPO}/pullrequest/${PR_ID}"

# --- Step 2: Link task (if provided) ---

TASK_STATUS="skipped"
if [ -n "$TASK_ID" ]; then
  if az repos pr work-item add --id "$PR_ID" --work-items "$TASK_ID" --org "$ORG_URL" >/dev/null 2>&1; then
    TASK_STATUS="linked"
  else
    TASK_STATUS="failed"
  fi
fi

# --- Step 3: Auto-complete with merge message ---

AUTOCOMPLETE_STATUS="failed"
if printf '{"org":"%s","id":"%s","mode":"set-auto-complete"}' "$ORG" "$PR_ID" | "$PR_MERGE" >/dev/null 2>&1; then
  AUTOCOMPLETE_STATUS="set"
fi

# --- Output ---

jq -n \
  --arg pr_id "$PR_ID" \
  --arg pr_url "$PR_URL" \
  --arg task_status "$TASK_STATUS" \
  --arg autocomplete_status "$AUTOCOMPLETE_STATUS" \
  '{
    pr_id: ($pr_id | tonumber),
    pr_url: $pr_url,
    task_link: $task_status,
    auto_complete: $autocomplete_status
  }'
