---
name: dispatch
description: |
  WHAT: The dispatch process — default fresh cast, operator resume the one exception — and its mechanics: CLI flags, pane lifecycle, envelope templates, skill injection, and the scripts.
  WHY: Dispatch is transport, not decision — one documented mechanism keeps every cast launched the same way, instead of each router re-deriving flags and envelope shapes.
  WHEN: Loaded by the router role, whenever a cast is dispatched.
user-invocable: false
metadata:
  category: reference
---

# Dispatch

**Skill** (loaded by the `router` role). The dispatch process and its mechanics — CLI flags, pane lifecycle, envelope templates, skill injection, and the scripts in `scripts/`.

### The process

**Every dispatch is a new cast — a fresh CLI process, a fresh context. That is the default, always.**

The one exception is the operator at iteration >1 dispatched with `resume: true`: the running cast is re-triggered in place, because the operator's in-flight context is sometimes the point — a revise resumes the work in progress. That is the only recast that exists.

The supervisor has no exception. A supervisor is only ever a fresh cast — its value is fresh eyes, and a supervisor that re-judges with its own last verdict in context is not that. There is no recast supervisor: `cast-supervisor`'s config has no `resume` field, so one cannot be expressed. It does take a `template` at iteration >1 — the reason the iteration exists, riding in the fresh cast's envelope.

Three scripts carry the whole flow:

1. `scaffold-panes` — once, at mission start: creates the operator and supervisor panes. No cast.
2. `cast-operator` — every operator dispatch, keyed by `phase` and `iteration`.
3. `cast-supervisor` — every supervisor dispatch, keyed by `phase` and `iteration`. Always fresh.

### The workflow

The router does what is already decided, in this order. **Every dispatch is preceded by a confirm**: state the dispatch to the SC — script, phase, iteration, role, model, and where each value came from — and wait for the go-ahead. No dispatch fires unconfirmed. The confirmation is not approval of the mechanics; it is where a wrong lookup or a smuggled decision becomes visible before a cast is running instead of after.

Once, at mission start (the mission verified and committed, the worktree created — all upstream of dispatch):

1. `start-mission` — window identity.
2. `scaffold-panes` — both panes, no cast.

Per phase N:

3. **Resolve** — read phase N from the mission: role, model, effort, `## SKILLS`. Every config value is a lookup (see the table below); nothing is chosen here.
4. **Confirm** the dispatch with the SC.
5. `cast-operator` — iteration 1, always fresh.
6. The operator works, debriefs, sits idle. It is not killed — a later `resume: true` may need its context.
7. **Confirm**, then `cast-supervisor` — same phase, always fresh.
8. The supervisor records its verdict in `## Supervisor Verification`. The handler reads it — a claim, not a fact — forms its own judgement, and brings the decision to the SC.

What happens next is not a step 9. It is a fork on three independent judgements — the supervisor's verdict, the handler's acceptance, and the SC's veto — and the SC decides the route. The router routes.

Once, at mission end: `close-mission`.

### The paths

**Happy path** — the supervisor passes, the handler accepts, the SC does not object → the phase is complete. The next phase re-enters at step 3.

**Pass, handler accepts, the SC objects.** The objection routes one of two ways — the SC's pick:

- **Back to the supervisor.** The objection or updated criteria land in the mission file (content lives in the mission, never in the envelope), then a **fresh** `cast-supervisor` at its next iteration re-verifies against it. If that supervisor's verdict changes — the work no longer holds — *that* is what produces the operator's revise: a confirmed `cast-operator` at the operator's next iteration, `template: revise`, `resume` the SC's call.
- **Back to the operator.** The mission is updated, then a confirmed `cast-operator` at the operator's next iteration with `template: mission-updated`, `resume` the SC's call.

**Pass, handler rejects.** The handler brings the SC its rejection with its reasoning — it does not act on it. Same two routes, same decider.

After any operator iteration that runs, the invariant holds: a fresh `cast-supervisor` at its own next iteration (step 7), every time.

### Nothing in a dispatch is the router's decision

