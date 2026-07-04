# Prompt Authoring Templates

Templates for composing operator missions. The blocks here are consumed by [../scripts/create-mission.mjs](../scripts/create-mission.mjs), which writes the mission skeleton from a JSON description, and [../scripts/update-mission.mjs](../scripts/update-mission.mjs), which adds phases as the mission runs.

## Writing a mission

Start by running [../scripts/create-mission.mjs](../scripts/create-mission.mjs). It produces the mission skeleton from the blocks below: frontmatter, status instruction, patterns/roles preamble, mission briefing, delivery notes, and one composed phase per role. See the [prompt-authoring skill](../SKILL.md) ("Scaffolding the skeleton") for the inputs.

[prompt-template.md](prompt-template.md) documents the same shape for reference — it is what the scaffold produces. Read it if you want to see the assembled layout in one place; do not author from it by hand.

Each block in `blocks/` is a role the operator takes on for that phase. The scaffold composes phases from these blocks; you do not edit blocks per-mission.

### Roles

| Block | Role | What they are |
|-------|------|---------------|
| [red.md](blocks/red.md) | Scaffolder | Puts up the structure. Writes failing tests against stubs. |
| [green.md](blocks/green.md) | Builder | Builds inside the scaffold. Makes the tests pass. |
| [code.md](blocks/code.md) | Maker | Builds from the plan. Implementation without tests. |
| [apprentice.md](blocks/apprentice.md) | Apprentice | Reproduces reference implementation faithfully. |
| [cleaner.md](blocks/cleaner.md) | Cleaner | Fixes lint, formatting, code style. The only role that runs linters. |
| [courier-github.md](blocks/courier-github.md) | Courier | Gets the work out. Distils testament, opens PR. |
| [courier-azure.md](blocks/courier-azure.md) | Courier | ADO variant: creates Task, opens PR with work item linking. |
| [investigation.md](blocks/investigation.md) | Investigator | Explores the codebase, writes findings report. |
| [system-design.md](blocks/system-design.md) | Architect | Thinks in systems. Produces options. Does not choose. |
| [class-design.md](blocks/class-design.md) | Engineer | Produces the blueprint for a decided direction. |
| [codebase-discovery.md](blocks/codebase-discovery.md) | Scout | Goes ahead, confirms terrain, reports back. |
| [apostle.md](blocks/apostle.md) | Apostle | Walks the codebase like a Maker, writes the code that would land, doesn't save it. |
| [code-review.md](blocks/code-review.md) | Reviewer | Fresh eyes. Reviews implementation for quality. |
| [writer.md](blocks/writer.md) | Writer | Shapes source material into a document for a reader. |
| [changes-jsonl.md](blocks/changes-jsonl.md) | — | Append-only changelog entries. Include when the repo uses changes.jsonl. |
| [debrief.md](blocks/debrief.md) | — | Operator's debrief. Include at the end of every phase, before Supervisor Verification. |
| [preflight.md](blocks/preflight.md) | — | Verify clean state. Always first. |
| [skills-override.md](blocks/skills-override.md) | — | Override which skills are active for this cast. |

### Skills and blocks

A block is a *role* the operator takes for a phase; a skill is a *body of instructions* the operator follows within one. They are different things, and a skill does not replace a block or a phase. A skill is loaded inside a phase, in that phase's `## SKILLS` section — the operator's role for the phase is still one of the blocks above, usually the Maker, who builds from the skill as their plan. So a "skill-driven" mission is an ordinary block composition: the skill supplies the instructions, the blocks supply the structure and the role. A skill carrying the work removes no phase and no block; it rides inside them.

### Common compositions

- **Scaffolder + Builder + Courier** — test-driven implementation
- **Maker + Courier** — implementation without tests
- **Apprentice + Cleaner + Courier** — reproduce reference implementation
- **Maker + Cleaner + Courier** — implementation with cleanup before shipping
- **Investigator** — single phase, feeds the next mission
- **Architect → Engineer → Scaffolder + Builder + Courier** — full pipeline
- **Maker + Reviewer + Courier** — implementation with review before shipping
- **Apostle → Maker + Courier**: preview the implementation, then build and ship

### Recipes

A *recipe* is the canonical phase spine for a mission type that **recurs with a fixed shape** — maintenance releases, security audits, version-bump releases. Where a composition (above) names the role sequence in a line, a recipe is the detailed source: per phase, the role, the skills, and what it does. It exists so a recurring mission's shape is **read, not re-derived** — re-deriving it is how a recurring mission ends up with a freshly-invented, wrong structure.

Recipes live as files in a `recipes/` directory beside this one (none has been canonised yet). A recipe is the skeleton, not the mission: the author still fills the mission-level deltas (goal, why, branch, the specific context). Take the shape; never carry another instance's specifics.

(A scaffold step that expands a named recipe into phases is deferred; for now a recipe is a document you follow when composing.)

### Agents

The role-specific behaviour an operator takes on lives at `agents/operators/<role>.md` in fleet-material. Mission briefs reference these by absolute path so the operator can load them. Agents are files, not skills.