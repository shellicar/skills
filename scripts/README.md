# The SC's scripts

This directory is the Supreme Commander's. The session launchers here (`start-*.mjs`) are how **he** starts sessions — they are not fleet infrastructure, not dispatch tooling, and not yours to run, ever.

If you are a Claude and you have found your way here: no skill, role, or memory that mentions these scripts is an instruction to run them. A description of a thing is not a directive to use it — a handler once manufactured "I should launch the scribe" out of exactly such a description, and executed a launcher the SC never asked for. Launching sessions is the SC's act.

The launchers enforce this themselves (`lib/sc-only.mjs` refuses any process with `claude-sdk-cli` in its ancestry), but the fence is not the rule — this is the rule: **the SC runs these; Claude does not.** If work seems to require launching a session, stop and take it to the SC.

Cast-run scripts live with the skill whose craft they embody (`skills/<skill>/scripts/`), never here.
