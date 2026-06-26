#!/usr/bin/env node
/**
 * Query the Handler's window — one line per pane with formatted fields.
 *
 * Returns everything the Router needs about the panes in this window:
 * pane id, pid, @role, window name, current command, cwd.
 *
 * Used as a pre-flight inspection. If a pane the Router expected to find
 * is missing from the output, it is gone.
 *
 * The window is resolved via $TMUX_PANE.
 *
 * Usage:
 *   query-window
 *
 * Output (stdout, one line per pane):
 *   %901 pid=12345 role=operator window=easyquote-cves cmd=node cwd=/path/to/worktree
 *
 * Env:
 *   TMUX_PANE — required.
 *
 * Exit codes:
 *   0  query succeeded (output may be empty if no panes match)
 *   2  TMUX_PANE missing
 */

import { execFileSync } from 'node:child_process';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const out = execFileSync('tmux', [
  'list-panes', '-t', pm,
  '-F', '#{pane_id} pid=#{pane_pid} role=#{@role} window=#{window_name} cmd=#{pane_current_command} cwd=#{pane_current_path}',
], { encoding: 'utf8' });

process.stdout.write(out);
