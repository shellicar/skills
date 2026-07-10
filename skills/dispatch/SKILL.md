---
name: dispatch
description: |
  WHAT: The dispatch tool layer — default fresh cast, operator resume the one exception — the scripts, their configs, pane lifecycle, the envelope shape, and skill injection.
  WHY: Dispatch is transport, not decision — one documented mechanism keeps every cast launched the same way, instead of each router re-deriving flags and envelope shapes.
  WHEN: Loaded by the router role, whenever a cast is dispatched.
user-invocable: false
metadata:
  category: reference
---

# Dispatch

**Skill** (loaded by the `router` role). The dispatch tool layer: the scripts in `scripts/`, their configs, pane lifecycle, the envelope shape, and skill injection. The phase loop these tools serve is the `mission-execution` skill's process; dispatch is transport.

### The process

**Every dispatch is a new cast — a fresh CLI process, a fresh context. That is the default, always.**

The one exception is the operator at iteration >1 dispatched with `resume: true`: the running cast is re-triggered in place, because the operator's in-flight context is sometimes the point — a revise resumes the work in progress. That is the only recast that exists.

The supervisor has no exception. A supervisor is only ever a fresh cast — its value is fresh eyes, and a supervisor that re-judges with its own last verdict in context is not that. There is no recast supervisor: `cast-supervisor`'s config has no `resume` field, so one cannot be expressed. It does take a `template` at iteration >1 — the reason the iteration exists, riding in the fresh cast's envelope.

Three scripts carry the whole flow:

1. `scaffold-panes` — once, at mission start: creates the operator and supervisor panes. No cast.
2. `cast-operator` — every operator dispatch, keyed by `phase` and `iteration`.
3. `cast-supervisor` — every supervisor dispatch, keyed by `phase` and `iteration`. Always fresh.

**Every dispatch is preceded by a confirm**: state the dispatch to the SC — script, phase, iteration, role, model, and where each value came from — and wait for the go-ahead. No dispatch fires unconfirmed. The confirmation is not approval of the mechanics; it is where a wrong lookup or a smuggled decision becomes visible before a cast is running instead of after.

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

- **`<from>`** — the sender, and the *author* (the Handler), not the delivery mechanism. Never "the Router": the Router only routes, like a postman. It is how the cast knows who authored the message, so it can't mistake Router-orchestrated text for direct SC direction. When the message quotes another voice — the SC, verbatim — that voice nests its own `<from>`/`<message>` rather than a fenced block.
- **`<skills>`** — capabilities, first because they're fundamental (see Skills).
- **`<message>`** — the signal: what changed, where the cast sits in the workflow, what to act on. Built by the script from a fixed template, keyed on the phase number, role name, and iteration — the Handler never writes message prose. The scripts' own source is the reference for the template texts.
- **`<mission>`** — the substance, last because it's most important. A path; the cast reads the live file (single source of truth, fully traceable).

If a piece of content is the substance the cast needs to act on, it belongs in the mission file. If it's the signal that tells the cast to act, it belongs in the message. Substance in the message works mechanically but creates review burden — the SC re-vets the substance every time it's relayed, instead of once at the source.

### The scripts

