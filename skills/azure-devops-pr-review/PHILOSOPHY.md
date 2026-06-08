# azure-devops-pr-review — Philosophy

This file is editorial context for `SKILL.md`. It is not loaded at runtime. Read it before modifying the skill so changes stay aligned with the reasoning that produced it.

## Why this skill exists

Two things. Reviewing pull requests is valuable work, and it is hard for LLMs to do well — the trained reflex is to ratify rather than investigate. I want a standalone, shareable skill that makes the discipline portable; something others can pick up without inheriting the rest of my system.

The second part is selfish. Each real review surfaces what this codebase, this team, this family of repos actually cares about. Generic style guides do not capture it. The review file is the raw material from which those preferences become explicit, and over time the skill grows to encode them.

## Origin

I asked for a new standalone skill, distinct from the internal `devops-review` skill. That one is tied to a system I am building; this one is shareable. The empty `SKILL.md` was a scaffold I started and abandoned. The content here was written fresh against the five questions I named — who, what, how, when, why.

## Key insights that shaped this skill

**Prose in the codebase is input to evaluate, not context to absorb.** This is the load-bearing impartiality stance. Comments saying "by design" or "intentional" condition LLM generation as if the claim were settled; the human-reviewer instinct that such prose makes code *more* suspicious does not fire by default. Without this stance written explicitly, the reviewer ratifies whatever the codebase already says about itself.

**Triple-dot diff is load-bearing.** Reviewing the wrong delta — what double-dot produces when target has moved — is a silent correctness failure. Findings will be wrong in both directions: changes that belong to target get flagged as the PR's, changes that are the PR's get missed because they look like target moves. The three dots are not a stylistic choice.

**Severity is descriptive, not imperative.** The reviewer surfaces; the author resolves; the merge authority decides. `MUST FIX` and `blocker` collapse those roles into one and put the reviewer in a position the reviewer does not hold. The four-level vocabulary (`issue` / `concern` / `suggestion` / `nit`) names weight without claiming authority.

**Local checkout exists for verification, not modification.** The point of pulling the branch down is so that suggestions are tested against real files and real imports. Nothing is pushed, nothing is committed back to source. v1 keeps this constraint explicit so the skill does not drift into "review and propose changes" territory.

**The review file is the artefact; the response points at it.** Brief summaries in the response invite me to read the file. Long summaries invite me to skip it. The shape encourages the right read.

## Decisions made

- **Scope kept to producing the artefact.** Posting comments to ADO, voting, merging — all out. Each is a separate concern with its own approval semantics; bundling them defeats the human-in-the-loop posture the file enables.
- **File location at repo root, gitignored.** Not under a hidden directory. Visible while I am working in the repo, not committed accidentally.
- **`az repos pr show` rather than raw REST.** The shareable target — a user with `az` CLI and the `azure-devops` extension — has this command. My internal `ado-rest.sh` wrapper is not available outside the system I am building.
- **No conventions skills loaded.** This skill is shareable; it does not pull in shellicar/eagers/hopeventures conventions. The standards-encoding happens by editing this skill over time for the team using it, not by chaining to private skills.

## What was rejected

- **Imperative severity (`MUST FIX`, `blocker`).** Common in PR-review templates, intentionally excluded. Collapsing reviewer judgment and merge authority is the failure mode the descriptive vocabulary protects against.
- **Auto-posting comments to the PR.** Bundling this in turns the skill from "produce a record" into "act on the PR" — different scope, different stakes.
- **Forensic record as engineered process.** I told Claude this was internal and lightweight. The file exists; that is the mechanism. No structured forensic templates, no separate forensic artefacts.
- **Inheriting structure from `devops-review`.** That skill is part of a system I am building. Borrowing its structure would couple this shareable skill to assumptions that do not travel.

## What this skill does NOT cover

- Posting, voting, completing, or merging the PR.
- Repo-specific convention rules (those live in conventions skills, loaded separately).
- Triggering on events or running on a schedule.
- Reviewing PRs on platforms other than Azure DevOps.

## Notes for future editors

- The triple-dot vs double-dot distinction is correctness, not style. If a future edit drops or weakens it, the skill silently starts producing wrong reviews. Hold the line.
- Severity vocabulary is deliberate. Adding `blocker` or `MUST FIX` reintroduces what the four-level scheme rejects. If new vocabulary is needed, add it at the same level of imperative-ness (descriptive, not directive).
- The "nothing pushed" constraint on the local checkout is v1's safety. When the skill grows beyond producing the file (posting comments, suggesting commits), revisit explicitly — do not drift past it by accident.
- This skill is shareable. Do not add references to internal scripts, `ado-rest.sh`, or any tool that does not exist in a vanilla `az` + git environment. If you need a richer ADO API, use `az devops invoke` (which the extension provides) rather than an internal wrapper.
