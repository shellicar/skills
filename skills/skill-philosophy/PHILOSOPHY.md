# skill-philosophy: editorial context

This file is the editorial context for the `skill-philosophy` skill. It is not loaded at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

Skills get edited. The shape of a skill changes over time as the underlying discipline is refined. Each edit is an opportunity for drift — the editor reads `SKILL.md`, makes a change that seems reasonable from the current text, and unknowingly undoes a decision made for a specific reason that isn't recorded in `SKILL.md`.

The `PHILOSOPHY.md` alongside each `SKILL.md` is the anchor against that drift. It carries the reasoning, the alternatives that were rejected, the failure modes the skill was built against. With it, an editor can see why the `SKILL.md` says what it says before changing it. Without it, the same editor changes based on what looks reasonable from the current text alone.

Before this skill existed, the `PHILOSOPHY.md` pattern was a convention some skills followed and some did not. With it, the pattern becomes the discipline: every skill has both files, both maintained, both updated together when reasoning changes. A skill without a `PHILOSOPHY.md` is incomplete — not a stylistic gap, a structural one.

## Origin

The crystallising session: a day of iteration on the `devops-review` skill across multiple casts. The skill was updated repeatedly. Each update was driven by a specific failure mode surfaced in a specific cast. The reasoning for each update was clear in conversation, but would have been lost the moment the conversation ended.

Existing foundational skills (`claude-philosophy`, `teapot-protocol`, `specification-discipline`, and others) already had paired `PHILOSOPHY.md` files. The pattern existed. What did not exist was a skill that documented the pattern itself — no explicit "every skill has two files" rule, no place that captured the genre conventions, no anchor against future editors creating skills with `SKILL.md` only.

## Key insights that shaped this skill

### The runtime / editorial split

`SKILL.md` is loaded into Claude's context when the skill fires. It carries the operational content. Everything in `SKILL.md` costs tokens at runtime. Editorial context — origin, rejected alternatives, "why this exists" — would bloat the runtime payload without changing what the skill does in operation.

`PHILOSOPHY.md` is editorial. It is not loaded. It exists for editors. Its content has no runtime cost because it is never loaded into Claude's context during normal operation. This frees the philosophy to be as detailed as needed without inflating the operational footprint.

### Why `PHILOSOPHY.md` is necessary, not optional

A `SKILL.md` is *what the skill is*. A `PHILOSOPHY.md` is *why the skill is what it is*. The two answer different questions and serve different audiences. `SKILL.md` serves Claude during a cast. `PHILOSOPHY.md` serves the editor before a change.

Without `PHILOSOPHY.md`, the editor approximates the reasoning from what's in `SKILL.md`. Approximation is enough for small edits; for substantive edits, the approximation misses why-decisions that aren't recoverable from the surface text. The `PHILOSOPHY.md` is the editor's source of truth for those why-decisions.

### Skills drift across edits unless anchored

Each edit is a small drift unless the editor knows what to preserve. Even editors with good intentions undo decisions they didn't know were decisions. Over many edits, the skill loses coherence with its original purpose. The `PHILOSOPHY.md` is the structural defence: an editor who reads it knows what the load-bearing pieces are and avoids removing them by accident.

## Decisions made

### Skill name: `skill-philosophy`

I considered `skill-maintenance` (action-named) and `skill-pairing` (descriptive). Settled on `skill-philosophy` to match the genre of the editorial file itself — the skill is about the practice of pairing `SKILL.md` with `PHILOSOPHY.md`, and `philosophy` carries the right weight for what the editorial layer holds.

### Triggered on edit, not always-on

The skill fires when a skill is being created or modified. It doesn't need to be loaded otherwise. `user-invocable: false` with a TRIGGER on edit captures this. Sessions that aren't editing skills don't pay the runtime cost.

### `PHILOSOPHY.md` voice: first-person SC, addressed to future editors

The voice already exists in the foundational `PHILOSOPHY.md` files. Keeping it consistent across skills makes the genre stable for editors. Each `PHILOSOPHY.md` reads as the SC writing to whoever will edit the `SKILL.md` next.

### Structure consistent across all `PHILOSOPHY.md` files

The recurring sections (Why this skill exists / Origin / Key insights / Decisions / What was rejected / What it doesn't cover / Notes for editors) come from the foundational `PHILOSOPHY.md` files. Standardising the structure makes editing predictable — an editor reading any `PHILOSOPHY.md` knows where to find what.

## What was rejected

- **Combining `SKILL.md` and `PHILOSOPHY.md` into one file.** The runtime / editorial split is the load-bearing reason for two files. One file means the editorial content is paid for at runtime.
- **`PHILOSOPHY.md` is optional.** Optional makes it ignorable, and ignored becomes missing. Required is the discipline.
- **`SKILL.md` describes its own reasoning inline.** Tried in early skills; produces bloated runtime content and still loses the reasoning at edit time because nobody reads `SKILL.md` thinking about reasoning while editing.

## What this skill does NOT cover

- The mechanics of where skill files live on disk (install paths, source repos, syncing). That is fleet/install-level concern, not skill-content concern.
- Specific `PHILOSOPHY.md` templates per skill type. The structure (Why / Origin / Key insights / Decisions / Rejected / Doesn't cover / Notes) is consistent across all skills; specific instances vary by content.
- The decision of when a skill is "ready" to ship — that judgment varies per skill and lives with the SC.

## Notes for future editors

- The two-file pattern is load-bearing. Reverting to `SKILL.md`-only is regression.
- The `PHILOSOPHY.md` is not optional for new skills. If creating a skill, both files exist before completion.
- The `PHILOSOPHY.md` is updated when reasoning shifts, not when `SKILL.md` changes shape. Surface-level edits to `SKILL.md` may not need `PHILOSOPHY.md` updates. Substantive changes to the discipline do.
- The voice (first-person SC) is the genre. Drafts in other voices need a voice pass before they land.
