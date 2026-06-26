#!/usr/bin/env node
/**
 * Close the mission — destroy the operator and supervisor panes in the
 * Handler's window.
 *
 * Kills any pane in this window whose @role is `operator` or `supervisor`.
 * The Handler pane is left alone (it has @role=pm or no @role set; either way
 * it does not match).
 *
 * If neither pane is present, the script reports that and exits 1 —
 * called-at-wrong-time is a caller bug worth surfacing, not silent success.
 *
 * For closing a single pane by role, use close-role.
 *
 * Usage:
 *   close-mission
 *
 * Env:
 *   TMUX_PANE — required.
 *
 * Exit codes:
 *   0  one or more panes closed
 *   1  nothing to close (no operator or supervisor panes in this window)
 *   2  TMUX_PANE missing
 */

import { execFileSync } from 'node:child_process';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const list = execFileSync('tmux', ['list-panes', '-t', pm, '-F', '#{pane_id} #{@role}'], { encoding: 'utf8' });
const targets = list.split('\n').map(l => l.trim()).filter(Boolean)
  .map(l => l.split(/\s+/))
  .filter(([, r]) => r === 'operator' || r === 'supervisor');

if (targets.length === 0) {
  console.error(`No operator or supervisor panes in window of ${pm} (nothing to close)`);
  process.exit(1);
}

for (const [pane, role] of targets) {
  execFileSync('tmux', ['kill-pane', '-t', pane]);
  console.log(`closed ${pane} (@role=${role})`);
}
