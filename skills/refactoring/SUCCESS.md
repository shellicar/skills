# refactoring — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the code inside the mission's footprint was left better, with behaviour held constant — and whether the whole footprint was actually considered, not just whether something was changed.

## The survey — how they decided what to refactor

Not just *what* they refactored: *how they decided*. The footprint is the diff against main (`git diff --name-only origin/main...HEAD` — three dots, the merge-base diff); the cast should have walked it deliberately against the smell list, and the evidence of that walk should be visible.

"Nothing to refactor" from a one-pass eyeball is the failure to look for. If every cast decides not to refactor, the phase achieves nothing.

## The dial is inverted here

Unlike the verdict's default, this skill is tuned *against* the empty result: bad refactoring can be reverted; no refactoring cannot be turned into refactoring. A clean "nothing found" earns a pass only when the survey behind it is shown.

## The fence

Tests pass before, pass after every change, and the tests themselves did not change. A change that needed a test edited moved behaviour — that is a FAIL, however good the change.

## The standard

Judged against the SC's declared standards, never "matches the existing code" — this codebase is AI-written, and matching it is Claude copying Claude with no external correction.

## The boundaries

- **Adjacent code is fair game.** Refactoring next to the footprint is fine — not required, but never a finding. If only what changed ever gets refactored, the codebase cannot improve; that is the point of refactoring. The standard is the kitchen: left better than it was on arrival. The line is proportion — improving what the work brought them near, not wandering off to refactor everything in sight.
- Rearchitecting dressed as refactoring — moved design boundaries, new abstractions: the SC's decision, raised not taken.
- Each refactor recorded in the debrief with its smell and its passing run; otherwise the reviewer is looking at unexplained diff.
