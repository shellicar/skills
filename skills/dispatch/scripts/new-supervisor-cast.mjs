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
 *     "message": "Phase 1. ...",
 *     "effort": "high"               // optional: low|medium|high|xhigh|max
 *   }
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

import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ensureCast, getOperatorPane } from './pane.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = JSON.parse(readFileSync(0, 'utf8'));
for (const k of ['from', 'cwd', 'model', 'missionFile', 'message']) {
  if (!cfg[k]) {
    console.error(`config missing required field: ${k}`);
    process.exit(2);
  }
}

const operatorPane = getOperatorPane(pm);
if (!operatorPane) {
  console.error(`No pane with @role=operator in window of ${pm}`);
  process.exit(1);
}

const supervisorContext = getSupervisorContext({ operatorPane, targetRepo: cfg.cwd });

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
  role: 'supervisor',
  state: 'sv-pending',
  splitTarget: operatorPane,
  splitDir: '-h',
  from: cfg.from,
  cwd: superCwd,
  model: cfg.model,
  missionFile: cfg.missionFile,
  name: 'supervisor',
  message: `${cfg.message}\n\n${supervisorContext}`,
  skills: cfg.skills,
  effort: cfg.effort,
});

if (launchResult && !launchResult.ok) {
  console.error(`claude-sdk-cli launch failed in ${paneId}: ${launchResult.reason}${launchResult.lastSeen ? ` (saw ${launchResult.lastSeen})` : ''}`);
  process.exit(1);
}

console.log(paneId);

/**
 * Returns the supervisor-specific context block: how to capture the operator's
 * debrief and a note that the supervisor's cwd is a scratch directory (so the
 * target repo path in the envelope is the real one). Two pieces of context the
 * Handler cannot author and the SC shouldn't have to know about.
 */
function getSupervisorContext({ operatorPane, targetRepo }) {
  const operatorFooter = `Operator's debrief is in tmux pane ${operatorPane}. Read with \`tmux capture-pane -t ${operatorPane} -p -S -500\`.`;
  const targetRepoNote = `The target repo is at ${targetRepo}; your own working directory is a scratch directory.`;
  return `${operatorFooter}\n\n${targetRepoNote}`;
}
