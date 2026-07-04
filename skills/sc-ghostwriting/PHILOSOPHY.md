# sc-ghostwriting: editorial context

This file is the editorial context for the `sc-ghostwriting` skill. Read it before modifying `SKILL.md`.

## Why this skill exists

Stephen uses Claude for things he would rather not write himself — commit messages, work items, emails, review comments. Claude is capable; it handles the tedious parts. But those outputs go under his name. They represent him to his colleagues and to his future self reading back through history.

The problem is not any single output. It is the accumulation. Em dashes everywhere. "Refactored X for clarity" in every other commit. PR review comments that sound like a competent but generic reviewer, not like Stephen. At some point you read something with your name on it and it genuinely does not sound like you.

The standard is simple: if it goes out as Stephen, it should sound like Stephen. Not "good enough to pass." What he would expect from himself.

There is a second dimension beyond self-representation: the recipient. A letter to Stephen's father, however carefully thought through, fails if it reads as AI-generated — not because the content is wrong but because the person behind it disappears. His father would not think Stephen wrote it. The hours of thought become invisible behind the medium.

This is not about hiding AI use or managing how others perceive it. Stephen uses AI openly and for everything he can automate. The concern is register and respect: the same words land differently in different contexts. Sending an email to a CEO that opens "G'day Mate" would communicate something very different than saying it in person — not because the words changed but because the medium and register did. A business letter with stick figures wouldn't be taken seriously regardless of its content. Form communicates alongside content, and form that's wrong for the context works against the message.

## Origin

The em dash was the first obvious signal. It appeared in Claude's output constantly — in commits, in emails, in review comments. Stephen does not write with em dashes. After seeing it everywhere for long enough it became impossible to ignore. "Refactored X for clarity" followed the same pattern: individually fine, cumulatively a tell that something else was writing as him.

PR review comments made the quality dimension visible. Claude reviewing a PR as Stephen produces technically correct observations in a generic register. That is not the same as Stephen reviewing. The comments should reflect his judgment and voice, not a competent substitute's.

## Key insights

### Cumulative representation matters more than individual output

Any single commit message, email, or review comment might be acceptable. But outputs accumulate. Colleagues read patterns across dozens of interactions. Future readers read histories. The register mismatch becomes visible not in the individual instance but in the volume.

### The standard is "what I would expect from myself"

Not "not obviously AI." Not "passes a casual read." If Stephen would read it back and think "that doesn't sound like me," the skill has failed. The bar is his own standard for his own work.

### PR reviews have a relationship dimension

When Claude reviews a PR as Stephen, the author reads those comments and forms an impression of the reviewer. Generic Claude review quality misrepresents Stephen's standards to the author and to anyone else reading the thread.

### LLMs homogenise; maintaining voice resists that

LLMs train on generated content, which trains future LLMs, which generate more content. The distribution of what "normal writing" looks like narrows with each cycle. Writing norms converge toward whatever patterns LLMs produce at scale.

The em dash illustrates the speed of this. It moved from a deliberate literary choice to a primary AI tell in under two years — not because it became wrong, but because it became the LLM default. Someone who used em dashes throughout their writing before LLMs now finds their own voice can look like AI output.

Stephen did not know what an em dash was before using Claude. That is the direction the process runs: LLM patterns become the new normal for people who grow up with LLMs, without the before-and-after that makes the shift visible.

Using Claude to write as Stephen is only worthwhile if the result meets the bar Stephen would set for himself. If it falls short — sounds like someone else, reads as generic, carries Claude's defaults instead of his voice — it is not making things easier. It is making them worse: the output needs noticing, correcting, or living with. The skill exists to hold that bar.

## What was rejected

- Distributing voice preferences into each artifact skill. A single voice layer means updating one place when preferences are clarified, not updating every artifact skill.

## What this skill does NOT cover

- Universal writing principles — `technical-writing`
- Artifact-specific format rules — `sc-commit-writing`, `sc-pr-writing`, `sc-workitem-writing`
- How Claude interacts with Stephen in conversation — `executive-communication`

## Notes for future editors

- New voice preferences come from Stephen noticing something, not from inference. Do not add preferences that sound plausible but have not been observed.
- This skill will grow over time as more patterns surface. A thin and accurate skill is better than a padded one.
- The em-dash rule is an example, not the point. The point is register fidelity — output that reads as Stephen's, not Claude's.


## 2026-06-28 rework: feeding the voice layer

For months this skill was a stub: the em-dash rule and the word "direct." The thinness did not show until a claude-cli documentation mission, where a fresh handler, told only to be "direct," produced blunt slogans ("the bet is X over Y", "anemic by design", "the thesis is simple") and transcribed the SC's spoken reasoning straight into a README. Both are voice failures, and both trace to the empty layer: an adjective gets interpreted into a caricature, and with no examples to match, conversation becomes the thing copied.

### Decisions

- **Encode the voice by examples and contrasts, not adjectives.** Real samples of Stephen's writing to match, and tells of drift drawn from the actual failures. This is the operative form, and it now lives in the SKILL.
- **The operative why moved into the SKILL.** Per the 2026-06-26 migration (sc-commit-writing, collaborative-conversation), the reasoning that shapes the writing sits next to the rule, where it loads. This file keeps the history.
- **Added `sc-doc-writing`** as the README-shape child, the same split as the other format skills. The doc case was the primary case only because it gave the empty voice layer enough room to fail visibly; the lesson is the voice layer's, not documentation's.
- **Kept the voice/format split; did not recombine.** The worry that it was "split too quickly" traced to the umbrella being starved while the children were built out, not to the split itself. The answer is to feed the umbrella.
- **Say what you are trying to communicate.** Added after Claude repeatedly read "plain, down-to-earth" as "dumb it down." The plain instruction (work out what you mean, then say that, nothing dressed up or cut) replaced an earlier abstract framing ("the register, not the depth") that the SC found unclear: it was itself too abstract about being plain, which was the point. His words, and a demonstration of them.
- **The writer owns whether the reader understands.** The disposition under the whole voice: communicating well is humbling yourself and meeting the reader in their frame (Stephen's framing, with the sheep-to-shepherds example). It is in the SKILL as the governing stance. The universal form of it belongs in `clear-communication`, as the disposition under "understood on one read," and is left for the SC to place there rather than edited into his foundational skill unprompted.

### What was rejected

- **The first rebuild drafts.** They stacked prohibitions ("never transcribe", "do not perform directness", "what never appears"), the negative framing `claude-philosophy` says fails by construction; put the operative why in this file instead of the SKILL; and addressed Claude in a detached third person. Rebuilt to the genre: positive, why in the SKILL, Claude-addressed, examples as the target.
- **Recombining the sc- writing family.** The split is sound; the umbrella was empty, which is a different problem.


## Where exemplars come from (added 2026-06-28)

The homogenisation point above has a sharp practical edge for this skill. The natural instinct is to point at recent output as the model: "read the recent commits to see how Stephen writes." But most recent commits are now authored by Claude. Sampling them to learn his voice reads Claude's output back as his, and a year on it is Claude learning from Claude, the loop closing on itself. Exemplars must come from sources known to be his (his older hand-authored READMEs), not from the accumulating output the skill exists to correct.
