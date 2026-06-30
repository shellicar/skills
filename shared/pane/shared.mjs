// Generic path and shell helpers shared across the pane modules.

import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

export function expandPath(p) {
  if (typeof p !== 'string') return p;
  return p.replace(/^~/, homedir()).replace(/^\$HOME/, homedir());
}

// Block for `ms` milliseconds via the `sleep` binary (these Router scripts are
// synchronous, so there is no async timer to await).
export function sleep(ms) {
  execFileSync('sleep', [String(ms / 1000)]);
}

// Single-quote a string for safe interpolation into a shell command.
export function shq(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}
