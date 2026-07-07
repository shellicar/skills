---
name: mission-integration
description: >-
  Bring a delivered mission's branch into the fleet's main and reclaim its
  worktree: squash-merge, carry the post-mortem's owed changes into the fleet's
  open-work tracker, and retire the mission from the boards. The Planner's job,
  run from the main checkout after the mission session has ended.
  `scripts/mission-integration.mjs` performs the whole integration —
  squash-merge, signed commit, push, and reclaim — dry-run by default. The
  Planner reviews the dry-run and applies; the GPG keychain prompt on the
  signed commit is the SC's gate.
---

# Mission integration

When a mission is delivered, its work lives on a branch in the handler's fleet worktree, carrying the mission's full working history (often 20-plus commits). Bringing that into `main` is the Planner's job, run from the main checkout after the mission session has ended. A mission session cannot squash-merge or remove the worktree it is sitting in.

## Why squash

main carries one commit per mission, not the mission's working history replayed onto it. The working commits belong to the worktree; main wants the delivered result.

## Order

The stages run in this order, and the order is load-bearing.

0. **Pre-requisite — the mission is genuinely complete.** Everything committed on the worktree branch: the delivered work, the post-mortem, the project memory, the prompt, the testament. The post-mortem is *done*, not owed. If anything is uncommitted, stop — it is not ready to integrate.

1. **Close the mission's tmux session/window.** This ends the session for real: a live cast in the worktree could still commit while you integrate. With it gone the branch is frozen, and the worktree has no shell sitting in its working directory.

2. **Remove the worktree.** A branch is a ref in the repo, not in the worktree, so removing the worktree never touches the branch — the squash-merge still works afterwards. Removing it *without forcing* also doubles as a clean-tree assertion: if it refuses, the mission had uncommitted work and you should not be integrating. The `fleet/` submodule complicates this — see the submodule note — so in practice removal has to be forced past one check; the script does this under `--apply`, guarding it with its own clean-tree assertion first (it refuses rather than force past uncommitted work).

3. **Squash-merge the branch into main**, from the main checkout. The mission's commits collapse into a single commit on main. The commit is GPG-signed, so the SC's keychain prompt is the gate — the SC's chance to approve what lands. The script performs this commit and push.

4. **Delete the mission branch.** A squash-merge does not make the branch an ancestor of main, so git may not recognise it as merged; the script deletes the local branch under `--apply`, but only after proving its content is captured in origin/main, so nothing is lost.

5. **Carry the post-mortem's owed changes into the open-work tracker.** The post-mortem records what the mission owes, but that file is not read again — the open-items list handlers actually read is what needs the entries. Add each item to the **integrating fleet's own root `CLAUDE.md`**: the fleet-specific file at the repo root, the one sitting beside `projects/` and `active-missions.md` (e.g. `claude-fleet-eagers/CLAUDE.md`, `claude-fleet-shellicar/CLAUDE.md`). One line per item, pointing back to the post-mortem; because the post-mortem lives in that same repo, its link resolves locally — and that resolving link is the test that you have the right file. Do **not** write these to `fleet/CLAUDE.md` (the shared submodule file every fleet consumes) or `.claude/CLAUDE.md` (the handler harness): an item in the shared file cannot be owned or verified by the fleet it belongs to, which is the wrong-file mistake this step exists to prevent. And never relocate **another** fleet's misplaced items into yours — that orphans them from the fleet that must implement them. Moving a misplaced item is the owning fleet's job, not the integrator's. This catch is the integration's, and it is yours.

6. **Update `active-missions.md`** — drop the mission from the post-mortem-owing table. Then commit the owed-items edit (step 5) and this board edit together, as one plain commit on `main`, separate from the squash. This commit has to land before the rebase below.

7. **Re-ground the other worktrees, and do it last.** The squash and the owed-items commit have both moved `main`, so every other in-flight worktree is now based on the old one and drifts further the longer it waits. Run [scripts/rebase-worktrees.mjs](scripts/rebase-worktrees.mjs) to distribute `main` onto each safe worktree branch — see below. It is last for a reason: the rebase carries whatever is on `main` into the worktrees, so every `main`-side commit above has to be in before it runs. Rebase before committing the owed items and the worktrees miss them, and you are rebasing twice.

## Running it — dry-run, then apply

The Planner runs `scripts/mission-integration.mjs`: dry-run by default, `--apply` to act. Run the dry-run first and read what it reports — the files it would squash-merge, and its checks that the worktree is clean, the submodule safe, and the branch captured. If anything looks amiss, stop and raise it with the SC; otherwise apply. The script does the destructive work — the forced worktree removal, the `branch -D`, and the signed squash commit — but every step is guarded to refuse rather than lose work, and the GPG keychain prompt on the signed commit is the SC's gate on what lands. The Planner does not hand-run the git: the script encodes it so the integration runs the same way every time.

## Re-grounding the other worktrees

Integrating moves `main`, so every other fleet worktree is left based on the old `main` and drifts further the longer it waits. `~/.claude/skills/mission-integration/scripts/rebase-worktrees.mjs` re-grounds them: run it from the fleet repo's main checkout; it rebases each worktree's branch onto the local `main`, doing only what applies cleanly. Purely local — no fetch, no push.

Dry-run by default, `--apply` to act — the same discipline as the integration: run the dry-run, and if nothing looks amiss, apply. It is safe by construction. Each worktree is classified and handled on its own: the main checkout is skipped; a branch already up to date needs nothing; a branch behind `main` is rebased (a plain fast-forward when it carries no commits of its own); and anything that cannot land cleanly — a dirty working tree, a detached HEAD, or a rebase conflict — is warned and left exactly as it was. A live session in a skipped worktree is unaffected: it re-grounds on the next run once its tree is clean. So the warnings are normal, not failures — they are the worktrees to come back to by hand, not a sign anything broke.

## The fleet submodule

`fleet/` is kept on its own `main` and drifts ahead of whatever gitlink the superproject branch recorded — so a submodule pointer difference (` M fleet`) is the normal steady state, not mission work. `submodule.fleet.ignore = all` in `.gitmodules` suppresses that noise repo-wide; it is checked in deliberately, so every clone and worktree inherits it. The drift carries no mission content; fleet edits made during a mission land on the submodule's own `main`.

The committed gitlink is also why removing the worktree refuses (step 2): the guard reads the branch's tree, finds the submodule entry, and stops — independent of whether the working copy is checked out or deinit'd. Clearing the working copy does not satisfy it; only forcing past that one check does, which is why the script uses `--force` under `--apply`, after asserting the worktree is clean so nothing is lost.
