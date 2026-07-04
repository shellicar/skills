# Prompt authoring

**Skill** (loaded by the `scribe` role). The reusable craft of writing a prompt well — true for any prompt, anywhere. The *shape* of a mission (which phases, roles, models, skills) is decided upstream and recorded in `squad.md` — see the `squad-selection` skill. This skill is the writing.

## Writing for a literal reader

Operators run on the current top model (Opus 4.8). Older models are a false economy: in benchmarking, each pre-4.8 model resolved fewer problems, and the cheaper ones often cost *more* per resolved unit, not less. Drop to a cheaper model only when the absolute cost of the work is trivial regardless, where the choice doesn't matter. Either way, the operator follows prompts literally. Every fabricated specific ends up in the code. Write accordingly.

### Say what to do

Positive instructions. State the action, not its absence.

**Weak**: "Don't create helper scripts."
**Strong**: "Use the tools that already exist. If you reach for a helper, stop and report."

**Weak**: "Don't over-engineer."
**Strong**: "Build only what this mission names. If you notice something else that should change, record it in the debrief as a gap."

### Give the reason

The operator generalises better when they know why. A rule without a reason becomes a rule to work around.

**Rule only**: "Use `expandPath`."
**Rule with reason**: "Use `expandPath`. It already handles `~` and `$VAR` expansion via `IFileSystem`. Reimplementing produces a second path utility that can drift."

**Rule only**: "Stage explicitly. No `git add .`."
**Rule with reason**: "Stage by explicit filename. `git add .` pulls in files you didn't intend to commit, including unrelated work that was in the tree when you started."

### Match the style

Prompt style influences output style. A terse prompt produces terse code. A prompt that lists every edge case in excruciating detail produces a commit message that does the same. Write prompts in the voice you want the output in.

### Naming

Frame branch names, PR titles, and commit messages in terms of the user-visible effect, not the internal mechanism. The diff shows what changed. The name explains why.

## Findings, not rules

Two ways to write the same content:

**Rule**: "Do not modify files outside the ones listed."
**Finding**: "From the investigation, the cause is in `parser.ts:84`. The bug surfaces in `options.ts` but the fix lives in `parser.ts`."

The rule traps the operator if the fix actually requires a third file. They are caught between the rule and the goal — they fail one or the other. The finding gets updated when reality differs; nothing breaks.

A finding carries its WHY — *from the investigation*, *because the bug is at X*. The operator can see where the claim came from and revise it when they find more. A rule hides its source, which is what makes unsourced rules easy to write and dangerous in practice.

## Context

Inline the context the operator needs. When you have investigation findings, bake them in: file paths, line numbers, root cause analysis, decisions. The operator should not re-investigate what you already know.

Long-form investigation output belongs in a separate document the operator reads. Point to it. Do not paste it in full; the operator reads it if they need it.

## The operator follows what you write

The operator runs the prompt literally. Whatever you put in lands as work.

- A finding lands as a starting point the operator uses and updates as they learn more.
- A rule lands as obedience, including when the rule is wrong.
- An ambiguity lands as the operator's interpretation, which you cannot predict.
- An absence lands as the operator's initiative — they ask, or they fill in with their own judgment.

When something goes wrong, look at what you wrote.


## Frontmatter Schema

```yaml
---
Type: worker
Status: ready
Created: YYYY-MM-DD
Deliver to: ~/repos/<org>/<repo>--<short-description>
---
```

| Field | Values | Notes |
|-------|--------|-------|
| Type | `pm-session`, `worker` | |
| Status | `ready`, `received`, `in-progress`, `paused`, `completed` | Lifecycle state |
| Created | YYYY-MM-DD | Date the prompt was written |
| Deliver to | worktree path | Worker prompts only. The worktree the operator delivers to. See the `worktrees` skill for naming and lifecycle. |

Model is specified per-phase in phase headings, not in frontmatter. Valid values: `Sonnet`, `Opus`.

Default to the current top model (Opus 4.8). Older models are a false economy (fewer resolved, often higher cost per resolved), so use `Sonnet` only when the absolute cost is trivial regardless.

Effort is optional per-phase, set as an `Effort:` line beside `Model:`. Valid values: `low`, `medium`, `high`, `xhigh`, `max`. It dials how much time and tokens the cast spends, not its capability. Omitted → the cast inherits `claude-sdk-cli`'s configured default. The scaffold emits the line when a phase names it, and the cast-launch scripts thread it through as `--config '{"thinking":{"effort":"<value>"}}'`.

## Naming Convention

