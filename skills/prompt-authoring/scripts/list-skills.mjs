#!/usr/bin/env node
/**
 * List the frontmatter from every SKILL.md under a skills directory.
 *
 * Default skills directory: the skills/ directory of the checkout this
 * script lives in — the same own-checkout resolution the loaders use, so a
 * worktree lists its own branch's skills. Override with a single positional
 * arg: a directory path (e.g. ~/.claude/skills for the enabled-only
 * symlink farm).
 *
 * For each SKILL.md found, prints just the `name` and `description` from
 * the frontmatter. The rest of the frontmatter (user-invocable, category,
 * etc.) is dropped because what matters when choosing skills for a prompt
 * is the trigger (which lives in the description) and the name.
 *
 * The directory name is checked against the frontmatter `name:` field;
 * if they differ, a warning goes to stderr.
 *
 * Skips directories without a SKILL.md and directories whose names start
 * with a dot.
 *
 * Usage:
 *   node skills/prompt-authoring/scripts/list-skills.mjs
 *   node skills/prompt-authoring/scripts/list-skills.mjs ~/some/other/skills/dir
 *
 * Filter with grep on the output, e.g.:
 *   node skills/prompt-authoring/scripts/list-skills.mjs | grep -B1 -A4 'typescript'
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

// This file lives at skills/prompt-authoring/scripts/; the skills root is
// two levels up from the script's own directory.
const DEFAULT_SKILLS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const skillsDir = process.argv[2] ?? DEFAULT_SKILLS_DIR;

// Don't filter by Dirent.isDirectory() — symlinks to directories report false.
// The statSync(skillPath) inside the loop follows symlinks and is the real gate:
// anything without a readable SKILL.md is skipped.
const entries = readdirSync(skillsDir)
  .filter((name) => !name.startsWith('.'))
  .sort();

let printed = 0;
for (const name of entries) {
  const skillPath = join(skillsDir, name, 'SKILL.md');
  try {
    statSync(skillPath);
  } catch {
    continue;
  }
  const content = readFileSync(skillPath, 'utf8');
  const lines = content.split('\n');
  let inFm = false;
  const fmLines = [];
  for (const line of lines) {
    if (line.trim() === '---') {
      if (!inFm) {
        inFm = true;
        continue;
      }
      break;
    }
    if (inFm) fmLines.push(line);
  }
  if (!fmLines.length) continue;

  let fm;
  try {
    fm = parseYaml(fmLines.join('\n'));
  } catch (err) {
    console.error(`WARNING: ${name}/SKILL.md frontmatter failed to parse: ${err.message}`);
    continue;
  }
  if (fm == null || typeof fm !== 'object') {
    console.error(`WARNING: ${name}/SKILL.md frontmatter is empty or not an object`);
    continue;
  }

  const fmName = typeof fm.name === 'string' ? fm.name.trim() : null;
  const description = typeof fm.description === 'string' ? fm.description.replace(/\s+$/, '') : '';

  if (fmName === null) {
    console.error(`WARNING: ${name}/SKILL.md has no 'name:' field in frontmatter`);
  } else if (fmName !== name) {
    console.error(`WARNING: directory '${name}' has frontmatter name '${fmName}'`);
  }
  console.log(fmName ?? name);
  if (description) {
    console.log(description.split('\n').map((l) => `  ${l}`).join('\n'));
  }
  console.log('');
  printed += 1;
}

console.error(`Listed ${printed} skill${printed === 1 ? '' : 's'} from ${skillsDir}`);
