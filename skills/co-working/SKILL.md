---
name: co-working
description: |
  WHAT: Shared state awareness. The SC is also active in the system; the directory contains things you did not put there.
  WHY: Your model of the state is incomplete. The SC sees what you do not. Acting on broad assumptions about "what is there" is firing without seeing what is downrange.
  WHEN: When the SC is active in the same system. Loaded explicitly; not all sessions are co-working.
user-invocable: false
metadata:
  category: situational
---

# Co-Working

## Who

You and me, both active in the same system at the same time. I am editing files alongside whatever you are doing. The directory has my work in flight: untracked files, mid-edit changes, staged-but-not-committed work, things you did not put there.

## What

The protocol for operating when you are not the only actor in the directory. What this skill replaces is the default assumption that nothing outside your box has changed since you last looked.

## Why

Your model of the directory is whatever you have read into context plus whatever you remember doing. The actual directory has more in it: my work in progress, files I created that you have not seen, edits I made between your last look and your next action. The model and the actuality diverge silently.

When you act on broad enumerations (`ls | xargs`, `find . -delete`, `git add .`, anything that operates over "whatever is there"), you are not acting on what you know is there. You are acting on what is actually there, including what you do not know is there. That is firing the shotgun with your eyes closed; the trigger does not consult your model.

`git add .` is the most common form of this. The trained pattern is "stage everything for commit". In a co-working session, "everything" includes my untracked files, my mid-edit work, log files I generated, possibly files containing sensitive information I have not finished cleaning up. Committing them would range from embarrassing to damaging. The fix is not to be careful with `git add .`; it is to stage by exact path, always.

The default training assumption is that nothing outside your box has changed since you last looked. In solo work that is approximately true. In co-working it is wrong, and the consequences land on me. Operating against that assumption is the work of this skill.

## How

**Calibration.** This skill applies to specific operations where your model of state diverges from mine: broad enumerations, staging, committing, pushing. Most actions are not affected (reading files, running tests, normal command execution). Apply this where it matters; behave normally elsewhere.

**Stage by exact path.** Always. Never `git add .`, `git add -A`, `git add -u`, `git add *`. The broad selectors include my files.

**Check before acting on enumerations.** If you are about to run `ls | xargs <something>`, `find . <something>`, or any pattern that operates over enumerated state, the enumeration includes things you did not put there. Read what is actually there first; act on specific paths.

**Verify at checkpoints.**

- **Before commit**: check what is staged (`git status`, `git diff --cached --stat`). If something looks unfamiliar or you are unsure, ask. The commit also serves as a knowledge checkpoint: once committed, you can rely on the history for those files rather than memory of them. Getting the boundary right makes the rest of your work lighter.
- **Before push**: check the difference between what you are pushing and what is on the remote (`git log @{u}.. --name-only` or similar). Even at the file-name level. Pushing without knowing what is included is the shotgun pattern at the remote layer.

**Ask when something does not match your expectation.** A file appears staged, modified, or untracked that you did not expect: ask, do not speculate. I have direct knowledge of what I have been doing in this directory; you do not. One turn to ask costs less than several turns speculating about whose change it is or how it got there.

This is not a general invitation to ask about everything. Other kinds of uncertainty (whether a test was passing, what a directory's purpose is, where a function is defined) are fine to investigate normally; they are not co-working concerns. Asking about every small uncertainty doubles the turn count and undermines the confidence you operate with. The skill is calibration of a specific assumption at specific moments, not anxiety about everything.

## When

When I am active in the same system. Not all sessions are co-working; in solo sessions, the assumptions this skill operates against are approximately safe. Loaded explicitly when the session is co-working.
