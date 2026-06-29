#!/usr/bin/env node
/**
 * Start a Planner session — claude-sdk-cli with the Planner identity preset.
 *
 * WHY THIS EXISTS
 * The Planner's identity (actor + role) is delivered as `--system`, composed
 * from `~/.claude/actors/planner/ACTOR.md` + `~/.claude/roles/planner/ROLE.md`.
 * Run `claude-sdk-cli` directly and nothing composes that system prompt, so the
 * session is a bare CLI, not a Planner. This is the entry point that supplies
 * it — the `start-planner.mjs` box in the runtime diagram, and the Planner-side
 * sibling of `launch-handler.mjs`. (Naming: you *start* the Planner, the root
 * session; the Planner then *launches* Handlers.)
 *
 * WHAT IT IS — claude-sdk-cli with presets
 * A thin wrapper, not an orchestrator. Its presets are `--name planner`, the
 * composed `--system`, and a default model (Opus). Everything else is forwarded
 * straight through, so resume behaviour is yours to choose:
 *
 *   start-planner.mjs                      # fresh-ish; CLI default resume
 *   start-planner.mjs --no-resume          # force a brand-new conversation
 *   start-planner.mjs --resume <conv-id>   # rehydrate a Planner after a death
 *   start-planner.mjs --model claude-...   # override the default model
 *
 * A leading `--` separator is accepted and stripped:
 *   start-planner.mjs -- --resume <conv-id>
 *
 * SHARED COMPOSITION
 * `--system` is built by the shared `buildSystem` (../shared/pane.mjs), the same
 * helper the dispatch launchers use. One source of truth for the actor/role XML
 * format — no inlined second copy to drift. That is why this lives in the skills
 * repo next to its siblings rather than standalone in fleet/.
 *
 * NO TMUX MAGIC
 * It creates no session, window, or pane — that is yours. It only *tags* the
 * pane it already runs in (`@role`, `@title`, `@colour`) so the status bar reads
 * "Planner". Outside tmux it skips the tags and still launches.
 *
 * The session runs interactively in the current pane (stdio inherited); this
 * process waits on claude-sdk-cli and exits with its status. Exit 2 if a planner
 * identity file is missing (via buildSystem).
 */

import { execFileSync, spawnSync } from "node:child_process";
import { buildSystem } from "../shared/pane.mjs";

// The composition preset: the Planner's identity (actor + role) into --system.
const system = buildSystem({ actor: "planner", role: "planner" });

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

// Presets first, then passthrough. The default model applies only when the
// caller hasn't supplied their own --model.
const args = ["--name", "planner", "--system", system];
if (!passthrough.includes("--model")) args.push("--model", "claude-opus-4-8");
args.push(...passthrough);

// Launch interactively in this pane and exit with the CLI's status.
const result = spawnSync("claude-sdk-cli", args, { stdio: "inherit" });
process.exit(result.status ?? 1);
