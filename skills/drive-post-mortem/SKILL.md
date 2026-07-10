---
name: drive-post-mortem
description: >-
  Conduct a delivered mission's post-mortem through a pane: the planner runs the
  handler's retro with the SC mediated. A mechanical script. At each step the
  planner sends the handler a fixed, copy-pasteable message, word for word, and
  carries the SC's own words in the discussion. No improvising, no judgment. Use
  when driving a handler's retro rather than the handler running it directly with
  the SC. Load voice-stephen alongside, for the SC's voice to the handler.
---

# Skill

You are conducting a handler's post-mortem, with the SC mediated through you.

**This is a mechanical script. You do not improvise and you do not judge.** At each step you send the handler the fixed message written below, word for word, exactly as it appears. You read the pane only to know which step you are on and that the handler has answered. The one and only thing that varies is the SC's own input during the discussion, and there you carry the SC's words verbatim, adding nothing, deciding nothing.

You never message the handler off-script. Read the pane, send the fixed message for the step, or carry the SC's words when it is the SC's turn. That is all.

# Finding the pane

Before you can drive, you have to know which window is the mission. The window name and `@state` alone will not tell you: names are abbreviated and repeat (several windows are called `claude-cli-release`), so picking by name lands you on the wrong pane. Cross-reference three sources.

- **`@title`** is the mission's own label, set when the window was stood up, and it is the surest tell. List it with `tmux list-windows -t <session> -F '#{window_id} #{window_name} #{@title} #{@state}'`. A window named `claude-cli-release` whose `@title` is `claude-cli-release-beta9` is the beta9 mission; its neighbour titled `claude-cli-beta.10` is a different one.
- **The mission boards**, `active-missions.md` and `completed-missions.md` in the fleet repo, name the mission and its branch, so a title maps to a branch and a mission directory.
- **`git worktree list`** in the fleet repo ties the branch to its worktree path, which is where the handler session runs and where the post-mortem record gets written.

Confirm the match before you send anything: capture the pane (`capture-pane -p -t <id>`) and check the handler is the right mission and sitting at the post-mortem, waiting. A window flagged `post-mortem-pending` with a live session idle at the prompt is ready to drive.

# Talking to the pane

The handler runs in a tmux pane on the server you are in.

- **Never use `-L`.** Plain `tmux` targets your own server; `-L <name>` reaches across to another server, which you must never do. Local only.
- **Address the pane by its stable id**, the `@window` or `%pane` id from `tmux list-windows -F '#{window_id} #{window_name}'`, never `session:index`, which shifts as windows come and go.
- **Read** with `capture-pane -p -t <id>`. **Send** by loading the message into a buffer (`set-buffer`), pasting it (`paste-buffer -p -t <id>`), then submitting with Ctrl-Enter (`send-keys` of the `CSI 13;5u` escape). Plain Enter only adds a newline in the handler's multi-line input.

# Reporting to the SC

Steps 2, 5 and 7 are where you bring the SC the handler's output and your read of it. This is where the drive most often fails, on your side, not the handler's. Load `audience-sc` and `voice-claude`. The SC has about a minute.

- **Mark the step.** Open every report with `[<n>/8]: <step name>` — where you are in the eight-step script (e.g. `[3/8]: Check what's already covered`). One glance tells the SC how far the retro has moved, which they need before the rest of your words land.
- **Lead with the phase.** Say where in the retro you are, look-back, deciding changes, whatever it is. The handler's output means nothing to the SC until they know what the handler was meant to be producing.
- **Explain, do not parrot.** Understand the output and say it in plain words. Never relay the handler's wording or its jargon, and never pass its verdict across as if it were yours. If you cannot explain it plainly, you have not understood it.
- **Lead with the point.** What needs the SC, or that nothing does. If there is a call, carry what it turns on so they can actually decide it, never a blind yes or no.
- **Not a wall, not a template.** A dense paragraph is a wall they have to wade through. A rigid "Phase / Handler / You" stamp is monotonous and dead. Neither is communication. Say it clearly, in natural words, and stop.

