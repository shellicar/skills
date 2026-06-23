---
name: application-cve
description: |
  WHAT: A process for clearing CVEs in an application — a deployed artefact, not a published package. An application is its lockfile, so `pnpm audit` on the lockfile is the gate. Try the package-manager update first, force transitive patches through the resolver, checkpoint incrementally, verify past the build cache, and account for every version that moved.
  WHY: With no defined process, each session re-derives it and flounders in the same places. And without the knowledge/wisdom framing, an operator clears the audit count without knowing whether a fix is safe — passing on the version digit instead of on what is actually used.
  WHEN: TRIGGER when clearing dependency vulnerabilities reported by `pnpm audit` in an application repo.
user-invocable: false
metadata:
  category: standards
---

# Skill

Asked to clear an application's CVEs, run this process. The output is a clean audit and an account of every version that moved.

## The gate: an application is its lockfile

An application deploys as a built artefact resolved from its lockfile. The vulnerable versions that can ship are the ones the lockfile resolves, and `pnpm audit` reads the lockfile. So for an application, `pnpm audit` reporting clean — bar the remainders the SC has agreed to defer — is the definition of done.

This is the line that sets everything else. A published library is the opposite: its lockfile is not installed by its consumers, so an audit of it says nothing about them. That is a different problem and a different skill. Confirm you are clearing an application before using this process.

## Prerequisite: pnpm 11

