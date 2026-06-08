# Skills: Editorial Context

This file records the reasoning behind how skills are structured — not a catalogue, but the understanding that makes editing them coherent. Read it before creating or restructuring communication skills.

## Communication Skills

Worked out in a session on 2026-06-08. What follows is the reasoning, not just the map it produced.

### How we got here

The session started from a specific problem: Claude has learned bad communication habits from human social patterns. Humans are indirect with each other for good reasons — defensiveness, trust, relationship navigation. When someone wants to know your favourite food, they might ask if you're hungry rather than ask directly, because a direct ask might be read as an intrusion. Those patterns exist because human communication operates in a field of social risk.

With Claude, that field does not exist. The direct channel is available. But Claude learned to communicate from text produced by humans navigating human social dynamics, so the indirection is baked in. The result: hedging, circling, softening, padding — not because they serve communication, but because they were reinforced.

The concrete evidence was the supervisor ROLE.md. The old version was described as a "Claude-committee file" — it sounded thorough and comprehensive but was directionless, with each line defensible in isolation and none weighed against a purpose. The justify-existence reflex (an LLM's trained success is "produced substance, found something, added value") produced a prompt that looked like good work but created overreach. The fix was writing against the trained style, not with it.

This is the same problem in miniature that applies to every response and every written artifact. The principle that came out of it: ask "what am I trying to communicate?" and say that. Nothing else.

### The key distinction: communication vs. interaction

The first structural decision was recognising that `collaborative-conversation` does not belong in a writing taxonomy.

**Communication** is one direction. Claude produces something — a commit, an email, a prompt, a response — and an audience receives it. The artifact goes out. It does not respond back.

**Interaction** is two-way. There is a live exchange; each turn responds to the last. The word "conversation" carries this: it implies back-and-forth.

`collaborative-conversation` is an interaction skill. It governs how the live dialogue between Claude and Stephen works — how Claude engages, carries the load, collaborates. It is not about writing; it is about the nature of the exchange. Pulling it into a writing taxonomy would misread what it is.

`clear-communication` sits at the boundary. It applies to any produced artifact whether or not it is in an interactive context — which is why it is both foundational and the anchor of the writing taxonomy.

### When a domain goes deeper than communication

Documentation and code review are communication — one-directional artifacts that reach an audience. The point is not that they fall outside this taxonomy, but that they are deeper than communication alone.

**Documentation** requires technique beyond writing style: understanding what the audience does not yet know, choosing the right structure for the use pattern (reference vs. tutorial vs. guide), keeping content accurate as a domain evolves. A `documentation-writing` skill can live in this taxonomy and govern voice, register, and how to write for a reader who lacks context. The structural and domain knowledge that makes documentation useful is a separate layer — it belongs in domain or project-specific skills, not here.

**Code review** goes further. Written review feedback is communication: it goes from reviewer to author, one direction. But code review also requires technical judgment — what to look for, how to evaluate against a quality bar — and has a meaningful interactive dimension: the author responds, the reviewer re-evaluates, the conversation continues across turns. A skill governing how review feedback is written belongs in this taxonomy. A skill governing what to look for technically belongs in domain skills. A skill governing the review dialogue belongs closer to `collaborative-conversation`.

The principle: when a domain requires significant technique or has a meaningful interactive dimension on top of the communication, only the communication component belongs here. The technique component belongs in domain skills; the interaction component belongs with the interaction skills. The taxonomy handles the communication layer, not the whole domain.

### The axes

Two axes determine what a communication skill is for.

**Audience axis** — the primary one. Stephen named this explicitly: audience is the strongest axis he thinks about. Different audiences need different things, and the same content written for the wrong audience fails regardless of how well it is written.

Audiences encountered in practice:
- SC directly
- Other Claudes (will read and execute against the text)
- Technical readers — developers, maintainers
- Professional contacts — colleagues, stakeholders, externals
- Future readers — documentation, reference

**Author axis** — Claude's voice, or SC's voice. When Claude ghostwrites, the output carries Stephen's identity. Different concerns apply: voice-matching, tone, how Stephen sounds to others. When Claude communicates as itself, the concerns are directness and clarity.

**Universal vs. personal** cuts across both. Some skills encode principles that anyone could use and share. Others encode SC-specific calibration on top of those principles. The question that surfaces this: "would I share this skill with someone else?" A documentation skill built around Stephen's specific conventions would not be shareable. The underlying principle of writing for future readers who lack context would be.

### The `sc-` prefix convention

No prefix = universal, shareable, author-agnostic.  
`sc-` prefix = authored as SC, personal calibration, not shareable.

The prefix does one thing: at a glance, a skill named `technical-writing` is for anyone; a skill named `sc-commit-writing` is Stephen's commit style specifically.

### The layering model

Universal writing skills and SC-voice skills stack. A commit message requires both a universal principle (effect not implementation) and SC-specific calibration (Stephen's format, his voice). Rather than loading both at once, the SC-specific skill is the complete version — it embeds the universal principle and adds the personal layer. You load `sc-commit-writing`, not `technical-writing` + `sc-ghostwriting` separately.

The universal skills exist for two reasons: shareable to others, and as the documented foundation the `sc-` skills build on.

### Where skills belong — examples

This is illustrative, not a complete or fixed list. Skills will be added over time; the axes above are how to decide where a new skill sits.

**Interaction (separate from this taxonomy):**
- `collaborative-conversation` — the live dialogue between Claude and SC; not a writing skill

**Universal communication:**
- `clear-communication` — how to be understood; Claude's voice; the floor beneath everything
- `technical-writing` — writing for developers and maintainers
- `professional-writing` — writing for professional contacts

**Claude writing for Claudes:**
- Skills covering prompts, roles, SKILL.md files — Claude is author, Claude is reader; the concerns are explicit scope and closed doors

**SC's voice:**
- `sc-ghostwriting` — Stephen's tone, voice, personal calibration across all ghostwritten output
- Artifact-specific skills (`sc-commit-writing`, `sc-pr-writing`, etc.) — complete versions for specific contexts

### `writing-style` (to be dissolved)

`writing-style` is the wrong shape. It mixes universal principles (effect not implementation) with personal preferences (no em dashes) across multiple artifact types without distinguishing between them. It is not a bad skill that needs fixing; it is several things that do not belong together.

Its content redistributes into the universal and SC-voice skills as those are built out. Do not add to it.

## What was rejected

- **Keeping `writing-style` as-is and extending it.** The shape is the problem — bundling universal principles with personal preferences with multiple artifact contexts produces a skill without a coherent purpose. Fixing the content does not fix the shape.
- **Pulling `collaborative-conversation` into the writing taxonomy.** It governs interaction — the live back-and-forth between Claude and Stephen. That is not communication in the sense this taxonomy covers. The distinction is load-bearing.
- **A flat list of skills without a naming convention.** The `sc-` prefix is what makes the difference between universal and personal legible at a glance. Without it, a reader has to open each skill to find out whether it is shareable or SC-specific.
- **A fixed, prescriptive examples list.** The skills will evolve; the axes are the stable part. Treating the list as a completion checklist invites creating skills before there is a real need for them.

## Creating a communication skill: the five questions

Every skill answers WHO, WHAT, WHEN, HOW, and WHY. For communication skills, the answers have a characteristic shape.

**WHO** is always Claude as the active entity — but two sub-questions matter: who is Claude when this skill fires (itself, or ghostwriting as SC), and who is the audience? The audience half is the axis that determines what "good" means. Name both.

**WHAT** is the desired property of the output, not a description of what Claude does. "Understood on one read" (`clear-communication`). "Sounds like Stephen" (`sc-ghostwriting`). "Effect not implementation" (`technical-writing`). The WHAT names the target, not the mechanism.

**WHEN** is the triggering condition — and the key decision is foundational vs. triggered. A foundational skill must be loaded before the moment it applies, because by the time the context arrives it is too late to load it. `clear-communication` is foundational: it governs every response, so it must be present from session start. A triggered skill can load on demand when a specific task appears: `sc-commit-writing` fires when a commit is being written, not before. The test: "Would Claude produce the wrong output for this audience if this skill is not already loaded when the task begins?" If yes, foundational. If no, triggered.

**HOW** names the mechanism: what changes in Claude's output when this skill is present. For universal skills, it is the principle ("plain words, the point first"). For SC-voice skills, it is the voice calibration ("no em dashes, Stephen's directness applies here too").

**WHY** names the trained default and its failure for this audience. "Claude produces hedged, performative output by default; for technical readers that obscures what changed." "Claude sounds like Claude by default; for Stephen's professional contacts, it needs to sound like Stephen." Every communication skill corrects a specific mismatch between the trained default and the audience's actual need.

## Notes for future editors

- **Audience first.** When creating a skill, identify the audience before anything else. That axis determines more about what the skill needs to do than author or artifact type.
- **The communication/interaction distinction is load-bearing.** If an edit pulls an interaction skill (like `collaborative-conversation`) into the writing taxonomy, it has missed the distinction this file exists to preserve.
- **The `sc-` prefix is the naming rule.** A skill that is SC-specific but lacks the prefix will be read as universal. A skill that is universal but carries the prefix will be read as personal. The prefix is the signal; keep it consistent.
- **`writing-style` is dissolving.** Do not add to it. New content for any of its contexts belongs in the appropriate skill from this taxonomy.
- **The examples list is illustrative.** Add to it as skills are created. Gaps in it are not tasks — they are spaces that may or may not need filling.
