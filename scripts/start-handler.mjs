#!/usr/bin/env node
/**
 * Start a Handler session — claude-sdk-cli with the Handler identity preset.
 *
 * The Handler's identity is one actor plus five roles, delivered as --system and
 * composed from their ACTOR.md / ROLE.md files by the shared buildSystemInline
 * (../shared/pane/envelope.mjs), which reads the file contents directly. Run
 * claude-sdk-cli bare and nothing composes that system prompt; this supplies it.
 *
 * --name is derived from the worktree this runs in. A handler's cwd is a fleet
 * worktree like `claude-fleet-eagers--customer-payments-retry`, so the name is
 * `handler-<the part after the -->` (e.g. handler-customer-payments-retry).
 * There is one Planner, but handlers are many, so the name is what tells
 * one handler from another. Falls back to `handler` if the cwd has no `--`.
 *
 * A thin wrapper. Presets: --name handler-<worktree>, the composed --system,
 * and the skill set via --claudeMd — cached context assembled per session, no
 * turn fired, sent on every launch (fresh or resumed). On a fresh conversation
 * (--no-resume) with --message, that message is sent via --prompt as the first
 * message; otherwise the session opens idle. Everything else
 * (including --model) is forwarded verbatim:
 *
 *   start-handler.mjs                      # CLI default resume
 *   start-handler.mjs --no-resume          # force a brand-new conversation
 *   start-handler.mjs --no-resume --message "..."  # send a first message
 *   start-handler.mjs --resume <conv-id>   # rehydrate a Handler after a death
 *   start-handler.mjs --model claude-...   # override the default model
 *
 * A leading `--` separator is accepted and stripped. The session runs
 * interactively in the current pane and exits with claude-sdk-cli's status.
 * Exit 2 if an identity file is missing (via buildSystemInline).
 */

import { basename } from "node:path";
import { spawnSync } from "node:child_process";
import { buildSystemInline, buildPrompt, buildSkillsBlock } from "../shared/pane/envelope.mjs";
import { skillsFor, HANDLER_ROLES } from "../shared/pane/skills.mjs";

// The composition preset: the Handler's actor + its five roles into --system.
// The role list is the shared HANDLER_ROLES constant, so every handler launch
// path composes the same identity.
const roles = HANDLER_ROLES;
const system = buildSystemInline({ actor: "handler", role: roles });

// Name after the worktree: a `<base>--<worktree>` cwd becomes handler-<worktree>.
const dir = basename(process.cwd());
const sep = dir.indexOf("--");
const name = sep >= 0 ? `handler-${dir.slice(sep + 2)}` : "handler";

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
const args = ["--name", name, "--system", system, "--claudeMd", buildSkillsBlock(skills)];

// On a fresh conversation with an explicit --message, send it as the first
// message. No default: the session opens idle otherwise.
if (message && passthrough.includes("--no-resume")) {
  args.push("--prompt", buildPrompt({ from: "the Supreme Commander", message }));
}

args.push(...passthrough);

// Launch interactively in this pane and exit with the CLI's status.
const result = spawnSync("claude-sdk-cli", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
