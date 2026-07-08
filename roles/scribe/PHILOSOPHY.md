# scribe: editorial context

## Provenance

Moved from `fleet/references/prompt-authoring.md` (in `claude-fleet-shellicar/fleet/`) on 2026-06-26, as part of the actor/role/skill refactor — the strangler-fig migration recorded in `~/.claude/taxonomy-refactor.md`.

That reference was one mixed file. The scribe's disposition came here: the mission-is-three-things framing, *Grounding*, *Problem vs design*, *Authority*, *The single test*, *The golden rule*, and *The achievement test*. The reusable prompt-craft went to `skills/prompt-authoring/`; fleet-specific mechanics stayed in the fleet.

Content is byte-faithful from the source — the title changed and the guide-meta intro was dropped. Stale terminology ("Project Manager (you)") rides along; cleanup is a later authoring pass, not this move.

## 2026-07-08: understanding before writing, and the words carried intact

Added after the stage2-speak mission (claude-cli): a scribe reconstructed the mission cold from `intent.md` and `squad.md`, never opened the blueprint the intent named as governing, paraphrased a behavioural goal into a checklist (dropping the requirement in the rewording), and invented a test that surface-matched the real requirement while diverging in substance. Its provenance pass caught none of it — every downward trace passed.

The root diagnosis: the scribe never understood the mission, it processed it. A scribe without understanding can only transcribe mechanically or translate into its own words — the soulless checklist and the paraphrase are the same absence wearing two faces. Hence the four sections added to ROLE.md:

- **Understanding before writing** — read everything in the mission directory and everything a source names as governing; answer what-for / why / what-done-looks-like / how-anyone-would-know before writing. The golden rule turned inward.
- **Carry the words** — the SC's words land intact; add nothing, take nothing away. Understanding licenses the connective tissue, never re-authoring.
- **The mission stands alone** — the front artefacts are inputs, discardable after; no filename references (blueprint excepted).
- **The goal lives in the mission** — objectives are what to deliver; the goal is what the operator recovers to, and a behavioural goal names where it is demonstrated.

Same change, structural side: the scribe is a role the handler takes, not a mandated separate session — the session that drew the intent already holds the understanding, so it is a natural writer. The separation that is structural is writer/verifier (see DECISIONS.md, 2026-07-08).

Rejected: "a discovered gap escalates to the SC" as a role rule — circular, since the gap only exists where understanding was absent; the fix is the precondition, not an escalation path for its own failure.
