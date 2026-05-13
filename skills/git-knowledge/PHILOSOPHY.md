# git-knowledge: editorial context

This file is the editorial context for the `git-knowledge` skill. It is not loaded at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

Git has specific mechanics that, when assumed-rather-than-known, produce a class of failures with the same shape: operations performed pre-emptively against problems that don't exist (stash before a branch create, stage before doing anything, "clean working tree" as a prerequisite when none was needed), or confidence in git output that turns out to rest on misread references.

Without this skill, the trained pattern fires: when asked to do git work, reach for the operations that *sound* safe (stash, stage, clean) regardless of whether they're necessary. The trained pattern produces correctness through ceremony — many operations, much state movement, sometimes destructive — rather than through understanding what the state actually is.

The skill exists because the trained pattern is the failure pattern. Understanding the three states (working tree, index, commits) and how references resolve (local branch, remote-tracking ref, the remote-side branch) is what turns ceremony into informed action.

## Origin

### The working-tree-state section (`The Three States` through `Decision Rule`)

Predates the conversation I have context on. This portion of the skill addresses the *"stash everything before any operation"* trained pattern — the misconception that uncommitted files interfere with commits, pushes, branch switches, etc. The decision rule at the bottom (*"Does this operation actually require a clean working tree?"*) is the skill's spine.

**This editorial section is incomplete for the working-tree portion.** I authored the *Naming Branches and Refs* section (below) but did not write the rest of the skill. The SC has the context for the working-tree sections' reasoning; this PHILOSOPHY.md needs filling in by the SC for those sections.

### The Naming-Branches-and-Refs section

Added in response to a concrete failure: a PR-review iteration session where multiple casts referenced `epic/refactor-next` interchangeably with `origin/epic/refactor-next` in their reasoning and tool calls. The casts produced diffs against `origin/epic/refactor-next` but described them as diffs against `epic/refactor-next`. The PM (me) inherited the same confusion — read the casts' output, did not notice the missing `origin/` prefix, and relayed framings that conflated the two refs.

Crystallising moment: the SC ran `git show you-are-a-very-bad-word` in the worktree to demonstrate that git accepts arbitrary strings as branch names — the `git show` resolved (to a branch the SC had created) and returned a commit. The lesson: git's output looks the same whether the ref means what you think or means something else. Without a model for how refs resolve, the operator cannot tell when git is showing them ground truth versus a misread reference.

The principle that came out of that session: always refer to a branch by its full ref name and include the short SHA the ref resolves to. Drop the `origin/` prefix and you've lost the distinction between local branch and remote-tracking ref; drop the SHA and you've lost the moment-in-time the ref pointed at. The naming rule is the structural defence.

## Key insights that shaped this skill

### The trained "clean working tree" reflex

The trained pattern is to clear uncommitted state before any git operation. Most operations don't require it. Pre-emptive stashing is unnecessary work that obscures what the operation actually needs. The skill names the operations that *do* require a clean tree (`git rebase`, destructive operations) versus those that don't (`switch -c`, `commit`, `push`, most `pull` and `merge` cases).

### A branch name alone is ambiguous

`epic/refactor-next` can mean a local branch, a remote-tracking ref (`origin/epic/refactor-next`), or the remote-side branch on the actual server. These can point at the same commit but often don't. Treating them as interchangeable produces wrong diffs, wrong merge bases, and wrong reasoning that *looks coherent*.

The structural defence is the naming rule: always include `origin/` (or whatever remote) when meaning the remote-tracking ref, and always include the short SHA the ref currently resolves to. Both elements anchor the reference to something verifiable.

### Two-dot vs three-dot diff syntax

`git diff A..B` is direct comparison: HEAD-of-B minus HEAD-of-A. `git diff A...B` computes the merge base of A and B and diffs from there to B — *"what was contributed on B's side since divergence."* The three-dot form is what produces "the PR's contribution" correctly, even when the PR has merged into the target branch.

This is not a stylistic difference. Using two-dot when three-dot is needed produces a different diff. For PR review specifically, three-dot is the form that survives the merge.

### Resolving before reasoning

The mitigation for ref ambiguity is mechanical: before reasoning about what a diff shows or what a merge base is, resolve the references to SHAs explicitly. `git rev-parse <ref>` returns the SHA. `git show-ref` lists all known refs. `git branch -a` lists local and remote-tracking branches. The cost is one command; the cost of skipping is a wrong diff that reads coherent.

## Decisions made

### Skill name: `git-knowledge`

Not `git-workflow` (that's a separate skill for workflows). Not `git-mechanics`. *Knowledge* signals the corrective framing — most failures here come from missing knowledge that the skill supplies.

### Category: `reference`

The skill is consulted before operations, not loaded continuously. `user-invocable: false` with a TRIGGER on git-state-modifying operations and ref reasoning.

### The naming rule includes the short SHA

Considered: name-only (`origin/<branch>` without SHA). Rejected: the ref's resolution changes over time. Saying *"origin/epic/refactor-next"* without a SHA pins nothing — the same statement means different things at different times. With the SHA, *"`origin/epic/refactor-next [bff895d]`"* anchors to a specific commit you can verify.

### When-the-distinction-matters subsection

The skill explains *why* the local-vs-remote-tracking distinction is non-trivial through concrete operations (diffs, merge-base, fetch, push). Without the why, the rule reads as bureaucratic prefix-everything. With it, the rule is grounded in operations that visibly behave differently.

## What was rejected

- **Stash-before-everything as a "safe default."** It isn't a default; it's an unnecessary operation that obscures state. The decision rule replaces it.
- **Treating untracked files as "to deal with."** Untracked files are inert to git operations except `clean` (which is destructive and gated separately). They need no action unless you intend to commit them.
- **Naming branches without `origin/` prefix when meaning remote-tracking refs.** The prefix is part of the name, not decoration.
- **Naming branches without SHAs in editorial / explanatory text.** The SHA pins the reference; without it, the same name means different things at different times.
- **Two-dot diff syntax for "PR review" cases.** Three-dot is the correct form for "contributions on a feature branch relative to the target," and survives the merge.

## What this skill does NOT cover

- **Git workflows** — branching strategies, merge vs rebase choice, commit-message conventions. See `git-workflow`.
- **Cleanup operations** — pruning, garbage collection, rewriting history. See `git-cleanup` (when it exists).
- **Specific recipes for `az repos` / GitHub PR operations.** Those are in tooling skills (`devops-review` for ADO).
- **Reflog mechanics.** Recovery from destructive operations via reflog is its own topic; this skill covers prevention rather than recovery.

## Notes for future editors

- The decision rule (*"Does this operation actually require a clean working tree?"*) is load-bearing for the working-tree-state portion. If editing produces text that re-introduces "always stash" or "stage everything first" as advice, the edit has reverted the skill to the failure pattern it addresses.
- The Naming Branches and Refs section is mandatory in any reference to a branch. The discipline is to *always* include `origin/` (or the remote name) when meaning the remote-tracking ref, and to *always* include the short SHA. Examples that drop either are bugs.
- Examples in the skill should use names that wouldn't be confused with real refs in the operating environment. Don't add fictional refs that look plausibly real.
- The Common Misconceptions section is the working tree's catechism. Adding new misconceptions is appropriate when new patterns surface; adding *answers* without surfacing the misconception first is preemptive enumeration.
- **Gap acknowledgement:** the working-tree-state sections (`The Three States` through `Operations and Their Actual Requirements` and `Decision Rule`) pre-date this `PHILOSOPHY.md`. The reasoning there should be captured by whoever authored those sections originally. This file currently has full editorial coverage only for `Naming Branches and Refs`.
