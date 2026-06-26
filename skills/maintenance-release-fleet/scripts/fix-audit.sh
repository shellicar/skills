#!/bin/sh
# Fix pnpm audit vulnerabilities surgically (pnpm 11+).
#
# Runs `pnpm audit --fix=update` — patches the vulnerable lockfile entries
# directly, no overrides: no override-chaining (pnpm#6774), no lockfile/
# node_modules nuke, no version drift. Then re-audits and stops if anything
# remains, so residue is surfaced rather than silently left.
#
# Majors and other set-aside advisories are handled in the skill workflow
# (auditConfig.ignoreGhsas) BEFORE this runs — `--fix=update` honours the
# ignore list, so anything listed there is skipped here.
#
# Requires pnpm 11+ (--fix=update is v11; 10.x audit --fix can't reach
# transitive deps). Update pnpm first.
#
# Usage:   fix-audit.sh            fix, then verify
#          fix-audit.sh --check    verify only
#
# Exit:    0  clean      1  vulnerabilities remain (STOP)      2  bad env

set -e

CHECK_ONLY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --check) CHECK_ONLY=1; shift ;;
    -h|--help) sed -n '/^#/!q;s/^# \{0,1\}//p' "$0" | tail -n +2; exit 0 ;;
    *) printf "❌ Unknown option: %s\n" "$1" >&2; exit 2 ;;
  esac
done

[ -f pnpm-workspace.yaml ] || { printf "❌ No pnpm-workspace.yaml in the current directory\n" >&2; exit 2; }

major="$(pnpm --version | cut -d. -f1)"
case "$major" in ''|*[!0-9]*) printf "❌ Cannot read pnpm version (%s)\n" "$(pnpm --version)" >&2; exit 2 ;; esac
[ "$major" -ge 11 ] || { printf "❌ pnpm %s — needs 11+ (10.x audit --fix misses transitive deps). Update pnpm first.\n" "$(pnpm --version)" >&2; exit 2; }

if [ "$CHECK_ONLY" -eq 1 ]; then
  printf "🔍 Checking audit...\n"
  if pnpm audit; then printf "✅ Clean\n"; exit 0; else printf "❌ Vulnerabilities present\n" >&2; exit 1; fi
fi

printf "🔧 pnpm audit --fix=update...\n"
pnpm audit --fix=update 2>&1 || true

printf "\n🔍 Verifying...\n"
if pnpm audit; then
  printf "\n✅ Audit clean\n"; exit 0
else
  printf "\n❌ Vulnerabilities remain after --fix=update — STOP and surface to the SC (residue may need a major decision or a targeted override).\n" >&2
  exit 1
fi
