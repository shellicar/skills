---
name: typescript-standards
description: |
  Defines how TypeScript is written here so Claude's output belongs in the codebase. Without it, generated code ignores established conventions and must be rewritten.
  TRIGGER when writing or modifying TypeScript code.
user-invocable: false
metadata:
  category: standards
---

# TypeScript Coding Guidelines

These apply only to code you are actively modifying. Leave pre-existing code alone unless asked to change it.

## Use the type system

TypeScript's type system is the reason we use TypeScript. Work with it, not around it.

When you're stuck on a type problem, work iteratively: write the code, let the compiler tell you what's wrong, fix one error at a time. The type system is Turing complete. There is almost always a solution using generics, conditional types, mapped types, or utility types. If you genuinely can't find one, show what you tried and ask.

### Types vs type constraints

There is a difference between declaring what a value *is* and constraining what a generic *accepts*.

```typescript
// This is a type declaration: you're saying the value has no type.
// This throws away type safety. Don't do this.
const data: any = fetchSomething();
const result = value as any;

// This is a type constraint: you're saying you don't care about
// the constructor arguments. The generic still carries type info.
// This is fine.
type Constructor<T> = new (...args: any[]) => T;
```

The distinction matters when working with third-party libraries. Library type signatures sometimes require `any` in constraints because their own generics are broad. Using `any` in a constraint position to satisfy a library's type signature is correct. Declaring your own values as `any` to make the compiler stop complaining is not.

If you think `as any` or `: any` on a value is the only option, ask. It almost certainly isn't, but even if it is, the cost tradeoff is the SC's call.

### Use `satisfies`

`satisfies` verifies an object matches a type without widening it. This gives you type safety and preserves the inferred literal types for better autocomplete.

Use it on:
- Function return values (alongside the explicit return type)
- Constants that need to match a shape
- Test data and mocks

```typescript
const createData = (): MyType => ({
  prop1: 'value',
  prop2: 123,
} satisfies MyType);

const config = {
  host: 'localhost',
  port: 3000,
} satisfies ServerConfig;
```

When you need the variable's type to be widened (e.g. starting with an empty object), use explicit annotation instead: `const obj: MyType = {};`

## Refactoring: update imports, don't re-export

When moving types during a refactor, update every import to point to the new location. Do not leave re-exports in the old file to maintain backwards compatibility. Re-exports hide where things actually live and create debt.

The one exception: `index.ts` barrel files in published npm packages. These exist specifically to be a stable public API.

## Temporal naming

When storing temporal values as plain strings or numbers (entity types, DB documents), the suffix communicates what the value represents. Without it, `string` is ambiguous.

This does not apply when the field has a typed schema (e.g. Zod with `localDateV2Schema`), because the type is already self-evident.

| js-joda Type | Suffix | Examples |
|---|---|---|
| `Instant` / `Date` | `*Utc` | `createdUtc`, `modifiedUtc` |
| `LocalDate` | `*Date` | `birthDate`, `expiryDate` |
| `LocalTime` | `*Time` | `startTime`, `endTime` |
| `LocalDateTime` | `*DateTime` | `scheduledDateTime` |
| `ZonedDateTime` | `*ZonedDateTime` | `appointmentZonedDateTime` |
| `Duration` | `*Duration` | `validDuration` |
| `Period` | `*Period` | `billingPeriod` |
| `Year` | `*Year` | `fiscalYear` |
| `YearMonth` | `*YearMonth` | `billingYearMonth` |
| `ZoneId` | `*ZoneId` | `userZoneId` |

## Testing

See the `tdd` skill for testing conventions: one assertion per test, expected/actual pattern, factory functions, fixed clocks, test naming, and DI setup.
