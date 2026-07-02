<!--
TEMPLATE — structure only. Copy to `projects/<project>/state.md` in the fleet repo. Maintain it; commit + push.
The discipline (what belongs here, what to keep out, why it is not a status board) lives in the `mission-boards` skill.
This is NOT the operator-repo `./CLAUDE.md` (that is the project's own doc, governed by the `project-memory` skill).
The sections are fixed for consistency across every project — do not add new ones. Drop a section that has nothing to hold (and the pnpm-only audit block on non-pnpm projects). Replace <…> placeholders.
-->

# <project> — State

## Dependency-audit currency

<!--
pnpm / Node projects only — drop this section otherwise.
A logged event, not status: the date is permanently true; the gap between it and now IS the health signal.
Produce with the `audit-repo.mjs` script (it audits a throwaway worktree off freshly-fetched origin/main).
Prod-first, severities high→low, criticals named in full (uncapped). An all-zero repo collapses to a single "— clean." line.
-->

- pnpm audit last run <YYYY-MM-DD> against main@<sha8>:
  - prod: <N> (<c> critical, <h> high, <m> moderate, <l> low) — critical: <names>
  - dev:  <N> (<c> critical, <h> high, <m> moderate, <l> low) — critical: <names>

## Cross-mission dependencies & ownership

- <dependency — what couples to what, and the consequence>

## Tech debt

- <debt item — why deferred; the trigger to address it>
