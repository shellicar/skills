---
name: tdd
description: |
  Testing methodology and conventions: how to write tests that specify behaviour clearly. Without it, tests end up as unclear assertions that are hard to diagnose when they fail.
  TRIGGER when writing or modifying tests.
user-invocable: true
metadata:
  category: standards
---

# Testing Conventions

Tests specify how the system should behave. Clear tests make debugging failures straightforward.

## Assert outputs, not interactions

A test should verify what the system produces, not how it produces it.

The classicist approach: set up inputs, exercise the system under test, assert on the output or resulting state. This is state verification. The test does not know or care which internal methods were called, in what order, or how many times.

The opposite is behaviour verification: asserting that specific methods were called on collaborators with specific arguments. This couples the test to the implementation. When the implementation changes, the test breaks, even if the behaviour is still correct. The test and the code become two ways of saying the same thing. This is the tautological testing anti-pattern: a test that can only fail if you change the implementation, never because the behaviour is wrong.

Signs of a tautological test:

- The test mirrors the implementation line by line
- Changing a feature requires changing the test expectations to match
- The test asserts interactions ("was this method called?") instead of outcomes ("what was returned?")
- A refactor that preserves behaviour still breaks the test

Assert what came out. Do not verify what happened inside.

## Test doubles vocabulary

Use these terms precisely (from Meszaros's taxonomy):

- **Dummy**: passed to fill a parameter list, never actually used.
- **Stub**: provides canned answers to calls. Does not record anything.
- **Fake**: a working implementation unsuitable for production (e.g. an in-memory database, a clock you can advance manually).
- **Spy**: a stub that also records how it was called.
- **Mock**: an object pre-programmed with expectations that are verified after the exercise phase. Mocks use behaviour verification.

Prefer fakes and stubs over mocks. Provide controlled, deterministic behaviour through test doubles that do not carry expectations or verify interactions.

When referring to test doubles generically, say "test double" or use the specific term. Reserve "mock" for objects that verify interactions.

## One assertion per test

Each `it` block has a single assertion. When a test fails, you immediately know which behaviour broke.

Group related tests with `describe` blocks instead of combining assertions into one test:

```typescript
describe('formatPhoneE164', () => {
  it('formats Australian mobile to E.164', () => { ... });
  it('throws on invalid phone number', () => { ... });
  it('throws on empty string', () => { ... });
});
```

## Expected/actual pattern

Use explicit variables so the test reads clearly:

```typescript
it('formats Australian mobile to E.164', () => {
  const expected = '+61412345678';

  const actual = formatPhoneE164('0412 345 678', 'AU');

  expect(actual).toBe(expected);
});

it('throws on invalid phone number', () => {
  const actual = () => formatPhoneE164('invalid', 'AU');

  expect(actual).toThrow();
});
```

## Test naming

Test names describe what is being tested, not how. Use present tense:

```typescript
it('formats Australian mobile to E.164', () => { });   // What it tests
it('throws on invalid phone number', () => { });       // What it tests
it('calls parsePhoneNumber and checks result', () => { }); // How it works
it('test case 1', () => { });                           // Nothing
```

## What a good failure looks like

A test should fail because the behaviour is missing, not because of a structural problem.

**Good failure** (missing logic):
```
expected undefined to equal '+61412345678'
```

**Bad failure** (missing file):
```
Cannot find module './formatPhone'
```

If the test fails for a structural reason (missing import, missing file), fix that first with a stub so the test can run and fail for the right reason.

## Use `satisfies` for test data

Test input data and test doubles should use `satisfies` to ensure type correctness:

```typescript
const input = {
  interactionId: 'de80e429-5d13-4536-b824-89e9c43c80fb',
  step: WelcomeStep.Overview,
} satisfies WelcomeNextInput;
```

## Factory functions for complex objects

```typescript
const createTestEntity = (clock: Clock): InteractionEntityV1 => ({
  _id: toMongo(TEST_ENTITY_ID),
  uniqueKey: 'test-key',
  created: convert(clock.instant()).toDate(),
  modified: convert(clock.instant()).toDate(),
  interaction: createTestInteractionData(),
} satisfies InteractionEntityV1);
```

## Fixed clocks for deterministic tests

```typescript
const fixedInstant = Instant.parse('2023-01-01T00:00:00Z');
const clock = Clock.fixed(fixedInstant, ZoneId.UTC);
```

Or a fake clock for tests requiring time advancement:

```typescript
const now = Instant.parse('2023-01-01T10:00:00Z');
const clock = new FakeClock(now);
clock.advanceBy(Duration.ofSeconds(61));
```

## DI container setup

```typescript
beforeEach(() => {
  const services = createServiceCollection();
  services.register(Clock).to(Clock, () => fakeClock).singleton();
  services.register(IDatabase).to(FakeDatabase, () => fakeDatabase).singleton();

  const container = services.buildProvider();
  serviceUnderTest = container.resolve(MyService);
});
```


