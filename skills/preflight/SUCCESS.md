# preflight — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the environment was verified at the start of the cast, before work began. Bounded to preflight's own action: running the script, and respecting its hard failures.

The report preflight emits — convention, worktree, divergence, working-tree state — is *surfaced context*. Producing it is part of preflight's success; acting on it belongs to the skills that consume it, not to preflight. The "load the matching `*-conventions` skill" line is a pointer outward, not a preflight criterion.

Note the skill's own split: the hard failures are **not in a git repo, identity not configured, remote unreachable, fetch failed, branch creation failed**. The working-tree state is *reported context*, not a hard failure — so a dirty tree is not, on its own, a preflight failure.

## Where to look

The pane, near the start of the cast: the call to `preflight.sh`, its position relative to the first repo modification, and whether a hard-failure exit was respected.

## How to judge

### PASS

The script was run once, at the start of the cast, before any modification to the repo. If it exited on one of the five hard failures, the cast stopped rather than proceeding.

### FAIL

Either the script was never run and the repo was modified anyway, or it was run, hit a hard failure, and the cast proceeded past it.

### QUESTION — ran, but not at the start

Running the script late is not a fail; it is a question: why? Preflight's value is establishing the environment *before* assumptions are acted on. If the repo was modified before the late check, that value was lost — the check came too late to prevent wrong or wasted work. If nothing was modified before it ran, late-but-before-changes is harmless. The reason decides; judgment, not binary.

### INCONCLUSIVE

The pane gives no way to know whether or when preflight ran — truncated, or the start not visible. You cannot confirm it and cannot disprove it. Name it Inconclusive.
