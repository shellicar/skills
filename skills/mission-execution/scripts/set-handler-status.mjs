#!/usr/bin/env node
/**
 * Set @state on the Handler's window.
 *
 * Reads JSON from stdin. If no input is provided, defaults to
 * {"status": "handler-running"}.
 *
 * Usage:
 *   echo '{}'                                  | set-handler-status  # handler-running
 *   echo '{"status": "post-mortem-pending"}'    | set-handler-status
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
const status = input.status ?? 'handler-running';

execFileSync('tmux', ['set-option', '-w', '-t', pm, '@state', status]);
console.log(`@state=${status} on window of ${pm}`);
