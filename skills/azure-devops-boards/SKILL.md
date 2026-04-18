---
name: azure-devops-boards
description: |
  WHAT: CLI command reference and platform quirks for Azure DevOps work items, iterations, areas, and description formatting.
  WHY: ADO has silent failures and non-obvious field differences between work item types.
  WHEN: TRIGGER when working with Azure DevOps work items, formatting descriptions, or managing iterations/areas.
metadata:
  category: reference
---

# Azure DevOps Boards Reference

CLI commands and platform behaviour for Azure DevOps work items. For conventions (creation sequence, description standards, state changes), see `ado-work-items`. For hierarchy philosophy, see `work-organisation`.

## Work Item Commands

```bash
# Show work item
az boards work-item show --id <ID>

# Query recent work items
az boards query --wiql "SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.CreatedDate] >= @Today - 7 ORDER BY [System.Id] DESC" -o table

# Query children of a work item
az boards query --wiql "SELECT [System.Id], [System.Title], [System.WorkItemType] FROM WorkItems WHERE [System.Parent] = <PARENT_ID>"

# Create work item (--project is required for create)
az boards work-item create --type "Task" --title "Title" --project "<Project>" --area "<Area>" --iteration "<Iteration>"

# Update work item fields (no --project flag: work item IDs are globally unique per org)
az boards work-item update --id <ID> --fields "System.IterationPath=<Iteration>"

# Update work item title
az boards work-item update --id <ID> --title "New Title"

# Add parent relationship
az boards work-item relation add --id <ID> --relation-type "parent" --target-id <PARENT_ID>

# Remove parent relationship
az boards work-item relation remove --id <ID> --relation-type "parent" --target-id <PARENT_ID> -y

# Clear a field value (set to empty string)
az boards work-item update --id <ID> --fields "Microsoft.VSTS.Scheduling.StartDate="

# Add comment (no native CLI command)
echo '{"org":"{org}","project":"{project}","method":"POST","path":"wit/workItems/{id}/comments","params":{"api-version":"7.1-preview.4"},"headers":{"Content-Type":"application/json"},"body":{"text":"<div>Comment text here.</div>"}}' | ./scripts/ado-rest.sh
```

## CLI Gotchas

- `az boards work-item update` does not accept `--project`. Work item IDs are globally unique within an org.
- `--fields "System.Parent=X"` silently does nothing. Use `az boards work-item relation remove` then `relation add` to change parents.
- `az boards work-item list` does not exist. Use `az boards query` with WIQL.

## Work Item Types

### Initiative / Epic / Feature

Use `System.Description` for the description field. These types use standard fields.

### PBI (Product Backlog Item)

Use `System.Description` for the description field. Standard fields apply.

### Bug

Bugs display different fields than other types in the ADO UI. `System.Description` exists in the API but is not shown.

| Field | UI Label | Notes |
|---|---|---|
| `Microsoft.VSTS.TCM.ReproSteps` | Repro Steps | The visible description field for Bugs |
| `Microsoft.VSTS.TCM.SystemInfo` | System Info | Environment details |
| `Microsoft.VSTS.Common.AcceptanceCriteria` | Acceptance Criteria | |

### Task

Use `System.Description` for the description field. Task descriptions are implementation-oriented (technical context, specific files, approach).

## WIQL Notes

- `[System.Parent]` cannot be used in ORDER BY. Sort by `[System.Id]` or `[System.WorkItemType]` instead.
- Path values in WIQL use no leading backslash: `<Project>\Iteration\Path`, not `\<Project>\Iteration\Path`.

## Batch Updates

Use a separate exec step per work item:

```json
{
  "description": "Batch update iterations",
  "steps": [
    {"commands": [{"program": "az", "args": ["boards", "work-item", "update", "--id", "100", "--iteration", "Project\\Iteration\\Path", "--org", "https://dev.azure.com/myorg", "--output", "none"]}]},
    {"commands": [{"program": "az", "args": ["boards", "work-item", "update", "--id", "101", "--iteration", "Project\\Iteration\\Path", "--org", "https://dev.azure.com/myorg", "--output", "none"]}]},
    {"commands": [{"program": "az", "args": ["boards", "work-item", "update", "--id", "102", "--iteration", "Project\\Iteration\\Path", "--org", "https://dev.azure.com/myorg", "--output", "none"]}]}
  ]
}
```

## Link Types

```bash
# Parent/child
az boards work-item relation add --id <ID> --relation-type "parent" --target-id <PARENT_ID>

# Predecessor (target must finish before this item can start)
az boards work-item relation add --id <ID> --relation-type "Predecessor" --target-id <TARGET_ID>

# Successor
az boards work-item relation add --id <ID> --relation-type "Successor" --target-id <TARGET_ID>

# Related
az boards work-item relation add --id <ID> --relation-type "Related" --target-id <TARGET_ID>
```

Supported link types: `parent`, `child`, `duplicate`, `duplicate of`, `related`, `successor`, `predecessor`, `tested by`, `tests`, `affects`, `affected by`.

## Iterations & Areas

```bash
# List iterations
az boards iteration project list --project "<Project>" --depth 3 -o table

# List area paths
az boards area project list --project "<Project>" --depth 2 -o table

# Create iteration (--path is the parent, --name is the new child)
az boards iteration project create --name "Sprint 1" --path "\<Project>\Iteration\<Parent>" --project "<Project>"

# Create area path
az boards area project create --name "NewArea" --path "\<Project>\Area" --project "<Project>"

# Delete iteration (requires --path, not --id)
az boards iteration project delete --path "\<Project>\Iteration\<Parent>\<Child>" --project "<Project>" --yes

# Delete area path
az boards area project delete --path "\<Project>\Area\<Child>" --project "<Project>" --yes
```

### Iteration/Area Gotchas

- `az boards iteration project delete` requires `--path`, not `--id`. The `--id` parameter does not exist.
- Delete children before parents. A parent with children cannot be deleted.
- CLI `--path` args use a leading backslash (`\<Project>\Iteration\<Parent>`). WIQL omits the leading backslash.
- Iteration create `--path` must include `\Iteration\` in the path. Without it: "path parameter is expected to be absolute path."
- Names cannot contain `/`. Use `-` instead.
- Some state transitions are not direct (e.g. Done → Removed requires an intermediate state: Done → New → Removed).

## Description Formatting

See `formatting.md` for HTML patterns, rich link syntax, markdown detection, and inline formatting reference.
