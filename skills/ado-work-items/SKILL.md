---
name: ado-work-items
description: |
  WHAT: Conventions for creating and maintaining Azure DevOps work items: creation sequence, descriptions, state, and type changes.
  WHY: Orphaned work items get lost in the backlog, empty descriptions leave future readers without context, and type changes can corrupt state fields invisibly.
  WHEN: TRIGGER when creating or updating work items in Azure DevOps.
metadata:
  category: standards
---

# ADO Work Item Conventions

How work items are created and maintained across all Azure DevOps projects. For CLI commands and platform reference, see `azure-devops-boards`. For hierarchy philosophy, see `work-organisation`.

## Creation sequence

When creating a work item, follow this sequence. The order matters because orphaned work items (no parent) get lost in the backlog and are difficult to find later.

1. **Query the parent** to get its area path, iteration path, and project. The parent determines where the new item belongs (PBI for Tasks, Feature for PBIs, Epic for Features, Initiative for Epics).
2. **Create the work item** with a description, matching the parent's area and iteration.
3. **Parent it immediately** as the very next operation. An unparented work item is an orphaned work item.
4. Only then proceed with other operations (PR links, field updates, etc.).

If you cannot determine the parent, ask before creating anything.

## Descriptions

Always set a meaningful description when creating or updating work items. The description should contain enough context for someone reading it in the future to understand the purpose and scope without asking.

**Vertical rhythm**: The ADO UI renders HTML descriptions with no control over line spacing. Multiple sentences in a single `<div>` render as a dense block. Put each sentence or thought in its own `<div><span>...</span> </div>` and separate them with `<div><br> </div>` blank lines. This gives the reader's eye a place to rest between ideas.

Use bullet lists only when the content is naturally a list (scope items, enumerated steps), not as a default formatting choice.

Load the `writing-style` skill for tone. Stakeholders read work item titles and descriptions. Focus on what changes from their perspective, not what code you're writing.

### Bug descriptions

Bugs use `Microsoft.VSTS.TCM.ReproSteps` as the visible description field (see `azure-devops-boards` for the full field list). Structure Bug descriptions with `<h2>` sections:

```html
<h2>Problem</h2>
<p>What the user observed or what went wrong.</p>

<h2>Root Cause</h2>
<p>Technical explanation of why it happened.</p>

<h2>Fix</h2>
<p>What was done to resolve it.</p>
```

## State changes

Only change work item state (e.g. New → Active → Done) when the mission explicitly requests it.

## Type changes

After changing a work item's type (e.g. PBI → Feature), provide a link to the work item so it can be verified in the UI. State fields differ between types (e.g. PBI has "Committed," Feature does not), and the CLI cannot show these issues. The UI is the only way to verify the fields are correct after a type change.
