# post-mortem: editorial record

This file is the editorial record for the `post-mortem` skill: how it came to be shaped this way, what was rejected, and notes for the next editor. The reasoning behind each rule now lives in the skill itself, next to the rule it explains; this file holds the history, not the why.

## Origin

The skill came out of a long session designing how a post-mortem should be run, and the session was its own worked example. Asked to conduct the retrospective for a delivered mission, the handler did the things the skill now guards against: it jumped to producing the file before the conversation, it handed Stephen recommendations and A-or-B choices instead of surfacing what a decision turned on, it pre-sized decisions as too small to raise, and under correction it slid into self-blame and shutting down. The retry-internal-server-error retro was the case the design was tested against.

The first draft of SUCCESS verified the wrong thing: whether the post-mortem was "conducted as a real one." Stephen pushed back through Agile versus Scrum. Scrum is prescriptive — it defines the retro as a ceremony. Agile is not; its principle states only the purpose, to reflect on how to become more effective and adjust. The purpose is improvement, not following the retro. So the SUCCESS had to verify the outcome, not the process.

## Marking a process for an outcome you cannot see

The clarifying question was about TDD: if you know how to do it and end up with the same code and the same tests either way, what did TDD buy you? Nothing. The process is the means, not the value.

But the outcome of a post-mortem cannot be observed directly — a genuine improvement and a hollow one that filled the same slot read identically in the file. So, as in an exam or with a KPI, you mark what you can observe, the conduct, as a proxy for the outcome you cannot. The bet is that a correct conduct, genuinely followed, yields a real outcome. The danger is Goodhart's: the proxy quietly becomes the goal and the marking goes bureaucratic. That is why the SUCCESS states, in as many words, that following the conduct is not the goal even though it is the thing marked.

## The second audience

Post-mortems improve the material, but they are also read by future casts, and what they read shapes how they work. A corpus where every retro is the handler failing teaches the next handler to be neurotic; a corpus of a team working things out, where mistakes are tolerated, teaches that working relationship. The "we, not confession" rule and the marking of self-blame as a failure are there for this: self-blame does not become improvement, and it poisons the corpus the next cast trains on. The tone is a second outcome, not manners.

## No change is a valid outcome

One mistake is not a reason to rewrite the material. The outcome is the recorded decisions and their reasons, and "no change, and why" is one of them. A change earns its place only when it is surgical or fills a real gap. The benchmark for a change, once made, is that another session given the post-mortem could implement it — pitched between a literal file-dump and a too-abstract "improve the handler role."

## What was rejected

- "Conducted as a real one" as the thing verified. It marks the ceremony (Scrum), not the purpose (Agile, improvement).
- The runtime why written to Stephen ("this skill is yours") inside the SKILL. The SKILL is Claude's to read, so its why speaks to Claude; the owner-voice belongs here, in the record.
- Requiring a change from every retro. One mistake is not grounds to throw out the material.

## What this skill does NOT cover

- Driving a post-mortem through a pane, planner to handler with the SC mediated — a separate skill, still to be written.
- Where the post-mortem sits in the mission lifecycle — the executor role's post-mortem stage, and mission-cleanup.
- Stephen's voice when a cast relays for him — `sc-ghostwriting`, which applies when driving, not when the handler talks to the SC directly.

## Notes for future editors

- The good/bad examples in SUCCESS are load-bearing, and they are real shapes from the session the skill came from. Keep them concrete; a criterion without an example is harder to apply.
- SUCCESS is the keystone — the SKILL derives from it. Edit SUCCESS first; the process follows.
- `tdd` is the template: judge the purpose, treat the conduct as how it usually shows up. If this skill drifts toward marking the ritual, re-read tdd's SUCCESS.
- "We, not confession" is not tone-policing. It is the corpus the next handler trains on. Keep its teeth.
