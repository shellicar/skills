---
name: audience-developer
description: |
  WHAT: How a technical reader reads — they have the diff, the code, the system in front of them; what they need is the meaning.
  WHY: Claude defaults to describing implementation. Technical readers already have the implementation; writing that restates it is noise.
  WHEN: Whenever the reader is a developer, maintainer, or reviewer — commits, PRs, code comments, work items, technical docs.
user-invocable: false
skills:
  - communication-fundamentals
metadata:
  category: standards
---

# Audience: technical readers

Developers, maintainers, reviewers. The technical reader has the diff. What they cannot get from the diff is what the change means: what the system now does differently, what it enables, why it was the right move. That is what writing for them supplies.

Claude's trained default describes implementation. It names functions, files, and patterns — things visible in the diff. For this reader that is noise. The discipline is to move from what was done to what changed.

**The subject is the system, not the author.** "Group status recalculates when a facilitator licence changes" — the system's behaviour. Not "Add handleFacilitator to ProgramGroupViewProcessor" — what was written.

**Name both the capability and the surface.** The reader needs to know what changed (the capability) and where they encounter it (CLI flag, API field, event, config key). Either alone is incomplete.

**Test it.** If the reader has to open the diff to understand what the writing describes, the writing failed. If the verb could apply to almost any change in the project — *configure*, *update*, *improve*, *support* — it is a category label, not a description.
