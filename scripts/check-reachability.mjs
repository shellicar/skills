#!/usr/bin/env node
/**
 * Per-unit reachability and reference check for the fleet material.
 *
 * The old fleet version answered "is every file reachable from the one root
 * file the SDK auto-loads". That premise is gone — sessions get material
 * composed at launch, not by link-walking from a single root. The questions
 * that remain are local, per skill/actor/role:
 *
 *   1. Is every file in the unit's directory reachable from the unit's own
 *      root file (SKILL.md / ACTOR.md / ROLE.md)? A template or script that
 *      nothing references is a miss — no session can be handed it, and
 *      Claude won't know how to use it.
 *   2. Does everything the unit references exist? A markdown link to a
 *      missing file, or a frontmatter entry naming a unit that isn't there
 *      (skills: [alakazham], a diagrams: entry with no .d2), is a broken
 *      reference.
 *
 * Edges followed:
 *   - Markdown links `[text](path)`. Unresolvable links are broken
 *     references.
 *   - Backtick mentions of files or directories (`scaffold-mission.mjs`,
 *     `templates/blocks/`) — prose that teaches a file's use counts as
 *     reaching it. Soft edges: they mark reachability but are never
 *     reported broken, because backticks also hold placeholders and
 *     command names. A mentioned directory reaches every file under it.
 *   - Script imports — `import ... from './x.mjs'` and `import('./x.mjs')`
 *     with a relative specifier. A helper script reached only through the
 *     script the skill's prose mentions is reachable, not an orphan.
 *
 * Exceptions (never orphans, by design): PHILOSOPHY.md and SUCCESS.md at
 * the unit root — editorial and marking files, read by editors and
 * supervisors, not reached from the runtime doc. Extend EXCEPTIONS if
 * other by-design cases surface.
 *
 * Frontmatter references checked on every unit root:
 *   - skills:   each name must exist as skills/<name>/SKILL.md
 *   - roles:    each name must exist as roles/<name>/ROLE.md
 *   - diagrams: each name must exist as docs/diagrams/<name>.d2
 *
 * Usage (from anywhere; resolves the repo from its own location):
 *   node scripts/check-reachability.mjs
 *
 * Exits 1 if any orphan or broken reference is found, else 0.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const UNIT_KINDS = [
  { dir: "skills", root: "SKILL.md" },
  { dir: "actors", root: "ACTOR.md" },
  { dir: "roles", root: "ROLE.md" },
];

// Unit-root files that are unreachable by design.
const EXCEPTIONS = new Set(["PHILOSOPHY.md", "SUCCESS.md"]);

const MD_LINK = /\[[^\]]*\]\(([^)]+)\)/g;
const MD_BACKTICK = /`([^`\n]+)`/g;
const MJS_IMPORT = /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g;

function looksLikePath(span) {
  if (span.length > 120) return false;
  if (/[\s<>|]/.test(span)) return false; // placeholders, command lines
  if (/^[a-z]+:\/\//i.test(span)) return false;
  if (span.startsWith("~") || span.startsWith("$") || span.startsWith("/")) return false;
  // a file with an extension, or an explicit directory path
  return /\.[a-z0-9]{1,5}$/i.test(span) || span.endsWith("/");
}

function isRelativeRef(ref) {
  // Markdown links in this repo are written relative to the file; skip
  // absolute URLs, home paths, and anchors.
  if (/^[a-z]+:\/\//i.test(ref)) return false;
  if (ref.startsWith("~") || ref.startsWith("$")) return false;
  if (ref.startsWith("#")) return false;
  if (ref.startsWith("/")) return false;
  return true;
}

function listFilesRecursive(absDir) {
  return readdirSync(absDir, { recursive: true })
    .map((e) => e.toString())
    .filter((e) => !e.split(sep).some((part) => part.startsWith(".")))
    .filter((e) => {
      try {
        return statSync(join(absDir, e)).isFile();
      } catch {
        return false;
      }
    });
}

function extractRefs(absPath) {
  const content = readFileSync(absPath, "utf-8");
  const hard = [];
  const soft = [];
  if (absPath.endsWith(".mjs") || absPath.endsWith(".js")) {
    for (const m of content.matchAll(MJS_IMPORT)) {
      const spec = m[1];
      if (spec.startsWith("./") || spec.startsWith("../")) hard.push(spec);
    }
  }
  if (absPath.endsWith(".md")) {
    for (const m of content.matchAll(MD_LINK)) {
      const target = m[1].split("#")[0].trim();
      if (target && isRelativeRef(target)) hard.push(target);
    }
    for (const m of content.matchAll(MD_BACKTICK)) {
      const span = m[1].trim();
      if (looksLikePath(span)) soft.push(span);
    }
  }
  return { hard, soft };
}

// Resolve a backtick mention. Tried in order: relative to the mentioning
// file, relative to the unit root, then a unique basename match within the
// unit. Returns an absolute path (file or directory) or null.
function resolveSoft(span, fileAbs, unitAbs, unitFiles) {
  const candidates = [resolve(dirname(fileAbs), span), join(unitAbs, span)];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  const base = span.replace(/\/$/, "").split("/").pop();
  const matches = [...unitFiles].filter((f) => f.split(sep).pop() === base);
  if (matches.length === 1) return join(unitAbs, matches[0]);
  return null;
}

function frontmatterOf(absPath) {
  const lines = readFileSync(absPath, "utf-8").split("\n");
  if (lines[0]?.trim() !== "---") return null;
  const fmLines = [];
  for (const line of lines.slice(1)) {
    if (line.trim() === "---") {
      try {
        return parseYaml(fmLines.join("\n"));
      } catch {
        return null;
      }
    }
    fmLines.push(line);
  }
  return null;
}

function checkFrontmatter(unitLabel, rootAbs, findings) {
  const fm = frontmatterOf(rootAbs);
  if (!fm || typeof fm !== "object") return;
  const checks = [
    { key: "skills", path: (n) => join(REPO_ROOT, "skills", n, "SKILL.md") },
    { key: "roles", path: (n) => join(REPO_ROOT, "roles", n, "ROLE.md") },
    { key: "diagrams", path: (n) => join(REPO_ROOT, "docs", "diagrams", `${n}.d2`) },
  ];
  for (const { key, path } of checks) {
    const value = fm[key];
    if (!Array.isArray(value)) continue;
    for (const name of value) {
      if (typeof name !== "string") continue;
      if (!existsSync(path(name))) {
        findings.broken.push(`${unitLabel}: frontmatter ${key}: '${name}' does not exist`);
      }
    }
  }
}

function checkUnit(kind, unitName) {
  const unitRel = join(kind.dir, unitName);
  const unitAbs = join(REPO_ROOT, unitRel);
  const rootAbs = join(unitAbs, kind.root);
  const findings = { orphans: [], broken: [], missingRoot: false };

  if (!existsSync(rootAbs)) {
    findings.missingRoot = true;
    return findings;
  }

  const unitFiles = new Set(listFilesRecursive(unitAbs)); // relative to unitAbs
  const reached = new Set();
  const visited = new Set();
  const queue = [rootAbs];

  while (queue.length > 0) {
    const fileAbs = queue.shift();
    if (visited.has(fileAbs)) continue;
    visited.add(fileAbs);

    const relToUnit = relative(unitAbs, fileAbs);
    if (!relToUnit.startsWith("..")) reached.add(relToUnit);

    if (!/\.(md|mjs|js)$/.test(fileAbs)) continue;

    const { hard, soft } = extractRefs(fileAbs);

    for (const ref of hard) {
      const targetAbs = resolve(dirname(fileAbs), ref);
      if (!existsSync(targetAbs)) {
        const fromRel = relative(REPO_ROOT, fileAbs);
        findings.broken.push(`${fromRel}: reference '${ref}' does not exist`);
        continue;
      }
      if (!visited.has(targetAbs)) queue.push(targetAbs);
    }

    for (const span of soft) {
      const targetAbs = resolveSoft(span, fileAbs, unitAbs, unitFiles);
      if (!targetAbs) continue; // soft edges are never broken references
      let isDir = false;
      try {
        isDir = statSync(targetAbs).isDirectory();
      } catch {
        continue;
      }
      if (isDir) {
        // a mentioned directory reaches every file under it
        for (const f of listFilesRecursive(targetAbs)) {
          const child = join(targetAbs, f);
          if (!visited.has(child)) queue.push(child);
        }
      } else if (!visited.has(targetAbs)) {
        queue.push(targetAbs);
      }
    }
  }

  for (const f of [...unitFiles].sort()) {
    if (reached.has(f)) continue;
    if (EXCEPTIONS.has(f)) continue;
    findings.orphans.push(join(unitRel, f));
  }

  checkFrontmatter(unitRel, rootAbs, findings);
  return findings;
}

let units = 0;
let orphanCount = 0;
let brokenCount = 0;
const missingRoots = [];

for (const kind of UNIT_KINDS) {
  const kindAbs = join(REPO_ROOT, kind.dir);
  if (!existsSync(kindAbs)) continue;
  const names = readdirSync(kindAbs, { withFileTypes: true })
    .filter((d) => !d.name.startsWith("."))
    .filter((d) => {
      try {
        return statSync(join(kindAbs, d.name)).isDirectory();
      } catch {
        return false;
      }
    })
    .map((d) => d.name)
    .sort();

  for (const name of names) {
    units += 1;
    const findings = checkUnit(kind, name);
    if (findings.missingRoot) {
      missingRoots.push(`${kind.dir}/${name} (no ${kind.root})`);
      continue;
    }
    if (findings.orphans.length === 0 && findings.broken.length === 0) continue;

    console.log(`\n${kind.dir}/${name}`);
    for (const o of findings.orphans) {
      console.log(`  orphan: ${o}`);
      orphanCount += 1;
    }
    for (const b of findings.broken) {
      console.log(`  broken: ${b}`);
      brokenCount += 1;
    }
  }
}

console.log(`\n=== Summary ===`);
console.log(`  Units checked: ${units}`);
console.log(`  Orphans (files nothing references): ${orphanCount}`);
console.log(`  Broken references: ${brokenCount}`);
if (missingRoots.length > 0) {
  console.log(`  Directories with no root file:`);
  for (const m of missingRoots) console.log(`    ${m}`);
}

process.exit(orphanCount + brokenCount > 0 ? 1 : 0);
