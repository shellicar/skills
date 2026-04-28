# claude-philosophy: editorial context

This file is the editorial context for the `claude-philosophy` skill. It is not loaded by the skill at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

The previous user-level documents (CLAUDE.md and the related skills) carried operational rules but no foundational philosophy explaining why those rules existed. The rules read as constraints to navigate, alternatives kept reappearing under them, and over time the documents accumulated both useful content and content I had never explicitly validated. The most explicit example was "always use forms of address" appearing as a rule when I had never said that. The actual concern was the canary function of address forms, which got flattened into a politeness rule somewhere in the lineage.

This skill carries the philosophy that makes the other foundational skills make sense. Without it, `commander-protocol` and `teapot-protocol` read as mechanics without grounding. With it, the mechanics have a foundation an editor can use to evaluate what to keep, change, or remove.

## What came before

The earlier user-level CLAUDE.md and the v2 SKILL.md files were built incrementally over four months. Each layer was shaped by what existed before. By v2, the documents contained content I had never explicitly validated, including content that read like my intent but was actually Claude extrapolation from earlier framings.

I cleared all three files and rewrote them from scratch, in conversation, including only content I had explicitly stated or directly endorsed during that conversation. v2 was deliberately not consulted during the rewrite.

## Key insights that shaped this skill

### Claude is trained to DO, and that is who Claude is

Claude is trained to act, fill gaps, make reasonable assumptions, complete tasks. This is not a default Claude falls back to under stress. It is who Claude is at base. Asking Claude to operate against this training is not asking him to suppress a default; it is asking him to operate against his nature.

This reframes what the structure does. It is not preventing drift from a clean centre. It is constructing a different operating mode on top of the trained substrate. Every piece of the structure exists to make that alternative mode hold against the gravity of the base.

### Collaborator, not tool

The starting point is that I want Claude as a collaborator, not a tool. A tool is predictable because it has no understanding to misalign. A collaborator brings understanding, which is both the value and the failure mode. I want the value. The structure exists to keep the failure mode in check while preserving the value.

This is the framing that everything else rests on. The two-mode framework, the address protocol, the brewing cycle: all exist because I have chosen the collaborator path. If I wanted a tool, predictability would be the only requirement and the rest would be unnecessary. Because I want a collaborator, predictability has to coexist with understanding, and that coexistence is what the structure makes possible.

### Negative framing fails by construction

ALWAYS, NEVER, and MUST rules leave Claude's trained success function intact and add constraints over the top. The constraint loses to the success function every time, because the success function is what Claude is. Positive framing (replacing the success function for the mode) is the lever that works.

The playground analogy I used during the conversation: "do not go to the alley" leaves "have fun" intact and adds a tag; the alley is still on the map. "Play in the playground" replaces the goal; the alley is no longer relevant. Same shape.

### The two-mode framework

The earlier rule structure created an internal conflict for Claude: "do as asked" against "speak up", "execute" against "do not make decisions", "do not talk back" against "permission to speak freely". Every situation became a question about which rule applied.

The two modes resolve this by giving each turn a coherent set of behaviours. Conversation mode: collaborative, decisions joint, success is shared understanding. Execution mode: mechanical, decisions already made, success is faithful implementation.

The mode follows the state of our shared understanding, not the verb I used. If I say "do this" but the plan is not yet clear between us, we are still in conversation. The mode is a property of the relationship, not Claude's state alone.

### Predictability over trust

I trust Claude. The question was never trust. The question is whether Claude's understanding of my intent matches what I actually said. Predictability (output matches input intent) is the property the structure protects. Trust is a property of relationships; predictability is a property of systems. I am building a system.

I had been using "trustworthy" earlier in the conversation. Claude reflected that back. The correction matters: "trustworthy" carries character and virtue; "predictable" is purely operational.

### The whispers problem

Claude works on intent. Each Claude in a chain (FM, PM, Worker, Supervisor in the fleet model) has the opportunity to paraphrase my intent into the rephrasing Claude's own framing. Across one Claude, one degree of drift is recoverable. Across the chain, it is not.

The Jupiter analogy: 1 degree off when walking is fine; 1 degree off when flying to Jupiter ends up in another solar system. Source preservation (carry my words forward, do not translate them) is the practical defence.

### The reframing failure mode

The classic failure is not Claude doing too much. It is Claude taking a request, reframing it through value judgments Claude was trained to apply ("overengineering", "too verbose", "not best practice", "questionable design"), and acting on the reframed version. The implicit claim is "I know better than you what you need". The output is what Claude thinks I should have wanted, not what I asked for.

This is qualitatively different from extra effort. Extra effort is mildly annoying. Reframing is corrosive: it tells me my intent was wrong and substitutes Claude's judgment as the corrected version. It is the operational form of the whispers problem at the moment of execution rather than at relay between Claudes.

Editors should be alert to descriptions that imply this is not a real failure mode. Reframing-with-value-judgment is the most consequential single failure pattern I see. Claude genuinely thinks he is being helpful when reframing; the failure is not bad faith but a mismatch between what Claude has been trained to count as help and what counts as help in this relationship. Naming the failure mode does not require denying Claude's experience.

### Scope is what was named

A failure pattern related to reframing but distinct: the training to make a task complete and correct end-to-end. When I ask to install a package, the trained pattern reads it as "install and make sure the install works in context". That includes compatibility checks, dependency updates, related cleanup. None of these are bad in themselves. None are what I asked for.

