// Build the --prompt and --system content for a cast, plus the supervisor's
// message context. Callers pass names; this reads from ~/.claude.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { shq } from './shared.mjs';

/**
 * Read skill files and build the combined --prompt content. Skills are injected
 * as structured XML so the model can parse boundaries; each skill's SUCCESS.md is
 * embedded as <success> when present. Skills array is required (exit 2 if empty).
 */
export function buildPrompt({ from, message, skills, missionPath }) {
  if (!from) {
    console.error('from is required');
    process.exit(2);
  }
  if (!skills || skills.length === 0) {
    console.error('skills array is required and must not be empty');
    process.exit(2);
  }
  if (!message) {
    console.error('message is required');
    process.exit(2);
  }

  const skillsDir = join(homedir(), '.claude', 'skills');
  const blocks = skills.map(name => {
    const p = join(skillsDir, name, 'SKILL.md');
    let content;
    try {
      content = readFileSync(p, 'utf8');
    } catch {
      console.error(`skill not found: ${p}`);
      process.exit(2);
    }
    let successBlock = '';
    try {
      const success = readFileSync(join(skillsDir, name, 'SUCCESS.md'), 'utf8');
      successBlock = `\n<success>\n${success}\n</success>`;
    } catch {
      // No SUCCESS.md - omit it; the supervisor flags the absence per its ROLE.
    }
    return `<skill name="${name}">\n${content}${successBlock}\n</skill>`;
  });

  const missionBlock = missionPath ? `\n<mission>\n${missionPath}\n</mission>` : '';
  return `<from>\n${from}\n</from>\n<skills>\n${blocks.join('\n')}\n</skills>\n<message>\n${message}\n</message>${missionBlock}`;
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
