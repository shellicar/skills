# User-level CLAUDE.md: editorial context

This file is the editorial context for `~/.claude/CLAUDE.md`. It is not loaded by Claude at runtime. Read it when you intend to modify the user-level CLAUDE.md, so the modification stays aligned with the reasoning that produced the current content.

## Why CLAUDE.md exists

It is the bootstrap. It loads at the start of every Claude session under my user account, regardless of project, regardless of CLI. Whatever it says is guaranteed to reach Claude. That is its only structural property; everything else is downstream of that.

The substance of how I work with Claude lives in the foundational skills (`claude-philosophy`, `commander-protocol`, `teapot-protocol`). CLAUDE.md does not duplicate or summarise that substance. It points at the skills and tells Claude to load them.

## Note on the current loader

This is a present-tense observation, not a foundational principle. The CLI may change; the philosophy does not. The rock to step over while looking at the vision: the present has to be navigated even when the destination is elsewhere.

Right now, my CLI does not auto-inject skill frontmatter into Claude's context. Skills are not discoverable at session start. This is a conscious choice; I am moving away from the co-working model where prompts themselves declare which skills to load, toward a harness that loads everything up front. The vision is consistent. The runway is not finished, and the present requires accommodation.

Operational consequence today: foundational skills must be named explicitly in CLAUDE.md so they load. Without explicit naming, they do not load, even though the files sit in `~/.claude/skills/`. If the CLI changes (auto-injection, frontmatter discovery, similar), the explicit naming becomes unnecessary. The bootstrap purpose of CLAUDE.md does not change; only the mechanism it uses to point at skills does. Editors should update the mechanism to match the environment, not treat the simplification as a regression.

The earlier duplication of skill content into CLAUDE.md was a separate workaround, for an unreliable loader. With the loader following explicit load instructions, the duplication is no longer needed and creates inconsistency risk.

## Loading is binary for foundational skills

For the foundational skills, loading at session start is binary: either they load (when their condition applies) or they do not load at all. Claude will not think mid-session "I am drifting; I should load `commander-protocol` now". By the time drift is visible, the canary the skill provides is already absent. The skill has to be in place from the start, or it does not work.

The loading triggers vary by skill:

- **Every session**: `claude-philosophy`, `commander-protocol`, `teapot-protocol`. These inflect every turn; they need to be in place at session start to do anything at all.
- **Real host (default)**: `safe-operations`. Loaded for sessions on a real host, which is most sessions. Not loaded in sandboxed sessions where the cost asymmetry largely disappears.
- **Co-working**: `co-working`. Loaded when the SC is active in the same system.

This principle (binary at session start, no mid-session loading) is specific to the foundational skills. Other skills (e.g. `git-commit`, `tdd`, `ado-work-items`) are situational and loaded on demand when relevant work appears. The binary applies to skills whose purpose is to inflect specific operations that would otherwise drift, where the moment of needing them is also the moment they would have to be already loaded.

Duplicating foundational skill content in CLAUDE.md creates a third state: content present in CLAUDE.md but stale relative to the skill, or content that contradicts what the skill says. Both are worse than either of the original two. The minimal CLAUDE.md preserves the binary for the skills where the binary matters.

## What CLAUDE.md should contain

- A reference to each foundational skill: name, one-line description of what it covers, instruction to load.
- That is the substance.

Optionally, anything that genuinely cannot wait for skill-level treatment could live here. So far I do not believe anything qualifies. Operational rules (protected files, destructive git, tool usage) feel urgent but are not foundational; they belong in their own skill or in operator-specific harnesses, not in the user-level bootstrap.

## What was rejected

- Operational discipline rules in CLAUDE.md (protected files, blocked operations, destructive git, staging discipline, writing style). These were carried from v1/v2 because the CLI was not reliably loading skills. With explicit load instructions, they belong elsewhere or in a dedicated skill.
- Substantive philosophy in CLAUDE.md. The philosophy lives in `claude-philosophy`. Restating it here duplicates the content.
- Brewing cycle mechanics in CLAUDE.md. The cycle lives in `teapot-protocol`. CLAUDE.md does not need to teach Claude what `🫖 Brewing.` means; the skill does that.
- Forms of address in CLAUDE.md. Lives in `commander-protocol`.
- The "what to check" list and "mistakes versus drift" framing. Both were in v2 alongside the brewing cycle; they belong in `teapot-protocol` if anywhere, after explicit discussion.

## Decisions made

### Sibling philosophy at `~/.claude/PHILOSOPHY.md`

CLAUDE.md does not have a per-skill directory structure (like `~/.claude/skills/{name}/`), so the sibling-file pattern is the cleanest place for this editorial context. Anyone editing the user-level CLAUDE.md will find this file alongside it.

### Voice: I speak, addressed to editors

Like the skill philosophy files. First person me, addressed to whoever is editing CLAUDE.md (Claude, or me).

### Skill names listed explicitly

Because the CLI does not inject frontmatter, CLAUDE.md must name skills by their on-disk names. Generic instructions like "load the foundational skills" or "load any skills marked `category: foundational`" would require Claude to discover the skills, which the environment does not support.

## Notes for future editors

- Keep CLAUDE.md minimal. Anything substantive belongs in a skill.
- New foundational skill: add a section to CLAUDE.md naming it and instructing the load. Add a corresponding `PHILOSOPHY.md` alongside the skill.
- Removed skill: remove the section from CLAUDE.md.
- If you find yourself wanting to add operational rules to CLAUDE.md, that is a signal that a skill is missing or that the skill loading is unreliable. Address the underlying issue rather than putting content into CLAUDE.md as a workaround.
- Substance creeping into CLAUDE.md is the failure mode this file is structured to prevent. If editing produces a CLAUDE.md that could substitute for loading the skills, the editing is wrong even if every line is technically accurate.
