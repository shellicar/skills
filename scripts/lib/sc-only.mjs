// SC-only guard for the guarded spawn of claude-sdk-cli. The start-* launchers
// import spawnCli and call it as their final step; only that call is SC-only, so
// a --doctor run — which returns before it — is open to anyone, Claude included.
//
// Mechanism: everything a Claude session executes has `claude-sdk-cli` in its
// process ancestry; the SC's interactive shell never does. Walk the ppid chain
// and refuse on sight. A detached double-fork could orphan itself off the
// chain, so this is a fence, not a wall — the material carries the rule; this
// makes the ordinary path refuse by itself.

import { execFileSync, spawnSync } from 'node:child_process';

function parentOf(pid) {
  try {
    const out = execFileSync('ps', ['-o', 'ppid=,comm=', '-p', String(pid)], { encoding: 'utf8' }).trim();
    if (!out) return null;
    const m = out.match(/^\s*(\d+)\s+(.*)$/);
    return m ? { ppid: Number(m[1]), comm: m[2] } : null;
  } catch {
    return null;
  }
}

// Refuse if a Claude session is in this process's ancestry (exit 13).
function refuseIfClaude() {
  let pid = process.pid;
  for (let hops = 0; hops < 32; hops++) {
    const p = parentOf(pid);
    if (!p || p.ppid <= 1) break;
    if (p.comm.includes('claude-sdk-cli')) {
      console.error('This is the SC\'s script. Claude does not run it. Stop, and report what led you here.');
      process.exit(13);
    }
    pid = p.ppid;
  }
}

/**
 * Launch claude-sdk-cli interactively in this pane and exit with its status.
 * Guards first: refuses when a Claude session is in the process ancestry, so
 * the real launch stays SC-only. --doctor returns before this call, so the
 * doctor path is reachable by anyone.
 */
export function spawnCli(args) {
  refuseIfClaude();
  const result = spawnSync('claude-sdk-cli', args, { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
