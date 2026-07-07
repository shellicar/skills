#!/usr/bin/env node
/**
 * Dispatch a worktree for an operator mission.
 *
 * Produces a worktree ready for the cast: fresh branch, project memory,
 * secrets, dependencies. The operator's identity (actor + role) is composed
 * into --system at launch — this script delivers no harness file.
 *
 * What the script does:
 *   1. Create the worktree on a new branch at origin/main with --no-track
 *      (fetching the remote first so the base isn't stale).
 *   2. Copy the local files the cast needs. A worktree clones the repo,
 *      not the directory: anything intentionally gitignored but needed
 *      (not incidental ignores like logs) does not arrive with the
 *      worktree and must be carried over. The list today: CLAUDE.local.md
 *      (project memory, for repos that haven't moved it into a committed
 *      ./CLAUDE.md yet) and root-level .env / .env.* secrets. Different
 *      purposes, one reason — the file lives in the directory, not in git.
 *   3. Install dependencies in the worktree when package.json declares
 *      pnpm via the packageManager field. A fresh worktree has no
 *      node_modules; without this, casts improvise workarounds instead
 *      of running the install.
 *
 * Writes go only to the worktree. The operator's main checkout is read
 * (for the local-file copies) but never written.
 *
 * --no-track on the worktree branch is intentional. Starting from
 * origin/main is correct (fresh content); git's default behaviour would
 * auto-set-upstream to origin/main, which is wrong — the new branch is its
 * own thing, not a fork of main in the upstream-tracking sense.
 * --no-track separates start-from from tracking. On first push the operator
 * does `git push -u origin <branch>` and the upstream becomes
 * origin/<branch>, which is correct.
 *
 * Reads JSON config from stdin:
 *   {
 *     "repoPath": "/path/to/repo",
 *     "worktreePath": "/path/to/worktree",
 *     "branch": "<branch-name>",
 *     "startingPoint": "origin/main"
 *   }
 *
 * Required: repoPath, worktreePath, branch.
 * Optional: startingPoint (defaults to "origin/main").
 *
 * Usage:
 *   echo '{"repoPath":"...","worktreePath":"...","branch":"..."}' | \
 *     node ~/.claude/skills/worktrees/scripts/dispatch-worktree.mjs
 */

import { readFileSync, existsSync, cpSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function expandPath(p) {
  if (typeof p !== "string") return p;
  return p.replace(/^~/, process.env.HOME).replace(/^\$HOME/, process.env.HOME);
}

function git(args, cwd, { capture = true, label = "" } = {}) {
  const opts = capture
    ? { cwd, encoding: "utf-8" }
    : { cwd, stdio: "inherit" };
  const res = spawnSync("git", args, opts);
  if (res.status !== 0) {
    const detail = capture ? `\n${res.stderr || res.stdout || ""}` : "";
    die(`${label || `git ${args.join(" ")}`} failed${detail}`);
  }
  return capture ? res.stdout : "";
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

  const required = ["repoPath", "worktreePath", "branch"];
  const missing = required.filter((k) => !config[k]);
  if (missing.length > 0) {
    die(`Missing required field(s): ${missing.join(", ")}`);
  }

  return {
    repoPath: expandPath(config.repoPath),
    worktreePath: expandPath(config.worktreePath),
    branch: config.branch,
    startingPoint: config.startingPoint || "origin/main",
  };
}

function fetchStartingPoint(repoPath, startingPoint) {
  // The worktree branches off startingPoint (default origin/main). If the local
  // remote-tracking ref is stale, the worktree starts on an old base and the
  // operator silently begins behind the true tip. Refresh the remote first.
  // Only fetch when startingPoint names a remote-tracking ref (remote/branch);
  // a SHA or local ref has no remote to fetch.
  const slash = startingPoint.indexOf("/");
  if (slash === -1) return;
  const remote = startingPoint.slice(0, slash);
  console.log(`\n=== Fetching ${remote} ===`);
  const res = spawnSync("git", ["fetch", remote], { cwd: repoPath, stdio: "inherit" });
  if (res.status !== 0) {
    console.error(
      `⚠️  git fetch ${remote} failed. Proceeding with the local ${startingPoint}, which may be stale.`,
    );
  }
}

function createWorktree({ repoPath, worktreePath, branch, startingPoint }) {
  fetchStartingPoint(repoPath, startingPoint);
  console.log(`\n=== Creating worktree ===`);
  git(
    ["worktree", "add", "--no-track", "-b", branch, worktreePath, startingPoint],
    repoPath,
    { capture: false, label: "git worktree add" },
  );
}

// The local files a cast needs that git will not deliver: intentionally
// gitignored, needed to work (not incidental ignores like logs). Each entry is
// a predicate over a root-level filename. `.env` matches `.env` and
// `.env.<anything>` (e.g. .env.local, .env.stephen), not `.envrc`.
const LOCAL_FILES = [
  (name) => name === "CLAUDE.local.md", // project memory, pre-committed-CLAUDE.md repos
  (name) => name === ".env" || name.startsWith(".env."), // secrets the build/run needs
];

// A worktree clones the repo, not the directory — local files stay behind
// unless carried. Copy every root-level file matching LOCAL_FILES.
function copyLocalFiles(repoPath, worktreePath) {
  let entries;
  try {
    entries = readdirSync(repoPath, { withFileTypes: true });
  } catch {
    return;
  }
  const files = entries
    .filter((e) => e.isFile() && LOCAL_FILES.some((matches) => matches(e.name)))
    .map((e) => e.name);
  if (files.length === 0) return;
  console.log(`\n=== Copying local files ===`);
  for (const name of files) {
    cpSync(join(repoPath, name), join(worktreePath, name));
    console.log(`Copied ${name}`);
  }
}

function installDependencies(worktreePath) {
  const pkgJsonPath = join(worktreePath, "package.json");
  if (!existsSync(pkgJsonPath)) {
    return;
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
  } catch (err) {
    console.error(`⚠️  Could not parse ${pkgJsonPath}: ${err.message}. Skipping dependency install.`);
    return;
  }

  // The packageManager field is the explicit, corepack-standard declaration
  // of the repo's package manager. Only bootstrap when it names pnpm.
  const pm = pkg.packageManager;
  if (typeof pm !== "string" || !pm.startsWith("pnpm")) {
    return;
  }

  console.log(`\n=== Installing dependencies (pnpm) ===`);
  // --frozen-lockfile keeps the worktree clean for the operator's preflight:
  // it installs against the committed lockfile without mutating it.
  const res = spawnSync("pnpm", ["install", "--frozen-lockfile"], {
    cwd: worktreePath,
    stdio: "inherit",
  });
  if (res.status !== 0) {
    console.error(
      `⚠️  pnpm install failed in the worktree. The worktree exists; run 'pnpm install' there before the cast.`,
    );
    return;
  }
  console.log(`Installed dependencies in ${worktreePath}`);
}

const main = () => {
  const config = readConfig();
  const { repoPath, worktreePath } = config;

  createWorktree(config);
  copyLocalFiles(repoPath, worktreePath);
  installDependencies(worktreePath);

  console.log(`\n✅ Worktree ready at ${worktreePath} on branch ${config.branch}`);
};

main();
