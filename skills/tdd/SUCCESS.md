# tdd — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies, and the why under it

Whether the tests are **maintainable** — and maintainability is what you judge against, not the conventions for their own sake. A test is maintainable when its failure is diagnosable (it names the value that was wrong), its intent is understandable (a reader sees what behaviour it pins), and it is consistent with the suite around it.

The conventions below are how that usually shows up — the typical shape of a maintainable test, not a checklist to match letter for letter. A deviation from a convention is fine where it *improves* maintainability or understandability, and a smell where it doesn't. (Understandability includes readability: whether a reader grasps what the test pins as they read it. What it excludes is arbitrary stylistic taste, not readability itself.) Weighing that deviation against the purpose is the judgment the supervisor is here to exercise.

## Where to look

The test code the session wrote or modified.

## How to judge

Mark every `it` block against every criterion below, individually. Build this table before writing the verdict, and fill each cell:

| Test (name / line) | Real coverage | Consistency | Expected/actual | One assertion | Structural |
|---|---|---|---|---|---|
| … | ✅ / ⚠️ / ❌ | … | … | … | … |

A cell is ✅ only once that test has been read against that criterion's definition below; ⚠️ where it deviates but the deviation still serves the criterion's purpose (say why); ❌ where it does not. A blank cell means the check was not done — not a pass. Do not give the skill one overall mark in place of the table. Fill in every cell: the completed grid is your assessment, and each ❌ records one test failing one criterion.

The verdict is judgment, not arithmetic — there is no pass percentage. Weigh *where* the failures fall: a broken assertion on the core function the phase exists to deliver counts for far more than a style deviation scattered across the suite. State what you weighed and why it lands where it does.

### Real coverage, not the appearance of it

A test must assert what the system *produced*, against a defined expected value — not a boolean folded from a comparison.

- **Good:** `const actual = result.__typename; expect(actual).toBe('pineapple')` — fails with `expected 'pineapple', got 'banana'`.
- **Bad:** `const actual = result.__typename === 'pineapple'; expect(actual).toBe(true)` — fails with `expected true, got false`, naming no value.

The why: a failure that names no value can't be diagnosed, so the test isn't maintainable even as it dutifully passes and fails. The boolean form is right only when the system genuinely produces a boolean and that boolean is the behaviour under test — not when a value is collapsed into one to dodge stating the expected.

A count or length assertion (`expect(x.length).toBe(n)`) is this same collapse in numeric form: it looks like a real value but discards the identity and content of what was counted, unless the count itself — not what is counted — is the entire behaviour under test. A cycle detector's test asserting `cycles.length` without asserting *which* nodes form the cycle is this failure on a rich structure: a detector that found the wrong cycle, or a spurious one, passes it. Weigh it against the test's own name — if the name promises a structural claim ("finds a direct two-node cycle") the assertion must check that structure, not its cardinality.

### Consistency

The suite holds one shape. Ten tests using `const result = ...; const actual = result.field` and two inlining `const actual = abc().field` for no reason is a smell. The why: a reader maintaining the suite shouldn't relearn the shape per test — one shape is what keeps the whole legible. A deviation with a reason (it genuinely reads clearer here) is fine; a deviation for no reason is the smell.

### The expected/actual pattern — a readability rule

This one is about the **reader**, not the failure message. The canonical shape — `const expected = ...; const actual = ...; expect(actual).toBe(expected)` — lets a reader scanning a test top to bottom know what it proves *as they read it*. The expected value is named and declared early, near where the pieces it is built from already exist; the actual is pulled onto its own line; the assertion compares two named values.

The fail is **not** "the failure message names no value" — `expect(svcFacts?.deps).toEqual([IDep])` diagnoses perfectly well when it breaks. The fail is that the reader has to hold `svcFacts?.deps` in their head and wait until the final line to learn what it is meant to equal, even though `IDep` was defined on the test's first line. Navigation inside `expect()` (`expect(x.field)`, `expect(x.length)`, `expect(x.indexOf(y))`) is the same fault: the value is assembled at the assertion instead of named before it. So is inlining the expected literal into the final call instead of declaring it up front.

Mark this cell ⚠️, not ❌, where the shape deviates but reads just as clearly — `toEqual` for deep equality, `toThrow(NotFoundError)` for errors. ❌ where the reader must reconstruct the test's intent from the last line. "The purpose" this is judged against is *readability* — the reader's comprehension as they read — not the mission, the phase, or the diagnostic output.

### One assertion per test

One behaviour assertion per `it`. The why: a single behaviour assertion means a failure names which behaviour broke — the maintainability payoff. A pre-condition check sits apart, there to tell a *setup* failure from an *assertion* failure. Multiple *behaviour* assertions in one test is the fail: when it breaks, you can't tell which of them broke.

### Structural conventions

Each serves the same end. Names say what is tested, not how, so a reader knows the behaviour from the name. `satisfies`, not `as`, for test data — `as` lets quietly-wrong data compile, so the test rests on a lie. Fakes and stubs over mocks; assert outcomes, not interactions — a test that breaks only when the implementation changes is tautological, the opposite of maintainable. A test that fails on a missing file or import is failing for the wrong reason; fix the structure so it fails for the right one.

### N/A

No tests were written or modified. Known not to apply.

### INCONCLUSIVE

The test code isn't visible — truncated pane. "I can't verify."
