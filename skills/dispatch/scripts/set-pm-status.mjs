#!/usr/bin/env node
/**
 * Set @state on the Handler's window.
 *
 * Reads JSON from stdin. If no input is provided, defaults to
 * {"status": "pm-running"}.
 *
 * Usage:
 *   echo '{}'                                  | set-pm-status  # pm-running
 *   echo '{"status": "post-mortem-pending"}'    | set-pm-status
 *
 * Env:
 *   TMUX_PANE — required; pane id of the Handler pane (set by tmux automatically).
 *
 * Exit codes:
 *   0  set
 *   2  TMUX_PANE missing (not running inside a tmux pane)
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const raw = readFileSync(0, 'utf8').trim();
const input = raw ? JSON.parse(raw) : {};
const status = input.status ?? 'pm-running';

execFileSync('tmux', ['set-option', '-w', '-t', pm, '@state', status]);
console.log(`@state=${status} on window of ${pm}`);
