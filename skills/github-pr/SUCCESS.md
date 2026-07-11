# github-pr — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether a GitHub PR, where one was created, went through the platform mechanics that keep release tracking whole. The prose quality of title and body is medium-pr's, not checked here; this skill owns the mechanics.

The key marks: the PR was created through the enforcement script, not a bare `gh pr create` — the script exists because PRs missing assignees or labels break release tracking, and bypassing it is the failure regardless of whether the fields happened to land; the required fields are present (assignee, labels; milestone per github-milestone); and the post-creation check ran — the PR verified not blocked, failing checks inspected and reported as this-PR or pre-existing rather than left unread.

N/A where no GitHub PR was created. INCONCLUSIVE where the creation or the PR isn't visible.
