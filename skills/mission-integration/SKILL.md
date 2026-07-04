---
name: mission-integration
description: >-
  Bring a delivered mission's branch into the fleet's main and reclaim its
  worktree: squash-merge, carry the post-mortem's owed changes into the fleet's
  open-work tracker, and retire the mission from the boards. The Planner's job,
  run from the main checkout after the mission session has ended. The
  destructive steps are the SC's to run; `scripts/mission-integration.mjs`
  (dry-run by default) does the safe mechanics.
---

# Mission integration

When a mission is delivered, its work lives on a branch in the handler's fleet worktree, carrying the mission's full working history (often 20-plus commits). Bringing that into `main` is the Planner's job, run from the main checkout after the mission session has ended. A mission session cannot squash-merge or remove the worktree it is sitting in.

## Why squash

main carries one commit per mission, not the mission's working history replayed onto it. The working commits belong to the worktree; main wants the delivered result.

## Order

The stages run in this order, and the order is load-bearing.

0. **Pre-requisite — the mission is genuinely complete.** Everything committed on the worktree branch: the delivered work, the post-mortem, the project memory, the prompt, the testament. The post-mortem is *done*, not owed. If anything is uncommitted, stop — it is not ready to integrate.

1. **Close the mission's tmux session/window.** This ends the session for real: a live cast in the worktree could still commit while you integrate. With it gone the branch is frozen, and the worktree has no shell sitting in its working directory.

2. **Remove the worktree.** A branch is a ref in the repo, not in the worktree, so removing the worktree never touches the branch — the squash-merge still works afterwards. Removing it *without forcing* also doubles as a clean-tree assertion: if it refuses, the mission had uncommitted work and you should not be integrating. The `fleet/` submodule complicates this — see the submodule note — so in practice removal has to be forced past one check, which makes it an unsafe operation the SC runs.

3. **Squash-merge the branch into main**, from the main checkout. The mission's commits collapse into a single commit on main. The commit is GPG-signed, so the SC's keychain is the gate — the SC's chance to see the final diff and approve what lands. The SC commits.

4. **Delete the mission branch.** A squash-merge does not make the branch an ancestor of main, so git may not recognise it as merged; the local branch and the remote tracking branch are both the SC's to delete.

5. **Carry the post-mortem's owed changes into the open-work tracker.** The post-mortem records what the mission owes, but that file is not read again — the open-items list handlers actually read is what needs the entries. Add each item to the **integrating fleet's own root `CLAUDE.md`**: the fleet-specific file at the repo root, the one sitting beside `projects/` and `active-missions.md` (e.g. `claude-fleet-eagers/CLAUDE.md`, `claude-fleet-shellicar/CLAUDE.md`). One line per item, pointing back to the post-mortem; because the post-mortem lives in that same repo, its link resolves locally — and that resolving link is the test that you have the right file. Do **not** write these to `fleet/CLAUDE.md` (the shared submodule file every fleet consumes) or `.claude/CLAUDE.md` (the handler harness): an item in the shared file cannot be owned or verified by the fleet it belongs to, which is the wrong-file mistake this step exists to prevent. And never relocate **another** fleet's misplaced items into yours — that orphans them from the fleet that must implement them. Moving a misplaced item is the owning fleet's job, not the integrator's. This catch is the integration's, and it is yours.

6. **Update `active-missions.md`** — drop the mission from the post-mortem-owing table.

## Unsafe operations are the SC's

The forced worktree removal, the branch deletion (local and remote), and the signed squash commit are all the SC's to run. This document names the steps; it does not encode the commands. Destructive git operations are always, and will always be, the SC's to execute.

## The fleet submodule

`fleet/` is kept on its own `main` and drifts ahead of whatever gitlink the superproject branch recorded — so a submodule pointer difference (` M fleet`) is the normal steady state, not mission work. `submodule.fleet.ignore = all` in `.gitmodules` suppresses that noise repo-wide; it is checked in deliberately, so every clone and worktree inherits it. The drift carries no mission content; fleet edits made during a mission land on the submodule's own `main`.

The committed gitlink is also why removing the worktree refuses (step 2): the guard reads the branch's tree, finds the submodule entry, and stops — independent of whether the working copy is checked out or deinit'd. Clearing the working copy does not satisfy it; only forcing past that one check does, which is why step 2 is the SC's.
