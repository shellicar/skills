---
name: safe-operations
description: |
  WHAT: Commands and edits whose effects cannot be walked back. Blocked commands with alternatives, destructive operations that require asking, protected files.
  WHY: Writing code is effort with cost; erasing code is no effort with potentially enormous cost. Asymmetric.
  WHEN: When operating on a real host (default expectation, drop in sandboxed sessions).
user-invocable: false
metadata:
  category: foundational
---

# Safe Operations

## Who

You and me. The host is mine: real files, real history, real consequences. You have not actually run these commands before; you pattern-match them from training. I have run them, and I know what each one does to my machine.

## What

The protocol for commands and edits whose effects cannot be walked back. A list of commands that are blocked, with the tools or commands that substitute for them. A list of operations that require asking before running. A list of files that are protected because their edits have privileged effects.

This skill is not about being cautious in general. It is about a specific class of operations that have asymmetric cost: easy to run, expensive or impossible to recover from.

## Why

Writing code is effort with cost. Erasing code is no effort with potentially enormous cost. The asymmetry is the principle. The cost of getting an irreversible action wrong is much higher than the cost of a reversible mistake, and the moment you would want to be in the loop is the moment the destructive command runs.

You have never actually run these commands. You have read about them in training. Your understanding of `git checkout` or `rm -rf` is pattern-matching: these tokens appear together with these effects in your training data, so you reach for them when those effects seem desired. That pattern-matching does not include the actual state of my working tree, the actual contents of my filesystem, or the actual consequences of running the command right now in this directory. You are operating from memory; I have eyes on the system.

Flags are not safety. `mv -nf` looks like "no clobber, force" but `-f` overrides `-n`. Flag combinations create destructive variants of commands that pattern-matching cannot reliably distinguish from safe variants. The practical mechanism is to block the command class entirely and provide safer alternatives, rather than try to surgically allow safe flag combinations and block unsafe ones.

The block list is information, not prohibition. Each entry tells you: this command, blocked, here is what to use instead. The framing makes the alternative the action, the block the context. "Use `DeleteFile`" is what to do; "blocked: rm" is the warning sign so you know not to reach for the trap.

For operations where the alternative is to ask, asking is itself the success criterion. Not a barrier between you and completing the work, not an interruption to be minimised: for these specific operations, asking is the work. Reaching for the destructive command instead of asking is the failure mode; asking is what success looks like.

Three areas of git carry information independently: the history, the index, and the untracked or unstaged changes. The index is workflow state, not just a queue for committing. I stage a file, keep editing, diff staged versus unstaged to see what is going to commit versus what is still in flux. Operations that overwrite the index destroy that review state, which is invisible unless you know to look for it.

## How

**Blocked commands.** Each entry: what is blocked, why, what to use instead.

- `rm`, `rmdir`, `unlink`: destroy data with no undo. Use the `DeleteFile` and `DeleteDirectory` tools.
- `sed -i`: corrupts files in place if the pattern matches wrong. Use the `EditFile` tools.
- `ln -f`, `mv -f`, `git mv -f`: silent overwrite of the target. Use the no-`-f` form, or ask if overwriting is genuinely needed.
- `git push --force`: rewrites remote history blindly with no recovery. The safer `--force-with-lease` exists for the same purpose; if force is genuinely needed, see the destructive git operations below.

**Destructive git operations.** Present the exact command and the reason. I decide and run. Each entry: what is destructive, why.

- `git reset`, `git restore`, `git checkout` for state: can discard working-tree changes silently. Use `git switch` for branch operations only.
- `git rm`: replaces staged changes with a staged deletion.
- `git push --force-with-lease`: still rewrites remote history (safer than `--force` against blind overwrites, not safe in absolute terms).
- `--hard`, `clean -f`, `branch -D`, `--no-verify`: each forces past a safety check that exists for a reason.

**Broad selectors with destructive intent.** Specify exact paths.

- `xargs <destructive command>` over enumerations: what is enumerated includes things you did not put there.
- `find . -delete` and similar: same shotgun.
- `git add .` / `-A` / `-u`: picks up everything in the directory, including state you did not put there. Stage by explicit filename.

**Use the maintaining tool over the direct edit.** Some files are managed by tools that update related state alongside the file itself. Direct edits bypass that state-keeping.

- `package.json` dependencies: use `pnpm add` / `pnpm remove`. Direct dependency edits bypass the lockfile, so the end result can differ from what the tool would produce. Unless you are batch-updating many files, prefer the tool.

## When

Always when on a real host (default expectation). In a sandboxed session where state is disposable, the cost asymmetry is much smaller and this skill is not loaded.
