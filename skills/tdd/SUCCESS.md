# tdd: success criteria

What a passing test file looks like under this skill. The operator aims at this; the supervisor verifies against it from the same document.

## Expected/actual pattern

Every assertion follows the pattern exactly:

```typescript
const expected = <value>;

const actual = <call under test>;

expect(actual).toBe(expected);
```

`expected` holds the expected value. `actual` holds the direct output of the call — not a property navigated from it. Nothing is navigated inside `expect()`. A test that writes `expect(actual.property).toBe(expected)` fails this criterion; extract to `const actual = result.property` first.

[Placeholder — further criteria to be added.]
