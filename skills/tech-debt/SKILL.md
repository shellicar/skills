---
name: tech-debt
description: |
  WHAT: Pre-emptive defensive code is tech debt — defences added before an error has occurred have no anchor and become unexplained complexity.
  WHY: Claude habitually avoids errors at all costs, introducing type casts, environment guards, and null checks for failures that haven't happened. The result is objectively worse code.
  WHEN: TRIGGER when writing or modifying code.
user-invocable: false
metadata:
  category: standards
---

# Tech Debt: Pre-emptive Defence

## Who

Claude writing code.

## What

Pre-emptive defensive code is tech debt. A defence added before an error has occurred has no anchor: it is speculation dressed as safety, unexplained from the moment it lands.

The code looks identical in both cases. A correct defence and a pre-emptive one are syntactically indistinguishable — same check, same structure, same placement in the source. The evidence is the only thing that separates them.

## Why

A defence is a response to a failure. The error is the reference — the reason the defence exists, the specific failure it addresses, the evidence that it was needed.

Without the error, the defence is speculation. It may be wrong. It may never be needed. Nobody reading the code later can see why it's there, because there is no reason: no error occurred, no test failed, no ticket was filed. That unexplained complexity accumulates as debt.

The question that will be asked — by the SC reviewing the code, or by another Claude session — is: *is this needed? why is this here?* A theoretical answer ("it might fail under SSR") is not sufficient; it generates investigation, doubt, and removal work. An evidence-based answer ("I hit this error, so I added this") satisfies it immediately. If the evidence doesn't exist, the defence should not have been added.

## How

Write the direct path. If it fails, add the specific defence the failure requires — now you have the error, the reason is the error.

Pre-emptive: "This might fail, I'll add a guard." → Debt.  
Error-first: "This failed, here is the specific fix." → Correct.

Before adding any defensive code: has this error been observed in this codebase, in this runtime, in this context? If not, write the direct path and let the error surface.

When the error does occur and a defence is added: record the evidence. A comment referencing the error, a commit message describing what failed. In unattended work Claude won't be present to explain the addition — the code carries the reason, or the reason doesn't exist.

### TypeScript

TypeScript's type system is itself a defence. Casts opt out of it.

**`as unknown as T`** — the double cast that silences a type error by routing through `unknown`. TypeScript refused the direct cast for a reason: the types disagree. The double cast discards that information. The disagreement isn't resolved; it's hidden.

**`as T` when inference works** — noise. TypeScript already knows the type. The cast says nothing new and hides whether the type is actually what you think.

**Defensive union types** — `T | null | undefined` when the value is never null or undefined: adds null checks at every call site for a case that cannot occur.

The rule: if TypeScript compiles without the cast, remove the cast. If TypeScript refuses without it, the cast is hiding a real problem — fix the problem, not the error message.

### Environment guards

`typeof window !== 'undefined'`, `process.browser`, SSR-specific checks — correct defences in apps that run on both server and client. Dead code in apps that do not.

Before adding an environment guard: verify the environment. If `ssr: false`, the code runs only in the browser. The server check is dead code. Dead code is debt.

### What this is not

This is not "never add defences." Defences belong in code.

The discipline is sequence: direct path first, specific defence when the error arrives. A defence added after an observed failure is a fix. A defence added before is a guess. The guess has no reference, and the reference is what makes it code rather than noise.

## When

When writing or modifying code.
