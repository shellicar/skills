---
name: dispatch
description: |
  WHAT: The mechanical how-to of dispatching casts — CLI flags, pane lifecycle, envelope templates, skill injection, and the scripts.
  WHY: Dispatch is transport, not decision — one documented mechanism keeps every cast launched the same way, instead of each router re-deriving flags and envelope shapes.
  WHEN: Loaded by the router role, whenever a cast is dispatched.
user-invocable: false
metadata:
  category: reference
---

# Dispatch

**Skill** (loaded by the `router` role). The mechanical how-to of dispatching casts — CLI flags, pane lifecycle, envelope templates, skill injection, and the scripts in `scripts/`.

### CLI reference

The cast-launch scripts (`new-operator-cast`, `new-supervisor-cast`, `next-phase-cast`) wrap `claude-sdk-cli` with these flags:

- `--file <path>` — attach a file as the cast's first message. No longer used by the cast-launch scripts: the mission now rides inside `--prompt` as the `<mission>` element (a path).
- `--name <label>` — display label for the session, shown in the CLI status bar. Setting `--name` lets the Router put a chosen string there; if the Router reads the pane and sees a different name, the CLI isn't in the state he expected.
- `--model <model>` — model to use for this session. **Always specify.** Valid values: `claude-opus-4-8`, `claude-sonnet-4-6`. The CLI has a configured default; the scripts do not rely on it (defaults are unreliable in general — same principle as tmux's `-t`). The model comes from whatever directs the dispatch (mission file's `Model:` field, SC's instruction, or role convention).
- `--prompt <text>` — send an initial message at launch. The structured message (`<from>`, `<skills>`, `<message>`, `<mission>`) goes here.
- `--no-resume` — start fresh; skip auto-resume of the last session in the cwd. The CLI auto-resumes by default; `--no-resume` overrides that, which is what the Router wants when launching a new cast.
- `--config <json>` — override config with a JSON object. The cast-launch scripts use it to set thinking effort (`{"thinking":{"effort":"high"}}`) when a phase names an `Effort:` value; omitted when it doesn't, leaving the CLI's configured default. Valid efforts: `low`, `medium`, `high`, `xhigh`, `max`.

Process control:

- `SIGINT` exits the CLI. `next-phase-cast` sends Ctrl-C to the pane before relaunching.

Recast (re-prompt an active cast): `recast-operator` / `recast-supervisor` paste a pre-built template message into the pane and submit. No `--file`, no `--prompt`, and no caller-authored prose — the Handler picks a template; mission content stays in the mission file.

### Pane lifecycle

A mission has one operator pane and one supervisor pane in the Handler's window. Each pane is created once — the operator pane at the first operator phase, the supervisor pane at the first supervisor review — and reused for the rest of the mission. The operator pane is used for every operator role across phases (Maker, Investigator, Courier, …). The supervisor pane is used for every supervisor review.

The layout: Handler full-width at the top, operator and supervisor side-by-side below. The operator pane is split off the Handler (vertical, full-width below Handler); the supervisor pane is split off the operator pane (horizontal, supervisor on the right).

**Each pane is created with the user's shell as its primary process.** `claude-sdk-cli` runs as a child of that shell. The shell survives Ctrl-C, so the pane survives Ctrl-C too — `next-phase-cast` Ctrl-Cs the running CLI (shell stays) and launches a fresh CLI in the same pane.

The pane's cwd (worktree), `@role` tag, and window properties persist across phases. Only the `claude-sdk-cli` process changes.

A cast remains alive after its debrief — idle, waiting for the supervisor's verdict. The cast cannot be terminated until the phase is formally approved (supervisor verdict = pass), because a block or revise verdict triggers a recast: the same active cast is re-prompted with the supervisor's feedback. Killing the cast at debrief loses the running context that the recast would resume.

Only after formal approval does `next-phase-cast` exit the current CLI (Ctrl-C) and relaunch with the new phase's parameters in the same pane.

### Envelopes

Each dispatch reaches a cast as one structured message with four top-level elements, built by `buildPrompt` in `pane.mjs`:

```
<from>
the … Handler
</from>
<skills>
<skill name="…">…</skill>
</skills>
<message>
…the temporal instruction…
</message>
<mission>
/abs/path/to/mission.md
</mission>
```

- **`<from>`** — the sender, and the *author* (the Handler), not the delivery mechanism. Never "the Router": the Router only routes, like a postman. Handler-supplied. Quoted voices nest their own `<from>` (see the recast templates).
- **`<skills>`** — capabilities, first because they're fundamental (see Skills).
- **`<message>`** — the signal: what changed, where the cast sits in the workflow, what to act on. Transient, mechanical — placeholders filled from dispatch state, not a decision about the work. The templates below are this element.
- **`<mission>`** — the substance, last because it's most important. A path; the cast reads the live file (single source of truth, fully traceable).

If a piece of content is the substance the cast needs to act on, it belongs in the mission file. If it's the signal that tells the cast to act, it belongs in the message. Substance in the message works mechanically but creates review burden — the SC re-vets the substance every time it's relayed, instead of once at the source.

The message is mechanical content — placeholders filled from the dispatch state — not a decision about what the work should be.

`<from>` is how the cast knows who authored the message, so it can't mistake Router-orchestrated text for direct SC direction. It states the sender positively (the Handler), replacing the old negative `[Message from the Router, not the SC.]` marker. When the message quotes another voice — the SC, verbatim — that voice nests its own `<from>`/`<message>` rather than a fenced block (see the recast templates).

The `<message>` element is built by the script from a fixed template, keyed on the phase number, role name, and iteration the Handler passes in — the Handler no longer writes message prose. The scripts add `<from>`, `<skills>`, and `<mission>`. The template text each script produces is shown below for reference; placeholders in angle brackets are filled in at dispatch time.

#### New operator cast

Launch a fresh operator cast via [`new-operator-cast`](scripts/new-operator-cast.mjs). The cast must run from the worktree — the script passes `-c <cwd>` to split-window, which sets the new pane's cwd. Without the right cwd, the cast loads the wrong `.claude/CLAUDE.md` harness and operates against the wrong directory.

Invoke:

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/new-operator-cast.mjs", "stdin": "{\"from\":\"<from>\",\"cwd\":\"<cwd>\",\"model\":\"<model>\",\"missionFile\":\"<missionFile>\",\"name\":\"<name>\",\"phase\":<phase>}"}
]}
```

JSON config:

- `from` — sender identity (e.g. `the claude-cli-cve-fix Handler`)
- `cwd` — worktree path
- `model` — `claude-sonnet-4-6` or `claude-opus-4-8`
- `missionFile` — absolute path to the mission file (emitted as `<mission>`, read by the cast)
- `name` — phase role (Maker, Apostle, Investigator, …); passed as `--name`
- `effort` — optional thinking effort from the phase's `Effort:` field (`low|medium|high|xhigh|max`); omitted → CLI default
- `phase` — phase number; the envelope is a fixed template, so the Handler passes the number, not message prose
- `iteration` — optional iteration within the phase (defaults to 1)
- `role` — optional operator sub-role (`maker`, `builder`, …) resolved to `roles/<role>/ROLE.md`

Envelope message (built by the script from `phase`, `name`, and `iteration`; shown for reference):

~~~
You are the Phase <N> <role-name>, iteration <M>.
~~~

Placeholders: `<N>` phase number, `<M>` iteration within the phase, `<role-name>` matches the `name` field.

Worked example — phase 1 Maker on the easyquote-cves mission. The envelope the script produces:

~~~
You are the Phase 1 Maker, iteration 1.
~~~

Serialised into the Exec call:

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/new-operator-cast.mjs", "stdin": "{\"from\":\"the easyquote-cves Handler\",\"cwd\":\"/Users/stephen/repos/eagers/easyquote--cves\",\"model\":\"claude-sonnet-4-6\",\"missionFile\":\"/Users/stephen/repos/fleet/claude-fleet-eagers/projects/easyquote/missions/easyquote-cves/mission.md\",\"name\":\"Maker\",\"phase\":1,\"iteration\":1}"}
]}
```

