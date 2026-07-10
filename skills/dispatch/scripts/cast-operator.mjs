#!/usr/bin/env node
/**
 * Dispatch the operator for a phase iteration, into the pane scaffold-panes
 * created. The default is a fresh cast; resuming the running cast is the
 * exception, and only exists here because the operator's in-flight context is
 * sometimes the point (a revise resumes the work in progress).
 *
 * The rule, enforced by the config schema (config.mjs):
 *
 *   iteration 1  — always a fresh cast. `template` and `resume` are forbidden.
 *   iteration >1 — `template` and `resume` are both required.
 *                    resume: false — Ctrl-C, fresh cast; the template rides in
 *                                    the new cast's envelope so it knows why it
 *                                    exists.
 *                    resume: true  — no new process; the template is pasted
 *                                    into the running cast and submitted.
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
 *     "iteration": 1,                   // 1: fresh, nothing else allowed
 *     "template": "revise",             // iteration >1 only, required
 *     "resume": true,                   // iteration >1 only, required
 *     "skills": ["claude-philosophy"],  // MANDATORY; may be empty, never absent
 *     "effort": "high"                  // optional: low|medium|high|xhigh|max
 *   }
 *
 * Stdout: {"pane":"%X","convId":"<uuid>"} for a fresh cast — the caller keeps
 * the conversation id; it is the cast's recovery anchor. A resume: true
 * re-trigger prints the pane id only (the conversation already exists).
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  dispatched (fresh cast verified, or resume message submitted)
 *   1  no operator pane (run scaffold-panes first), or CLI launch failed
 *   2  TMUX_PANE missing, or bad config
 */

import { execFileSync } from 'node:child_process';
import { launchCli } from '../../../shared/pane/launch.mjs';
import { findPaneByRole } from '../../../shared/pane/lookup.mjs';
import { operatorCastMessage, operatorRecastMessage } from '../../../shared/pane/templates.mjs';
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

if (cfg.iteration > 1 && cfg.resume) {
  // Resume: the running cast keeps its context; the template tells it why it
  // is being re-triggered. Paste and submit — no new process.
  const message = `You are now iteration ${cfg.iteration}.\n\n${operatorRecastMessage(cfg.template)}`;
  const wrapped = `<from>\n${cfg.from}\n</from>\n<message>\n${message}\n</message>`;
  execFileSync('tmux', ['load-buffer', '-b', target, '-'], { input: wrapped });
  execFileSync('tmux', ['paste-buffer', '-b', target, '-t', target]);
  execFileSync('tmux', ['send-keys', '-l', '-t', target, '\x1b[13;5u']);
  console.log(target);
} else {
  // Fresh cast (iteration 1, or iteration >1 with resume: false). Defensive
  // Ctrl-C: a no-op at an idle shell prompt, kills any CLI still running.
  execFileSync('tmux', ['send-keys', '-t', target, 'C-c']);

  let message = operatorCastMessage({ phase: cfg.phase, name: cfg.name, iteration: cfg.iteration });
  if (cfg.iteration > 1) {
    message += `\n\n${operatorRecastMessage(cfg.template)}`;
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
}
