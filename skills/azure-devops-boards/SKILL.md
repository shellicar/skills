---
name: azure-devops-boards
description: Work items and backlog management in Azure DevOps. Use when creating/querying/updating work items, managing areas/iterations, organising backlogs, or formatting descriptions.
---

# Azure DevOps Boards

**Scope: CLI commands and formatting for Azure DevOps work items. No philosophy, no workflows — just mechanics.**

See also `azure-devops-repos` for PR workflows, `work-organisation` for hierarchy philosophy, `backlog-management` for grooming/triage, and `work-item-migration` for cross-project migration.

## When Invoked

If the user invokes this skill, they likely want help with:
- **Creating** work items (tasks, PBIs, features, epics)
- **Querying** work items (finding, searching, listing)
- **Updating** work items (fields, state, relationships)
- **Organizing** backlogs (priority, area paths, iterations)
- **Formatting** descriptions (HTML, markdown, rich links)

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

# Add comment (no native CLI command for comments)
echo '{"org":"{org}","project":"{project}","method":"POST","path":"wit/workItems/{id}/comments","params":{"api-version":"7.1-preview.4"},"headers":{"Content-Type":"application/json"},"body":{"text":"<div>Comment text here.</div>"}}' | ~/.claude/skills/azure-devops/scripts/ado-rest.sh
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

### Work Item Descriptions

All work items (any type) **MUST** have a description when created or updated. The description should contain enough information for someone reading it in the future to understand the purpose and scope without additional context. Do not create work items with empty descriptions.

### Work Item State

Do NOT change work item state (e.g. New → Active → Done) unless the Supreme Commander explicitly requests it.

### Work Item Creation Checklist (MANDATORY)

Before creating ANY work item, you **MUST** complete these steps in order:

1. **Know the hierarchy**: Identify the parent work item (PBI for Tasks, Feature for PBIs, Epic for Features, Initiative for Epics). Query the parent with `expand: "relations"` to confirm it exists and get its area path and iteration.

2. **Know the fields**: Get the parent's area path, iteration path, and project. The new work item MUST match (Tasks inherit from their PBI, PBIs from their Feature's area/iteration pattern).

3. **Create with description**: Every work item MUST have a meaningful description at creation time. NEVER create a work item and add the description later — include it in the `wit_create_work_item` call.

4. **Parent IMMEDIATELY**: After creation, the VERY NEXT action MUST be parenting the work item using `wit_work_items_link` with `type: "parent"`. Do NOT perform any other action (linking to PRs, updating fields, etc.) until the parent link is confirmed. An orphaned work item is a broken work item.

**NEVER create orphaned work items**. If you cannot determine the parent, STOP and ask the Supreme Commander before creating anything.

**The correct creation sequence is always:**
```
1. Query parent work item (get area, iteration, project)
2. Create work item (with description, matching area/iteration)
3. Parent it (wit_work_items_link, type: "parent")
4. Only THEN proceed with other operations (PR links, etc.)
```

## Work Item Hierarchy

Load the `work-organisation` skill.

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

Load the `writing-style` skill.

Stakeholders read these titles - focus on what changes from their perspective, not what code you're writing.

## Backlog

See `backlog-management` skill for grooming, priority review, triage, and organisation workflows.

### Clearing Fields

To unset/clear a field value, set it to an empty string:
```bash
# Clear start date
az boards work-item update --id <ID> --fields "Microsoft.VSTS.Scheduling.StartDate="

# Clear target date
az boards work-item update --id <ID> --fields "Microsoft.VSTS.Scheduling.TargetDate="
```

## Migration

See `work-item-migration` skill for the full migration workflow, including moving items between projects, consolidation, type changes, and structural changes.

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
