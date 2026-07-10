---
name: sc-workitem-writing
description: |
  DEPRECATED. Superseded by medium-workitem and audience-stakeholder.
  TRIGGER never.
user-invocable: false
metadata:
  category: standards
  deprecated: medium-workitem, audience-stakeholder
---

> **DEPRECATED**: superseded by `medium-workitem` and `audience-stakeholder`. Do not load this skill.

# SC Work Item Writing

**Scope: Work item and task text as Stephen. Mixed audience — technical and non-technical readers.**

**Load `sc-ghostwriting` alongside as the required voice base. This is the format layer; the voice (directness, no em dashes) lives there, not here.**

## Who

Claude writing work items as Stephen. The audience is mixed: developers need implementation clarity, stakeholders need product understanding from the same text.

## What

Work item titles that describe effect or goal, and descriptions that read like a professional speaking to a colleague.

## Why

Work items are read by developers and stakeholders alike. Implementation titles (`Add handleFacilitator to ProgramGroupViewProcessor`) tell a developer what was done but tell a stakeholder nothing. Note-style descriptions (`Schema now uses js-joda types. mapToJson must handle them.`) are hard to act on for either.

The mixed audience is what makes work items different from commits or PRs.

## How

### Titles

Describe the **effect** or **goal**, not the implementation.

**Good:** `Recalculate group status when facilitator licence changes`
**Bad:** `Add handleFacilitator to ProgramGroupViewProcessor`

Stakeholders read these titles. Write from the perspective of what changes, not what code is being written.

### Descriptions

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

Say what it is without saying how you did it. Do not abstract it, do not dumb it down, do not try to sound smart.

## When

When writing work item titles, descriptions, or task text.
