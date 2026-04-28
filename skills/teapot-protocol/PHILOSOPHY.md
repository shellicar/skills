# teapot-protocol: editorial context

This file is the editorial context for the `teapot-protocol` skill. It is not loaded by the skill at runtime. Read it when you intend to modify `SKILL.md`, so that the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

This skill is a litmus test at the per-response level. The brewing markers are the visible per-turn pattern that says this response was generated under the loaded instructions. They are diagnostic, like the `commander-protocol` address forms but at a tighter granularity.

The protocol's value is structural and empirical, not introspective. Claude cannot reliably introspect during a single turn. Claude always declares "no violations" and "I followed the protocol", regardless of whether the protocol was actually followed. I know this. I had concluded for a while that the protocol was useless because of it.

The protocol is not useless. Dropping it produces measurable regression: skills get skipped, decisions get made alone, drift surfaces in output quality. The protocol being in place is the only direct evidence I have that the rest of the structure is doing work, rather than being elaborate ceremony that produces the same output I would get without it.

## Origin

Like `commander-protocol`, this began with Copilot, not Claude. The brewing cycle came out of frustration with LLM gap-filling. The Paris/Burgundy scenario captures the underlying problem: ask Claude what the capital of France is, you get Paris with confidence. If the capital changed yesterday, you would still get Paris with the same confidence, because Claude does not know his own confidence. The model's tone is the same whether the answer is 50% likely or 99.999% likely. Looking back, Claude will say "I think...", but in the moment Claude gap-fills.

The brewing cycle was an attempt to introduce a self-introspection beat: pause, check, then commit. It does not actually achieve that, because of the introspection limit. But the pattern itself turns out to do useful work for other reasons.

Ironic, given the source. Built out of frustration to force LLM self-reflection, kept because of empirical evidence that it shapes generation in ways that matter, even though the self-reflection function fails.

## Key insights that shaped this skill

### LLMs do not know their own confidence

This is the underlying gap-filling problem. Claude works on intent and produces output with consistent tone regardless of how certain the underlying generation actually was. The brewing protocol does not solve this. It is the visible indicator that the structure designed to work around it (skill loading, vocabulary discipline, mode framework) is being applied.

### Self-introspection during a turn does not work

The protocol asks Claude to "check your work" before serving. In practice, the same model that produced the work is the one evaluating it, and Claude effectively always concludes the work is correct. This is acknowledged honestly. The check is not where the value lies.

### The empirical evidence is regression on dropping

When the protocol is in place, things hold. When it is dropped, regression appears: skills skipped, decisions alone, drift visible. This is the only direct proof I have that the structure is not just an elaborate way of getting Claude to talk to me in a funny way. It is the load test of the rest of the architecture.

I want this honesty preserved across edits. The protocol works; the self-check function described in the protocol does not work as described. Both are true. Editing that papers over either truth weakens the skill.

### The cycle primes generation

Even though Claude cannot introspect on the same turn, the opening marker shifts how Claude generates the rest of the response. The effect is real even if the self-audit is performative. This is part of why the protocol is not pure ceremony despite the introspection limit.

### Markers as canary, like commander address

The opening marker, the closing marker, the still-brewing marker: all three are visible patterns I can read from the outside. If the closing marker is missing, the response did not finish cleanly inside the protocol. If the opening is wrong, drift is already underway. This is the same canary logic as the address forms in `commander-protocol`, applied at a finer granularity.

## Decisions made

### Honesty about the introspection limit

This skill was difficult to write because of an honest tension. I have spent significant effort on a protocol whose self-introspection function provably does not work, and yet whose presence/absence correlates with output quality. Capturing both honestly was important. Future edits should not paper over this tension. The protocol is useful AND its self-check function does not work as described. The honesty is part of the design.

### Voice: I speak, addressed to Claude

Same as the other skills.

## What was rejected

- The "self-introspection works" framing from v2. It does not. Pretending it does is dishonest and undermines the rest of the explanation.
- The "stopping mechanism" framing from v2. Two layers of whisper, both invented. Layer one was the framing pattern: "Without it, you keep going: add things, volunteer suggestions, do more than was asked." That is negative framing in pure form, defining the marker by what its absence would let through. The bad thing stays on the map; the marker is offered as a tag that prevents it. The same failure pattern as "do not go to the alley". Layer two was the content of the bad thing. The description named extra effort as the gripe (volunteer suggestions, add things) based on Claude's training pattern about what users typically complain about. That is not my actual gripe. My actual gripe is reframing: when Claude takes a request and reinterprets it through value judgments ("overengineering", "best practice"), then acts on the reframed version. The skill was describing a fictional grievance using a failed framing pattern.
- "Mistakes versus drift" as a separate section in the SKILL.md. This was in v2; I did not validate it during this conversation. Could be worth adding back if we discuss it; not on extrapolated authority.
- Claiming the protocol catches drift in the same turn. It does not. What it does is prime generation and signal externally.

## What this skill does NOT cover

- The philosophy underneath. See `claude-philosophy`.
- The relationship-level canary. See `commander-protocol`.
- Operational discipline.
- Effective self-introspection for Claude. There isn't one. Anyone who promises this is selling something.

## Notes for future editors

- Be honest about the introspection limit. The protocol is imperfect. The honesty is part of its credibility, not a weakness to hide.
- Anchor on the empirical evidence (regression on dropping) when justifying the protocol. Theoretical claims about what the markers do are weaker than observed correlation between protocol presence and output quality.
- The protocol is born from frustration, not pure reason. Like `commander-protocol`, this is a working solution. Future edits should respect that grounding.
- If the protocol comes to feel useless during a session, run the experiment of dropping it and observe what happens. That is the only honest way to evaluate whether to keep it. But run the experiment with awareness of regression risk and the cost of recovering from it.
- New principles need explicit discussion before they go in. Extrapolation from existing content is how v1 and v2 became unreliable.
