#!/usr/bin/env node
/**
 * Dispatch a new supervisor cast — ensure a tagged supervisor pane exists
 * beside the operator pane (horizontal split), running claude-sdk-cli with
 * the operator's mission file attached.
 *
 * The operator pane is resolved by @role=operator in the Handler's window; the
 * supervisor splits off it.
 *
 * Idempotency lives in `ensureCast` (pane.mjs). If a supervisor pane already
 * exists in the window, it is reused. If claude-sdk-cli is already running
 * in it, a warning is written to stderr and the existing pane id is returned;
 * no relaunch. If the pane exists but the CLI is not running, the launch is
 * sent into it.
 *
 * @title and @colour are window-scoped and already set by new-operator-cast;
 * they are not set again here.
 *
 * Usage:
 *   new-supervisor-cast < config.json
 *
 * Stdin (JSON):
 *   {
 *     "cwd": "/path/to/worktree",
 *     "model": "claude-opus-4-8",
 *     "missionFile": "/path/to/mission.md",
 *     "from": "the claude-cli-cve-fix Handler",
 *     "phase": 1,                       // phase number; the envelope is fixed
 *     "skills": ["claude-philosophy"],  // MANDATORY; may be empty, never absent
 *     "operatorRole": "maker",          // MANDATORY; the operator's role — the
 *                                       // supervisor loads the same role skills
 *                                       // the operator was launched with,
 *                                       // because that set is what it judges by
 *     "effort": "high"               // optional: low|medium|high|xhigh|max
 *   }
 *
 * The config is validated against a zod schema (config.mjs); any missing or
 * unknown field exits 2.
 *
 * Stdout: pane id (e.g. %902).
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  pane exists with claude-sdk-cli running
 *   1  no operator pane in this window, or CLI launch timed out
 *   2  TMUX_PANE missing, or bad config
 */

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ensureCast } from '../../../shared/pane/launch.mjs';
import { getOperatorPane } from '../../../shared/pane/lookup.mjs';
import { supervisorCastMessage } from '../../../shared/pane/templates.mjs';
import { readConfig, supervisorConfig } from './config.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = readConfig(supervisorConfig);

const operatorPane = getOperatorPane(pm);
if (!operatorPane) {
  console.error(`No pane with @role=operator in window of ${pm}`);
  process.exit(1);
}

// TEMPORARY WORKAROUND. Launch the supervisor in a neutral scratch directory
// instead of the worktree. claude-sdk-cli auto-loads the launch directory's
// CLAUDE.md as operating instructions; in the worktree that made the supervisor
// inherit the operator's project harness. A neutral cwd loads only the global
// ~/.claude/CLAUDE.md; the supervisor reaches the repo via the envelope.
// Future: pass launch config (cwd, harness) to the CLI directly rather than
// deriving it from the cwd.
const superCwd = mkdtempSync(join(tmpdir(), 'supervisor-cwd-'));

const { paneId, launchResult } = ensureCast({
  pm,
  actor: 'supervisor',
  state: 'sv-pending',
  splitTarget: operatorPane,
  splitDir: '-h',
  from: cfg.from,
  cwd: superCwd,
  model: cfg.model,
  missionFile: cfg.missionFile,
  name: 'supervisor',
  message: supervisorCastMessage({ phase: cfg.phase }),
  skills: cfg.skills,
  effort: cfg.effort,
  // Mirror the operator's role: launchCli unions roleSkills(role) into the
  // cast, so the supervisor judges with the same skill set the operator had.
  role: cfg.operatorRole,
});

if (launchResult && !launchResult.ok) {
  console.error(`claude-sdk-cli launch failed in ${paneId}: ${launchResult.reason}${launchResult.lastSeen ? ` (saw ${launchResult.lastSeen})` : ''}`);
  process.exit(1);
}

console.log(paneId);
