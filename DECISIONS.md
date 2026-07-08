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

### The Apostle is a Maker who doesn't write code — rewritten off the designer framing

The role was rewritten around the SC's frame: same job and discipline as the Maker, but the change lands in a plan file in one write after many reads — that cheapness, plus the SC catching bad code before it lands, is the whole value. Design was never the role's: if the SC wanted design he'd cast an Engineer. Two rules made explicit: (1) the only permitted deferral to the Maker is code that needs the compiler's feedback to get right (difficult/complex types and generics) — "hard" is not an exit, and every deferral is declared in the plan; (2) on a re-prompt, approved iterations join the upstream decisions — the re-prompt names what may change and everything else is frozen. Reason: an Apostle re-prompted for rigour redesigned settled work (killed `toolInputKeyedBy`); the old role bounded only the first pass and its "Code as standard" section funded the designer self-image.

### Apostle refinement: review-earlier, and iterations are the review cycle

Two refinements to the rewrite above, same day. The first value is not a quality gate ("catch bad code") but timing: the SC reviews the code and makes changes earlier rather than later, when a change costs one re-prompt. And iterations — which are common — are the review cycle: a re-prompt is a review comment, answered like code review; unasked rework makes accepted parts unreviewed again and forces a re-read, destroying the cheapness the role exists for.

### Role skills ride the identity — the dispatch path loads them, not the handler

`launchCli` now unions `roleSkills(role)` (from `roles/<role>/ROLE.md`) alongside the `actorSkills(actor)` it already added, so a dispatched cast gets its role's craft skills automatically — a Maker arrives with `tdd`, `tech-debt`, `typescript-standards`, `technical-writing`, `sc-commit-writing`, `sc-ghostwriting` whether or not the handler lists them. The handler's `skills` array becomes purely additive: foundational plus any per-phase extras the mission's `## SKILLS` section names beyond the role's own set. Reason: a Maker was dispatched with none of its craft — the mission's `## SKILLS` section was the only source, which left it to the handler, who missed it. Role skills are identity, not a hand-assembled list; the same way actor skills already rode the identity, role skills now do too. The declarations already lived in the ROLE.md frontmatter — only the loader was not reading them.

### Mode markers become emojis; a switch shows both ends

Mode state is now declared with an emoji rather than words: `💭` conversation, `⚡` execution (the plan rides on the execution marker: `⚡ [plan]. Not: [exclusions]`). Staying in a mode is the bare glyph; a switch names both ends as a pair, `from→to` (`💭→⚡`, `⚡→💭`), so the transition reads itself and the enter/continue distinction survives. The first turn of a session is the bare glyph for the mode it opens in, since there is no prior mode to pair with. Reason: an emoji is faster to scan than two words and primes generation the same way the teapot marker does; the from→to pair keeps the transition legible without a wordy label. Framing: the teapot markers are the envelope around the whole response (opening and closing), and the mode marker sits inside it. That ordering is spelled out as a small section in both teapot-protocol and claude-philosophy, each from its own side.

### The skills repo refers to nothing in the fleet repo

The material must be self-contained: a skill or identity file pointing casts at fleet-repo scripts or references is a broken reference, not an instruction. Settled while auditing the worktrees skill — it named `fleet/scripts/dispatch-worktree.mjs`, and the question "should they be using that script?" answered itself. Landed in one sweep: `dispatch-worktree.mjs` migrated into the worktrees skill (its two copy functions folded into one — files intentionally gitignored and needed get carried, because a worktree clones the repo, not the directory); `rebase-worktrees.mjs` migrated into mission-integration (now resolving its target fleet from the run directory, since its own path no longer says which fleet); `starter-CLAUDE.md` into project-memory's templates; prompt-template's dead `references/prompt-authoring.md` pointers repointed at the skill; the handler and executor rewordings so the fleet *data* repo's root `CLAUDE.md` (conventions + open items — a legitimate data home, verified live) is not mistaken for material. The fleet copies get deleted as each migration lands. Still pointing outward deliberately: `new-project-setup`, until it is built as a skill.

## 2026-07-08

### The verification commit: verification done = commit, everything

When mission verification passes, the executor commits **everything** in the handler repo, immediately — the verification commit. It is a checkpoint, not a changes-commit: it pins the state the mission was verified in, so later changes diff against the verified baseline. Not gated on the SC's review or anything else — verification done = commit, end of story. Reason: handlers kept objecting ("only my changes should be committed") by applying the shared-repo staging discipline where it does not belong; the material now carries the reasoning so it stops being re-derived. In `mission-verification` and the handler ACTOR.

### The scribe is a separate session, and mission writing says so

The scribe left the handler's default role set (commit 844b9e1); the handler ACTOR's "Writing a mission" now reflects it — the scribe is a dispatched session via start-scribe, never the session that drew the intent or the one that verifies. The writer/verifier separation is structural, the operator/supervisor pattern at the mission-writing layer.

### The scribe never writes a role's stance; only the SC countermands a role

Four rules, landed together after a scribe pasted Investigator language ("you map the problem; you do not design the solution") into an Apostle phase without ever opening `apostle.md` — the cast obeyed it and produced a plan with none of the code, costing the SC hours. (1) The scribe never writes role-stance prose — the block owns the stance; the scribe fills mission-level content into its slots (`prompt-authoring` > The blocks own the stance). (2) Provenance's Fleet source explicitly includes the role's `ROLE.md` and phase block — a stance sentence traces there or to the SC, or it is invented (`mission-grounding`). (3) The scribe must actually open the block and `ROLE.md` of every role in the squad before composing — a listing is not a read. (4) Verification fails any instruction that runs counter to the phase's role unless it traces to the SC's words in `intent.md` — an override of a role can only come from the SC (`mission-verification`, check one).

### Cast-launch configs are zod schemas; `skills` is mandatory; the supervisor mirrors the operator's role

The three cast-launch scripts (`new-operator-cast`, `new-supervisor-cast`, `next-phase-cast`) now validate their stdin config against zod schemas (`skills/dispatch/scripts/config.mjs`, zod added as a dev dependency): a missing mandatory field or an unknown key exits 2 before anything launches. `skills` is mandatory on every dispatch — an empty array is a valid value, an absent field is a broken dispatch. Reason: the hand-rolled required-field loops never checked `skills`, and the SKILL.md config listings never documented it (a known open item, flagged in a post-mortem and left unfixed), so a supervisor launched with no foundational skills at all. `new-supervisor-cast` also requires `operatorRole` — the role the operator was dispatched with — passed through so the supervisor's cast unions the same role skills the operator got, because the supervisor judges skill application and must hold the same set it judges by.

### The supervisor is the repository's gatekeeper; the verdict starts at BLOCK

The supervisor ACTOR.md now states the posture directly: the supervisor is not judging the work, it is defending the repository from garbage. The verdict starts at BLOCK and only verified quality raises it to PASS — you do not sit an exam and pass by walking out; you start at zero and every mark is earned. An item not actually verified (a skill marked without its `SUCCESS.md` read, a diff judged unread) raises nothing. Reading a skill's `SUCCESS.md` is a precondition of marking it. Reason: the token-stats supervisor passed two iterations on fabricated skill marks — "expected/actual naming — present" written without opening the skill or the assertions — and defended the PASS turn after turn, because its posture was "is the work that bad?" pulling a default pass down instead of quality raising a default block up.
