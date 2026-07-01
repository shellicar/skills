#!/usr/bin/env node
/**
 * audit-repo.mjs — dependency-audit probe for a pnpm / Node monorepo project.
 *
 * WHY THIS EXISTS
 * The mission-boards skill records, per pnpm project, when `pnpm audit` was last
 * run against canonical main — a durable *logged event* (permanently true, lives
 * nowhere else) whose staleness is the health signal. See the skill's "project
 * state file" section for the doctrine.
 *
 * It must never audit the working checkout. That checkout may be on a feature
 * branch, behind origin, or dirty — the day this was written it was 3 commits
 * behind main with uncommitted changes, and the audit reflected the stale state,
 * not main. So the probe always audits a throwaway worktree off freshly-fetched
 * origin/main, then tears it down.
 *
 * NO INSTALL. Proven 2026-06-29 on pnpm 11: `pnpm audit` resolves from the
 * lockfile alone — a fresh worktree with no `pnpm install` still reports every
 * advisory. So the probe skips the install and stays fast.
 *
 * PROD vs DEV. It runs the audit twice — full, then `--prod`. A prod-dependency
 * advisory is potentially real exposure; a dev-only one (a test runner, a build
 * tool) usually is not. So the output splits the two, prod first, and the caller
 * records prod ahead of dev. Verified 2026-07-01: products-api's sole *prod*
 * critical is protobufjs; its vitest/shell-quote criticals are dev-only.
 *
 * COUNTS FROM THE ADVISORY MAP, not `metadata.vulnerabilities`. Verified
 * 2026-07-01: metadata counts *findings* (a package reached by two paths counts
 * twice) while the advisory map counts *unique advisories* — the thing you fix
 * and can name. products-api's metadata said 4 critical; there are 3 unique
 * critical advisories. Deriving counts from the map keeps the numbers and the
 * names consistent, and criticals are listed complete (never truncated).
 *
 * PURE PROBE. It emits JSON and composes no state.md line; the caller writes the
 * line from this output. Scoped to pnpm projects — the `tool` field names the
 * probe rather than assuming it.
 *
 * stdin:  { "repoPath": "~/repos/.../some-repo" }
 *
 * stdout (single JSON object):
 *   {
 *     "repo", "tool":"pnpm-audit", "ref":"origin/main", "sha":<40>, "ranAt":"YYYY-MM-DD",
 *     "prod": <scope>,   // potentially-real exposure — recorded first
 *     "dev":  <scope>
 *   }
 * where <scope> is:
 *   {
 *     "counts": { "critical":0,"high":0,"moderate":0,"low":0,"info":0 },  // unique advisories
 *     "total":  <sum of counts>,
 *     "critical": [ { "package","id","vulnerableRange","patched","title" } ]  // complete, uncapped
 *   }
 *
 * `pnpm audit` exits non-zero when it finds advisories; the JSON is read
 * regardless of exit code.
 *
 * Exit codes: 0 success; 1 operational failure (bad input, git/pnpm failure);
 *             3 not a pnpm project (no pnpm-lock.yaml at origin/main) — a clean
 *               "skip me", distinct from a crash, so a batch caller can tell them apart.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";

const SEVERITY_ORDER = ["critical", "high", "moderate", "low", "info"];

function fail(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function expandHome(p) {
  return p.startsWith("~") ? p.replace(/^~/, homedir()) : p;
}

function git(args, cwd) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${r.stderr || r.stdout}`);
  }
  return r.stdout.trim();
}

// Run `pnpm audit --json [extra]` in the worktree. pnpm exits non-zero when it
// finds advisories, so the exit code is ignored and the JSON is parsed from
// stdout. stderr is kept separate so progress noise can't corrupt the JSON.
function audit(cwd, extra = []) {
  const r = spawnSync("pnpm", ["audit", "--json", ...extra], {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (!r.stdout) throw new Error(`pnpm audit ${extra.join(" ")} produced no output:\n${r.stderr}`);
  return JSON.parse(r.stdout);
}

// Stable identity for an advisory, taken from the object (not the map key —
// pnpm keys the advisories map differently between the full and --prod runs, so
// the key can't be used to match an advisory across the two).
function advKey(a) {
  return a.github_advisory_id || a.url || String(a.id ?? "");
}

function emptyCounts() {
  return { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
}

// Build a scope block from the advisory objects belonging to it.
function scope(advisories) {
  const counts = emptyCounts();
  for (const a of advisories) counts[a.severity] = (counts[a.severity] ?? 0) + 1;
  const total = SEVERITY_ORDER.reduce((n, s) => n + counts[s], 0);
  const critical = advisories
    .filter((a) => a.severity === "critical")
    .map((a) => ({
      package: a.module_name,
      id: advKey(a),
      vulnerableRange: a.vulnerable_versions,
      patched: a.patched_versions,
      title: a.title,
    }))
    .sort((x, y) => x.package.localeCompare(y.package));
  return { counts, total, critical };
}

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch (e) {
  fail(`Could not parse stdin as JSON: ${e.message}`);
}

const repoPath = input.repoPath ? expandHome(input.repoPath) : null;
if (!repoPath) fail("Missing required field: repoPath");

const stamp = Date.now();
const branch = `tmp/audit-${stamp}`;
const wtPath = `${repoPath}--audit-${stamp}`;

let sha;
try {
  git(["fetch", "origin"], repoPath);
  sha = git(["rev-parse", "origin/main"], repoPath);
  // Guard: this probe is pnpm-only. If origin/main has no root pnpm-lock.yaml,
  // it isn't a pnpm project — exit cleanly (code 3) rather than running
  // `pnpm audit` against nothing, which can error oddly or resolve a parent
  // lockfile and report the wrong repo.
  const hasLock = spawnSync("git", ["cat-file", "-e", "origin/main:pnpm-lock.yaml"], { cwd: repoPath });
  if (hasLock.status !== 0) {
    fail(`not a pnpm project: no pnpm-lock.yaml at origin/main in ${repoPath}`, 3);
  }
  git(["worktree", "add", "--no-track", "-b", branch, wtPath, "origin/main"], repoPath);
} catch (e) {
  fail(`Setup failed: ${e.message}`);
}

let full;
let prod;
try {
  full = audit(wtPath);
  prod = audit(wtPath, ["--prod"]);
} catch (e) {
  teardown(); // don't leak the worktree on a parse/run failure
  fail(`Audit failed: ${e.message}`);
}

teardown();

// Partition the full advisory set into prod / dev by membership in the --prod
// run, matched on the stable advisory id (advKey), not the map key. The --prod
// run is a subset of the full run, so an advisory present there is prod-scoped;
// everything else is dev-only.
const prodKeys = new Set(Object.values(prod.advisories ?? {}).map(advKey));
const all = Object.values(full.advisories ?? {});
const prodAdvisories = all.filter((a) => prodKeys.has(advKey(a)));
const devAdvisories = all.filter((a) => !prodKeys.has(advKey(a)));

process.stdout.write(
  `${JSON.stringify(
    {
      repo: repoPath,
      tool: "pnpm-audit",
      ref: "origin/main",
      sha,
      ranAt: new Date().toLocaleDateString("en-CA"),
      prod: scope(prodAdvisories),
      dev: scope(devAdvisories),
    },
    null,
    2,
  )}\n`,
);

// Best-effort teardown: the worktree is script-owned and ephemeral (no install,
// so it holds only tracked files and removes cleanly). If a remove ever refuses,
// warn but don't fail — the audit result still stands.
function teardown() {
  const rm = spawnSync("git", ["worktree", "remove", wtPath], { cwd: repoPath, encoding: "utf8" });
  if (rm.status !== 0) {
    process.stderr.write(`warning: could not remove worktree ${wtPath}:\n${rm.stderr}`);
  }
  const br = spawnSync("git", ["branch", "-D", branch], { cwd: repoPath, encoding: "utf8" });
  if (br.status !== 0) {
    process.stderr.write(`warning: could not delete branch ${branch}:\n${br.stderr}`);
  }
}
