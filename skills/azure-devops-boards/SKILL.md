---
name: azure-devops-boards
description: Work items, hierarchy, and migrations in Azure DevOps. Use when creating/querying/updating work items, planning features, managing epics/initiatives/areas/iterations, or migrating work items between projects.
---

# Azure DevOps Boards

Work items, hierarchy, and migrations. See also `azure-devops-repos` for PR workflows that link to work items.

## When Invoked

If the user invokes this skill, they likely want help with:
- **Planning** new features (where to put them in hierarchy, creating epics/features/PBIs)
- **Managing** high-level items (initiatives, epics, areas, iterations)
- **Creating** work items (tasks, PBIs, features, epics)
- **Querying** work items (finding, searching, listing)
- **Updating** work items (fields, state, relationships)
- **Organizing** work items (hierarchy, parents, iterations, areas)
- **Migrating** work items between projects

Ask what they need help with if not clear from context.

## Work Items

```bash
# Show work item
az boards work-item show --id <ID>

# Query recent work items
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.CreatedDate] >= @Today - 7 ORDER BY [System.Id] DESC" -o table

# Query children of a work item
az boards query --wiql "SELECT [System.Id], [System.Title], [System.WorkItemType] FROM WorkItems WHERE [System.Parent] = <PARENT_ID>"

# Create work item (--project is REQUIRED for create)
az boards work-item create --type "Task" --title "Title" --project "<Project>" --area "<Area>" --iteration "<Iteration>"

# Update work item fields (NO --project flag - work item IDs are globally unique per org)
az boards work-item update --id <ID> --fields "System.IterationPath=<Iteration>"

# Update work item title
az boards work-item update --id <ID> --title "New Title"

# Add parent relationship
az boards work-item relation add --id <ID> --relation-type "parent" --target-id <PARENT_ID>

# Remove parent relationship
az boards work-item relation remove --id <ID> --relation-type "parent" --target-id <PARENT_ID> -y

# Add comment (use az rest — no native CLI command for comments)
az rest --method POST \
  --uri "https://dev.azure.com/{org}/{project}/_apis/wit/workItems/{id}/comments?api-version=7.1-preview.4" \
  --resource "499b84ac-1321-427f-aa17-267ca6975798" \
  --headers "Content-Type=application/json" \
  --body '{"text": "<div>Comment text here.</div>"}'
```

### CLI Gotchas

- **`az boards work-item update`**: Does NOT accept `--project`. Work item IDs are globally unique within an org, so only `--org` and `--id` are needed.
- **`--fields "System.Parent=X"` does NOT work for reparenting**: Setting `System.Parent` via `--fields` silently does nothing. You MUST use `az boards work-item relation remove` (old parent) then `az boards work-item relation add` (new parent) to change parent relationships.
- **No `az boards work-item list`**: This command does not exist. Use `az boards query` with WIQL instead.

### Type Changes

When changing work item type (e.g. PBI → Feature), state fields differ between types (e.g. PBI has Committed, Feature does not). **MANDATORY**: After changing type, provide a link to the work item for the Supreme Commander to verify the state and fields are correct before continuing.

**Note**: Azure DevOps supports changing work item types in the UI, but the underlying API is an internal/undocumented Contribution API. When a type change is needed, create a new item of the correct type, then mark the original as Removed with a link and comment.

### WIQL Notes

- **`ORDER BY` restrictions**: `[System.Parent]` cannot be used in ORDER BY — it throws "The specified field cannot be sorted by". Sort by `[System.Id]` or `[System.WorkItemType]` instead, then process results client-side.
- **Path values**: Do NOT use a leading backslash in WIQL. Use `<Project>\Iteration\Path`, not `\<Project>\Iteration\Path`.

### Batch Updates

When updating many work items in a loop, write a shell script to `/tmp/` and execute it (see `cli-tools` skill for why `&&` and `;` are blocked):

```bash
#!/bin/bash
set -e
for id in 100 101 102 103
do
  az boards work-item update --id "$id" --iteration 'Project\Iteration\Path' --org https://dev.azure.com/myorg --output none
  echo "Updated $id"
done
```

## Work Item Hierarchy

See `work-organisation` skill for hierarchy definitions (Initiative/Epic/Feature/PBI/Task), design principles, naming conventions, and the three independent dimensions (hierarchy, area path, iteration).

See `work-organisation` skill for hierarchy design principles, hierarchy diagrams, and the visual guide.

### Cross-Team Dependencies

