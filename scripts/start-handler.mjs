#!/usr/bin/env node
/**
 * Start a Handler session — claude-sdk-cli with the Handler identity preset.
 *
 * The Handler's identity is one actor plus four roles, delivered as --system and
 * composed from their ACTOR.md / ROLE.md files by the shared buildSystemInline
 * (../shared/pane/envelope.mjs), which reads the file contents directly. Run
 * claude-sdk-cli bare and nothing composes that system prompt; this supplies it.
 *
 * --name is derived from the worktree this runs in. A handler's cwd is a fleet
 * worktree like `claude-fleet-eagers--customer-payments-retry`, so the name is
 * `handler-<the part after the -->` (e.g. handler-customer-payments-retry).
 * Handlers are not a singleton the way the Planner is, so the name is what tells
 * one handler from another. Falls back to `handler` if the cwd has no `--`.
 *
 * A thin wrapper. Presets: --name handler-<worktree> and the composed --system.
 * On a fresh conversation (--no-resume) it also injects the skill set via
 * --prompt as cached user context, which fires one first turn on a seed message
 * ("reorient" by default, or the value of --message); on a resume the skills are
 * already in the conversation, so they are not re-sent. Everything else
 * (including --model) is forwarded verbatim:
 *
 *   start-handler.mjs                      # CLI default resume
 *   start-handler.mjs --no-resume          # force a brand-new conversation
 *   start-handler.mjs --no-resume --message "..."  # override the seed message
 *   start-handler.mjs --resume <conv-id>   # rehydrate a Handler after a death
 *   start-handler.mjs --model claude-...   # override the default model
 *
 * A leading `--` separator is accepted and stripped. The session runs
 * interactively in the current pane and exits with claude-sdk-cli's status.
 * Exit 2 if an identity file is missing (via buildSystemInline).
 */

import { basename } from "node:path";
import { spawnSync } from "node:child_process";
import { buildSystemInline, buildPrompt } from "../shared/pane/envelope.mjs";
import { skillsFor } from "../shared/pane/skills.mjs";

// The composition preset: the Handler's actor + its four roles into --system.
const roles = ["interlocutor", "scribe", "executor", "router"];
const system = buildSystemInline({ actor: "handler", role: roles });

// Name after the worktree: a `<base>--<worktree>` cwd becomes handler-<worktree>.
const dir = basename(process.cwd());
const sep = dir.indexOf("--");
const name = sep >= 0 ? `handler-${dir.slice(sep + 2)}` : "handler";

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
