#!/bin/sh
# Azure DevOps REST API wrapper - JSON stdin interface
# Usage: echo '{"org":"...","project":"...","method":"GET","path":"_apis/..."}' | ado-rest.sh
#
# Required fields: org, project, method, path
# Optional fields: params (object), body (any JSON), headers (object)
#
# Exit codes:
#   1 = invalid JSON input
#   2 = missing required field
#   3 = az rest call failed (details on stderr)
#   4 = response is not valid JSON (response on stderr)

RESOURCE="499b84ac-1321-427f-aa17-267ca6975798"
BODY_FILE=""

# Read stdin
INPUT=$(cat)
if [ -z "$INPUT" ]; then
  printf 'Error: no input on stdin\n' >&2
  exit 1
fi

# Validate JSON
if ! printf '%s' "$INPUT" | jq empty 2>/dev/null; then
  printf 'Error: invalid JSON input\n' >&2
  exit 1
fi

# Extract required fields
ORG=$(printf '%s' "$INPUT" | jq -r '.org // ""')
PROJECT=$(printf '%s' "$INPUT" | jq -r '.project // ""')
METHOD=$(printf '%s' "$INPUT" | jq -r '.method // ""')
API_PATH=$(printf '%s' "$INPUT" | jq -r '.path // ""')

# Validate required fields
if [ -z "$ORG" ];      then printf 'Error: missing required field: org\n'     >&2; exit 2; fi
if [ -z "$METHOD" ];   then printf 'Error: missing required field: method\n'  >&2; exit 2; fi
if [ -z "$API_PATH" ]; then printf 'Error: missing required field: path\n'    >&2; exit 2; fi

# Build URL
if [ -n "$PROJECT" ]; then
  BASE_URL="https://dev.azure.com/${ORG}/${PROJECT}/_apis/${API_PATH}"
else
  BASE_URL="https://dev.azure.com/${ORG}/_apis/${API_PATH}"
fi

# Append query params (object keys/values joined as key=value&...)
PARAMS=$(printf '%s' "$INPUT" | jq -r 'if .params then (.params | to_entries | map("\(.key)=\(.value)") | join("&")) else "" end')
if [ -n "$PARAMS" ]; then
  URI="${BASE_URL}?${PARAMS}"
else
  URI="$BASE_URL"
fi

# Build az rest arg list
set -- --method "$METHOD" --uri "$URI" --resource "$RESOURCE"

# Body: write to temp file and pass as @file
if printf '%s' "$INPUT" | jq -e 'has("body")' > /dev/null 2>&1; then
  BODY=$(printf '%s' "$INPUT" | jq -c '.body')
  BODY_FILE=$(mktemp)
  printf '%s' "$BODY" > "$BODY_FILE"
  set -- "$@" --body "@${BODY_FILE}"
fi

# Headers: each key=value as its own --headers flag
if printf '%s' "$INPUT" | jq -e 'has("headers")' > /dev/null 2>&1; then
  while IFS= read -r header; do
    [ -n "$header" ] && set -- "$@" --headers "$header"
  done << EOF
$(printf '%s' "$INPUT" | jq -r '.headers | to_entries[] | "\(.key)=\(.value)"')
EOF
fi

# Execute — capture stdout and stderr separately so errors aren't silently dropped
TMPOUT=$(mktemp)
TMPERR=$(mktemp)
set +e
az rest "$@" >"$TMPOUT" 2>"$TMPERR"
STATUS=$?
set -e
RESULT=$(cat "$TMPOUT")
ERRMSG=$(cat "$TMPERR")
rm -f "$TMPOUT" "$TMPERR"

# Cleanup
if [ -n "$BODY_FILE" ]; then
  rm -f "$BODY_FILE"
fi

if [ $STATUS -ne 0 ]; then
  printf '❌ az rest failed (exit %s): %s %s\n' "$STATUS" "$METHOD" "$URI" >&2
  # Strip HTML body — ADO returns a full HTML page for some 404s; only show the status line
  SUMMARY=$(printf '%s' "$ERRMSG" | head -n1 | sed 's/([^{].*//')
  if [ -n "$SUMMARY" ]; then
    printf '%s\n' "$SUMMARY" >&2
  fi
  exit 3
fi

# Validate response is JSON
if ! printf '%s' "$RESULT" | jq empty 2>/dev/null; then
  printf 'Error: response is not valid JSON\n' >&2
  printf '%s\n' "$RESULT" >&2
  exit 4
fi

printf '%s\n' "$RESULT"
