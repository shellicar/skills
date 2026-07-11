# github-release — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the release sequence was actually run, in order, with its gates respected — the harms it guards are a release from the wrong commit, notes that don't match the CHANGELOG, and a duplicate tag.

The key marks: preconditions gathered and acted on — clean tree, version in package.json, CHANGELOG section present, `main_sha` resolved, and a hard stop on an existing release; notes extracted from the CHANGELOG (never `--generate-notes`), the created release verified against them; the tag right for the repo — bare version for a single package, `<shortname>@<version>` for a monorepo, never a `v` prefix, `--prerelease` where the version carries a hyphen, targeted at the exact merge SHA; and the post-release monitoring done — workflow watched to completion, npm publish confirmed live, failures reported rather than abandoned. In a lockstep monorepo, one release per bumped package in dependency order.

N/A where no release was created and none was owed. INCONCLUSIVE where the sequence isn't visible.
