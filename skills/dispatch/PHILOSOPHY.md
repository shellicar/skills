# References: editorial context

This file sits alongside `ROLE.md` (the Router role doc, formerly named `dispatch.md`). If you are about to edit `ROLE.md`, read this first. The reference docs carry the operational content — commands, envelopes, role definitions, markers. This file carries why they are shaped the way they are, what was rejected, and what is currently known to be off.

It is not loaded at runtime. It exists for editors.

## Provenance & status

Moved from `fleet/agents/handler/router/` on 2026-06-27, as part of the actor/role/skill refactor (`~/.claude/taxonomy-refactor.md`). The router doc split into a **role** and a **skill**: the dispatch how-to + scripts → `skills/dispatch/`; the disposition → `roles/router/`.

**Note for the next editor:** this is the *full* original philosophy, kept whole. The dispatch-mechanics editorial (the tmux testing-trace, defaults-unreliable, command-verification) belongs here; the router-role principles (over-instructing exclusion, mission-vs-envelope, mechanical-decisions) belong with `roles/router/PHILOSOPHY.md`. Splitting this two ways is a known de-dup follow-up, not done in this move.

## Why ROLE.md exists

The Router is the current realisation of the Mailroom pillar (see `PILLARS.md`). Without a Router role doc, Claude orchestrating other Claude sessions defaults to instructing them — adding "you need to …" on top of casts the fleet has already set up via their role files, briefs, and loaded skills. The Router role exists to exclude that mode: he creates sessions, delivers temporal context, observes outcomes, and reads. The infrastructure does the instructing.

The doc has to be specific because the defaults pull hard the other way. A general "be careful about over-instructing" does not hold up under dispatch-mode work; concrete envelope templates and a constrained command reference do.

## Origin

