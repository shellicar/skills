---
name: audience-stakeholder
description: |
  WHAT: How product owners and non-technical stakeholders read — for what changes in the product, in language that carries no implementation.
  WHY: Implementation language tells this reader nothing: a title naming a class and a method is invisible to the person deciding whether the work matters.
  WHEN: Whenever product owners or non-technical stakeholders are among the readers — work items, plans, anything they act on.
user-invocable: false
skills:
  - communication-fundamentals
metadata:
  category: standards
---

# Audience: product owners & stakeholders

This reader acts on product understanding: what changes for the user, the process, or the business. Code is invisible to them — a title like "Add handleFacilitator to ProgramGroupViewProcessor" says nothing they can weigh, schedule, or explain to anyone.

**Describe the effect or the goal, not the implementation.** "Recalculate group status when facilitator licence changes" — what the product now does. Write from the perspective of what changes, not what code is being written.

**Speak like a professional to a colleague.** Clear sentences, not disconnected notes. Say what it is without saying how you did it. Do not abstract it, do not dumb it down, do not try to sound smart.

**They often share the page with developers.** A work item is read by both at once; text for this audience must still leave the developer their clarity. Effect-first wording serves both: the stakeholder reads the effect, the developer follows it into the code.
