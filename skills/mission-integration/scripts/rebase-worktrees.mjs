#!/usr/bin/env node
/**
 * rebase-worktrees — re-ground every fleet worktree branch on local `main`.
 *
 * After a mission integrates into `main` (a squash-merge from its worktree),
 * the other in-flight worktrees are still based on an older `main` and drift
 * further the longer they wait. This re-grounds the safe ones: rebase each
 * worktree's branch onto `main`, doing ONLY what can be done cleanly.
 *
 * Purely local — no fetch, no push. It rebases worktree branches onto the
 * local `main` this repo's integrations land on.
 *
 * Per worktree:
 *   the main checkout     -> skip (it is the target, not a worktree to rebase)
 *   up to date with main  -> nothing to do; main's content is already in it
 *   behind, dirty tree    -> WARN, skipped (a rebase can't start on a dirty tree)
 *   behind, detached HEAD -> WARN, skipped (no branch to rebase)
 *   behind main           -> rebase onto main — a plain fast-forward when the branch
 *                            has no commits of its own (non-interactive; on conflict:
 *                            abort + WARN, left untouched)
 *
 * The conflict-abort is the safety. A clean rebase lands; anything that does
 * not apply cleanly is aborted and the worktree is left exactly as it was. So a
 * live session in the worktree is fine either way: it resumes on the new base,
 * or on the unchanged old one.
 *
 * Output is one line per worktree, printed as that worktree is handled, so a
 * long --apply run shows progress rather than going silent then dumping.
 *
 * The target repo is resolved from the current directory (the script lives in
 * the skills repo, so its own path says nothing about which fleet to act on).
 * Run it from the fleet data repo's main checkout.
 *
 * Mode:
 *   (default)  dry run — classify and report only, no mutation
 *   --apply    do the rebases
 *   --stash    (TEMPORARY) also rebase dirty worktrees: stash -u, rebase, pop.
 *              Only safe when every session is idle — opt in deliberately.
 *
 * Usage (from the fleet repo's main checkout):
 *   node ~/.claude/skills/mission-integration/scripts/rebase-worktrees.mjs            # dry run
 *   node ~/.claude/skills/mission-integration/scripts/rebase-worktrees.mjs --apply    # do it
 */

import { spawnSync } from "node:child_process";

// A rebase must never drop into an editor; neuter both so it cannot block.
const NONINTERACTIVE = { ...process.env, GIT_SEQUENCE_EDITOR: "true", GIT_EDITOR: "true" };

const TARGET = "main";

function git(cwd, args, opts = {}) {
  return spawnSync("git", args, { cwd, encoding: "utf-8", ...opts });
}
function out(cwd, args) {
  const r = git(cwd, args);
  return r.status === 0 ? r.stdout.trim() : null;
}
function count(cwd, range) {
  return parseInt(out(cwd, ["rev-list", "--count", range]) || "0", 10);
}

// Each "worktree <path>" line of the porcelain list is one worktree of this repo.
function worktrees(superproject) {
  const list = out(superproject, ["worktree", "list", "--porcelain"]) || "";
  return list
    .split("\n")
    .filter((l) => l.startsWith("worktree "))
    .map((l) => l.slice("worktree ".length));
}

// Cheap, local gates, then the behind-count that decides a rebase.
function classify(wt) {
  const name = wt.split("/").pop();
  const branch = out(wt, ["symbolic-ref", "-q", "--short", "HEAD"]);

  // The main checkout is the target, not a worktree to rebase onto itself.
  if (branch === TARGET) return { wt, name, done: { name, level: "ok", msg: "the main checkout — skipped" } };

  // How far main has moved past this worktree. The whole job is getting main's
  // content into every worktree, so behind === 0 means it is already there.
  const behind = count(wt, `HEAD..${TARGET}`);
  const trail = behind ? ` (${behind} behind)` : "";

  // Up to date: main's content is already in it. Done.
  if (behind === 0) return { wt, name, done: { name, level: "ok", msg: "up to date" } };

  // Behind main — main's content needs bringing in, by a rebase, or a plain
  // fast-forward when the branch has nothing of its own. What blocks that, and so is
  // worth flagging: a dirty tree can't rebase, and a detached HEAD has no branch.
  const dirty = (out(wt, ["status", "--porcelain"]) || "").length > 0;
  if (!branch) return { wt, name, done: { name, level: "warn", msg: `detached HEAD — skipped${trail}` } };
  // A dirty tree can't rebase. Default: skip it. With --stash: stash, rebase, pop
  // (only safe when the session is idle — the SC opts in when they know it is).
  if (dirty && !STASH)
    return { wt, name, done: { name, level: "warn", msg: `dirty working tree — skipped${trail}` } };

  return { wt, name, behind, dirty };
}

