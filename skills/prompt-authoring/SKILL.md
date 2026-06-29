# Prompt authoring

**Skill** (loaded by the `scribe` role). The reusable craft of writing a prompt well — true for any prompt, anywhere. The *shape* of a mission (which phases, roles, models, skills) is decided upstream and recorded in the agreement — see the `mission-shaping` skill. This skill is the writing.

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

The mission is a directory, `YYYY-MM-DD_NUM_description/`, holding `mission.md` (with `agreement.md`, `post-mortem.md`, and any `investigations/` or `plans/` colocated). NUM is the issue/work item number.

- Underscores separate the three segments
- Hyphens within the description
- Omit NUM for missions with no issue (releases, maintenance)

Examples:
- `2026-03-28_89_batch-message-processing/`
- `2026-03-27_20_strict-schema-example/`
- `2026-03-27_release/`

Missions live directly under `projects/<project>/missions/`.

## Scaffolding the skeleton

A new prompt starts from the scaffold script, not from a previous prompt. Reading old prompts to learn the shape contaminates the new one: anti-patterns and outdated formats from earlier templates get pattern-matched into the new prompt. The script removes that loop. Shape comes from the blocks directly; mission content fills in afterwards.

### Recurring mission types

The rule above — scaffold from the blocks, don't read old prompts — is right for *feature* missions, where a prior prompt's specifics contaminate the new one. Some types are the exception: maintenance releases, security audits, version-bump releases recur with a fixed shape, and that shape is canonical. For these, read the most recent prior instance (or a recipe under `templates/prompt-authoring/recipes/`, if one has been canonised) for the **shape** — which phases, which roles, which skills, in what order. Take the skeleton and nothing else: leave the advisories, versions, package names, and context. The contamination guard is still live — if you find yourself carrying anything across but the phase/role/skill structure, stop; that is contamination, not shape.

The script: `scripts/scaffold-prompt.mjs`. Reads JSON from stdin, writes a scaffolded `mission.md` into the mission directory it composes.

Inputs:

- `project` — the project name. The script writes the mission to `<pm-repo>/projects/<project>/missions/<YYYY-MM-DD>[_<issueNumber>]_<slug>/mission.md`.
- `slug` — the description part of the mission directory name (`<YYYY-MM-DD>[_<issueNumber>]_<slug>/`).
- `issueNumber` — optional. When supplied, included in the mission directory name per the naming convention.
- `baseRepo`, `worktreeName` — composed into the `Deliver to` frontmatter as `${baseRepo}--${worktreeName}`.
- `skillsDir` — substituted into `## Loading Skills` so the path pattern is concrete.
- `phases` — the structural decisions. Each needs `role` and `model`. Courier also needs `variant` (`github` or `azure`).

The date and the full output path are all derived by the script. The Handler does not name the path; the convention lives in one place.

Example:

```json
{
  "project": "claude-cli",
  "slug": "history-view",
  "issueNumber": 179,
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
echo '<json>' | node scripts/scaffold-prompt.mjs
```

The output `mission.md` has the right frontmatter (with `Written against version` set to the fleet-material short SHA captured at scaffold time), the standard patterns block, the phases summary, every phase composed from its block, and Delivery Notes at the bottom. The operator role arrives via `--system` at launch; the scaffold no longer substitutes agent paths. Mission content is the work that follows the scaffold.

The script commits the scaffold to the current branch before it returns. This is deliberate: the skeleton is boilerplate, so the review surface is your filled-in content diffed against that commit — not the commit itself. Don't be thrown by the commit, and don't treat it as the content commit: the filled mission and testament are committed separately, after the SC reviews, per *Writing a prompt* (step 8).

## Guardrails are infrastructure

Real guardrails — preflight, "stop and ask," critical-failure stop, explicit staging — live in the harness. They are silent until the operator hits them. They catch a defined failure mode without telling the operator how to walk through the work. The Handler does not write guardrails. If a recurring failure mode wants a structural rail, raise it with the SC; the rail belongs in the harness, not in every prompt as a re-statement.

## Verify commands

The commands in the Verify section are run by the operator and their output is consumed as tokens. If a command produces verbose output (turbo preamble, full test suite logs), the operator burns context on noise. Check that verify commands are configured for minimal output. See [verify-commands.md](verify-commands.md).
