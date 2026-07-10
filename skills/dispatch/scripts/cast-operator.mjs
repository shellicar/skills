#!/usr/bin/env node
/**
 * Dispatch the operator for a phase iteration, into the pane scaffold-panes
 * created. Always a fresh cast, every iteration — there is no recast. The
 * previous cast's context dies with its CLI; what the new cast needs rides in
 * the envelope and the mission file.
 *
 * The rule, enforced by the config schema (config.mjs):
 *
 *   iteration 1  — `template` forbidden; the mission is reason enough.
 *   iteration >1 — `template` required; the reason this iteration exists,
 *                  riding in the fresh cast's envelope.
 *
 * Templates (fixed; the Handler picks one, never writes prose):
 *   revise           the supervisor recorded a verdict; address it.
 *   mission-updated  the mission file changed; re-read it.
 *
 * Usage:
 *   cast-operator < config.json
 *
 * Stdin (JSON):
 *   {
 *     "from": "the claude-cli-cve-fix Handler",
 *     "model": "sonnet",
 *     "missionFile": "/path/to/mission.md",
 *     "name": "Maker",
 *     "role": "maker",                  // optional sub-role → roles/<role>/ROLE.md
 *     "phase": 1,
 *     "iteration": 1,                   // 1: no template allowed
 *     "template": "revise",             // iteration >1 only, required
 *     "skills": ["claude-philosophy"],  // MANDATORY; may be empty, never absent
 *     "effort": "high"                  // optional: low|medium|high|xhigh|max
 *   }
 *
 * Stdout: {"pane":"%X","convId":"<uuid>"} — the caller keeps the conversation
 * id; it is the cast's recovery anchor.
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  dispatched (fresh cast verified)
 *   1  no operator pane (run scaffold-panes first), or CLI launch failed
 *   2  TMUX_PANE missing, or bad config
 */

import { execFileSync } from 'node:child_process';
import { launchCli } from '../../../shared/pane/launch.mjs';
import { findPaneByRole } from '../../../shared/pane/lookup.mjs';
import { operatorCastMessage, operatorReasonMessage } from '../../../shared/pane/templates.mjs';
import { readConfig, castOperatorConfig } from './config.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = readConfig(castOperatorConfig);

const target = findPaneByRole(pm, 'operator');
if (!target) {
  console.error(`No pane with @role=operator in window of ${pm}; run scaffold-panes first.`);
  process.exit(1);
}

execFileSync('tmux', ['set-option', '-w', '-t', target, '@state', 'op-pending']);

// Always a fresh cast. Defensive Ctrl-C: a no-op at an idle shell prompt,
// kills any CLI still running.
execFileSync('tmux', ['send-keys', '-t', target, 'C-c']);

let message = operatorCastMessage({ phase: cfg.phase, name: cfg.name, iteration: cfg.iteration });
if (cfg.iteration > 1) {
  message += `\n\n${operatorReasonMessage(cfg.template)}`;
}

const result = launchCli(target, {
  from: cfg.from,
  model: cfg.model,
  missionFile: cfg.missionFile,
  name: cfg.name,
  message,
  skills: cfg.skills,
  effort: cfg.effort,
  actor: 'operator',
  role: cfg.role,
});
if (!result.ok) {
  console.error(`claude-sdk-cli launch failed in ${target}: ${result.reason}${result.name ? ` (saw ${result.name})` : ''}`);
  process.exit(1);
}
// The pane and the conversation id — the caller keeps the id; it is the
// durable anchor for resuming or recovering this cast.
console.log(JSON.stringify({ pane: target, convId: result.convId }));
