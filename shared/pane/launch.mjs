// The launch orchestrator: build the command, send it to the pane, verify the
// CLI came up, clean up. ensureCast is the idempotent create-or-reuse wrapper
// over it.

import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { expandPath, shq } from './shared.mjs';
import { paneProcessName, waitForClaudeSdkCli, PREFERRED } from './process.mjs';
import { findPaneByRole, paneCwd } from './lookup.mjs';
import { buildPrompt, buildSystem, buildSkillsBlock } from './envelope.mjs';
import { getSupervisorContext } from './templates.mjs';
import { FOUNDATIONAL, actorSkills, roleSkills } from './skills.mjs';
import { effortFlag } from './effort.mjs';
import { resolveModel } from './models.mjs';

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

export function launchCli(paneId, { from, via, model, missionFile, name, message, skills, effort, actor, role, resume }) {
  const expandedMissionFile = expandPath(missionFile);
  // When this is a supervisor cast, append the operator-debrief pointer and the
  // target-repo note the supervisor needs, resolved from the live panes. Every
  // supervisor cast is fresh (cast-supervisor), so every one needs the
  // pointers. Operators get nothing extra.
  let finalMessage = message;
  if (actor === 'supervisor') {
    const operatorPane = findPaneByRole(paneId, 'operator');
    if (operatorPane) {
      finalMessage = `${message}\n\n${getSupervisorContext({ operatorPane, targetRepo: paneCwd(operatorPane) })}`;
    } else {
      console.error('warning: no operator pane in this window; supervisor launched without the operator-debrief pointer.');
    }
  }
  // Foundational, actor, and role skills all ride the launch seam — the caller's
  // array is purely additive (per-phase extras), and no dispatch can forget the
  // every-session set.
  const finalSkills = [...new Set([...FOUNDATIONAL, ...(skills ?? []), ...actorSkills(actor), ...roleSkills(role)])];
  // Skills ride --claudeMd (cached session context, assembled per launch, no
  // turn fired); the prompt carries only the envelope: from, message, mission
  // pointer. Both are written to temp files the launch line cats in.
  const prompt = buildPrompt({ from, via, message: finalMessage, missionPath: expandedMissionFile });
  const tmp = mkdtempSync(join(tmpdir(), 'router-prompt-'));
  const promptPath = join(tmp, 'prompt');
  writeFileSync(promptPath, prompt);
  const skillsPath = join(tmp, 'claudemd');
  writeFileSync(skillsPath, buildSkillsBlock(finalSkills, { includeSuccess: true }));

  // The actor is the cast's standing identity, so it rides --system-identity:
  // bound to the conversation, persisted, restored on resume, and read live
  // from the ACTOR.md file every query. The role still rides --system — it is
  // per-launch composition, not conversation identity.
  let identityFlag = '';
  if (actor) {
    const actorPath = join(homedir(), '.claude', 'actors', actor, 'ACTOR.md');
    if (!existsSync(actorPath)) {
      console.error(`actor identity file not found: ${actorPath}`);
      process.exit(2);
    }
    identityFlag = ` --system-identity ${shq(actorPath)}`;
  }
  const system = buildSystem({ role });
  // Inline (see buildSystem): no system temp file, so up-arrow re-reads the source.
  const systemFlag = system ? ` --system "${system}"` : '';

  // Never --no-resume: every cast launches with a conversation id, generated
  // here when the caller has none. The CLI adopts the id whether or not the
  // conversation exists yet, and the id is returned to the caller — so the
  // durable anchor for resume and recovery exists by construction.
  const convId = resume || randomUUID();
  // The caller passes a model family (sonnet | opus | fable); the versioned
  // identifier is resolved here, at the one seam every launch goes through.
  const launch = `claude-sdk-cli --name ${shq(name)} --model ${shq(resolveModel(model))}${effortFlag(effort)}${identityFlag}${systemFlag} --claudeMd "$(cat ${shq(skillsPath)})" --prompt "$(cat ${shq(promptPath)})" --resume ${shq(convId)}`;

  execFileSync('tmux', ['send-keys', '-t', paneId, launch, 'Enter']);

  const result = waitForClaudeSdkCli(paneId);
  cleanupPrompt(tmp, promptPath, result);
  return { ...result, convId };
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
