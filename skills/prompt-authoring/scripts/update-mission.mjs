#!/usr/bin/env node
/**
 * update-mission — add phases to an existing mission.md as the mission runs.
 *
 * This is the upsert half of the old scaffold-prompt.mjs. Like create-mission it
 * is *handed* the mission directory rather than composing a path or deriving a
 * date. It expects a mission.md that create-mission already wrote (frontmatter,
 * phases, Delivery Notes) and reconciles its phases against the phase list it is
 * given, keyed by position:
 *   - Position present in the file: kept verbatim (preserves handler-authored
 *     content, status changes, supervisor verifications). A role mismatch warns
 *     and the file wins.
 *   - Position absent from the file but present in the input: composed and
 *     inserted.
 *   - File phases beyond the input's length: kept untouched.
 * The phases summary line is rewritten to match; the rest of the prelude and the
 * Delivery Notes are left alone.
 *
 * It does NOT commit. Unlike a fresh mission (create-mission), an existing
 * mission.md already lives in whatever state the scribe or a previous run put it
 * in, and a blind follow-up commit would obscure that — the review point was the
 * create-mission commit.
 *
 * Reads JSON from stdin:
 *   {
 *     "missionDir": "/abs/path/.../<YYYY-MM-DD>[_<num>]_<slug>",
 *     "baseRepo":   "~/repos/<org>/<repo>",
 *     "phases": [
 *       { "role": "Investigator", "model": "Opus" },
 *       { "role": "Maker",        "model": "Opus" }
 *     ]
 *   }
 *
 * Required: missionDir, baseRepo, phases (non-empty). baseRepo is used to render
 * any newly inserted phases (testament resolution, phase composition).
 *
 * Usage:
 *   echo '{...}' | node update-mission.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  renderPhase,
  renderPhasesSummary,
  resolveTestament,
  expandPath,
  EFFORT_VALUES,
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
  if (!Array.isArray(config.phases) || config.phases.length === 0) {
    die("Missing or empty required field: phases");
  }
  for (const [i, phase] of config.phases.entries()) {
    if (!phase.role) die(`Phase ${i + 1}: missing role`);
    if (phase.effort && !EFFORT_VALUES.includes(phase.effort)) {
      die(
        `Phase ${i + 1}: invalid effort "${phase.effort}" ` +
          `(expected one of: ${EFFORT_VALUES.join(", ")})`,
      );
    }
  }
  return config;
}

// Parse an existing mission.md into its structural pieces. Returns null if the
// file does not exist; dies if it exists but is not in a shape this can update.
function parseExistingFile(outputPath) {
  if (!existsSync(outputPath)) return null;
  const content = readFileSync(outputPath, "utf-8");

  const fmMatch = content.match(/^(---\n[\s\S]*?\n---\n)/);
  if (!fmMatch) {
    die(`Existing file ${outputPath} has no frontmatter; cannot update.`);
  }
  const frontmatter = fmMatch[1];
  const body = content.slice(frontmatter.length);

  const phaseHits = [...body.matchAll(/^# Phase (\d+)\b/gm)];
  const deliveryMatch = body.match(/^## Delivery Notes\b/m);
  if (!deliveryMatch) {
    die(
      `Existing file ${outputPath} has no '## Delivery Notes' section; ` +
        `cannot update.`,
    );
  }

  // Prelude runs from the start of the body to the first phase header (or to
  // Delivery Notes if there are no phases yet). Strip the trailing `---\n\n`
  // separator so the reconstruction can re-add it consistently.
  const preludeEnd =
    phaseHits.length > 0 ? phaseHits[0].index : deliveryMatch.index;
  let prelude = body.slice(0, preludeEnd);
  prelude = prelude.replace(/\n*---\n+$/, "\n\n");

  const phases = phaseHits.map((hit, i) => {
    const start = hit.index;
    const end =
      i + 1 < phaseHits.length ? phaseHits[i + 1].index : deliveryMatch.index;
    let block = body.slice(start, end);
    // Strip the trailing `\n---\n\n` separator that introduces the next phase
    // (or Delivery Notes). The block ends at its content.
    block = block.replace(/\n+---\n+$/, "").trimEnd();
    const position = parseInt(hit[1], 10);
    const roleMatch = block.match(/^Role:\s*(\S+)/m);
    const modelMatch = block.match(/^Model:\s*(\S+)/m);
    return {
      position,
      role: roleMatch ? roleMatch[1] : null,
      model: modelMatch ? modelMatch[1] : null,
      block,
    };
  });

  const postlude = body.slice(deliveryMatch.index);

  return { frontmatter, prelude, phases, postlude };
}

// Reconcile existing phases with the input's phase spec by position. Returns
// { phases, warnings }. Phases is the final ordered list (role, model, block).
function reconcilePhases(existing, jsonPhases, baseRepo) {
  const warnings = [];
  const byPosition = new Map(existing.map((p) => [p.position, p]));
  const existingMaxPos =
    existing.length > 0 ? Math.max(...existing.map((p) => p.position)) : 0;
  const maxPos = Math.max(existingMaxPos, jsonPhases.length);

  const finalPhases = [];
  for (let pos = 1; pos <= maxPos; pos++) {
    const fromFile = byPosition.get(pos);
    const fromJson = jsonPhases[pos - 1];

    if (fromFile) {
      // File wins on existing positions. Warn if the input disagrees.
      if (fromJson && fromFile.role !== fromJson.role) {
        warnings.push(
          `Phase ${pos}: input specifies "${fromJson.role}", file has ` +
            `"${fromFile.role}". Keeping existing phase; input ignored at ` +
            `this position.`,
        );
      }
      finalPhases.push({
        role: fromFile.role,
        model: fromFile.model || "Opus",
        block: fromFile.block,
      });
    } else if (fromJson) {
      // Position absent from the file; compose it.
      const isFirst = pos === 1;
      const block = renderPhase(fromJson, pos - 1, isFirst, baseRepo);
      finalPhases.push({
        role: fromJson.role,
        model: fromJson.model,
        block,
      });
    }
    // else: gap in existing phases the input does not fill. Skip silently.
  }

  return { phases: finalPhases, warnings };
}

function renderUpdated(existing, finalPhases) {
  const newSummary = renderPhasesSummary(finalPhases);
  // Replace the `Phases:` summary block; leave the rest of the prelude alone.
  const updatedPrelude = existing.prelude.replace(
    /^Phases:\n(?:\d+\. [^\n]+\n)+/m,
    `Phases:\n${newSummary}\n`,
  );

  const phasesText = finalPhases.map((p) => p.block.trim()).join("\n\n---\n\n");

  return (
    existing.frontmatter +
    updatedPrelude +
    "---\n\n" +
    phasesText +
    "\n\n---\n\n" +
    existing.postlude
  );
}

const main = () => {
  const config = readConfig();
  const missionDir = expandPath(config.missionDir);
  const outputPath = join(missionDir, "mission.md");

  const existing = parseExistingFile(outputPath);
  if (!existing) {
    die(
      `No mission.md at ${outputPath}. update-mission adds phases to a mission ` +
        `create-mission already wrote; it does not create one.`,
    );
  }

  let content;
  let insertedCount;
  try {
    const { phases, warnings } = reconcilePhases(
      existing.phases,
      config.phases,
      config.baseRepo,
    );
    for (const w of warnings) {
      console.warn(`⚠️  ${w}`);
    }
    content = resolveTestament(renderUpdated(existing, phases), config.baseRepo);
    insertedCount = phases.length - existing.phases.length;
  } catch (err) {
    die(err.message);
  }

  writeFileSync(outputPath, content, "utf-8");
  if (insertedCount > 0) {
    console.log(
      `✏️  Updated ${outputPath} (inserted ${insertedCount} phase(s); ` +
        `${existing.phases.length} existing kept).`,
    );
  } else {
    console.log(`✏️  Updated ${outputPath} (no new phases; existing untouched).`);
  }
};

main();
