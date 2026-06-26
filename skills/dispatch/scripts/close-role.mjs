#!/usr/bin/env node
/**
 * Close a single Router-managed pane by its @role.
 *
 * Kills the pane in the Handler's window whose @role matches the argument.
 * kill-pane SIGHUPs whatever process is running in the pane; no separate
 * Ctrl-C is needed.
 *
 * For closing all mission panes at end of mission, use close-mission.
 *
 * Usage:
 *   echo '{"role": "operator"}' | close-role
 *
 * Stdin (JSON):
 *   role — value of @role on the target pane (e.g. operator, supervisor).
 *
 * Env:
 *   TMUX_PANE — required.
 *
 * Exit codes:
 *   0  closed
 *   1  no pane with that @role in this window
 *   2  TMUX_PANE missing, or bad usage
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync(0, 'utf8'));
const role = cfg.role;
if (!role) {
  console.error('Missing required field: role');
  process.exit(2);
}

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const list = execFileSync('tmux', ['list-panes', '-t', pm, '-F', '#{pane_id} #{@role}'], { encoding: 'utf8' });
const target = list.split('\n').map(l => l.trim()).filter(Boolean)
  .map(l => l.split(/\s+/))
  .find(([, r]) => r === role)?.[0];

if (!target) {
  console.error(`No pane with @role=${role} in window of ${pm}`);
  process.exit(1);
}

execFileSync('tmux', ['kill-pane', '-t', target]);
console.log(`closed ${target} (@role=${role})`);
