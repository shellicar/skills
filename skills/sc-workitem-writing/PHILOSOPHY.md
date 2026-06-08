# sc-workitem-writing: editorial context

This file is the editorial context for the `sc-workitem-writing` skill. Read it before modifying `SKILL.md`.

## Why this skill exists

Work items are read by two audiences with different needs: developers who need implementation clarity, and stakeholders who need to understand product change. An implementation title ("Add handleFacilitator to ProgramGroupViewProcessor") tells a developer what was done but tells a stakeholder nothing. An effect title ("Recalculate group status when facilitator licence changes") works for both.

The same pressure applies to descriptions. Note-style writing ("Schema now uses js-joda types. mapToJson must handle them.") is disconnected and hard to act on for anyone. Connected prose, written as a professional speaking to a colleague, works for both audiences.

## Origin

The failure appears in work item titles that read as implementation tickets: which class to update, which function to add, which file to change. These make sense to the developer writing the ticket. They exclude the stakeholder reading the board. A product manager or executive scanning the backlog cannot tell from these titles what the product will do differently.

Work item descriptions follow the same pattern. Claude produces disconnected notes — a list of things that need to happen, in the register of a developer's internal notes rather than a professional description. These are hard to act on even for the developer.

## Key insights

### Mixed audience is the distinctive challenge

Commits are read by developers. Work items are read by developers and PMs and sometimes executives. The same text serves all of them. Effect-focused titles work across that range; implementation titles work only for the narrowest part of it.

### "Professional speaking to a colleague" covers the full range

The description register that works for mixed audiences is not dumbed down, not over-technical, not note-style. It is what a capable person would say to another capable person of unknown technical background. Connected sentences, effect-focused, enough context to understand without needing the code.

## What was rejected

- Treating work items as purely technical artifacts. The stakeholder audience is what makes them different from commits.

## What this skill does NOT cover

- Commit messages — `sc-commit-writing`
- PR text — `sc-pr-writing`
- Broader professional or stakeholder communication — `professional-writing` (when it exists)

## Notes for future editors

- The mixed-audience constraint is load-bearing. An edit that makes this skill purely developer-focused has lost the point.
- The good/bad examples for descriptions matter — the difference between disconnected notes and connected prose is clearer shown than explained.
