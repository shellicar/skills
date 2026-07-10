/**
 * The model lookup — callers pass a family name (sonnet | opus | fable) and
 * only this module knows which versioned identifier a family currently means.
 * Nothing else spells a full model string, so a version bump is a one-line
 * change here, and no Claude has to remember identifier values.
 *
 * Opus for everything. Sonnet 5 is considered harmful — tested 4/4, it
 * dropped the protocols mid-session — and is not used; the family stays in
 * the map only so old dispatches fail loudly rather than mysteriously. Fable
 * is for extremely complex circumstances, rare. Supervisors always run Opus —
 * fixed in cast-supervisor, not a dispatch choice. The defaults table lives
 * in the squad-selection skill.
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
