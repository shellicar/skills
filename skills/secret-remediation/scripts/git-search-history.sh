#!/bin/sh
# Search git history for sensitive values
#
# Usage:
#   git-search-history.sh --expressions <file> --branch <branch>
#
# Expressions file format — one sed expression per line:
#   s|PATTERN|REPLACEMENT|g
#
# Searches every commit on the specified branch using git grep (read-only, fast).
# Outputs: commit, file, pattern (tab-separated)

set -e

usage() {
  echo "Usage: git-search-history.sh --expressions <file> --branch <branch>"
  echo ""
  echo "Options:"
  echo "  --expressions <file>  File containing sed expressions (one per line)"
  echo "  --branch <branch>     Branch to search (e.g. main, master, feature/foo)"
  echo "  -h, --help            Show this help"
  echo ""
  echo "Expressions file format (one sed expression per line):"
  echo "  s|PATTERN|REPLACEMENT|g"
}

# --- Print usage if no arguments ---
if [ $# -eq 0 ]; then
  usage
  exit 0
fi

# --- Parse arguments ---
EXPRESSIONS_FILE=""
BRANCH=""

while [ $# -gt 0 ]; do
  case $1 in
    --expressions)
      EXPRESSIONS_FILE="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# --- Validate ---
if [ -z "$EXPRESSIONS_FILE" ]; then
  echo "Error: --expressions is required" >&2
  exit 1
fi

if [ ! -f "$EXPRESSIONS_FILE" ]; then
  echo "Error: expressions file not found: $EXPRESSIONS_FILE" >&2
  exit 1
fi

# Resolve to absolute path
EXPRESSIONS_FILE="$(cd "$(dirname "$EXPRESSIONS_FILE")" && pwd)/$(basename "$EXPRESSIONS_FILE")"

if [ -z "$BRANCH" ]; then
  echo "Error: --branch is required" >&2
  exit 1
fi

if ! git rev-parse --verify "refs/heads/$BRANCH" >/dev/null 2>&1; then
  echo "Error: branch '$BRANCH' not found" >&2
  exit 1
fi

# --- Count commits ---
COMMIT_COUNT=$(git rev-list --count "$BRANCH")

# --- Display info ---
echo ""
echo "=== Git History Search ==="
echo ""
echo "Branch:      $BRANCH"
echo "Commits:     $COMMIT_COUNT"
echo "Expressions: $EXPRESSIONS_FILE"
echo ""
echo "--- Expressions ---"

EXPR_COUNT=0
while IFS= read -r expr; do
  case "$expr" in
    ""|\#*) continue ;;
  esac
  EXPR_COUNT=$((EXPR_COUNT + 1))
  echo "  [$EXPR_COUNT] $expr"
done < "$EXPRESSIONS_FILE"

echo ""
echo "Total expressions: $EXPR_COUNT"
echo ""

# --- Search ---
LOG_FILE="/tmp/git-scrub-search-$(date +%Y%m%d-%H%M%S).log"
: > "$LOG_FILE"

echo "Searching $COMMIT_COUNT commits for matches..."
echo "Log: $LOG_FILE"
echo ""

# Extract search patterns from sed expressions
# Format: s|PATTERN|REPLACEMENT|g -> extract PATTERN
PATTERNS=""
while IFS= read -r expr; do
  case "$expr" in
    ""|\#*) continue ;;
  esac
  pattern=$(printf '%s' "$expr" | sed 's/^s|//;s/|[^|]*|g$//')
  if [ -z "$PATTERNS" ]; then
    PATTERNS="$pattern"
  else
    PATTERNS="$PATTERNS
$pattern"
  fi
done < "$EXPRESSIONS_FILE"

# Search every commit on the branch for each pattern using git grep
git rev-list "$BRANCH" | while IFS= read -r commit; do
  printf '%s\n' "$PATTERNS" | while IFS= read -r pattern; do
    git grep -l -- "$pattern" "$commit" 2>/dev/null | while IFS= read -r match; do
      # match format is "commit:file"
      file=$(printf '%s' "$match" | sed "s/^${commit}://")
      printf '%s\t%s\t%s\n' "$commit" "$file" "$pattern" >> "$LOG_FILE"
    done
  done
done

MATCH_COUNT=$(wc -l < "$LOG_FILE" | tr -d ' ')

echo ""
echo "=== Search Results ==="
echo "Total matches: $MATCH_COUNT"
echo ""

if [ "$MATCH_COUNT" -gt 0 ]; then
  echo "--- Matches (commit, file, pattern) ---"
  cat "$LOG_FILE"
  echo ""
  echo "Review the matches above for false positives."
  echo "When ready, run git-scrub-history.sh --destructive to scrub."
else
  echo "No matches found. Nothing to scrub."
fi
