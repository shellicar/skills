#!/usr/bin/env node
/**
 * Reclaim a worktree after a mission is done — the mirror of dispatch-worktree.
 *
 * dispatch-worktree creates a worktree on a new branch; this removes it and
 * deletes the branch.
 *
 * Deliberately NOT part of close-mission. close-mission tears down the casts
 * when they finish, which is earlier than the worktree is safe to discard —
 * the tree is still needed through review, merge, and any follow-up. Reclaim
 * runs at true mission-done, as its own explicit step.
 *
 * Worktree removal: `git worktree remove` (no --force) already refuses if the
 * tree has modified or untracked tracked files. That guard is git's; we keep
 * it. If it refuses, the script reports and stops — forcing past it is an SC
 * escalation, never a flag the script carries.
 *
 * Branch deletion is layered, so one tool handles both a known mission-complete
 * close and an uncertain cleanup without being told which:
 *   1. `git branch -d` first. Succeeds when the branch has nothing to lose —
 *      never moved off main, aborted with no commits, a true fast-forward.
 *      Cheap, no network, no PR required.
 *   2. If -d refuses (commits not in local main — the normal shipped-via-PR
 *      case, where a squash-merge or a local main behind the remote merge hides
 *      the merge from -d), verify against the merged PR's head SHA via gh — the
 *      authoritative source — and `git branch -D` only on an exact match. The
 *      -D is proof-gated, not blind force.
 *   3. If no merged PR is confirmed, or its head SHA != the local tip, the
 *      branch is genuinely undecided (e.g. aborted work that was committed).
 *      Refuse and leave it to the SC.
 *
 * This couples branch deletion to gh + network + a merged PR existing — fine
 * for this fleet (every mission ships via a PR), and the -d first pass means
 * the no-PR cases still reclaim cleanly without it.
 *
 * Reads JSON config from stdin:
 *   {
 *     "repoPath": "/path/to/main/checkout",
 *     "worktreePath": "/path/to/worktree",
 *     "branch": "<branch-name>"   // optional; deleted if provided
 *   }
 *
 * Required: repoPath, worktreePath.
 * Optional: branch.
 *
 * Usage:
 *   echo '{"repoPath":"...","worktreePath":"...","branch":"..."}' | \
 *     node scripts/reclaim-worktree.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function expandPath(p) {
  if (typeof p !== "string") return p;
  return p.replace(/^~/, process.env.HOME).replace(/^\$HOME/, process.env.HOME);
}

function git(args, cwd) {
  const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
  return { status: res.status, stdout: res.stdout || "", stderr: res.stderr || "" };
}

function readConfig() {
  let rawInput;
  try {
    rawInput = readFileSync(0, "utf-8");
  } catch (err) {
    die(`Failed to read JSON from stdin: ${err.message}`);
  }

  let config;
  try {
    config = JSON.parse(rawInput);
  } catch (err) {
    die(`Invalid JSON on stdin: ${err.message}`);
  }

  const required = ["repoPath", "worktreePath"];
  const missing = required.filter((k) => !config[k]);
  if (missing.length > 0) {
    die(`Missing required field(s): ${missing.join(", ")}`);
  }

  return {
    repoPath: expandPath(config.repoPath),
    worktreePath: expandPath(config.worktreePath),
    branch: config.branch || null,
  };
}

function removeWorktree({ repoPath, worktreePath }) {
  console.log(`\n=== Removing worktree ===`);
  const res = git(["worktree", "remove", worktreePath], repoPath);
  if (res.status !== 0) {
    die(
      `git worktree remove refused:\n${(res.stderr || res.stdout || "").trim()}\n\n` +
        `The tree has changes git won't discard on its own. Resolve them first. If you\n` +
        `mean to throw them away, that's a --force — escalate to the SC.`,
    );
  }
  console.log(`Removed ${worktreePath}`);
}

function mergedPrHeadSha(repoPath, branch) {
  const res = spawnSync(
    "gh",
    ["pr", "list", "--head", branch, "--state", "merged", "--json", "headRefOid", "--jq", ".[0].headRefOid // empty"],
    { cwd: repoPath, encoding: "utf-8" },
  );
  if (res.status !== 0) return null; // gh missing, unauthed, or error — treat as unconfirmed
  return (res.stdout || "").trim() || null;
}

function deleteBranch({ repoPath, branch }) {
  if (!branch) return;
  console.log(`\n=== Deleting branch ===`);

  // 1. Safe delete first — succeeds when there is nothing to lose.
  const safe = git(["branch", "-d", branch], repoPath);
  if (safe.status === 0) {
    console.log(`Deleted branch ${branch} (no unmerged commits)`);
    return;
  }

  // 2. -d refused: the branch has commits not in local main. Verify against the
  //    merged PR's head SHA, and -D only on an exact match.
  const prSha = mergedPrHeadSha(repoPath, branch);
  if (!prSha) {
    console.log(`⚠️  ${branch} has unmerged commits and no merged PR was confirmed (none found, or gh unavailable).`);
    console.log(`   Not deleting — genuinely undecided (e.g. aborted work). Your call.`);
    return;
  }
  const localSha = git(["rev-parse", branch], repoPath).stdout.trim();
  if (prSha !== localSha) {
    console.log(`⚠️  ${branch} tip ${localSha} != merged PR head ${prSha}.`);
    console.log(`   The local branch has commits the PR did not merge. Not deleting — your call.`);
    return;
  }

  // 3. Proven merged: the local tip IS the merged PR head. -D is safe.
  const forced = git(["branch", "-D", branch], repoPath);
  if (forced.status !== 0) {
    console.log(`⚠️  branch -D ${branch} failed: ${(forced.stderr || forced.stdout || "").trim()}`);
    return;
  }
  console.log(`Deleted branch ${branch} (verified: tip == merged PR head ${prSha})`);
}

function prune(repoPath) {
  git(["worktree", "prune"], repoPath);
}

const main = () => {
  const config = readConfig();
  const { repoPath, worktreePath } = config;

  if (!existsSync(repoPath)) die(`repoPath does not exist: ${repoPath}`);
  if (!existsSync(worktreePath)) die(`worktreePath does not exist: ${worktreePath}`);

  removeWorktree(config);
  deleteBranch(config);
  prune(repoPath);

  console.log(`\n✅ Worktree reclaimed${config.branch ? ` (branch ${config.branch})` : ""}`);
};

main();
