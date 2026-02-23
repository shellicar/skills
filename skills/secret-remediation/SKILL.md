---
name: secret-remediation
description: Scrub secrets and PII from git history using filter-branch. Use when secret-scanning finds values in git history that need removal, or when explicitly asked to rewrite history to remove sensitive values.
user-invocable: false
---

# Secret Remediation: Git History Scrubbing

Rewrite git history to remove secrets and PII that were committed. This skill is invoked after the `secret-scanning` skill detects values in git history that need removal.

## Prerequisites

- The `secret-scanning` skill has already identified and remediated secrets in the working tree
- Working tree changes have been committed (clean working tree required)
- Values to scrub have been confirmed by the Supreme Commander

## Scrub Scenarios

Determine which scenario applies:

| Scenario | Secret in main history? | Secret pushed on feature branch? | Action |
|----------|------------------------|----------------------------------|--------|
| **A: Main only** | Yes | No | Scrub main with `git-scrub-history.sh` |
| **B: Feature branch only (not pushed)** | No | No (local only) | Squash-merge the feature branch before pushing — the secret never reaches remote |
| **C: Feature branch (pushed, PR open)** | No | Yes | Scrub the feature branch too — PR history on the platform retains all commit diffs even after squash merge |
| **D: Both** | Yes | Yes | Scrub main, then scrub the feature branch (or squash if not yet pushed) |

**Key insight:** Once commits are pushed to remote, the platform (GitHub/Azure DevOps) retains PR diffs permanently. Squash-merging only helps if the secret was never pushed. If it was pushed, the branch history must also be scrubbed.

## Workflow

This skill receives the scenario (A, B, C, or D), affected branches, and values from the `secret-scanning` skill. Scenario B is handled entirely by the scanning skill (squash before push) — this skill handles A, C, and D.

### Step 1: Confirm the scenario

Verify the scenario passed from `secret-scanning`:
- **Scenario A**: Scrub main only
- **Scenario C**: Scrub the feature branch only
- **Scenario D**: Scrub main first, then scrub the feature branch

For scenarios C and D, the `--branch` flag must target each affected branch separately (one scrub run per branch).

### Step 2: Present a History Remediation Plan

| # | Value to scrub | Replacement |
|---|----------------|-------------|
| | | (e.g. `REDACTED_EMAIL`, `REDACTED_HOST`, or empty) |

Present the plan and ask the Supreme Commander to confirm.

### Step 3: Generate an expressions file

Create a text file with one sed expression per line:

```
s|leaked@example\.com|REDACTED_EMAIL|g
s|\bsvc_leaked\b|REDACTED_USER|g
s|db-server-01\.example\.net|REDACTED_HOST|g
```

Save to `/tmp/scrub-expressions-<timestamp>.txt`.

### Step 4: Search history

Run the search script to find all matches (read-only, fast):

```sh
~/.claude/skills/secret-remediation/scripts/git-search-history.sh --expressions <expressions-file> --branch <branch>
```

Review the output with the Supreme Commander for false positives.

### Step 5: Scrub history

Present the scrub command for the Supreme Commander to run (do NOT run it yourself — the Supreme Commander must see the output directly):

```sh
cd <repo-directory>
~/.claude/skills/secret-remediation/scripts/git-scrub-history.sh --expressions <expressions-file> --branch <branch> --destructive
```

**Script behaviour:**
1. Creates a backup tag `backup/pre-scrub-<timestamp>` at current HEAD
2. Shows a 5-second countdown warning before proceeding
3. Runs `git filter-branch -f --tree-filter` with `sed` to replace values
4. Prints modified files per commit as `[scrub] <file>`
5. Prints the `git push --force-with-lease` command for the Supreme Commander to run

### Step 6: Force push

The script prints the exact `git push --force-with-lease` command. The Supreme Commander runs it (protected operation — cannot be run by assistant).

For **Scenario D**: repeat steps 4–6 for each affected branch.

### Step 7: Verify

Run the search script again to confirm values are no longer in history.

## Scripts

| Script | Purpose |
|--------|---------|
| `git-search-history.sh` | Search git history for expression matches (read-only) |
| `git-scrub-history.sh` | Orchestrator: rewrite history via filter-branch (destructive) |
| `git-scrub-commit.sh` | Tree-filter helper: apply sed replacements per commit (internal) |

All scripts require `--destructive` flag except `git-search-history.sh`.

**Platform support:** POSIX shell (`/bin/sh`) + `sed` + `git`. Works on macOS, Linux, Windows (Git Bash), and WSL2.

## Record the Outcome

After scrubbing is complete, summarise:
- The scenario (A, C, or D) and which branches were scrubbed
- Which values were scrubbed
- How many commits were rewritten per branch
- The backup tag name(s) (for recovery if needed)
- Whether verification confirmed clean history