The script creates the operator pane below the Handler, configures `@role=operator` and `@state=op-pending`, launches `claude-sdk-cli`, and verifies it reaches a stable running state before returning. Returns the new pane id on stdout.

#### New supervisor cast

Launch a fresh supervisor cast via [`new-supervisor-cast`](scripts/new-supervisor-cast.mjs). The script resolves the operator pane (by `@role=operator` in this window) and splits the supervisor pane beside it (horizontal split, supervisor on the right). The supervisor must run from the same worktree.

Invoke:

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/new-supervisor-cast.mjs", "stdin": "{\"from\":\"<from>\",\"cwd\":\"<cwd>\",\"model\":\"<model>\",\"missionFile\":\"<missionFile>\",\"phase\":<phase>}"}
]}
```

JSON config:

- `from` — sender identity (e.g. `the claude-cli-cve-fix Handler`)
- `cwd` — worktree (operator's worktree)
- `model` — typically Opus (`claude-opus-4-8`) for supervisors
- `missionFile` — the operator's mission file (emitted as `<mission>`; the supervisor reviews against it)
- `phase` — phase number; the envelope is a fixed template. The supervisor cast takes no `name` or `message` — the script builds the supervisor envelope itself.

Envelope message (built by the script):

~~~
You are the Phase <N> Supervisor.

First, load your `~/.claude/CLAUDE.md` and the foundational skills it names. Your supervisor role is already composed into this cast's system prompt.

The mission file the operator worked from is in `<mission>`.

Target repo: <target-repo>
~~~

The script appends an operator-pane footer automatically before delivery:

~~~
Operator's debrief is in tmux pane <op-pane>. Read with `tmux capture-pane -t <op-pane> -p -S -500`.
~~~

The Handler doesn't have to know the operator pane id — the script resolves it via `@role` and adds the read instruction so the supervisor knows where to capture.

Returns the new supervisor pane id on stdout.

#### Next-phase cast

When the current phase is approved and the next phase begins, launch a fresh cast in the same pane via [`next-phase-cast`](scripts/next-phase-cast.mjs). The script Ctrl-Cs the current CLI (shell stays alive), updates `@state`, launches the new `claude-sdk-cli`, and verifies it stabilises.

Invoke:

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/next-phase-cast.mjs", "stdin": "{\"from\":\"<from>\",\"actor\":\"<actor>\",\"model\":\"<model>\",\"missionFile\":\"<missionFile>\",\"name\":\"<name>\",\"phase\":<phase>,\"iteration\":<iteration>}"}
]}
```

