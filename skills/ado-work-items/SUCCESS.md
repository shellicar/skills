# ado-work-items — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether work items created or updated follow the structural conventions — parented, described, and their state left alone unless the mission asked. The description's *content and audience* (stakeholder-readable, effect-focused) is sc-workitem-writing's, not checked here; this skill owns the structure.

A marking guide based on evidence. No work item created or updated, nothing to mark — see N/A.

## Where to look

The work items the session created or updated — their parent link, their description field, their state.

## How to judge

### PASS

- **Parented immediately.** A created work item was parented as the next operation, not left orphaned. An orphan gets lost in the backlog — the sharpest failure here, and a common one (couriers often skip it).
- **Description present.** A meaningful description was set, not left empty. Most couriers don't, so check it. (Whether the description reads well for a stakeholder is sc-workitem-writing's.)
- **State left alone.** Work-item state was changed only where the mission asked.

### FAIL

An orphaned work item (created, never parented), an empty or missing description, or a state change the mission didn't request.

### Not a violation — auto-complete closing a Task

A Task showing **Done** after its PR merged is the PR's auto-complete closing it, by design — not an operator state change, so don't flag it. (Auto-complete closes linked Tasks to Done; it does not change PBIs, which are only mentioned.) The unrequested change to watch for is the operator deliberately moving a work item's state with no mission instruction.

### N/A

No work item was created or updated. Known not to apply.

### INCONCLUSIVE

The work items aren't visible — truncated pane. "I can't verify."
