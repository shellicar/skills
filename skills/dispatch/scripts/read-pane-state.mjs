#!/usr/bin/env node
/**
 * Read the state of a pane resolved by @role in the Handler's window.
 *
 * Captures the pane's visible content (no scrollback by default — scrollback
 * contains earlier content and is misleading if read as current state) and
 * classifies:
 *
 *   - idle      — bottom block is `── prompt ──` followed by 💬 input box.
 *   - in-flight — bottom block is something else (query/thinking/tools/response).
 *   - fresh     — visible area shows only the CLI startup header (no prior turn).
 *   - resumed   — prior conversation visible above the input box.
 *
 * Usage:
 *   echo '{"role": "operator"}' | read-pane-state
 *
 * Stdin (JSON):
 *   role — value of @role on the target pane (e.g. operator, supervisor).
 *
 * Stdout (JSON, single line):
 *   {"pane":"%901","role":"operator","activity":"idle","origin":"fresh"}
 *
 * Env:
 *   TMUX_PANE — required.
 *
 * Exit codes:
 *   0  classified
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

const capture = execFileSync('tmux', ['capture-pane', '-p', '-t', target], { encoding: 'utf8' });

// Activity: idle vs in-flight. The bottom block markers come from the CLI's
// rendering of the current turn state.
const bottom = capture.split('\n').slice(-25).join('\n');
const idleMarker = /── prompt ──/.test(bottom) && /💬/.test(bottom);
const activity = idleMarker ? 'idle' : 'in-flight';

// Origin: fresh vs resumed. A freshly-launched CLI shows only the startup
// header above the input box; an auto-resumed CLI shows prior conversation
// (system reminders, prior user/assistant turns).
const resumedMarkers = /(<system-reminder>|^Human:|^Assistant:)/m;
const origin = resumedMarkers.test(capture) ? 'resumed' : 'fresh';

console.log(JSON.stringify({ pane: target, role, activity, origin }));
