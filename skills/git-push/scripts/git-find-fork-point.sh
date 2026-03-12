#!/bin/sh
# Find the fork point of the current branch — the most recent ancestor
# commit that exists on any remote branch.
#
# Usage: git-find-fork-point.sh
#
# Output (stdout): JSON object with fork point info
#   fork_point    - full hash of the nearest ancestor on a remote branch
#   remote_ref    - the remote branch name that contains the fork point
#   local_commits - array of {hash, message} for commits between fork point and HEAD
#
# Exit 0: fork point found
# Exit 1: no fork point found (every commit is local-only)
#
# Algorithm: walk backwards from HEAD through the commit history.
# For each commit, check if any remote branch contains it.
# The first hit is the fork point — the boundary between local
# and already-pushed commits.

set -e

FORK_POINT=""
REMOTE_REF=""
COMMIT="HEAD"

while true; do
  HASH=$(git rev-parse "$COMMIT" 2>/dev/null) || break

  REMOTES=$(git branch -r --contains "$HASH" 2>/dev/null || true)
  if [ -n "$REMOTES" ]; then
    FORK_POINT="$HASH"
    # Take the first remote ref (trimmed)
    REMOTE_REF=$(echo "$REMOTES" | head -1 | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    break
  fi

  # Move to parent (first parent only — follows the main line)
  COMMIT="${HASH}^"
done

if [ -z "$FORK_POINT" ]; then
  exit 1
fi

FORK_SHORT=$(git rev-parse --short "$FORK_POINT")

# Build local_commits array
LOCAL_COMMITS=$(git log --format='%h%x00%s' "${FORK_POINT}..HEAD" \
  | jq -Rs '[split("\n")[] | select(. != "") | split("\u0000") | {hash: .[0], message: .[1]}]')

jq -n \
  --arg fork_point "$FORK_SHORT" \
  --arg remote_ref "$REMOTE_REF" \
  --argjson local_commits "$LOCAL_COMMITS" \
  '{fork_point: $fork_point, remote_ref: $remote_ref, local_commits: $local_commits}'
