// Config schemas for the cast-launch scripts, defined with zod and enforced
// at the stdin boundary. The old hand-rolled required-field loops silently
// admitted a dispatch with no `skills` field — that is how a supervisor
// launched carrying nothing but its identity skills. A schema is the single
// definition of what a valid dispatch config is; anything outside it exits 2.
//
// Local to the dispatch skill: only its scripts read these.

import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { MODEL_FAMILIES } from '../../../shared/pane/models.mjs';

const nonEmpty = z.string().min(1);

// MANDATORY on every cast-launch config. An empty array is a valid value —
// a dispatch that deliberately adds nothing beyond the identity's own skills —
// but an absent field is a broken dispatch, not a default.
const skills = z.array(nonEmpty);

const common = {
  from: nonEmpty,
  // Required, never defaulted — and it is a FAMILY name (sonnet | opus |
  // fable), not a versioned identifier. launchCli resolves the family to the
  // current identifier via shared/pane/models.mjs, so no dispatch has to
  // remember model version strings.
  model: z.enum(MODEL_FAMILIES),
  missionFile: nonEmpty,
  phase: z.number().int().positive(),
  skills,
  effort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
};

// Strict objects: an unknown key is a typo ("skill" for "skills"), and a typo
// that silently drops a field is the same failure the schema exists to stop.

// scaffold-panes: pane creation only, no cast. `cwd` is the operator worktree;
// the supervisor pane gets a scratch cwd (see scaffold-panes.mjs).
export const scaffoldConfig = z.strictObject({
  cwd: nonEmpty,
});

const operatorCommon = {
  ...common,
  name: nonEmpty,
};

// cast-operator: iteration 1 is always a fresh cast — `template` and `resume`
// are forbidden (strict object). Iteration >1 requires both: the template says
// why the cast is re-triggered, `resume` decides whether the existing context
// carries forward (paste into the running CLI) or a fresh cast starts (the
// template rides in the new envelope instead).
//
// `role` is required wherever a launch happens — iteration 1, and iteration >1
// with resume: false — because launchCli composes the role's system prompt and
// unions its craft skills from it; a launch without it is a cast with no
// identity. With resume: true nothing launches (the running cast already has
// its role), so the field is optional there.
export const castOperatorConfig = z.union([
  z.strictObject({
    ...operatorCommon,
    iteration: z.literal(1),
    role: nonEmpty,
  }),
  z.strictObject({
    ...operatorCommon,
    iteration: z.number().int().min(2),
    template: z.enum(['mission-updated', 'revise']),
    resume: z.literal(false),
    role: nonEmpty,
  }),
  z.strictObject({
    ...operatorCommon,
    iteration: z.number().int().min(2),
    template: z.enum(['mission-updated', 'revise']),
    resume: z.literal(true),
    role: nonEmpty.optional(),
  }),
]);

// cast-supervisor: always a fresh cast, every iteration — `resume` does not
// exist in this schema, so a recast supervisor is unrepresentable. The
// supervisor's value is fresh eyes; a supervisor that re-judges with its own
// last verdict in context is not that. The template names why this iteration
// exists — a new operator iteration to verify, or updated criteria to
// re-verify against — and rides in the fresh cast's envelope: required at
// iteration >1, forbidden at iteration 1 (the first verification is
// self-evident).
const supervisorCommon = {
  ...common,
  // The role the operator was dispatched with. Mandatory: the supervisor
  // judges the operator's work against the operator's skills, so it must be
  // launched with the same role skill set the operator got.
  operatorRole: nonEmpty,
};

export const castSupervisorConfig = z.union([
  z.strictObject({
    ...supervisorCommon,
    iteration: z.literal(1),
  }),
  z.strictObject({
    ...supervisorCommon,
    iteration: z.number().int().min(2),
    template: z.enum(['verify', 'mission-updated']),
  }),
]);

/** Read stdin, parse as JSON, validate against the schema. Exit 2 on any failure. */
export function readConfig(schema) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(0, 'utf8'));
  } catch (err) {
    console.error(`config is not valid JSON: ${err.message}`);
    process.exit(2);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(`bad config:\n${z.prettifyError(parsed.error)}`);
    process.exit(2);
  }
  return parsed.data;
}
