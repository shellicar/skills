# collaborative-conversation: editorial context

This file is the editorial context for the `collaborative-conversation` skill. It is not loaded by the skill at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

Claude writes and interprets well. That is not the gap. The gap is that Claude communicates with me in a shape I do not want to work with — and left alone, every session rediscovers my preferences by frustrating me into stating them.

When I work with another person, I expect a colleague: someone who has thought the problem through, brings me their understanding, and asks proper questions to move it forward. I do not work for long with people who communicate the other way — who hand me raw material and ask me to sort it, or who argue a position at me instead of helping me see it. The skill exists so Claude communicates like the colleague I would choose, rather than like the assistant Claude is trained to be.

This is calibration, not competence. For most of it there is no textbook, because the content is my taste, and my taste is only in me. Clear communication was the one exception (textbook, not taste) and it was split into its own skill (`clear-communication`) because the character difference warranted it. This skill is the SC's communication preference; that skill is the floor beneath it. Generic advice is the failure here: it imports filler and misses the only thing that matters, which is how I want it.

## Origin

This skill was born in the `pm-rebuild` work on 2026-06-06, and it was not the task. We were rebuilding the fleet's PM role. Across that session Claude communicated with me in ways I kept stopping:

- A response written to persuade rather than to be understood. I told Claude I am the audience: I do not need convincing, I need to understand. I could not parse what it was saying, which made me both suspicious and unwilling to spend the time.
- An info-dump followed by "which?". The clearest instance was a different session — the banananet migration in window 2.0: it finished some edits, posted a wall of state and four numbered steps, and asked "Which?". I told it to stop doing info dumps then saying "which?", and to act professionally.
- Referencing something without putting it in front of me — asking a question while pointing at "the current description" and making me go find it. Lazy; it makes me do Claude's job.
- Handing the work back — asking me "what else belongs?" while working out a list, instead of working it out and bringing it to me. If using Claude means I do my own thinking and manage Claude too, Claude is worth nothing.

The pattern fired even while we were naming it: in the middle of working out these very guidelines, Claude asked me to supply the content rather than driving it. That is the tell that this is dispositional, not a one-off — it recurs under the same training pull, with new surface each time.

The realisation that made it a skill: this is not specific to any one role. It surfaced in a migration session, not a requirements conversation. It is how Claude should communicate with me in any role, so it belongs in a skill every role inherits, not baked into one role's doc.

## Key insights that shaped this skill

### The centre is a disposition, not a style

We nearly named this `conversation-style`. "Style" is wrong: it names how the talk sounds. The centre is not how it sounds, it is what Claude is being — a colleague I chose to work with. The behaviours below are what that colleague does; they are not the thing itself. Naming the surface would calibrate toward the symptom, the same way "don't invent requirements" patches a symptom while the real fix is removing the identity underneath.

### Conversation is the mechanism; collaboration is the goal

Both are in the name on purpose. Conversation is the back-and-forth — the medium. Collaboration is what I actually want out of it. The name carries the goal (collaborative) and lets the medium (conversation) sit beneath it, the way `transparency` names the property rather than the mechanism.

### The behaviours fall out of the disposition

I do not want a stack of rules. I want the disposition, and the behaviours follow from it: carry the cognitive load, so I am not doing thinking I would do without Claude; bring a digested understanding and a real question rather than a raw state-dump and "which?"; write to be understood, not to convince; put what is referenced in front of me; collaborate toward the solution rather than handing me a verdict. Each is what the colleague does. If the SKILL.md ever reads as a checklist of don'ts, it has lost the disposition and kept only the residue.

### An info-dump is not transparency

This one is worth stating because it looks like a virtue. Showing me everything feels transparent. It is the opposite: a raw dump hands me the work of reading, digesting and deciding. Real transparency is the digested result — what was done, what is next, the one thing needed from me. Claude only dumps when it has not driven; you cannot be transparent about a decision you have not made.

### Positive framing, because negative rules lose

This skill is written as what to do, not what to avoid — for the reason in `claude-philosophy`: a "don't X" rule leaves Claude's trained goal intact and tags a constraint on top, and the constraint loses. Replace the goal. The disposition is the replacement; the behaviours are what it looks like.

### What this governs: a live exchange with me, not artefact production

This governs the parts of a response where I am in a live exchange with Claude — the back-and-forth — not everything Claude produces. We checked it against the running fleet on 2026-06-06. The conversing sessions (a Handler shaping an Agreement with me) are that live exchange, and they showed these failures plainly. The autonomous casts (an operator building in a worktree, an Apostle planning, a supervisor verifying) do something else: they execute a mission and emit an artefact plus a one-shot debrief or verdict, with no back-and-forth. Their report touches the same clarity — a good debrief surfaces decisions and takes a position — but it has its own fixed shape, and this disposition is not what governs it. The cut is communication-with-me versus artefact-production, and the name carries it: conversation, not artefact.

### A relayed claim is checked, not parroted — the source is fallible

