#!/bin/sh
# Pre-commit check.
# Run before each commit. Reports what's staged so you can verify.
#
# Usage:
#   pre-commit-check.sh [file1 file2 ...]
#
#   If file arguments are provided, compares staged files against the expected list.
#   If no arguments, reports what's staged.
#
# This is informational, not a hard gate. Use the output to make a judgment
# call (e.g. testament files may be intentionally excluded).
#
# Output: JSON report on stdout.
# Exit: always 0. You decide whether to proceed.

set -e

# Get staged files
STAGED=$(git diff --cached --name-only 2>/dev/null)
STAGED_JSON=$(printf '%s' "$STAGED" | jq -Rs '[split("\n")[] | select(. != "")]')
STAGED_COUNT=$(printf '%s' "$STAGED_JSON" | jq 'length')

# Get files modified in the working tree but not staged
UNSTAGED=$(git diff --name-only 2>/dev/null)
UNSTAGED_JSON=$(printf '%s' "$UNSTAGED" | jq -Rs '[split("\n")[] | select(. != "")]')

# Flag common accidents in staged files
WARNINGS='[]'
for pattern in '\.log$' '\.env' 'claude-sdk-cli\.log' '\.sdk-history\.jsonl'; do
  MATCHES=$(printf '%s' "$STAGED" | grep -E "$pattern" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    WARNINGS=$(printf '%s' "$WARNINGS" | jq --arg f "$MATCHES" '. + [$f]')
  fi
done

if [ $# -eq 0 ]; then
  # Report mode: just show what's staged
  jq -n \
    --argjson staged "$STAGED_JSON" \
    --argjson unstaged "$UNSTAGED_JSON" \
    --argjson warnings "$WARNINGS" \
    --argjson staged_count "$STAGED_COUNT" \
    '{
      staged_count: $staged_count,
      staged: $staged,
      unstaged: $unstaged,
      warnings: $warnings
    }'
  exit 0
fi

# Comparison mode: compare staged against expected files
EXPECTED_JSON=$(printf '%s\n' "$@" | jq -Rs '[split("\n")[] | select(. != "")]')

# Files staged but not in expected list
UNEXPECTED=$(jq -n --argjson staged "$STAGED_JSON" --argjson expected "$EXPECTED_JSON" \
  '$staged - $expected')

# Files in expected list but not staged
MISSING=$(jq -n --argjson staged "$STAGED_JSON" --argjson expected "$EXPECTED_JSON" \
  '$expected - $staged')

jq -n \
  --argjson staged "$STAGED_JSON" \
  --argjson expected "$EXPECTED_JSON" \
  --argjson unexpected "$UNEXPECTED" \
  --argjson missing "$MISSING" \
  --argjson unstaged "$UNSTAGED_JSON" \
  --argjson warnings "$WARNINGS" \
  --argjson staged_count "$STAGED_COUNT" \
  '{
    staged_count: $staged_count,
    staged: $staged,
    expected: $expected,
    unexpected: $unexpected,
    missing: $missing,
    unstaged: $unstaged,
    warnings: $warnings
  }'