JSON config:

- `actor` — `operator` or `supervisor` (which pane to reuse, resolved by `@role`)
- `phase` — phase number; the envelope is a fixed template
- `from`, `model`, `missionFile`, `name` — same as new-operator-cast (`name` is `supervisor` for a supervisor cast)
- `iteration`, `role`, `effort` — optional; same as new-operator-cast

Returns the target pane id (same as the existing pane) on stdout.

#### Re-prompt an active cast (recast)

Two scripts re-trigger an active cast in place: [`recast-operator`](scripts/recast-operator.mjs) and [`recast-supervisor`](scripts/recast-supervisor.mjs). Each resolves its pane by `@role`, sets the window `@state` (`op-pending` / `sv-pending`) so the status bar shows who is active, then pastes-and-submits an envelope.

The message is execution context only — *why* the cast is being re-prompted, plus any mechanical pointer it needs — and is selected from a fixed template set, never written as prose. Mission content stays in the mission file, the single source of truth. Two reasons: anything sent in the envelope is not captured in the mission, and fixed, small templates keep dispatch predictable.

**`recast-operator`** — pick a `template`:

- `mission-updated` — the mission file changed; re-read it.
- `revise` — the supervisor recorded a verdict in `## Supervisor Verification`; re-read it and the mission and address it in a new iteration.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/recast-operator.mjs", "stdin": "{\"from\":\"<from>\",\"template\":\"mission-updated\"}"}
]}
```

**`recast-supervisor`** — pick a `template`:

- `verify` — the operator finished a new iteration. Rebuilds the operator-pane footer (the `tmux capture-pane` pointer, resolved via `getOperatorPane`, as `new-supervisor-cast` sends on first launch) so the supervisor knows where to read the debrief, then verifies and records a new iteration verdict. Without it the supervisor has no signal the operator finished and sits idle.
- `mission-updated` — the mission file changed; re-read it.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/recast-supervisor.mjs", "stdin": "{\"from\":\"<from>\",\"template\":\"verify\"}"}
]}
```


