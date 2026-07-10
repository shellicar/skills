#!/usr/bin/env node
import './lib/sc-only.mjs';
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
 * executor-<worktree> (falls back to `executor`). The skill set rides
 * --claudeMd — cached context assembled per session, no turn fired, sent on
 * every launch (fresh or resumed). On a fresh conversation (--no-resume) with
 * --message, that message is sent via --prompt as the first message; otherwise
 * the session opens idle. Everything else is forwarded verbatim, including
 * --model; a leading `--` separator is accepted and stripped.
 * Runs interactively in the current pane and exits with claude-sdk-cli's status.
 * --doctor composes exactly what a real launch would and prints the resolved
 * name, roles, skill list, and --system / --claudeMd sizes, then exits without
 * touching claude-sdk-cli.
 * Exit 2 if an identity file is missing (via buildSystemInline).
 */

import { homedir } from "node:os";
import { basename } from "node:path";
import { spawnSync } from "node:child_process";
import { buildSystemInline, buildPrompt, buildSkillsBlock } from "../shared/pane/envelope.mjs";
import { skillsFor } from "../shared/pane/skills.mjs";

// The composition preset: the handler actor + the executor and router roles.
const roles = ["executor", "router"];
const identity = `${homedir()}/.claude/actors/handler/ACTOR.md`;
const system = buildSystemInline({ role: roles });

// Name after the worktree: a `<base>--<worktree>` cwd becomes executor-<worktree>.
const dir = basename(process.cwd());
const sep = dir.indexOf("--");
const name = sep >= 0 ? `executor-${dir.slice(sep + 2)}` : "executor";

// Forward everything else verbatim to claude-sdk-cli. A leading `--` is dropped.
const passthrough = process.argv.slice(2);
if (passthrough[0] === "--") passthrough.shift();

// Pull an optional --message <value> out of the passthrough: when given (and
// the conversation is fresh), it is sent as the first message. Extracted here
// so it is not forwarded to claude-sdk-cli, which does not understand it.
let message;
const mi = passthrough.indexOf("--message");
if (mi >= 0) {
  message = passthrough[mi + 1] ?? message;
  passthrough.splice(mi, 2);
}

// The skill set rides --claudeMd: assembled into the session's CLAUDE.md
// content on every launch (fresh or resumed), cached, no turn fired.
const skills = skillsFor({ actor: "handler", role: roles });
const claudeMd = buildSkillsBlock(skills, { includeSuccess: false });

if (passthrough.includes("--doctor")) {
  console.log(`name: ${name}`);
  console.log(`actor: handler`);
  console.log(`roles: ${roles.join(", ")}`);
  console.log(`skills (${skills.length}): ${skills.join(", ")}`);
  console.log(`--system: ${system.length.toLocaleString("en-US")} chars`);
  console.log(`--claudeMd: ${claudeMd.length.toLocaleString("en-US")} chars`);
  console.log(`total: ${(system.length + claudeMd.length).toLocaleString("en-US")} chars`);
  process.exit(0);
}

const args = ["--name", name, "--system-identity", identity, "--system", system, "--claudeMd", claudeMd];

// On a fresh conversation with an explicit --message, send it as the first
// message. No default: the session opens idle otherwise.
if (message && passthrough.includes("--no-resume")) {
  args.push("--prompt", buildPrompt({ from: "the Supreme Commander", message }));
}

args.push(...passthrough);

// Launch interactively in this pane and exit with the CLI's status.
const result = spawnSync("claude-sdk-cli", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
