#!/usr/bin/env node
/**
 * Launch the next phase of an existing cast — same pane, fresh CLI process.
 *
 * The pane already exists (created by new-operator-cast or
 * new-supervisor-cast). The previous cast was Ctrl-C'd after phase approval
 * and the pane is idle at the shell prompt. This script:
 *
 *   1. Sends Ctrl-C to the pane (defensive — kills any CLI still running
 *      if for some reason the cast wasn't exited cleanly).
 *   2. Updates @state on the window to <role>-pending.
 *   3. Sends the claude-sdk-cli launch command to the pane's shell.
 *
 * Envelope handling is the same temp-file-substitution pattern used by
 * new-operator-cast.
 *
 * Usage:
 *   next-phase-cast < config.json
 *
 * Stdin (JSON):
 *   {
 *     "actor": "operator",           // the actor; resolves target pane by @role
 *     "model": "claude-sonnet-4-6",
 *     "missionFile": "/path/to/mission.md",
 *     "name": "Builder",             // for --name flag; supervisor casts use "supervisor"
 *     "role": "builder",              // operator phase sub-role → roles/<role>/ROLE.md; omit for supervisor
 *     "from": "the claude-cli-cve-fix Handler",
 *     "phase": 2,                       // phase number; the envelope is fixed
 *     "iteration": 1,                   // optional, defaults to 1
 *     "effort": "high"               // optional: low|medium|high|xhigh|max
 *   }
 *
 * Stdout: target pane id.
 *
 * Env:
 *   TMUX_PANE — required.
 *
 * Exit codes:
 *   0  CLI launched
 *   1  no pane with that @role in this window
 *   2  TMUX_PANE missing, or bad config
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { launchCli } from '../../../shared/pane/launch.mjs';
import { operatorCastMessage, supervisorCastMessage } from '../../../shared/pane/templates.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = JSON.parse(readFileSync(0, 'utf8'));
for (const k of ['from', 'actor', 'model', 'missionFile', 'name', 'phase']) {
  if (!cfg[k]) {
    console.error(`config missing required field: ${k}`);
    process.exit(2);
  }
}

const list = execFileSync('tmux', ['list-panes', '-t', pm, '-F', '#{pane_id} #{@role}'], { encoding: 'utf8' });
const target = list.split('\n').map(l => l.trim()).filter(Boolean)
  .map(l => l.split(/\s+/))
  .find(([, r]) => r === cfg.actor)?.[0];

if (!target) {
  console.error(`No pane with @role=${cfg.actor} in window of ${pm}`);
  process.exit(1);
}

// Defensive Ctrl-C in case a CLI is still running. If the pane is already
// at the shell prompt this is a no-op (^C with no foreground job).
execFileSync('tmux', ['send-keys', '-t', target, 'C-c']);

const stateValue = cfg.actor === 'supervisor' ? 'sv-pending' : 'op-pending';
execFileSync('tmux', ['set-option', '-w', '-t', target, '@state', stateValue]);

// The temporal envelope is a fixed template, chosen by actor; the Handler
// supplies only phase/iteration, never prose.
const message = cfg.actor === 'supervisor'
  ? supervisorCastMessage({ phase: cfg.phase })
  : operatorCastMessage({ phase: cfg.phase, name: cfg.name, iteration: cfg.iteration });

const result = launchCli(target, {
  from: cfg.from,
  model: cfg.model,
  missionFile: cfg.missionFile,
  name: cfg.name,
  message,
  skills: cfg.skills,
  effort: cfg.effort,
  actor: cfg.actor,
  role: cfg.role,
});
if (!result.ok) {
  console.error(`claude-sdk-cli launch failed in ${target}: ${result.reason}${result.name ? ` (saw ${result.name})` : ''}`);
  process.exit(1);
}

console.log(target);