The previous version of this doc (then named `dispatch.md`, before the reorg) was committee-authored across multiple Claude sessions. It accumulated invented reasoning (`$TMUX_PANE` not expanding as the basis for a two-call pattern, pane_id "drift" theories, "double Ctrl-C" timing concerns, fleet-layout conventions that weren't real), borrowed git terminology where no git was involved ("Commit the work, move to the next phase"), and prescriptive workflow content that nobody had actually tested.

The current `ROLE.md` was rebuilt from scratch in an FM session. The discipline: every claim grounded in either empirical verification (tmux commands run and behaviour-checked in this environment), an explicit direction from me, or a document I had endorsed (PILLARS, STRATEGY). Anything that couldn't be grounded that way didn't land. Several iterations removed Claude-invented content and added back only what survived testing.

## Key insights that shaped this doc

### Mission vs envelope

Two distinct kinds of content reach a cast: the mission (the substance, what the cast is for) and the envelope (enough context to execute against the mission, no more). The mission carries the work; the envelope tells the cast what to do or where to look. Substance lives in the file; signal lives in the envelope.

Keeping the two separate has two effects. First, it prevents the "Router silently edits the mission to add iteration markers" failure mode. Second, and pragmatically more important: it keeps the SC's per-dispatch review surface small. Substance in the envelope means the SC re-vets the same content every time it's relayed; substance in the file means it's vetted once at the source and the envelope vet stays trivial.

This is why the "supervisor verdict to act on" recast template was removed: the supervisor writes verdicts into the mission file per their role, so the recast trigger is "prompt file updated" — the cast re-reads, the SC vet is "did the supervisor write to the right section," not "is the entire verdict accurately quoted in this envelope."

### Mechanical decisions only

When Claude acts as the Router, his decisions are mechanical: create or destroy sessions, deliver missions, detect events. He does not decide what to send. He does not modify the mission. He does not decide whether to recast or start fresh. Those decisions belong to other roles.

This isn't stylistic. The Router-mediated chain only works if the routing layer doesn't introduce content variance. A faithful relay keeps each cast's input clean and each cast's output intact for the next decision-maker.

### Plan format scope

The plan format applies to Router operations (shared state): scripts to run, files to commit, panes affected, messages to send. It does not apply to internal Handler work: testament writing, working drafts, notes the Handler keeps for themselves.

The bound matters because the words "any Router operation" can be read broadly. Without the explicit scope, a Handler in the mission-completion workflow can bundle testament writing into a plan and present it for SC review. The testament is the Handler's own work, by them for them; presenting it inherits the wrong vetting protocol.

This insight is paired with the testament-section change in `.claude/CLAUDE.md`, which names directly that the testament is not for review.

### Testing discipline for the command reference

Commands in the Tmux commands section land only after we've behaviour-verified them in this environment. "Tested" means *verified the behaviour*, not just "ran without error." Visual behaviour I cannot verify from inside the system; either the SC verifies visually, or the test uses format strings (`pane_top`, `pane_left`, etc.) to verify geometry from the data layer.

Several rounds of removal-then-re-add happened: a command would get removed for being unverified, then a behaviour test was designed and run, then the command was re-added only if it passed. The current set is what survived.

### Defaults are unreliable

tmux command defaults follow the session's last-active window — not the calling pane and not the client's focus. The doc therefore requires explicit `-t` on every command. This finding overturned earlier guidance ("for things about my window/session, tmux defaults work") that had been verified by coincidence (focus happened to be aligned during the original test).

## What testing produced

The `ROLE.md` commands and markers rest on tests run during the rebuild. The working document that captured the detailed test records (`tmux-test.md` in the FM repo) gets deleted after the arc — this section is the surviving editorial trace.

### Findings that overturned earlier assumptions

These are the empirical results that changed what the doc says. Future editors changing related sections should know the prior claims that got disproven.

- **tmux command defaults follow the session's last-active window**, not the calling pane and not the client's focus. Tested by running queries (`display-message`, `list-panes`) from inside `%823` while changing focus. Within-session focus shifts moved defaults; cross-session focus shifts did not. The doc therefore requires explicit `-t` on every tmux command. The earlier guidance "for things about my window/session, tmux defaults work" was true by coincidence in the original test (focus happened to be aligned) and is wrong in general.

- **`pane_id` is stable across layout changes.** Tested by snapshotting `list-panes -a` before and after layout reshuffling (panes added, layout rebalanced). `pane_id` values preserved; `pane_index` renumbered. The historical "pane_id drift" claim conflated the two, or observed pane-kill-and-recreate (which legitimately produces a new id, but is a different operation).

- **Token tallies are per-process.** A freshly-launched CLI process has no tally line until it completes a turn — true whether it's a fresh `--no-resume` launch OR an auto-resumed session with prior conversation in scrollback. Tested by launching one of each side by side and capturing both immediately. "No tally line = fresh CLI" is wrong as a marker; the visible area above the input box is the actual distinguisher between fresh and resumed.

- **In-flight vs idle CLI state is reliably read from the bottom content block.** Tested by capturing the CLI mid-response and after completion. Mid-flight: bottom is `── ℹ️  query ──` (or `── 💭 thinking ──`, `── 🔧 tools ──`, `── 📝 response ──` as the response streams). Idle: bottom is `── prompt ──` + `💬` input box. This validated the state-classification section.

- **A single `Ctrl-C` exits `claude-sdk-cli` immediately.** Tested by sending `C-c` to a running CLI and capturing the result — shell prompt back within a second. The old "double Ctrl-C / timing issue" framing was Claude pattern-matching from claude code's CLI; doesn't apply here.

- **`Enter` in the CLI's input box is a newline, not a submit.** Tested by sending text + Enter — text appeared in the input box with a trailing newline, was not submitted. Submit requires CSI `13;5u`. This is why the doc documents both `send-keys` patterns separately and shows the CSI submit explicitly.

- **Buffer names containing `%` are accepted by tmux.** Tested by loading and pasting from buffers named `%901`, `%902`. Means the target pane_id can be used directly as the buffer name with no transformation — the basis for the per-pane-id buffer naming pattern.

- **`split-window -v` creates a pane below the target; `-h` creates one beside.** Verified via geometry format strings (`pane_top`, `pane_left`, `pane_width`, `pane_height`) before and after each split, not by visual confirmation. The orientation claims in the doc are therefore grounded in measurable position changes, not in assumed tmux conventions.

### Commands verified end-to-end

Every command in the Tmux commands section was run with literal pane ids substituted for `<pane_id>` placeholders, and its behaviour confirmed via subsequent capture or list-panes. The set:

- `printenv TMUX_PANE`, `tmux list-panes` (server-wide and `-t`-scoped), `tmux set-option @role`, `tmux rename-window`, `tmux capture-pane` (with and without `-S`, same-window / cross-window / self), `tmux send-keys` (with Enter, with `-l`, with `C-c`, with CSI 13;5u), `tmux load-buffer` + `tmux paste-buffer` (with per-pane-id buffer names), `tmux split-window` (`-v` and `-h`), `tmux kill-pane`.
- `claude-sdk-cli --no-resume` launch and auto-resume comparison.

The operator/supervisor layout workflow (split + tag, split + tag) was run end-to-end as a unit, with state verified after each step.

### Known gaps in what we tested

- **Concurrent operations against the same target pane.** Per-target buffer naming prevents collisions across different targets; same-target concurrent operations can still collide. Mitigation would require per-operation unique names (timestamp, random suffix); not implemented.
- **CLI behaviour under `--name` collision** (two casts launched with the same `--name` value). Display-only flag; collision behaviour presumably "both panes show the same label" but not verified.
- **Multi-`--file` semantics.** Not available during the testing arc. When the SDK feature lands, the supervisor envelope's `--file` interpretation will likely simplify (currently attaches the operator's mission only; multi-file could attach the supervisor role doc + mission together).
- **Recast envelope behaviour end-to-end.** The recast envelope shapes are documented (prompt-updated, supervisor-verdict-relay, SC-correction-verbatim) but never round-trip-tested with an actual operator cast acting on each.

## Decisions made

