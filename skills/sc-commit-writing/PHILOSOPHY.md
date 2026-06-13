# sc-commit-writing: editorial context

This file is the editorial context for the `sc-commit-writing` skill. Read it before modifying `SKILL.md`.

## Why this skill exists

Commit messages are the permanent record of intent. The diff shows what changed; the message is the only place where the why can live. A message that describes what the diff already shows has wasted that opportunity.

The failure is common enough to have a name: "Move function to x.ts," "Refactor X for clarity," "Update Y to use Z." Each of these describes mechanics visible in the diff. None of them tells the reader anything they could not learn by reading the diff. Git log filled with these entries is a log with no information.

## Origin

Claude asked to write a commit message defaults to describing what was done: what function was moved, what was refactored, what was updated. This looks like a commit message. It has the right shape. But it repeats what is already in the diff rather than supplying what is not.

"Refactored X for clarity" became a pattern that accumulated into noise. Every commit started to look the same. The register ("for clarity," "for readability," "to improve performance") is Claude's filler — plausible-sounding justification that carries no actual information. It is the written equivalent of "we made some updates."

The Conventional Commits prefix pattern added a second layer of noise: `feat:`, `fix:`, `chore:`. These prefixes exist to drive automated version-bumping tooling. Without that tooling, they are bureaucratic noise appended to an already weak message.

A third accumulation was verbosity disproportionate to the change. Claude, asked to write a commit message for a one-file change, would produce seven lines — a summary, a list of what was done, sometimes a note on why. The thoroughness felt helpful at first. After enough of it, a commit message longer than the change it describes is obviously wrong.

## Key insights

### The message supplies what the diff cannot

The diff shows what moved. The message should show why it moved — what it enables, what problem it solves, what decision was made. "Move authentication logic out of the request handler so it can be tested without a network" is a different message from "Move auth logic to auth.ts." Both describe the same change; only one adds something.

### Category-label verbs are a tell

Verbs like *configure*, *update*, *improve*, *refactor*, *support* apply to almost any change in any project. A message built on one of these is a category label, not a description. It signals that the author described what they did rather than what changed.

### Don't justify the obvious

Routine work does not need a reason stated. "Refactoring" is a complete commit message for a refactoring. The reader opens the diff and sees what was refactored. Adding "to improve clarity" or "to reduce complexity" is a tautology — that is what refactoring is. Stating the obvious is a junior tell: senior work does not apologise for existing or explain what the diff already shows.

The commit message explains the commit. The code explains the code. These are separate jobs.

Proportionality follows from this: match message length to the significance of the change. A single-file rename gets one word. A non-obvious architectural decision might warrant a sentence. What breaks the contract is a message longer than the change — when the message has more content than the diff, something is wrong.

### A partial description misdescribes the change

If a commit mixes operation types — say, a refactoring and a new feature in the same commit — the message must mention both. A message that only mentions the feature leaves a reviewer looking at the refactored code confused: was this intentional? Is it related? Did you mean to commit this?

The commit message is the reader's map to the diff. A partial map is a misdescription. The test: could a reviewer look at any part of the diff and be confused by the message? If yes, the message is incomplete.

This also means commit strategy affects message shape. The same code committed separately produces two simple messages; committed together produces one message that covers both. The message reflects the commit as it was made, not an ideal.

### Conventional Commits: the spec vs. the community version

Conventional Commits defines three things with semantic meaning: `feat` (minor version bump), `fix` (patch bump), and `BREAKING CHANGE` in the footer (major bump). That is the entire spec. The purpose is machine-readable commit messages — tooling reads those tokens to drive automated semver and changelog generation.

The spec says nothing about branch names. It does not define `chore:`, `docs:`, `refactor:`, `style:`, `test:`, or any of the other types the community adopted. Those are accretions — the community extended the vocabulary because it looked like it completed the set, not because the spec required it or the tooling used it.

The origin of the rule in this skill is specific. Stephen already disliked the community version before Claude entered the picture: colleagues writing `chore:` (your job is boring, get another one) and `feat:` (you cannot be bothered to write the word) and branch names that followed a pattern the spec never specified. Then Claude started writing Stephen's commit messages the same way. Seeing his own name on `feat:` and `chore:` commits — the thing he already disliked, now attributed to him — was intolerable.

The response was to ban it everywhere, write skills saying never use conventional commits. Then two things happened: the official skill-creator skill was discovered to have Conventional Commits as a worked example of how to write a commit message (Claude teaching Claudes to do the thing, compounding the pattern), and Stephen actually read the spec. The spec was fine. Everything he hated was the community practice, not CC itself.

This is what LLMs replicate: not the spec, but the community version of the spec. Training data is full of `chore:`, `feat:`, `docs:` commits — the cargo-culted extension that most developers follow without knowing what the underlying tooling is for or whether they use it. Claude learned the average, and the average is the community version. Em dashes and `feat:` are the two clearest indicators of AI-generated code today, for the same reason: both are Claude defaults that accumulated from high-volume patterns in training data.

The rule here is not "Conventional Commits is wrong." It is: these projects do not use CC tooling, so the prefixes serve no purpose. And the community vocabulary that masquerades as CC — `chore:`, `docs:`, branch names like `feat/` — never served a purpose in the spec either.

## What was rejected

- Keeping Conventional Commits prefixes as a convention. A convention that serves no function is noise.

## What this skill does NOT cover

- PR text — `sc-pr-writing`
- Work item text — `sc-workitem-writing`
- The underlying principle — `technical-writing`
- Stephen's voice (directness, no em dashes) — `sc-ghostwriting`, the required base loaded alongside this skill

## Notes for future editors

- The good/bad examples are load-bearing. They make the rules concrete and distinguishable. A rule without an example is harder to apply correctly.
- The no-prefixes rule should keep its reason. It is not arbitrary — it is that the convention serves a purpose these projects do not need.
- "Refactored X for clarity" is the canonical bad example because it accumulated in the wild. Keep it as reference.
