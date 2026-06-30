// Pane process inspection: what is running in a pane, and waiting for the CLI to
// come up after a launch.

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { sleep } from './shared.mjs';

// The foreground process name that means "the cast is running".
export const PREFERRED = 'claude-sdk-cli';

// Optional debug trace: set LAUNCH_VERIFY_DEBUG=/path/to/log to record every
// process-name resolution, for diagnosing why a launch did or did not verify.
function dbg(line) {
  const path = process.env.LAUNCH_VERIFY_DEBUG;
  if (path) {
    try { appendFileSync(path, `${new Date().toISOString()} ${line}\n`); } catch {}
  }
}

export function paneProcessName(paneId) {
  let panePid;
  try {
    panePid = execFileSync('tmux', ['display-message', '-p', '-t', paneId, '#{pane_pid}'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }

  // The cast runs a couple of levels below the pane's shell:
  // shell → node launcher → claude-sdk-cli. Walk the child chain and return the
  // cast's name as soon as it appears.
  let pid = panePid;
  let last = null;
  for (let depth = 0; pid && depth < 4; depth++) {
    const comm = readComm(pid);
    dbg(`paneProcessName(${paneId}): depth=${depth} pid=${pid} comm=${comm}`);
    if (comm === PREFERRED) return comm;
    if (comm) last = comm;
    pid = firstChild(pid);
  }
  return last;
}

/**
 * Poll the pane's foreground process until one of the settled outcomes:
 *
 *   { ok: true,  name: 'claude-sdk-cli' }       — CLI stable for stabilityMs.
 *   { ok: false, reason: 'pane-gone' }          — pane no longer exists.
 *   { ok: false, reason: 'timeout', lastSeen }  — CLI not stable within timeoutMs.
 */
export function waitForClaudeSdkCli(paneId, { pollMs = 250, stabilityMs = 1000, timeoutMs = 10000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let cliStableStart = null;
  let lastSeen = null;

  while (Date.now() < deadline) {
    const comm = paneProcessName(paneId);

    if (comm === null) return { ok: false, reason: 'pane-gone' };

    lastSeen = comm;

    if (comm === PREFERRED) {
      if (cliStableStart === null) cliStableStart = Date.now();
      if (Date.now() - cliStableStart >= stabilityMs) {
        return { ok: true, name: comm };
      }
    } else {
      // Shell or transient: keep polling until the CLI takes over or we time out.
      cliStableStart = null;
    }

    sleep(pollMs);
  }

  return { ok: false, reason: 'timeout', lastSeen };
}

function readComm(pid) {
  try {
    const comm = execFileSync('ps', ['-o', 'comm=', '-p', String(pid)],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return comm.split('/').pop();
  } catch {
    return null;
  }
}

function firstChild(parentPid) {
  try {
    return execFileSync('pgrep', ['-P', String(parentPid)],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      .split('\n').filter(Boolean)[0];
  } catch {
    return null;
  }
}
