#!/usr/bin/env node
/**
 * Start an Executor session — the Handler actor carrying the executor and router
 * roles.
 *
 * Identity: the handler actor + the executor and router roles, delivered as
 * --system and composed by the shared buildSystemInline
 * (../shared/pane/envelope.mjs), which reads the file contents directly. One of
 * the catch-all handler-family launchers (handler, scribe, executor): same
 * actor, a narrower set of roles.
 *
 * --name is derived from the worktree: a `<base>--<worktree>` cwd becomes
 * executor-<worktree> (falls back to `executor`). On a fresh conversation
 * (--no-resume) the skill set is injected via --prompt as cached user context,
 * firing one first turn on a seed message ("reorient" by default, or the value of
 * --message); on a resume the skills are already present, so they are not
 * re-sent. Everything else is forwarded verbatim, including --model; a leading
 * `--` separator is accepted and stripped.
 * Runs interactively in the current pane and exits with claude-sdk-cli's status.
 * Exit 2 if an identity file is missing (via buildSystemInline).
 */

import { basename } from "node:path";
import { spawnSync } from "node:child_process";
import { buildSystemInline, buildPrompt } from "../shared/pane/envelope.mjs";
import { skillsFor } from "../shared/pane/skills.mjs";

// The composition preset: the handler actor + the executor and router roles.
const roles = ["executor", "router"];
const system = buildSystemInline({ actor: "handler", role: roles });

// Name after the worktree: a `<base>--<worktree>` cwd becomes executor-<worktree>.
const dir = basename(process.cwd());
const sep = dir.indexOf("--");
const name = sep >= 0 ? `executor-${dir.slice(sep + 2)}` : "executor";

// Forward everything else verbatim to claude-sdk-cli. A leading `--` is dropped.
const passthrough = process.argv.slice(2);
if (passthrough[0] === "--") passthrough.shift();

// Pull an optional --message <value> out of the passthrough: it overrides the
// default seed message ("reorient") for the first-turn prompt. Extracted here so
// it is not forwarded to claude-sdk-cli, which does not understand it. Only has
// an effect on --no-resume, the sole path that builds a prompt.
let message = "reorient";
const mi = passthrough.indexOf("--message");
if (mi >= 0) {
  message = passthrough[mi + 1] ?? message;
  passthrough.splice(mi, 2);
}

const args = ["--name", name, "--system", system];

// Seed the skill set as cached user context only on a fresh conversation
// (--no-resume). On a resume the session already carries its skills from the
// first turn, so re-injecting would fire a spurious turn and miss the cache it
// was meant to seed. skillsFor mirrors the ACTOR/ROLE `## Skills` (see skills.mjs).
if (passthrough.includes("--no-resume")) {
  const skills = skillsFor({ actor: "handler", role: roles });
  args.push("--prompt", buildPrompt({ from: "the Supreme Commander", message, skills }));
}

args.push(...passthrough);

// Launch interactively in this pane and exit with the CLI's status.
const result = spawnSync("claude-sdk-cli", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
