# Release

The squad for publishing a release. Shape proven by the claude-cli beta.13 and beta.14 releases.

### Phase 1 — Version bump

- role: Maker

Bumps the version and updates the changelog. Reports each changed package and what changed; the SC rules on anything trivial-only.

### Phase 2 — Version PR

- role: Courier

Delivers the version bump as a PR and sees it merged.

### Phase 3 — Publish

- role: Postmaster

Publishes the releases from merged main, leaves-first through the dependency graph.
