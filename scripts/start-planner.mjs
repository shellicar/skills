#!/usr/bin/env node
/**
 * Start a Planner session — claude-sdk-cli with the Planner identity preset.
 *
 * The Planner's identity (actor + role) is delivered as --system, composed from
 * ~/.claude/actors/planner/ACTOR.md + ~/.claude/roles/{scheduler,launcher,coach}/ROLE.md by the
 * shared buildSystemInline (../shared/pane/envelope.mjs), which reads the file
 * contents directly. Run claude-sdk-cli bare and nothing composes that system
 * prompt, so the session is a bare CLI, not a Planner. You *start* the Planner
 * (the root session); the Planner then *launches* Handlers.
 *
 * A thin wrapper, not an orchestrator. Presets: --name planner, the composed
 * --system, and the skill set via --claudeMd — cached context assembled per
 * session, no turn fired, sent on every launch (fresh or resumed). On a fresh
 * conversation (--no-resume) with --message, that message is sent via --prompt
 * as the first message; otherwise the session opens idle.
 * Everything else (including --model) is forwarded verbatim:
 *
 *   start-planner.mjs                      # CLI default resume
 *   start-planner.mjs --no-resume          # force a brand-new conversation
 *   start-planner.mjs --no-resume --message "..."  # send a first message
 *   start-planner.mjs --resume <conv-id>   # rehydrate a Planner after a death
 *   start-planner.mjs --model claude-...   # override the default model
 *
 * A leading `--` separator is accepted and stripped.
 *
 * It creates no tmux session/window/pane — that is yours. It only tags the pane
 * it already runs in (@role/@title/@colour) so the status bar reads "Planner";
 * outside tmux it skips the tags and still launches. The session runs
 * interactively in the current pane; this process waits on claude-sdk-cli and
 * exits with its status. Exit 2 if a planner identity file is missing (via
 * buildSystemInline).
 */

import { execFileSync, spawnSync } from "node:child_process";
import { buildSystemInline, buildPrompt, buildSkillsBlock } from "../shared/pane/envelope.mjs";
import { skillsFor } from "../shared/pane/skills.mjs";

// The composition preset: the Planner's actor + its three roles into --system.
const system = buildSystemInline({ actor: "planner", role: ["scheduler", "launcher", "coach"] });

// Tag the current pane so the status bar reads "Planner". Pane/window creation
// is the SC's; this only labels what already exists. Skipped cleanly outside tmux.
const pane = process.env.TMUX_PANE;
if (pane) {
  execFileSync("tmux", ["set-option", "-p", "-t", pane, "@role", "planner"]);
  execFileSync("tmux", ["set-option", "-w", "-t", pane, "@title", "Planner"]);
  execFileSync("tmux", ["set-option", "-w", "-t", pane, "@colour", "green"]);
} else {
  console.error("not in tmux (TMUX_PANE unset); skipping @role/@title/@colour tags.");
}

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
const skills = skillsFor({ actor: "planner", role: ["scheduler", "launcher", "coach"] });
const args = ["--name", "planner", "--system", system, "--claudeMd", buildSkillsBlock(skills)];

// On a fresh conversation with an explicit --message, send it as the first
// message. No default: the session opens idle otherwise.
if (message && passthrough.includes("--no-resume")) {
  args.push("--prompt", buildPrompt({ from: "the Supreme Commander", message }));
}

args.push(...passthrough);

// Launch interactively in this pane and exit with the CLI's status.
const result = spawnSync("claude-sdk-cli", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
