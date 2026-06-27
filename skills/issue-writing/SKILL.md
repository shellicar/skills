# Issue Writing Guide

**Skill** — how to write GitHub issues for these projects (title, body, labels).

For projects that use GitHub Issues.

## Title

State specifically what is wrong (bug) or what is wanted (enhancement). Be concrete.

Good: "Tool approval prompt uses plain text styling, making it easy to miss"
Good: "GitStateMonitor reports the agent's own changes as human activity"
Avoid: "Improve tool UI", "Bug with git monitor"

## Body

Think about what you want to communicate, then say exactly that. Structure should follow the content, not the other way around. Some issues are two sentences. Some need more. Match the length to the complexity of the problem.

**Write from the user's perspective.** Describe what they observe and what they want. First, identify who the user is. For tools (Find, ReadFile, Exec, TsHover, etc.), Claude is the user. For CLI behaviour, configuration, session management, and anything the person interacts with directly, Stephen is the user. Pick the right perspective and stay in it.

**Match the voice to the user.** When Claude is the user, passive voice is natural: "The content is returned as JSON-encoded strings" or "There is no indication whether a path is a symlink." When the user is a person, use active voice: "There is no way to query sessions from a project context" or "The marker tracks the current session but not previous ones." Active voice is more direct and matches the SC's writing style. Claude's default tends toward passive, so writing in the SC's voice needs conscious effort.

**Describe the symptom, not the root cause.** The symptom is what the user experiences. The root cause is why it happens. The implementer needs the symptom and will find the root cause themselves. An issue grounded in experience stays valid longer than one grounded in a technical diagnosis that may shift.

**Don't prescribe the implementation.** Suggesting a solution is fine - users suggest solutions. The line is between suggesting ("it might work to match against full paths") and dictating ("change the parameter type to accept regex strings"). Implementation details go stale as the codebase changes; the underlying need usually does not.

For bugs, include reproduction steps if the problem is not obvious from the description. For enhancements with prior investigation work, see the Guidance section below.

See also: the `sc-workitem-writing` skill (`~/.claude/skills/sc-workitem-writing/SKILL.md`). The same principle applies here: describe the effect, not the implementation.

## Guidance section

Include a Guidance section when prior investigation work exists: a POC was built, a root cause was traced, design options were explored. Its purpose is to preserve those findings so the implementer does not have to redo them.

Guidance is not a solution spec. It records what is already known — constraints, trade-offs, open questions, prior findings — and leaves the solution to the implementer.

Notes and Guidance serve similar purposes but differ in origin. Notes are written at issue creation to capture known scope or constraints. Guidance is added when prior investigation has already produced findings worth preserving.

## Comments

Progress notes belong in comments, not the body:
- A PR that partially addressed this issue
- Related work landed elsewhere
- Investigation that narrowed the problem

The body is the problem statement and stays stable. The separation matters because the issue itself does not change, but the context around it does. Comments are where that changing context lives: what has been tried, what partially landed, what remains open.

## Rewriting existing issues

When updating an existing issue body (to fix format, reframe the problem, remove implementation language), the goal is to reword, not rewrite history. Write the problem as it existed when the issue was opened, not from the vantage point of today. Folding progress into the body makes it harder for a new reader to understand the original problem cleanly: they cannot tell what was always true from what has since changed. If work has partially addressed the issue, add a comment noting what changed and what remains open.

## Labels

Always add `bug` or `enhancement`.

For package labels (`pkg: claude-sdk`, `pkg: claude-sdk-cli`, etc.): only add if it is obvious from the issue description which package is affected, without needing a code investigation. If unsure, leave it out. The implementing Claude sets the pkg: label when they create the PR and know where the fix lands.
