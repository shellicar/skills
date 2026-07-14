<!--
TEMPLATE — structure only. Copy to projects/<project>/state.md. The doctrine (what belongs, why) is the planner-office skill.
Fixed sections for consistency; drop one with nothing to hold (and the pnpm-only audit block off non-pnpm projects). Replace <…>.
-->

# <project> — State

## Dependency-audit currency
<!-- pnpm/Node only. A logged event: the date is permanently true, the gap to now is the signal. Produce with audit-repo.mjs. -->
- pnpm audit last run <YYYY-MM-DD> against main@<sha8>:
  - prod: <N> (<c> critical, <h> high, <m> moderate, <l> low) — critical: <names>
  - dev:  <N> (<c> critical, <h> high, <m> moderate, <l> low) — critical: <names>

## Decisions
<!-- Human-owned, recorded nowhere else: the decision and its reasoning. Changes when a decision is remade. -->
- <decision — and why>

## Cross-mission couplings
<!-- Structural relations the board cannot express. Not status. -->
- <what couples to what, and the consequence>

## Landscape read
<!-- A held read of board-owned truth, kept so you are not blind between runs. Dated; reconcile with render-hierarchy.mjs. -->
- <as of YYYY-MM-DD: where things stand; ownership — ours / others' / unassigned>

## Tech debt
- <debt — why deferred; the trigger to address it>
