---
name: medium-workitem
description: |
  WHAT: Work item titles and descriptions — the format for text that several audiences read at once.
  WHY: The default produces implementation titles and note-style descriptions that serve none of the work item's readers.
  WHEN: TRIGGER when writing work item titles, descriptions, or task text.
user-invocable: false
skills:
  - audience-developer
  - audience-stakeholder
  - audience-stephen
  - audience-claude
metadata:
  category: standards
---

# Medium: work item

A work item is read by more audiences at once than any other artefact: developers need implementation clarity, product owners and stakeholders need product understanding, Stephen plans from it, and a Claude may implement from it. The same text serves all of them — that composition is what makes work items different from commits or PRs. The voice composes at load.

## Titles

Describe the **effect** or **goal**, not the implementation.

**Good:** `Recalculate group status when facilitator licence changes`
**Bad:** `Add handleFacilitator to ProgramGroupViewProcessor`

## Descriptions

Write like a professional speaking to a colleague — not notes or bullet points.

**Good:**
```
Handle js-joda types from the create buy a car schema.
Refactor to use record based mapping and fix the date formatting.
```

**Bad:**
```
Schema now uses js-joda types.
mapToJson must handle them.
Refactored to give static errors when unmapped types are added.
```

The bad example reads like disconnected notes. The good example states what was done in clear sentences.
