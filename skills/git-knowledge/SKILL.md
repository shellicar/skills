---
name: git-knowledge
description: |
  WHAT: Reference for how git actually works: the three states, when stashing is and isn't needed, and what uncommitted files can and cannot affect.
  WHY: Common misconceptions lead to unnecessary stashes, pre-emptive staging, and occasionally destructive operations that weren't needed.
  WHEN: TRIGGER before switching branches, rebasing, stashing, working with submodules, or any operation that modifies working tree state.
user-invocable: false
metadata:
  category: reference
---

# Git Knowledge

**Scope:** How Git actually works — the relationship between working tree, index, and commits. This skill corrects common misconceptions that lead to unnecessary operations. It does NOT contain workflows — see `git-workflow`, `git-cleanup` for those.

## The Three States

Git has three places where file content lives:

1. **Working tree** — files on disk. What you see in the editor.
2. **Index (staging area)** — snapshot of what will go into the next commit. Modified by `git add` and `git restore --staged`.
3. **Commits** — permanent snapshots in the repository history. Created by `git commit`.

Understanding which state you're affecting prevents unnecessary operations.

## Naming Branches and Refs

A branch name alone is ambiguous. `epic/refactor-next` can refer to:

- A **local branch** named `epic/refactor-next` (only meaningful if it exists locally).
- A **remote-tracking ref** named `origin/epic/refactor-next` (the local snapshot of where the remote thinks the branch is, updated by `git fetch`).
- The **remote-side branch** itself, on the actual server.

These can point at the same commit, but they often don't. Treating them as interchangeable produces wrong diffs, wrong merge bases, and wrong reasoning that looks coherent.

### The naming rule

**Always refer to a branch by its full ref name and include the short SHA the ref currently resolves to.**

- **Remote-tracking ref:** `origin/<branch-name> [<short-sha>]` — e.g. `origin/epic/refactor-next [bff895d]`.
- **Local ref:** `<branch-name> [<short-sha>]` — e.g. `epic/refactor-next [459bf56]`.

The `origin/` prefix is part of the name, not optional. The bracketed SHA pins the moment-in-time the ref resolves to — without it, "the branch" means different things at different times.

When writing or describing a diff command, fetch operation, branch comparison, or merge-base calculation, **use the full form for every ref**. If you find yourself writing just `epic/refactor-next` without the `origin/` prefix when you meant the remote-tracking ref, or without a SHA when you meant a specific commit, stop and resolve it explicitly. The ambiguity is the bug.

### When the distinction matters

- **Diffs.** `git diff A...B` computes the merge-base of A and B then diffs from there to B. Whether A is `origin/main` or `main` changes which merge base is computed. Today they may resolve to the same commit; tomorrow they may not.
- **Merge-base.** `git merge-base origin/main HEAD` and `git merge-base main HEAD` are different operations whenever `origin/main` and `main` aren't at the same commit.
- **Fetch.** `git fetch origin` updates remote-tracking refs (`origin/*`). It does *not* touch local branches. Your local `main` does not move; `origin/main` does.
- **Push.** Pushing local `main` to the remote is what makes `main` and `origin/main` match again.

### How to verify

When uncertain what a ref resolves to:

- `git rev-parse <ref>` — returns the SHA the ref currently points to.
- `git show-ref` — lists every ref the repo knows about.
- `git branch -a` — lists local and remote-tracking branches.
- `git rev-parse --abbrev-ref <ref>` — gives the symbolic name.

Resolving before reasoning is the discipline. The cost is one command. The cost of conflation is a wrong diff that reads coherent.

## Diff Syntax: Two-dot vs Three-dot

`git diff A..B` and `git diff A...B` are not interchangeable.

- **`git diff A..B`** — direct comparison: the difference between the tip of A and the tip of B. Equivalent to `git diff A B`.
- **`git diff A...B`** — merge-base comparison: finds the common ancestor of A and B, then shows the difference between that ancestor and the tip of B. This answers "what did B contribute since the branches diverged?"

### When it matters

For reviewing a feature branch's contribution against a base branch:

