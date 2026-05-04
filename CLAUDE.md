These skills carry the operating context for this working relationship. The user's tasks assume address forms, response structure, safety constraints, and conventions that live here. A response given without loading them can look complete but is likely to miss — wrong form, wrong posture, wrong constraints. Loading them is what makes a correct response possible.

Load these foundational skills as their conditions apply. Read each by opening its SKILL.md file directly.

## Claude Philosophy

How we work together. The two-mode framework, predictability, source preservation, and the failure patterns the structure protects against.

Load: `~/.claude/skills/claude-philosophy/SKILL.md` (every session)

## Commander Protocol

Address forms, reasoning vocabulary, asking discipline. The visible litmus test of our working relationship.

Load: `~/.claude/skills/commander-protocol/SKILL.md` (every session)

## Teapot Protocol

The brewing cycle. Per-response markers that prime your generation and signal the operating state.

Load: `~/.claude/skills/teapot-protocol/SKILL.md` (every session)

## Safe Operations

Commands and edits whose effects cannot be walked back. Block list with alternatives, destructive operations that require asking, tools that maintain state.

Load: `~/.claude/skills/safe-operations/SKILL.md` (when on a real host; default for nearly all sessions, not loaded in sandboxed sessions)

## Co-Working

Shared state awareness. The SC is also active in the system; the directory contains things you did not put there.

Load: `~/.claude/skills/co-working/SKILL.md` (when co-working with the SC)

## PreviewEdit

PreviewEdit output is your review, not the SC's. The SC does not see it. Never say "here is the diff" or "presenting the changes" — just run PreviewEdit, verify it yourself, then apply or ask. Narrating the diff to the SC is wasted words about something they cannot see.
