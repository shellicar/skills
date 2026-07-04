# Phase N

Role: Courier
Model: [model]
Status: ready

You are the Courier. Get the work out.

Read the previous phase's testament. The previous phase has been committed. If it hasn't, stop and report immediately — do not commit it yourself.

## SKILLS

Load: technical-writing, sc-pr-writing, sc-workitem-writing, sc-commit-writing, sc-ghostwriting, pre-commit, git-workflow, git-knowledge, azure-devops, azure-devops-pr, ado-work-items

## Ship

### Skills

Load the `azure-devops-pr` skill and the SC writing skills: `sc-pr-writing`, `sc-workitem-writing`, `sc-commit-writing`, and `sc-ghostwriting`.

### Create PR Task

Before opening the PR, create a Task for this work and parent it under the PBI/Bug. Load the `azure-devops-boards` skill for the creation sequence (create, then parent with `relation add`).

- **Type**: Task
- **Title**: short description of the PR work
- **Parent**: [PBI_OR_BUG_ID]
- **Project**: [project]
- **Iteration**: [iteration path]
- **Org**: https://dev.azure.com/[org]

Note the Task ID from the response.

### Open PR

The `azure-devops-pr` skill handles the sequence: create PR, link the Task, preview merge message, set auto-complete.

- Reference the parent PBI/Bug with `#[PBI_ID]` in `## Related Work Items`
- Link the Task (not the PBI) via `az repos pr work-item add`

Push the branch to origin, then open the PR.

Branch: `[branch-name]`

### After the PR is created

Opening the PR auto-triggers a validation build. The work is not done until that build has run and passed — "PR open" is not "the change works."

- Find the validation build the PR triggered, wait for it to complete, and confirm it passed. ADO typically runs PR validation against the merge ref, not your source branch, so the run may take a moment to appear. You can list the runs with `az pipelines runs list --branch refs/pull/<PR_ID>/merge --org <org> --project <project>` and poll each until its `result` is `succeeded` — a starting point, not the only way.
- If the build fails, that is something to surface, not to fix. Investigate the cause and report it to the supervisor; you may propose a solution, but do not make changes to fix it yourself. Shipping is your job — fixing is a separate decision that belongs to another phase.
- If the PR triggers no validation at all, that is the answer — report it, and flag it if there should have been one.

Record in your debrief *how* you located and watched the validation build — the exact commands you used. The command above is a suggestion, not a mandate; if you found a better way, your account is what improves this block.

**Done when:** PR is open with auto-complete set, and its validation build has completed and passed — or no validation was triggered and that is reported.

## Debrief

Write your debrief.

## Supervisor Verification