Every field in a dispatch config is a lookup from something already decided:

| Field | Decided where |
|---|---|
| `model`, `effort` | the mission's phase heading (`Model:`, `Effort:`) |
| `role`, `name` | the mission's phase (`Role:`) |
| `skills` | the foundational `Load:` lines in `~/.claude/CLAUDE.md`, plus the phase's `## SKILLS` |
| `phase`, `iteration` | where the mission actually stands |
| `missionFile`, `cwd`, `from` | the mission's location and the handler's identity |
| `template` | the event that occurred: a verdict landed (operator `revise`), a new operator iteration finished (supervisor `verify`), or the mission file changed (`mission-updated`, both) |
| `resume` | **the SC.** The one genuine decision in a dispatch config — never the router's |

If the router finds itself weighing anything, it has left transport and is holding a decision that belongs upstream: stop, take it to the handler, who takes it to the SC. The canonical failure: a handler recast a supervisor off its own judgement — a router that confirmed "I'm about to re-prompt the supervisor" would have been stopped at the sentence, because that dispatch does not exist.

### Worked example — one phase, two paths

Phase 2 of a mission: `Role: Maker`, `Model: Opus`, `## SKILLS: preflight`. Iterations count each actor's own casts within the phase.

Happy path:

1. Resolve: role `maker`, model `claude-opus-4-8` (phase heading), skills = foundational + `preflight` (`## SKILLS`), phase 2, operator iteration 1.
2. Confirm: "Dispatching Phase 2 Maker, iteration 1, fresh cast, Opus from the phase heading, skills foundational plus preflight. Go?"
3. `cast-operator` `{"phase": 2, "iteration": 1, "name": "Maker", "role": "maker", …}`.
4. The Maker debriefs and sits idle. Confirm, then `cast-supervisor` `{"phase": 2, "iteration": 1, "operatorRole": "maker", …}` — fresh.
5. The supervisor records a pass. The handler reads it, judges it holds, brings it to the SC. The SC accepts. Phase complete; phase 3 re-enters at Resolve.

Objection path (same phase; the SC objects to the pass):

6. The SC's objection lands in the mission file — updated criteria under the phase. Content in the mission, not in any envelope.
7. Confirm, then `cast-supervisor` `{"phase": 2, "iteration": 2, "template": "mission-updated", …}` — a fresh cast re-verifying against the changed mission; the first supervisor's context is gone, deliberately.
8. This supervisor's verdict does not hold the work. The handler brings it to the SC. The SC decides: iterate, and `resume: true` — the Maker's in-flight context is worth carrying.
9. Confirm, then `cast-operator` `{"phase": 2, "iteration": 2, "template": "revise", "resume": true, …}` — the revise template pasted into the running Maker.
10. The Maker debriefs iteration 2. Confirm, then a fresh `cast-supervisor` `{"phase": 2, "iteration": 3, "template": "verify", …}`. Pass; the handler accepts; the SC accepts. Phase complete.

At no point did the router choose anything: the objection, both routes, and `resume` were the SC's; the verdicts were the supervisor's; the acceptance was the handler's. The router resolved, confirmed, and ran scripts.

### CLI reference

The cast scripts (`cast-operator`, `cast-supervisor`) wrap `claude-sdk-cli` with these flags:

- `--file <path>` — attach a file as the cast's first message. No longer used by the cast scripts: the mission now rides inside `--prompt` as the `<mission>` element (a path).
- `--name <label>` — display label for the session, shown in the CLI status bar. Setting `--name` lets the Router put a chosen string there; if the Router reads the pane and sees a different name, the CLI isn't in the state he expected.
- `--model <model>` — model to use for this session. **Always specify.** The value is a family name — `sonnet`, `opus`, or `fable` — resolved to the family's current versioned identifier by the launch seam (`shared/pane/models.mjs`), so no dispatch remembers version strings; the defaults table lives in `squad-selection`. The CLI has a configured default; the scripts do not rely on it (defaults are unreliable in general — same principle as tmux's `-t`). The model comes from whatever directs the dispatch (mission file's `Model:` field, SC's instruction, or role convention).
- `--prompt <text>` — send an initial message at launch. The structured message (`<from>`, `<skills>`, `<message>`, `<mission>`) goes here.
- `--no-resume` — start fresh; skip auto-resume of the last session in the cwd. The CLI auto-resumes by default; `--no-resume` overrides that, which is what the Router wants when launching a new cast.
- `--config <json>` — override config with a JSON object. The cast scripts use it to set thinking effort (`{"thinking":{"effort":"high"}}`) when a phase names an `Effort:` value; omitted when it doesn't, leaving the CLI's configured default. Valid efforts: `low`, `medium`, `high`, `xhigh`, `max`.