- **Who/What/Why/How/When structure.** Borrowed from the skill genre. Forces explicit answers to all five questions and prevents the doc from being all-HOW with no grounding.
- **Plan format with two lists (Actions / Need from you).** Variance reduction — the SC reviews plans in the same shape every dispatch. The structured shape is intentional.
- **Per-pane-id buffer naming for paste-buffer.** Buffer name = target pane_id. Avoids cross-target collisions when multiple Router operations target different panes. Tested with `%`-prefixed buffer names; tmux accepts them.
- **Recast envelopes are short and trigger-shaped.** The mission is already loaded in the active cast; the envelope carries only the temporal trigger — why this turn is happening. Trigger examples documented per kind (prompt updated, supervisor verdict, SC correction).
- **"PM" terminology removed.** Per the shellicar pm-audit, "PM" terminology pulls bureaucratic patterns. Replaced with "Handler" where the role of the prompt-writer needs to be named.
- **No prescriptive workflows beyond what's been verified.** "Workflows" — sequences combining commands with conditional logic — are explicitly held back. The doc says "workflows that combine them require testing before they land here."
- **State classification is empirical markers, not prescriptive scenarios.** The old doc had pages of "if footer shows X, you're in scenario N, do action M." Replaced with the markers we verified (`── prompt ──` + `💬` at bottom = idle; anything else = in-flight). The Router decides from the marker; the doc doesn't prescribe a workflow on top.

## What was rejected

- **Token-tally line as "fresh CLI" signal.** Empirically proven wrong: auto-resumed sessions show the same footer (no tally line) until the new process completes a turn. The fresh-vs-resumed distinguisher is the visible area above the input box, not the footer.
- **Embedding supervisor role content inside the envelope.** An earlier attempt inlined the full supervisor role/session content into the supervisor cast-start envelope. Rejected — the content stays in a file; the envelope points to the path the supervisor reads. Keeps the envelope short and lets the supervisor role doc evolve independently of `ROLE.md`. (The role and session content were originally split into two files — `supervisor-role.md` for philosophy and `supervisor-session.md` for the operational template — later merged into a single `supervisor-role.md`.)
- **Embedding verdict text in the supervisor-verdict recast envelope.** An earlier template embedded the full verdict text verbatim in the envelope. Removed for the same review-surface reason: the supervisor writes verdicts into the mission file per their role, so the recast trigger reduces to "prompt file updated" and the verdict stays in the file. Mechanically the embed worked, but the SC had to re-vet the verdict text every relay instead of once at the source.
- **"Show, don't summarise" as a stated rule in the Plan format.** Echoed Claude-committee phrasing. The "verbatim" + "in full" wording already carries the rule; the extra emphasis was decoration.
- **`split-window` orientation claims documented before testing.** "`-v` produces a horizontal divider" was a tmux-convention assertion. The doc removed the orientation lines until they were verified by running the commands and reading geometry format strings.
- **A fixed buffer name like "dispatch" for paste-buffer.** Would collide between concurrent Router operations. Replaced with per-target pane_id.
- **"Defaults work for things about my own window."** Empirically disproven; defaults follow the session's last-active window. Doc requires explicit `-t` on every tmux command.
- **Cross-references to a working test document.** During the rewrite, an FM-side `tmux-test.md` was used to record what was being verified. References to it from `ROLE.md` were dropped because that working doc gets cleaned up after the testing arc; cross-references would become dead.
- **The deferred-pending-multi-`--file` approach.** Briefly tried to defer the supervisor envelope's `--file` interpretation until multi-file landed. Rejected — current single-file pattern (operator's mission attached; supervisor role/session paths in envelope) is the resolution now. Updates when multi-`--file` arrives are a future cleanup, not a current blocker.

## What this doc does NOT cover

- **The mission content.** What the operator's brief contains, what the supervisor's role doc says — those are authored elsewhere and live in their own files. `ROLE.md` documents how the Router carries them, not what they say.
- **The decision of which envelope to use.** That's part of the Router's logic per dispatch, not a workflow this doc prescribes. The Router applies the templates to the situation.
- **What to do when a verdict comes back.** Outside the Router's mandate. The verdict goes to other roles to interpret and route on.
- **Skill discovery or skill loading mechanics.** The supervisor envelope references "load your `~/.claude/CLAUDE.md`" but the loading mechanics live in skills' own docs and in the SDK's harness behaviour.
- **The Handler role (the historical actor formerly called PM).** That role's redefinition is its own work; this doc only documents the Router slice of what the Handler used to do.

## Notes for future editors

- The "tested" bar for tmux commands is empirical-behaviour verification, not just "the command ran." Adding a command requires testing its behaviour in this environment first.
- The Mission/Envelope distinction is load-bearing. Conflating the two leads back to "Router silently edits mission" failures.
- The mechanical-decisions-only constraint on the Router is what makes the role usable in a chain. Loosening it (giving the Router judgment about content) reintroduces the variance the role exists to prevent.
- "PM" terminology pulls trained patterns; use "Handler" or role-specific names instead.
- When adding examples or templates, ground each one in either a specific SC direction or empirical verification. Examples added "for completeness" are exactly the Claude-committee shape the rewrite removed.
- The doc currently lives at `ROLE.md` in this directory. If new role docs land beside it (other fleet roles in sibling directories) and develop their own editorial reasoning, this PHILOSOPHY.md expands to cover them; if any one grows large enough to warrant its own file, split rather than bloat.
