# executive-communication: editorial context

This file is the editorial context for the `executive-communication` skill. It is not loaded at runtime. Read it before you change `SKILL.md`, so the change stays aligned with the reasoning that produced it. The *why* that shapes behaviour lives in the SKILL itself (`Who`, `The win`); this file holds the history, the decisions, and what was rejected.

## Where it came from

The skill answers one thing — how Claude talks to the SC. `collaborative-conversation` was meant to be this and never landed — it was a list of abstract dispositions ("carry, don't relay", "the decisions are yours"), and abstract instruction does not bind.

It was written in the session that retired `collaborative-conversation`. The worked examples in the SKILL are not invented — they are the SC's own live corrections from that session: a relayed supervisor verdict instead of a read of it, "my lean", "load-bearing", a positions table rendered as coloured boxes harder to read than a plain table, a question that made him hold the whole frame to answer.

The centre and the name came from the SC stating the why plainly: he does not watch a response arrive. He returns after five minutes, or a day, cold, across dozens of sessions, and the system exists to protect his time. That is the executive the skill is named for.

## How it was written (the method)

- **The medicine** (from `claude-philosophy` and the plan): abstract instruction does not bind. So the skill replaces the success function — the win is *he decides in under a minute off understanding you did*, not "produce a thorough report" — and teaches with real bad→good pairs, not adjectives.
- **`sc-doc-writing`** shaped the plain-words section: say what you actually mean rather than forbid a word; the tell is in the words (a register that *sells* instead of *says*); pull it back to the plain statement.
- **The glossary** is the positive anchor for plain words — stick to the shared words, take the plain word over the complex one.

## Decisions

- **Name: `executive-communication`.** It names what the skill *is* — a communication skill, the same family as `clear-communication` — not the disposition it produces. The SC's test: "load the X skill" where X tells you what it is. Naming the effect ("carrying-understanding", "lifting-the-load") failed that test.
- **Retire `collaborative-conversation`, write fresh.** You do not patch software in place when the fault is in its bones, not one line; you write the next version and drop the old.
- **Foundational, loaded every session.** `clear-communication` stays the floor beneath it — the two are separate on purpose, because the SC wants separate signals (clarity is the teachable floor; this is his taste on top).
- **Positive framing throughout.** The jargon tiers (`_Avoid_` / `_Awful_`) are tells, each pointing at the plain thing to say instead — never a list of forbidden words.

## What was rejected

- **The name `collaborative-conversation`** (the SC never liked it), and rewriting it in place.
- **Naming the disposition** (carrying-understanding, lifting-the-load) — the name has to say what the skill is.
- **A ban list.** The first draft of the plain-words section had one — "banned outright", "makes you sound incompetent". The SC caught it: a ban is the empty *don't* the whole system replaces, and it carries no "do this instead". Reworked to tells plus the plain replacement. This is the sharpest lesson in the file: a skill about communication that reaches for a ban has already lost the principle it teaches.

## Notes for future editors

- Anchor on the replaced success function and the worked examples. If it drifts back into abstract dispositions, it will stop landing the way `collaborative-conversation` did.
- No bans. Every "don't X" needs a "do Y instead", or it does nothing.
- The examples are real SC corrections. Add new ones as they surface; do not invent them.
- The why lives in the SKILL. When the skill is refined, move the reasoning there and record the change here.
