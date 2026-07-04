// The skill set each actor/role loads, hard-coded.
//
// This is a MIRROR of the `## Skills` sections in the ACTOR.md / ROLE.md files
// and the `Load:` lines in ~/.claude/CLAUDE.md. It is duplicated here on purpose,
// for now: the start scripts inject these as user context (--prompt) so the
// skills land in the cached prefix, before the first real message. Keep it in
// sync with those sources by hand until the link is made dynamic (likely via
// frontmatter). The CLAUDE.md note records the coupling.

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

// Actor-level skills — the ACTOR.md `## Skills` sections.
const ACTOR_SKILLS = {
  planner: ["testament"],
  handler: ["testament", "project-memory", "issue-writing"],
};

// Role-level skills — the ROLE.md `## Skills` sections.
const ROLE_SKILLS = {
  scheduler: ["mission-boards"],
  launcher: ["standing-up-handlers"],
  coach: ["drive-post-mortem"],
  interlocutor: ["active-listening", "sc-ghostwriting", "mission-artefacts"],
  "squad-selector": ["squad-selection", "mission-artefacts"],
  scribe: ["prompt-authoring", "mission-grounding", "mission-artefacts"],
  executor: ["worktrees", "post-mortem", "mission-artefacts"],
  router: ["dispatch"],
};

/**
 * The full skill set for a session: foundational, plus co-working when the actor
 * co-works, plus the actor's own skills, plus each role's skills. De-duplicated,
 * order preserved (foundational first). `role` accepts a single name or an array.
 */
export function skillsFor({ actor, role }) {
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  const names = [...FOUNDATIONAL];
  if (COWORKING_ACTORS.has(actor)) names.push("co-working");
  if (ACTOR_SKILLS[actor]) names.push(...ACTOR_SKILLS[actor]);
  for (const r of roles) if (ROLE_SKILLS[r]) names.push(...ROLE_SKILLS[r]);
  return [...new Set(names)];
}
