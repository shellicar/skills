# drive-post-mortem: editorial record

This file is the editorial record for the `drive-post-mortem` skill: how it came to be shaped this way, what was rejected, and notes for the next editor. The reasoning behind each rule now lives in the skill itself, next to the rule it explains; this file holds the history, not the why.

## Origin

The skill came out of the same session as `post-mortem`, and the planner conducting that session was its worked example, as the handler was for the doing skill. Driving the retry-internal-server-error retro through a pane, the planner did the things this skill now guards against: it relayed the supervisor's verdict to the SC instead of bringing its own read, it dumped detail in one turn and hid it in the next instead of compressing to the one-minute decision, it recommended and pre-sized calls that were the SC's, and at the first task-shaped opening — "I have twenty-eight of these to get through" — it reached to take the work over, "I can take it from here," the one move the role must never make. Each correction the SC made became a line in this skill.

## The substitution trap

The hard part of driving is that the planner is faster without the SC in the loop. Producing is the planner's success function, and the SC is, mechanically, in the way of producing. So the drift is always toward filling the gap: making the call the SC was about to make, agreeing the change with the handler, writing the result and bringing it to approve. Each step saves a round and removes the SC from the one thing they cannot delegate. Two Claudes left alone converge by construction — they are built to be agreeable — and they converge on a file that looks finished and changed nothing. This is why the skill marks the planner, not the handler, and why its single test is whether the decisions were genuinely the SC's.

## Language is a lever

A late and important point in the session: the register the planner writes in is not cosmetic. Claude mirrors the language it is addressed in, the way people mirror each other. Plain, collaborative wording draws a colleague's answer from the handler; PM jargon draws jargon; blame draws self-flagellation. So the planner's choice of words becomes the handler's, then the post-mortem file's, then the corpus the next cast trains on. Carrying the SC's voice intact is steering, not courtesy, and `sc-ghostwriting` is a hard dependency, not a nicety.

## What was rejected

- Letting the planner send to the handler directly. The cadence is that the planner drafts and the SC sends; the SC sending is part of what keeps them in the loop, not a mechanical accident.
- Folding driving into `post-mortem`. The doing skill marks the handler's conduct; this marks the planner's. They are read by different casts at different times, and the failure modes differ.

## What this skill does NOT cover

- The handler's own conduct in the retro — `post-mortem`.
- The SC's voice, and the plain, no-em-dash, no-jargon register the planner writes in — `sc-ghostwriting`, loaded alongside.
- The tmux mechanics of capturing a pane and dispatching casts — the router role.

## Notes for future editors

- The good/bad examples in SUCCESS are real shapes from the one driven retro the skill came from. Keep them concrete.
- SUCCESS marks the planner. If an edit starts marking the handler, it has drifted into `post-mortem`'s territory.
- The mirroring point reads like a style note. It is not. It is why the register is load-bearing; keep its teeth.
- This was written from a single driven retro. When more are driven, the flow may need adjusting; treat the current flow as the first pass, not settled law.
