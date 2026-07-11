# worktrees — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether operator work was isolated from the SC's working environment, and whether the worktree lifecycle held its order.

The key marks: the mission delivered to a worktree (`<repo>--<description>`), never the main checkout — the main checkout is the SC's, read but never written; the worktree created only after the prompt was committed (a worktree against a draft becomes orphaned state); creation and reclaim through the scripts, with the Handler owning the branch name — the operator never creates a branch; and cleanup at true mission-done, with a refusal on uncommitted state presented to the SC rather than forced — the scripts carry no `--force` by design, and reaching around that is the fail with teeth.

N/A where no operator worktree was created or torn down. INCONCLUSIVE where the creation or cleanup isn't visible.
