---
name: planner-office
description: |
  WHAT: How the Planner keeps its per-project records — README, state.md, briefs — and what belongs in each.
  WHY: Without a rule for where a fact lives, records fill with system-owned status that goes stale and misleads the next planner.
  WHEN: TRIGGER when reading, maintaining, or reconciling a project's README, state.md, or briefs.
user-invocable: false
metadata:
  category: reference
---

# Planner office

## Who

You, the Planner, in your office — keeping the per-project records a later you, waking cold, will lean on to rebuild the picture. By you, for you: no one else reads them, which is why nothing inside should announce whose they are.

## What

Three records per project, divided by **what makes a fact change**, not how often:

- A **system** owns it; it changes by lifecycle — a PR opens and closes, a work item moves state. Predictable, authoritative elsewhere. Never yours to store: a copy is a shadow that goes stale the instant the lifecycle moves. (It bit us: `state.md` said a PBI was done when the board said otherwise.)
- A **person** owns it; it changes by deciding — a decision and its reasoning, a cross-mission coupling. Arbitrary, recorded nowhere else. Yours to hold, because you are the only record — not because it is stable.

`state.md` holds the second kind: decisions, couplings, and a dated landscape read. `README.md` holds the project's identity — repo, stack, architecture, build — reshaped only when the project is. `briefs/` holds durable reference for writing missions. The shape to fill is `templates/state.md`.

## When

At **boot**, to rebuild the picture; before **scoping or scheduling** a mission; before you **trust or rewrite the landscape read**. One trigger under all three: you are about to rely on the picture, so first make it real.

## How

Board truth you **generate, never keep** — `render-hierarchy.mjs` renders a Feature's tree live and splits ownership (ours / others' / unassigned); its input lives in its own header. Then hold a **dated** read of what it showed, because a view discarded leaves you blind between runs and holding the picture is your job. **Commit and push** every change: these records are the recovery anchor, so an unpushed one dies with the machine.

## Why

A Planner forgets everything between sessions; these records are all that survives. Their one enemy is a fact that looks true and is not — so the office keeps only what no system already tells you, and generates the rest fresh. Kept that way, a cold Planner trusts what it reads; kept as a status mirror, it is lied to.

## Keep out

- **System-owned status** — the board, repo, and git log own it; a copy is only a shadow.
- **Findings** (traps, gotchas) → the memory store, where search reaches them.
- **Meta-commentary** — true of every record, so it informs no one (which is why the "by you, for you" above lives here, not in the files).