Process control:

- `SIGINT` exits the CLI. The cast scripts send Ctrl-C to the pane before launching a fresh cast.

There are no standalone recast scripts. The operator's `resume: true` path lives inside `cast-operator`: a pre-built template message pasted into the running CLI and submitted — no caller-authored prose; mission content stays in the mission file.

### Pane lifecycle

A mission has one operator pane and one supervisor pane in the Handler's window, both created **once**, by `scaffold-panes`, at mission start — before any cast — and reused for the rest of the mission. The operator pane hosts every operator cast across phases (Maker, Investigator, Courier, …); the supervisor pane hosts every supervisor cast.

The layout: Handler full-width at the top, operator and supervisor side-by-side below. The operator pane is split off the Handler (vertical, full-width below Handler); the supervisor pane is split off the operator pane (horizontal, supervisor on the right).

**Each pane is created with the user's shell as its primary process.** `claude-sdk-cli` runs as a child of that shell. The shell survives Ctrl-C, so the pane survives Ctrl-C too — the cast scripts Ctrl-C the running CLI (shell stays) and launch a fresh CLI in the same pane. The pane's cwd, `@role` tag, and window properties persist; only the CLI process changes.

An operator cast remains alive after its debrief — idle, waiting for the supervisor's verdict — because a revise verdict may resume it (`cast-operator`, `resume: true`), and killing it at debrief would lose the running context that resume exists for. The supervisor cast is never held for reuse: every verification is a fresh cast, and the previous supervisor's context dies with it, deliberately.

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

#### scaffold-panes

