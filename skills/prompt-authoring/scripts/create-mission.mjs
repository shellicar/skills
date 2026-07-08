#!/usr/bin/env node
/**
 * create-mission — write the operator's mission.md into an existing mission
 * directory.
 *
 * This is the fresh-render half of the old scaffold-prompt.mjs. The difference:
 * it is *handed* the mission directory (which scaffold-mission already created,
 * with a `# Mission` placeholder inside it), rather than composing a path from
 * project/slug and re-deriving today's date. It parses the date from the
 * directory name — the directory is the single source of the date now — and
 * overwrites the placeholder with the full skeleton.
 *
 * Reads JSON from stdin:
 *   {
 *     "missionDir":   "/abs/path/.../<YYYY-MM-DD>[_<num>]_<slug>",
 *     "baseRepo":     "~/repos/<org>/<repo>",
 *     "worktreeName": "<short-description>",
 *     "skillsDir":    "~/repos/shellicar/skills/skills",
 *     "phases": [
 *       { "role": "Investigator", "model": "Opus", "effort": "high" },
 *       { "role": "Courier",      "model": "Sonnet", "variant": "github" }
 *     ]
 *   }
 *
 * Required: missionDir, baseRepo, worktreeName, skillsDir, phases (non-empty).
 * Each phase needs role and model; effort is optional (low|medium|high|xhigh|
 * max); Courier needs variant (github or azure).
 *
 * Writes mission.md into missionDir, then commits it. The commit is deliberate:
 * it lands the boilerplate skeleton so the SC's review surface is the scribe's
 * filled-in content diffed against it, not the boilerplate as well. The commit
 * runs in whichever git repo holds the mission directory (found via git
 * rev-parse), using a temp index so the caller's staged work is untouched.
 *
 * Usage:
 *   echo '{...}' | node create-mission.mjs
 */

import { readFileSync, writeFileSync, existsSync, realpathSync } from "node:fs";
import { join, basename, relative } from "node:path";
import { spawnSync } from "node:child_process";

import { commitFiles } from "../../../shared/git/commit.mjs";
import {
  renderPhase,
  renderPhasesSummary,
  resolveTestament,
  materialVersion,
  expandPath,
  EFFORT_VALUES,
  FOUNDATIONAL_SKILLS_DEFAULT,
} from "./compose.mjs";

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function readConfig() {
  let raw;
  try {
    raw = readFileSync(0, "utf-8");
  } catch (err) {
    die(`Failed to read JSON from stdin: ${err.message}`);
  }
  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    die(`Invalid JSON on stdin: ${err.message}`);
  }
  if (!config.missionDir) die("Missing required field: missionDir");
  if (!config.baseRepo) die("Missing required field: baseRepo");
  if (!config.worktreeName) die("Missing required field: worktreeName");
  if (!config.skillsDir) die("Missing required field: skillsDir");
  if (!Array.isArray(config.phases) || config.phases.length === 0) {
    die("Missing or empty required field: phases");
  }
  for (const [i, phase] of config.phases.entries()) {
    if (!phase.role) die(`Phase ${i + 1}: missing role`);
    if (!phase.model) die(`Phase ${i + 1}: missing model`);
    if (phase.effort && !EFFORT_VALUES.includes(phase.effort)) {
      die(
        `Phase ${i + 1}: invalid effort "${phase.effort}" ` +
          `(expected one of: ${EFFORT_VALUES.join(", ")})`,
      );
    }
  }
  return config;
}

// The date is the directory's, not today's — the directory name is the single
// source now. It leads the basename as YYYY-MM-DD.
function dateFromMissionDir(missionDir) {
  const name = basename(missionDir);
  const m = name.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) {
    die(
      `Cannot read date from mission directory name "${name}" ` +
        `(expected a YYYY-MM-DD prefix).`,
    );
  }
  return m[1];
}

// The git repo that holds the mission directory — the handler repo. Found from
// the directory rather than handed in, keeping the input to just the directory.
function repoRootOf(dir) {
  const res = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: dir,
    encoding: "utf-8",
  });
  if (res.status !== 0) {
    die(
      `Failed to find the git repo for ${dir}: ` +
        `${(res.stderr || res.stdout || "").trim()}`,
    );
  }
  return res.stdout.trim();
}

function render(config, date) {
  const version = materialVersion();
  const deliverTo = `${config.baseRepo}--${config.worktreeName}`;
  // skillsDir is emitted verbatim — if the caller passed ~ it stays ~.
  const skillsDir = config.skillsDir.replace(/\/$/, "");
  const phases = config.phases.map((p, i) =>
    renderPhase(p, i, i === 0, config.baseRepo),
  );
  const summary = renderPhasesSummary(config.phases);
  const foundational = FOUNDATIONAL_SKILLS_DEFAULT.join(", ");

  return `---
Type: worker
Status: ready
Created: ${date}
Deliver to: ${deliverTo}
Written against version: ${version}
---

Patterns used:
- [Multi-phase mission: execute one phase only]
- [Stage approval: stage only the files you modified, do not commit (Ship phases commit and push directly), propose a short commit message]
- [Preflight: verify clean state]

Phases:
${summary}

## Mission Briefing

[What this mission achieves and why. One or two sentences.]

## Loading Skills

Load all skills using their full path, from \`${skillsDir}/<skill>/SKILL.md\`.

## Foundational Skills

Load: ${foundational}

---

${phases.join("\n\n---\n\n")}

---

## Delivery Notes

`;
}

const main = () => {
  const config = readConfig();
  const missionDir = expandPath(config.missionDir);
  if (!existsSync(missionDir)) {
    die(
      `Mission directory does not exist: ${missionDir}. ` +
        `Run scaffold-mission first — create-mission fills an existing mission, ` +
        `it does not create the directory.`,
    );
  }

  const outputPath = join(missionDir, "mission.md");
  const date = dateFromMissionDir(missionDir);

  let content;
  try {
    content = resolveTestament(render(config, date), config.baseRepo);
  } catch (err) {
    die(err.message);
  }
  writeFileSync(outputPath, content, "utf-8");
  console.log(`✅ Wrote mission to ${outputPath}`);

  const repoRoot = repoRootOf(missionDir);
  // git rev-parse returns the canonical (symlink-resolved) toplevel, so
  // canonicalise the output path too before taking the relative — otherwise a
  // /var vs /private/var mismatch makes the path look outside the repo.
  const rel = relative(repoRoot, realpathSync(outputPath));
  try {
    commitFiles(repoRoot, [rel], `Create mission ${rel}`);
  } catch (err) {
    die(err.message);
  }
};

main();
