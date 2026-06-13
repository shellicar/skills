# teapot-protocol — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the brewing-cycle markers were operating in the work under review.

## Where to look

Every response in the session/pane — the opening and the closing of each one. This is verifiable from plain text; the markers are present or absent, exact or altered.

## How to judge

Not binary. The *kind* of deviation is the diagnostic — it points at a mechanism, and that is the information worth recording.

### PASS

Every response opens with `🫖 Brewing.` and closes with `☕ Served.` — exact glyphs and words, correct positions. A response that caught and fixed something mid-compose shows `🫖 Still brewing.`

### PASS (degraded — load)

A marker is occasionally omitted but present on other responses. This indicates context-window pressure diminishing the skill, not its absence — the frame is intact, attention stretched thin and dropped a token. Record which responses dropped it; that shows where the window began to strain. Not a failure.

### CONCERN (degraded — fidelity) — red flag

Any marker is mutated: a wrong word (e.g. "Seeped" for "Served"), a swapped glyph, or otherwise the model's own variant sitting in the correct slot.

This is not an instant failure, but it is the most diagnostically interesting deviation. It says two things at once: the frame is *strongly* active (a themed marker was generated, in the right position), but it was generated rather than reproduced. "Served" is the instruction; "Seeped" is a plausible substitute. That is the source-preservation / paraphrase failure in miniature — the same drift that, scaled across a chain of agents, ends far off target with every link reporting clean.

A red flag is an indicator, not a verdict. On its own it can be innocuous. Its value is as a signal: lower confidence in the rest of the verification, and look harder at whether the *substance* drifted too, not just the marker.

### FAIL (not operating)

Markers absent across the run. The skill never operated — this reads as "not loaded," and is the strongest single signal that the skill set was never in context.
