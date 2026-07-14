// The skill set each actor/role loads, read from the ACTOR.md / ROLE.md
// frontmatter.
//
// The `skills:` lists (and each actor's `roles:`) live in the identity files
// themselves — each file is the single source for what it loads. This module
// parses them at load time from its own repo checkout (the same base
// envelope.mjs reads), replacing the hand-kept mirror that used to be
// hard-coded here. Resolving relative to the module — not through ~/.claude,
// whose symlinks always point at the main checkout — keeps every checkout
// self-consistent: a worktree composes from its own branch.
//
// FOUNDATIONAL stays hard-coded: it is the single source for the every-session
// set. (It once mirrored the CLAUDE.md `Load:` lines; those are gone — skills
// reach sessions by injection, not by hand-loading.)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

// The repo root this module lives in: shared/pane/ → two levels up. Skills
// live under skills/, identities under actors/ and roles/, all beside it.
const BASE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Loaded by every session. Exported so the dispatch path (launchCli) unions it
// into every cast's set — no caller hand-carries the foundational skills.
export const FOUNDATIONAL = [
  "specification-discipline",
  "commander-protocol",
  "teapot-protocol",
  "communication-fundamentals",
  "voice-claude",
  "audience-stephen",
  "audience-sc",
  "system-glossary",
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

/**
 * The actor-level `skills:` from ACTOR.md frontmatter — the skills an actor
 * loads whatever role it is in (testament, tmux, ...). Exported so the dispatch
 * path (launchCli) can union them into every cast's skill set: the mission's
 * Load: lines carry role- and task-level skills, and without this union the
 * actor-level ones were never delivered to operators or supervisors at all.
 */
export function actorSkills(actor) {
  return actor ? (actorMeta(actor).skills ?? []) : [];
}
const roleMeta = (role) => frontmatter(join(BASE, "roles", role, "ROLE.md"));

const skillMeta = (name) => {
  try {
    return frontmatter(join(BASE, "skills", name, "SKILL.md"));
  } catch (e) {
    if (e.code === "ENOENT") throw new Error(`skill not found: ${name}`);
    throw e;
  }
};

/**
 * Expand a skill list with each skill's own `skills:` frontmatter dependencies,
 * transitively. A skill's dependencies come before it in the result; the input
 * order is otherwise preserved and the whole list is de-duplicated. A named
 * skill whose SKILL.md is missing throws (a missing skill is a broken load, not
 * a degraded one), and a dependency cycle throws with its trail — dependencies
 * only ever point down the communication model's layers, so a cycle is a
 * material error, not a load-order puzzle.
 */
export function withDependencies(names) {
  const out = [];
  const done = new Set();
  const visit = (name, trail) => {
    if (done.has(name)) return;
    if (trail.includes(name)) {
      throw new Error(`skill dependency cycle: ${[...trail, name].join(" -> ")}`);
    }
    for (const dep of skillMeta(name).skills ?? []) visit(dep, [...trail, name]);
    done.add(name);
    out.push(name);
  };
  for (const n of names) visit(n, []);
  return out;
}

/**
 * The role-level `skills:` from ROLE.md frontmatter — the craft skills a cast
 * loads by virtue of the role it runs (a Maker's tdd, tech-debt, ...). Exported
 * so the dispatch path (launchCli) unions them into every cast's skill set the
 * same way actorSkills rides the actor identity. The role's skills ride the role
 * identity, so no hand-assembled mission list can forget them; the handler's own
 * list becomes purely additive (foundational plus any per-phase extras).
 */
export function roleSkills(role) {
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  return roles.flatMap((r) => roleMeta(r).skills ?? []);
}

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
  return withDependencies([...new Set(names)]);
}