Track dependencies between work items using link types:
- **Predecessor / Successor**: Time-based dependencies (B can't start until A finishes)
- **Related**: General association between related work items across teams

```bash
# Add predecessor link (target must finish before this item can start)
az boards work-item relation add --id <ID> --relation-type "Predecessor" --target-id <TARGET_ID>

# Add successor link
az boards work-item relation add --id <ID> --relation-type "Successor" --target-id <TARGET_ID>

# Add related link
az boards work-item relation add --id <ID> --relation-type "Related" --target-id <TARGET_ID>
```

Supported link types: `parent`, `child`, `duplicate`, `duplicate of`, `related`, `successor`, `predecessor`, `tested by`, `tests`, `affects`, `affected by`.

Dependency lines are visible on [delivery plans](https://learn.microsoft.com/en-us/azure/devops/boards/plans/track-dependencies?view=azure-devops). You can also query for linked items to find cross-team dependencies.

### Node Name Column

Add the **Node Name** column to backlog views to see the leaf node of the area path (i.e., which app/component). This is useful for identifying team ownership at a glance without the full area path taking up space.

## Iterations & Areas

```bash
# List project iterations
az boards iteration project list --project "<Project>" --depth 3 -o table

# List project area paths
az boards area project list --project "<Project>" --depth 2 -o table
```

```bash
# Create iteration (--path is the PARENT path, --name is the new child)
az boards iteration project create --name "Sprint 1" --path "\<Project>\Iteration\<Parent>" --project "<Project>"

# Create area path
az boards area project create --name "NewArea" --path "\<Project>\Area" --project "<Project>"

# Delete iteration (requires --path, NOT --id)
az boards iteration project delete --path "\<Project>\Iteration\<Parent>\<Child>" --project "<Project>" --yes

# Delete area path
az boards area project delete --path "\<Project>\Area\<Child>" --project "<Project>" --yes
```

### Iteration/Area Gotchas

- **`az boards iteration project delete`**: Requires `--path`, NOT `--id`. The `--id` parameter does not exist for this command.
- **Delete order**: Delete children before parents. A parent with children cannot be deleted.
- **Path format for CLI commands**: Use leading backslash for CLI `--path` args (e.g., `\<Project>\Iteration\<Parent>\<Child>`). This is different from WIQL where you omit the leading backslash.
- **Iteration create `--path`**: Must include `\Iteration\` in the path (e.g., `\<Project>\Iteration\<Parent>\<Child>`), not just `\<Project>\<Parent>\<Child>`. Without it, you get "path parameter is expected to be absolute path".
- **Iteration/area names cannot contain `/`**: Forward slashes are invalid in names. Use `-` instead (e.g., "POC-MVP Bug fixes" not "POC/MVP Bug fixes").
- **State transitions**: Some states cannot transition directly (e.g., Done → Removed). You may need an intermediate state (Done → New → Removed).

## Description Formatting (Work Items AND Pull Requests)

**IMPORTANT**: This formatting guide applies to both work item descriptions and pull request descriptions.

- **Work item descriptions**: Default to HTML. Can be switched to markdown via UI toggle (one-way).
- **Pull request descriptions**: Markdown. Use standard markdown formatting (headings, bullet lists, code spans, etc.).

### Bug Work Items — Different Description Fields

**CRITICAL**: Bug work items do NOT render `System.Description` in the UI. The visible fields are:

- **`Microsoft.VSTS.TCM.ReproSteps`** — "Repro Steps" (the primary description field for Bugs)
- **`Microsoft.VSTS.TCM.SystemInfo`** — "System Info"
- **`Microsoft.VSTS.Common.AcceptanceCriteria`** — "Acceptance Criteria"

When writing descriptions for Bugs, **always use `Microsoft.VSTS.TCM.ReproSteps`** instead of `System.Description`. Content written to `System.Description` on a Bug will exist in the API but will not be visible in the Azure DevOps UI.

Use the same HTML formatting conventions as `System.Description`. Structure Bug descriptions with `<h2>` sections:

```html
<h2>Problem</h2>
<p>What the user observed or what went wrong.</p>

<h2>Root Cause</h2>
<p>Technical explanation of why it happened.</p>

<h2>Fix</h2>
<p>What was done to resolve it.</p>
```

### Check Format First

Query the work item to check if markdown is enabled:
```bash
az boards work-item show --id <ID> -o json
```
Look for the `multilineFieldsFormat` field in the output.

- If `multilineFieldsFormat` is missing or doesn't include `"System.Description": "markdown"` → use HTML
- If `"System.Description": "markdown"` is present → use markdown

### HTML Format (Default)

Azure DevOps uses specific HTML patterns. Match these exactly — the trailing spaces before closing tags are intentional.

#### Paragraphs

Each paragraph is `<div><span>text</span> </div>` (note trailing space before `</div>`).
Blank lines between sections: `<div><br> </div>`.

```html
<div><span>First paragraph.</span> </div>
<div><br> </div>
<div><span>Second paragraph.</span> </div>
```

#### Inline formatting

All inside `<span>`:
- Bold: `<span><b>text</b></span>`
- Italics: `<span><i>text</i></span>`
- Underline: `<span><u>text</u></span>`
- Strikethrough: `<strike>text</strike>`
- Font colour: `<span style="color:rgb(200, 38, 19) !important;">text</span>`
- Highlight: `<span style="background-color:rgb(255, 255, 0) !important;">text</span>`

**Note**: Use `!important` on `color` and `background-color` styles — without it, Azure DevOps dark mode overrides the colours.

#### Lists

Bullet lists use `<span>` inside `<li>`. Numbered lists do not.

```html
<div><span>Bullet points</span> </div>
<div>
  <ul>
    <li><span>First item</span> </li>
    <li><span>Second item</span> </li>
  </ul>
</div>
<div><span>Numbered list</span> </div>
<div>
  <ol>
    <li>First item </li>
    <li>Second item </li>
  </ol>
</div>
```

#### Indentation

Uses `<blockquote>` with inline style. Nest for deeper levels.

```html
<div><span>Not indented</span> </div>
<blockquote style="margin:0 0 0 40px;border:none;">
  <div><span>Indented once</span> </div>
</blockquote>
<blockquote style="margin:0 0 0 40px;border:none;">
  <blockquote style="margin:0 0 0 40px;border:none;">
    <div><span>Indented twice</span> </div>
  </blockquote>
</blockquote>
```

#### Code blocks

Each line is a `<div>` inside `<pre><code>`:

```html
<pre><code><div>line1</div><div>line2</div><div>line3</div></code></pre>
```

#### Mentions

- User: `<a href="#" data-vss-mention="version:2.0,{user-id}">@Name</a>`
- Work item: `<a href="https://dev.azure.com/{org}/{project}/_workitems/edit/{id}/" data-vss-mention="version:1.0">#{id}</a>`
- PR: `<a href="/{org}/{project}/_git/{repo}/pullrequest/{id}" data-vss-mention="version:1.0" data-pr-title="{title}">PR {id}: {title}</a>`

#### Images

```html
<div><img src="{attachment-url}" alt="{filename}"><br> </div>
```

#### Links

Use `target=_blank` and `rel="noopener noreferrer"` for external links:

```html
<a href="https://example.com" target=_blank rel="noopener noreferrer">https://example.com</a>
```

#### Full example

```html
<div><span>Summary of the feature or work item.</span> </div>
<div><br> </div>
<div><span>Previous work completed:</span> </div>
<div>
  <ul>
    <li><span>First completed item</span> </li>
    <li><span>Second completed item</span> </li>
  </ul>
</div>
<div><span>Remaining:</span> </div>
<div>
  <ul>
    <li><span>First remaining item</span> </li>
    <li><span>Second remaining item</span> </li>
  </ul>
</div>
```

### Markdown Format (When Enabled)

If the description field has been converted to markdown, use standard markdown syntax with newlines.

**Note**: Once a field is set to markdown mode, you cannot switch back to HTML. The toggle is one-way.

**Markdown syntax reference**: https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance

### Work Item References in Descriptions

**IMPORTANT**: When referencing other work items in description text, ALWAYS use the rich link HTML format — never plain `#123`.

Plain `#123` does NOT render as a clickable link in Azure DevOps descriptions. Use:

```html
<a href="https://dev.azure.com/{org}/{project}/_workitems/edit/{id}/" data-vss-mention="version:1.0">#{id}</a>
```

**Example** (linking work item 503 in CircuitBreaker):
```html
See <a href="https://dev.azure.com/hopeventures/CircuitBreaker/_workitems/edit/503/" data-vss-mention="version:1.0">#503</a> for the workflow.
```

This applies everywhere: descriptions, comments, and any HTML field. See also [Work Item Rich Links](#work-item-rich-links) and [Pull Request Rich Links](#pull-request-rich-links) below.

### Writing Style

See `writing-style` skill for titles, descriptions, and general tone.

Stakeholders read these titles - focus on what changes from their perspective, not what code you're writing.

## Backlog Priority & Organisation

### Backlog Priority Field

Azure DevOps uses `Microsoft.VSTS.Common.BacklogPriority` (a float) to order items on the backlog. This value is set automatically when items are reordered via drag-and-drop in the UI.

```bash
# Query features in backlog priority order (matches UI backlog view)
az boards query --wiql "SELECT [System.Id], [System.Title], [Microsoft.VSTS.Common.BacklogPriority] \
  FROM WorkItems WHERE [System.WorkItemType] = 'Feature' \
  AND [System.IterationPath] UNDER '<Project>\<IterationParent>' \
  AND [System.State] NOT IN ('Done', 'Removed') \
  ORDER BY [Microsoft.VSTS.Common.BacklogPriority]" -o json
```

### Three Independent Dimensions

See `work-organisation` skill for the three independent dimensions (hierarchy, area path, iteration) and the planned vs scheduled model.

### Backlog Organisation Workflow

When helping the user organise or prioritise their backlog:

#### 1. Understand the Current State
Query the backlog in priority order for the relevant team/level. Present a numbered list showing: order, ID, title, state, area, parent.

```bash
# Features for a team (use iteration to scope to team)
az boards query --wiql "SELECT [System.Id], [System.Title], [System.State], \
  [System.AreaPath], [Microsoft.VSTS.Common.BacklogPriority] \
  FROM WorkItems WHERE [System.WorkItemType] = 'Feature' \
  AND [System.IterationPath] UNDER '<Project>\Project\FPR' \
  AND [System.State] NOT IN ('Done', 'Removed') \
  ORDER BY [Microsoft.VSTS.Common.BacklogPriority]" -o json
```

#### 2. Identify Issues
Check for:
- **Orphaned items**: No parent, or parent in wrong hierarchy level
- **Misplaced area paths**: Area doesn't match the app/component the work is in
- **Bare iteration paths**: Features/PBIs/Tasks at the top-level iteration instead of a specific one
- **Stale items**: Old items still marked as New/Active that should be Done, Removed, or moved to a Future iteration
- **Cross-area children**: Tasks under a PBI where the task's area doesn't match its actual app context

#### 3. Review Priority Order
Walk through the backlog with the user:
- Items actively In Progress should generally be near the top
- Items in earlier iterations (current/next sprint) above later ones
- Dependencies: items that block others should be prioritised higher
- Present the current order and ask if anything needs to move

#### 4. Apply Changes
Use batch update scripts for bulk changes (write to `/tmp/` and execute — see `cli-tools` skill):
- Reparenting: `az boards work-item relation add/remove`
- Area/iteration changes: `az boards work-item update --area/--iteration`
- State changes: `az boards work-item update --state`
- Clearing date fields: `az boards work-item update --fields "Microsoft.VSTS.Scheduling.StartDate="`

**Note**: Backlog priority (drag-and-drop ordering) can only be changed via the UI or the undocumented Settings API. Use iteration assignment and state to influence effective priority when CLI-only.

#### 5. Verify
Re-query the backlog after changes and present the updated view. Compare with the UI if the user has it open.

### Clearing Fields

To unset/clear a field value, set it to an empty string:
```bash
# Clear start date
az boards work-item update --id <ID> --fields "Microsoft.VSTS.Scheduling.StartDate="

# Clear target date
az boards work-item update --id <ID> --fields "Microsoft.VSTS.Scheduling.TargetDate="
```

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

When migrating work items between projects:

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

## Consolidating Work Items During Migration

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

### Rich Link Prefixes

Azure DevOps uses different prefixes for different artifact types:

- `#1234` — **Work item** link
- `!1234` — **Pull request** link

When writing these in HTML descriptions, use the appropriate rich link format below.

### Work Item Rich Links

For work items, use a full URL with `data-vss-mention`:

```html
<a href="https://dev.azure.com/{org}/{project}/_workitems/edit/{id}/" data-vss-mention="version:1.0">#{id}</a>
```

### Pull Request Rich Links

For pull requests, use a **relative path** with `data-vss-mention` and `data-pr-title`:

```html
<a href="/{org}/{project}/_git/{repo}/pullrequest/{id}" data-vss-mention="version:1.0" data-pr-title="{PR title}">!{id}</a>
```

**Example** (linking PR 6050 in the Architecture repo):
```html
<a href="/eagersautomotive/Architecture/_git/Architecture/pullrequest/6050" data-vss-mention="version:1.0" data-pr-title="Handle more status.">!6050</a>
```
