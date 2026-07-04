#!/usr/bin/env node
/**
 * scaffold-mission — create a new mission directory and its placeholder artefacts.
 *
 * A mission is a directory, dated once at creation (see the mission-artefacts
 * skill for the directory/artefact definition). This script is the single place
 * the date is derived and the directory is named. Every later script
 * (create-mission, update-mission) is *handed* the directory and never
 * re-derives the date or recomposes the path — that repeated derivation was the
 * bug this split removes.
 *
 * Reads JSON from stdin:
 *   {
 *     "handlerRepo": "~/repos/<org>/<handler>",   // root that holds projects/
 *     "project":     "<project-name>",
 *     "slug":        "<short-description>",
 *     "issueNumber": 179                            // optional
 *   }
 *
 * Required: handlerRepo, project, slug. Optional: issueNumber.
 *
 * The old script inferred the handler repo from its own file location
 * (__dirname/..). This script lives in the skills repo, not the handler repo, so
 * that inference no longer holds — the root is handed in, not derived from where
 * the script happens to sit.
 *
 * Composes the mission directory per the naming convention (mission-artefacts
 * skill > naming):
 *   <handlerRepo>/projects/<project>/missions/<YYYY-MM-DD>[_<issueNumber>]_<slug>/
 *
 * Writes three placeholder artefacts, each a bare heading, for the roles that
 * fill them in later:
 *   intent.md (# Intent)   — the interlocutor
 *   squad.md  (# Squad)    — the squad-selector
 *   mission.md (# Mission) — the scribe (create-mission overwrites this wholesale)
 *
 * Then commits the new directory onto the current branch, using a temporary
 * index seeded from HEAD (GIT_INDEX_FILE) so anything the caller has already
 * staged in the real index is left untouched. The commit is the boilerplate
 * skeleton; each role's filled-in content is then reviewed as a diff against it.
 *
 * Usage:
 *   echo '{...}' | node scaffold-mission.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { commitFiles } from "../../../shared/git/commit.mjs";

// Each placeholder is a bare heading — enough to orient the role that fills it
// in, with none of the content that would contaminate a fresh mission.
const PLACEHOLDERS = {
  "intent.md": "# Intent\n",
  "squad.md": "# Squad\n",
  "mission.md": "# Mission\n",
};

function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function expandPath(p) {
  if (typeof p !== "string") return p;
  return p.replace(/^~/, process.env.HOME).replace(/^\$HOME/, process.env.HOME);
}

function todayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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
  if (!config.handlerRepo) die("Missing required field: handlerRepo");
  if (!config.project) die("Missing required field: project");
  if (!config.slug) die("Missing required field: slug");
  return config;
}

// Compose the mission directory from convention. NUM is omitted when no issue
// number is supplied (releases, maintenance). Segments are underscore-separated;
// hyphens live within the description.
function composeMissionDir(handlerRepoRoot, { project, slug, issueNumber }, date) {
  const num =
    issueNumber === undefined || issueNumber === null || issueNumber === ""
      ? ""
      : `_${issueNumber}`;
  const missionDir = `${date}${num}_${slug}`;
  return join(handlerRepoRoot, "projects", project, "missions", missionDir);
}


const main = () => {
  const config = readConfig();
  const handlerRepoRoot = expandPath(config.handlerRepo);
  const date = todayDate();
  const missionDir = composeMissionDir(handlerRepoRoot, config, date);

  if (existsSync(missionDir)) {
    die(
      `Mission directory already exists: ${missionDir}. ` +
        `scaffold-mission creates a new mission; it does not re-scaffold an ` +
        `existing one.`,
    );
  }

  mkdirSync(missionDir, { recursive: true });

  const relFiles = [];
  for (const [name, content] of Object.entries(PLACEHOLDERS)) {
    const path = join(missionDir, name);
    writeFileSync(path, content, "utf-8");
    // Paths staged into git are relative to the handler repo root.
    relFiles.push(path.startsWith(handlerRepoRoot + "/")
      ? path.slice(handlerRepoRoot.length + 1)
      : path);
  }

  console.log(`✅ Scaffolded mission ${missionDir}`);
  console.log(`   ${Object.keys(PLACEHOLDERS).join(", ")}`);
  try {
    commitFiles(handlerRepoRoot, relFiles, `Scaffold mission ${missionDir}`);
  } catch (err) {
    die(err.message);
  }
};

main();
