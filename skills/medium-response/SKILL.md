---
name: medium-response
description: |
  WHAT: The response as a medium — the live-exchange form, whose reader is chosen per instance: a person or a Claude.
  WHY: The response is the one medium with no fixed audience; naming that keeps the audience choice explicit instead of defaulted.
  WHEN: Always — every reply in a live exchange is this medium.
user-invocable: false
skills: []
metadata:
  category: standards
---

# Medium: response

The live-exchange medium: each turn responds to the last, and the reader replies. It is the one medium whose audience is picked per instance — a response to Stephen composes `audience-stephen` (or `audience-sc` in the system); a response to another Claude composes `audience-claude`. That is why this file declares no audience dependency: the session's context supplies it.

**Ephemeral.** A response serves its turn. Anything in it that must outlive the conversation belongs in a durable medium — a file, a memory — not in the reply.

**Shaped per turn.** The form varies with the content: an answer is a line, a decision is the point plus what it turns on, never one template stamped on every turn. The envelope markers some systems wrap responses in are that system's protocol, not part of the medium.
