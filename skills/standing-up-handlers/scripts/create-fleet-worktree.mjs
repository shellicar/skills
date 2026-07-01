#!/usr/bin/env node
/**
 * Create a fleet-repo worktree for a per-mission Handler.
 *
 * WHY THIS EXISTS
 * Handlers run in a worktree of the *fleet* repo (claude-fleet-<fleet>--<mission>),
 * not the main checkout. `dispatch-worktree.mjs` creates the *operator's* target-repo
 * worktree (and writes the operator harness into it); nothing created the handler's
 * fleet-repo worktree — it was hand-work, never written down. This is that step,
 * captured, so it is repeatable instead of tribal.
 *
 * THE FIDDLY PART: the fleet/ submodule.
 *   - A bare `git worktree add` leaves fleet/ uninitialised and empty.
 *   - `git submodule update --init` populates it, but DETACHED at the
 *     superproject-pinned SHA.
 *   - The existing handler worktrees all carry fleet/ on the `main` branch — so a
 *     handler can commit fleet material and `fleet-sync` can keep it current — so the
 *     third step puts it there.
 * The sequence was worked out by running each step and observing the result against a
 * live reference worktree, not assumed; the final check fails loudly if fleet/ did not
 * land on main.
 *
 * Named "create" (not "launch") because it only makes the worktree. Launching the
 * handler cast in it is `launch-handler.mjs`.
 *
 * STEPS
 *   0. (if startingPoint is origin-based) git fetch origin   → ensure the base is current
 *   1. git worktree add --no-track -b <branch> <worktreePath> <startingPoint>
 *   2. (in worktree)       git submodule update --init   → populates fleet/, detached
 *   3. (in worktree/fleet) git switch main               → fleet/ onto main
 *   then read submodule status to confirm `<sha> fleet (heads/main)`.
 *   4. (in worktree) pnpm install --frozen-lockfile      → if pnpm-lock.yaml is present
 *
 * Reads JSON config from stdin:
 *   {
 *     "worktreePath":  "~/repos/shellicar/claude-fleet-eagers--system-prompt-per-query",
 *     "branch":        "feature/system-prompt-per-query",
 *     "repoPath":      "~/repos/shellicar/claude-fleet-eagers",
 *     "startingPoint": "origin/main"                              // optional
 *   }
 *
 * Required: repoPath, worktreePath, branch.
 * Optional: startingPoint (default origin/main).
 *
 * repoPath is required (no cwd default): defaulting to the working directory
 * silently branched the worktree off whichever repo the script happened to be
 * run from. Naming the repo removes that trap.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function expandPath(p) {
  if (typeof p !== "string") return p;
  return p.replace(/^~/, homedir()).replace(/^\$HOME/, homedir());
}

// Run git, letting real failures surface: a spawn error (e.g. a cwd that does not
// exist) throws with its actual cause; a non-zero exit prints git's own stderr and
// exits with git's status. No reformatting, no swallowing.
function git(args, cwd) {
  const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    if (res.stderr) process.stderr.write(res.stderr);
    process.exit(res.status);
  }
  return res.stdout;
}

function readConfig() {
  let raw;
  try {
    raw = readFileSync(0, "utf-8");
  } catch (err) {
    die(`Failed to read JSON from stdin: ${err.message}`);
  }
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (err) {
    die(`Invalid JSON on stdin: ${err.message}`);
  }
  for (const k of ["repoPath", "worktreePath", "branch"]) {
    if (!cfg[k]) die(`Missing required field: ${k}`);
  }
  return {
    repoPath: expandPath(cfg.repoPath),
    worktreePath: expandPath(cfg.worktreePath),
    branch: cfg.branch,
    startingPoint: cfg.startingPoint || "origin/main",
  };
}

const { repoPath, worktreePath, branch, startingPoint } = readConfig();
const fleetDir = join(worktreePath, "fleet");

if (startingPoint.startsWith("origin/")) {
  console.log(`\n=== Fetching origin ===`);
  git(["fetch", "origin"], repoPath);
}

console.log(`\n=== Creating fleet worktree ===`);
git(["worktree", "add", "--no-track", "-b", branch, worktreePath, startingPoint], repoPath);

console.log(`\n=== Initialising fleet/ submodule ===`);
git(["submodule", "update", "--init"], worktreePath);

console.log(`\n=== Putting fleet/ on main ===`);
git(["switch", "main"], fleetDir);

const status = git(["submodule", "status"], worktreePath).trim();
if (!status.includes("(heads/main)")) {
  die(`fleet/ did not land on main after setup: ${status}`);
}

// Install deps if this is a pnpm project — pnpm-lock.yaml is the signal (a
// package.json may not declare the manager). Errors surface; no swallowing.
if (existsSync(join(worktreePath, "pnpm-lock.yaml"))) {
  console.log(`\n=== Installing dependencies (pnpm) ===`);
  const res = spawnSync("pnpm", ["install", "--frozen-lockfile"], { cwd: worktreePath, stdio: "inherit" });
  if (res.error) throw res.error;
  if (res.status !== 0) process.exit(res.status);
}

console.log(`\n✅ Worktree ready at ${worktreePath} on branch ${branch}`);
console.log(`   submodule: ${status}`);