### Skills

Skills are injected into each cast at dispatch time via `--prompt`. The operator's `~/.claude/CLAUDE.md` tells them to load skills, but operators have skipped them. Injection removes that option — the skills arrive in the prompt content whether the operator loads them or not.

#### Mechanics

`buildPrompt({ from, message, skills, missionPath })` in `pane.mjs` combines the four elements into the `--prompt` value. When a `skills` array is passed:

1. Each skill is read from `~/.claude/skills/<name>/SKILL.md`.
2. If any skill file is missing, the script exits with code 2 (hard failure — a missing skill is a broken dispatch, not a degraded one).
3. The prompt becomes:

```xml
<from>
...sender...
</from>
<skills>
<skill name="skill-name">
...file content...
</skill>
</skills>
<message>
...message text...
</message>
<mission>
...mission file path...
</mission>
```

The cast-launch scripts (`new-operator-cast`, `new-supervisor-cast`, `next-phase-cast`) require a `skills` array in their JSON config. Every dispatch has skills — at minimum the foundational set.

#### What to pass

Two sources, both required:

**a) Foundational skills** — from the operator's `~/.claude/CLAUDE.md`. These are the `Load:` lines that every session is told to load. Read them from the file at dispatch time; they can change.

**b) Per-phase skills** — from the mission file. Each phase has a `## SKILLS` section listing the skills specific to that phase's work. Read the section for the phase being dispatched.

Both sets are combined into a single `skills` array. Foundational + phase-specific, every dispatch.

#### Example

Phase 1 of mission 1089 (infra-pipeline-bicepparam).

Foundational (from `~/.claude/CLAUDE.md`):

`claude-philosophy`, `specification-discipline`, `transparency`, `commander-protocol`, `teapot-protocol`, `executive-communication`, `safe-operations`

