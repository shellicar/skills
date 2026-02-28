#!/bin/sh
set -e

# create-github-pr.sh - Create a GitHub PR with enforced required parameters
#
# Usage: create-github-pr.sh --title "Title" --body "Body" --milestone "1.3" --assignee "@me" [--label "dependencies"]
#
# Required: --title, --body, --milestone, --assignee
# Optional: --label (repeatable)
#
# This script enforces that all required parameters are provided.
# It wraps gh pr create to prevent ad-hoc calls that skip required fields.

TITLE=""
BODY=""
MILESTONE=""
ASSIGNEE=""
LABEL_ARGS=""

while [ $# -gt 0 ]; do
  case "$1" in
    --title) TITLE="$2"; shift 2 ;;
    --body) BODY="$2"; shift 2 ;;
    --milestone) MILESTONE="$2"; shift 2 ;;
    --assignee) ASSIGNEE="$2"; shift 2 ;;
    --label) LABEL_ARGS="$LABEL_ARGS --label $2"; shift 2 ;;
    *)
      echo "Error: Unknown parameter: $1" >&2
      echo "Usage: create-github-pr.sh --title \"Title\" --body \"Body\" --milestone \"1.3\" --assignee \"@me\" [--label \"label\"]" >&2
      exit 1
      ;;
  esac
done

# Validate required parameters
MISSING=""
[ -z "$TITLE" ] && MISSING="$MISSING --title"
[ -z "$BODY" ] && MISSING="$MISSING --body"
[ -z "$MILESTONE" ] && MISSING="$MISSING --milestone"
[ -z "$ASSIGNEE" ] && MISSING="$MISSING --assignee"

if [ -n "$MISSING" ]; then
  echo "Error: Missing required parameters:$MISSING" >&2
  echo "" >&2
  echo "All of --title, --body, --milestone, --assignee are required." >&2
  echo "Use the github-milestone skill to resolve the milestone before calling this script." >&2
  exit 1
fi

# Execute gh pr create
# LABEL_ARGS intentionally unquoted to split into separate args
# shellcheck disable=SC2086
gh pr create \
  --title "$TITLE" \
  --body "$BODY" \
  --milestone "$MILESTONE" \
  --assignee "$ASSIGNEE" \
  $LABEL_ARGS
