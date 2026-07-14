// Shared --doctor output for the start-* launchers. One shape across all six: a
// stock take of everything that would be loaded for a launch, counted by
// source, so a launch can be sized without firing claude-sdk-cli.
//
// The CLI appends --claudeMd to the CLAUDE.md files, and --system after
// SYSTEM.md — same functionality, different source. The object keeps each
// source as its own key so the distinction stays visible: what the CLI reads
// from disk (~/.claude/CLAUDE.md, ~/.claude/SYSTEM.md) versus what the launcher
// passes (--system-identity, --system, --claudeMd). Values are character
// counts, never the content itself.
//
// Safe for anyone to run: --doctor returns before the guarded spawn (see
// lib/sc-only.mjs), so it is not SC-only.

import { readFileSync, writeSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { withDependencies, FOUNDATIONAL } from "../../shared/pane/skills.mjs";

// Repo root: scripts/lib/ → two levels up. Skills live under skills/.
const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Character count of a file's content, or 0 if it cannot be read.
function count(path) {
  try {
    return readFileSync(path, "utf8").length;
  } catch {
    return 0;
  }
}

/**
 * Print the doctor stock take as JSON and exit 0. Every source the session
 * loads is counted, keyed by where it comes from:
 *  - ~/.claude/CLAUDE.md / ~/.claude/SYSTEM.md: read from disk (the CLI's roots)
 *  - --system-identity: the identity file body, bound to the conversation
 *  - --system: the composed actor/role prompt (appended after SYSTEM.md)
 *  - --claudeMd: the assembled <skills> block (appended after the CLAUDE.md files)
 *
 * `skills` is split by tier, mirroring how buildSkillsBlock emits them:
 * `inlined` (the foundational closure — full SKILL.md text inside --claudeMd)
 * and `indexed` (everything else — one <entry> line inside --claudeMd; the
 * file size shown is what a session pays on disk-read when it uses the skill,
 * not what the launch injects). `system` is null for launchers that pass no
 * --system (start-claude).
 */
export function doctor({ name, actor = null, roles = [], identity = null, system = null, claudeMd, skills = [] }) {
  const home = homedir();
  const chars = {
    "~/.claude/CLAUDE.md": count(join(home, ".claude", "CLAUDE.md")),
    "~/.claude/SYSTEM.md": count(join(home, ".claude", "SYSTEM.md")),
    "--system-identity": identity ? count(identity) : 0,
    "--system": system ? system.length : 0,
    "--claudeMd": claudeMd ? claudeMd.length : 0,
  };
  const total = Object.values(chars).reduce((a, b) => a + b, 0);
  const withTotal = (entries) => {
    const o = Object.fromEntries(entries);
    return { ...o, total: Object.values(o).reduce((a, b) => a + b, 0) };
  };
  const roleChars = withTotal(roles.map((r) => [r, count(join(REPO, "roles", r, "ROLE.md"))]));
  const foundationalSet = new Set(withDependencies(FOUNDATIONAL));
  const size = (s) => [s, count(join(REPO, "skills", s, "SKILL.md"))];
  const skillChars = {
    inlined: withTotal(skills.filter((s) => foundationalSet.has(s)).map(size)),
    indexed: withTotal(skills.filter((s) => !foundationalSet.has(s)).map(size)),
  };

  const out = { name, actor, chars: { ...chars, total }, roles: roleChars, skills: skillChars };
  writeSync(1, JSON.stringify(out, null, 2) + "\n");
  process.exit(0);
}
