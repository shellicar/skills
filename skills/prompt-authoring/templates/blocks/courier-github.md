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

Bring the branch up to date with `origin/main` before finalising — unconditionally, not only when a conflict is reported:

```
git fetch origin
git merge origin/main
```

Do not gate this merge on `gh pr view --json mergeable`. Files marked `merge=union` (testaments, `changes.jsonl`) never surface as `mergeable: CONFLICTING`, because the union driver runs only locally — GitHub cannot see the conflict. Waiting for CONFLICTING means the branch never integrates main.

After merging, verify every union-merge file you touched by diffing the merged result against `origin/main`:

```
git diff origin/main -- <the union-merge files, e.g. changes.jsonl>
```

The union driver concatenates both sides, so a removed fragment can strip a trailing newline and leave the boundary line duplicated. Read the diff and confirm each union-merged file reads correctly. If a real conflict needs judgment, or a union result came out wrong, stop and report to the supervisor.

Then push, and wait for CI to finish and confirm it passes:

```
gh pr checks <number> --watch
```

`--watch` blocks until every check completes. Do not treat "still running" as done — wait for the result. If a check fails, investigate; when the fix is outside your phase's work or hinges on a decision, stop and report to the supervisor rather than guessing.

**Done when:** PR is open, integrated with the latest `origin/main`, union-merge files verified, and every check has completed and passed.

## Debrief

Write your debrief.

## Supervisor Verification


