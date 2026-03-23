---
name: skill-management
description: |
  Authoring guide for Claude Code skills: how to write descriptions that trigger correctly, choose invocation settings, organise and name skills, and keep cross-references current. Without it, new skills get wrong invocation settings, descriptions that never trigger, and stale cross-references.
  TRIGGER when creating, updating, or auditing skills in this repository.
user-invocable: false
metadata:
  category: reference
---

# Skill Management

**Scope:** How to create, describe, structure, and organise skills in this repository. Skill content itself lives in the individual skills.

Guidelines for creating and maintaining Claude Code skills in this repository.

## Official Documentation

Full reference: https://code.claude.com/docs/en/skills

## Skill Structure

Each skill is a directory with `SKILL.md` as the entrypoint:

```
skill-name/
├── SKILL.md           # Main instructions (required)
├── scripts/           # Helper scripts (optional)
└── examples/          # Example files (optional)
```

## Frontmatter Reference

```yaml
---
name: skill-name                    # Lowercase, hyphens, max 64 chars
description: What and when          # CRITICAL - see below
user-invocable: true                # Show in / menu (default: true)
disable-model-invocation: true      # Prevent auto-loading (default: false)
allowed-tools: Bash(pattern *)      # Tools without permission prompts
context: fork                       # Run in subagent
agent: Explore                      # Subagent type when context: fork
---
```

## Writing Good Descriptions

**The description must answer THREE questions:**
1. **WHAT** does this skill do? (its purpose and effect)
2. **WHY** does it matter? (what goes wrong without it)
3. **WHEN** should it be used? (TRIGGER conditions)

The skill content (HOW) is loaded when invoked. The description never needs to explain it.

### Pattern

```
[Purpose and effect]. Without it, [consequence].
TRIGGER when [condition].
DO NOT TRIGGER for [exclusion].  <- optional
```

### Principle: Describe purpose, not table of contents

The description tells you why to load the skill, not what is inside it. Listing sections, fields, or internal structure makes the description a stale summary that competes with the skill itself.

**Bad** (lists the table of contents):
```yaml
description: |
  Reference for creating skills: directory structure, frontmatter fields
  (name, description, user-invocable, disable-model-invocation), description
  patterns, naming conventions, and the maintenance checklist.
```

**Good** (describes the purpose):
```yaml
description: |
  Authoring guide for Claude Code skills: how to write descriptions that
  trigger correctly, choose invocation settings, organise and name skills,
  and keep cross-references current.
```

### Principle: Describe structure, not specific values

Descriptions that encode specific values (branch names, field names, exact rules) go out of date. Because they appear in the description, they get treated as authoritative even after the skill changes.

**Bad** (encodes values that will drift):
```yaml
description: |
  Git conventions for shellicar projects: branch naming (feature/, fix/),
  PR description format (Summary + Changes sections), and repo settings.
```

**Good** (describes what areas are covered, without values):
```yaml
description: |
  Git branch, commit, PR, and repo configuration conventions for shellicar
  GitHub projects.
```

The same applies to implementation details: say "error handling" not "set -e"; say "scanning patterns" not "the specific regex table".

### Principle: Convention TRIGGERs name the convention, not the detection criteria

The detection criteria (which remote URL, which directory) live inside the skill and are evaluated by detect-convention. The TRIGGER should name the convention, not duplicate the detection logic.

**Bad** (encodes the detection criteria):
```yaml
  TRIGGER when committing in ~/.claude or a dotfiles repo.
```

**Good** (names the convention):
```yaml
  TRIGGER when detected as the active shellicar-config convention.
```

### Principle: Don't qualify names with adjectives the convention doesn't have

If the convention is called `shellicar-config`, the description says "shellicar-config convention". Adding qualifiers like "personal" or "private" introduces meaning that is not part of the name and may become wrong.

**Bad:**
```yaml
  TRIGGER when detected as the active convention for a personal config repo.
```

**Good:**
```yaml
  TRIGGER when detected as the active shellicar-config convention.
```

### Description Patterns by Skill Type

| Type | Pattern |
|------|---------|
| Workflow | "[What it orchestrates]. Without it, [consequence]. TRIGGER when [doing the thing]." |
| Standards | "[What standards it enforces]. Without it, [consequence]. TRIGGER when [producing output it governs]." |
| Reference | "[What reference it provides]. Without it, [consequence]. TRIGGER when [needing the reference]." |
| Convention | "[What conventions it covers] for [project]. Without it, [consequence]. TRIGGER when detected as the active [convention-name] convention." |
| Foundational | "[What it establishes]. Without it, [consequence]. TRIGGER on session start." |

## Invocation Control

| Setting | You invoke | Claude invokes | Use case |
|---------|------------|----------------|----------|
| (default) | Yes | Yes | Most skills |
| `disable-model-invocation: true` | Yes | No | Side effects, user-controlled timing (deploy, release) |
| `user-invocable: false` | No | Yes | Background knowledge, auto-detected conventions |

## Skill Organization

### Naming Conventions

**Workflow groups** - related skills share a prefix:
- `github-version`, `github-pr`, `github-release` (npm package workflow)
- `azure-devops-boards`, `azure-devops-repos`, `azure-devops-pipelines`

**Convention skills** - named by project/context:
- `shellicar-conventions`, `flightrac-conventions`, `eagers-conventions`

### Cross-References

When skills reference each other, use the skill name:
```markdown
Invoke the `github-pr` skill to create the pull request.
```

When renaming skills, update all cross-references:
```bash
grep -r "old-skill-name" skills/
```

## Maintenance Checklist

When creating or updating skills:

1. **Name**: Lowercase, hyphens, descriptive
2. **Description**: Includes WHAT and WHEN
3. **Invocation**: Correct `user-invocable` and `disable-model-invocation` settings
4. **Cross-references**: All references to other skills are current
5. **Script paths**: Any `allowed-tools` paths match actual locations

## Convention Detection

Convention skills use `user-invocable: false` because they're loaded by the `detect-convention` skill, not directly invoked. The detection determines which convention applies based on:
- Git remote URL
- Repository structure
- Other contextual signals

## Supporting Files

Keep `SKILL.md` focused. Move detailed content to supporting files:
- `reference.md` - detailed API docs
- `examples.md` - usage examples
- `scripts/` - helper scripts

Reference from SKILL.md:
```markdown
For complete API details, see [reference.md](reference.md)
```

## String Substitutions

Available in skill content:
- `$ARGUMENTS` - all arguments passed when invoking
- `$ARGUMENTS[N]` or `$N` - specific argument by index
- `${CLAUDE_SESSION_ID}` - current session ID
