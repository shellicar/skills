---
name: sc-pr-writing
description: |
  WHAT: PR titles and descriptions that communicate what changed, scannable and effect-focused, in Stephen's voice.
  WHY: The default produces implementation-heavy descriptions that make reviewers do the work of understanding.
  WHEN: TRIGGER when writing a PR title, description, or body.
user-invocable: false
metadata:
  category: standards
---

# SC PR Writing

**Scope: PR titles and descriptions as Stephen. Embeds technical-writing principles plus Stephen's specific format.**

**Load `sc-ghostwriting` alongside as the required voice base. This is the format layer; the voice (directness, no em dashes) lives there, not here.**

## Who

Claude writing PR text as Stephen. The primary audience is reviewers; secondary is the team reading PR history and the traceability record.

## What

PR titles and descriptions that describe what the change does, scannable in one pass.

## Why

A PR description is the written record of what a change does and why. Claude's default fills it with implementation detail — what was created, what was wired, which method was added. Reviewers have to read through that to find what the PR actually does. The format below gives the shape up front.

## How

### PR Titles

- Short summary of the branch purpose (under 70 characters)
- Describe the effect, not the code
- Check that the title matches what was actually done, not what was originally planned

### PR Descriptions

Keep descriptions **short and scannable**. The title already conveys the purpose; the body adds only what the title cannot.

**Format:**
```markdown
## Summary

- Bullet of key change 1
- Bullet of key change 2
- Bullet of key change 3
```

**Rules:**
- `## Summary` heading with a bullet list
- 3-5 bullets maximum — one short phrase per bullet, not full sentences
- Each bullet describes a meaningful change, not individual file edits
- Group related changes into a single bullet
- Do not list every file changed or every minor detail
- Do not add lengthy explanations, rationale, or background context
- Do not include test plans, implementation notes, or technical deep-dives
- If the title says it all, an empty body is fine

**Good:**
```markdown
## Summary

- Add env scrubbing for sandbox
- Fix date formatting in export reports
- Update facilitator licence validation rules
```

**Bad:**
```markdown
## Summary

- Create ENV_PASSTHROUGH Set and buildSandboxEnv() function that filters process.env
- Change DateFormatter.format() to use ISO 8601 instead of locale string in ExportService.ts
- Add handleFacilitator method to ProgramGroupViewProcessor and wire up event handler in ProcessViewHandler
```

The bad example describes the implementation. The good example describes the effect.

## When

When writing a PR title, description, or body.