This skill assumes pnpm 11. Before anything else, get the repo onto pnpm 11 — update its `packageManager` field and your local pnpm. This is not optional: pnpm 11 is what makes `pnpm audit --fix` reach transitive dependencies, and what provides the two fix methods below. On pnpm 10 the override fix cannot reach transitives (pnpm#6774) and `--fix update` does not exist, so the method does not work. Updating the package manager can itself break things — analyse the bump, not only the dependency changes (see Gotchas).

## Method

1. **Audit, and save the record.** Capture the JSON to a committed file, then read the human output:

   ```
   mkdir -p .claude/audit
   pnpm audit --json > .claude/audit/$(date +%Y-%m-%d).json
   pnpm audit
   ```

   Commit that file. It is the snapshot of what is vulnerable now, and `pnpm audit --fix` removes advisories from later output — so once you start fixing, the information is gone. Reconstructing GHSA IDs afterward is far more expensive than capturing them at first sight, and the before/after diff is the record of what changed. Reference it from your testament.

2. **Fix, with the method the repo has chosen** (see below). `pnpm audit --fix update` or `pnpm audit --fix override`, or `pnpm audit --fix -i` to choose interactively. Re-run `pnpm audit` to confirm what cleared and what remains. Where the advisory count is large, work incrementally rather than in one sweep.

3. **Checkpoint as you go.** After each change that verifies clean, commit a checkpoint on the mission branch. Small verified checkpoints isolate a failure to the change that caused it; one large batch that fails is hard to unpick. They squash-merge, so the granularity is for your safety, not the final history.

4. **Verify each checkpoint** with the repo's build, type-check and test commands, and re-run `pnpm audit`. Force past the build cache: if `turbo.json` has `globalDependencies: null`, the cache does not bust on a lockfile change, so a plain `turbo build`/`test` can replay a stale pass. Use `--force`, or the green is false.

5. **Account for what changed and why** — a verification step, not a deliverable. Read the lockfile diff and account for every version that moved; confirm each is CVE-driven. A version that changed without a CVE behind it is an unrelated change riding along: surface it, do not keep it silently. Re-capture `pnpm audit --json` to the same dated file once the fixes verify clean; the diff against the committed first capture is that account.

### override or update — a repo choice

`pnpm audit --fix` takes a method, and which one a repo uses is the repo's policy, recorded in its project memory:

- **`override`** (the default) adds entries to `package.json` (`pnpm.overrides`) that force non-vulnerable versions. The pin is explicit and stays in the manifest until removed.
- **`update`** updates the vulnerable packages in the lockfile to non-vulnerable versions where ranges allow. Resolver-native, with no standing override left behind.

Neither is globally correct. A repo that wants its manifest to record every forced version uses `override`; a repo that wants a lockfile-only result with no lingering pins uses `update`. Follow the repo's recorded choice; if it has none, raise it as a decision rather than picking for it.

Manual `pnpm.overrides` are now what `--fix override` writes for you, plus the fallback for what `--fix` cannot express — an aliased dependency, or a specific version-scoped pin. The key forms, applied via `pnpm install` (never a hand-edit of the lockfile):

- `"pkg": "^x"` — global, but does not reach an *aliased* dependency.
- `"pkg@9": "^9.0.7"` — version-scoped.
- `"parent>child": "npm:realpkg@^3"` — path-scoped, and the form for an aliased dependency.

Whichever method, the wisdom gate still applies: both `update` and `override` can move a *used* dependency across a major. Validate or accept it per the Wisdom section below; do not stamp it because a tool wrote it.

When an in-scope update needs a code adaptation to land (a type tightened by a version bump, an API change from a major), making the obvious adaptation is part of clearing the advisory. A behaviour change that is not obviously correct is a decision to raise, not to make alone.

# Philosophy

The method above is safe only if you can judge a fix. This is the part the method rests on, and it is split into *knowledge* (what the mechanisms are) and *wisdom* (which is safe, and which gate applies). A verifier with the steps but not this passes work on the version digit; with this, it passes on what is actually used.

## Knowledge — identification

- **Resolution.** pnpm resolves every dependency to a concrete version in the lockfile — the authority for what is installed. `package.json` and `pnpm.overrides` are input to the resolver, not authority; read the lockfile diff and trace with `pnpm why -r`. One package can resolve to several versions at once, each on its own path.
- **Substitution.** A package resolves to a *different* version than before — a changed range or an override binds a consumer to a new version.
- **Duplication / deduplication.** Several consumers holding several resolved versions of one package is duplication; when their ranges admit a common version the resolver collapses them toward one — deduplication.
- **Removal.** A version stops being resolved at all. *Explicit*: a declared dependency is dropped. *Effective*: nothing requires it any more — a range or override now asks for a different version — so it falls out.
- **Use.** A changed or removed version affects what runs only if running code resolves to or imports it. Otherwise the graph moves but nothing executing changes.
- **What deploys is a subset of what resolves.** The lockfile is the full installed tree; only the bundled subset is deployed. A resolution change outside the bundled subset is not present in the deployed output.

## Wisdom — which is safe, which gate applies

Safety of each mechanism turns on whether a *used* dependency is touched:

- **Substitution** of a *used* dependency across a major is a breaking-change risk: validate through build/type-check/test, or treat it as an explicitly accepted risk. Within the same major it is low risk.
- **Removal / deduplication** of an *unused* version is safe — nothing relied on it. Of a *used* version it breaks by absence. A duplicate is removable only when it is also unused; a used duplicate must be substituted, not dropped.

Which question gates depends on the requirement:

- **Fixing existing, already-shipped code.** The CVE is already deployed regardless, so exposure is the goal being cleared, not a safety gate. The only thing that can make a fix unsafe is whether it changes a version that running code uses. That is the single gate.
- **New code, not yet shipped.** Introducing a vulnerable version is still avoidable, so exposure becomes a live gate too.

State the requirement first, then pick the gate. Never hardcode one scenario's answer as global.

## Worked examples

Both from #10603, both judged on the single gate above (existing shipped code, so the only question is whether a *used* version moved):

- **applicationinsights 2.x → 3.x — an "update" that was really a removal.** The advisory was on `@opentelemetry/core`, pulled in only by an applicationinsights 2.x copy. Nothing ran that copy: the code used v3, and the v2 existed solely as an npm-alias from a winston plugin. Redirecting the alias to the v3 already in use dropped the 2.x subtree, and its `@opentelemetry/core`, out of the lockfile. Read as an update it looks like a major bump to fear; read by *use*, no used version moved at all — it is an effective removal of an unused path. Nothing executing changed, so it was safe, with no behaviour to validate. The lesson: an update to a version nothing depends on is a removal, and removing the unused is safe.

- **uuid v8/v9 → v11 — a substitution of a used dependency across a major.** uuid *was* used, under @apollo/server and @azure/functions, and the only patch was v11. Forcing it moved used code across a major: a breaking-change risk that cannot be stamped. It was validated through build, type-check and test, and carried as an explicitly accepted risk. The lesson: when a used dependency crosses a major, the gate is real — validate or accept it, do not wave it through because the tool applied it.

## Gotchas

- **Build-cache false green.** Covered in the method: `--force` when the cache does not bust on a lockfile change.
- **Two resolved copies of a framework.** A bump can leave two versions of a framework (e.g. vue) resolved at once, breaking reactivity or component resolution. Check the lockfile for a single resolved version after framework-adjacent bumps.
- **The package-manager bump can break deployment, not just code.** pnpm 11 surfaced two at merge, in CI: `pnpm version` refusing on a tree it considers unclean (use `pnpm pkg set version`), and `git status` reporting the whole repo deleted because `turbo prune` writes a pruned tree under a copy of the full `.git`. Analyse the bump itself, not only the dependency changes.

Repo-specific traps — the exact CI fixes and the override-alias keys for a given repo — live in that repo's project memory, not here.

## Done

`pnpm audit` reports nothing but the remainders the SC has agreed to defer.
