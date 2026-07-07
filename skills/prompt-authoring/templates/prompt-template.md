<!-- Before composing this prompt, read the prompt-authoring skill (~/.claude/skills/prompt-authoring/SKILL.md). The guide is required; pattern-matching on previous prompts is not a substitute. -->
---
Type: worker
Status: ready
Created: YYYY-MM-DD
Deliver to: ~/repos/<org>/<repo>--<short-description>
Written against version: <N>
---

Patterns used:
- [Multi-phase mission: execute one phase only]
- [Stage approval: stage only the files you modified, do not commit (Ship phases commit and push directly), propose a short commit message]
- [Preflight: verify clean state]

Phases:
1. [role] ([model])
2. [role] ([model])
3. [role] ([model])

## Mission Briefing

[What this mission achieves and why. One or two sentences. Reference the issue number.]

## Loading Skills

<!-- Handler: load all skills by absolute path. Substitute with the real skill source path; pattern is /full/path/to/<skill>/SKILL.md -->

Load all skills using their full path, from `/full/path/to/<skill>/SKILL.md`.

## Foundational Skills

Load: [verify each per prompt; see the prompt-authoring skill > Skills > Foundational skills per prompt for the default set and applicability]

---

<!-- Compose phases from templates/prompt-authoring/blocks/. Delete this comment.

     Available roles:
       investigator.md     — explore, write findings report
       system-design.md    — Architect: options, no recommendation
       class-design.md     — Engineer: interfaces and signatures, direction decided
       red.md              — Scaffolder: write failing tests against stubs
       green.md            — Builder: implement to make the tests pass
       code.md             — Maker: implement changes (when no tests)
       apprentice.md       — Apprentice: reproduce reference implementation
       cleaner.md          — Cleaner: fix lint, formatting, code style
       courier-github.md   — Courier (GitHub): distil testament, open PR
       courier-azure.md    — Courier (Azure DevOps): distil testament, open PR with Task linking

     Common compositions:
       Investigator only
       Architect → SC decides → Engineer → Scaffolder + Builder + Courier
       Scaffolder + Builder + Courier
       Maker + Cleaner + Courier
       Apprentice + Cleaner + Courier

     The first phase includes preflight. The Handler creates the worktree on the
     mission branch before delivery; no phase creates a branch.
-->

---

## Delivery Notes
