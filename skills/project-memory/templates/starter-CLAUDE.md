# {Repo Name}

## Current State
<!-- What's in flight, what's blocked, what's next. Operators read this at cast start. -->

## Linting & Formatting
<!-- Tools, fix command, gotchas. Universally referenced by Maker/Builder/Cleaner. -->
<!-- Example: -->
<!-- - Git hooks via lefthook (runs biome on commit) -->
<!-- - Fix: `pnpm ci:fix` (do NOT use `pnpm biome check --write` — that runs against the whole repo) -->
<!-- - If biome reports only unsafe fixes, do NOT pass `--write --unsafe`; fix manually. -->

## Branch Naming
<!-- Allowed prefixes. Used by every Courier and every preflight. -->

## Conventions
<!-- Coding conventions the codebase follows. Concrete examples beat "we use X" pointers. -->

## Architecture
<!-- Stack, packages, key directories. Anchor with concrete class names where they help (e.g., AnthropicAgent, ToolRegistry); avoid jargon without anchors. -->

## Key Patterns
<!-- Architectural patterns operators need to know. Note which role each pattern matters for if it varies. -->

## Test Infrastructure
<!-- Where test helpers live (e.g., MemoryFileSystem), naming conventions, common traps. Operators find these by digging if not surfaced here. Drop if trivial. -->

## Known Debt / Gotchas
<!-- Things that trip operators up: tests that pass-by-coincidence, type-check traps, dependencies installed-but-unused, things code doesn't make obvious. -->

## Pull Requests
<!-- Format requirements: labels, reviewers, milestone, auto-merge. Used by Courier. Drop the section if you don't use PRs. -->

## Releases & Changelog
<!-- Tag format, changes.jsonl format, who maintains CHANGELOG. Used by Courier on release. Drop if no releases. -->
