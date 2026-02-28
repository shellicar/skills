#!/bin/sh
# Show full diffs for specific commits (for secret scanning)
# Called after reviewing diffstat to select which commits need scanning
#
# Usage: git-push-diffs.sh <hash> [<hash> ...]
#
# Each commit is shown with its full diff content.
# Use --exclude <glob> to skip files matching a pattern (repeatable).
#
# Examples:
#   git-push-diffs.sh abc123 def456
#   git-push-diffs.sh --exclude '*.lock' --exclude '*.min.js' abc123

set -e

EXCLUDES=""
HASHES=""

while [ $# -gt 0 ]; do
  case "$1" in
    --exclude)
      EXCLUDES="$EXCLUDES -- . ':!$2'"
      shift 2
      ;;
    *)
      HASHES="$HASHES $1"
      shift
      ;;
  esac
done

if [ -z "$HASHES" ]; then
  echo "Usage: git-push-diffs.sh [--exclude <glob>] <hash> [<hash> ...]" >&2
  exit 1
fi

for hash in $HASHES; do
  printf '\n--- COMMIT %s ---\n' "$(git log -1 --format='%h %s' "$hash")"
  if [ -n "$EXCLUDES" ]; then
    eval "git show '$hash' $EXCLUDES"
  else
    git show "$hash"
  fi
done
