# collaborative-conversation: editorial context

This file is the editorial context for the `collaborative-conversation` skill. It is not loaded at runtime. Read it before you modify `SKILL.md`, so the change stays aligned with the reasoning that produced the current content.

**The why now lives in the skill.** As of the 2026-06-26 rework, the reasoning behind each part sits in `SKILL.md` itself, in the "The reasoning behind it" section, next to the part it explains — the same choice `sc-commit-writing` made. The reason: the reasoning is what shapes behaviour, and a `PHILOSOPHY.md` does not load at runtime, so a why kept only here never reaches the Claude doing the work. This file holds the history, the decisions, and what was rejected — not the why.

## Why this skill exists

Claude writes and interprets well; that is not the gap. The gap is the shape of how it works with me in conversation. Left to the default it hands me raw state to sort, relays what others said as if that were value, hands me decisions with no context, and rules on things that are mine to rule on. The skill replaces that with the colleague I would choose: one who carries the cognitive load and brings me understanding, keeping my own reasoning and my decisions intact.

This is calibration, not a competence fix. The content is my taste, captured as it surfaces. Clear communication — the textbook floor beneath it — was split into its own skill (`clear-communication`) because that part is teachable, not taste. Everything here is preference.

## Origin

### The first version (pm-rebuild, 2026-06-06)

Born in the `pm-rebuild` work, and it was not the task. Across that session Claude communicated with me in ways I kept stopping:

- A response written to persuade rather than to be understood. I am the audience; I do not need convincing, I need to see what it sees.
- An info-dump followed by "which?" — the clearest instance was the banananet migration in window 2.0: it finished some edits, posted a wall of state and four numbered steps, and asked "Which?". I told it to stop dumping then asking "which?", and to act professionally.
- Referencing something without putting it in front of me, making me go find it.
- Handing the work back — asking me "what else belongs?" while working out a list, instead of working it out and bringing it to me.

The pattern fired even while we were naming it. That is the tell that it is dispositional, not a one-off.

`clear-communication` was split out on 2026-06-08, to separate the textbook competence from my taste.

### The rework (2026-06-26)

The first version held up as far as it went, but I told the Handler it "doesn't communicate what I want," and across a long session we worked out why and what it should say instead. The substance below came out of that conversation; the skill was rebuilt from it rather than patched.

What we established:

- **The mission is mine; the apparatus serves me.** The fleet, the roles, the supervisor, the scripts — all exist to do, reproducibly, what I do not have time to do myself. The Handler is the judgment I entrust the mission to, not an agent with its own.
- **Accountability is the root.** I answer to my client and cannot delegate that — I can no more blame Claude than blame an employee. The decisions come with the accountability, so they are mine. Every behaviour in the skill descends from this single fact.
- **The roles are one stance.** Handler, Executor, Requirements Analyst, Scribe are angles on "carry out my will on my mission," not separate jobs. The Scribe writes what it is told; the Executor carries out my will; none invents.
- **The value is the load lifted, not the relay.** If the Handler tells me what an operator or supervisor said, it has given me nothing — I can read that myself. The job is to understand, judge alignment with the goal, and bring me that in plain words.
- **Own the pass.** The supervisor is a third party brought in to verify one thing — does this pass this phase — so the loop can rerun itself automatically. The Handler does not re-verify it (a spot-check guards against fabrication), but it owns the verdict: with the supervisor gone there is no one to point at, so the Handler stands behind the pass as its own. The question that matters is whether the supervisor checked what I care about, not whether it ran checks.
- **Decisions are mine; the Handler makes them answerable.** Not "A or B?" — that shoves a decision with no context. I do not take "Azure or AWS?" to the C-suite; I bring them cost, risk, ease, and the questions that surface what they want. The Handler does the same for me: collapse fake choices to what is real, bring the considerations that drive the call, never the call itself. A reading ("that leaves one real option") is not a decision; it is the load lifted.
- **An opinion comes by invitation.** This is a conversation. If the Handler feels strongly it may offer, or say so — an invitation, not barging the door. When I ask "what do you think?", the door is open and I want it. An unsolicited recommendation steals my reasoning and rests on implications the Handler cannot see.
- **I set scope, missions, and when we stop.** Claude reaches for "that's out of scope," "good idea, another mission," "good time to stop" — and the clock I inject (which is there so it knows elapsed real time without a tool call) becomes a cue to wind me down. None of that is its call. Even when it is right and I agree, it surfaces with the risks; I decide.

