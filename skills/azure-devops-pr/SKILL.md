---
name: azure-devops-pr
description: |
  WHAT: Reference for Azure DevOps PR format and the script that creates PRs, links work items, and sets auto-complete in one call.
  WHY: Wrong linking mechanism causes work items to appear in the wrong PR section.
  WHEN: Consult when creating an Azure DevOps PR.
metadata:
  category: reference
---

# Azure DevOps PR

Reference for creating Azure DevOps pull requests. One script handles the full sequence.

## Creating a PR

Pipe JSON into the script. It creates the PR, links the task, and sets auto-complete with the merge message.

```bash
echo '{
  "org": "hopeventures",
  "project": "CircuitBreaker",
  "repo": "CircuitBreaker",
  "branch": "feature/facilitation/attendance-tracking",
  "title": "Add attendance tracking to facilitation sessions",
  "description": "## Summary\n\n- Add attendance tracking\n\n## Related Work Items\n\n#1234",
  "task_id": "5678"
}' | ~/.claude/skills/azure-devops-pr/scripts/create-ado-pr.sh
```

| Field | Required | Notes |
|-------|----------|-------|
| `org` | yes | ADO org name |
| `project` | yes | Project name |
| `repo` | yes | Repository name |
| `branch` | yes | Source branch (without `refs/heads/`) |
| `title` | yes | PR title |
| `description` | yes | PR description (markdown) |
| `task_id` | no | Task work item ID to link |
| `target` | no | Target branch, defaults to `main` |

Output: JSON with `pr_id`, `pr_url`, `task_link` status, and `auto_complete` status.

PR creation failure is a hard error (non-zero exit). Task linking and auto-complete failures are reported in the output but do not fail the script (the PR already exists).

## PR Description Format

Load the `writing-style` skill for tone.

```markdown
## Summary

Brief description of the changes.

## Related Work Items

#1234

#5678

## Changes

- Change 1
- Change 2
```

Work item links (`#1234`) must be on separate lines with blank lines between.

## Work Item Linking Rule

Two types, two mechanisms:

| Work item type | Where it goes | How |
|---|---|---|
| **PBI or Bug** (parent) | PR description, `## Related Work Items` | `#1234` syntax in description text |
| **Task** (child) | Linked via script's `task_id` field | Script calls `az repos pr work-item add` |

Only the PBI/Bug goes in the description. Never put Task IDs in the description.

## Convention-Specific Rules

Load the detected convention skill for branch naming and PR template sections.
