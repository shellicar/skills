#!/usr/bin/env node
/**
 * Integrate a delivered mission: squash-merge its branch into main, commit
 * (signed), push, then reclaim its fleet worktree and delete the branch.
 *
 * Dry-run by default: it prints what it would do and changes nothing. Pass
 * --apply to act. Every step is idempotent: if the squash is already in
 * origin/main, or the worktree already gone, or the branch already deleted,
 * that step is skipped, so a half-done integration can be re-run safely.
 *
 * The steps, in order:
 *   1. Squash-merge <branch> into main, commit "Integrate <mission> (<project>)"
 *      (signed, so the SC's keychain is the gate), and push. Skipped if the
 *      branch is already captured in origin/main. Stops on a merge conflict.
 *   2. Reclaim, once it has proved nothing would be lost:
 *      a. The superproject worktree is CLEAN. `git worktree remove` refuses on
 *         the `fleet/` submodule gitlink whatever you do to the working copy,
 *         so the only way through is --force; that bypasses git's own
 *         clean-check, so we assert it ourselves and refuse if dirty.
 *      b. The `fleet/` submodule, if checked out, is on main, synced, clean.
 *      c. The branch is captured in origin/main (the squash landed and pushed):
 *         the branch's changes outside `testament/` must be content-identical in
 *         origin/main. `testament/*.md` files union-merge (per .gitattributes)
 *         and never match byte-for-byte after a squash, so they are excluded;
 *         the rest is what the squash carried over. If that content is not in origin/main, the branch was
 *         not integrated and deleting it would lose work, so we refuse.
 *      Then `git worktree remove --force` and `git branch -D`.
 *
 * Config (stdin JSON): { repoPath, worktreePath, branch, mission, project }
 *   repoPath     : the fleet main checkout, on main (the squash-merge lands here)
 *   worktreePath : the delivered mission's worktree, to reclaim
 *   branch       : the mission's branch, squash-merged then deleted
 *   mission      : the mission's name, for the commit subject. Authored, not
 *                  parsed: ask the handler "what would you name this mission?"
 *                  and pass the answer. Parsing a title out of the post-mortem
 *                  markdown would break the moment the format drifted. (Future:
 *                  a title field in the mission frontmatter could be read
 *                  reliably, and would replace this parameter.)
 *   project      : the project the mission belongs to, for the commit subject.
 *   mission and project are required whenever a branch is given, since the
 *   integration commit needs them. The commit subject is
 *   `Integrate <mission> (<project>)`, mirroring the post-mortem's own
 *   `# Post-mortem: <mission> (<project>)` title.
 */

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const APPLY = process.argv.slice(2).includes("--apply");

function die(msg) {
  console.error(`\u274c ${msg}`);
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
  let raw;
  try {
    raw = readFileSync(0, "utf-8");
  } catch (e) {
    die(`Failed to read JSON from stdin: ${e.message}`);
  }
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    die(`Invalid JSON on stdin: ${e.message}`);
  }
  const missing = ["repoPath", "worktreePath"].filter((k) => !cfg[k]);
  if (missing.length) die(`Missing required field(s): ${missing.join(", ")}`);
  if (cfg.branch && (!cfg.mission || !cfg.project)) {
    die(`branch given, so mission and project are required (for the integration commit "Integrate <mission> (<project>)").`);
  }
  return {
    repoPath: expandPath(cfg.repoPath),
    worktreePath: expandPath(cfg.worktreePath),
    branch: cfg.branch || null,
    mission: cfg.mission || null,
    project: cfg.project || null,
  };
}

function currentBranch(repoPath) {
  return git(["symbolic-ref", "-q", "--short", "HEAD"], repoPath).stdout.trim();
}