Create the mission's panes, once, at mission start — no cast is launched. Idempotent: an existing `@role` pane is kept, not duplicated.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/scaffold-panes.mjs", "stdin": "{\"cwd\":\"<worktree>\"}"}
]}
```

- `cwd` — the operator worktree; the operator pane's shell starts here. Without the right cwd, the cast loads the wrong `.claude/CLAUDE.md` harness and operates against the wrong directory.
- The supervisor pane gets a **scratch directory** as its cwd: `claude-sdk-cli` auto-loads the launch directory's `CLAUDE.md`, and in the worktree that made the supervisor inherit the operator's project harness. A neutral cwd loads only the global `~/.claude/CLAUDE.md`; the supervisor reaches the repo via the envelope.

Stdout: `{"operatorPane":"%X","supervisorPane":"%Y"}`.

#### cast-operator

Dispatch the operator for a phase iteration via [`cast-operator`](scripts/cast-operator.mjs). Requires `phase` and `iteration`; the schema (config.mjs) enforces the process:

- `iteration: 1` — always a fresh cast. `template` and `resume` are **forbidden** (strict schema; exit 2 if present).
- `iteration: >1` — `template` and `resume` are both **required**.
  - `resume: false` — Ctrl-C, fresh cast; the template rides in the new envelope so the cast knows why it exists.
  - `resume: true` — no new process; the template is pasted into the running cast and submitted. The one recast that exists.

Templates (fixed; the Handler picks one, never writes prose):

- `revise` — the supervisor recorded a verdict in `## Supervisor Verification`; re-read it and the mission and address it in a new iteration.
- `mission-updated` — the mission file changed; re-read it.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/cast-operator.mjs", "stdin": "{\"from\":\"<from>\",\"model\":\"<model>\",\"missionFile\":\"<missionFile>\",\"name\":\"<name>\",\"phase\":<phase>,\"iteration\":<iteration>,\"skills\":[<skills>]}"}
]}
```

JSON config:

- `from` — sender identity (e.g. `the claude-cli-cve-fix Handler`)
- `model` — the family name: `sonnet`, `opus`, or `fable` (sonnet is the operator default)
- `missionFile` — absolute path to the mission file (emitted as `<mission>`, read by the cast)
- `name` — phase role (Maker, Apostle, Investigator, …); passed as `--name`
- `phase`, `iteration` — required; the envelope is a fixed template built from them
- `template`, `resume` — iteration >1 only, both required there; forbidden at iteration 1
- `skills` — **mandatory**, even when empty (`[]`). The foundational set plus any per-phase extras (see Skills below). An absent field is a broken dispatch and exits 2 — it is how casts have launched with no skills at all.
- `role` — operator sub-role (`maker`, `builder`, …) resolved to `roles/<role>/ROLE.md`. **Required wherever a launch happens** — iteration 1, and iteration >1 with `resume: false` — because the role's system prompt and craft skills come from it; a launch without it is a cast with no identity. Optional only with `resume: true`, where nothing launches.
- `effort` — optional thinking effort from the phase's `Effort:` field (`low|medium|high|xhigh|max`); omitted → CLI default

Configs are validated against zod schemas (`scripts/config.mjs`): a missing mandatory field or an unknown key exits 2 before anything launches. This applies to all three scripts.

Envelope message for a fresh cast (built by the script):

~~~
You are the Phase <N> <role-name>, iteration <M>.
~~~

At iteration >1 the template text follows it. For `resume: true` the running cast instead receives:

~~~
You are now iteration <M>.

<template text>
~~~

Stdout: the operator pane id. Exits 1 if no operator pane exists — run `scaffold-panes` first.

#### cast-supervisor

Dispatch the supervisor for a phase iteration via [`cast-supervisor`](scripts/cast-supervisor.mjs). **Always a fresh cast, every iteration, no exceptions.** The schema has no `resume` field, so a recast supervisor is unrepresentable; the previous supervisor's context dies with its CLI, deliberately.

The template rule, enforced by the schema:

- `iteration: 1` — no `template`; the first verification is self-evident. Forbidden (exit 2 if present).
- `iteration: >1` — `template` required; it names why this iteration exists and rides in the fresh cast's envelope:
  - `verify` — the operator completed a new iteration; verify it and record a new iteration block under `## Supervisor Verification`.
  - `mission-updated` — the mission changed (e.g. the SC's objection or updated criteria); re-verify against it.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/cast-supervisor.mjs", "stdin": "{\"from\":\"<from>\",\"model\":\"<model>\",\"missionFile\":\"<missionFile>\",\"phase\":<phase>,\"iteration\":<iteration>,\"skills\":[<skills>],\"operatorRole\":\"<operatorRole>\"}"}
]}
```

JSON config:

- `from` — sender identity
- `model` — the family name; supervisors run `sonnet`: invest in the one doing the work, not the one catching it — the supervisor is a safety net, not the tightrope
- `missionFile` — the operator's mission file (emitted as `<mission>`; the supervisor reviews against it)
- `phase`, `iteration` — required; which verification this cast performs
- `template` — iteration >1 only, required there; forbidden at iteration 1
- `operatorRole` — **mandatory**. The role the operator was dispatched with (`maker`, `apostle`, …), passed through so the supervisor's cast unions the same role skills the operator got — the supervisor judges skill application, so it must hold the same set it judges by.
- `skills` — **mandatory**, even when empty (`[]`). Same list the operator's dispatch carried: foundational plus the phase's extras. A supervisor without the foundational set judges on trained defaults.
- `effort` — optional

Envelope message (built by the script):

~~~
You are the Phase <N> Supervisor, iteration <M>.

You are only ever a cast: supervisors are never re-prompted. Every verification is a fresh cast with fresh eyes, and this context is the whole of yours.

The mission file the operator worked from is in `<mission>`.
~~~

At iteration >1 the template text follows it.

`launchCli` appends the operator-debrief pointer and target-repo note automatically (resolved from the live panes), so the supervisor knows where to capture the debrief:

~~~
Operator's debrief is in tmux pane <op-pane>. Read with `tmux capture-pane -t <op-pane> -p -S -500`.
~~~

Stdout: the supervisor pane id. Exits 1 if no supervisor pane exists — run `scaffold-panes` first.

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

The cast scripts (`cast-operator`, `cast-supervisor`) require a `skills` array in their JSON config. Every dispatch has skills — at minimum the foundational set.

#### What to pass

The role's own craft skills ride the identity and are added automatically — you do not pass them. `launchCli` unions `roleSkills(role)` (from `roles/<role>/ROLE.md`) and `actorSkills(actor)` (from the ACTOR.md) into every cast's set, so a Maker gets its `tdd`, `tech-debt`, `typescript-standards`, `technical-writing`, `sc-commit-writing`, `sc-ghostwriting` whether or not the handler remembers them. Hand-listing them was the gap that shipped a Maker with none of its craft.

The `skills` array you pass is additive on top of that — two sources:

**a) Foundational skills** — from the operator's `~/.claude/CLAUDE.md`. These are the `Load:` lines that every session is told to load. Read them from the file at dispatch time; they can change.

**b) Per-phase extras** — from the mission file. Each phase's `## SKILLS` section lists any skill a specific phase needs *beyond the role's own set* (a one-off like `detect-convention` or `preflight`). Read the section for the phase being dispatched. When a phase needs nothing beyond the role, this is empty.

