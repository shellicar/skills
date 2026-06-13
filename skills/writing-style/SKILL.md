---
name: writing-style
description: |
  WHAT: Pointer. writing-style was split into scoped writing skills; this redirects to them.
  WHY: Fleet prompts still name writing-style. This keeps that name resolving instead of failing as a missing skill.
  WHEN: TRIGGER when a prompt loads writing-style to write a commit or authored text.
user-invocable: false
metadata:
  category: standards
---

# Writing Style

**This skill was dissolved into scoped writing skills. It remains only as a pointer for prompts that still name `writing-style`.**

Load both and follow them directly:

- **`sc-ghostwriting`** — the voice for anything authored under Stephen's name: commits, PRs, documentation, work items. Not prose-only. The base layer, always in effect when his name is on the output.
- **`sc-commit-writing`** — the commit format on top of that voice: single line, imperative, no prefixes, effect not implementation.

A commit goes out under his name, so it needs both: the voice (sc-ghostwriting) and the format (sc-commit-writing). Loading one and skipping the other is the failure this pointer guards against.
