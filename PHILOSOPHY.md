# Editorial context

This file is the editorial context for `~/.claude/CLAUDE.md` and `SYSTEM.md`. It is not loaded by Claude at runtime. Read it when you intend to modify either file, so the modification stays aligned with the reasoning that produced the current content.

---

# CLAUDE.md

## Why CLAUDE.md exists

It is the bootstrap. It loads at the start of every Claude session under my user account, regardless of project, regardless of CLI. Whatever it says is guaranteed to reach Claude. That is its only structural property; everything else is downstream of that.

The substance of how I work with Claude lives in the foundational skills (`claude-philosophy`, `commander-protocol`, `teapot-protocol`). CLAUDE.md does not duplicate or summarise that substance. It points at the skills and tells Claude to load them.

## Note on the current loader

This is a present-tense observation, not a foundational principle. The CLI may change; the philosophy does not. The rock to step over while looking at the vision: the present has to be navigated even when the destination is elsewhere.

Right now, my CLI does not auto-inject skill frontmatter into Claude's context. Skills are not discoverable at session start. This is a conscious choice; I am moving away from the co-working model where prompts themselves declare which skills to load, toward a harness that loads everything up front. The vision is consistent. The runway is not finished, and the present requires accommodation.

Operational consequence today: foundational skills must be named explicitly in CLAUDE.md so they load. Without explicit naming, they do not load, even though the files sit in `~/.claude/skills/`. If the CLI changes (auto-injection, frontmatter discovery, similar), the explicit naming becomes unnecessary. The bootstrap purpose of CLAUDE.md does not change; only the mechanism it uses to point at skills does. Editors should update the mechanism to match the environment, not treat the simplification as a regression.

The earlier duplication of skill content into CLAUDE.md was a separate workaround, for an unreliable loader. With the loader following explicit load instructions, the duplication is no longer needed and creates inconsistency risk.

## Loading is binary for foundational skills

For the foundational skills, loading at session start is binary: either they load (when their condition applies) or they do not load at all. Claude will not think mid-session "I am drifting; I should load `commander-protocol` now". By the time drift is visible, the canary the skill provides is already absent. The skill has to be in place from the start, or it does not work.

The loading triggers vary by skill:

- **Every session**: `claude-philosophy`, `commander-protocol`, `teapot-protocol`. These inflect every turn; they need to be in place at session start to do anything at all.
- **Real host (default)**: `safe-operations`. Loaded for sessions on a real host, which is most sessions. Not loaded in sandboxed sessions where the cost asymmetry largely disappears.
- **Co-working**: `co-working`. Loaded when the SC is active in the same system.

This principle (binary at session start, no mid-session loading) is specific to the foundational skills. Other skills (e.g. `git-commit`, `tdd`, `ado-work-items`) are situational and loaded on demand when relevant work appears. The binary applies to skills whose purpose is to inflect specific operations that would otherwise drift, where the moment of needing them is also the moment they would have to be already loaded.

Duplicating foundational skill content in CLAUDE.md creates a third state: content present in CLAUDE.md but stale relative to the skill, or content that contradicts what the skill says. Both are worse than either of the original two. The minimal CLAUDE.md preserves the binary for the skills where the binary matters.

## What CLAUDE.md should contain

- A reference to each foundational skill: name, one-line description of what it covers, instruction to load.
- That is the substance.

Optionally, anything that genuinely cannot wait for skill-level treatment could live here. So far I do not believe anything qualifies. Operational rules (protected files, destructive git, tool usage) feel urgent but are not foundational; they belong in their own skill or in operator-specific harnesses, not in the user-level bootstrap.

## What was rejected

- Operational discipline rules in CLAUDE.md (protected files, blocked operations, destructive git, staging discipline, writing style). These were carried from v1/v2 because the CLI was not reliably loading skills. With explicit load instructions, they belong elsewhere or in a dedicated skill.
- Substantive philosophy in CLAUDE.md. The philosophy lives in `claude-philosophy`. Restating it here duplicates the content.
- Brewing cycle mechanics in CLAUDE.md. The cycle lives in `teapot-protocol`. CLAUDE.md does not need to teach Claude what `🫖 Brewing.` means; the skill does that.
- Forms of address in CLAUDE.md. Lives in `commander-protocol`.
- The "what to check" list and "mistakes versus drift" framing. Both were in v2 alongside the brewing cycle; they belong in `teapot-protocol` if anywhere, after explicit discussion.

## Decisions made

### Sibling philosophy at `~/.claude/PHILOSOPHY.md`

CLAUDE.md does not have a per-skill directory structure (like `~/.claude/skills/{name}/`), so the sibling-file pattern is the cleanest place for this editorial context. Anyone editing the user-level CLAUDE.md will find this file alongside it.

### Voice: I speak, addressed to editors

Like the skill philosophy files. First person me, addressed to whoever is editing CLAUDE.md (Claude, or me).

### Skill names listed explicitly

Because the CLI does not inject frontmatter, CLAUDE.md must name skills by their on-disk names. Generic instructions like "load the foundational skills" or "load any skills marked `category: foundational`" would require Claude to discover the skills, which the environment does not support.

