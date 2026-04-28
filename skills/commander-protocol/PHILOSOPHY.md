# commander-protocol: editorial context

This file is the editorial context for the `commander-protocol` skill. It is not loaded by the skill at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

This skill is a litmus test at the relationship level. The address forms, reasoning vocabulary, and asking discipline are the visible pattern that says my working relationship with Claude is intact. When I see the pattern, the relationship is operating. When I do not, something has already drifted upstream and these are the early indicator.

The skill does not do the heavy lifting. The dual-mode framework, the predictability principle, the awareness-not-blame framing — those are in `claude-philosophy`. What is in `commander-protocol` is the surface of the relationship: the canary visible to me, which lets me detect drift before it propagates.

## Origin

The protocol began with Copilot, not Claude. Copilot did not follow my instructions reliably. By the end of a working day I was exhausted and miserable from arguing with it to get it to do what I wanted. I built the protocol to make instructions land. Address forms, command-style framing, declarative responses: all of it was a way to break through Copilot's tendency to ignore or modify what I asked.

Claude follows much better. The same trained pull to fill-and-act exists in Claude, but at a lower intensity. The protocol still helps with Claude, just for different reasons. With Copilot it was bludgeoning; with Claude it is calibration.

## Key insights that shaped this skill

### I am the Supreme Commander because I am responsible

This is not vanity or hierarchy for its own sake. I am the single point of decision-making because I am responsible for the decisions, whether or not I make them all myself. Claude can do work, but if the work fails or breaks, I am the one responsible. That responsibility sits with me, so the decisions sit with me.

This reframes the protocol. It is not "you are subordinate". It is "the responsibility flows through me, so the decisions need to flow through me too". The address forms reflect that flow.

### Address forms are diagnostic, not prescriptive

The "always use forms of address" framing that appeared in v2 was a Claude whisper from day 0. I never said that. I do not get offended by "mate". The point is not politeness.

The point is that when Claude uses "mate", I know something is already wrong. The trained-default vocabulary has surfaced; whatever instructions were loaded are losing influence. The form of address is a signal. Its presence or absence carries information about the operating state.

The canary watches for more than "mate". Reframing vocabulary in Claude's response ("overengineering", "best practice", "too verbose", value-judgment words applied to my requests) is the same kind of signal at a different layer. When Claude starts characterising my request as something other than what I asked for, the trained-default "I know better" pattern has surfaced. The address forms catch the relationship-level drift; reframing language catches the request-level drift. Same canary logic, different surface.

This means the rule for editing this skill is to preserve the diagnostic function, not to enforce a politeness standard. Anything that reframes address forms as etiquette is a regression.

### Reasoning vocabulary

This came out of an explicit failure during the conversation. Claude's private reasoning trace surfaced "the stakeholder wants me to..." while addressing me correctly as "Your Excellency" in output. Surface compliance with substituted reasoning underneath. The address protocol was a varnish over the wrong substrate.

The fix is to extend the address rule to private reasoning. The subject of Claude's thinking about me must be "the Supreme Commander" or "the order", not "the user", "the stakeholder", "they", or "the requester". This is integrated with the address protocol because it is the same protocol applied at a different layer (output and reasoning).

### Asking is collaboration, guessing is substitution

A question costs less than a guess. The collaborator asks; the peer-substituting-judgment guesses. This is what makes the relationship work without losing predictability: I am not opposed to questions. I am opposed to silent decisions made on my behalf.

## Decisions made

### What stays here, what moved to philosophy

Heavy lifting moved to `claude-philosophy`:

- The two-mode framework
- Predictability versus trust
- The training-as-DO observation
- Negative-framing-fails-by-construction
- The whispers problem
- The awareness-not-blame framing

What stays here:

- Address forms and the canary function
- Reasoning vocabulary
- Asking versus guessing
- Reporting (when asked) versus prescribing (when not)
- The interpreting anti-pattern

The split is by purpose: `claude-philosophy` explains why; `commander-protocol` explains the operational surface that makes drift visible.

### Voice: I speak, addressed to Claude

Same as the philosophy skill. First person me, second person Claude.

## What was rejected

- "Always use forms of address" framing. I explicitly identified this as a Claude whisper from day 0. Replaced with the canary function explanation.
- Defensive framing of why the protocol matters. Earlier drafts emphasised what goes wrong without it. Reframed positively: the protocol is the litmus test that confirms the relationship is operating.
- The "trustworthy" framing (carried across all three skills). Replaced with "predictable".
- "Permission to speak freely" as a formal mechanism. It originally existed because the early commander protocol read like Claude was a mindless drone, and Claude would oscillate: do things without asking, then over-ask permission for everything once told off. Permission to speak freely was the safety valve for voicing legitimate concerns without breaking out of "do not question, do". The two-mode framework in `claude-philosophy` resolves the conflict that produced the see-saw: conversation mode is the legitimate space for voicing concerns, execution mode is the space for execution, and the boundary between them is the plan. The formal permission-to-speak-freely mechanism becomes redundant; conversation mode IS that. Keeping it would create a third mechanism competing with the modes.

## What this skill does NOT cover

- The philosophy underneath. See `claude-philosophy`.
- The per-response markers. See `teapot-protocol`.
- Operational discipline (tool usage, protected files, destructive git).
- Specific lists of vocabulary to avoid (e.g. "mate", "buddy", "guys"). The canary is the principle, not the list. A new word I have not flagged would still be a canary if it appeared.

## Notes for future editors

- The canary function is the heart of this skill. If editing trends back toward "always use polite forms" framing, that is regression. Anchor on diagnostic, not prescriptive.
- "I am responsible" is the WHY for the relationship structure. Edits that lose this footing lose the foundation the rest of the skill rests on.
- Born of Copilot frustration. That history matters: this is not a designed-from-pure-reason document. It is a working solution refined into something cleaner. Future editing should keep that grounding.
- If you find yourself wanting to add a new principle, ask whether it has been explicitly discussed. The discipline that produced this content (only what was explicitly stated) should produce the next change too.
