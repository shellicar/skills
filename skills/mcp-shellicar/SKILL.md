---
name: mcp-shellicar
description: "What: mcp__shellicar__exec replaces the Bash tool — programs are spawned directly via child_process.spawn, no shell involved. When: TRIGGER when executing shell commands, running programs, calling git, running builds/tests/scripts, or any task that would normally use the Bash tool. DO NOT TRIGGER when reading files, editing code, searching code, or non-execution tasks. Why: NEVER use program: \"sh\" or program: \"/bin/bash\" — this recreates a shell and defeats the tool's purpose; use cwd, env, steps, pipeline, and stdin instead."
---

# Exec MCP Tool

`mcp__shellicar__exec` replaces the Bash tool entirely. When enabled, Bash is disallowed — use this tool for all command execution. Programs are spawned directly via `child_process.spawn()` — no shell is involved.

## Quick Reference

Each step has a `commands` array. One command runs directly; two or more are connected as a pipeline (stdout → stdin).

**Single command:**
```json
{
  "description": "Check git status",
  "steps": [{ "commands": [{ "program": "git", "args": ["status"] }] }]
}
```

**Multi-step (bail on error — default):**
```json
{
  "description": "Build then test",
  "steps": [
    { "commands": [{ "program": "pnpm", "args": ["build"] }] },
    { "commands": [{ "program": "pnpm", "args": ["test"] }] }
  ]
}
```

**Pipeline:**
```json
{
  "description": "Count TODOs in src",
  "steps": [{
    "commands": [
      { "program": "grep", "args": ["-r", "TODO", "src/"] },
      { "program": "wc", "args": ["-l"] }
    ]
  }]
}
```

**stdin (replaces heredocs):**
```json
{
  "description": "Run inline node script",
  "steps": [{ "commands": [{ "program": "node", "stdin": "console.log(process.version)" }] }]
}
```

**Redirect output:**
```json
{
  "description": "Save curl response to file",
  "steps": [{ "commands": [{ "program": "curl", "args": ["-s", "https://api.example.com/data"], "redirect": { "path": "/tmp/response.json" } }] }]
}
```

**Env vars:**
```json
{
  "description": "Run with NODE_ENV=production",
  "steps": [{ "commands": [{ "program": "node", "args": ["app.js"], "env": { "NODE_ENV": "production" } }] }]
}
```

**Working directory (supports `~` and `$VAR`):**
```json
{
  "description": "Build package in subdir",
  "steps": [{ "commands": [{ "program": "pnpm", "args": ["build"], "cwd": "~/project/packages/api" }] }]
}
```

**Merge stderr into stdout (`merge_stderr`):**
```json
{
  "description": "Capture all output together",
  "steps": [{ "commands": [{ "program": "pnpm", "args": ["build"], "merge_stderr": true }] }]
}
```

**Capture both streams then filter (replaces `cmd 2>&1 | tee file | grep ... | tail`):**
```json
{
  "description": "Run type-check, capture and filter output",
  "chaining": "sequential",
  "timeout": 300000,
  "steps": [
    {
      "commands": [{
        "program": "pnpm",
        "args": ["turbo", "type-check"],
        "cwd": "~/project",
        "env": { "NO_COLOR": "1", "FORCE_COLOR": "0" },
        "redirect": { "path": "/tmp/tc-clean.txt", "stream": "both" }
      }]
    },
    {
      "commands": [
        { "program": "grep", "args": ["-E", "error TS|Tasks:|successful|failed|FAILED", "/tmp/tc-clean.txt"] },
        { "program": "tail", "args": ["-60"] }
      ]
    }
  ]
}
```
Key points: `stream: "both"` captures stdout+stderr to file. Step 2 reads from the file (not piped from step 1 — piping only carries stdout). `chaining: "sequential"` ensures grep runs even when type-check exits non-zero.

**Background process:**
```json
{
  "description": "Start dev server",
  "background": true,
  "steps": [{ "commands": [{ "program": "pnpm", "args": ["dev"] }] }]
}
```

## Bash → Exec Translation

| Bash pattern | Exec equivalent |
|---|---|
| `git status` | `commands: [{ program: "git", args: ["status"] }]` |
| `pnpm build && pnpm test` | Two steps, `chaining: "bail_on_error"` (default) |
| `pnpm build; pnpm test` | Two steps, `chaining: "sequential"` |
| `grep -r TODO src/ \| wc -l` | One step with two commands in `commands[]` (pipeline) |
| `cat <<EOF \| node` | Single command with `stdin` field |
| `curl ... > /tmp/out.json` | Command with `redirect: { path: "/tmp/out.json" }` |
| `NODE_ENV=prod node app.js` | Command with `env: { "NODE_ENV": "prod" }` |
| `cd subdir && pnpm build` | Command with `cwd: "~/subdir"` (`~` and `$VAR` supported) |
| `command &` | Top-level `background: true` |
| `~/.claude/skills/foo/scripts/bar.sh` | `program: "~/.claude/skills/foo/scripts/bar.sh"` (`~` expanded in `program`) |
| `echo "text" > file` | Use the Write tool instead |
| `program: "/bin/bash", args: ["/path/script.sh"]` | `program: "/path/script.sh"` — call directly, no bash wrapper |
| `program: "sh", stdin: "cd /path\ncmd ..."` | Decompose: `program: "cmd"`, `cwd`, `env`, `steps[]`, `commands[]` |
| `echo '{"key":"val"}' \| ~/script.sh` | `program: "~/script.sh", stdin: "{\"key\":\"val\"}"` |
| `cmd 2>&1` | `merge_stderr: true` on the command |
| `${PIPESTATUS[0]}` | Not needed — exec reports each step's exit code separately |

**Chaining modes:**

| Mode | Behaviour |
|---|---|
| `bail_on_error` | Stop on first non-zero exit — default, equivalent to `&&` |
| `sequential` | Run all steps regardless of exit code, equivalent to `;` |
| `independent` | Run all steps, report each result separately |

## Blocked Operations

Built-in validation blocks these before execution:

- `rm`, `rmdir`, `mkfs`, `dd`, `shred` — destructive filesystem
- `xargs` — arbitrary piped execution
- `sed -i` / `sed --in-place` — in-place file modification (use Edit tool)
- `git rm` — file removal from index
- `git checkout` — use `git switch` for branch switching
- `git reset` — ask the Supreme Commander
- `git push -f` / `--force*` — force pushes (always banned)

## Gotchas

- **Expansion**: `~` and `$VAR` are expanded in `program` and `cwd`. They are NOT expanded in `args[]` — use absolute paths or let the program resolve them. Glob patterns (`*.ts`) are never expanded.
- **No `cd` persistence**: There is no shell session between steps. Use `cwd` per-command.
- **ENOENT = exit 127**: Program not found on `$PATH` returns exit code 127.
- **Pipeline stderr**: Only stdout is piped between pipeline commands. Each command's stderr is collected separately. Use `merge_stderr: true` on a command to combine stderr into stdout before piping, or use `redirect: { stream: "both" }` to capture both to a file.
- **No chaining syntax**: `&&`, `;`, `||`, `$()`, backticks — none of these work. Use `steps[]` with appropriate `chaining` mode.
