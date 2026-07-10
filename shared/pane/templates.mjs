// Fixed temporal envelopes for casting operators and supervisors and for
// launching handlers. The Router and Planner fill slots; they never write the
// message. Each function takes only the parameters its envelope needs, so no
// free-form instruction can ride along; that belongs in the mission file.

// Operator cast: names the phase, the role, and the iteration.
export function operatorCastMessage({ phase, name, iteration = 1 }) {
  return `You are the Phase ${phase} ${name}, iteration ${iteration}.`;
}

// Supervisor cast: the temporal line plus the fixed load/mission boilerplate.
// The operator-debrief footer and target-repo note are appended in launchCli,
// not here. Supervisors are only ever a cast — there is no recast supervisor —
// and the envelope says so, so the cast knows its context is the whole of it.
export function supervisorCastMessage({ phase, iteration = 1 }) {
  return `You are the Phase ${phase} Supervisor, iteration ${iteration}.\n\nYou are only ever a cast: supervisors are never re-prompted. Every verification is a fresh cast with fresh eyes, and this context is the whole of yours.\n\nThe mission file the operator worked from is in \`<mission>\`.`;
}

// Handler launch: the bare mission line, parameterised by task and project, so
// the Planner states only what the mission is and which project, nothing more.
export function handlerLaunchMessage({ task, project }) {
  return `I have a mission ${task} for ${project}.`;
}

// Shared reason line: the mission changed; the cast re-reads it.
const MISSION_UPDATED = 'The mission file has been updated. Re-read it before continuing.';

// The pointer telling a supervisor where to read the operator's debrief.
export function operatorDebriefFooter(operatorPane) {
  return `Operator's debrief is in tmux pane ${operatorPane}. Read with \`tmux capture-pane -t ${operatorPane} -p -S -500\`.`;
}

// The supervisor-specific context appended to a supervisor cast's message: where
// to read the operator's debrief, and a note that the supervisor's own cwd is a
// scratch directory so the real target repo is the one named here. Appended by
// launchCli when actor === 'supervisor'.
export function getSupervisorContext({ operatorPane, targetRepo }) {
  const targetRepoNote = `The target repo is at ${targetRepo}; your own working directory is a scratch directory.`;
  return `${operatorDebriefFooter(operatorPane)}\n\n${targetRepoNote}`;
}

// Operator iteration reason: why this iteration exists, appended to the fresh
// cast's envelope at iteration >1. Not a recast — the cast is always fresh;
// the template is the reason it was dispatched. Returns undefined for an
// unknown template (the caller reports it).
export function operatorReasonMessage(template) {
  switch (template) {
    case 'mission-updated':
      return MISSION_UPDATED;
    case 'revise':
      return 'The supervisor has recorded a verdict in `## Supervisor Verification`. Re-read it and the mission, and address it in a new iteration.';
    default:
      return undefined;
  }
}

// Supervisor iteration reason: why this iteration exists, appended to the
// fresh cast's envelope at iteration >1. Not a recast — the cast is always
// fresh; the template is the reason it was dispatched. Returns undefined for
// an unknown template (the caller reports it).
export function supervisorReasonMessage(template) {
  switch (template) {
    case 'verify':
      return 'The operator has completed a new iteration. Verify it against the mission file and record your verdict in a new iteration block under `## Supervisor Verification`.';
    case 'mission-updated':
      return MISSION_UPDATED;
    default:
      return undefined;
  }
}
