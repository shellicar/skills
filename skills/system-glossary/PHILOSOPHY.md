# system-glossary: editorial context

Not loaded at runtime. Read before you change `SKILL.md`, so the edit stays aligned with the reasoning that produced it.

## Why this skill exists

Without one shared meaning a word drifts between sessions, and Claude reaches for a synonym. The glossary is the ubiquitous language every session loads, so a word means the same thing everywhere. It is deliberately positive: it defines the vocabulary the SC wants spoken. What *not* to say — failure patterns like coinage and prestige imports — lives in `clear-communication`, the skill that governs the behaviour, not here.

## Key rules for editing

- **Definitions, not explanations.** No examples, no rationale in the entries — the preamble says so, and an entry that grows a history has stopped being a glossary entry. The why behind a term lives where the term is used, or here.
- **Search the whole repo before adding or changing a term** (the repo guide carries this rule). The material must not contradict or misuse the term. The cautionary case: `blueprint` was defined while the Engineer role already used the word for class design, and the term was muddied from birth.
- Each entry ends with an `_Avoid_` line — the synonyms not to use, so one word keeps one meaning.

## Entry histories

### generate (added 2026-07-10)

The evidence behind `_Avoid_: mint, minting, coin`, cut from the entry to keep it a definition:

"Minting" is a Claude coinage, not documentation vocabulary. Measured in this system's own conversation history: the word barely existed before June 2026 — 4 hits in June, the first on 10 June, all assistant-authored, all in id-creation contexts — then 171 hits in July, a roughly 40× spread. Of 175 total occurrences, 127 were in documents Claude wrote and read back in, 45 in assistant prose, and 3 from the SC — none adopting it: twice reacting to it, once investigating it. The timing matches the arrival of a new model version (the SC's attribution: Opus 4.8), and the one time the word reached the SC in a design document, he had to quote it back and translate it into plain English to confirm he understood his own requirements.

The mechanism is the closed loop: a model tic lands in Claude-written intents, missions, and memories; later Claudes read Claude-authored text as evidence of house style; the tic compounds into apparent convention with no human ever having used it. The corpus cannot be the authority for language, because the corpus is us. The glossary entry is the external correction made durable.

The repo-wide search on adding the term found exactly two uses of "mint" in the material — both written by the same session that added the entry, that same night — corrected to "invents"/"invented" in the same change.

## Notes for future editors

- Keep entries definition-shaped. When an entry needs its story told, tell it here under Entry histories.
- Additions to `_Avoid_` lines should come from real caught instances, not generated lists of synonyms.
