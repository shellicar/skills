#!/usr/bin/env node
/**
 * Re-prompt the active operator cast — load an envelope into a tmux buffer
 * keyed to the operator pane, paste, submit (CSI 13;5u), and set the window
 * @state to op-pending so the status bar shows the operator as active.
 *
 * The message is execution context only: *why* the operator is being
 * re-prompted, selected from a fixed set of templates. It never carries mission
 * content — that lives in the mission file, the single source of truth. Two
 * reasons: anything sent in the envelope is not captured in the mission, and
 * fixed, small, selectable templates keep dispatch predictable. The Handler
 * picks a template; the Handler does not write prose.
 *
 * Usage:
 *   echo '{"from": "the ... Handler", "template": "mission-updated"}' | recast-operator
 *
 * Stdin (JSON):
 *   from     — sender identity, wrapped as <from>.
 *   template — which execution-context message to send. One of:
 *                mission-updated  the mission file changed; re-read it.
 *                revise           the supervisor recorded a verdict; address it.
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  envelope delivered and submitted
 *   1  no operator pane in this window
 *   2  TMUX_PANE missing, or bad usage (missing field, unknown template)
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { operatorRecastMessage } from '../../../shared/pane/templates.mjs';

const cfg = JSON.parse(readFileSync(0, 'utf8'));

const from = cfg.from;
if (!from) {
  console.error('Missing required field: from');
  process.exit(2);
}

const message = operatorRecastMessage(cfg.template);
if (!message) {
  console.error(`Unknown or missing template: ${cfg.template}. One of: mission-updated, revise`);
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
  .find(([, r]) => r === 'operator')?.[0];

if (!target) {
  console.error(`No pane with @role=operator in window of ${pm}`);
  process.exit(1);
}

execFileSync('tmux', ['set-option', '-w', '-t', target, '@state', 'op-pending']);

const wrapped = `<from>\n${from}\n</from>\n<message>\n${message}\n</message>`;

execFileSync('tmux', ['load-buffer', '-b', target, '-'], { input: wrapped });
execFileSync('tmux', ['paste-buffer', '-b', target, '-t', target]);
execFileSync('tmux', ['send-keys', '-l', '-t', target, '\x1b[13;5u']);

console.log(`recast-operator sent to ${target} (template=${cfg.template})`);
