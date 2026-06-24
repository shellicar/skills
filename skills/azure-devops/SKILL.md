---
name: azure-devops
description: |
  WHAT: Resolves the Azure DevOps org and project from git remote, providing the context all sub-skills need to target the right project.
  WHY: Prevents sub-skills from having no org or project to operate against.
  WHEN: TRIGGER when starting any Azure DevOps task or when a sub-skill requires org/project detection.
  DO NOT TRIGGER when org/project context is already established.
metadata:
  category: reference
---

# Azure DevOps

**Scope:** Org/project detection from git remotes and the shared REST API wrapper. Sub-skill routing, not sub-skill content.

Shared foundation for all Azure DevOps skills. Provides org/project detection and routing to sub-skills.

## Org/Project Detection

When org/project are not provided, detect from git remote:

```bash
git remote -v
```

Parse the remote with `dev.azure.com` in the URL:
- `https://{org}@dev.azure.com/{org}/{project}/_git/{repo}` -> org, project
- `git@ssh.dev.azure.com:v3/{org}/{project}/{repo}` -> org, project

If no Azure DevOps remote found, ask the user for the org and project. **Always confirm** with the user before making changes.

## Sub-Skills

| Skill | Section | Use For |
|-------|---------|---------|
| `azure-devops-config` | Configuration | Teams, area paths, iterations, backlog visibility, delivery plans, column config |
| `azure-devops-boards` | Boards | Work items, hierarchy, migrations, descriptions |
| `azure-devops-repos` | Repos | PRs, work item linking, merge workflows |
| `azure-devops-pipelines` | Pipelines | Pipeline runs, configuration, triggers, policies |

## REST API Wrapper

Use `scripts/ado-rest.sh` for all REST calls. Takes JSON on stdin, handles authentication, URL construction, and sanitisation. `org` and `method` and `path` are required; `project` is optional (omit for org-level APIs).

```bash
# Simple GET — org-level (no project)
echo '{"org":"{org}","method":"GET","path":"projects"}' | ~/.claude/skills/azure-devops/scripts/ado-rest.sh

# GET with query params
echo '{"org":"{org}","project":"{project}","method":"GET","path":"wit/classificationNodes/Areas","params":{"$depth":"10"}}' | ~/.claude/skills/azure-devops/scripts/ado-rest.sh

# PATCH with body and headers (team is appended to project segment)
~/.claude/skills/azure-devops/scripts/ado-rest.sh << 'EOF'
{
  "org": "{org}", "project": "{project}/{team}", "method": "PATCH",
  "path": "work/teamsettings",
  "headers": {"Content-Type": "application/json"},
  "body": {"backlogVisibilities": {"Microsoft.EpicCategory": true}}
}
EOF
```

## Troubleshooting: Authentication

When `az` CLI commands fail unexpectedly with auth errors, two different things can be going on. Telling them apart matters, because only one of them needs the Supreme Commander.

Two example failures, both seen verbatim in real sessions:

```text
ERROR: AADSTS70043: The refresh token has expired or is invalid due to sign-in frequency checks by conditional access. The token was issued on 2026-06-22T23:56:03.5747889Z and the maximum allowed lifetime for this request is 86400. Trace ID: d67b0836-8bd3-44de-9e34-b225b8064a00 Correlation ID: 5c37a006-6ea3-4308-8781-273b74cda9d7 Timestamp: 2026-06-24 00:46:34Z
Run the command below to authenticate interactively; additional arguments may be added as needed:
az logout
az login --tenant "a882bc25-e1dd-4721-b861-aba1afaec76d" --scope "499b84ac-1321-427f-aa17-267ca6975798/.default"
```

```text
ERROR: TF400813: The user 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' is not authorized to access this resource.
```

### Two mechanisms

**Normal token lifecycle — no action needed.** The access token is relatively short-lived and is refreshed automatically. Do not inspect `expiresOn`, see a few minutes left, and conclude the SC must re-authenticate — that refresh happens on its own. There is no clock here to pre-empt.

**The 24-hour MFA policy — needs the SC.** A tenant can enforce a Conditional Access policy requiring interactive MFA re-authentication every 24 hours. Eagers does (an intentional response to a past security incident); other tenants may too. The window runs 24 hours from when the token was *granted*, not a wall-clock time overnight — which is why it lands at seemingly random times rather than predictably at midnight. This is the one that genuinely needs `az login`, and re-authentication is interactive, so only the SC can do it.

When the policy fires, the refresh token still works and still grants a token — but the granted token is invalid: an unauthenticated principal. That is why the failure reads "not authorized" rather than "no token," and why the user in `TF400813` shows as the all-`a` GUID `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` (the empty/anonymous identity). Recognising the all-`a` GUID is a fast way to confirm it is the policy revocation and not something else.

"Expired" is the loose word to avoid: in the policy case the token is revoked, not expired on its own clock. React to the auth failure; do not pre-empt an `expiresOn` deadline.

### Detecting it

```bash
az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query "expiresOn" -o tsv
```

The resource ID `499b84ac-1321-427f-aa17-267ca6975798` is the Azure DevOps service principal — this checks the actual DevOps token, not just the general Azure session. `get-access-token` is a POST that actively requests a token, so it fails (or returns a past expiry) when the session is gone. `az account show` will still succeed against a dead session because it only reads local account config — it lies; do not rely on it. If a command fails with an auth error, suggest `az login` regardless of what any `expiresOn` claims.

### Multiple accounts

`az account list` can hold several accounts across different tenants (this machine has one; other machines may have three or more). For plain `az` CLI that is fine — target a specific one with `--subscription <id>`. But `az devops` does not honour `--subscription`; it uses the *default* account only, which has to be set explicitly. The trap: when switching across tenants it can look like tokens constantly expire, when the real symptom is the wrong default account. Prefer `--subscription <id>` for `az` CLI, know it will not help `az devops`, and check the default account before assuming a token problem.

### Common symptom

`az repos pr show` fails while `az rest` (with explicit `--resource`) may still work, because they use different token refresh paths. If one fails, check the token and suggest `az login`.