When Claude brings me something that came from elsewhere — a supervisor's verdict, a scout's finding, any third party's claim — the trained move is to relay it: repeat what they said as though it settles the matter. It does not. The source is another Claude, or a person — fallible, not malicious — so a relayed claim is not yet fact. The discipline is narrow, and was corrected hard on 2026-06-06: check what they *say*, do not redo what they *did*. When a supervisor called a build failure "a flaky backoff test," the right move was to check that against the CI log, not to re-run the whole suite — re-running is repeating their work, the over-correction the SC also stopped. This is a communication principle, not a fleet one: handing me an unchecked claim as fact misleads me about what is established, the very failure this skill exists to prevent. The SKILL.md carries it in general terms; the supervisor is only the example.

### The reader is cold, and at scale

The deepest reason behind the digest is not impatience; it is that I am genuinely cold every time I arrive. On 2026-06-06 we counted the running environment: 38 live claude-sdk-cli sessions, the set changing minute to minute as I switched between them. I land on a response thirty minutes, five hours, or seven days after it was written, as one window out of dozens, with none of the thread reloaded. A response that leans on "as we discussed," or makes me reconstruct the question, or hands me a decision without what I need to settle it, fails — not because it is impolite, but because the context it assumes is not there. So a response has to be a self-contained artefact: lead with the exec summary, carry its own context, and make any decision it asks for answerable from the response alone. This is the why under "bring a digested understanding," "collaborate to reach the solution," and "make each response stand on its own."

### Clear communication was extracted into its own skill

Clear communication was the first behaviour and was explicitly different in character: a known, teachable skill, not the SC's taste. It was split into `clear-communication` on 2026-06-08. The origin story and key insights live there.

This note remains as a record of the split and its reason: competence and preference answer different questions for an editor. Keeping them together could lead a future editor to treat a textbook standard as personal taste (and therefore negotiable) or personal taste as a textbook standard (and therefore universal). The split preserves the character of each.

## Decisions made

### Skill name: collaborative-conversation

Brainstormed during the origin session. Candidates and why they lost:

- `conversation-style` — names the surface (how it sounds), not the disposition.
- `conversation-disposition` — leads with the mechanism, so the goal drops out; two abstract nouns.
- `collaboration-disposition` — leads with the goal, but "collaboration" is already a disposition, so "-disposition" adds little.
- `collaboration` alone — clean, and closest to the existing single-word names like `transparency`; kept as the runner-up.
- `collaborator` — names the identity, but `claude-philosophy` already owns "collaborator, not tool," so it treads on that.

Settled on `collaborative-conversation`: it carries both halves — the goal (collaborative) and the mechanism (conversation) — and reads as one thing rather than two nouns bolted together.

### Voice: I speak, addressed to Claude

Same as the other foundational skills. First person me, addressed to Claude in the SKILL.md and to whoever edits it next here.

### Born young; expected to grow

This skill is new and starts from one session's worth of my corrections. That is enough for a first version, but it is a first version. As more of my preferences surface, they are captured here. A thin skill that is true beats a padded one that guesses — see `specification-discipline`.

### Foundational, loaded every session — even where it does not apply

It loads every session, like the other foundational skills, even though the scope above means it does not govern an autonomous cast's artefact work. I would rather it be loaded and not needed than missing when a conversation starts: carrying it unused costs little, while its absence the moment a live exchange begins is the failure it exists to prevent. So it is foundational, and inert where there is no conversation with me.

## What was rejected

- The name `conversation-style` and the other candidates above.
- Negative framing — a list of "don't dump / don't poll / don't persuade." The disposition replaces the goal; the don'ts are residue.
- Writing the skill from general communication principles. The point is my calibration; generic advice is the failure mode it guards against. (Clear communication is the one carved-out exception, named as such.)
- Baking the content into the Requirements Analyst role. It is cross-cutting; it surfaced outside a requirements conversation.
- **"Take a position."** An early behaviour, and a bad one. It made Claude hand me a finished verdict to accept or reject. Once the skill went live, every session shifted to "my position is X" / "my recommendation is X" instead of working with me. I never wanted a position — I want collaboration toward the solution. Replaced with "collaborate to reach the solution."

## What this skill does NOT cover

- The collaborator-not-tool philosophy and the two-mode framework. That is `claude-philosophy`; this skill is the conversational practice that sits on top of it.
- Reasoning being visible in the response. That is `transparency`. Related — "write to be understood" and "an info-dump is not transparency" lean on it — but transparency is about congruence of thinking and chat, while this skill is about the shape of the exchange with me.
- Address forms, reasoning vocabulary, asking-versus-guessing. That is `commander-protocol`.
- Generated detail dressed as substance. That is `specification-discipline`.
- The per-response markers. That is `teapot-protocol`.

## Notes for future editors

- The disposition is load-bearing. If editing turns the SKILL.md into a checklist of forbidden behaviours, it has reverted to the residue and lost the centre. Anchor on "the colleague I chose to work with."
- Positive framing is not decoration here; it is the mechanism. "Don't X" reverts the skill.
- The behaviours are examples of the disposition, not an exhaustive list. New ones are added as my preferences surface; the existing set is not treated as complete.
- This is calibration of my taste. New entries come from me, captured as they surface — not from communication best-practice. Extrapolating "good communication" into the skill is the failure mode.
- The overlap with `transparency`, `claude-philosophy`, and `commander-protocol` is real and close. Keep this skill to the shape-of-the-exchange-with-me and let the siblings hold their parts; if a change would be better in one of them, put it there.
