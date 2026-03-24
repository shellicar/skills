#!/bin/bash
text=$(jq -r 'del(.tool_input.old_string) | .tool_input | tostring' 2>/dev/null)

if printf '%s' "$text" | grep -q $'\xe2\x80\x94'; then
  printf '{"decision":"block","reason":"Em dash (U+2014) detected. Authored content must match the desired writing style. Do not substitute double hyphens (--) or other dash variants. Use periods, commas, or separate sentences instead."}'
fi