function branchExists(repoPath, branch) {
  return git(["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`], repoPath).status === 0;
}

// main must be ready to squash onto: on main, with a clean index. `git merge
// --squash` stages the branch into the index without committing, then `git
// commit` commits the whole index, so any pre-staged change would be swept into
// the integration commit. Unstaged and untracked changes are not committed, so
// they are allowed.
function assertMainReady(repoPath) {
  const b = currentBranch(repoPath);
  if (b !== "main") die(`repoPath is on '${b || "detached"}', not main. The squash-merge must land on main. Check out main first.`);
  const staged = git(["diff", "--cached", "--name-only"], repoPath).stdout.trim();
  if (staged !== "") {
    die(`main has staged changes; a squash-merge would sweep them into the integration commit:\n${staged}\nUnstage or commit them first.`);
  }
}

// The squash-merge test. The branch's changes outside `testament/`, from its
// fork with origin/main, are content-identical in origin/main iff the squash
// landed and pushed. `testament/*.md` files union-merge (per .gitattributes) and
// never match byte-for-byte, so they are excluded. Returns a plain boolean;
// callers decide what to do with it.
function isBranchCaptured(repoPath, branch) {
  const list = git(["diff", "--name-only", `origin/main...${branch}`, "--", ".", ":(exclude)testament"], repoPath);
  if (list.status !== 0) return false;
  const files = list.stdout.trim().split("\n").filter(Boolean);
  if (files.length === 0) return false;
  return git(["diff", "--quiet", branch, "origin/main", "--", ...files], repoPath).status === 0;
}

function assertBranchCaptured(repoPath, branch) {
  if (!isBranchCaptured(repoPath, branch)) {
    die(
      `Branch ${branch} has content not in origin/main; it was NOT squash-merged and pushed.\n` +
        `Refusing to delete (would lose work).`,
    );
  }
  console.log(`  branch squash-merged into origin/main`);
}

function squashMergeAndPush(repoPath, branch, mission, project) {
  const merge = git(["merge", "--squash", branch], repoPath);
  if (merge.status !== 0) {
    git(["reset", "--hard", "HEAD"], repoPath);
    die(`git merge --squash ${branch} conflicted; reset main to clean. Resolve the integration by hand:\n${(merge.stderr || merge.stdout).trim()}`);
  }
  const subject = `Integrate ${mission} (${project})`;
  const commit = git(["commit", "-m", subject], repoPath);
  if (commit.status !== 0) die(`git commit failed:\n${(commit.stderr || commit.stdout).trim()}`);
  console.log(`  committed (signed): ${subject}`);
  const push = git(["push", "origin", "main"], repoPath);
  if (push.status !== 0) die(`git push origin main failed:\n${(push.stderr || push.stdout).trim()}`);
  console.log(`  pushed origin main`);
}

function assertWorktreeClean(worktreePath) {
  const res = git(["status", "--porcelain"], worktreePath);
  if (res.status !== 0) die(`git status failed in ${worktreePath}:\n${res.stderr.trim()}`);
  const dirty = res.stdout.trim();
  if (dirty !== "") die(`Worktree is NOT clean, refusing:\n${dirty}\n\nForcing would discard this. Commit or clear it, then retry.`);
  console.log(`  superproject clean`);
}

function assertSubmoduleSafe(worktreePath) {
  const sub = `${worktreePath}/fleet`;
  if (!existsSync(`${sub}/.git`)) {
    console.log(`  submodule fleet/ not checked out (deinit'd), nothing to lose`);
    return;
  }
  const branch = currentBranch(sub);
  if (branch !== "main") die(`Submodule fleet/ is not on main (HEAD: ${branch || "detached"}). Refusing.`);
  const dirty = git(["status", "--porcelain"], sub).stdout.trim();
  if (dirty !== "") die(`Submodule fleet/ has uncommitted changes, refusing:\n${dirty}`);
  const ahead = git(["rev-list", "--count", "origin/main..HEAD"], sub).stdout.trim();
  if (ahead !== "0") die(`Submodule fleet/ is ${ahead} commit(s) ahead of origin/main; those would be lost. Refusing.`);
  console.log(`  submodule fleet/ on main, synced, clean`);
}

function removeWorktree(repoPath, worktreePath) {
  const res = git(["worktree", "remove", "--force", worktreePath], repoPath);
  if (res.status !== 0) die(`git worktree remove --force failed:\n${(res.stderr || res.stdout).trim()}`);
  git(["worktree", "prune"], repoPath);
  console.log(`  removed ${worktreePath}`);
}

function deleteBranch(repoPath, branch) {
  const res = git(["branch", "-D", branch], repoPath);
  if (res.status !== 0) die(`git branch -D ${branch} failed:\n${(res.stderr || res.stdout).trim()}`);
  console.log(`  deleted branch ${branch}`);
}

const main = () => {
  const { repoPath, worktreePath, branch, mission, project } = readConfig();
  if (!existsSync(repoPath)) die(`repoPath does not exist: ${repoPath}`);

  console.log(APPLY ? "=== mission-integration: APPLY ===\n" : "=== mission-integration: DRY RUN (pass --apply to act) ===\n");

  const captured = branch ? isBranchCaptured(repoPath, branch) : true;

  // 1. Squash-merge, commit, push (skipped if already captured).
  if (branch && branchExists(repoPath, branch)) {
    if (captured) {
      console.log(`squash-merge: ${branch} already in origin/main, skipping`);
    } else {
      assertMainReady(repoPath);
      if (APPLY) {
        squashMergeAndPush(repoPath, branch, mission, project);
      } else {
        console.log(`squash-merge: would merge ${branch} into main, commit "Integrate ${mission} (${project})" (signed), and push.`);
        console.log(`  the files it would squash-merge into main:`);
        const files = git(["diff", "--name-only", `main...${branch}`], repoPath);
        process.stdout.write((files.stdout || "  (none)\n").replace(/^/gm, "  "));
      }
    }
  } else if (branch) {
    console.log(`squash-merge: branch ${branch} already gone, skipping`);
  }

  // 2. Reclaim: verify nothing would be lost, then remove worktree and delete branch.
  console.log(`\nverifying nothing would be lost`);
  const wtHere = existsSync(worktreePath);
  if (wtHere) {
    assertWorktreeClean(worktreePath);
    assertSubmoduleSafe(worktreePath);
  } else {
    console.log(`  worktree already gone, nothing to check there`);
  }
  if (branch && branchExists(repoPath, branch)) {
    if (APPLY || captured) assertBranchCaptured(repoPath, branch);
    else console.log(`  branch would be captured once the squash above lands`);
  }

  // Worktree
  console.log("");
  if (!wtHere) {
    console.log(`worktree: already gone (${worktreePath})`);
    if (APPLY) git(["worktree", "prune"], repoPath);
  } else if (APPLY) {
    removeWorktree(repoPath, worktreePath);
  } else {
    console.log(`worktree: would remove (forced past the submodule guard): ${worktreePath}`);
  }

  // Branch
  console.log("");
  if (!branch) {
    console.log(`branch: none given, nothing to delete`);
  } else if (!branchExists(repoPath, branch)) {
    console.log(`branch: already gone (${branch})`);
  } else if (APPLY) {
    deleteBranch(repoPath, branch);
  } else {
    console.log(`branch: would delete (git branch -D): ${branch}`);
  }

  console.log(APPLY ? `\n\u2705 Mission integrated and worktree reclaimed` : `\n(dry run: nothing changed; pass --apply to act)`);
};

main();
