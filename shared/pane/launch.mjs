// The launch orchestrator: build the command, send it to the pane, verify the
// CLI came up, clean up. ensureCast is the idempotent create-or-reuse wrapper
// over it.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expandPath, shq } from './shared.mjs';
import { paneProcessName, waitForClaudeSdkCli, PREFERRED } from './process.mjs';
import { findPaneByRole, paneCwd } from './lookup.mjs';
import { buildPrompt, buildSystem } from './envelope.mjs';
import { getSupervisorContext } from './templates.mjs';
import { actorSkills, roleSkills } from './skills.mjs';
import { effortFlag } from './effort.mjs';

/**
 * Remove the temp prompt directory after a launch, but only when it verified.
 * The shell's `cat` reads the prompt before claude-sdk-cli starts, so once
 * waitForClaudeSdkCli reports ok the file is consumed and safe to delete. On a
 * failed launch the file is kept for inspection and its path logged.
 */
function cleanupPrompt(tmpDir, promptPath, launchResult) {
  if (launchResult.ok) {
    rmSync(tmpDir, { recursive: true, force: true });
  } else {
    console.error(`launch did not verify (${launchResult.reason}); prompt kept at ${promptPath}`);
  }
}

export function launchCli(paneId, { from, model, missionFile, name, message, skills, effort, actor, role, resume }) {
  const expandedMissionFile = expandPath(missionFile);
  // When this is a supervisor cast, append the operator-debrief pointer and the
  // target-repo note the supervisor needs, resolved from the live panes, so a
  // supervisor relaunch (next-phase-cast) gets them too, not only the first
  // new-supervisor-cast. Operators get nothing extra.
  let finalMessage = message;
  if (actor === 'supervisor') {
    const operatorPane = findPaneByRole(paneId, 'operator');
    if (operatorPane) {
      finalMessage = `${message}\n\n${getSupervisorContext({ operatorPane, targetRepo: paneCwd(operatorPane) })}`;
    } else {
      console.error('warning: no operator pane in this window; supervisor launched without the operator-debrief pointer.');
    }
  }
  // Union the caller's skills with the identity's own frontmatter skills: the
  // actor's (testament, tmux, ...) and the role's craft skills (a Maker's tdd,
  // tech-debt, ...). Both ride the identity, so no handler-assembled list can
  // forget them; the caller's list is purely additive — foundational plus any
  // per-phase extras from the mission.
  const finalSkills = [...new Set([...(skills ?? []), ...actorSkills(actor), ...roleSkills(role)])];
  const prompt = buildPrompt({ from, message: finalMessage, skills: finalSkills, missionPath: expandedMissionFile });
  const tmp = mkdtempSync(join(tmpdir(), 'router-prompt-'));
  const promptPath = join(tmp, 'prompt');
  writeFileSync(promptPath, prompt);

  const system = buildSystem({ actor, role });
  // Inline (see buildSystem): no system temp file, so up-arrow re-reads the source.
  const systemFlag = system ? ` --system "${system}"` : '';

  const resumeFlag = resume ? ` --resume ${shq(resume)}` : ' --no-resume';
  const launch = `claude-sdk-cli --name ${shq(name)} --model ${shq(model)}${effortFlag(effort)}${systemFlag} --prompt "$(cat ${shq(promptPath)})"${resumeFlag}`;

  execFileSync('tmux', ['send-keys', '-t', paneId, launch, 'Enter']);

  const result = waitForClaudeSdkCli(paneId);
  cleanupPrompt(tmp, promptPath, result);
  return result;
}

/**
 * Idempotent pane-and-CLI launcher. After it returns, there is a pane tagged
 * with @role in the Handler's window and claude-sdk-cli is running in it.
 *
 *   1. Pane exists, CLI already running: warn, do not relaunch.
 *   2. Pane exists, no CLI (shell idle): reuse it, relaunch.
 *   3. No pane: split-window, tag @role and @state, launch.
 */
export function ensureCast({ pm, from, actor, state, splitTarget, splitDir, cwd, model, missionFile, name, message, skills, effort, role }) {
  const paneRole = actor;
  const existing = findPaneByRole(pm, paneRole);

  if (existing) {
    const comm = paneProcessName(existing);
    if (comm === PREFERRED) {
      console.error(`warning: ${paneRole} pane ${existing} is already running claude-sdk-cli; this may not be the cast you intended. Run close-role ${paneRole} first to recreate.`);
      return { paneId: existing, action: 'already-running' };
    }
    console.error(`reusing existing ${paneRole} pane ${existing} (no CLI running).`);
    const launchResult = launchCli(existing, { from, model, missionFile, name, message, skills, effort, actor, role });
    return { paneId: existing, action: 'relaunched', launchResult };
  }

  const paneId = execFileSync('tmux', [
    'split-window', splitDir, '-d', '-t', splitTarget,
    '-c', expandPath(cwd),
    '-P', '-F', '#{pane_id}',
  ], { encoding: 'utf8' }).trim();

  execFileSync('tmux', [
    'set-option', '-p', '-t', paneId, '@role', paneRole,
    ';',
    'set-option', '-w', '-t', paneId, '@state', state,
  ]);

  const launchResult = launchCli(paneId, { from, model, missionFile, name, message, skills, effort, actor, role });
  return { paneId, action: 'created', launchResult };
}
