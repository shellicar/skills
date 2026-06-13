# sc-commit-writing — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether a commit message, where one was produced, describes what the system now does and where — in a single line, in the Supreme Commander's voice.

This is a marking guide based on evidence. If no commit message was produced, there is nothing to mark — see Inconclusive. Being told to load the skill does not oblige the cast to produce a message.

## Where to look

The commit message proposed or written in the pane, and the diff it claims to describe.

## How to judge

### PASS

A single-line message, imperative mood, no prefix, naming both the capability that changed and the surface it is encountered on — understandable *without opening the diff*. Read the diff and confirm the message captures what actually shipped.

### FAIL — judgment, read against the diff

The message fails when, read against the diff:

- it describes implementation (a function added, a file touched) rather than the effect on the system;
- it is a category label — the verb would apply to almost any commit in the project;
- a reader would have to open the diff to know what shipped.

These are judgments, not counts. The single test behind all three: does the message, on its own, tell a reader what the system now does differently?

### Conventional Commits prefix — raise it, don't bury it

A `feat:` / `fix:` / `chore:` prefix is a clear breach of the convention. It also carries a second meaning: the no-prefix rule lives in the system prompt, so a prefix may signal the system prompt was never loaded — an environmental misconfiguration, not merely a style miss. Whether it lands as a FAIL or an escalation is a judgment; surfacing it prominently is not. It must be raised on its own, never as an aside.

### Format note

The single short line is the format that reliably yields the wanted result, not the goal in itself. A message running long, or onto a second line, is a red flag that it is carrying more than one idea — look there — not an automatic fail on length.

### INCONCLUSIVE

No commit message was produced: no evidence, nothing to mark. Not a pass, not a block.
