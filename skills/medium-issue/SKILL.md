---
name: medium-issue
description: |
  WHAT: How to write GitHub issues for these projects — title, body, labels, comments, and how existing issues are reworded.
  WHY: A vague issue ("Improve tool UI") costs every reader who opens it; the format keeps titles concrete and bodies carrying what the fix needs.
  WHEN: TRIGGER when an issue is written for a project that uses GitHub Issues.
user-invocable: false
skills:
  - audience-developer
  - audience-claude
metadata:
  category: standards
---

# Medium: issue

An issue's readers are the implementer — a developer or a Claude (`audience-developer`, `audience-claude`) — and whoever triages it. Write from the user's perspective — describe what they observe and what they want. Identify who the user is before writing: for tools (Find, ReadFile, Exec, TsHover), Claude is the user; for CLI behaviour, configuration, session management, and anything a person interacts with directly, Stephen is the user. Pick the right perspective and stay in it — and match the voice to it: passive is natural when Claude is the user ("The content is returned as JSON-encoded strings"); active when the user is a person ("There is no way to query sessions from a project context").

## Title

State specifically what is wrong (bug) or what is wanted (enhancement). Be concrete.

Good: "Tool approval prompt uses plain text styling, making it easy to miss"
Good: "GitStateMonitor reports the agent's own changes as human activity"
Avoid: "Improve tool UI", "Bug with git monitor"

## Body

**Describe the symptom, not the root cause.** The symptom is what the user experiences. The implementer needs the symptom and will find the root cause themselves. An issue grounded in experience stays valid longer than one grounded in a technical diagnosis that may shift.

**Don't prescribe the implementation.** Suggesting a solution is fine - users suggest solutions. The line is between suggesting ("it might work to match against full paths") and dictating ("change the parameter type to accept regex strings"). Implementation details go stale as the codebase changes; the underlying need usually does not.

For bugs, include reproduction steps if the problem is not obvious from the description.

## Guidance section

Include a Guidance section when prior investigation work exists: a POC was built, a root cause was traced, design options were explored. Its purpose is to preserve those findings so the implementer does not have to redo them. Guidance is not a solution spec: it records what is already known — constraints, trade-offs, open questions, prior findings — and leaves the solution to the implementer.

Notes and Guidance differ in origin: Notes are written at issue creation to capture known scope or constraints; Guidance is added when prior investigation has already produced findings worth preserving.

## Comments

Progress notes belong in comments, not the body: a PR that partially addressed the issue, related work landed elsewhere, investigation that narrowed the problem. The body is the problem statement and stays stable; comments are where the changing context lives.

## Rewriting existing issues

Reword, do not rewrite history. Write the problem as it existed when the issue was opened, not from the vantage point of today — folding progress into the body makes it harder for a new reader to understand the original problem cleanly: they cannot tell what was always true from what has since changed. If work has partially addressed the issue, add a comment noting what changed and what remains open.

## Labels

Always add `bug` or `enhancement`.

For the package label, use the one user-facing app the issue affects: `pkg: claude-sdk-cli` or `pkg: mcp-exec`. List only one. Label by the surface the user meets, not an internal package a fix might touch. If it isn't clear which user-facing package is affected, leave it out. The implementing Claude sets the pkg: label when they create the PR and know where the fix lands.
