// The claude-sdk-cli thinking-effort flag.

import { shq } from './shared.mjs';

// Valid effort values, mirrored from claude-sdk-cli so the Router rejects a bad
// value before launch. Effort tunes time and tokens spent, not capability;
// omitting it leaves the CLI's configured default.
export const EFFORT_VALUES = ['low', 'medium', 'high', 'xhigh', 'max'];

// The --config flag for a thinking effort, or '' when none is given. Exits 2 on
// an unrecognised value so a typo in a mission's Effort field is caught here
// rather than silently ignored at the CLI.
export function effortFlag(effort) {
  if (effort === undefined || effort === null || effort === '') return '';
  if (!EFFORT_VALUES.includes(effort)) {
    console.error(`invalid effort "${effort}"; expected one of: ${EFFORT_VALUES.join(', ')}`);
    process.exit(2);
  }
  return ` --config ${shq(JSON.stringify({ thinking: { effort } }))}`;
}
