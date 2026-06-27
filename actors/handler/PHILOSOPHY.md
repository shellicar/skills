# handler: editorial context

## Provenance & status

First-cut copy of the shared handler harness (`fleet/.claude/CLAUDE.md`) on 2026-06-27, part of the actor/role/skill refactor (`~/.claude/taxonomy-refactor.md`).

**Copy, not move** — the fleet harness stays in place and keeps working. The cutover (composing the handler actor at launch, the way operators are composed) is a later execution step.

The harness boots **both** the mission-handler and the planner; what differentiates them is the *task* the SC gives at the start, not anything in the file. So this is the shared handler-family base, copied here verbatim as the first cut.

**Follow-ups (NOT done — first cut):**
- Collapse the role-pointer sections (Writing a prompt → `scribe`, Prompt delivery → `router`, Mission-lifecycle execution → `executor`) into a role-set declaration; the detail already lives in the migrated role files.
- Extract the embedded skills: testament, worktrees, issue-tracking, work-items, repo-maintenance, git, fleet-changes.
- Repoint the relative `../references/…` links (broken in this location).
- Fold in the handler editorial (`fleet/agents/handler/PHILOSOPHY.md`) and the overarching `fleet/agents/PHILOSOPHY.md`.
- The earlier stub's explicit relations (SC ↔ handler, handler ↔ operator/supervisor) + role-set were overwritten by this copy; re-add if wanted.