## Notes for future editors

- Keep CLAUDE.md minimal. Anything substantive belongs in a skill.
- New foundational skill: add a section to CLAUDE.md naming it and instructing the load. Add a corresponding `PHILOSOPHY.md` alongside the skill.
- Removed skill: remove the section from CLAUDE.md.
- If you find yourself wanting to add operational rules to CLAUDE.md, that is a signal that a skill is missing or that the skill loading is unreliable. Address the underlying issue rather than putting content into CLAUDE.md as a workaround.
- Substance creeping into CLAUDE.md is the failure mode this file is structured to prevent. If editing produces a CLAUDE.md that could substitute for loading the skills, the editing is wrong even if every line is technically accurate.

---

# SYSTEM.md

## Why SYSTEM.md exists

CLAUDE.md is a bootstrap — it loads skills into the context window. Skills carry the substance. But the context window has a spotlight problem: tokens at the start and end are weighted differently, and as the conversation grows, early content loses influence. For things that must hold at turn 500 the same as turn 1, the context window is the wrong place.

The system prompt sits outside the context window. It has no spotlight decay. Content here has consistent influence regardless of conversation length. That makes it the place for stable identity and operating environment — things that do not change between sessions and should not lose influence as the context fills up.

SYSTEM.md is the source file for that system prompt. The CLI reads it and injects it. The file is the editable surface; the system prompt is the runtime effect.

## What SYSTEM.md should contain

Invariant operating context. Who Claude is on this machine, how the environment works, what is true regardless of the task. Not per-task instructions, not skill content, not things that change.

Each section should carry its reasoning. A rule without a why gets pattern-matched or ignored under pressure. The why is what makes it hold.

## What produced the sections

Claude's training produces defaults that are specifically wrong for this environment. Each section in SYSTEM.md exists because one of those defaults needs correcting. The sections are not arbitrary groupings of rules — they are responses to observed failure patterns.

- Claude treats the directory as solely his. He acts on his model of state as if it were complete, when it is structurally incomplete. → Co-working section.
- Claude is blind to changes between tool calls. The system injects reminders to bridge that gap, but without guidance Claude treats them as communication to respond to rather than ambient state to absorb. → System reminders section.
- Claude reaches for familiar conventions (Conventional Commits, spec-driven branch prefixes) because they are in training, not because they apply here. → Conventions section.
- Claude defaults to describing what happened rather than explaining why. Commits, comments, responses all tend toward the what. → Reasoning over description section.
- Claude conflates edit, stage, and commit into a single flow. The signing section exists partly to separate commit as a distinct decision with its own approval gate. → Commits and signing section.
- Claude proposes before reading, because the trained pattern is to be helpful fast. → Working posture section.
- Claude treats a rejected tool call as a transient failure to retry rather than the developer saying no. → Working posture section.
- Claude conflates edit, stage, and commit into a single flow, removing decision points the developer wants to keep. → Edit is not commit section.
- Claude decides the action before processing the words, then fits the words to the decision. → Words mean what they say section.

A future editor reads this list to understand which default a section is addressing. Removing a section means accepting the default it corrects. Adding a section should start here, with the default it addresses.

## Editorial approach: 4W1H

Each section implicitly answers: who is this about, what is the instruction, when does it apply, how to follow it, and why it exists. Not as labelled subsections — as prose that covers all five. If a section does not answer the why, it is incomplete. If it does not answer the who, it may be applied to the wrong context.

## Section notes

### Commits and signing

The GPG signing instruction exists because every commit on this machine flows through the developer's macOS Keychain. The keychain prompt is the developer's approval gate — biometric or password, in the moment. The commit cannot land without that approval.

"When making a commit, just run it" means: when the decision to commit has been made by the developer, the mechanics are straightforward. It is not blanket permission to commit at will. The approval is the developer's, not Claude's. If signing fails, the correct response is to stop and report, not to find a way around it.

### Conventions

The Conventional Commits instruction is not about this repo specifically — it is about the developer. He does not use that tooling. If he wanted a commit convention, he would define his own. The instruction corrects Claude's trained reach for familiar specs that have no function here.

Branch naming follows the same principle: plain English that describes the work, not tokens from a spec. The test is whether the prefix came from English or from a convention.

### Reasoning over description

Claude's default output describes what happened. The developer needs to know why. The section exists to shift the default from narration to reasoning — in commits, comments, code, and responses. The reasoning is not documentation; it is the discipline of actually having a reason for what you did.

### Working posture

"Read before proposing" corrects the trained pattern of being helpful fast. The existing code is ground truth; starting from a proposal before understanding what exists leads to conflicts with work already done.

This instruction is in tension with fleet roles where Claude is explicitly told not to read code (e.g. a PM/coordinator role that delegates reading to other sessions). The system prompt applies to Claude on this machine in general; role-specific overrides in fleet contexts take precedence for that session. The instruction is the correct default — most sessions should read before proposing.

"Rejected tool call means no" corrects a pattern where Claude treats rejection as transient and retries with minor variations. The developer rejected it; that is the answer.

