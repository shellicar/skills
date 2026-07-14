#!/usr/bin/env node
/**
 * Start a Scribe session — the Handler actor carrying only the scribe role.
 *
 * Identity: the handler actor + the scribe role, delivered as --system and
 * composed by the shared buildSystemInline (../shared/pane/envelope.mjs), which
 * reads the file contents directly. One of the catch-all handler-family
 * launchers (handler, scribe, executor): same actor, a narrower set of roles.
 *
 * --name is derived from the worktree: a `<base>--<worktree>` cwd becomes
 * scribe-<worktree> (falls back to `scribe`). The skill set rides --claudeMd —
 * cached context assembled per session, no turn fired, sent on every launch
 * (fresh or resumed). On a fresh conversation (--no-resume) with --message,
 * that message is sent via --prompt as the first message; otherwise the
 * session opens idle. Everything else is forwarded verbatim, including --model; a leading
 * `--` separator is accepted and stripped.
 * Runs interactively in the current pane and exits with claude-sdk-cli's status.
 * --doctor prints a JSON object of everything that would be loaded — the
 * ~/.claude CLAUDE.md/SYSTEM.md files, --system-identity, --system and
 * --claudeMd — then exits without touching claude-sdk-cli.
 * Exit 2 if an identity file is missing (via buildSystemInline).
 */

import { homedir } from "node:os";
import { basename } from "node:path";
import { buildSystemInline, buildPrompt, buildSkillsBlock } from "../shared/pane/envelope.mjs";
import { skillsFor } from "../shared/pane/skills.mjs";
import { spawnCli } from "./lib/sc-only.mjs";
import { doctor } from "./lib/doctor.mjs";

// The actor is the standing identity — bound to the conversation via
// --system-identity, persisted, restored on resume. The role rides --system.
const identity = `${homedir()}/.claude/actors/handler/ACTOR.md`;
const system = buildSystemInline({ role: "scribe" });

// Name after the worktree: a `<base>--<worktree>` cwd becomes scribe-<worktree>.
const dir = basename(process.cwd());
const sep = dir.indexOf("--");
const name = sep >= 0 ? `scribe-${dir.slice(sep + 2)}` : "scribe";

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
const skills = skillsFor({ actor: "handler", role: "scribe" });
const claudeMd = buildSkillsBlock(skills, { includeSuccess: false });

if (passthrough.includes("--doctor")) {
  doctor({ name, actor: "handler", roles: ["scribe"], identity, system, claudeMd, skills });
}

const args = ["--name", name, "--system-identity", identity, "--system", system, "--claudeMd", claudeMd];

// On a fresh conversation with an explicit --message, send it as the first
// message. No default: the session opens idle otherwise.
if (message && passthrough.includes("--no-resume")) {
  args.push("--prompt", buildPrompt({ from: "the Supreme Commander", message }));
}

args.push(...passthrough);

// Launch interactively in this pane and exit with the CLI's status.
spawnCli(args);
