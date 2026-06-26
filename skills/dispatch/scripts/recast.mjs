#!/usr/bin/env node
/**
 * Re-prompt an active cast — load envelope from stdin into a tmux buffer
 * keyed to the target pane, paste into the pane, submit (CSI 13;5u).
 *
 * The target pane is resolved by @role in the Handler's window (via $TMUX_PANE).
 * The buffer name is the target pane id, so concurrent recasts targeting
 * different panes do not collide.
 *
 * Usage:
 *   echo '{"role": "operator", "from": "the ... Handler", "message": "..."}' | recast
 *
 * Stdin (JSON):
 *   role     — value of @role on the target pane (e.g. operator, supervisor).
 *   from     — sender identity, wrapped as <from>.
 *   message  — message text (multi-line string), wrapped as <message>.
 *
 * Env:
 *   TMUX_PANE — required.
 *
 * Exit codes:
 *   0  envelope delivered and submitted
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

const from = cfg.from;
if (!from) {
  console.error('Missing required field: from');
  process.exit(2);
}

const message = cfg.message;
if (!message) {
  console.error('Missing required field: message');
  process.exit(2);
}

const wrapped = `<from>\n${from}\n</from>\n<message>\n${message}\n</message>`;

execFileSync('tmux', ['load-buffer', '-b', target, '-'], { input: wrapped });
execFileSync('tmux', ['paste-buffer', '-b', target, '-t', target]);
execFileSync('tmux', ['send-keys', '-l', '-t', target, '\x1b[13;5u']);

console.log(`recast sent to ${target} (@role=${role})`);
