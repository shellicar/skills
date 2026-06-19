# sc-commit-writing: editorial record

This file is the editorial record for the `sc-commit-writing` skill: how it came to be shaped this way, what was rejected, and notes for the next editor. The reasoning behind each rule now lives in the skill itself, next to the rule it explains; this file holds the history, not the why.

## Origin

Claude asked to write a commit message defaults to describing what was done: what function was moved, what was refactored, what was updated. This looks like a commit message. It has the right shape. But it repeats what is already in the diff rather than supplying what is not.

"Refactored X for clarity" became a pattern that accumulated into noise. Every commit started to look the same. The register ("for clarity," "for readability," "to improve performance") is Claude's filler — plausible-sounding justification that carries no actual information. It is the written equivalent of "we made some updates."

The Conventional Commits prefix pattern added a second layer of noise: `feat:`, `fix:`, `chore:`. These prefixes exist to drive automated version-bumping tooling. Without that tooling, they are bureaucratic noise appended to an already weak message.

A third accumulation was verbosity disproportionate to the change. Claude, asked to write a commit message for a one-file change, would produce seven lines — a summary, a list of what was done, sometimes a note on why. The thoroughness felt helpful at first. After enough of it, a commit message longer than the change it describes is obviously wrong.

## Conventional Commits: the spec vs. the community version

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
