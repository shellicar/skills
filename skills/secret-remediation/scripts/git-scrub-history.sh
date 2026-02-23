#!/bin/sh
# Rewrite git history to scrub sensitive values
#
# Usage:
#   git-scrub-history.sh --expressions <file> --branch <branch> --destructive
#
# Expressions file format — one sed expression per line:
#   s|PATTERN|REPLACEMENT|g
#
# Requires --destructive flag to run. This is a safety gate.
# Use git-search-history.sh first to preview what will be changed.
#
# Workflow:
#   1. Run git-search-history.sh to find matches and review
#   2. Run this script with --destructive to rewrite history
#   3. Force push (manual — printed at the end)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
  echo "Usage: git-scrub-history.sh --expressions <file> --branch <branch> --destructive"
  echo ""
  echo "Options:"
  echo "  --expressions <file>  File containing sed expressions (one per line)"
  echo "  --branch <branch>     Branch to rewrite (e.g. main, master, feature/foo)"
  echo "  -d, --destructive     Required safety flag to confirm destructive operation"
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
DESTRUCTIVE=0

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
    -d|--destructive)
      DESTRUCTIVE=1
      shift
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

if [ "$DESTRUCTIVE" != "1" ]; then
  echo "Error: --destructive flag is required to run this script" >&2
  echo "Run git-search-history.sh first to preview changes." >&2
  exit 1
fi

# --- Check clean working tree ---
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree is not clean" >&2
  echo "Commit or stash your changes before scrubbing history." >&2
  exit 1
fi

# --- Count commits ---
COMMIT_COUNT=$(git rev-list --count "$BRANCH")

# --- Display info ---
echo ""
echo "=== Git History Rewrite ==="
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

# --- Plan ---
BACKUP_TAG="backup/pre-scrub-$(date +%Y%m%d-%H%M%S)"

echo "--- Plan ---"
echo "  1. Create backup tag: $BACKUP_TAG"
echo "  2. Run: git filter-branch --tree-filter '...' -- $BRANCH"
echo "  3. After completion, YOU must run: git push --force-with-lease origin $BRANCH"
echo ""

echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "  DESTRUCTIVE MODE"
echo "  This will PERMANENTLY rewrite $COMMIT_COUNT commits on '$BRANCH'."
echo "  All commit hashes will change."
echo "  This cannot be undone without the backup tag."
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo ""
echo "Press Ctrl-C within 5 seconds to abort..."
echo ""
i=5
while [ "$i" -gt 0 ]; do
  printf "  %d...\n" "$i"
  sleep 1
  i=$((i - 1))
done
echo ""

echo "Creating backup tag: $BACKUP_TAG"
git tag "$BACKUP_TAG"

echo "Running git filter-branch..."
echo "(this may take a while for large repos)"
echo ""

FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --tree-filter "'$SCRIPT_DIR/git-scrub-commit.sh' '$EXPRESSIONS_FILE' --destructive" \
  -- "$BRANCH"

echo ""
echo "History scrub complete."
echo ""
echo "Next step: YOU must run:"
echo "    git push --force-with-lease origin $BRANCH"
echo ""
echo "To undo, restore from backup tag:"
echo "    git reset --hard $BACKUP_TAG"
ls