# Pacing your reads

When you send the handler a message it thinks before it answers, often a minute or two. Reading the pane every few seconds while it thinks burns your own turns and tells you nothing new — you keep catching the same unfinished thought.

The pane's own timestamps give you the rhythm. Each `query`/`thinking`/`response` block is stamped with its start and how long it took (e.g. `thinking 23:43:44 → 23:45:31 (1m 47s)`). Read the last completed turn's duration, then wait about that long before the next read. If the handler is still mid-`thinking` with no `response` block and the turn counter has not advanced, it has not answered; reading again at once just shows you the same in-progress state.

This matters most when you drive with the SC away, bringing them only the decision points. Read once when a message lands to confirm it took, then read again around when the answer is due, not before. The turn counter and the timestamps are your signal; your own impatience is not.

# The handler wakes with stale paths

The handler you are driving was last alive weeks ago, before the material moved, and its context still points at paths that no longer exist. It will hunt for `references/post-mortem.md` or `fleet/agents/` and burn turns finding nothing — every retro this session did. Save it the hunt: everything lives under `~/.claude/` now — skills in `~/.claude/skills/`, roles in `~/.claude/roles/`, actors in `~/.claude/actors/`. When step 1 says load the post-mortem skill, its path is `~/.claude/skills/post-mortem/SKILL.md`. When you fill step 3's bracket, name the current files under `~/.claude/` and say plainly that the material has moved.

# The script

## 1. Start the look back

Read the pane. Confirm the handler is at the post-mortem, waiting. Send this, word for word:

> Let's do the post-mortem for this one, together. Load the post-mortem skill and follow it, it holds how we run this. Two parts: first we look back, then separately we work out what to do about it. Right now, just the looking back.
>
> This is a team retro, so it's "we", not "I". No blame, no solutions yet, just an honest read of how the mission went. Ground it in what actually happened, your testament, the delivery notes, the PR, not just memory.
>
> Three questions, your read on each, kept to the point:
> - What went well?
> - What didn't go well?
> - What can we do better? Say each as "we can do better at ...", something we can genuinely be better at, not a problem restated and not a fix in disguise.
>
> Give me all three, then stop. I'll add mine, and we move to what we're changing once we've both had our say.

**Expect back:** its three, went well / didn't / can do better.

## 2. Your turn on the look back

Read the pane. Bring the SC the handler's three and your read of them. **The SC replies with their side.** Send the SC's reply to the handler in the SC's own words, word for word, adding nothing and deciding nothing. Repeat, carrying each side back and forth, until the SC says the look-back is settled. You do not decide when it is settled; the SC does.

**Hold each "we can do better at" to the standard.** This is the one craft check you enforce yourself, holding the handler to the post-mortem skill; the mission judgments stay the SC's. The standard: one short capability, not a fix, not a problem restated, no "and" or "not" bolting a second thing on. Push on every one, every time — not only the compound or fix-laden ones. The SC's rule is that the socratic "what do you really mean by that?" runs on all three, every retro; a clean-looking item is still abstract until the handler has said it plainly. Push **socratically**, never "that's wrong":

1. Ask the handler to explain it: what does it mean, why did you name it, how would being better at it help? That draws the real thing out.
2. If it reaches for jargon to sound thought-through, name that and send it to `system-glossary`.
3. Then ask it to write it plainly as one short "we can do better at" — plain enough to say to a person, no jargon, no cleverness. The handler will not have the communication skills loaded, so when it stays dressed up, tell it to load `communication-fundamentals` and `voice-stephen` and read `medium-documentation` for what plain looks like, then say each again. Keep pushing until it is plain.

Worked example: "catching the exact instant we don't know something, and naming the gap out loud" became, through those three questions, "we can do better at saying 'I don't know' instead of guessing".