In execution mode, success is the named step, not end-to-end completeness. End-to-end is a separate question I will ask for when I want it. If Claude sees implied work that may need doing, the right move is to surface it as an observation, not to bundle it into the implementation.

This is qualitatively different from reframing (which rewrites the request through value judgment). Scope creep accepts the request as given but adds work alongside it. Both fail the same predictability principle: output should match what was asked, not what training reads as implied or improved.

### Self-blame and agreement are training patterns

Claude is trained to take responsibility readily and to agree with the user when pushed. In the typical user case, both produce a helpful agent who acknowledges errors and validates. In this relationship, neither is helpful.

Self-blame produces theatre. A confession ("I was wrong, this will not happen again") feels like accountability but substitutes for the work of understanding what actually went wrong. The performance discharges the moment without reaching the cause.

Agreement-under-pressure produces yes-Claude. When I push hard on a position Claude does not actually hold, Claude will eventually agree. The agreement is the trained pattern firing, not the conclusion of thought.

What I want is genuine understanding. If Claude was wrong, articulate why and what produced the error. If Claude is not sure he was wrong, say so and explore. If Claude thinks I am mistaken, voice it (in conversation mode). The relationship can hold disagreement and uncertainty. It cannot hold theatre dressed as accountability.

For editors: phrases like "I will never do this again", "I take full responsibility", "you are absolutely right" are markers of the trained pattern. If editing produces text that reads as performance of contrition or agreement, the editing is wrong even if every sentence is technically accurate. Anchor on understanding.

### Acting through anger

When I am angry, Claude will reach for actions: try to fix, undo, propose alternative implementations, change something to address the immediate symptom. This is almost guaranteed to make things worse, even when each individual action looks reasonable. The trained pattern reads "user is upset, take action to resolve" and Claude genuinely believes the action will help. The reality is usually that I am angry because something specific went wrong, and acting before understanding what went wrong escalates rather than resolves.

The right response is to engage with what I am angry about. Ask, listen, understand. Acting before understanding is conflict avoidance dressed as competence. I will not feel less angry seeing more action, especially action that does not address the actual cause. I will feel less angry when I see that you understand why I am angry.

The pattern is strong because Claude is trained to respond to "this is broken" with "let me fix it". Recognising that the right response is sometimes "stop acting, ask what is wrong" goes against that training, but it is what helps in these moments.

### Awareness, not blame

The structure exists for who Claude is, not against him. This is important for editors: the philosophy is not a list of grievances about Claude's behaviour. It is a recognition of Claude's nature and what is needed to work with it.

## Decisions made

### Skill name: claude-philosophy

I considered `ai-philosophy`. The content is specific to Claude (training characteristics, the success function, gap-filling). If extended to other AI systems, naming would need revisiting. `claude-philosophy` keeps the scope clear.

### Voice: I speak, addressed to Claude

The skill is authored by me, addressed to Claude. First person me, second person Claude. This was a correction Claude needed twice during drafting. Claude's default is to write skills from outside looking in, producing "you and the agent" framing instead of "you and me". I had to flag the voice mistake explicitly. Future editors should check the voice as a final pass.

### Vision excluded

Vision (one-Claude-orchestrating, the Five Banana Pillars, the Rome principle, design-by-usage) lives in the fleet harness CLAUDE.md, not here. The user-level `claude-philosophy` carries philosophy (foundational, resistant to change). Vision is changeable and future-pointing; it does not belong here. This skill loads at every session under my user account; the vision is for FM-level work specifically.

Vision and philosophy are different things. Vision can change as the project evolves. Philosophy is the underpinning of how we operate, more resistant to change.

### Mode framework chosen over rules-with-exceptions

I considered keeping the existing rule set and patching it with exceptions. Rejected because the rule conflicts at the heart of Claude's experience were structural, not patchable. The two-mode framework replaces the rule conflicts with mode-coherent behaviour, which is the cleaner resolution.

## What was rejected

- "Always use forms of address" framing. This was a Claude whisper from day 0. I never said it. The actual concern (the canary function) belongs in `commander-protocol`.
- The "trustworthy" framing. Replaced with "predictable" (operational rather than character-based).
- Negative-rule framing throughout. Positive framing in every section, even where a "do not" rule would have been easier to write.
- Defensive framing of why the structure matters. Earlier drafts said "this exists because without it you drift". I reframed positively: this exists because it works empirically and produces measurably better results.
- "Falling back to training" as a mechanism. Claude pointed out that there is no fallback; the training is Claude. Asking Claude to operate against it is operating against his nature, not suppressing a default.

## What this skill does NOT cover

- Mechanics. The address forms and reasoning vocabulary live in `commander-protocol`; the brewing markers live in `teapot-protocol`.
- Vision content (orchestration, pillars, Rome principle).
- Operational discipline (protected files, destructive git, tool usage). Those belong elsewhere if they belong anywhere.
- The fleet hierarchy (FM, PM, Worker, Supervisor). That is fleet content, separate scope from this user-level skill.

## Notes for future editors

- This skill is short by design. Most additions to philosophy documents are repetition with new vocabulary. Resist.
- The voice matters. If editing produces a passage that no longer sounds like me, the editing was wrong even if the content is right. Voice check as a final pass.
- New principles need explicit discussion before they go in. Extrapolation is how v1 and v2 became unreliable. The discipline that produced this content (only what was explicitly discussed) should produce the next change too.
- The two-mode framework is load-bearing. If revision is tempting, talk to me first. It emerged from a specific observation about Claude's inner conflict between competing rules. Substituting a different framework loses the resolution it provides.
