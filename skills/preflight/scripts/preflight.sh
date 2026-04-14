#!/bin/sh
# Preflight check for a cast.
# Run once at the start of work. Confirms the environment is what you expect.
#
# Usage:
#   preflight.sh                          # verify current state
#   preflight.sh --branch feature/foo     # create branch from origin/main if not on it
#
# Output (stdout): JSON environment report on success.
# Output (stderr): error message on failure.
#
# Exit codes:
#   0 - environment ready
#   1 - environment not ready (details on stderr)

set -e

BRANCH_NAME=""

while [ $# -gt 0 ]; do
  case "$1" in
    --branch)
      BRANCH_NAME="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

# --- Hard failures (stderr + exit) ---

# Must be in a git repo
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Not in a git repository." >&2
  exit 1
}
cd "$GIT_ROOT"

# Git identity
GIT_NAME=$(git config user.name 2>/dev/null || true)
GIT_EMAIL=$(git config user.email 2>/dev/null || true)
if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
  echo "Git identity not configured (name=$GIT_NAME, email=$GIT_EMAIL)." >&2
  exit 1
fi

# Remote reachable
if ! git ls-remote --exit-code origin HEAD >/dev/null 2>&1; then
  echo "Cannot reach remote 'origin'." >&2
  exit 1
fi

# Fetch latest
git fetch origin 2>/dev/null || {
  echo "Failed to fetch from origin." >&2
  exit 1
}

# Detect default branch
DEFAULT=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
DEFAULT=${DEFAULT:-main}

# --- Branch handling ---

CURRENT=$(git branch --show-current)
BRANCH_ACTION="none"

if [ -n "$BRANCH_NAME" ]; then
  if [ "$CURRENT" = "$BRANCH_NAME" ]; then
    BRANCH_ACTION="already_on_branch"
  else
    if ! git switch -c "$BRANCH_NAME" "origin/$DEFAULT" 2>/dev/null; then
      echo "Failed to create branch '$BRANCH_NAME' from origin/$DEFAULT." >&2
      exit 1
    fi
    CURRENT="$BRANCH_NAME"
    BRANCH_ACTION="created"
  fi
fi

# --- Environment report (JSON on stdout) ---

# Working tree status
STAGED=$(git diff --cached --name-only 2>/dev/null | jq -Rs '[split("\n")[] | select(. != "")]')
UNSTAGED=$(git diff --name-only 2>/dev/null | jq -Rs '[split("\n")[] | select(. != "")]')
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | head -20 | jq -Rs '[split("\n")[] | select(. != "")]')

# Local default branch vs origin (is local main behind?)
LOCAL_DEFAULT_SHA=$(git rev-parse "refs/heads/$DEFAULT" 2>/dev/null || echo "")
ORIGIN_DEFAULT_SHA=$(git rev-parse "refs/remotes/origin/$DEFAULT" 2>/dev/null || echo "")
DEFAULT_BEHIND=0
DEFAULT_AHEAD=0
if [ -n "$LOCAL_DEFAULT_SHA" ] && [ -n "$ORIGIN_DEFAULT_SHA" ]; then
  DIVERGENCE=$(git rev-list --left-right --count "refs/heads/$DEFAULT...refs/remotes/origin/$DEFAULT" 2>/dev/null || echo "0	0")
  DEFAULT_AHEAD=$(echo "$DIVERGENCE" | cut -f1)
  DEFAULT_BEHIND=$(echo "$DIVERGENCE" | cut -f2)
fi

# Convention detection (informational)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DETECT_SCRIPT="$SCRIPT_DIR/detect-convention.sh"
CONVENTION=""
if [ -f "$DETECT_SCRIPT" ]; then
  DETECT_OUTPUT=$("$DETECT_SCRIPT" 2>/dev/null || true)
  if [ -n "$DETECT_OUTPUT" ]; then
    CONVENTION=$(printf '%s' "$DETECT_OUTPUT" | jq -r '.convention // empty' 2>/dev/null || true)
  fi
fi

# Recent log (context for the cast)
RECENT_LOG=$(git log --oneline -5 2>/dev/null | jq -Rs '[split("\n")[] | select(. != "")]')

# Build output
jq -n \
  --arg branch "$CURRENT" \
  --arg branch_action "$BRANCH_ACTION" \
  --arg default_branch "$DEFAULT" \
  --argjson default_behind "$DEFAULT_BEHIND" \
  --argjson default_ahead "$DEFAULT_AHEAD" \
  --arg convention "$CONVENTION" \
  --arg git_name "$GIT_NAME" \
  --arg git_email "$GIT_EMAIL" \
  --argjson staged "$STAGED" \
  --argjson unstaged "$UNSTAGED" \
  --argjson untracked "$UNTRACKED" \
  --argjson recent_log "$RECENT_LOG" \
  '{
    branch: $branch,
    branch_action: $branch_action,
    default_branch: $default_branch,
    default_divergence: {ahead: $default_ahead, behind: $default_behind},
    convention: (if $convention == "" then null else $convention end),
    identity: {name: $git_name, email: $git_email},
    working_tree: {
      staged: $staged,
      unstaged: $unstaged,
      untracked: $untracked
    },
    recent_log: $recent_log
  }'
