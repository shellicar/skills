# mission-shaping: editorial context

## Provenance & status

Split out of the `prompt-authoring` skill on 2026-06-29, as part of the actor/role/skill refactor (`~/.claude/taxonomy-refactor.md`).

The split is along the agreement → scribe seam: deciding a mission's **shape** (which phases, roles, models, skills, and how they verify between phases) is the requirements-analyst's work and lands in the agreement; **writing** the mission for the operator audience is the scribe's, in `prompt-authoring`. The agreement records what was agreed; the mission is written for the reader.

Content moved here from `prompt-authoring`: Cost economics, Why phasing works, The supervision model, Skills (choosing the foundational + per-phase set), and the Blocks catalog. It is byte-faithful from the source; the agent links were already repointed from `agents/operators/<role>.md` to the `<role>` roles in the earlier prompt-authoring migration.

**Follow-ups (not done):**
- "Recurring mission types" was allocated to the shape but left in `prompt-authoring`'s Scaffolding section (it's tied to scaffolding-from-a-recipe); move it here if the seam should be exact.
- Internal links still point at fleet paths (`templates/prompt-authoring/README.md`, `verify-commands.md`) — broken from the skill's location; part of the broader B2 fleet-reference cleanup.