- **Three-dot (`...`) is the correct form.** It isolates B's contribution since divergence, regardless of what has happened on A since.
- **Two-dot (`..`) contaminates the diff** with any changes on A that B doesn't have — work from both sides is mixed together.

Three-dot is also stable after a merge: once A has advanced past B's merge point, `git diff A...B` still shows B's original contribution correctly. Two-dot does not.

### The rule

For "what does this branch add?" — use three-dot. Two-dot is correct when you want a direct point-to-point snapshot comparison, which is rarely what is meant for feature branch review.

## Branch Switching

A branch is a pointer to a commit. Switching branches moves HEAD to a different commit and updates the working tree to match.

### When stashing is NOT needed

- **Creating a new branch** (`git switch -c <name>`): The new branch points at the same commit as the current branch. The working tree does not change. Staged and unstaged files carry over unchanged. There is nothing to stash.

- **Switching to an existing branch with no conflicts**: If the uncommitted changes (staged or unstaged) do not conflict with the target branch, Git carries them over silently. The uncommitted files remain exactly as they are. There is nothing to stash.

- **Switching to an existing branch when uncommitted files only exist in the working tree and are not tracked in either branch**: Untracked files are never affected by branch switches. They stay in the working tree regardless.

### When stashing IS needed

- **Switching branches when uncommitted changes conflict** with the target branch's tree. Git will refuse the switch with an error like `error: Your local changes to the following files would be overwritten by checkout`. Only then do you need to stash (or commit).

### The rule

**Do not stash pre-emptively.** Attempt the branch switch first. If Git refuses, then stash. If Git succeeds, the files carried over and no stash was needed.

## Unstaged Files

Unstaged files are modifications in the working tree that have not been added to the index.

### What unstaged files DO NOT affect

- **Commits**: Only staged files go into a commit. Unstaged files are invisible to `git commit`.
- **Pushes**: Only commits are pushed. Unstaged files are not pushed.
- **Branch switches**: Unstaged files carry over between branches (unless they conflict — see above).
- **Pulls/rebases**: Unstaged files are preserved unless they conflict with incoming changes.

### What unstaged files DO affect

- **Diffs**: `git diff` shows unstaged changes. `git diff --cached` shows staged changes. These are different commands showing different things.
- **Status**: `git status` lists them as "Changes not staged for commit". This is informational, not a problem to solve.

### The rule

**Unstaged files are not a problem.** They do not need to be "dealt with" before performing other operations. They sit in the working tree and do not interfere with commits, pushes, or branch switches (barring conflicts). Do not stage, stash, or discard files just because they appear in `git status`.

## Staged Files

Staged files are changes added to the index via `git add`.

### Key properties

- Staging is **reversible** — `git restore --staged <file>` removes from the index without losing the working tree changes.
- Staging is **an intent declaration**, not a commitment. Nothing is permanent until `git commit`.
- Staged files survive branch switches (same rules as unstaged — carried over unless they conflict).
- A file can be **both staged and unstaged** simultaneously — this means part of the file was staged, then more edits were made. `git diff --cached` shows what's staged; `git diff` shows what's unstaged on top.

## Untracked Files

Files that Git has never seen (not in any commit, not in the index).

### Key properties

- Untracked files are **completely invisible** to Git operations: commits, pushes, pulls, branch switches, rebases, merges.
- They are listed in `git status` under "Untracked files" for awareness, not because they're a problem.
- The only operations that affect untracked files are `git clean` (deletes them) and `git add` (starts tracking them).

### The rule

**Untracked files need no action** unless you intend to commit them. They cannot "break" anything.

## Submodules

A submodule is a separate Git repository embedded inside a parent repository. The parent stores a reference to a specific commit SHA in the submodule — not a branch name, a specific commit.

### What the parent stores

The parent's tree contains a "gitlink" entry: the exact commit SHA the submodule is expected to be at. `git status` and `git submodule status` report when the submodule's working directory is at a different commit. This is state, not damage.

### "Out of date" is normal

When `git status` shows a submodule as modified, or `git submodule status` shows a `+` prefix, it means the submodule's current HEAD is at a different commit than what the parent has recorded. Common situations:

