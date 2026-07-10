#!/usr/bin/env node
/**
 * Report the size of what each launch preset actually sends as system prompt
 * plus cached skills context — the same composition buildSystemInline and
 * buildSkillsBlock (../shared/pane/envelope.mjs) produce for a real launch.
 *
 * Built to answer a concrete question: why is the effective initial prompt
 * ~250k characters. This walks every preset the start-*.mjs scripts use
 * (handler, planner, supervisor, and each operator role) and breaks the
 * total down to the ACTOR.md/ROLE.md/SKILL.md/SUCCESS.md/diagram level, so
 * the large contributors are visible rather than felt.
 *
 * Read-only: opens files under ~/.claude, prints a report, writes nothing.
 * Not a launcher — no claude-sdk-cli invocation — so it carries none of the
 * start-*.mjs restrictions.
 *
 *   node composition-report.mjs            # full report, all presets
 *   node composition-report.mjs handler     # one preset only (name match)
 */

import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { skillsFor, HANDLER_ROLES } from "../shared/pane/skills.mjs";

const BASE = join(homedir(), ".claude");

function stripFrontmatter(s) {
  return s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
}

function frontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  return m ? (parse(m[1]) ?? {}) : {};
}

function readOrNull(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

// ---- identity part sizes (what --system carries) ----

function identityParts({ actor, role }) {
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  const parts = [];
  if (actor) {
    const raw = readOrNull(join(BASE, "actors", actor, "ACTOR.md"));
    if (raw === null) {
      console.error(`missing: actors/${actor}/ACTOR.md`);
      process.exit(2);
    }
    const body = stripFrontmatter(raw);
    parts.push({ label: `actor:${actor}`, chars: `<actor name='${actor}'>\n${body}\n</actor>`.length });
  }
  for (const r of roles) {
    const raw = readOrNull(join(BASE, "roles", r, "ROLE.md"));
    if (raw === null) {
      console.error(`missing: roles/${r}/ROLE.md`);
      process.exit(2);
    }
    const body = stripFrontmatter(raw);
    parts.push({ label: `role:${r}`, chars: `<role name='${r}'>\n${body}\n</role>`.length });
  }
  return parts;
}

// ---- skill block sizes (what --claudeMd carries) ----

function skillParts(skills, { includeSuccess = true } = {}) {
  return skills.map((name) => {
    const skillPath = join(BASE, "skills", name, "SKILL.md");
    const raw = readOrNull(skillPath);
    if (raw === null) {
      console.error(`missing skill: ${name}`);
      process.exit(2);
    }
    let diagramChars = 0;
    const diagrams = frontmatter(raw)?.diagrams ?? [];
    for (const d of diagrams) {
      const dp = join(BASE, "diagrams", `${d}.d2`);
      const dc = readOrNull(dp);
      if (dc === null) {
        console.error(`missing diagram: ${dp} (declared by ${name})`);
        process.exit(2);
      }
      diagramChars += `\n<diagram name="${d}" format="d2">\n${dc}\n</diagram>`.length;
    }
    const successPath = join(BASE, "skills", name, "SUCCESS.md");
    const fileHasSuccess = existsSync(successPath);
    const hasSuccess = includeSuccess && fileHasSuccess;
    const successChars = hasSuccess ? `\n<success>\n${readFileSync(successPath, "utf8")}\n</success>`.length : 0;
    const skillChars = raw.length; // SKILL.md content as embedded
    const wrapChars = `<skill name="${name}">\n</skill>`.length;
    const total = skillChars + diagramChars + successChars + wrapChars;
    return { name, skillChars, diagramChars, successChars, hasSuccess, total };
  });
}

function fmt(n) {
  return n.toLocaleString("en-US");
}

function bar(n, max, width = 30) {
  const filled = max > 0 ? Math.round((n / max) * width) : 0;
  return "#".repeat(Math.max(0, filled)) + "-".repeat(Math.max(0, width - filled));
}

function report(preset) {
  const { name, actor, role, includeSuccess = true } = preset;
  const roles = Array.isArray(role) ? role : role ? [role] : [];

  const idParts = identityParts({ actor, role });
  const systemChars = idParts.reduce((s, p) => s + p.chars, 1); // +join spacing approx

  const skills = skillsFor({ actor, role });
  const sParts = skillParts(skills, { includeSuccess }).sort((a, b) => b.total - a.total);
  const skillsChars = sParts.reduce((s, p) => s + p.total, 0);

  const total = systemChars + skillsChars;

  console.log(`\n=== ${name}  (actor=${actor}, roles=[${roles.join(", ")}]${includeSuccess ? "" : ", SUCCESS.md excluded"}) ===`);
  console.log(`total: ${fmt(total)} chars  (system ${fmt(systemChars)} + skills ${fmt(skillsChars)}, ${skills.length} skills)`);

  console.log(`\n  --system:`);
  for (const p of idParts) {
    console.log(`    ${fmt(p.chars).padStart(8)}  ${bar(p.chars, systemChars)}  ${p.label}`);
  }

  console.log(`\n  --claudeMd skills (sorted largest first):`);
  const maxSkill = sParts[0]?.total ?? 1;
  for (const p of sParts) {
    const flag = p.hasSuccess ? " [+SUCCESS.md]" : "";
    console.log(`    ${fmt(p.total).padStart(8)}  ${bar(p.total, maxSkill)}  ${p.name}${flag}`);
  }

  return { name, systemChars, skillsChars, total, skillCount: skills.length };
}

// ---- presets, mirroring the start-*.mjs scripts ----

const presets = [
  { name: "handler:all", actor: "handler", role: HANDLER_ROLES, includeSuccess: false },
  { name: "planner:scheduler+launcher+coach", actor: "planner", role: ["scheduler", "launcher", "coach"] },
  { name: "supervisor", actor: "supervisor", role: [] },
];

// operator roles come from the operator ACTOR.md's own `roles:` frontmatter
const operatorActorRaw = readFileSync(join(BASE, "actors", "operator", "ACTOR.md"), "utf8");
const operatorRoles = frontmatter(operatorActorRaw).roles ?? [];
for (const r of operatorRoles) {
  presets.push({ name: `operator:${r}`, actor: "operator", role: [r] });
}

// The other handler-family launcher with a multi-role combo (start-executor)
// also passes includeSuccess: false — a narrower role set of the same actor.
presets.push({ name: "handler:executor+router", actor: "handler", role: ["executor", "router"], includeSuccess: false });

// Every individual role in HANDLER_ROLES on its own — this covers handler:scribe
// (start-scribe.mjs's own preset) along with the roles no launcher splits out yet.
for (const r of HANDLER_ROLES) {
  presets.push({ name: `handler:${r}`, actor: "handler", role: [r], includeSuccess: false });
}

const filter = process.argv[2];
const chosen = filter ? presets.filter((p) => p.name.includes(filter)) : presets;
if (chosen.length === 0) {
  console.error(`no preset matches "${filter}". Available: ${presets.map((p) => p.name).join(", ")}`);
  process.exit(1);
}

const summary = chosen.map(report);

console.log(`\n=== summary (sorted largest total first) ===`);
for (const s of [...summary].sort((a, b) => b.total - a.total)) {
  console.log(`  ${fmt(s.total).padStart(9)}  ${s.name}  (${s.skillCount} skills)`);
}
console.log("");
