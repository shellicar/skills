// Build the --prompt and --system content for a cast, plus the supervisor's
// message context. Callers pass names; this reads from ~/.claude.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parse } from 'yaml';
import { shq } from './shared.mjs';
import { withDependencies } from './skills.mjs';

/**
 * Read skill files and build the <skills> block. Skills are injected as
 * structured XML so the model can parse boundaries; each skill's SUCCESS.md is
 * embedded as <success> when present, and any diagrams the skill declares in
 * its frontmatter (`diagrams: [lifecycle]`, bare names) are resolved from the
 * pool at ~/.claude/diagrams and embedded as <diagram name format="d2"> — the
 * canonical .d2 is both the SC's rendered picture and the text the cast reads,
 * so they cannot drift. A declared diagram that is missing is a broken compose
 * (exit 2), same as a missing skill. Skills array is required (exit 2 if
 * empty). This is the content for --claudeMd: it lands in the session's
 * assembled CLAUDE.md, cached context on every launch, no turn fired.
 *
 * SUCCESS.md is verification material — how a supervisor judges whether a
 * skill was followed. `includeSuccess` (default true) gates whether it is
 * embedded at all; callers whose cast never verifies against it (the handler
 * family) pass false so it is not paid for and not carried.
 */
export function buildSkillsBlock(skills, { includeSuccess = true } = {}) {
  if (!skills || skills.length === 0) {
    console.error('skills array is required and must not be empty');
    process.exit(2);
  }

  const skillsDir = join(homedir(), '.claude', 'skills');
  // Expand each skill's `skills:` frontmatter dependencies, transitively —
  // dependencies come before the skill that needs them. Every injection path
  // passes through here, so a dispatch that names medium-commit delivers
  // audience-developer and communication-fundamentals with it.
  let expanded;
  try {
    expanded = withDependencies(skills);
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  const blocks = expanded.map(name => {
    const p = join(skillsDir, name, 'SKILL.md');
    let content;
    try {
      content = readFileSync(p, 'utf8');
    } catch {
      console.error(`skill not found: ${p}`);
      process.exit(2);
    }
    let diagramsBlock = '';
    for (const d of declaredDiagrams(content)) {
      const dp = join(homedir(), '.claude', 'diagrams', `${d}.d2`);
      let diagram;
      try {
        diagram = readFileSync(dp, 'utf8');
      } catch {
        console.error(`diagram not found: ${dp} (declared by skill ${name})`);
        process.exit(2);
      }
      diagramsBlock += `\n<diagram name="${d}" format="d2">\n${diagram}\n</diagram>`;
    }
    let successBlock = '';
    if (includeSuccess) {
      try {
        const success = readFileSync(join(skillsDir, name, 'SUCCESS.md'), 'utf8');
        successBlock = `\n<success>\n${success}\n</success>`;
      } catch {
        // No SUCCESS.md - omit it; the supervisor flags the absence per its ROLE.
      }
    }
    return `<skill name="${name}">\n${content}${diagramsBlock}${successBlock}\n</skill>`;
  });

  return `<skills>\n${blocks.join('\n')}\n</skills>`;
}

/**
 * Build the --prompt content: the envelope (from, message, optional mission
 * pointer). Skills no longer ride the prompt — they go through --claudeMd via
 * buildSkillsBlock — but an optional `skills` array is still accepted for any
 * caller that needs the old single-message form.
 */
export function buildPrompt({ from, message, skills, missionPath }) {
  if (!from) {
    console.error('from is required');
    process.exit(2);
  }
  if (!message) {
    console.error('message is required');
    process.exit(2);
  }

  const skillsBlock = skills && skills.length > 0 ? `\n${buildSkillsBlock(skills)}` : '';
  const missionBlock = missionPath ? `\n<mission>\n${missionPath}\n</mission>` : '';
  return `<from>\n${from}\n</from>${skillsBlock}\n<message>\n${message}\n</message>${missionBlock}`;
}

/**
 * Read the actor + role files and build the --system content. The source files
 * are inlined via $(cat ...) rather than composed into a temp file, so the launch
 * command kept in shell history re-reads the persistent source and up-arrow
 * restores the same system prompt. Single-quoted tag attributes and no literal
 * newlines mean nothing needs escaping inside the double-quoted --system value,
 * and the send-keys command stays one line. Hard-fails (exit 2) if a file is
 * missing.
 */
export function buildSystem({ actor, role }) {
  const base = join(homedir(), '.claude');
  const part = (kind, name, file, tag) => {
    const p = join(base, kind, name, file);
    try {
      readFileSync(p, 'utf8');
    } catch {
      console.error(`system file not found: ${p}`);
      process.exit(2);
    }
    return `<${tag} name='${name}'>$(cat ${shq(p)})</${tag}>`;
  };
  const parts = [];
  if (actor) parts.push(part('actors', actor, 'ACTOR.md', 'actor'));
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  for (const r of roles) parts.push(part('roles', r, 'ROLE.md', 'role'));
  return parts.join(' ');
}

/**
 * Read the actor + role files and build the --system content with the file
 * CONTENTS inlined directly, not as $(cat ...) references, and with any leading
 * frontmatter stripped. This is the form for the root-session launchers
 * (start-planner, start-handler): they run claude-sdk-cli directly with no
 * shell, so $(cat ...) would never expand — reading the contents here makes
 * --system correct however it is launched. The cast launchers keep buildSystem's
 * $(cat) form, which the shell they send into expands. Hard-fails (exit 2) if a
 * file is missing. `role` accepts a single name or an array.
 */
export function buildSystemInline({ actor, role }) {
  const base = join(homedir(), '.claude');
  const read = (kind, name, file) => {
    const p = join(base, kind, name, file);
    try {
      return stripFrontmatter(readFileSync(p, 'utf8')).trim();
    } catch {
      console.error(`system file not found: ${p}`);
      process.exit(2);
    }
  };
  const parts = [];
  if (actor) parts.push(`<actor name='${actor}'>\n${read('actors', actor, 'ACTOR.md')}\n</actor>`);
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  for (const r of roles) parts.push(`<role name='${r}'>\n${read('roles', r, 'ROLE.md')}\n</role>`);
  return parts.join('\n');
}

// Strip a leading YAML frontmatter block (--- ... ---) if present; otherwise a no-op.
function stripFrontmatter(s) {
  return s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

// The `diagrams:` list from a skill's frontmatter — bare names; the resolver
// owns the pool directory and the .d2 extension. Empty when absent.
function declaredDiagrams(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return [];
  return parse(m[1])?.diagrams ?? [];
}
