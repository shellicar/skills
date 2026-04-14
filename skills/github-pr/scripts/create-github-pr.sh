#!/bin/sh
set -e

# create-github-pr.sh - Create a GitHub PR, reads JSON from stdin
#
# Usage: jq -n '{...}' | create-github-pr.sh
#
# Input JSON fields:
#   title     (required) - PR title
#   body      (required) - PR body (multiline supported)
#   assignee  (required) - Assignee (@me or username)
#   labels    (required) - Array of label names
#   milestone (optional) - Milestone title
#
# Example:
#   jq -n '{
#     title: "Fix login bug",
#     body: "## Summary\n\n- Fix null pointer on login",
#     assignee: "@me",
#     milestone: "1.3",
#     labels: ["bug"]
#   }' | create-github-pr.sh

INPUT=$(cat)

# Extract fields
TITLE=$(printf '%s' "$INPUT" | jq -r '.title // empty')
BODY=$(printf '%s' "$INPUT" | jq -r '.body // empty')
ASSIGNEE=$(printf '%s' "$INPUT" | jq -r '.assignee // empty')
MILESTONE=$(printf '%s' "$INPUT" | jq -r '.milestone // empty')

# Labels (required, extract early for validation)
LABELS=$(printf '%s' "$INPUT" | jq -r '.labels // empty')
LABELS_COUNT=$(printf '%s' "$INPUT" | jq '.labels | length // 0' 2>/dev/null || echo 0)

# Validate required fields
MISSING=""
[ -z "$TITLE" ]    && MISSING="$MISSING title"
[ -z "$BODY" ]     && MISSING="$MISSING body"
[ -z "$ASSIGNEE" ] && MISSING="$MISSING assignee"
[ "$LABELS_COUNT" -eq 0 ] && MISSING="$MISSING labels"

if [ -n "$MISSING" ]; then
  printf 'Error: Missing required fields:%s\n' "$MISSING" >&2
  printf 'Required: title, body, assignee, labels. Optional: milestone.\n' >&2
  exit 1
fi

# Build optional args
set --

# Milestone (optional)
if [ -n "$MILESTONE" ]; then
  set -- "$@" --milestone "$MILESTONE"
fi

# Labels (optional, preserving labels with spaces)
while IFS= read -r label; do
  [ -n "$label" ] && set -- "$@" --label "$label"
done <<LABELS
$(printf '%s' "$INPUT" | jq -r '.labels[]? // empty')
LABELS

# Execute
gh pr create \
  --title "$TITLE" \
  --body "$BODY" \
  --assignee "$ASSIGNEE" \
  "$@"
