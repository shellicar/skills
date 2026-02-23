#!/bin/sh
# Tree-filter script: apply sed replacements
# Called by git filter-branch for each commit
#
# Usage (called by git-scrub-history.sh):
#   git-scrub-commit.sh <expressions-file> --destructive
#
# Requires --destructive flag to run.

set -e

EXPRESSIONS_FILE="$1"
shift

DESTRUCTIVE=0
case "${1:-}" in
  -d|--destructive) DESTRUCTIVE=1 ;;
esac

if [ -z "$EXPRESSIONS_FILE" ]; then
  exit 1
fi

if [ "$DESTRUCTIVE" != "1" ]; then
  echo "Error: --destructive flag is required" >&2
  exit 1
fi

# Build a single sed command from all expressions
SED_CMD=""
while IFS= read -r expr; do
  case "$expr" in
    ""|\#*) continue ;;
  esac
  if [ -z "$SED_CMD" ]; then
    SED_CMD="$expr"
  else
    SED_CMD="$SED_CMD;$expr"
  fi
done < "$EXPRESSIONS_FILE"

if [ -z "$SED_CMD" ]; then
  exit 0
fi

# Apply to every file in the checkout
find . -type f | while IFS= read -r file; do
  sed "$SED_CMD" "$file" > "$file.tmp"
  if ! cmp -s "$file" "$file.tmp"; then
    echo "[scrub] $file"
    mv "$file.tmp" "$file"
  else
    rm -f "$file.tmp"
  fi
done