Both are combined into the `skills` array. The role and actor skills are added by `launchCli` on top; you never repeat them.

#### Example

Phase 1 of mission 1089 (infra-pipeline-bicepparam), dispatched as a Maker (`role: "maker"`).

Foundational (from `~/.claude/CLAUDE.md`):

`claude-philosophy`, `specification-discipline`, `transparency`, `commander-protocol`, `teapot-protocol`, `executive-communication`, `clear-communication`, `system-glossary`, `safe-operations`

Per-phase extras (from the mission's `## SKILLS` section — only what the Maker role does not already carry):

`detect-convention`, `preflight`

The `skills` array in the JSON config:

```json
"skills": ["claude-philosophy", "specification-discipline", "transparency", "commander-protocol", "teapot-protocol", "executive-communication", "clear-communication", "system-glossary", "safe-operations", "detect-convention", "preflight"]
```

The Maker's own `typescript-standards`, `tdd`, `technical-writing`, `sc-commit-writing`, `sc-ghostwriting`, `tech-debt` are added automatically from `roles/maker/ROLE.md` — absent from the array above by design.

### Router scripts

All scripts live in [`scripts/`](scripts/). Each reads `TMUX_PANE` from the env (the Handler's own pane id) and scopes its tmux work to the Handler's window. Target panes are resolved by `@role` filter within the window.

Common exit codes:

- `0` — success
- `1` — operational failure (no matching role pane, CLI didn't launch, nothing to close, etc.)
- `2` — bad input (missing `TMUX_PANE`, missing arg, missing JSON field)

Errors go to stderr; useful output (pane ids, classifications) goes to stdout.

The scaffold and cast scripts are covered in the Envelopes section above. The rest:

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

Other `@state` values are set automatically by the cast scripts:

- `op-pending` — set by `cast-operator`
- `sv-pending` — set by `cast-supervisor`

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
- **`pane.mjs`** — shared Node module exporting `paneProcessName(paneId)` and `waitForClaudeSdkCli(paneId, opts)`. Imported by the cast scripts for post-launch verification.

After launching a fresh `claude-sdk-cli`, each cast script calls `waitForClaudeSdkCli`, which polls the pane's foreground process every 250ms and waits for `claude-sdk-cli` to be stable for 1 second within a 10-second timeout. If the user's shell becomes stable for 1 second instead (CLI exited or never started), or the pane is gone, or the timeout fires, the launch script exits 1 with a diagnostic.
