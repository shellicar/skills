// SC-only guard. Import for side effect at the top of every script in
// scripts/ — this directory is the SC's; no cast runs these.
//
// Mechanism: everything a Claude session executes has `claude-sdk-cli` in its
// process ancestry; the SC's interactive shell never does. Walk the ppid chain
// and refuse on sight. A detached double-fork could orphan itself off the
// chain, so this is a fence, not a wall — the material carries the rule; this
// makes the ordinary path refuse by itself.

import { execFileSync } from 'node:child_process';

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
