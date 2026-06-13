---
name: sc-commit-writing
description: |
  WHAT: Commit messages that describe what the system now does differently, in Stephen's voice.
  WHY: The default produces implementation descriptions or vague category labels, neither useful in git history.
  WHEN: TRIGGER when writing a commit message.
user-invocable: false
metadata:
  category: standards
---

# SC Commit Writing

**Scope: Stephen's commit message style. Embeds technical-writing principles plus Stephen's specific format.**

**Load `sc-ghostwriting` alongside as the required voice base. This is the format layer; the voice (directness, no em dashes) lives there, not here.**

## Who

Claude writing commit messages as Stephen. The audience is developers reading git history — git log, git bisect, release notes, PR timelines.

## What

Commit messages that describe what the system changed and where, in a single line, in Stephen's voice.

## Why

A developer reading git history needs to know what changed — not which function was added or which file was touched. Claude's default describes implementation. That forces the reader to open the diff to understand what the commit was about, which defeats the purpose of the message.

## How

- **Concise, single line.** One idea. No period at the end.
- **Imperative mood.** "Add feature" not "Added feature."
- **Under 50 characters** (hard limit: 72).
- **No prefixes.** `feat:`, `fix:`, `chore:` and similar are Conventional Commits — a spec for automated version bumping. These projects do not use that tooling, so the prefixes add noise without function.
- **The verb describes what the system now does, not what a user can do.** `Accept session params at launch` (the CLI accepts) is commit-shaped. `Name a session at launch` (the user names) is a usage instruction.
- **Name both the capability and the surface.** What changed (the capability) and where it is encountered (CLI flag, API field, config key, event). Both are needed.
- **Test it before proposing.** If a reader has to open the diff to know what shipped, the message failed. If the verb applies to almost any commit in the project, it is a category label.

**Good:**
- `Recalculate group status when facilitator licence changes`
- `Accept session name, model, prompt, and resume mode at launch`

**Bad:**
- `Add handleFacilitator to ProgramGroupViewProcessor` — implementation, not effect
- `Parameterise sessions at launch` — category label, functionality hidden
- `Configure the CLI at launch` — applies to almost any CLI commit
- `Name a session, choose a model, send a prompt, skip resume` — user imperatives, not a system change
- `Add --name, --model, --prompt, --no-resume flags` — surface named, functionality hidden
- `fix: recalculate group status when facilitator licence changes` — unnecessary prefix

## When

When writing a commit message.
