---
name: pre-commit
description: |
  WHAT: Reports what's staged vs what was modified, so you can verify before committing.
  WHY: A careless git add . stages untracked files (logs, SDK history, entire conversations) that end up merged into main.
  WHEN: TRIGGER before every commit.
metadata:
  category: workflow
---

# Pre-Commit Check

Run before every commit. Shows you what's staged so you can verify it's correct.

This is informational, not a hard gate. Use the output to make a judgment call. For example, testament files may be intentionally excluded from a commit, and that's fine.

## Usage

```bash
# Report what's staged
~/.claude/skills/pre-commit/scripts/pre-commit-check.sh

# Compare staged files against an expected list
~/.claude/skills/pre-commit/scripts/pre-commit-check.sh src/foo.ts src/bar.ts
```

Always exits 0. You decide whether to proceed based on the report.

## Output

JSON report with:

- **staged**: files currently staged
- **unstaged**: modified files not staged (so you can see if something was missed)
- **warnings**: staged files matching common accident patterns (log files, env files, SDK history)
- **unexpected**: files staged but not in the expected list (comparison mode only)
- **missing**: files in the expected list but not staged (comparison mode only)

## Rules

- Always use explicit `git add <file>` paths. Never `git add .` or `git add -A`.
- Run this check after staging, before committing.
- Review the output. If something unexpected is staged, unstage it. If something expected is missing, decide whether it should be included.
