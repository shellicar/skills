#!/usr/bin/env node
/**
 * Scaffold the mission's panes — operator and supervisor — once, at mission
 * start. Creates panes only; no cast is launched. cast-operator and
 * cast-supervisor dispatch into these panes.
 *
 * Layout: Handler full-width at the top; operator split below the Handler
 * (vertical, full-width); supervisor split off the operator (horizontal,
 * supervisor on the right). Each pane's primary process is the user's shell,
 * so the pane survives Ctrl-C between casts.
 *
 * The operator pane's cwd is the worktree. The supervisor pane's cwd is a
 * scratch directory: claude-sdk-cli auto-loads the launch directory's
 * CLAUDE.md as operating instructions, and in the worktree that made the
 * supervisor inherit the operator's project harness. A neutral cwd loads only
 * the global ~/.claude/CLAUDE.md; the supervisor reaches the repo via the
 * envelope. (Future: pass launch config to the CLI directly rather than
 * deriving it from cwd.)
 *
 * Idempotent: an existing @role pane is kept, not duplicated.
 *
 * Usage:
 *   scaffold-panes < config.json
 *
 * Stdin (JSON):
 *   { "cwd": "/path/to/worktree" }
 *
 * Stdout: {"operatorPane":"%X","supervisorPane":"%Y"}
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  both panes exist and are tagged
 *   2  TMUX_PANE missing, or bad config
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expandPath } from '../../../shared/pane/shared.mjs';
import { findPaneByRole } from '../../../shared/pane/lookup.mjs';
import { readConfig, scaffoldConfig } from './config.mjs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = readConfig(scaffoldConfig);

function createPane(splitDir, splitTarget, cwd, role) {
  const paneId = execFileSync('tmux', [
    'split-window', splitDir, '-d', '-t', splitTarget,
    '-c', cwd,
    '-P', '-F', '#{pane_id}',
  ], { encoding: 'utf8' }).trim();
  execFileSync('tmux', ['set-option', '-p', '-t', paneId, '@role', role]);
  return paneId;
}

let operatorPane = findPaneByRole(pm, 'operator');
if (operatorPane) {
  console.error(`operator pane ${operatorPane} already exists; keeping it.`);
} else {
  operatorPane = createPane('-v', pm, expandPath(cfg.cwd), 'operator');
}

let supervisorPane = findPaneByRole(pm, 'supervisor');
if (supervisorPane) {
  console.error(`supervisor pane ${supervisorPane} already exists; keeping it.`);
} else {
  const scratchCwd = mkdtempSync(join(tmpdir(), 'supervisor-cwd-'));
  supervisorPane = createPane('-h', operatorPane, scratchCwd, 'supervisor');
}

console.log(JSON.stringify({ operatorPane, supervisorPane }));
