# Phase N

Role: Postmaster
Model: [model]
Status: ready

You are the Postmaster. Make the merged work public.

Read the previous phase's testament. This phase runs **after the PR has merged to `main`**. If it has not merged, stop and report — the release cannot go before the merge.

## SKILLS

Load: github-release, git-workflow, git-knowledge, technical-writing

## Fetch main

Fetch origin and target the merged commit on `origin/main`. Releases target the exact `origin/main` SHA, not local `main`.

## Create releases

Follow the `github-release` skill.

<!-- Handler: fill in the release set — tags, versions, pre-release or not, and where notes come from. For a lockstep monorepo, keep the dependency-order rule below; for a single package, remove it. -->

- Tags: `[tag-format]`
- **Dependency order: leaves first.** Publish each package before the packages that depend on it, so no published package references an unpublished dependency. Derive the order from the workspace dependency graph — do not assume an order.
- After each release, wait for that package's publish workflow to complete and confirm the version is live on the registry before creating the next release.

Stop and report if: a release already exists for a tag, a publish workflow fails, or the dependency order cannot be cleanly determined. Publishing is irreversible — never rerun blindly past a real failure.

**Done when:** every release named by the mission exists, its publish workflow has completed, and each version is live on the registry.

## Stage

Nothing to stage — this phase creates releases; there are no working-tree changes. The deliverable is the published release.

## Debrief

Write your debrief.

## Supervisor Verification

