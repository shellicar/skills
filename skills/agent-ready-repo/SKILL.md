---
name: agent-ready-repo
description: |
  WHAT: The standard for making an existing repo agent-ready — a current `CLAUDE.md` an agent can work from without guessing, commands that stay quiet on success, and a README that orients.
  WHY: Every cast starts cold. Without a verified operating truth in the repo, an agent rediscovers the same traps, follows stale commands, and undoes deliberate decisions — burning context and making confident mistakes.
  WHEN: When making an existing repo ready for agents to work in.
user-invocable: false
metadata:
  category: reference
---

# Agent-ready repo

The standard an *agent-ready pass* targets: what "agent-ready" means for a repo, and the why behind it. The pass creates or refreshes the `CLAUDE.md`, makes commands quiet, and refreshes a stale README. This is the bar. Onboarding a *new* project is `new-project-setup`; maintaining the `CLAUDE.md` over time is `project-memory`.

## README vs CLAUDE.md — different jobs, different readers

**README — humans *and* agents: orientation.** What the project is, why it exists, how to get it running. A newcomer should leave with the mental model and the on-ramp: the domain story and vocabulary, then prerequisites → setup → run → debug. Durable; updated when the setup actually changes.

**CLAUDE.md — agents: operating truth.** Lets an agent do the work without guessing or tripping. It must be *current* — a stale command here actively misleads. The spirit is exact, verified, actionable.

The line: a README *orients and onboards* (what / why / get-started); a `CLAUDE.md` *operates* (exact how, what-to-avoid, why-it's-this-way). For an agent, the README is the mental model and the `CLAUDE.md` is the operating truth.

## What good looks like

- **Verified, not claimed.** The `CLAUDE.md` is checked against the actual repo, never copied from the README's assertions — READMEs rot.
- **The two highest-value parts live nowhere else:**
  - **Gotchas** — traps that cause confident mistakes: generated files that look modified (don't stage), CI that doesn't run a test package, code paths disabled in prod (don't trace them), a runtime version that's rejected.
  - **Decisions with rationale** — so an agent doesn't undo a deliberate choice ("the schema is the source of truth; don't hand-write input types").
- **Commands an agent can trust** — quiet on success, predictable output, a cached pass that actually ran, single root entry points (see below).

## Quiet commands

A verify command's output is consumed as tokens. Most build and test tools were configured for humans, who skim; an agent reads everything, so a verbose preamble burns real context on noise that has nothing to do with pass/fail.

- If a command produces more than a few lines on success, find its quiet or errors-only mode. The agent needs to know pass/fail, not watch the tool work.
- **Turbo** — set `outputLogs` per task in `turbo.json`: `type-check` and `test` → `"errors-only"` (you only care about failures); `build` → `"new-only"` (what actually built, not cached replays). A one-time repo config; after it, every verify command through turbo is minimal.

## Cache correctness — a cached pass must have actually run

A cache replays a stored result when a task's inputs haven't changed. If the input set is wrong, it replays a *pass* for code it never checked — a false green. Worse than a noisy command: noise only wastes tokens, but a false green lies about the one thing the command exists to answer.

Why this has to be fixed in the config, not by the agent staying alert: a human who sees `cached` re-runs with `--force`, because it costs nothing. An agent can't lean on that — it works in a worktree with a warm cache, can't cheaply tell a real pass from a replay, and has no reason to distrust a green. The correctness has to live in `turbo.json`, where it's templated and can't be missed, because the agent won't catch it at runtime.

- **Turbo `inputs`** — a task's `inputs`, once set, *replaces* turbo's default (which hashes every file in the package). So a too-narrow list silently drops files from the cache key: edit a dropped file, get a replayed pass. Each task's `inputs` must cover every file it actually reads — its sources and the configs that drive it. The `type-check` that bit us listed only `tsconfig.check.json`, while that tsconfig's own `"include": ["**/*.ts"]` means tsc compiles every `.ts` file — so no `.ts` edit ever invalidated the cache.

  Before — the broken task, verbatim:

  ```json
  "type-check": {
    "dependsOn": ["^build"],
    "inputs": ["tsconfig.check.json"],
    "outputs": ["**/node_modules/.cache/tsbuildinfo.json"],
    "outputLogs": "errors-only"
  }
  ```

  After — `inputs` covers what tsc actually reads:

  ```json
  "type-check": {
    "dependsOn": ["^build"],
    "inputs": ["**/*.ts", "tsconfig.json", "tsconfig.check.json"],
    "outputs": ["**/node_modules/.cache/tsbuildinfo.json"],
    "outputLogs": "errors-only"
  }
  ```

  The one-line diff is the whole fix: `inputs` goes from `["tsconfig.check.json"]` to `["**/*.ts", "tsconfig.json", "tsconfig.check.json"]`. `build` already gets this right — `"inputs": ["tsconfig.json", "src/**/*.ts", "build.ts", "tsup.config.ts"]`, covering everything tsup bundles; `test` runs without an `inputs` key, so it keeps turbo's default all-files hash. Each task's input set is per-task, covering whatever files that task compiles or runs.

## Failure modes

- **README rot** — decays into a stale fragment with no orientation value. Worse than nothing: it misleads.
- **Stale tooling** — the README describes an old build (npm) while the repo has moved on (pnpm/turbo); an agent follows the wrong commands.
- **No `CLAUDE.md`** — the agent starts cold every time and rediscovers the same traps.

## Definition of done

A handler who has never seen the repo can write an operator mission from the `CLAUDE.md` without guessing, and an operator can build and verify from it without reading the README.
