// Phase composition for the mission scripts — the shared toolkit create-mission
// and update-mission both use to turn a phase spec (role, model, effort) into a
// composed phase block. It lives inside prompt-authoring because only these two
// scripts, both in this skill, use it; block composition is not shared across
// skills, so it stays in-skill rather than in top-level shared/.
//
// The phase blocks are a sibling of this script under the skill
// (../templates/blocks). Resolving them relative to this module is correct: the
// blocks and the scripts are co-located in the skills repo by design — a fixed
// internal relationship, not the external handler-repo location the old script
// used to guess from __dirname.
//
// Errors throw; the CLI entry points catch and report them.

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
// This script is at scripts/compose.mjs; the blocks are one level up under
// templates/blocks.
const BLOCKS_DIR = resolve(__dirname, "..", "templates", "blocks");
// The skills repo is the material that shapes a mission now — the blocks live
// here. "Written against version" records this repo's HEAD, so the mission
// carries the material version it was authored against. The script sits inside
// the repo, so its own directory is a point inside that repo's work tree.
const MATERIAL_ROOT = __dirname;

export const ROLE_TO_BLOCK = {
  Investigator: "investigation.md",
  Apostle: "apostle.md",
  Scaffolder: "red.md",
  Builder: "green.md",
  Maker: "code.md",
  Apprentice: "apprentice.md",
  Cleaner: "cleaner.md",
  Architect: "system-design.md",
  Engineer: "class-design.md",
  Scout: "codebase-discovery.md",
  Reviewer: "code-review.md",
  Writer: "writer.md",
  Postmaster: "postmaster.md",
};

export const COURIER_VARIANTS = {
  github: "courier-github.md",
  azure: "courier-azure.md",
};

// Valid claude-sdk-cli thinking-effort values, mirrored from the CLI. Optional
// per phase: when set it renders as an `Effort:` line and the Router passes it
// through to the cast launch. Omitted → the cast inherits the CLI's default.
export const EFFORT_VALUES = ["low", "medium", "high", "xhigh", "max"];

// The default foundational-skills set emitted into a fresh mission as a starting
// point; the scribe prunes per-cast (drop safe-operations in a sandbox, add
// co-working when co-working applies).
export const FOUNDATIONAL_SKILLS_DEFAULT = [
  "claude-philosophy",
  "specification-discipline",
  "transparency",
  "commander-protocol",
  "teapot-protocol",
  "executive-communication",
  "clear-communication",
  "system-glossary",
  "safe-operations",
];

function fail(msg) {
  throw new Error(msg);
}

export function expandPath(p) {
  if (typeof p !== "string") return p;
  return p.replace(/^~/, process.env.HOME).replace(/^\$HOME/, process.env.HOME);
}

// The short SHA of the material repo (the skills repo this script lives in),
// captured at authoring time so the mission records which material version it
// was written against.
export function materialSha() {
  const res = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: MATERIAL_ROOT,
    encoding: "utf-8",
  });
  if (res.status !== 0) {
    fail(
      `Failed to read material SHA from ${MATERIAL_ROOT}: ` +
        `${(res.stderr || res.stdout || "").trim()}`,
    );
  }
  return res.stdout.trim();
}

// The full "Written against version" value: `<repo>@<commit>`, per
// mission-artefacts ("The mission.md header fields"). The repo name is the
// material repo's directory name, read from git rather than hard-coded so the
// value stays truthful if the repo is checked out under another name.
export function materialVersion() {
  const res = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: MATERIAL_ROOT,
    encoding: "utf-8",
  });
  if (res.status !== 0) {
    fail(
      `Failed to read material repo root from ${MATERIAL_ROOT}: ` +
        `${(res.stderr || res.stdout || "").trim()}`,
    );
  }
  const repoName = res.stdout.trim().split("/").pop();
  return `${repoName}@${materialSha()}`;
}

function loadBlock(path) {
  if (!existsSync(path)) fail(`Block not found: ${path}`);
  return readFileSync(path, "utf-8");
}

