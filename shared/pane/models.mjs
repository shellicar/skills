/**
 * The model lookup — callers pass a family name (sonnet | opus | fable) and
 * only this module knows which versioned identifier a family currently means.
 * Nothing else spells a full model string, so a version bump is a one-line
 * change here, and no Claude has to remember identifier values.
 *
 * The pick is right-sizing capability to the work, not buying certainty with
 * resources: Sonnet is the default for operators; Opus for medium-difficulty
 * work; Fable only in extremely complex circumstances. Supervisors always run
 * Opus — fixed in cast-supervisor, not a dispatch choice. The
 * defaults/recommended table lives in the squad-selection skill.
 */

// Identifiers are always claude-[model-family]-[version].
export const MODELS = {
  sonnet: "claude-sonnet-5",
  opus: "claude-opus-4-8",
  fable: "claude-fable-5",
};

export const MODEL_FAMILIES = Object.keys(MODELS);

/** Resolve a family name to the versioned identifier. Case-insensitive. */
export function resolveModel(family) {
  const id = MODELS[String(family).toLowerCase()];
  if (!id) {
    throw new Error(
      `unknown model family "${family}" (expected one of: ${MODEL_FAMILIES.join(", ")})`,
    );
  }
  return id;
}
