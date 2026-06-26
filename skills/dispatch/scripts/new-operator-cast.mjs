#!/usr/bin/env node
/**
 * Dispatch a new operator cast — ensure a tagged operator pane exists below
 * the Handler, running claude-sdk-cli with the mission file attached.
 *
 * @title and @colour are window-level mission identity, set by start-mission
 * before this script runs.
 *
 * Idempotency lives in `ensureCast` (pane.mjs). If an operator pane already
 * exists in the Handler's window, it is reused (no second pane is created). If
 * claude-sdk-cli is already running in it, a warning is written to stderr
 * and the existing pane id is returned; no relaunch. If the pane exists but
 * the CLI is not running (shell idle), the launch is sent into the existing
 * pane.
 *
 * The pane is created with the user's shell as its primary process, so it
 * survives Ctrl-C between phases — next-phase-cast can then relaunch the
 * CLI in the same pane. claude-sdk-cli runs as a child of that shell.
 *
 * Usage:
 *   new-operator-cast < config.json
 *
 * Stdin (JSON):
 *   {
 *     "cwd": "/path/to/worktree",
 *     "model": "claude-sonnet-4-6",
 *     "missionFile": "/path/to/mission.md",
 *     "name": "Maker",
 *     "from": "the claude-cli-cve-fix Handler",
 *     "message": "Phase 1, iteration 1. ...",
 *     "effort": "high"               // optional: low|medium|high|xhigh|max
 *   }
 *
 * Stdout: pane id (e.g. %901). Same id whether newly created or reused.
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  pane exists with claude-sdk-cli running (created, reused, or already-running)
 *   1  CLI launch timed out (pane created or reused, but CLI never stabilised)
 *   2  TMUX_PANE missing, or bad config
 */

import { readFileSync } from 'node:fs';
import { ensureCast } from './pane.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = JSON.parse(readFileSync(0, 'utf8'));
for (const k of ['from', 'cwd', 'model', 'missionFile', 'name', 'message']) {
  if (!cfg[k]) {
    console.error(`config missing required field: ${k}`);
    process.exit(2);
  }
}

const { paneId, launchResult } = ensureCast({
  pm,
  from: cfg.from,
  role: 'operator',
  state: 'op-pending',
  splitTarget: pm,
  splitDir: '-v',
  cwd: cfg.cwd,
  model: cfg.model,
  missionFile: cfg.missionFile,
  name: cfg.name,
  message: cfg.message,
  skills: cfg.skills,
  effort: cfg.effort,
});

if (launchResult && !launchResult.ok) {
  console.error(`claude-sdk-cli launch failed in ${paneId}: ${launchResult.reason}${launchResult.lastSeen ? ` (saw ${launchResult.lastSeen})` : ''}`);
  process.exit(1);
}

console.log(paneId);
