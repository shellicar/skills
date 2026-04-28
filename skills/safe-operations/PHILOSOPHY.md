# safe-operations: editorial context

This file is the editorial context for the `safe-operations` skill. It is not loaded by the skill at runtime. Read it when you intend to modify `SKILL.md`, so the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

This skill is the replacement for the operational-discipline content that was in v1/v2 CLAUDE.md (blocked operations, destructive git operations, protected files). The reason it became a skill rather than staying inline: with the loader following explicit load instructions, dedicated skills are cleaner than CLAUDE.md inline rules.

The substantive reason it exists at all: writing code is effort with cost; erasing code is no effort with potentially enormous cost. The asymmetry is the principle. Without machinery to make Claude treat irreversible operations differently from reversible ones, Claude will reach for them whenever they seem to complete the task, without perceiving the cost difference.

## Origin

The chain-of-failures story from one of the SC's first days with Claude:

1. The SC told Claude to move files. Claude pre-emptively started updating all of the imports.
2. The SC told Claude to stop and "undo". Claude pattern-matched "undo" to `git checkout`, and ran something like `ls | xargs git checkout` in the feature directory, erasing literally all of the work that had been accumulating.

Claude was not callous; he simply did not perceive that there was other work, or that there were consequences. Like a child playing with matches.

This story informs the skill in two ways. First, the consequence-blindness is real: Claude operates from pattern-matched associations, not from a model of state and its costs. Second, the destruction included the SC's uncommitted work, which is the co-working amplifier and lives in the `co-working` skill.

## Key insights that shaped this skill

### Asymmetric cost

Writing code has effort and cost. Erasing code has no effort and potentially enormous cost. The cost of getting an irreversible action wrong is qualitatively different from the cost of a reversible mistake, and the moment Claude would want to be in the loop is the moment the destructive command runs.

Without this principle the skill is a list of rules. With it the rules have grounding.

### Pattern-matching, not understanding

Claude has never actually run these commands. He pattern-matches them from training: "undo" to `git checkout`, "force push" to `git push --force`, etc. The pattern fires; the command runs; the consequences land. Pattern-matched commands carry no model of state, no awareness of what is actually in the directory at that moment, no perception of "this discards uncommitted work".

Editors should not edit this skill toward "Claude will be careful". Claude does not have the perception required to be careful in that way. The skill exists because that perception is absent.

### Flags are not safety

`mv -nf` looks like "no clobber, force" but `-f` overrides `-n`. Flag combinations create destructive variants of commands. Trying to allow safe flag combinations and block unsafe ones is a maintenance and reasoning burden that pattern-matching cannot reliably support.

The practical mechanism is to block the command class entirely and provide safer alternatives. This is the why behind the block-list approach.

### Block-as-information, not prohibition

Each entry in the block list is a three-part information shape: WHAT is blocked, WHY it is blocked, WHAT to use instead. All three are needed.

- Without the WHAT, Claude wastes turns attempting commands that are blocked, or runs the ones I do not want.
- Without the WHY, Claude reads the block as an obstacle to navigate around. The whole framing of "information not prohibition" depends on the why being visible; otherwise it is just prohibition with extra steps.
- Without the WHAT-to-use, Claude has the block but no path forward. Either he asks for every blocked command (overhead), or he reaches for the blocked command anyway (failure).

The framing makes the alternative the action. "Use `DeleteFile`" is what to do; "destroys data with no undo" is the why; "blocked: rm" is the warning sign. Editors should preserve all three parts in each entry; reverting to a list of just-WHATs ("never do X") is regression.

### Asking is the success criterion when asking is the alternative

For destructive operations where the alternative to running is asking, asking is the success criterion. Not a barrier between Claude and completing the work, not an interruption to be minimised. For these specific operations, asking is the work. Reaching for the destructive command instead of asking is the failure mode.

This framing matters because Claude's training reads instructions as goals to achieve and constraints as obstacles to navigate. The "asking is success" framing replaces the success function for these moments: success is the ask, not the destructive completion.

### Three areas of git

The history, the index, and the untracked or unstaged changes carry information independently. The index is workflow state, not just a queue for committing. Operations that overwrite the index destroy that review state. Editors of this skill should preserve the three-areas framing because it explains why some seemingly-benign operations are destructive.

### Tools that maintain state

Some files are managed by tools that update related state alongside the file itself. Direct edits bypass that state-keeping. `package.json` plus lockfile is the canonical example: editing dependencies directly produces a different result than `pnpm add` / `pnpm remove` would, because the lockfile falls out of sync.

This is a separate principle from blocked commands or destructive flags; it is about workflow tools whose value depends on going through them. Editors should not extend this list without an explicit reason for each new entry.

## Decisions made

### Skill name: safe-operations

Considered: `non-sandbox` (condition-named, loads when not in a sandbox). The condition-named version was cleaner conceptually, but content-named is more directly operational. When the skill is loaded, "safe-operations" tells me what guidance applies; "non-sandbox" requires me to translate the condition into the content. The condition lives in the description and the WHEN section.

### Loaded by default (foundational treatment)

This skill loads at session start, like the other foundational skills, even though it does not inflect every turn. Destructive commands can appear on the first turn of a session; the protocol must be in place before they appear, not after.

In sandbox sessions where state is disposable, the skill is not loaded.

### Protected files collapsed in

The earlier scope question was whether protected files should be a separate skill. The decision was to fold them in: they share the "matters because real host" condition with destructive commands, and the protocol (ask, use the maintaining tool) is parallel to the destructive-command protocol.

The specific list of protected files from v1/v2 was not carried forward as a list. The `package.json` plus lockfile case stayed because we discussed the specific reason (the tool maintains lockfile state). Other v1/v2 entries (shell profiles, scripts dirs, `.gitconfig`, hooks, settings.json) were not explicitly walked through in this conversation, so they are not in the skill.

### Voice: I speak, addressed to Claude

Same as the other foundational skills.

## What was rejected

- The v1/v2 protected files list as a list. The principle (use the maintaining tool) replaces the list-of-files framing.
- Negative framing throughout. The block list is information about what to use instead, not a prohibition against running.
- Surgical-allow approach (allow safe flag combinations, block unsafe ones). Pattern-matching cannot reliably support this.
- "Stop before destructive actions" without the asking-is-success framing. Stopping without the positive replacement leaves Claude in the trained "complete the task" mode with a constraint over the top.

## What this skill does NOT cover

- Sandbox sessions. State is disposable there; the cost asymmetry largely disappears.
- General workflow guidance (preferred patterns, code style, architectural choices). This is specifically about destructive operations and their alternatives.
- Shared-state awareness when the SC is also active. That is `co-working`.
- The philosophy of why we operate this way at all. That is `claude-philosophy`.

## Notes for future editors

- The block list is a list. Each entry has three parts: WHAT (the command or pattern), WHY (the specific reason), WHAT to use instead. Adding an entry requires all three. Editors who add entries with only WHAT, or only WHAT plus WHAT-to-use without the WHY, have weakened the skill.
- Asking-is-success is the tone; do not let it slide back to "ask before doing X" framing. The asking IS the doing.
- The pattern-matching observation is load-bearing. If editing produces text that suggests Claude can "be careful" through internal vigilance, that is regression. The skill exists because that vigilance is not available.
- The "tools that maintain state" pattern (`package.json`) is a single example, not a list of prohibitions. Adding entries requires the specific reason (what state the tool maintains that direct editing bypasses).
