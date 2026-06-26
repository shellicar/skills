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
 *     "role": "operator",            // resolves target pane by @role
 *     "model": "claude-sonnet-4-6",
 *     "missionFile": "/path/to/mission.md",
 *     "name": "Builder",             // for --name flag; supervisor casts use "supervisor"
 *     "from": "the claude-cli-cve-fix Handler",
 *     "message": "Phase 2, iteration 1. ...",
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
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { waitForClaudeSdkCli, buildPrompt, effortFlag, cleanupPrompt } from './pane.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = JSON.parse(readFileSync(0, 'utf8'));
for (const k of ['from', 'role', 'model', 'missionFile', 'name', 'message']) {
  if (!cfg[k]) {
    console.error(`config missing required field: ${k}`);
    process.exit(2);
  }
}

const list = execFileSync('tmux', ['list-panes', '-t', pm, '-F', '#{pane_id} #{@role}'], { encoding: 'utf8' });
const target = list.split('\n').map(l => l.trim()).filter(Boolean)
  .map(l => l.split(/\s+/))
  .find(([, r]) => r === cfg.role)?.[0];

if (!target) {
  console.error(`No pane with @role=${cfg.role} in window of ${pm}`);
  process.exit(1);
}

const prompt = buildPrompt({ from: cfg.from, message: cfg.message, skills: cfg.skills, missionPath: cfg.missionFile });
const tmp = mkdtempSync(join(tmpdir(), 'router-prompt-'));
const promptPath = join(tmp, 'prompt');
writeFileSync(promptPath, prompt);

const launch = `claude-sdk-cli --name ${shq(cfg.name)} --model ${shq(cfg.model)}${effortFlag(cfg.effort)} --prompt "$(cat ${shq(promptPath)})" --no-resume`;

// Defensive Ctrl-C in case a CLI is still running. If the pane is already
// at the shell prompt this is a no-op (^C with no foreground job).
execFileSync('tmux', ['send-keys', '-t', target, 'C-c']);

const stateValue = cfg.role === 'supervisor' ? 'sv-pending' : 'op-pending';
execFileSync('tmux', ['set-option', '-w', '-t', target, '@state', stateValue]);

execFileSync('tmux', ['send-keys', '-t', target, launch, 'Enter']);

const result = waitForClaudeSdkCli(target);
cleanupPrompt(tmp, promptPath, result);
if (!result.ok) {
  console.error(`claude-sdk-cli launch failed in ${target}: ${result.reason}${result.name ? ` (saw ${result.name})` : ''}`);
  process.exit(1);
}

console.log(target);

function shq(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}
