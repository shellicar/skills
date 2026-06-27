// Shared helpers for tmux pane operations used by Router scripts.
//
// Exports:
//   - paneProcessName(paneId): get the comm of the pane's foreground process,
//     short-circuiting to claude-sdk-cli when pane_pid itself is that
//     (split-window launch shape with a node-worker child).
//   - getOperatorPane(pm): look up the operator pane in the Handler's window.
//   - waitForClaudeSdkCli(paneId, opts): poll the pane and verify that
//     claude-sdk-cli is stably running.
//   - ensureCast(opts): idempotent pane-and-CLI launcher. If a pane with the
//     requested @role already exists in the Handler's window, reuse it; otherwise
//     create it. Then start claude-sdk-cli unless it is already running.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

function expandPath(p) {
  if (typeof p !== 'string') return p;
  return p.replace(/^~/, homedir()).replace(/^\$HOME/, homedir());
}

const PREFERRED = 'claude-sdk-cli';

export function paneProcessName(paneId) {
  let panePid;
  try {
    panePid = execFileSync('tmux', ['display-message', '-p', '-t', paneId, '#{pane_pid}'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }

  const paneComm = readComm(panePid);
  if (paneComm === PREFERRED) return paneComm;

  const child = firstChild(panePid);
  if (child) {
    const childComm = readComm(child);
    if (childComm) return childComm;
  }
  return paneComm;
}

/**
 * Poll the pane's foreground process until one of the settled outcomes:
 *
 *   { ok: true,  name: 'claude-sdk-cli' }
 *     — claude-sdk-cli observed continuously for `stabilityMs`.
 *   { ok: false, reason: 'pane-gone' }
 *     — pane no longer exists.
 *   { ok: false, reason: 'timeout', lastSeen }
 *     — claude-sdk-cli not stable within `timeoutMs`.
 *
 * Default config:
 *   pollMs: 250, stabilityMs: 1000, timeoutMs: 10000.
 */
export function waitForClaudeSdkCli(paneId, { pollMs = 250, stabilityMs = 1000, timeoutMs = 10000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let cliStableStart = null;
  let lastSeen = null;

  while (Date.now() < deadline) {
    const comm = paneProcessName(paneId);

    if (comm === null) return { ok: false, reason: 'pane-gone' };

    lastSeen = comm;

    if (comm === PREFERRED) {
      if (cliStableStart === null) cliStableStart = Date.now();
      if (Date.now() - cliStableStart >= stabilityMs) {
        return { ok: true, name: comm };
      }
    } else {
      // Shell, transient, anything else: keep polling until claude-sdk-cli
      // takes over or `timeoutMs` elapses.
      cliStableStart = null;
    }

    sleep(pollMs);
  }

  return { ok: false, reason: 'timeout', lastSeen };
}

function readComm(pid) {
  try {
    const comm = execFileSync('ps', ['-o', 'comm=', '-p', String(pid)],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return comm.split('/').pop();
  } catch {
    return null;
  }
}

function firstChild(parentPid) {
  try {
    return execFileSync('pgrep', ['-P', String(parentPid)],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      .split('\n').filter(Boolean)[0];
  } catch {
    return null;
  }
}

function sleep(ms) {
  execFileSync('sleep', [String(ms / 1000)]);
}

/**
 * Idempotent pane-and-CLI launcher used by new-operator-cast and
 * new-supervisor-cast. The success criterion is uniform: after this returns,
 * there is a pane tagged with `@role` in the Handler's window, and claude-sdk-cli
 * is running in it.
 *
 * Three cases:
 *
 *   1. Pane with @role exists, claude-sdk-cli already running in it.
 *      Warn (stderr) that the existing CLI may not be the intended cast.
 *      Do not relaunch. Return { paneId, action: 'already-running' }.
 *
 *   2. Pane with @role exists, but no CLI running (shell idle).
 *      Reuse the pane; send-keys the launch; waitForClaudeSdkCli.
 *      Return { paneId, action: 'relaunched', launchResult }.
 *
 *   3. No pane with @role in the window.
 *      Create via split-window, tag @role and @state, send-keys launch,
 *      waitForClaudeSdkCli. Return { paneId, action: 'created', launchResult }.
 *
 * Parameters:
 *   pm           — Handler pane id (used to filter list-panes)
 *   role         — '@role' value ('operator', 'supervisor', ...)
 *   state        — '@state' value to set on a newly-created pane
 *   splitTarget  — pane id to split off when creating
 *   splitDir     — '-v' (vertical) or '-h' (horizontal)
 *   cwd          — working directory for a newly-created pane (ignored on reuse)
 *   model        — model name for claude-sdk-cli --model
 *   from         — sender identity, emitted as <from> (Handler-supplied)
 *   missionFile  — absolute path, emitted as the <mission> element (cast reads it)
 *   name         — value passed to --name
 *   message      — instruction text, emitted as the <message> element
 *   skills       — array of skill names, emitted as <skills> (required)
 *   effort       — optional thinking effort (low|medium|high|xhigh|max); omitted leaves the CLI default
 */
export function ensureCast({ pm, from, role, state, splitTarget, splitDir, cwd, model, missionFile, name, message, skills, effort, castRole }) {
  const existing = findPaneByRole(pm, role);

  if (existing) {
    const comm = paneProcessName(existing);
    if (comm === PREFERRED) {
      console.error(`warning: ${role} pane ${existing} is already running claude-sdk-cli; this may not be the cast you intended. Run close-role ${role} first to recreate.`);
      return { paneId: existing, action: 'already-running' };
    }
    console.error(`reusing existing ${role} pane ${existing} (no CLI running).`);
    const launchResult = launchCli(existing, { from, model, missionFile, name, message, skills, effort, actor: role, castRole });
    return { paneId: existing, action: 'relaunched', launchResult };
  }

  const paneId = execFileSync('tmux', [
    'split-window', splitDir, '-d', '-t', splitTarget,
    '-c', expandPath(cwd),
    '-P', '-F', '#{pane_id}',
  ], { encoding: 'utf8' }).trim();

  execFileSync('tmux', [
    'set-option', '-p', '-t', paneId, '@role', role,
    ';',
    'set-option', '-w', '-t', paneId, '@state', state,
  ]);

  const launchResult = launchCli(paneId, { from, model, missionFile, name, message, skills, effort, actor: role, castRole });
  return { paneId, action: 'created', launchResult };
}

/**
 * Look up the operator pane in the Handler's window (by @role=operator).
 * Returns the pane id (e.g. '%201') or undefined if there isn't one.
 */
export function getOperatorPane(pm) {
  return findPaneByRole(pm, 'operator');
}

function findPaneByRole(pm, role) {
  const list = execFileSync('tmux', ['list-panes', '-t', pm, '-F', '#{pane_id} #{@role}'], { encoding: 'utf8' });
  return list.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => l.split(/\s+/))
    .find(([, r]) => r === role)?.[0];
}

/**
 * Read skill files and build the combined --prompt content.
 * Skills are injected as structured XML so the model can parse boundaries.
 * The prompt is:
 *   <skills>\n<skill name="...">...SKILL.md...<success>...SUCCESS.md...</success></skill>\n...</skills>\n<envelope>...envelope...</envelope>
 * Each skill's SUCCESS.md is embedded as <success> when present; a skill without
 * one is left without the block (the supervisor flags the absence per its ROLE).
 * Skills array is required and must not be empty (exit 2 if missing).
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
 * Read the actor + role files and build the --system content. Symmetric with
 * buildPrompt: callers pass names, this loads from ~/.claude/{actors,roles}/ and
 * hard-fails (exit 2) if a named file is missing. actor is required in practice;
 * role is optional (a supervisor cast has an actor and no sub-role). The
 * mechanism — read-and-embed now, perhaps `--system @path` later — is private to
 * this script; callers only ever pass the names.
 */
export function buildSystem({ actor, role }) {
  const base = join(homedir(), '.claude');
  const load = (kind, name, file) => {
    const p = join(base, kind, name, file);
    try {
      return readFileSync(p, 'utf8');
    } catch {
      console.error(`system file not found: ${p}`);
      process.exit(2);
    }
  };
  const parts = [];
  if (actor) parts.push(load('actors', actor, 'ACTOR.md'));
  if (role) parts.push(load('roles', role, 'ROLE.md'));
  return parts.join('\n\n');
}

/**
 * Remove the temp prompt directory after a launch — but only when the launch
 * verified. The shell's `cat` reads the prompt before claude-sdk-cli starts, so
 * once waitForClaudeSdkCli reports ok the file has been consumed and is safe to
 * delete. On a failed launch (timeout / pane-gone — e.g. claude-sdk-cli not on
 * PATH) the file is kept so the Handler can inspect or retry it, and its path is
 * logged. Replaces the old inline `rm -f` in the launch command, which deleted
 * the prompt at shell-substitution time whether or not the CLI ran.
 */
export function cleanupPrompt(tmpDir, promptPath, launchResult) {
  if (launchResult.ok) {
    rmSync(tmpDir, { recursive: true, force: true });
  } else {
    console.error(`launch did not verify (${launchResult.reason}); prompt kept at ${promptPath}`);
  }
}

function launchCli(paneId, { from, model, missionFile, name, message, skills, effort, actor, castRole }) {
  // Build the combined prompt and write to a temp file; shell substitution
  // captures it for --prompt. The mission rides inside the prompt as a
  // <mission> path element, not a --file attachment. The temp file is removed
  // after the launch verifies (see cleanupPrompt), not inline in the command —
  // an inline `rm` deleted it at substitution time whether or not the CLI ran.
  const expandedMissionFile = expandPath(missionFile);
  const prompt = buildPrompt({ from, message, skills, missionPath: expandedMissionFile });
  const tmp = mkdtempSync(join(tmpdir(), 'router-prompt-'));
  const promptPath = join(tmp, 'prompt');
  writeFileSync(promptPath, prompt);

  const system = buildSystem({ actor, role: castRole });
  const systemPath = join(tmp, 'system');
  writeFileSync(systemPath, system);
  const systemFlag = system ? ` --system "$(cat ${shq(systemPath)})"` : '';

  const launch = `claude-sdk-cli --name ${shq(name)} --model ${shq(model)}${effortFlag(effort)}${systemFlag} --prompt "$(cat ${shq(promptPath)})" --no-resume`;

  execFileSync('tmux', ['send-keys', '-t', paneId, launch, 'Enter']);

  const result = waitForClaudeSdkCli(paneId);
  cleanupPrompt(tmp, promptPath, result);
  return result;
}

// Valid claude-sdk-cli thinking-effort values, set via `--config '{"thinking":{"effort":"..."}}'`.
// The canonical source is claude-sdk-cli itself; mirrored here so the Router rejects a bad
// value before launch rather than failing at the CLI. Effort tunes time/tokens spent, not
// capability. Omitting it leaves the CLI's configured default (the SC's global config).
export const EFFORT_VALUES = ['low', 'medium', 'high', 'xhigh', 'max'];

// Build the claude-sdk-cli flag for a thinking effort, or '' when none is given. Exits 2 on
// an unrecognised value so a typo in a mission's Effort field is caught at dispatch rather
// than silently ignored.
export function effortFlag(effort) {
  if (effort === undefined || effort === null || effort === '') return '';
  if (!EFFORT_VALUES.includes(effort)) {
    console.error(`invalid effort "${effort}"; expected one of: ${EFFORT_VALUES.join(', ')}`);
    process.exit(2);
  }
  return ` --config ${shq(JSON.stringify({ thinking: { effort } }))}`;
}

function shq(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}