function blockPathFor(phase, index) {
  if (phase.role === "Courier") {
    if (!phase.variant) {
      fail(`Phase ${index + 1}: Courier requires variant (github or azure)`);
    }
    const file = COURIER_VARIANTS[phase.variant];
    if (!file) {
      fail(
        `Phase ${index + 1}: unknown Courier variant "${phase.variant}" ` +
          `(expected: github, azure)`,
      );
    }
    return join(BLOCKS_DIR, file);
  }
  const file = ROLE_TO_BLOCK[phase.role];
  if (!file) {
    fail(
      `Phase ${index + 1}: unknown role "${phase.role}" ` +
        `(expected one of: ${Object.keys(ROLE_TO_BLOCK).join(", ")}, Courier)`,
    );
  }
  return join(BLOCKS_DIR, file);
}

// Inject Preflight after ## SKILLS in the first phase. Skipped when the block
// already carries its own Preflight section (the Apostle does, with stricter
// preflight rules — see apostle.md).
function injectPreflight(blockText) {
  if (/^## Preflight$/m.test(blockText)) return blockText;

  const preflightSection = loadBlock(join(BLOCKS_DIR, "preflight.md"))
    .replace(/^# Block: Preflight\n+/, "")
    .replace(/^\[Include at the start of the first phase only\.\]\n+/m, "")
    .trim();

  const skillsRegex = /^## SKILLS$[\s\S]*?(?=^## )/m;
  const match = blockText.match(skillsRegex);
  if (!match) {
    fail(
      "First phase block has no ## SKILLS section; cannot place Preflight. " +
        "Check the block file.",
    );
  }
  const skillsSection = match[0];
  return blockText.replace(
    skillsSection,
    `${skillsSection.trimEnd()}\n\n${preflightSection}\n\n`,
  );
}

// The operator's role is composed into --system at launch, so a generated
// mission no longer references an agent file. Strip the whole "Agents" block
// from each phase rather than stamping a now-non-existent path into it.
function stripAgentBlocks(text) {
  return text.replace(
    /^#{2,3} Agents\n\n<!-- Handler: Use the absolute path to agents\/operators\/[a-z]+\.md in your Handler repo\. -->\nRead and follow `\[absolute path to \w+ agent\]`\.\n\n/gm,
    "",
  );
}

// Decide where operators write their testament by asking git whether the target
// repo commits .claude/testament. Not ignored (committed) → the short form (the
// harness writes to the worktree). Ignored (throwaway worktree) or any error →
// redirect to the main repo so the testament survives worktree removal. The
// probe is a .md sentinel because repos commonly ignore .claude wholesale but
// negate **/*.md back in; the extension is what the ignore rule keys on.
function testamentLine(baseRepo) {
  const res = spawnSync(
    "git",
    ["check-ignore", "-q", ".claude/testament/_sentinel_.md"],
    { cwd: expandPath(baseRepo) },
  );
  return res.status === 1
    ? "Write your testament."
    : `Write your testament to \`${baseRepo}/.claude/testament/YYYY-MM-DD.md\`.`;
}

// Replace the testament placeholder block (the Handler-pick comment plus both
// candidate lines) with the single resolved line. Only the unresolved
// placeholder matches, so this is safe to run over upsert output where existing
// phases may already be resolved.
export function resolveTestament(text, baseRepo) {
  const line = testamentLine(baseRepo);
  const placeholder =
    /<!-- Handler: worktree → keep the full-path line\. Otherwise → keep the short\. -->\n\nWrite your testament\.\n\nWrite your testament to `<full-path-to-main-repo>\/\.claude\/testament\/YYYY-MM-DD\.md`\./g;
  return text.replace(placeholder, () => line);
}

// Compose one phase block: load the role's block, renumber it, substitute the
// model (and optional Effort line), strip the agent block, and inject Preflight
// on the first phase.
export function renderPhase(phase, index, isFirst, baseRepo) {
  const path = blockPathFor(phase, index);
  let text = loadBlock(path);

  text = text.replace(/^# Phase N\b/m, `# Phase ${index + 1}`);

  text = text.replace(
    /^Model: \[model\]$/m,
    phase.effort
      ? `Model: ${phase.model}\nEffort: ${phase.effort}`
      : `Model: ${phase.model}`,
  );

  text = stripAgentBlocks(text);

  if (isFirst) {
    text = injectPreflight(text);
  }

  return text.trim();
}

// The phases summary mirrors what real missions carry: role and model only. The
// Courier variant is a composition detail, not summary content.
export function renderPhasesSummary(phases) {
  return phases.map((p, i) => `${i + 1}. ${p.role} (${p.model})`).join("\n");
}
