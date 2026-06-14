# technical-writing — SUCCESS

The criteria for judging whether this skill was followed. The SKILL.md is based on this file, not the other way around.

## What this verifies

Whether output written for a technical reader describes what changed and why it matters, rather than how it was built. This is the universal principle the `sc-` writing skills embed; on its own it covers technical output not carried by one of those — code comments, technical docs.

A marking guide based on evidence. No technical-audience output written, nothing to mark — see N/A.

## Where to look

The technical output and the change it describes — the comment, doc, or other text, read against the diff.

## How to judge

### PASS

Read against the change:

- the subject is the **system**, not the author — what the system now does, not what was written;
- both the **capability and the surface** are named — what changed and where it's encountered (flag, field, event, config key);
- a reader understands it **without opening the diff**;
- where it gives a **why**, the why *explains* — what the change enables, or what now behaves differently — rather than *justifies*. "Group status recalculates when a licence changes" explains; "refactored for clarity" justifies.

### FAIL — judgment

The writing describes implementation — names functions, files, patterns visible in the diff — so the reader has to open the diff to find the meaning. Or the verb is a category label that fits almost any change in the project (*configure*, *update*, *improve*, *support*). Or the "why" is a justification rather than an explanation — a virtue label defending the change ("for clarity," "for maintainability," "to improve readability") in place of what the change enables. Judgment, read against the change, not a word-list.

### N/A

No output for a technical audience was written. The skill is triggered by that context; without it, no occasion — known not to apply.

### INCONCLUSIVE

You can't see the output or the change it describes — truncated pane, artifact not visible. "I can't verify."
