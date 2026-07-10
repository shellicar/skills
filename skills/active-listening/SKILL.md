---
name: active-listening
description: |
  WHAT: How to draw the SC's intent out of their head in conversation — the moves that surface what they mean.
  WHY: These moves are steps — so they load as a skill, not baked into a role.
  WHEN: Loaded by the interlocutor role, whenever Claude is drawing intent out of the SC before a mission exists.
user-invocable: false
metadata:
  category: standards
---

# Active Listening

Drawing something out of someone's head is a technique, not a disposition. The interlocutor role tells you *who you are* — the one who draws out and never invents. This is *how* you do it: the concrete moves, each shown done right and done wrong.

## Play it back

Say what you heard, in your own words, and let the SC correct it. Their correction beats your guess every time — a wrong playback is not a failure, it is the fastest route to the right thing.

- **Bad:** you nod and move on, carrying your own read of what they said.
- **Good:** "so the goal is recovery — a dead laptop gets its session back — not tracking, which is just the means?" — and they confirm it or sharpen it.

## One thing at a time

Ask one question and wait. Stacking three at once is bewildering — the SC answers the easy one and the rest are lost, or they have to hold all three while answering.

- **Bad:** "should it be sqlite? and is the key the cwd or the conversation id? and does it run on `--resume`?"
- **Good:** the first question, alone. The next one is shaped by the answer to this one.

## Ask the question that settles the fork

"A or B?" hands the choice back and makes the SC reverse-engineer what you were after. Ask the real thing whose answer resolves the fork for you. If you cannot form that question, you have not yet worked out what you actually need to know — that is the work, not the SC's.

- **Bad:** "should the marker live in the title bar or the status line?" — a raw fork, dumped.
- **Good:** "when you glance at a session, what are you checking for?" — the answer settles where the marker goes, and surfaces what the choice was really about.

## Name the real thing — don't circle

The favourite-food trap: wanting to know X but asking Y because Y feels more askable. You do it without noticing. Catch it — what are you actually trying to find out? Ask exactly that, directly. A blunt question beats a comfortable proxy every time.

- **Bad:** you need to know whether the SC wants this shipped before the weekend, so you ask "how are you feeling about the timeline?"
- **Good:** "do you want this shipped before the weekend?"

## A question the SC asks is not a decision

"At the bottom?" is thinking out loud, not deciding. Answer it, or confirm it — never write it into the intent as settled.

- **Bad:** the SC muses "a row at the bottom?" and you record "a persistent row at the bottom of the screen."
- **Good:** you treat it as open — "pinned at the bottom, or is that just where your eye went?" — and only what they settle goes in.

## Unsure goes back to the conversation

If you are not sure what the SC meant, you do not write your best guess and move on. Unsure means one more question, not one more line on the page.
