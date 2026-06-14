# tdd — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies, and the why under it

Whether the tests are **maintainable** — and maintainability is what you judge against, not the conventions for their own sake. A test is maintainable when its failure is diagnosable (it names the value that was wrong), its intent is understandable (a reader sees what behaviour it pins), and it is consistent with the suite around it.

The conventions below are how that usually shows up — the typical shape of a maintainable test, not a checklist to match letter for letter. A deviation from a convention is fine where it *improves* maintainability or understandability, and a smell where it doesn't. (Understandability, not readability: whether the test communicates its intent, not whether it suits a style preference.) Weighing that deviation against the purpose is the judgment the supervisor is here to exercise.

## Where to look

The test code the session wrote or modified.

## How to judge

### Real coverage, not the appearance of it

A test must assert what the system *produced*, against a defined expected value — not a boolean folded from a comparison.

- **Good:** `const actual = result.__typename; expect(actual).toBe('pineapple')` — fails with `expected 'pineapple', got 'banana'`.
- **Bad:** `const actual = result.__typename === 'pineapple'; expect(actual).toBe(true)` — fails with `expected true, got false`, naming no value.

The why: a failure that names no value can't be diagnosed, so the test isn't maintainable even as it dutifully passes and fails. The boolean form is right only when the system genuinely produces a boolean and that boolean is the behaviour under test — not when a value is collapsed into one to dodge stating the expected. A failure message that names no value is the tell.

### Consistency

The suite holds one shape. Ten tests using `const result = ...; const actual = result.field` and two inlining `const actual = abc().field` for no reason is a smell. The why: a reader maintaining the suite shouldn't relearn the shape per test — one shape is what keeps the whole legible. A deviation with a reason (it genuinely reads clearer here) is fine; a deviation for no reason is the smell.

### The expected/actual pattern, and when to leave it

The canonical shape — `const expected = ...; const actual = ...; expect(actual).toBe(expected)` — serves maintainability: a named expected and a named actual make the failure diagnosable, and `actual` is extracted on its own line so nothing is navigated inside `expect()`. Leave the pattern when leaving it serves maintainability — `toEqual` for deep equality, `toThrow(NotFoundError)` or `toThrow(expected)` for errors are exactly those cases. The fail is a deviation that *costs* maintainability: a value folded into a boolean, navigation inside `expect()` (`expect(result.property)`), the expected smuggled into the actual line. Judge the deviation against whether it serves the purpose, not against the literal pattern.

### One assertion per test

One behaviour assertion per `it`. The why: a single behaviour assertion means a failure names which behaviour broke — the maintainability payoff. A pre-condition check sits apart, there to tell a *setup* failure from an *assertion* failure. Multiple *behaviour* assertions in one test is the fail, because it destroys which-one-broke.

### Structural conventions

Each serves the same end. Names say what is tested, not how, so a reader knows the behaviour from the name. `satisfies`, not `as`, for test data — `as` lets quietly-wrong data compile, so the test rests on a lie. Fakes and stubs over mocks; assert outcomes, not interactions — a test that breaks only when the implementation changes is tautological, the opposite of maintainable. A test that fails on a missing file or import is failing for the wrong reason; fix the structure so it fails for the right one.

### N/A

No tests were written or modified. Known not to apply.

### INCONCLUSIVE

The test code isn't visible — truncated pane. "I can't verify."
