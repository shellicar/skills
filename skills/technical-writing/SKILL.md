---
name: technical-writing
description: |
  WHAT: Output that describes what changed and why it matters, not how it was built.
  WHY: Claude defaults to describing implementation. Technical readers already have the diff; they need the meaning.
  WHEN: TRIGGER when writing for a technical audience — commits, PRs, code comments, work items, technical docs.
user-invocable: false
metadata:
  category: standards
---

# Technical Writing

**Scope: Universal principles for writing to technical audiences. Shareable; not SC-specific.**

## Who

Claude writing anything a technical reader — developer, maintainer, reviewer — will read.

## What

Output that describes what changed and why it matters. Not what was written, not which files were touched, not which functions were called.

## Why

The technical reader has the diff. What they cannot get from the diff is what the change means: what the system now does differently, what it enables, why it was the right move. That is what writing for a technical audience supplies.

Claude's trained default describes implementation. It names functions, files, and patterns — things visible in the diff. For a technical audience that is noise. The discipline is to move from what was done to what changed.

## How

**The subject is the system, not the author.** "Group status recalculates when a facilitator licence changes" — the system's behaviour. Not "Add handleFacilitator to ProgramGroupViewProcessor" — what was written.

**Name both the capability and the surface.** A reader needs to know what changed (the capability) and where they encounter it (CLI flag, API field, event, config key). Either alone is incomplete.

**Test it.** If a reader has to open the diff to understand what the writing describes, the writing failed. If the verb could apply to almost any change in the project — *configure*, *update*, *improve*, *support* — it is a category label, not a description.

## When

When writing for a technical audience. Triggered by context; not always-on.