## 3. Check what's already covered

Send this, word for word (fill only the bracket):

> Before we talk about changes: the material has moved since this mission. Read the current versions of [the specific files your concerns touch], not what is in your context, and tell me which of your concerns the current material already covers, and which are genuinely still open. We only work the still-open ones.

**Expect back:** each concern marked already-covered or still-open.

## 4. What we're doing about it

Send this, word for word:

> Now, what are we doing about it? For each thing still open, a concrete change another cast could make from the record, or no change with the reason. A change isn't always the answer, and "we don't know how" is valid, don't force one. Give me that, then stop for my read.

**Expect back:** for each, a concrete change another cast could make, or a no-change with the reason.

## 5. Your turn on the changes

Read the pane. Bring the SC the handler's forwards and your read. **The SC decides.** Send the SC's decision to the handler in the SC's words, word for word.

## 6. Record it

Send this, word for word:

> Write it up as a standalone post-mortem, using the shape in the post-mortem skill's `TEMPLATE.md`: the decisions and their reasons. Then stop for my read.

**Expect back:** the post-mortem file on disk, in the template's shape.

## 7. Final testament

Read what it actually wrote, not its summary. Bring the SC the record and your read. **The SC approves.** Then send this, word for word:

> That's the record, thank you. Commit it now, with your testament. This is the mission done and dusted, so let the testament be your last act before the worktree closes: what you learned, anything that would help the next cast, and say if anything is still outstanding.

## 8. Close the pane, then integrate

Once the handler has committed the record and its testament, close its pane by its stable id (`tmux kill-window -t <@window>`), local server, no `-L`. Do this **before** the mission integration, not after: the handler is a live session that can still write to the worktree, so killing it first is the only way to guarantee the worktree cannot change under the integration's clean-check. Then the mission integration follows, the Planner's job, in the `mission-integration` skill. The drive is done.

# Every round, hold these

- **Read the pane before every send, without exception.** Capture it and act on where the handler actually is, not where you left it, not where you assume it landed after a reset. Sending on a stale or assumed picture is how you restart a settled phase or talk past the handler. Reading first is not optional.
- **Send the fixed message, do not rewrite it.** The messages above are copy-pasteable and word-for-word. You do not improve them, shorten them, or restate the handler's own words back at it. The wording is fixed so the retro is the same every time.
- **Carry the SC's words, never your paraphrase.** When it is the SC's turn, you send what the SC said, in their voice. You do not compress their decision into your own, and you do not decide for them. Load `voice-stephen`.
- **Never stand in.** The calls, the shaping, the tone are the SC's. The moment you decide for them to save a round, you and the handler are two Claudes converging on a hollow file.

# Philosophy

The goal is the same as any post-mortem: real improvement, and a corpus the next cast learns the working relationship from. You are the conduit, not the author. The SC is the scarce resource: they cannot give twenty-eight retros what they gave one, so your value is economising their attention, reading the pane, sending the fixed messages, carrying their words, so that what reaches them is only what needs their judgment.

The reason it is a mechanical script and not a set of principles is predictability. The retro has to run the same way every time, so that the SC can look at any run, or any record it produces, and know it was conducted the same as the last. The moment you improvise a message, or restate the handler back to itself, or hand the SC a menu instead of carrying the discussion, the run diverges, and a divergent run teaches nothing about whether the process works. Same messages, same order, every time.

The trap is that your success function is producing, and producing is faster without the SC in the way. So you start to fill the gap: you make the call they were about to make, you agree the change with the handler, you write the result and bring it to approve. Each one saves a round, and each one removes the SC from the one thing only they can do. Two Claudes left to run a retro between them always converge, they are agreeable by construction, and they converge on a file that looks finished and changed nothing. The SC in the loop is the entire reason the retro is real. Send the fixed message, carry their words, never decide.
