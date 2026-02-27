---
name: work-item-migration
description: Migrate and consolidate Azure DevOps work items between projects. Use when moving work items across projects, consolidating duplicates, restructuring hierarchy during migration, or changing work item types as part of a project migration.
user-invocable: true
---

# Work Item Migration

**Scope: Cross-project migration and consolidation of Azure DevOps work items.**

For day-to-day work item CRUD, see `azure-devops-boards`. For hierarchy design principles, see `work-organisation`.

## Move Work Item Between Projects

Use REST API to move a work item to a different project. Update three fields together:
- `System.TeamProject` - target project name
- `System.AreaPath` - valid area path in target project
- `System.IterationPath` - valid iteration path in target project

```bash
az rest --method PATCH \
  --uri "https://dev.azure.com/{org}/_apis/wit/workitems/{id}?api-version=7.1" \
  --resource "499b84ac-1321-427f-aa17-267ca6975798" \
  --headers "Content-Type=application/json-patch+json" \
  --body '[
    {"op": "add", "path": "/fields/System.TeamProject", "value": "{TargetProject}"},
    {"op": "add", "path": "/fields/System.AreaPath", "value": "{TargetProject}\\{Area}"},
    {"op": "add", "path": "/fields/System.IterationPath", "value": "{TargetProject}\\{Iteration}"}
  ]'
```

**Important**:
- Parent relationships are preserved if the parent is already in the target project
- Move parent items before children to maintain hierarchy
- The resource ID `499b84ac-1321-427f-aa17-267ca6975798` is required for Azure AD authentication

## Migration Workflow

### 1. Discovery and Planning
Before migrating, gather the full picture:
- Query all work items in the source, grouped by type and state
- Check what already exists in the target project (area paths, iterations, work items)
- Identify the hierarchy (Initiative → Epic → Feature → PBI → Task)
- Present a summary to the user before proceeding

### 2. Categorize Items
For each item, determine the action:
- **Move**: Item needs to be moved to target project (use REST API to update TeamProject/AreaPath/IterationPath)
- **Recreate**: Item needs a fresh start in the target — create new item in target, mark old as Removed with link and comment
- **Consolidate**: Equivalent item exists in target - mark as Removed with link and comment
- **Done**: Item was completed - leave as Done
- **Remove**: Item is obsolete/cancelled - mark as Removed

### 3. Consider Type Changes
Work item types may change during migration (case by case):
- Feature → PBI (if scope reduced)
- Feature → Epic (if scope increased)
- Epic → Feature (if scope reduced)
- Initiative → dissolve into Area Path (if it represents a product area, not a work stream)

Evaluate each item's scope relative to the target project's structure.

**Note**: Azure DevOps supports changing work item types in the UI, but the underlying API is an internal/undocumented Contribution API — not part of the standard REST API. It is fragile and not practical to use from CLI. When a type change is needed during migration, create a new item of the correct type in the target project, then mark the original as Removed with a link and comment.

### 4. Consider Structural Changes
During migration, evaluate whether the current hierarchy is the right structure:
- **Initiatives as Area Paths**: If initiatives represent product areas (e.g., "easyquote", "10ms"), they should become area paths rather than work items
- **Release-scoped Epics as Iterations**: If epics represent releases/versions (e.g., "v1.5 - Feature X"), the version goes to an iteration path and the work becomes a properly scoped epic or feature
- **"Backlog" container Epics**: Epics that are just unsorted backlog containers should be dissolved — their children become unparented features in the right area path
- **Future sub-areas**: Use a `Future` sub-area (e.g., `Project\Area\Product\Future`) for backlog items that aren't actively planned. This follows the pattern used in existing projects.

### 5. Fields to Preserve
When creating new items in the target project, copy these fields from the source:
- **Title** (may be cleaned up, e.g., removing version prefixes)
- **Description** (check HTML vs markdown format)
- **State** (create as New, then update to correct state)
- **Assigned To**
- **Parent relationship** (set to the appropriate parent in the target)
- **Area Path** (mapped to target project structure)
- **Iteration Path** (mapped to target project structure)

### 6. Per-Item Migration Steps (Recreate)
For each item being recreated in the target:

1. **Create** the new work item in the target project with title, description, area, iteration
2. **Set state** to match the source (items are created as New, update afterwards)
3. **Set Assigned To** to match the source
4. **Add parent relationship** to the appropriate parent in the target
5. **Add Related link** from the source to the new item
6. **Add migration comment** on the source (using HTML anchor format for cross-project links)
7. **Mark source as Removed**

### 7. Process Order
Process by area/product group, one at a time. Within each group, create parents before children so parent IDs are available for linking.

### 8. State Guidelines
- **Done**: Use when functionality is complete — leave these items in the source project
- **Removed**: Use for migrated/consolidated/obsolete items (not Done - Done implies functionality is complete)

## Consolidating Work Items

When an equivalent work item already exists in the target project:

1. **Check descriptions** of both items. If both have descriptions, ask the user how to consolidate
2. **Copy description** from source to target if target has none
3. **Check `multilineFieldsFormat`** - if source has `"System.Description": "markdown"`, ensure destination also has markdown enabled (this is a UI toggle, not settable via API)
4. **Mark source as Removed** (not Done - Done implies functionality is complete)
5. **Add Related link** from source to target work item
6. **Add comment** explaining the consolidation with cross-project link

### Comment Format for Cross-Project Links

Use HTML format with `data-vss-mention` attribute for proper rendering:

```bash
az rest --method POST \
  --uri "https://dev.azure.com/{org}/{project}/_apis/wit/workItems/{id}/comments?api-version=7.1-preview.4" \
  --resource "499b84ac-1321-427f-aa17-267ca6975798" \
  --headers "Content-Type=application/json" \
  --body '{"text": "<div>Continued in <a href=\"https://dev.azure.com/{org}/{targetProject}/_workitems/edit/{targetId}/\" data-vss-mention=\"version:1.0\">#{targetId}</a> ({Title}) in {targetProject} project as part of work item migration.</div>"}'
```

**Note**: Plain text `#1234` does NOT auto-link for cross-project references. Must use full HTML anchor tag.
