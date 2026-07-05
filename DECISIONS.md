# Decisions

The dated ledger of what the SC signed off, with the reason. Append-only: entries are added, never rewritten — this file is the provenance record (*when*, and by whose word), where the PHILOSOPHY layer carries the reasoning in prose. When a decision lands, it gets its entry here and the affected PHILOSOPHY.md is updated in the same change.

Only what the SC explicitly signed off in conversation belongs here. Written elsewhere is not sign-off.

## 2026-07-05

### blueprint.md is a mission artefact — referenced, never reproduced

A blueprint is the SC's pinned spec or walkthrough (a model diagram, an element table, an exact function), produced with the handler in the intent conversation — never by an operator phase; what an Engineer produces is class design, part of the means. It lands as `blueprint.md` in the mission directory and the mission *references* the file. Reason: a spec was dropped from a `mission.md` in transcription — a copy can be dropped, a reference cannot; the file is the vehicle.

### The interlocutor re-engages mid-mission

Execution can surface a question the intent never settled; the interlocutor returns, it is settled with the SC into `intent.md`, and execution resumes. Small calls ride the executor's report to the SC directly; what re-engages the interlocutor is a question about what the mission is *for*. Reason: not everything can be drawn out up front — some boundaries only show against concrete work (AppLayout's plan was blocked four times on exactly this).

### Equip and prepare, in the scribe — decided means said or agreed

Precision has an axis: exact about the *what* (goal, objectives, blueprint), silent about the *how* (the operator's means). Decided means the SC said it or agreed to it — correct, verified, or obvious does not qualify; even a true thing the SC never agreed to is not what he wanted. Thinking, questioning, and proposing are welcome upstream; recommendations are not, because they take the thinking that makes the decision the SC's own.

### handover defined; testament and handover go together

The testament carries the learning into the knowledge base; the handover exists only for session continuity — not a summary, but enough for the successor to reorient: where things stand, what is in flight, what to search the memory tool for.

### Changing the glossary requires a repo-wide word search first

An existing use with a different meaning either gets rewritten to the glossary's meaning, or the word was the wrong one to pick. Reason: `blueprint` was defined while the Engineer role already used the word for class design, and the term was muddied from birth.

### The editorial layer: PHILOSOPHY at scope, plus this ledger

Understanding-nature content lives in the PHILOSOPHY layer at the scope it governs (unit / `skills/` / root); decisions-nature content lives here, dated and append-only. Session write-outs stay temporary: they drain into these two homes and die. Reason: the composition layer works, but its editorial layer had not been kept current — the reasoning lived in uncommitted write-outs and session memories.

### Area of influence restored, as influence.md

Every mission declares its area of influence — the surfaces and files it expects to touch — a claim, not a final list. Not in the intent (the conversation often cannot know repo surfaces); the scribe declares it, the executor refines it as the work concretes. Its own artefact, `influence.md`, because the mission is a container: the planner's scheduler reads every live area for collisions without loading the missions, and the executor updates it without churning a dispatched `mission.md`. Reason: the concept was adopted in practice (June 2026, born from the AppLayout/core-di-lite merge collisions) but lived only in mission instances, never in the material — so the redesign lost it without deciding to. The scheduler's "touch-set" is rewritten to the SC's word.

## 2026-07-06

### Scout and Investigator are distinguished by the kind of question, not by output routing

Scout is codebase discovery: you want to discover the codebase. Investigator is detective work: you have questions you want answered. The old "feeds you / feeds the next phase / separate mission" framing is dropped wherever the live material carried it — the routing was plumbing, never the identity, and it misled a handler into treating Investigator-vs-Apostle as a one-mission-or-two fork. Deprecated skills keep the old text: old skills are left as they are, not maintained.

### The Postmaster is a new operator role — the release phase is not a second Courier

Publishing was split out of the Courier. The Courier delivers the work into review (the PR, git ground); the Postmaster makes the merged work public (tags, releases, publish workflows, the registry — no working-tree changes). One word carrying both jobs is how a release phase wobbled between Maker and Courier across the June releases. The name: the mailroom analogy is kept deliberately — a semi-opaque name funds only the true half-guess ("sends the work out") and leaves the dangerous specifics to the role text, and when Claude guesses anyway the guess is visible instead of camouflaged as plausible trained behaviour. Plain "Publisher" was considered and passed over for exactly that camouflage risk.

### The identity frontmatter drives; skills.mjs parses it

`shared/pane/skills.mjs` now reads each actor's and role's `skills:` (and the handler's `roles:`) from the `ACTOR.md`/`ROLE.md` frontmatter, via the `yaml` dependency — the hand-kept mirror is gone, and each identity file is the single source for what it loads. The handler launch scripts share one role list (`HANDLER_ROLES`), and `launch-handler` no longer accepts a `skills` input from the Planner — a launch cannot carry a skill list that drifts from the material. Only the foundational set stays hard-coded, mirroring `~/.claude/CLAUDE.md`'s `Load:` lines, which have no frontmatter to read. Role order settled: `… scribe, executor, router`.
