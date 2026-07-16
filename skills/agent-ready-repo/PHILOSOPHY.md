# agent-ready-repo: editorial context

Not loaded at runtime. Read before you change `SKILL.md`. The reasoning that shapes behaviour lives in the SKILL; this holds the history, the decisions, and what was rejected.

## Where it came from

Migrated from the fleet's `references/llm-ification.md` — the standard for making a repo agent-ready — with `references/verify-commands.md` folded in as the *Quiet commands* section. One of the first references brought into the skills repo as the fleet submodule is cannibalised.

## Decisions

- Named `agent-ready-repo`, not `llm-ification`. "llm-ification" is jargon, and it named the *process* awkwardly. The skill is named for what it produces — the source's own word for the target state, "agent-ready" — plus the subject it acts on, the repo.
- `verify-commands` folded in rather than kept as its own skill: making commands quiet is one part of this standard, not a separate thing.
- Kept distinct from `new-project-setup`: this brings an *existing* repo up to standard; that onboards a *new* project. One improves a repo, the other creates one.
- Added the *Cache correctness* section (2026-07-16) from a real incident, not the source references — the "add repo-specific gotchas as real ones surface" note being exercised. A `type-check` turbo task whose `inputs` listed only `tsconfig.check.json` replayed a stale pass on every `.ts` edit, because a task's `inputs` *replaces* turbo's default all-files hash set. Kept distinct from *Quiet commands*: that section is the noise axis (`outputLogs`), this is the correctness axis (`inputs`) — a false green is a worse failure than a noisy one. The agent-blindness reasoning (a human re-runs with `--force` for free; an agent in a warm-cache worktree can't tell a replay from a real pass) is why it lives in config, not agent habit.

## What was rejected

- The name `llm-ification` — jargon, and it named the process rather than the thing.
- Merging it with `new-project-setup` — different domains (improve an existing repo vs create a new one).

## Notes for future editors

- Every claim traces to the source references. Add repo-specific gotchas as real ones surface; do not invent them.
- The README / `CLAUDE.md` line is the spine — README orients, `CLAUDE.md` operates. If an edit blurs that, the standard is lost.
- Maintaining the `CLAUDE.md` over time is `project-memory`'s job, not this skill's: this is the bar, that is the upkeep.
