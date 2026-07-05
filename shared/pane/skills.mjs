// The skill set each actor/role loads, read from the ACTOR.md / ROLE.md
// frontmatter.
//
// The `skills:` lists (and each actor's `roles:`) live in the identity files
// themselves — each file is the single source for what it loads. This module
// parses them at load time from ~/.claude (the same base envelope.mjs reads),
// replacing the hand-kept mirror that used to be hard-coded here.
//
// FOUNDATIONAL stays hard-coded: it mirrors the `Load:` lines in
// ~/.claude/CLAUDE.md, which has no frontmatter to read.

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";

const BASE = join(homedir(), ".claude");

// Loaded by every session (the CLAUDE.md `Load:` lines).
const FOUNDATIONAL = [
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

// Actors that co-work: they share the SC's single repo rather than running in
// their own worktree. The planner does; handlers get their own worktree and do
// not. (co-working is the one foundational skill that is not universal.)
const COWORKING_ACTORS = new Set(["planner"]);

// Parse the YAML frontmatter block of an identity file. A named actor/role
// whose file is missing is a critical failure — the identity cannot be
// composed — so this throws rather than silently returning nothing.
function frontmatter(path) {
  const src = readFileSync(path, "utf8");
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  return m ? (parse(m[1]) ?? {}) : {};
}

const actorMeta = (actor) => frontmatter(join(BASE, "actors", actor, "ACTOR.md"));
const roleMeta = (role) => frontmatter(join(BASE, "roles", role, "ROLE.md"));

// The handler's full role set, from its ACTOR.md `roles:`. One session carries
// all of them because there is no dynamic role switching yet: the handler moves
// through its roles within one session, so all must be present at launch.
// Exported so every handler launch path (start-handler, launch-handler)
// composes the same identity.
export const HANDLER_ROLES = actorMeta("handler").roles ?? [];

/**
 * The full skill set for a session: foundational, plus co-working when the actor
 * co-works, plus the actor's own skills (ACTOR.md frontmatter), plus each role's
 * skills (ROLE.md frontmatter). De-duplicated, order preserved (foundational
 * first). `role` accepts a single name or an array. Throws if a named actor or
 * role file is missing.
 */
export function skillsFor({ actor, role }) {
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  const names = [...FOUNDATIONAL];
  if (COWORKING_ACTORS.has(actor)) names.push("co-working");
  if (actor) names.push(...(actorMeta(actor).skills ?? []));
  for (const r of roles) names.push(...(roleMeta(r).skills ?? []));
  return [...new Set(names)];
}
