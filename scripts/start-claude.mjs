#!/usr/bin/env node
import './lib/sc-only.mjs';
/**
 * Start a plain Claude session — claude-sdk-cli with the foundational skills
 * injected, and no actor or role identity.
 *
 * This is the launcher for a session that is just Claude: the skill set is the
 * foundational list (the single source in ../shared/pane/skills.mjs), expanded
 * through each skill's `skills:` frontmatter dependencies, delivered via
 * --claudeMd — cached context assembled per session, no turn fired, sent on
 * every launch (fresh or resumed). It replaces relying on the CLAUDE.md `Load:`
 * lines and the session spending its first action reading skill files.
 *
 * --name is derived from the directory this runs in: `claude-<cwd basename>`,
 * so sessions in different projects tell apart at a glance.
 *
 * A thin wrapper. On a fresh conversation (--no-resume) with --message, that
 * message is sent via --prompt as the first message; otherwise the session
 * opens idle. Everything else (including --model) is forwarded verbatim:
 *
 *   start-claude.mjs                      # CLI default resume
 *   start-claude.mjs --no-resume          # force a brand-new conversation
 *   start-claude.mjs --no-resume --message "..."  # send a first message
 *   start-claude.mjs --model claude-...   # override the default model
 *   start-claude.mjs --actor handler      # optional: actor identity via --system-identity, actor skills included
 *   start-claude.mjs --doctor             # print what would be sent, then exit
 *
 * --doctor composes exactly what a real launch would (same skillsFor and
 * buildSkillsBlock calls, includeSuccess: false) and prints the resolved name,
 * full skill list, and the --claudeMd character count — then exits without
 * touching claude-sdk-cli.
 *
 * A leading `--` separator is accepted and stripped. The session runs
 * interactively in the current pane and exits with claude-sdk-cli's status.
 * Exit 2 if a skill file is missing (via buildSkillsBlock).
 */

import { homedir } from "node:os";
import { basename } from "node:path";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { buildPrompt, buildSkillsBlock } from "../shared/pane/envelope.mjs";
import { skillsFor } from "../shared/pane/skills.mjs";

// Forward everything else verbatim to claude-sdk-cli. A leading `--` is dropped.
const passthrough = process.argv.slice(2);
if (passthrough[0] === "--") passthrough.shift();

// Pull an optional --actor <name> out of the passthrough: when given, the
// actor's ACTOR.md rides --system-identity (bound to the conversation,
// persisted, restored on resume) and its frontmatter skills join the
// foundational set. Extracted here so it is not forwarded to claude-sdk-cli.
let actor;
const ai = passthrough.indexOf("--actor");
if (ai >= 0) {
  actor = passthrough[ai + 1];
  passthrough.splice(ai, 2);
  if (!actor) {
    console.error("start-claude: --actor requires a name (e.g. --actor handler).");
    process.exit(2);
  }
}
const identity = actor ? `${homedir()}/.claude/actors/${actor}/ACTOR.md` : undefined;
if (identity && !existsSync(identity)) {
  console.error(`actor identity file not found: ${identity}`);
  process.exit(2);
}

// Name after the directory: sessions in different projects tell apart. With an
// actor, the name says who it is: <actor>-<dir>.
const name = `${actor ?? "claude"}-${basename(process.cwd())}`;

// Pull an optional --message <value> out of the passthrough: when given (and
// the conversation is fresh), it is sent as the first message. Extracted here
// so it is not forwarded to claude-sdk-cli, which does not understand it.
let message;
const mi = passthrough.indexOf("--message");
if (mi >= 0) {
  message = passthrough[mi + 1] ?? message;
  passthrough.splice(mi, 2);
}

// Foundational skills, plus the actor's own when --actor is given — expanded
// through each skill's `skills:` dependencies. Rides --claudeMd: assembled into
// the session's CLAUDE.md content on every launch, cached, no turn fired.
const skills = skillsFor(actor ? { actor } : {});
const claudeMd = buildSkillsBlock(skills, { includeSuccess: false });

if (passthrough.includes("--doctor")) {
  console.log(`name: ${name}`);
  if (actor) console.log(`actor: ${actor} (${identity})`);
  console.log(`skills (${skills.length}): ${skills.join(", ")}`);
  console.log(`--claudeMd: ${claudeMd.length.toLocaleString("en-US")} chars`);
  process.exit(0);
}

const args = ["--name", name, "--claudeMd", claudeMd];
if (identity) args.push("--system-identity", identity);

// On a fresh conversation with an explicit --message, send it as the first
// message. No default: the session opens idle otherwise.
if (message && passthrough.includes("--no-resume")) {
  args.push("--prompt", buildPrompt({ from: "the Supreme Commander", message }));
}

args.push(...passthrough);

// Launch interactively in this pane and exit with the CLI's status.
const result = spawnSync("claude-sdk-cli", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