The mission directory, the artefacts it holds, and the naming format are defined once in the `mission-artefacts` skill — the single source. This skill is the writing craft; that one is the structure it writes into.

## Scaffolding the skeleton

A new prompt starts from the scaffold script, not from a previous prompt. Reading old prompts to learn the shape contaminates the new one: anti-patterns and outdated formats from earlier templates get pattern-matched into the new prompt. The script removes that loop. Shape comes from the blocks directly; mission content fills in afterwards.

### Recurring mission types

The rule above — scaffold from the blocks, don't read old prompts — is right for *feature* missions, where a prior prompt's specifics contaminate the new one. Some types are the exception: maintenance releases, security audits, version-bump releases recur with a fixed shape, and that shape is canonical. For these, read the most recent prior instance (or a recipe under `templates/prompt-authoring/recipes/`, if one has been canonised) for the **shape** — which phases, which roles, which skills, in what order. Take the skeleton and nothing else: leave the advisories, versions, package names, and context. The contamination guard is still live — if you find yourself carrying anything across but the phase/role/skill structure, stop; that is contamination, not shape.

The scribe's script is `create-mission.mjs`, run through the `scribe` role. It is one of three that carry a mission's file across its life, each *handed* the mission directory rather than composing a path from parts:

- `scaffold-mission.mjs` — run by the interlocutor at the start. Creates the mission directory, dated once, holding `intent.md`, `squad.md`, and a `mission.md` placeholder. This is the only script that derives the date; every script after it takes the directory as given.
- `create-mission.mjs` — yours. Writes the `mission.md` skeleton into the directory you are handed.
- `update-mission.mjs` — run by the executor. Adds phases to an existing `mission.md` as the mission runs.

`create-mission.mjs` reads JSON from stdin and overwrites the `mission.md` placeholder with the skeleton. Inputs:

- `missionDir` — the mission directory, handed to you; it already exists. The script writes `mission.md` into it and reads the date from the directory name. You do not name the path or the date — they were set once, when the directory was created.
- `baseRepo`, `worktreeName` — composed into the `Deliver to` frontmatter as `${baseRepo}--${worktreeName}`.
- `skillsDir` — substituted into `## Loading Skills` so the path pattern is concrete.
- `phases` — the structural decisions. Each needs `role` and `model`; `effort` is optional; Courier also needs `variant` (`github` or `azure`).

Example:

```json
{
  "missionDir": "~/repos/@shellicar/handler/projects/claude-cli/missions/2026-07-04_179_history-view",
  "baseRepo": "~/repos/@shellicar/claude-cli",
  "worktreeName": "history-view",
  "skillsDir": "~/repos/shellicar/skills/skills",
  "phases": [
    { "role": "Investigator", "model": "Opus" },
    { "role": "Apostle",      "model": "Opus" },
    { "role": "Maker",        "model": "Opus" },
    { "role": "Courier",      "model": "Opus", "variant": "github" }
  ]
}
```

Pipe in:

```
echo '<json>' | node ~/repos/shellicar/skills/skills/prompt-authoring/scripts/create-mission.mjs
```

The output `mission.md` has the right frontmatter (with `Written against version` set to the material short SHA captured at write time), the standard patterns block, the phases summary, every phase composed from its block, and Delivery Notes at the bottom. The operator role arrives via `--system` at launch; the script no longer substitutes agent paths. Mission content is the work that follows.

The script commits the `mission.md` it writes before it returns. This is purely a review mechanism, not the content commit: the skeleton is boilerplate, so committing it makes your review surface the filled-in content diffed against that commit, rather than the boilerplate as well. Without the commit the SC would be reading everything, skeleton included. The filled mission is committed separately, after the SC reviews, per *Writing a prompt* (step 8). `scaffold-mission` commits its placeholders for the same reason; `update-mission` does not commit, since an existing `mission.md` already lives in whatever state the scribe or a prior run left it.

## Guardrails are infrastructure

Real guardrails — preflight, "stop and ask," critical-failure stop, explicit staging — live in the harness. They are silent until the operator hits them. They catch a defined failure mode without telling the operator how to walk through the work. The Handler does not write guardrails. If a recurring failure mode wants a structural rail, raise it with the SC; the rail belongs in the harness, not in every prompt as a re-statement.

## Verify commands

The commands in the Verify section are run by the operator and their output is consumed as tokens. If a command produces verbose output (turbo preamble, full test suite logs), the operator burns context on noise. Check that verify commands are configured for minimal output. See [verify-commands.md](verify-commands.md).
