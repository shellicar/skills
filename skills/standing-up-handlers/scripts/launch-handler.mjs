#!/usr/bin/env node
/**
 * Launch a per-mission Handler (Executor) cast in its own tmux window.
 *
 * WHY THIS EXISTS
 * The Router scripts (new-operator-cast, new-supervisor-cast, next-phase-cast)
 * cast operators and supervisors *inside* an existing Handler window: each keys
 * off TMUX_PANE being the Handler's own pane and splits within that window.
 * Nothing creates the Handler window or launches the Handler itself — that step
 * was only ever done by hand and never written down. This script is that step,
 * captured. It is the durable form of the manual `new-window` + `send-keys`
 * launch the Planner performs to stand a mission up, and the same operation a
 * recovery needs to rehydrate a handler after a tmux-server or machine death.
 *
 * WHY IT DOESN'T USE TMUX_PANE (unlike the Router scripts)
 * The Planner runs outside the target window, so the window can't be derived
 * from the caller's pane. The target tmux session is an explicit input, and the
 * script creates a new window in it rather than splitting the caller's.
 *
 * SCOPE
 * Launch only. The Handler's fleet-repo worktree (claude-fleet-shellicar--<mission>)
 * must already exist; its path is passed as `cwd`. Creating that worktree (which
 * involves the fleet/ submodule) is a separate concern, deliberately not here.
 *
 * WHY NO BRIEF — THE BARE LINE
 * The `envelope` is a bare mission line ("i have a mission to fix cves in the
 * claude-cli repo") and nothing else. No brief is attached, and the envelope is
 * not an instruction sheet. This is load-bearing. Tested n=4 each way on
 * 2026-06-20: a cast handed a brief that named specifics started interrogating
 * the SC on fix mechanics ("is hono direct or transitive?") — it read
 * having-the-facts as having-the-authority and took the lead. The bare line
 * gives it nothing to mistake for a mandate, so it does what a handler should:
 * read its skills, reorient, and ask the SC to classify the mission. The more
 * you hand it, the more it acts as if in command — so hand it the least.
 *
 * WHAT IT DOES
 *   1. Create the handler window at the worktree cwd, detached (`-d`, so the
 *      SC's attached pane isn't yanked), and capture its pane id. If the target
 *      session doesn't exist yet (the first handler for a project), create it
 *      together with the window via `new-session`; otherwise `new-window` into
 *      the existing session.
 *   2. Tag the window (window-scoped): @state=pm-running, plus @title and
 *      @colour for the SC's status-bar identity — the same fields start-mission
 *      sets for a mission window. British spelling @colour; tmux does not read
 *      @color.
 *   3. send-keys the claude-sdk-cli launch. The Handler launches with
 *      `--resume <convId>`: the conv id is pre-generated so the recovery anchor
 *      exists by construction, and the CLI adopts the id whether or not the
 *      conversation exists yet. No brief is attached (see WHY NO BRIEF); the
 *      skills + the bare-line envelope go through --prompt, built the same way
 *      the Router builds an operator's prompt (shared buildPrompt). Note:
 *      --resume, NOT --no-resume — operators start fresh, handlers adopt theirs.
 *   4. Verify claude-sdk-cli stabilises (shared waitForClaudeSdkCli).
 *
 * Reads JSON config from stdin:
 *   {
 *     "session":    "claude-cli",
 *     "cwd":        "~/repos/fleet/claude-fleet-shellicar--system-prompt",
 *     "convId":     "<pre-generated uuid>",
 *     "envelope":   "i have a mission to fix cves in the claude-cli repo",
 *     "skills":     ["claude-philosophy", "commander-protocol", ...],
 *     "name":       "system-prompt",
 *     "windowName": "claude-cli-system-prompt",
 *     "title":      "claude-cli-system-prompt",
 *     "colour":     "cyan",
 *     "model":      "claude-opus-4-8"
 *   }
 *
 * Required: session, cwd, convId, envelope, skills, name, windowName.
 * Optional: title (defaults to windowName), colour (unset if omitted),
 *           model (defaults to claude-opus-4-8 — handlers default to Opus).
 *
 * Stdout: the new window's pane id (e.g. %123).
 * Exit codes: 0 launched & stable; 1 CLI never stabilised; 2 bad input.
 */

import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import { buildPrompt, waitForClaudeSdkCli } from "./pane.mjs";

function expandPath(p) {
  if (typeof p !== "string") return p;
  return p.replace(/^~/, homedir()).replace(/^\$HOME/, homedir());
}

function shq(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

const cfg = JSON.parse(readFileSync(0, "utf8"));
for (const k of ["session", "cwd", "convId", "envelope", "skills", "name", "windowName"]) {
  if (!cfg[k]) {
    console.error(`config missing required field: ${k}`);
    process.exit(2);
  }
}
const model = cfg.model || "claude-opus-4-8";
const title = cfg.title || cfg.windowName;

// 1. Create the handler window and capture its pane id. If the target session
//    doesn't exist yet (the first handler for a project), create it together
//    with the window via `new-session`; otherwise add a `new-window` to it.
//    Either way `-d` keeps the SC's attached pane from being yanked.
const sessionExists = spawnSync("tmux", ["has-session", "-t", cfg.session]).status === 0;
const makeWindow = sessionExists
  ? ["new-window", "-d", "-t", `${cfg.session}:`, "-n", cfg.windowName, "-c", expandPath(cfg.cwd), "-P", "-F", "#{pane_id}"]
  : ["new-session", "-d", "-s", cfg.session, "-n", cfg.windowName, "-c", expandPath(cfg.cwd), "-P", "-F", "#{pane_id}"];
const paneId = execFileSync("tmux", makeWindow, { encoding: "utf8" }).trim();

// 2. Tag the window (status-bar identity + state), window-scoped.
execFileSync("tmux", ["set-option", "-w", "-t", paneId, "@state", "pm-running"]);
execFileSync("tmux", ["set-option", "-w", "-t", paneId, "@title", title]);
if (cfg.colour) {
  execFileSync("tmux", ["set-option", "-w", "-t", paneId, "@colour", cfg.colour]);
}

// 3. Build the prompt (skills + the bare-line envelope), write it to a temp file
//    the shell reads and removes, and send-keys the launch into the pane. No
//    brief is attached — see WHY NO BRIEF.
const prompt = buildPrompt({ from: cfg.from || "the Planner", message: cfg.envelope, skills: cfg.skills });
const tmp = join(mkdtempSync(join(tmpdir(), "handler-prompt-")), "prompt");
writeFileSync(tmp, prompt);

const launch =
  `claude-sdk-cli --name ${shq(cfg.name)} ` +
  `--model ${shq(model)} --resume ${shq(cfg.convId)} ` +
  `--prompt "$(cat ${shq(tmp)}; rm -f ${shq(tmp)})"`;

execFileSync("tmux", ["send-keys", "-t", paneId, launch, "Enter"]);

// 4. Verify the CLI reaches a stable running state in the pane.
const result = waitForClaudeSdkCli(paneId);
if (result && !result.ok) {
  console.error(
    `claude-sdk-cli launch failed in ${paneId}: ${result.reason}` +
      `${result.lastSeen ? ` (saw ${result.lastSeen})` : ""}`,
  );
  process.exit(1);
}

console.log(paneId);
