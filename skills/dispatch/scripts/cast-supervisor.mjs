#!/usr/bin/env node
/**
 * Dispatch the supervisor for a phase iteration, into the pane scaffold-panes
 * created. Always a fresh cast, every iteration, no exceptions: there is no
 * recast supervisor. The supervisor's value is fresh eyes; a supervisor that
 * re-judges with its own last verdict in context is not that. The config
 * schema has no `resume` field, so a recast is unrepresentable.
 *
 * The rule, enforced by the config schema (config.mjs):
 *
 *   iteration 1  — no `template`; the first verification is self-evident.
 *   iteration >1 — `template` required; it names why this iteration exists
 *                  and rides in the fresh cast's envelope:
 *                    verify           the operator completed a new iteration;
 *                                     verify it, record a new iteration block.
 *                    mission-updated  the mission changed (e.g. the SC's
 *                                     objection or updated criteria);
 *                                     re-verify against it.
 *
 * The envelope tells the cast so: it is only ever a cast, and its context is
 * the whole of it. launchCli appends the operator-debrief pointer and the
 * target-repo note (resolved from the live panes) to every supervisor cast.
 *
 * Usage:
 *   cast-supervisor < config.json
 *
 * Stdin (JSON):
 *   {
 *     "from": "the claude-cli-cve-fix Handler",
 *     "model": "sonnet",
 *     "missionFile": "/path/to/mission.md",
 *     "phase": 1,
 *     "iteration": 2,                   // which verification this cast performs
 *     "template": "verify",             // iteration >1 only, required
 *     "operatorRole": "maker",          // MANDATORY; the operator's role — the
 *                                       // supervisor loads the same role skills
 *                                       // the operator was launched with,
 *                                       // because that set is what it judges by
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
 *   0  fresh supervisor cast verified running
 *   1  no supervisor pane (run scaffold-panes first), or CLI launch failed
 *   2  TMUX_PANE missing, or bad config
 */

import { execFileSync } from 'node:child_process';
import { launchCli } from '../../../shared/pane/launch.mjs';
import { findPaneByRole } from '../../../shared/pane/lookup.mjs';
import { supervisorCastMessage, supervisorReasonMessage } from '../../../shared/pane/templates.mjs';
import { readConfig, castSupervisorConfig } from './config.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = readConfig(castSupervisorConfig);

const target = findPaneByRole(pm, 'supervisor');
if (!target) {
  console.error(`No pane with @role=supervisor in window of ${pm}; run scaffold-panes first.`);
  process.exit(1);
}

execFileSync('tmux', ['set-option', '-w', '-t', target, '@state', 'sv-pending']);

// Always fresh: Ctrl-C whatever is running (a no-op at an idle shell prompt),
// then launch a new CLI. The previous supervisor's context dies with it —
// that is the point.
execFileSync('tmux', ['send-keys', '-t', target, 'C-c']);

// The envelope: the temporal line, plus — at iteration >1 — the reason this
// iteration exists (the template), so a fresh cast knows whether it is
// verifying a new operator iteration or re-verifying against a changed mission.
let message = supervisorCastMessage({ phase: cfg.phase, iteration: cfg.iteration });
if (cfg.iteration > 1) {
  message += `\n\n${supervisorReasonMessage(cfg.template)}`;
}

const result = launchCli(target, {
  from: cfg.from,
  model: cfg.model,
  missionFile: cfg.missionFile,
  name: 'supervisor',
  message,
  skills: cfg.skills,
  effort: cfg.effort,
  actor: 'supervisor',
  // Mirror the operator's role: launchCli unions roleSkills(role) into the
  // cast, so the supervisor judges with the same skill set the operator had.
  role: cfg.operatorRole,
});
if (!result.ok) {
  console.error(`claude-sdk-cli launch failed in ${target}: ${result.reason}${result.name ? ` (saw ${result.name})` : ''}`);
  process.exit(1);
}

// The pane and the conversation id — the caller keeps the id; it is the
// durable anchor for resuming or recovering this cast.
console.log(JSON.stringify({ pane: target, convId: result.convId }));
