# sc-doc-writing: editorial context

This file is the editorial record for the `sc-doc-writing` skill. It is not loaded at runtime. Read it before modifying `SKILL.md`, so a change stays aligned with the reasoning that produced it. The operative why now lives in the SKILL, next to the rule it explains; this file holds the history, the decisions, and what was rejected.

## Why this skill exists

Documentation is where Claude's pitch-default does the most damage, because a README is the artifact with the most room for prose. The voice layer (`sc-ghostwriting`) is medium-independent; the shape of a README is specific, and it lives here. The doc is for the reader who finds the repo, to be useful to them, not for the author or a sell; whether they understand is the writer's responsibility.

## Origin

Written on 2026-06-28, out of a claude-cli documentation mission whose brief (the handler's error) imposed an essay structure on the root README: origin narrative, a "why you'd want it / why you wouldn't" section, a thesis, bottom-line bullets. The Writer produced exactly that. The SC's correction was that this is the wrong medium, not the wrong sentences: his READMEs are reference manuals, and the shape should be read off them, not designed.

## Key insights

### The shape is observed, not invented

The format in the SKILL is read off Stephen's actual ecosystem READMEs (`core-config`, `build-clean`, `build-version`, `build-graphql`, `winston-azure-application-insights`, `core-di`, `cosmos-query-builder`). They are consistent enough that "reproduce theirs" is a concrete instruction. The body is code; prose is minimal.

### The why is a paragraph, not a section

The load-bearing rule: the reason the thing exists is a short Motivation, problem then what-you-did, not a persuasive section.

### The incumbent exception

The reference default is easy to over-apply. When the project competes with a well-known, more capable incumbent the reader already has (a terminal client for Claude Code), an honest "why you might want this / what it doesn't have" answers a real question. `core-di` has no incumbent, so it needs none. The exception is the framing being present; the voice stays plain.

## Decisions made

- **Split from `sc-ghostwriting`, not folded in.** Voice is medium-independent and lives in the umbrella; README shape is specific and lives here, the same split as `sc-pr-writing` and `sc-workitem-writing`.
- **Examples as the target, not rules.** His real READMEs and Motivations are named and embedded so the skill teaches by what to match, not by a list of prohibitions.
- **Positive framing.** The pitch failures are written as tells of drift, not as a list of bans, because a ban leaves the trained pitch-default intact and stacks a rule on top.

## What was rejected

- **A "What never appears" prohibition list.** The first draft. It read as bans (no thesis, no why/why-not, no bottom-line), which is the negative framing `claude-philosophy` says fails by construction, and it wrongly forbade the why/why-not the incumbent case legitimately needs.
- **Treating the bottom-line and the why-section as pitch-tells.** A later draft still did. Corrected: the tell is the selling voice, not the structure. A complex app earns a scannable summary, a capable incumbent earns a "why you might want this," and both are fine in plain register.
- **Condemning a good opening.** An early example flagged "A deliberately thin, terminal-native replacement for Claude Code" as bad. It is fine; only the slogans after it were the failure.
- **The operative why in this file.** The first draft put the reasoning here; per the 2026-06-26 migration it belongs in the SKILL, where it loads.

## What this skill does NOT cover

- Stephen's voice (economy, modesty, the tells, no em dashes): `sc-ghostwriting`, the required base.
- Commit, PR, and work-item shape: `sc-commit-writing`, `sc-pr-writing`, `sc-workitem-writing`.
- The universal effect-not-implementation principle: `technical-writing`.

## Notes for future editors

- The shape is observed off his READMEs. If his house style changes, the SKILL follows the corpus, not a designed ideal.
- The incumbent exception is real but narrow. Do not let it grow back into a general licence to pitch.
- Keep the framing positive. If an edit turns the SKILL into "never do X," it has reverted to the pattern this family avoids.
