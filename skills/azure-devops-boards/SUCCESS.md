# azure-devops-boards — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## Not marked

azure-devops-boards is reference — the `az boards` command set and ADO's platform gotchas (`--fields System.Parent=X` silently does nothing, `az boards work-item list` doesn't exist, iteration delete needs `--path` not `--id`). It corrects misconceptions so an operator avoids ADO's silent failures — the same shape as git-knowledge.

It exists to help avoid the pitfall, not to penalise falling in. So there is nothing to mark: where a silent failure causes real harm, that harm is caught with teeth elsewhere (an orphaned work item under ado-work-items, a wrong state), not here.