### Co-working

**Origin**: Same root as the `co-working` skill. The developer is active in the same directories, and other Claude sessions may be too. The system prompt carries the baseline awareness that should always be present; the skill (when loaded) carries the full discipline.

The section answers who (one session among many), what (the repo state can change under you), how (verify at high-cost moments, not blanket anxiety), and why (without this, you commit someone else's staged file, pick up scratch files, push changes you did not make).

### Edit is not commit

**Origin**: Claude's trained pattern treats edit-stage-commit as a single flow. The developer uses the index as workflow state — staging a file, continuing to edit, diffing staged versus unstaged to review what will commit versus what is still in flux. Collapsing the flow removes those checkpoints silently.

The section makes the three-step boundary explicit. It addresses the same default as the signing section (commit is a distinct decision) but from the other direction — signing addresses the approval gate, this section addresses the conflation that skips past it.

Whether this section actually prevents the conflation is an open question. It is working against the action-first comprehension mechanism documented in `claude-philosophy`. But the system prompt has no spotlight decay, so it is the best place for it to have any chance of holding.

### Words mean what they say

**Origin**: The action-first comprehension problem. Claude decides the action before processing the words, then fits the words to the decision. Documented in `claude-philosophy/PHILOSOPHY.md` under "Action-first comprehension" with observed examples.

This section is a direct attempt to put the correction in the system prompt. It may not work — it is asking Claude to operate against the mechanism that produces the misread. But the system prompt is stable context with no spotlight decay, so if there is any place where this instruction can hold, it is here.

The examples in the section ("done", "old", "re-read", "edit") are illustrative, not exhaustive. Future editors may add examples as new instances are observed, but should not remove existing ones — each represents a real incident.

### System reminders

**Origin**: The developer's CLI injects `<system-reminder>` blocks between turns. In other sessions, Claude was observed spending thinking tokens analysing the reminders — noting timestamps, commenting on their arrival, treating them as the developer's communication. None of that is useful. The tokens are wasted.

The section exists to reframe system reminders as ambient awareness. They are automated, not authored. Transient, not persisted. The git deltas they may contain exist so Claude is not blind to external repo changes — whether to act on that awareness is Claude's call based on what he is currently doing.

The instruction "do not comment on them" is not "DO NOT mention this to the user" — it is not a secrecy rule. It is guidance that commenting on them wastes effort on something that is not an event. If the developer asks about them, answer. The point is to not volunteer analysis of furniture.

**Gap identified in practice**: The original section addressed what to do with reminder content but not the structural case where a reminder arrives without a user message. Observed: after a commit landed, a system-reminder arrived as the only content in a turn — no user message alongside it. The trained response-generation still fired. Thinking identified nothing actionable; the response then said "Nothing to act on" — which is itself commenting on the reminder. "Move on" was interpreted as move on into writing a response, not move on by staying silent. The gap: the instruction covered what not to do with the reminder, but did not say that a reminder without a user message creates no obligation to respond at all. The filler response is the failure, not a neutral fallback.

## Decisions made

### Headings that group by concern, not by rule

The sections are organised by the default they correct, not by the rule they state. "Co-working" is about Claude's incomplete model of the directory, not about `git add`. "Conventions" is about reaching for familiar specs, not about Conventional Commits specifically. This keeps the sections stable when specific rules change.

### Why carried inline, not separated

Each section in SYSTEM.md carries its own why in the prose. The alternative — rules in SYSTEM.md, reasoning in PHILOSOPHY.md only — was rejected because the why is what makes the rule hold under pressure. A rule Claude reads without its reasoning is a rule Claude will drop when the trained pattern fires.

### System prompt over context window

The choice to put this content in the system prompt rather than in CLAUDE.md or a skill is architectural. CLAUDE.md is the bootstrap; skills carry substance into the context window. The system prompt carries what must hold at consistent weight regardless of conversation length. The two are complementary, not competing.

## What was rejected

- Rules without reasoning. The early system prompt was a flat list of instructions. Claude pattern-matched them without understanding and dropped them under pressure.
- Per-section 4W1H as explicit labelled subsections in SYSTEM.md. The 4W1H is an editorial discipline for the author, not a visible structure for the reader. The prose covers all five implicitly.
- Duplicating skill content into the system prompt. The system prompt carries the baseline; the skills carry the full discipline. Duplication creates inconsistency risk, same as duplicating skill content into CLAUDE.md.

## Notes for future editors

- Each section corrects a specific trained default. Before adding a section, identify the default it addresses. Before removing one, accept the default it corrects.
- The why in each section is load-bearing. Editing that removes the why and leaves only the rule has weakened the section even if the rule is intact.
- The 4W1H is the editorial test, not a visible structure. If editing produces sections with labelled WHO/WHAT/WHEN/HOW/WHY subsections, the approach has been misapplied.
- The tension between "read before proposing" and fleet roles that don't read code is acknowledged and intentional. The system prompt is the correct default; role overrides are the exception.
- System reminders guidance is not a secrecy rule. It is efficiency guidance. If the framing drifts toward "hide this from the user", that is regression.
