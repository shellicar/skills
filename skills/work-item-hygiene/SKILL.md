---
name: work-item-hygiene
description: Audit and improve Azure DevOps work item quality across iterations. Use when asked to review work items for missing/inadequate descriptions, vague titles, area path violations, removed items in active iterations, or general board hygiene. Also use when asked to do a "health check" or "hygiene audit" of work items.
---

# Work Item Hygiene

**Scope: Audit checks and quality standards for work item fields across iterations.**

Audit work items for quality, completeness, and consistency. Present findings for review rather than auto-fixing — the Supreme Commander decides what to change.

## Audit Workflow

### 1. Identify Iterations to Audit

Query active iterations using `work_list_iterations` or `work_list_team_iterations`. Typically audit:
- Current support iteration
- Current and recent project iterations

### 2. Fetch All Work Items

Use WIQL to query items in target iterations:

```wiql
SELECT [System.Id]
FROM WorkItems
WHERE [System.IterationPath] UNDER '{iteration}'
ORDER BY [System.WorkItemType], [System.Id]
```

Then batch-fetch with `az boards work-item show --id <ID>` (or loop over IDs) including fields:
- `System.Id`, `System.Title`, `System.WorkItemType`, `System.State`
- `System.Description`, `System.AreaPath`, `System.IterationPath`, `System.Parent`
- `Microsoft.VSTS.TCM.ReproSteps` (for Bugs)

### 3. Run Health Checks

Check each item against these criteria:

**Area path (leaf items)**: PBIs and Tasks should be under a specific child area path (e.g. `Project\FeatureArea`), not the root project path. Tasks should match their parent PBI's area path.

**Area path (portfolio items)**: Initiatives, Epics, and Features on a non-root area path may be incorrect — these are cross-cutting and typically belong at the root. Not a hard rule, but worth flagging for review.

**Iteration path (leaf items)**: PBIs and Tasks should be in a specific leaf iteration (e.g. `Project\Sprint 1`), not the root iteration. Root iteration means unscheduled — check if this is intentional.

**Iteration path (portfolio items)**: Initiatives, Epics, and Features on a non-root iteration may be incorrect — these are cross-cutting and typically sit at the root iteration.

**Title quality**: Should be specific and actionable. "Create templates" is vague; "Create attendance email templates and enum values" is clear.

**Description presence**: Every item needs a description. Note: `System.Description` is a long-text field — cannot query `= ''` in WIQL. Must batch-fetch and check programmatically.

**Description quality**: Not just present but adequate. A one-liner like "Needs to be added" is not adequate for a PBI. Descriptions should explain the what and why.

**Bug description field**: Bugs render `Microsoft.VSTS.TCM.ReproSteps`, NOT `System.Description`. Always check and write to `ReproSteps` for Bugs. Content in `System.Description` on a Bug is invisible in the UI.

**Removed/duplicate items**: Items marked Removed should not remain in active iterations — move to Archive.

**State consistency**: Done items should have descriptions too (for historical reference).

### 4. Present Findings

Present findings to the Supreme Commander grouped by severity:
- **Fix immediately**: Area path violations, wrong description field (Bug in System.Description)
- **Review together**: Missing descriptions, inadequate descriptions, vague titles
- **Discuss**: Removed items, scope questions, items that may need reclassification

Go through items one-by-one rather than in tables — tables don't render well for review.

### 5. Apply Fixes

After the Supreme Commander approves each fix:
- Update via `az boards work-item update` (or batch update scripts for bulk changes)
- Write descriptions back to the Supreme Commander for eyeballing before moving on
- Use batch updates where multiple items need the same type of fix (e.g. area path corrections)

## Description Writing Conventions

See `work-organisation` skill for description conventions by audience (PBI/Bug = stakeholder-friendly, Task = implementation-oriented). See `writing-style` skill for tone and examples.

### Formatting
- Structure HTML descriptions with `<br><br>` for paragraph breaks, `<ul><li>` for lists, `<b>` for emphasis
- For Bugs, use `<h2>` sections: Problem, Root Cause, Fix

### Verification Tasks
- Explain what is being verified and **why** it matters
- Include a **Result** section with the finding

### Work Item References
Always use rich links in descriptions, never plain `#123`:
```html
<a href="https://dev.azure.com/{org}/{project}/_workitems/edit/{id}/" data-vss-mention="version:1.0">#{id}</a>
```

## Gotchas

- `System.Description` is not rendered for Bug work items — use `Microsoft.VSTS.TCM.ReproSteps`
- `System.Description` is a long-text field — cannot query `= ''` or check length in WIQL
- `System.Parent` field on `az boards work-item create` doesn't reliably create hierarchy links — use `az boards work-item relation add` separately
- When using `az rest` for HTML descriptions, use `<br>` or `<div>` for line breaks
- PR/task titles sometimes drift from actual scope during implementation — check titles match what was done, not what was planned