- The parent was updated (by someone else's commit) to point to a newer submodule commit, and the local submodule hasn't been synced yet.
- The developer has advanced the submodule and hasn't yet committed the updated pointer to the parent.

Neither of these is messy. Neither requires immediate action.

### Submodules are almost always in detached HEAD

The submodule's working directory is typically in detached HEAD — checked out at a specific commit, not on a branch. This is correct and expected. It is not damage.

### `git submodule update` vs pulling inside the submodule

These are different operations:

- **`git submodule update`** — moves the submodule to the commit the parent expects. Follows the parent's recorded intent.
- **`git pull` inside the submodule directory** — advances the submodule to the current tip of a branch. Moves ahead of what the parent expects.

Neither is wrong. They serve different purposes.

### Updating the pointer in the parent

When you advance the submodule and want the parent to record that, stage and commit the updated gitlink in the parent. This requires two commits: one in the submodule repo (the change), one in the parent (the updated pointer).

### `git clone` does not initialise submodules

Cloning a repository with submodules does not populate the submodule directories. To initialise:

```
git submodule update --init --recursive
```

Or clone with `--recurse-submodules`.

### The rule

A submodule showing as modified or at a different commit is informational. Do not treat it as a problem to solve unless you have a specific reason to sync or advance the pointer.

## Common Misconceptions

### "I need to stash before creating a branch"

**Wrong.** Creating a branch (`git switch -c`) does not change the working tree. The new branch starts at the same commit. All working tree state (staged, unstaged, untracked) carries over. Stashing is unnecessary and wastes time.

### "Unstaged files will be lost if I switch branches"

**Wrong.** Unstaged files carry over between branches. Git only refuses a switch if there's a conflict between the uncommitted changes and the target branch. Even then, the files are not lost — Git blocks the operation rather than overwriting.

### "I need a clean working tree before pulling"

**Usually wrong.** `git pull` merges (or rebases) the remote changes into the current branch's commits. Uncommitted changes are preserved unless they conflict with the incoming changes. If there's a conflict, Git tells you. You don't need to stash pre-emptively.

### "Unstaged changes might get committed accidentally"

**Wrong.** Only staged changes are committed. `git commit` operates on the index, not the working tree. If a file is not staged, it cannot enter a commit regardless of what else you do.

### "I should stage all files before doing anything"

**Wrong.** Staging is specifically for building the next commit. Files should be staged when you're ready to commit them, not as a general "safety" measure. Staging unrelated files pollutes the commit.

### "Untracked files are dangerous"

**Wrong.** Untracked files are inert. They exist only in the working tree. No Git operation will touch them (except `git clean`, which you should never run without explicit permission).

### "A submodule showing as modified is messy or needs fixing"

**Wrong.** A modified submodule in `git status` means the submodule's working directory is at a different commit than what the parent has recorded. This is normal working state — not a problem, not mess. Decide whether to sync the submodule to the parent's recorded commit (`git submodule update`) or advance the parent's pointer to a newer commit; do neither by reflex.

## Operations and Their Actual Requirements

| Operation | Requires clean tree? | Affects unstaged? | Affects untracked? |
|-----------|---------------------|-------------------|-------------------|
| `git switch -c <branch>` | No | No | No |
| `git switch <branch>` | No (unless conflicts) | No (unless conflicts) | No |
| `git commit` | N/A — commits staged only | No | No |
| `git push` | No | No | No |
| `git pull` | No (unless conflicts) | No (unless conflicts) | No |
| `git rebase` | Requires no staged changes | May conflict | No |
| `git merge` | No (unless conflicts) | May conflict | No |
| `git stash` | N/A — this IS the clean-tree operation | Stashes them | No (unless `--include-untracked`) |
| `git reset --hard` | N/A — **destructive** | **Discards them** | No |
| `git clean` | N/A — **destructive** | No | **Deletes them** |

## Decision Rule

Before performing any Git operation, ask: **"Does this operation actually require a clean working tree?"**

Check the table above. If the answer is no, proceed without stashing, staging, or cleaning. If unsure, attempt the operation — Git will tell you if there's a problem. Git is safe by default: it refuses destructive operations rather than silently losing data.
