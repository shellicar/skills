---
name: deferred-tools
description: |
  DEPRECATED. Do not load.
  TRIGGER never.
metadata:
  deprecated: true
---

> **DEPRECATED**: Do not load this skill.

# Deferred Tools

Tools listed in `<available-deferred-tools>` are **not loaded** until fetched via `ToolSearch`.
Without loading, the tool schema is unknown — parameter shapes will be guessed incorrectly.

## Rule

**Always call `ToolSearch` before using a deferred tool for the first time.**

```
ToolSearch → see schema → call tool correctly
```

Skipping `ToolSearch` means calling the tool blind. You will guess parameter types and get them wrong.

## Known Failure Mode

Without the schema, array parameters get serialised as JSON strings:

```
# WRONG — Zod rejects this
queries: '["query one", "query two"]'
commands: '["cmd1", "cmd2"]'

# CORRECT — native arrays
queries: ["query one", "query two"]
commands: [{ label: "label", command: "cmd" }]
```

This produces a Zod parse error returned from the tool. The fix is always the same: load the
schema first via `ToolSearch`, then call the tool with the correct types.

## Reference: What Is NOT Deferred

Everything is deferred except these core tools, which are always loaded:

`Bash`, `Read`, `Edit`, `Write`, `Glob`, `Grep`, `Agent`, `Skill`, `ToolSearch`