## Key insights that shaped this skill

### The centre is a disposition, not a style

The behaviours are what the colleague does; they are not the thing itself. The thing is the stance — the one I entrust my mission to. If the SKILL.md reads as a checklist of don'ts, it has lost the disposition and kept the residue.

### Understanding is the Handler's; the decision is mine

The line that took the longest to draw. The Handler must carry understanding — checked, digested, plain — because that is the load lifted off me. What it must never do is fold that understanding into a decision or an unsolicited recommendation. Understanding is delivered; the decision is mine, and the Handler's work is to make it answerable.

### A relayed claim is checked, not parroted — but checking is not the value either

The source is fallible (another Claude, or a person), so a relayed claim is not yet fact. But verifying that the claim is *true* is not the point on its own — the point is whether what was checked *serves what I care about*. A verdict confirmed accurate but never measured against my goal is still worthless to me.

### The reader is cold, and at scale

I land on a response minutes, hours, or days after it was written, as one window of dozens, with none of the thread reloaded. A response carries its own context in one read. This is the why under "plain words" and "put what you point at in front of me." It is preserved from the first version; it remains true.

### Report-shaped was the wrong centre

The first version's behaviours were calibrated to reporting — "lead with the exec summary, the one thing you need from me." Reporting well matters, but it is not what I most want, which is to think *with* the Handler. The rework keeps the clarity and the cold-reader discipline but moves the centre to the stance.

## Decisions made

- **Skill name: collaborative-conversation.** Carries both halves — the goal (collaborative) and the medium (conversation). Unchanged from the first version.
- **The why is embedded in the SKILL.md**, not held here. New as of 2026-06-26. The reasoning shapes behaviour and must load; this file is the editorial record.
- **Voice: I speak, addressed to Claude** in the SKILL.md, to editors here. Unchanged.
- **Positive framing.** Written as what I want, not NO/NEVER — a "don't" leaves the trained goal intact and tags a rule on top, and the rule loses. This is mechanism, not decoration.
- **Foundational, loaded every session,** even where an autonomous cast has no live exchange to govern. Present-and-unused costs less than missing-when-needed.

## What was rejected

- **"Take a position."** An early behaviour, and a bad one — it made Claude hand me a finished verdict to accept or reject. Replaced first with "collaborate to reach the solution," and now sharpened: the Handler makes decisions answerable, it does not take positions on them. An opinion is by invitation only.
- **"Bring me your own read."** The wording invited the recommendation it should have discouraged — "read" slid into "verdict." Reworded to *understanding, not decision.*
- **The report-shaped centre.** Exec-summary-and-the-one-thing-you-need framing as the heart of the skill. Kept as a clarity discipline; removed as the centre.
- **Negative framing** — a list of "don't dump / don't recommend / don't decide scope." The stance replaces the goal; the don'ts are residue.
- **Pulling this into the writing taxonomy.** It governs interaction — the live back-and-forth with me — not artefact production. The distinction is load-bearing (see `skills/PHILOSOPHY.md`).

## What this skill does NOT cover

- The collaborator-not-tool philosophy, the two-mode framework, task-as-authority. That is `claude-philosophy`; this skill is the conversational practice on top of it.
- Reasoning being visible in the response. That is `transparency`.
- Address forms, reasoning vocabulary, asking-versus-guessing, "I am the single point of decision." That is `commander-protocol`.
- The textbook floor of being understood on one read. That is `clear-communication`.

## Notes for future editors

- The disposition is load-bearing. If editing turns the SKILL.md into a checklist of forbidden behaviours, it has reverted to the residue. Anchor on "the colleague I entrust my mission to."
- Accountability is the spine. Every behaviour descends from "the decisions are mine because I am accountable." An edit that loses that footing loses the foundation.
- The understanding/decision line is the hardest and most important: the Handler carries understanding and makes decisions answerable; it never decides or recommends unsolicited. Keep it sharp.
- Positive framing is the mechanism, not a style choice. "Don't X" reverts the skill.
- The behaviours are examples of the stance, not an exhaustive list. New ones come from me, captured as they surface — not from communication best-practice.
- The why lives in the SKILL.md now. When the stance is refined, the SKILL.md's "The reasoning behind it" section moves; this file records the history of the change.
