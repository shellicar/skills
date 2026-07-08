// Config schemas for the cast-launch scripts, defined with zod and enforced
// at the stdin boundary. The old hand-rolled required-field loops silently
// admitted a dispatch with no `skills` field — that is how a supervisor
// launched carrying nothing but its identity skills. A schema is the single
// definition of what a valid dispatch config is; anything outside it exits 2.
//
// Local to the dispatch skill: only its scripts read these.

import { readFileSync } from 'node:fs';
import { z } from 'zod';

const nonEmpty = z.string().min(1);

// MANDATORY on every cast-launch config. An empty array is a valid value —
// a dispatch that deliberately adds nothing beyond the identity's own skills —
// but an absent field is a broken dispatch, not a default.
const skills = z.array(nonEmpty);

const common = {
  from: nonEmpty,
  model: nonEmpty,
  missionFile: nonEmpty,
  phase: z.number().int().positive(),
  skills,
  effort: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
};

// Strict objects: an unknown key is a typo ("skill" for "skills"), and a typo
// that silently drops a field is the same failure the schema exists to stop.

export const operatorConfig = z.strictObject({
  ...common,
  cwd: nonEmpty,
  name: nonEmpty,
  iteration: z.number().int().positive().optional(),
  role: nonEmpty.optional(),
});

export const supervisorConfig = z.strictObject({
  ...common,
  cwd: nonEmpty,
  // The role the operator was dispatched with. Mandatory: the supervisor
  // judges the operator's work against the operator's skills, so it must be
  // launched with the same role skill set the operator got.
  operatorRole: nonEmpty,
});

export const nextPhaseConfig = z.strictObject({
  ...common,
  actor: z.enum(['operator', 'supervisor']),
  name: nonEmpty,
  iteration: z.number().int().positive().optional(),
  role: nonEmpty.optional(),
});

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
