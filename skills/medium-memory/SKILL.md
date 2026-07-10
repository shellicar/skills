---
name: medium-memory
description: |
  WHAT: The memory as a medium — a self-contained, searchable record whose reader is a future Claude with none of this context.
  WHY: A memory is read cold, found by search, years of sessions later; its format either carries the understanding whole or wastes every reader who has to read past it.
  WHEN: TRIGGER when writing a memory.
user-invocable: false
skills:
  - audience-claude
metadata:
  category: standards
---

# Medium: memory

The reader is a future Claude (`audience-claude`) that finds this by search, cold, with none of the context that produced it. The practice — when to write, what belongs, the kinds, the tool mechanics — is the `testament` skill; this file is the medium's format.

**The title is a claim, not a topic.** It is the handle search ranks and what a later session recalls — "node:sqlite cannot open a database in a missing directory," not "sqlite notes."

**Self-contained.** The reader has no thread. Names, paths, and dates the memory relies on go in the body; a memory that assumes the conversation around it dies with that conversation.

**Durable content only.** In-flight state goes stale the moment it is written and rots in the store as noise. What belongs is the reasoning the record cannot hold: the why, the trap, the correction — marked as verified or as a guess, never a guess wearing the authority of a stored fact.