All scripts live in [`scripts/`](scripts/). Each reads `TMUX_PANE` from the env (the Handler's own pane id) and scopes its tmux work to the Handler's window. Target panes are resolved by `@role` filter within the window.

Configs are validated against zod schemas (`scripts/config.mjs`): a missing mandatory field or an unknown key exits 2 before anything launches.

Common exit codes:

- `0` — success
- `1` — operational failure (no matching role pane, CLI didn't launch, nothing to close, etc.)
- `2` — bad input (missing `TMUX_PANE`, missing arg, missing or unknown JSON field)

Errors go to stderr; useful output (pane ids, classifications) goes to stdout.

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

Dispatch the operator for a phase iteration via [`cast-operator`](scripts/cast-operator.mjs). Requires `phase` and `iteration`; the schema enforces the process:

- `iteration: 1` — always a fresh cast. `template` and `resume` are **forbidden** (exit 2 if present).
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
- `model` — the family name: `sonnet`, `opus`, or `fable` (sonnet is the operator default), resolved to the family's current versioned identifier by the launch seam (`shared/pane/models.mjs`) — no dispatch remembers version strings; the defaults table lives in `squad-selection`
- `missionFile` — absolute path to the mission file (emitted as `<mission>`, read by the cast)
- `name` — phase role (Maker, Apostle, Investigator, …); passed as `--name`
- `phase`, `iteration` — required; the envelope is a fixed template built from them
- `template`, `resume` — iteration >1 only, both required there; forbidden at iteration 1
- `skills` — **mandatory**, even when empty (`[]`). The foundational set plus any per-phase extras (see Skills below). An absent field is a broken dispatch and exits 2 — it is how casts have launched with no skills at all.
- `role` — operator sub-role (`maker`, `builder`, …) resolved to `roles/<role>/ROLE.md`. **Required wherever a launch happens** — iteration 1, and iteration >1 with `resume: false` — because the role's system prompt and craft skills come from it; a launch without it is a cast with no identity. Optional only with `resume: true`, where nothing launches.
- `effort` — optional thinking effort from the phase's `Effort:` field (`low|medium|high|xhigh|max`); omitted → CLI default

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

The envelope tells the supervisor it is only ever a cast, and `launchCli` appends the operator-debrief pointer and target-repo note automatically (resolved from the live panes), so the supervisor knows where to capture the debrief.

Stdout: the supervisor pane id. Exits 1 if no supervisor pane exists — run `scaffold-panes` first.

### Skills

Skills are injected into each cast at dispatch time via the envelope's `<skills>` element. The operator's `~/.claude/CLAUDE.md` tells them to load skills, but operators have skipped them. Injection removes that option — the skills arrive in the prompt content whether the operator loads them or not.

Each skill in the `skills` array is read from `~/.claude/skills/<name>/SKILL.md` at dispatch time. If any skill file is missing, the script exits with code 2 — a missing skill is a broken dispatch, not a degraded one.

**What to pass.** The role's own craft skills ride the identity and are added automatically — you do not pass them. `launchCli` unions `roleSkills(role)` (from `roles/<role>/ROLE.md`) and `actorSkills(actor)` (from the ACTOR.md) into every cast's set. Hand-listing them was the gap that shipped a Maker with none of its craft.

The `skills` array you pass is additive on top of that — two sources:

- **Foundational skills** — the `Load:` lines in the operator's `~/.claude/CLAUDE.md`. Read them from the file at dispatch time; they can change.
- **Per-phase extras** — the phase's `## SKILLS` section in the mission: any skill a specific phase needs *beyond the role's own set* (a one-off like `detect-convention` or `preflight`). When a phase needs nothing beyond the role, this is empty.

#### start-mission

Set the Handler window's mission identity (`@title` and `@colour`). Called once at mission start, after the Handler pane exists, before any operator or supervisor cast.

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/start-mission.mjs", "stdin": "{\"title\":\"<title>\",\"colour\":\"<colour>\"}"}
]}
```

**Window naming.** Session = the fleet (e.g. `claude-fleet-eagers`). Window = the mission. The `@title` value is for the SC's tmux status bar — the Router finds panes by id, not by name.

Format: `<project>-<mission>` — e.g. `easyquote-cves`, `customer-payments-smsid`, `easypass-loose-schema`. The status bar combines the `@title` with the active pane's `@role` tag: `<title>:<role>`. Keep the combined length around 40 characters; abbreviate past that.

**Colour.** British spelling (`@color` is not read). The project → colour mapping lives in the fleet's `CLAUDE.md`.

`@state` values are set automatically by the cast scripts:

- `op-pending` — set by `cast-operator`
- `sv-pending` — set by `cast-supervisor`

The handler states (`post-mortem-pending`, `handler-running`) are the `mission-execution` skill's, set by its `set-handler-status` script at that process's seams — not dispatch's to set.

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

#### query-window

List panes in the Handler's window (debug/inspection; not normally part of a mission flow).

```json
{"commands": [
  {"program": "~/repos/shellicar/skills/skills/dispatch/scripts/query-window.mjs"}
]}
```

Stdout: one line per pane with `pane_id`, `pid`, `role`, `window` (name), `cmd`, `cwd`.

#### Helpers (internal)

- **`pane-process-name`** — get the comm of a pane's foreground process. Takes `{"paneId": "<pane_id>"}` via stdin. Returns `claude-sdk-cli` when pane_pid itself is that, rather than descending into its node-worker child. Used internally by the cast-launch verification; exposed as a CLI for debugging.
- **`pane.mjs`** — shared Node module exporting `paneProcessName(paneId)` and `waitForClaudeSdkCli(paneId, opts)`. Imported by the cast scripts for post-launch verification.

After launching a fresh `claude-sdk-cli`, each cast script calls `waitForClaudeSdkCli`, which polls the pane's foreground process every 250ms and waits for `claude-sdk-cli` to be stable for 1 second within a 10-second timeout. If the user's shell becomes stable for 1 second instead (CLI exited or never started), or the pane is gone, or the timeout fires, the launch script exits 1 with a diagnostic.