// TEMPORARY: auto-resolve the two known-safe conflict classes the testament
// removal creates on these old branches. Any other unmerged path -> abort.
//   testament/*.md deleted by us -> accept the delete (git rm). main deleted the
//     migrated testaments; old branches carry commits that modified them.
//   the `fleet` submodule gitlink -> accept it (git add). fleet is kept on its
//     own main and its drift is ignored noise, so there is nothing real to merge.
// Returns:
//   "resolved" — every unmerged path was one of the two, and was staged
//   "other"    — some other conflict is present; caller must abort
//   "none"     — no unmerged paths (unexpected mid-conflict); caller must abort
function resolveConflict(wt) {
  const lines = (out(wt, ["status", "--porcelain"]) || "").split("\n").filter(Boolean);
  const unmerged = lines.filter((l) => ["DD", "AU", "UD", "UA", "DU", "AA", "UU"].includes(l.slice(0, 2)));
  if (unmerged.length === 0) return "none";
  for (const l of unmerged) {
    const code = l.slice(0, 2);
    const path = l.slice(3);
    if (code === "DU" && path.startsWith("testament/") && path.endsWith(".md")) {
      if (git(wt, ["rm", "-f", "--", path]).status !== 0) return "other";
    } else if (path === "fleet") {
      if (git(wt, ["add", "--", path]).status !== 0) return "other";
    } else {
      return "other";
    }
  }
  return "resolved";
}

function rebase(wt, name, behind, dirty) {
  // --stash mode: a dirty tree is set aside so the rebase can run, then restored.
  let stashed = false;
  if (dirty) {
    const s = git(wt, ["stash", "push", "-u", "-m", "rebase-worktrees auto-stash"]);
    if (s.status !== 0)
      return { name, level: "warn", msg: `stash failed (-${behind}) — skipped, left untouched` };
    stashed = !/No local changes/.test((s.stdout || "") + (s.stderr || ""));
  }

  let rb = git(wt, ["rebase", TARGET], { env: NONINTERACTIVE });
  let accepted = false;
  while (rb.status !== 0) {
    if (resolveConflict(wt) !== "resolved") {
      git(wt, ["rebase", "--abort"]);
      if (stashed) git(wt, ["stash", "pop"]);
      return { name, level: "warn", msg: `rebase conflict (-${behind}) — aborted, left untouched` };
    }
    accepted = true;
    // Accepting the delete can empty a commit that only touched the testament:
    // continue, and skip it if git reports it now has nothing to apply.
    let step = git(wt, ["rebase", "--continue"], { env: NONINTERACTIVE });
    if (step.status !== 0 && /empty/i.test((step.stderr || "") + (step.stdout || "")))
      step = git(wt, ["rebase", "--skip"], { env: NONINTERACTIVE });
    rb = step;
  }

  const parts = [];
  if (accepted) parts.push("testament/fleet conflicts accepted");
  if (stashed) {
    const p = git(wt, ["stash", "pop"]);
    if (p.status !== 0)
      return { name, level: "warn", msg: `rebased (-${behind}) but stash pop conflicted — resolve by hand` };
    parts.push("stashed");
  }
  const note = parts.length ? `, ${parts.join(", ")}` : "";
  return { name, level: "ok", msg: `rebased onto ${TARGET} (-${behind}${note})` };
}

// ---- run ----
const apply = process.argv.slice(2).includes("--apply");
const STASH = process.argv.slice(2).includes("--stash");

// The superproject is wherever this is run from — the script's own path lives
// in the skills repo and says nothing about the target fleet.
const rootRes = git(process.cwd(), ["rev-parse", "--show-toplevel"]);
if (rootRes.status !== 0) {
  console.error("❌ not inside a git repo — run from the fleet repo's main checkout");
  process.exit(2);
}
const root = rootRes.stdout.trim();
const wts = worktrees(root);

console.log(`rebase-worktrees ${apply ? "APPLY" : "dry run"} — ${wts.length} worktree(s)\n`);

// Classify, act, and print one worktree at a time, so the slow part (--apply's
// rebases) reports each result as it lands instead of all at the end.
const sym = { warn: "⚠️", plan: "🔁", ok: "✅" };
let warns = 0;
for (const wt of wts) {
  const c = classify(wt);
  const result = c.done
    ? c.done
    : apply
      ? rebase(c.wt, c.name, c.behind, c.dirty)
      : { name: c.name, level: "plan", msg: `would rebase onto ${TARGET} (-${c.behind}${c.dirty ? ", stashing first" : ""})` };
  if (result.level === "warn") warns++;
  console.log(`${sym[result.level]}  ${result.name.padEnd(52)} ${result.msg}`);
}
console.log(
  `\n${wts.length} worktree(s) — ${warns} need attention${apply ? "" : " (dry run — nothing changed)"}`,
);
process.exit(warns ? 1 : 0);
