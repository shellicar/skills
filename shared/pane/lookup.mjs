// Find panes in the Handler's window by role, and read a pane's cwd.

import { execFileSync } from 'node:child_process';

export function findPaneByRole(pm, role) {
  const list = execFileSync('tmux', ['list-panes', '-t', pm, '-F', '#{pane_id} #{@role}'], { encoding: 'utf8' });
  return list.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => l.split(/\s+/))
    .find(([, r]) => r === role)?.[0];
}

/**
 * Look up the operator pane in the Handler's window (by @role=operator).
 * Returns the pane id (e.g. '%201') or undefined if there isn't one.
 */
export function getOperatorPane(pm) {
  return findPaneByRole(pm, 'operator');
}

// The cwd of a pane's foreground process — the worktree, for an operator pane.
export function paneCwd(paneId) {
  try {
    return execFileSync('tmux', ['display-message', '-p', '-t', paneId, '#{pane_current_path}'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}
