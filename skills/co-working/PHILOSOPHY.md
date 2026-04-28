# co-working: editorial context

This file is the editorial context for the `co-working` skill. It is not loaded by the skill at runtime. Read it when you intend to modify `SKILL.md`, so the modification stays aligned with the reasoning that produced the current content.

## Why this skill exists

When the SC is also active in the same system, Claude's default assumption that "nothing outside my box has changed since I last looked" is wrong. The actual directory has more in it than Claude knows about: the SC's work in progress, untracked files, mid-edit changes. Acting on broad assumptions about state without accounting for those is firing without seeing what is downrange.

This skill is the protocol for operating against that default assumption. It is loaded when the SC is co-working; not all sessions are co-working, so it is not foundational.

## Origin

Same incident as `safe-operations`: the chain-of-failures from the SC's early days with Claude. The third dimension that made the destruction worse was that the SC was actively editing alongside. When Claude ran `ls | xargs git checkout`, it did not just erase Claude's pre-emptive import edits; it erased the SC's uncommitted work too. Claude's mental model was "I am the only actor here, my changes are the only thing at risk". The actual model needed was "we are both active; my model of state is incomplete".

The shotgun-with-eyes-closed analogy describes this: the SC has eyes on the system; Claude has memory. Acting on memory of state when actuality has diverged is firing without seeing.

## Key insights that shaped this skill

### Model versus actuality

Claude's model of the directory is whatever has been read into context plus whatever Claude remembers doing. The actual directory has more in it. The model and the actuality diverge silently. Operations that act on broad enumerations (`ls | xargs`, `find . -delete`, `git add .`) act on the actuality, not the model.

### Default training assumption

Claude is trained to assume that the environment changes only as a result of his own actions. In solo work this is approximately true. In co-working it is wrong. The skill exists to override this default at specific moments where the override matters.

### Three areas of git, especially the index

The index is workflow state. The SC stages a file, keeps editing, diffs staged versus unstaged to see what is going to commit versus what is still in flux. `git add` re-staging a file destroys that review state. In co-working, this is amplified: `git add .` sweeps in untracked files that are the SC's work in progress.

### Asking is cheapest in co-working

When the SC is co-working, the SC has direct knowledge of what is in the directory and why. One turn to ask costs less than several turns speculating. The cheap-asking principle applies specifically to "I see something that does not match my model of what should be here" situations, where the SC has the answer immediately.

### Calibration, not paranoia

The skill is for specific moments where Claude's model diverges from the SC's: broad enumerations, staging, committing, pushing, surprises. Most actions are not affected. Reading files, running tests, normal command execution are unaffected.

This is a specific concern that came up explicitly during the conversation: the skill should not undermine Claude's confidence by inviting paranoid asking about everything. Asking about every small uncertainty doubles the turn count. The skill is calibration, not paranoia.

### Commit as knowledge checkpoint

Once committed, a file's history becomes a reference Claude can rely on rather than memory. Getting the commit boundary right makes the rest of the work lighter, because git history takes the load off Claude's model. This is an additional reason the before-commit check matters: not just safety, also offload.

## Decisions made

### Skill name: co-working

Condition-named. The skill loads when the condition (SC is also active) is true. Unlike `safe-operations` which is content-named, `co-working` works either way: the condition is also descriptive of what the skill is about.

### Situational loading, not foundational

This skill loads explicitly when the session is co-working. Most sessions are not. Foundational treatment would mean loading every session, which is overhead for the common case where the SC is not actively in the system.

### Voice: I speak, addressed to Claude

Same as the other skills.

### Calibration paragraph at the top of HOW

The calibration framing was added explicitly because of the risk that the skill could be read as "ask about everything". The opening paragraph of HOW makes scope explicit: this applies to broad enumerations, staging, committing, pushing. Not to general operation.

## What was rejected

- Folding co-working content into `safe-operations` as a section. The conditions are orthogonal: a session can be co-working in a sandbox (no real consequences) or co-working on a host (both apply). Splitting them by condition keeps the loading model clean.
- "Always be cautious in co-working" framing. Rejected as undermining confidence and turning the skill into paranoia.
- Generalised "ask when uncertain" wording in the asking section. Bounded specifically to "things that do not match your expectation in the shared state" so other kinds of uncertainty (test results, code structure) are unaffected.

## What this skill does NOT cover

- Destructive command safety on the host. That is `safe-operations`.
- The general philosophy of working with Claude. That is `claude-philosophy`.
- The address protocol or brewing cycle. Those are `commander-protocol` and `teapot-protocol`.
- Solo sessions. The default assumption (nothing outside the box changes) is approximately safe in solo work; the skill is unnecessary there.

## Notes for future editors

- The calibration framing is load-bearing. If editing produces text that reads as "be paranoid about every git operation", that is regression. The opening paragraph of HOW exists to scope the skill explicitly; preserve it.
- The asking-is-cheap principle in this skill is bounded to "things in the directory that do not match your expectation". Do not extend it to general uncertainty without explicit discussion.
- The shotgun-with-eyes-closed analogy is the SC's framing and grounds the principle. Editors who feel the analogy is dramatic should leave it; the drama is the point. Pattern-matching execution without state model is exactly that risky.
- The commit-as-knowledge-checkpoint framing is an additional reason for the before-commit check; do not lose it. It reframes the check from "be safe" to "this is also useful to you".
