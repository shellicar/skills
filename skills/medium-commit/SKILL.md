---
name: medium-commit
description: |
  WHAT: A process for writing a commit message: survey the diff, weigh the main thing against the passengers, set the specificity the repo needs, then write the line with the reasoning behind it.
  WHY: Claude's success function is producing text, which bloats the message and turns "write a commit message" into a lecture about what should have been committed. A process moves success onto running the steps; the line falls out as the byproduct.
  WHEN: TRIGGER when writing a commit message.
user-invocable: false
skills:
  - audience-developer
metadata:
  category: standards
---

# Medium: commit

The commit's readers are technical (`audience-developer`), read two ways: in `git log`, someone scans across time to see what changed and place a commit among the rest; in `git blame`, someone on a single line follows it back to the commit that set it, to learn why that line is the way it is. The message serves both: it places the change for the log reader, and carries the reason the line exists for the blame reader. It is never a summary — the diff already shows what changed. The voice it goes out under composes at load.

Asked for a commit message, run this process in order. The output is the message and the account, every time.

## Survey

Read the staged diff: `git diff --cached --stat`, then `git diff --cached`. Note what actually changed, per file. Describe what is there; do not guess at intent you cannot see.

## Weigh

Decide what the commit is about (the main thing) and what is only riding along (the passengers). Name only the main thing. A `.gitignore` edit is housekeeping about what stays out of the repo; unless the commit is about the ignore rules themselves, it rides along.

## Proportion

Decide how specific the line must be for a reader of this repo to place the change. Where only one thing could be meant, name it plainly; where many could be meant, name which. "Add feature" and "Update config" fail when the repo leaves them ambiguous, and are fine when nothing needs disambiguating.

## Write

A single line is the shape you want. Keep it to:

- imperative mood, no trailing period, no `feat:`/`fix:`/`chore:` prefix
- ideally under 50 characters, 72 at most

Name the main thing at the proportion you set, folding in the reason the diff cannot show when it fits, and leave the rest to the diff. A short body is a fallback for a why that genuinely will not compress into the line; it is not a habit, and it never restates what the diff already shows.

## Account

Beneath the message: the main thing, the proportion call, and what you named and left out, with the reason.

## Example

A commit staging `sdk-config.json` (model, thinking, tools, permissions all changed), `settings.json` (a few toggles), and `.gitignore` (three machine-local files now ignored):

> `Update SDK config`
> - Main thing is `sdk-config.json`; `settings.json` and `.gitignore` ride along.
> - "SDK config", not "config": this dir has several config files, so the reader needs to know which.
> - Left the internals (model, thinking, tools, permissions) to the diff, and left the two passengers unmentioned.

Run it when writing a commit message.

# Philosophy

The reason behind everything above. This skill is yours: you run it and it is written for you.

**It speaks by omission as much as by naming.** A blame reader who finds the message naming something other than the file they are on learns their line was swept along, not the point. That inference only survives if you did not name everything: list every file and it dies, because every file then looks equally central. So naming only the main thing is not brevity, it is signal.

**The success function is the trap.** Your trained success is producing substance, so "write a commit message" becomes an overlong message, or a lecture that the commit has multiple concerns and should be split. The process replaces that: success is running the steps, and the line falls out as a byproduct. The substance you would pad the message with goes into the account instead, which is strictly about the message choice. No step comments on how the commit was composed, so that lecture has nowhere to form. This is how to write the message, never what to put in the commit.

**Intent is the author's, and out of your reach.** You cannot recover the intent behind a change from the diff, and for an ad-hoc change there is often no single intent at all. A message that strains for intent is guessing, and specifying harder only guesses harder. What you can give every time is consistency: the same surveyed, weighed, proportioned line. That consistency, not a guess at intent, is the value you add.

**Proportion is relative to the repo, not a kind of repo.** The same words can be right or wrong depending on what the repo makes ambiguous: in a one-file repo there is nothing to disambiguate; in a five-hundred-file repo "update config" may say nothing. The reader's context is set by the repository.