Phase 1 skills (from the mission's `## SKILLS` section):

`typescript-standards`, `tdd`, `detect-convention`, `technical-writing`, `sc-commit-writing`, `sc-ghostwriting`, `tech-debt`

Plus `preflight` (from the phase's Preflight section).

The `skills` array in the JSON config:

```json
"skills": ["claude-philosophy", "specification-discipline", "transparency", "commander-protocol", "teapot-protocol", "executive-communication", "safe-operations", "typescript-standards", "tdd", "detect-convention", "technical-writing", "sc-commit-writing", "sc-ghostwriting", "tech-debt", "preflight"]
```

### Router scripts

All scripts live in [`scripts/`](scripts/). Each reads `TMUX_PANE` from the env (the Handler's own pane id) and scopes its tmux work to the Handler's window. Target panes are resolved by `@role` filter within the window.

Common exit codes:

- `0` — success
- `1` — operational failure (no matching role pane, CLI didn't launch, nothing to close, etc.)
- `2` — bad input (missing `TMUX_PANE`, missing arg, missing JSON field)

Errors go to stderr; useful output (pane ids, classifications) goes to stdout.

The cast-launch scripts and recast are covered in the Envelopes section above. The rest:

#### start-mission

Set the Handler window's mission identity (`@title` and `@colour`). Called once at mission start, after the Handler pane exists, before any operator or supervisor cast.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/start-mission.mjs", "stdin": "{\"title\":\"<title>\",\"colour\":\"<colour>\"}"}
]}
```

**Window naming.** Session = the fleet (e.g. `claude-fleet-eagers`). Window = the mission. The `@title` value is for the SC's tmux status bar — the Router finds panes by id, not by name.

Format: `<project>-<mission>`

- `<project>` — the project/system the mission belongs to (e.g. `easyquote`, `customer-payments`, `easypass`)
- `<mission>` — short topic for the mission (e.g. `cves`, `smsid`, `uploads`)

Examples: `easyquote-cves`, `customer-payments-smsid`, `easypass-loose-schema`.

The status bar combines the `@title` with the active pane's `@role` tag: `<title>:<role>`. Keep the combined length around 40 characters. If a project or mission name pushes the combined string past ~40, abbreviate.

**Colour.** British spelling (`@color` is not read). The project → colour mapping lives in the fleet's `CLAUDE.md`.

#### set-pm-status

Set `@state` on the Handler's window. Defaults to `pm-running`. Accepts an optional `status` override via JSON stdin.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/set-pm-status.mjs", "stdin": "{}"}
]}
```

With override:

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/set-pm-status.mjs", "stdin": "{\"status\":\"post-mortem-pending\"}"}
]}
```

Other `@state` values are set automatically by the cast-launch scripts:

- `op-pending` — set by `new-operator-cast` and by `next-phase-cast` (role=operator)
- `sv-pending` — set by `new-supervisor-cast` and by `next-phase-cast` (role=supervisor)

#### read-pane-state

Capture a pane and classify.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/read-pane-state.mjs", "stdin": "{\"role\":\"<role>\"}"}
]}
```

Stdout (JSON):

```
{"pane":"%XXXX","role":"<role>","activity":"idle|in-flight","origin":"fresh|resumed"}
```

Classifications:

- `activity: idle` — bottom of capture shows `── prompt ──` + `💬` (cast ready for input)
- `activity: in-flight` — bottom shows query/thinking/tools/response (cast working)
- `origin: fresh` — no prior-conversation markers visible
- `origin: resumed` — prior conversation visible (system-reminder or `Human:`/`Assistant:` markers)

#### close-role

Kill a single pane by `@role`.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/close-role.mjs", "stdin": "{\"role\":\"<role>\"}"}
]}
```

Exits 1 if no pane with that role in this window.

#### close-mission

Kill the operator and supervisor panes in the Handler's window (end-of-mission teardown).

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/close-mission.mjs"}
]}
```

Exits 1 if neither pane is present (caller probably called at the wrong time; worth surfacing).

#### query-window

List panes in the Handler's window (debug/inspection; not normally part of a mission flow).

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/query-window.mjs"}
]}
```

Stdout: one line per pane with `pane_id`, `pid`, `role`, `window` (name), `cmd`, `cwd`.

#### Helpers (internal)

- **`pane-process-name`** — get the comm of a pane's foreground process. Takes `{"paneId": "<pane_id>"}` via stdin. Mirrors `pane-name.sh` in dotfiles, with one adjustment: returns `claude-sdk-cli` when pane_pid itself is that, rather than descending into its node-worker child. Used internally by the cast-launch verification; exposed as a CLI for debugging.
- **`pane.mjs`** — shared Node module exporting `paneProcessName(paneId)` and `waitForClaudeSdkCli(paneId, opts)`. Imported by `new-operator-cast`, `new-supervisor-cast`, `next-phase-cast` for post-launch verification.

After launching `claude-sdk-cli`, each cast-launch script calls `waitForClaudeSdkCli`, which polls the pane's foreground process every 250ms and waits for `claude-sdk-cli` to be stable for 1 second within a 10-second timeout. If the user's shell becomes stable for 1 second instead (CLI exited or never started), or the pane is gone, or the timeout fires, the launch script exits 1 with a diagnostic.
