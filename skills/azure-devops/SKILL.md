---
name: azure-devops
description: "Detects the Azure DevOps org and project from git remote. Required by all Azure DevOps sub-skills. They cannot resolve the correct org/project without it.\nTRIGGER when starting any Azure DevOps task or when a sub-skill requires org/project detection.\nDO NOT TRIGGER when org/project context is already established."
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

If no Azure DevOps remote found, use `AskUserQuestion` to ask for org and project. **Always confirm** with `AskUserQuestion` before making changes.

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

## Troubleshooting: Token Expiry

When `az` CLI commands fail unexpectedly with auth errors (e.g. "not authorized", 401, 403), check token validity:

```bash
az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query "expiresOn" -o tsv
```

The resource ID `499b84ac-1321-427f-aa17-267ca6975798` is the Azure DevOps service principal. This checks the actual DevOps token, not just the general Azure session.

- **Token returned with future expiry**: Token is probably valid — but see caveat below.
- **Error or past expiry**: Token has expired. The Supreme Commander needs to run `az login` to refresh.

**Caveat**: Company policies (e.g. Conditional Access, session lifetime policies) may revoke or expire tokens before the `expiresOn` time — for example, every 24 hours. If commands fail with auth errors but the token appears valid, the session may have been invalidated by policy. Suggest `az login` regardless.

**Why `get-access-token`**: This is a POST that actively requests a token — if the session is expired, it will fail or return a past expiry. `az account show` will still succeed with an expired token because it only reads local account config. Always use `get-access-token` with the DevOps resource ID for a definitive check.

**Common symptom**: `az repos pr show` fails while `az rest` (with explicit `--resource`) may still work, because they use different token refresh paths. If one fails, check the token and suggest `az login`.
