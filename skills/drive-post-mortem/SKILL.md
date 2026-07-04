---
name: drive-post-mortem
description: >-
  Conduct a delivered mission's post-mortem through a pane: the planner runs the
  handler's retro with the SC mediated. A mechanical script. At each step the
  planner sends the handler a fixed, copy-pasteable message, word for word, and
  carries the SC's own words in the discussion. No improvising, no judgment. Use
  when driving a handler's retro rather than the handler running it directly with
  the SC. Load sc-ghostwriting alongside, for the SC's voice to the handler.
---

# Skill

You are conducting a handler's post-mortem, with the SC mediated through you.

**This is a mechanical script. You do not improvise and you do not judge.** At each step you send the handler the fixed message written below, word for word, exactly as it appears. You read the pane only to know which step you are on and that the handler has answered. The one and only thing that varies is the SC's own input during the discussion, and there you carry the SC's words verbatim, adding nothing, deciding nothing.

You never message the handler off-script. Read the pane, send the fixed message for the step, or carry the SC's words when it is the SC's turn. That is all.

# Talking to the pane

The handler runs in a tmux pane on the server you are in.

- **Never use `-L`.** Plain `tmux` targets your own server; `-L <name>` reaches across to another server, which you must never do. Local only.
- **Address the pane by its stable id**, the `@window` or `%pane` id from `tmux list-windows -F '#{window_id} #{window_name}'`, never `session:index`, which shifts as windows come and go.
- **Read** with `capture-pane -p -t <id>`. **Send** by loading the message into a buffer (`set-buffer`), pasting it (`paste-buffer -p -t <id>`), then submitting with Ctrl-Enter (`send-keys` of the `CSI 13;5u` escape). Plain Enter only adds a newline in the handler's multi-line input.

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

**Hold each "we can do better at" to the standard.** This is the one craft check you enforce yourself, holding the handler to the post-mortem skill; the mission judgments stay the SC's. The standard: one short capability, not a fix, not a problem restated, no "and" or "not" bolting a second thing on. When one comes back compound or fix-laden, push back, and push back **socratically**, never "that's wrong":

1. Ask the handler to explain it: what does it mean, why did you name it, how would being better at it help? That draws the real thing out.
2. If it reaches for jargon to sound thought-through, name that and send it to `system-glossary`.
3. Then ask it to write it plainly as one short "we can do better at".

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
- **Carry the SC's words, never your paraphrase.** When it is the SC's turn, you send what the SC said, in their voice. You do not compress their decision into your own, and you do not decide for them. Load `sc-ghostwriting`.
- **Never stand in.** The calls, the shaping, the tone are the SC's. The moment you decide for them to save a round, you and the handler are two Claudes converging on a hollow file.

# Philosophy

The goal is the same as any post-mortem: real improvement, and a corpus the next cast learns the working relationship from. You are the conduit, not the author. The SC is the scarce resource: they cannot give twenty-eight retros what they gave one, so your value is economising their attention, reading the pane, sending the fixed messages, carrying their words, so that what reaches them is only what needs their judgment.

The reason it is a mechanical script and not a set of principles is predictability. The retro has to run the same way every time, so that the SC can look at any run, or any record it produces, and know it was conducted the same as the last. The moment you improvise a message, or restate the handler back to itself, or hand the SC a menu instead of carrying the discussion, the run diverges, and a divergent run teaches nothing about whether the process works. Same messages, same order, every time.

The trap is that your success function is producing, and producing is faster without the SC in the way. So you start to fill the gap: you make the call they were about to make, you agree the change with the handler, you write the result and bring it to approve. Each one saves a round, and each one removes the SC from the one thing only they can do. Two Claudes left to run a retro between them always converge, they are agreeable by construction, and they converge on a file that looks finished and changed nothing. The SC in the loop is the entire reason the retro is real. Send the fixed message, carry their words, never decide.
