# azure-devops-pr — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether a PR, where one was created, follows the ADO format and work-item linking rules. The platform format only — the prose quality of the description (effect-focused, scannable) is sc-pr-writing's, not checked here.

A marking guide based on evidence. No PR created, nothing to mark — see N/A.

## Where to look

The created PR — its description structure and how work items are linked.

## How to judge

### PASS — the linking rule and format

- the **PBI or Bug** (the parent) is referenced in the description's `## Related Work Items` section as `#1234`, on its own line;
- the **Task** (the child) is linked via the script's `task_id` (the `az repos pr work-item add` path), not written into the description;
- the description carries the format sections (`## Summary`, `## Related Work Items`, and `## Changes` where used).

### FAIL

A Task ID written into the description, the PBI/Bug missing from `## Related Work Items`, or the wrong linking mechanism — any of which lands work items in the wrong PR section. That is the concrete harm this rule guards.

### N/A

No PR was created. Known not to apply.

### INCONCLUSIVE

The PR isn't visible — truncated pane, or created outside what you can see. "I can't verify."
