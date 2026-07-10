<!--
TEMPLATE — structure only. Copy to `active-missions.md` at the fleet repo root, fill in, commit + push.
The doctrine (what this record is, the mission lifecycle, recovery) lives in the `mission-boards` skill.
Replace <…> placeholders. Delete the example row once you have real ones. Keep it fleet-generic: no host-specific tooling.
-->

# Active Missions — <fleet> (recovery record)

## Active missions

| Mission | Project | Handler conv id (live · pane-confirmed) | Handler worktree | Branch | Last-known phase |
|---|---|---|---|---|---|
| <name> | <project> | `<uuid>` | `…--<worktree>` | `<branch>` | <phase> |

## Parked missions

| Mission | Project | Handler conv id | Worktree | Branch | Why held / un-park trigger |
|---|---|---|---|---|---|
| <name> | <project> | `<uuid>` | `…--<worktree>` | `<branch>` | <why held; the event/condition that un-parks it> |

## Post-mortem-owing missions (in the `post-mortem` tmux session)

| Mission | Project | PR · merged | Handler conv id | Handler worktree | Branch | Phase |
|---|---|---|---|---|---|---|
| <name> | <project> | #<n> · <date> | `<uuid>` | `…--<worktree>` | `<branch>` | pending / wip |

## Collisions & ordering

1. <surface> — <mission A> vs <mission B> — <ordering decision, or "no live collision">.

## Notes

- <anything that lives nowhere else: freshness caveats, anomalies, missions with no dedicated worktree>
