#!/bin/sh
# Maintenance audit check: pnpm audit status and available dependency updates.
# Run after the preflight skill (git environment) at the start of a maintenance release.
# Outputs JSON.
#
# Usage:
#   audit-check.sh    # Run in current directory

set -eu

json_str() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/	/\\t/g' | tr '\n' ' '
}

# ── Security audit ─────────────────────────────────────────────────────────────

set +e
pnpm audit > /dev/null 2>&1
audit_rc=$?
set -e

if [ "$audit_rc" -eq 0 ]; then
  audit_status="clean"
else
  audit_status="vulnerable"
fi

# ── Available updates ──────────────────────────────────────────────────────────

updates_status="unknown"
updates_output=""
if command -v pnpm >/dev/null 2>&1; then
  set +e
  has_ncu=$(pnpm exec npm-check-updates --version 2>/dev/null)
  set -e

  if [ -n "$has_ncu" ]; then
    set +e
    ncu_output=$(pnpm exec npm-check-updates --workspaces --reject syncpack 2>&1)
    set -e

    if printf '%s' "$ncu_output" | grep -q "All dependencies match"; then
      updates_status="up_to_date"
    else
      updates_status="available"
      updates_output=$(json_str "$ncu_output")
    fi
  fi
fi

# ── Version ────────────────────────────────────────────────────────────────────

set +e
version=$(node -e "const p=require('./package.json'); process.stdout.write(p.version || 'unknown')" 2>/dev/null)
set -e

if [ -z "$version" ]; then
  version=""
  for pkg_json in packages/*/package.json; do
    if [ -f "$pkg_json" ]; then
      set +e
      v=$(node -e "const p=require('./${pkg_json}'); if(!p.private || p.private===false) process.stdout.write(p.name + '@' + p.version)" 2>/dev/null)
      set -e
      if [ -n "$v" ]; then
        version="$v"
        break
      fi
    fi
  done
fi

# ── JSON output ────────────────────────────────────────────────────────────────

printf '{'
printf '"audit":"%s"' "$audit_status"
printf ',"updates":"%s"' "$updates_status"
if [ -n "$updates_output" ]; then
  printf ',"updates_output":"%s"' "$updates_output"
fi
if [ -n "$version" ]; then
  printf ',"version":"%s"' "$version"
fi
printf '}\n'
