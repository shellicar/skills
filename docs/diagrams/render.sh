#!/usr/bin/env bash
# Regenerate the fleet model diagrams from their D2 sources.
# Renders every *.d2 here to a same-named .svg. Dark theme is baked in.
# Usage:  ./render.sh
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v d2 >/dev/null 2>&1; then
  echo "error: d2 is not on PATH (install: brew install d2)" >&2
  exit 1
fi
for src in *.d2; do
  case "$src" in _*) continue ;; esac
  out="${src%.d2}.svg"
  echo "rendering ${src} -> ${out}"
  d2 "${src}" "${out}"
done
echo "done."
