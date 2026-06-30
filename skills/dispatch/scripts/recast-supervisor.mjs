#!/usr/bin/env node
/**
 * Re-prompt the active supervisor cast — load an envelope into a tmux buffer
 * keyed to the supervisor pane, paste, submit (CSI 13;5u), and set the window
 * @state to sv-pending so the status bar shows the supervisor as active.
 *
 * The message is execution context only: *why* the supervisor is being
 * re-prompted, plus the mechanical pointers it needs (the operator pane id),
 * selected from a fixed set of templates. It never carries mission content —
 * that lives in the mission file, the single source of truth. Two reasons:
 * anything sent in the envelope is not captured in the mission, and fixed,
 * small, selectable templates keep dispatch predictable. The Handler picks a
 * template; the Handler does not write prose.
 *
 * The `verify` template rebuilds the operator-pane footer that new-supervisor-cast
 * sends on first launch (resolved via getOperatorPane), so the supervisor knows
 * where to read the operator's debrief for the new iteration. Without it the
 * supervisor has no signal that the operator finished, and sits idle.
 *
 * Usage:
 *   echo '{"from": "the ... Handler", "template": "verify"}' | recast-supervisor
 *
 * Stdin (JSON):
 *   from     — sender identity, wrapped as <from>.
 *   template — which execution-context message to send. One of:
 *                verify           operator finished a new iteration; read their
 *                                 debrief (operator pane pointer included) and
 *                                 verify it, recording a new iteration verdict.
 *                mission-updated  the mission file changed; re-read it.
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  envelope delivered and submitted
 *   1  no supervisor pane in this window (or, for `verify`, no operator pane)
 *   2  TMUX_PANE missing, or bad usage (missing field, unknown template)
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { getOperatorPane } from '../../../shared/pane/lookup.mjs';
import { supervisorRecastMessage } from '../../../shared/pane/templates.mjs';

const cfg = JSON.parse(readFileSync(0, 'utf8'));

const from = cfg.from;
if (!from) {
  console.error('Missing required field: from');
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
  .find(([, r]) => r === 'supervisor')?.[0];

if (!target) {
  console.error(`No pane with @role=supervisor in window of ${pm}`);
  process.exit(1);
}

let operatorPane;
if (cfg.template === 'verify') {
  operatorPane = getOperatorPane(pm);
  if (!operatorPane) {
    console.error(`No pane with @role=operator in window of ${pm}`);
    process.exit(1);
  }
}

const message = supervisorRecastMessage(cfg.template, { operatorPane });
if (message === undefined) {
  console.error(`Unknown or missing template: ${cfg.template}. One of: verify, mission-updated`);
  process.exit(2);
}

execFileSync('tmux', ['set-option', '-w', '-t', target, '@state', 'sv-pending']);

const wrapped = `<from>\n${from}\n</from>\n<message>\n${message}\n</message>`;

execFileSync('tmux', ['load-buffer', '-b', target, '-'], { input: wrapped });
execFileSync('tmux', ['paste-buffer', '-b', target, '-t', target]);
execFileSync('tmux', ['send-keys', '-l', '-t', target, '\x1b[13;5u']);

console.log(`recast-supervisor sent to ${target} (template=${cfg.template})`);
