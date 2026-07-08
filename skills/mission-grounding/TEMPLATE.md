# Provenance — {mission}

Written **before** the mission. These rows are the evidence extracted from the sources; `mission.md` is composed from these rows and nothing else. After composing, each row records where it landed.

## Evidence

`Source` is an enum — exactly one of `SC | Project | Fleet`. `Text` is the evidence itself: the SC's words from `intent.md`, the project file line, the fleet reference. `Carried` is filled after the mission is composed: where the row landed, intact.

| Decided item | Source | Text | Carried |
|---|---|---|---|
| {a decision, illustration, or fact the mission will carry} | SC | "{their words from intent.md}" | {where in the mission, intact} |
| {...} | Project | {the CLAUDE.md / README / brief line} | {...} |
| {...} | Fleet | {the skill / rule reference} | {...} |
| `blueprint.md` (when the file exists) | SC | the pinned blueprint | referenced at {where} — never reproduced |

## Coverage

| Goal / objective | Done by | Proven at |
|---|---|---|
| {the goal, in the intent's words} | {phase} | {where it is demonstrated} |
| {objective N} | {phase} | {test / check / artefact} |

## Gaps

{Anything the mission needs that no source supplies — named and sent upstream to the SC, never filled in here. Or: "None."}
