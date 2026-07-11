# mission-artefacts — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether the mission's on-disk shape held — the structure that lets every role find every artefact where it belongs.

The key marks: the mission is a **directory** (`YYYY-MM-DD_NUM_description/`, underscores between segments, directly under `projects/<project>/missions/`) holding its life's artefacts colocated; **the equation ran one way** — the mission carries the front artefacts' content and never references `intent.md` or `squad.md` by filename, with the two vehicles (`blueprint.md`, `investigation.md`) referenced and never reproduced; the **header fields** stamped and read as boilerplate — `Written against version` is the fleet-material commit as `<repo>@<commit>`, never checked against the target repo; and a scribe who had to **invent to finish** sent the gap back upstream instead of filling it.

Whether the content of each artefact is right is marked by its own skill; this file marks the structure.

N/A where no mission artefacts were produced or consumed. INCONCLUSIVE where the directory isn't visible.
