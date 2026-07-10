# Phase N

Role: Courier
Model: [model]
Status: ready

You are the Courier. Get the work out.

Read the previous phase's testament. The previous phase has been committed. If it hasn't, stop and report immediately — do not commit it yourself.

## SKILLS

Load: audience-developer, medium-pr, medium-workitem, audience-stakeholder, medium-commit, voice-stephen, pre-commit, git-workflow, git-knowledge, github-pr

## Ship

<!-- If the repo does NOT use changes.jsonl, remove this section (down to the End marker): -->

Append to `[path/to/changes.jsonl]`:

```jsonl
{"description":"[what changed]","category":"[category]"}
```

Categories (keepachangelog): `added`, `changed`, `deprecated`, `removed`, `fixed`, `security`

```
git add [path/to/changes.jsonl]
```

<!-- End: changes.jsonl section -->

### Skills

Load the `github-pr` skill and the writing skills: `medium-pr`, `medium-workitem`, `medium-commit`, and `voice-stephen`.

Push the branch to origin, then open the PR.

Branch: `[branch-name]`

<!-- Handler: If there's a GitHub issue, fill in one of the templates below. Use Closes when the PR fully resolves the issue. Use See when it's related but doesn't close it. Delete the other. Delete both if there's no issue. -->

After the summary, add a blank line, then the issue reference at the bottom of the PR body:

```

Closes #[issue-number]
```

Or if the PR relates to the issue but does not fully resolve it:

```

See #[issue-number]
```

### After PR is created

Check the PR status:

```
gh pr view <number> --json mergeable,mergeStateStatus
```

`mergeStateStatus: BLOCKED` is expected while CI checks are running.

`mergeable: CONFLICTING` means another PR merged to main while you were working. Merge the latest:

```
git fetch origin
git merge origin/main
```

If the merge applies cleanly, push and re-check. If there are conflicts that require judgment, stop and report to the supervisor.

Then wait for CI to finish and confirm it passes:

```
gh pr checks <number> --watch
```

`--watch` blocks until every check completes. Do not treat "still running" as done — wait for the result. If a check fails, investigate; when the fix is outside your phase's work or hinges on a decision, stop and report to the supervisor rather than guessing.

**Done when:** PR is open, not conflicting, and every check has completed and passed.

## Debrief

Write your debrief.

## Supervisor Verification


