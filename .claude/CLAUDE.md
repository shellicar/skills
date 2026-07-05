# Repository guide

This repo is the system itself: the actors, roles, and skills the fleet runs on, plus the code that binds them. The fleet consumes it — casts reach the skills through `~/.claude`, and the fleet repos carry it as material. The source of truth for a role, a skill, or a script a cast runs lives here, not in a fleet repo.

## Top-level layout

- `actors/` — the standing identities (`handler`, `operator`, `planner`, `supervisor`), each an `ACTOR.md`.
- `roles/` — the jobs an actor takes (`scribe`, `executor`, `interlocutor`, `squad-selector`, ...), each a `ROLE.md`.
- `skills/` — the skills, one directory each, holding `SKILL.md` and an optional `PHILOSOPHY.md`.
- `shared/` — modules shared across skills.
- `scripts/` — the SC's own scripts.
- `docs/`, `agents/` — supporting material.

## Editing skills

Before editing anything under `skills/`, always load `skills/PHILOSOPHY.md` and the skill's own `PHILOSOPHY.md` where it has one. The philosophy files carry the reasoning and the rejected alternatives; an edit made without them re-litigates settled decisions or breaks the shape the reasoning protects.

## The editorial layer

Reasoning lives beside what it governs, not loaded at runtime: a unit's own `PHILOSOPHY.md` (one role, one skill), `skills/PHILOSOPHY.md` (across skills), and the root `PHILOSOPHY.md` (the system itself). `DECISIONS.md` at the root is the dated, append-only ledger of what the SC signed off, with the reason. When a decision lands, it gets its ledger entry and the affected `PHILOSOPHY.md` is updated in the same change — the editorial layer is part of the change, not documentation to catch up later.

## Changing the glossary

Every time a term is added to or changed in `skills/system-glossary/SKILL.md`, search the whole repo for the word first. The material must not contradict or misuse the term — an existing use with a different meaning either gets rewritten to the glossary's meaning, or the word was the wrong one to pick. The glossary is the single source of truth only while nothing else pulls the word elsewhere: `blueprint` was defined while the Engineer role was already using it for class design, and the word was muddied from birth.

## Where scripts go

The question is who owns the script's craft, not who runs it.

- **A script a cast runs** lives with the skill whose craft it embodies: `skills/<skill>/scripts/`. The mission scripts sit this way — `create-mission.mjs` and `update-mission.mjs` under `prompt-authoring`, `scaffold-mission.mjs` under `mission-artefacts` — because those skills own the craft, even when a different role runs the script. A script runs by path, so a role that doesn't load the skill can still run a script that lives under it; home tracks the craft, not the runner.
- **The SC's own scripts** — the session launchers and the like — live in top-level `scripts/`. This directory is the SC's; it is not where cast-run scripts go.

## When a module goes to `shared/`

A helper goes in `shared/` only when it is shared across skills. If one skill uses it, it stays in that skill's `scripts/`; the moment a second skill needs it, it rises to `shared/`.

For example: a git helper that scripts in two different skills both call belongs in `shared/`, while a helper only one skill's scripts use stays under that skill in `skills/<skill>/scripts/`.

## Templates and material

A skill's material — templates, blocks — lives under the skill: `skills/<skill>/templates/`. The phase blocks the mission scripts compose from sit at `skills/prompt-authoring/templates/blocks/`.

## Actor and role frontmatter

Each `ACTOR.md` and `ROLE.md` declares what it loads in its frontmatter:

- **`ACTOR.md`** carries `roles:` (the roles the actor may take) and `skills:` (the skills it always loads, whatever role it is in).
- **`ROLE.md`** carries `skills:` (the skills that load with the role). Newer roles also carry a `sam:` block; the craft roles carry only `skills:`.

An actor's full skill set is its own `skills:` plus the `skills:` of whichever role(s) it is running. The planner runs all three of its roles at once; the handler runs one at a time.

Foundational skills are not listed here — they load for every session and live in `~/.claude/CLAUDE.md`. `co-working` is foundational too (loaded always, even when not co-working), so it is not a per-actor skill. `testament` is not foundational but every actor loads it, so it sits in each actor's `skills:`.

Nothing reads this frontmatter yet — it declares, it does not drive. It duplicates what `shared/pane/skills.mjs` hard-codes today (see below); the intent is to make the mirror read from the frontmatter later, so each file becomes the single source for what it loads.

## The skills mirror

`shared/pane/skills.mjs` hard-codes the skill set each actor and role loads. It is a hand-kept mirror of the `## Skills` sections in the `ACTOR.md`/`ROLE.md` files and the `Load:` lines in `~/.claude/CLAUDE.md`, injected as cached context before the first message so the skills land before the first turn. When you change what an actor or role loads, update `skills.mjs` to match. The duplication is deliberate for now; the intent is to make it dynamic later.
