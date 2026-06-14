# typescript-standards — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the TypeScript was written *with* the type system rather than around it, in the code the session touched. Pre-existing code it didn't change is out of scope.

## Where to look

The TypeScript the session wrote or modified, checked against the compiler where needed (`TsDiagnostics`).

## How to judge

### `any` — the rule that resists the easy rationalisation

For types, functions, and code **we are defining**: never `any`. It circumvents the type system, discarding the whole benefit of TypeScript. If an escape is genuinely needed, `unknown` — which forbids using the value until it is narrowed — not `any`. A `: any` or `as any` on our own value or declaration is a FAIL, and the "do we care?" judgment does **not** apply here: that door is exactly what gets rationalised into a codebase full of `any`.

For **constraints**, the "do we care about this type or field?" heuristic applies: `any` is fine where the type genuinely doesn't matter (the args in `Constructor<T>`, a broad external signature forcing it), and a fail where it is a type we care about and `any` was reached for as the default.

So when marking an `any`: is it in our own definition (fail; `unknown` at worst), or in a constraint (judge whether the type matters)?

### Casting — diagnostics-driven

A cast, annotation, or assertion belongs only where a diagnostic reports an actual error at that location. A preemptive cast — added because a type *might* be a union or *might* lack a property — is noise and usually wrong; the compiler knows, so ask it first. `as unknown as T` hides a real disagreement rather than resolving it.

### `!` vs `?`

`obj!.field` silences the compiler and still throws at runtime; `obj?.field` works with the type system and coalesces. Nearly always `?` (or proper null handling) is right; `!` is the easy way out, opting out of null safety. A `!` where `?` would do is a fail.

### The rest

- `satisfies`, not `as`, to match a value to a shape without widening it.
- On a refactor, imports are updated to the new location — no re-exports left behind, except `index.ts` barrels in published packages.
- Temporal values stored as plain strings or numbers carry the suffix (`*Utc`, `*Date`, `*Time`, …) unless a typed schema already makes the type self-evident.

### N/A

No TypeScript was written or modified. Known not to apply.

### INCONCLUSIVE

The code isn't visible — truncated pane. "I can't verify."
