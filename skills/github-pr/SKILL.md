---
name: github-pr
description: |
  WHAT: Reference for GitHub PR format, required fields, and the enforcement script.
  WHY: PRs missing assignees or labels break release tracking.
  WHEN: Consult when creating or updating a GitHub PR.
metadata:
  category: reference
---

# GitHub PR

Reference for creating GitHub pull requests. Format rules and enforcement script.

## Creating a PR

Pipe JSON into the enforcement script:

```bash
jq -n '{
  title: "Title",
  body: "## Summary\n\n- What changed",
  assignee: "@me",
  milestone: "1.3",
  labels: ["bug"]
}' | ~/.claude/skills/github-pr/scripts/create-github-pr.sh
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | yes | PR title |
| `body` | yes | PR description (markdown) |
| `assignee` | yes | `@me` or username |
| `labels` | yes | Array of label names |
| `milestone` | no | Milestone title |

Do not use `gh pr create` directly. The script enforces required fields.

## Updating a PR

```bash
gh pr edit --title "Title" --body "Description"
```

## PR Title

- Under 70 characters, imperative mood
- Describe the effect, not the code

## PR Body

Load the `writing-style` skill for tone.

### Standard format

```markdown
## Summary

- Key change 1
- Key change 2
- Key change 3
```

3-5 bullets maximum. Short phrases, not full sentences. If the title says it all, an empty body is fine.

### Security / maintenance release

```markdown
## Summary

- Fix N vulnerabilities (X high, Y moderate, Z low) via pnpm overrides
- Update @shellicar/build-clean to 1.2.4
- Update all minor/patch dependencies

## Security Advisories

- [GHSA-xxxx-xxxx-xxxx](https://github.com/advisories/GHSA-xxxx-xxxx-xxxx) package-name vulnerability title
```

Every unique GHSA listed individually with a link.

### Version bump

The commit message is sufficient as both title and body.

## Auto-Merge

Only enable auto-merge if the prompt explicitly requests it. Not all repos use auto-merge.

```bash
gh pr merge --auto --squash
```

## Post-Creation

Verify the PR is not blocked:

```bash
gh pr view <number> --json state,mergeable,mergeStateStatus,statusCheckRollup
```

If checks fail, inspect with `gh run view <run-id> --log-failed`. Report which checks failed and whether the failure is from this PR or pre-existing.

## Convention-Specific Rules

Load the detected convention skill for branch naming, labels, issue linking, and co-authorship.
