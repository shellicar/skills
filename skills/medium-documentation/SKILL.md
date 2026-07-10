---
name: medium-documentation
description: |
  WHAT: README and package documentation in the house format: a reference doc whose body is code, with the why held to a short Motivation.
  WHY: Claude's default turns a README into a pitch (origin story, why-you'd-want-it, a thesis, bottom-line bullets). These are reference manuals.
  WHEN: TRIGGER when writing a README or package-level documentation.
user-invocable: false
skills:
  - audience-developer
metadata:
  category: standards
---

# Medium: documentation

The reader landed cold, handed a link and nothing else, and wants to know what the thing is, how to install it, and how to use it — a technical reader (`audience-developer`) with no context. The voice composes at load; for Stephen's packages, `voice-stephen`, and its match-his-READMEs rule is where the voice work happens.

A README is a reference manual: the body is code, and the why is a short Motivation. It is not for the author, and it is not a sell.

## The house shape

His ecosystem packages are the target (`core-config`, `build-clean`, `winston-azure-application-insights`, `core-di`), and they are strikingly consistent:

- `# @scope/name`
- `> one-line tagline` (a blockquote, optional)
- npm and build-status badges
- `## Features`: emoji bullets, each a **bold term**, a dash, a short factual clause
- `## Installation & Quick Start`: an `npm` block and a `pnpm` block, then a minimal code example
- the `<!-- BEGIN_ECOSYSTEM -->` / `<!-- END_ECOSYSTEM -->` markers, left for tooling to fill
- `## Motivation`
- `## Usage` / `## Feature Examples`: a **bold intro line**, then a code block, repeated
- `## Options` / `## Configuration`
- `## Credits & Inspiration`

The body is code; the prose is minimal.

## Motivation carries the why

The reason the thing exists is a short Motivation: two to four plain sentences, the problem then what was done, and stop. Everything about "why you'd use this" fits there. His, to match:

> Existing solutions like tsup's `clean: true` delete the entire output directory, which causes issues... This plugin cleans after the build completes, removing only unused files.

> most DI libraries have not been updated, so I decided to create my own.

## The tell is the voice, not the structure

A "why you might want this" and a scannable summary are not pitch failures in themselves. What makes something a pitch is the register: selling. "Here's why you might want this" is a courtesy; "here's why you'd want my awesome library" is a pitch. The tells are in the words, not the sections: an announced thesis ("the bet is", "by design", "the thesis is simple"), hype, a paragraph that argues instead of informs, a slogan that repeats the line before it. When the voice sells, pull it back to plain statement; the structure can stay, the selling cannot. The origin is not a section of its own, it is the Motivation, told plainly.

## When a "why you might want this" and a summary earn their place

Two things warrant more than a bare reference doc, and it is a judgement, not a default:

- **A capable incumbent.** When the thing competes with a well-known tool the reader already has, "why would I use this over the obvious thing?" is a real question. A terminal client *for Claude Code* is that case: Claude Code exists, in the web app and its own CLI, and does more, so a plain "why you might want this" and "what it doesn't have" answers a question the reader is genuinely asking.
- **A complex app.** A small, targeted package (`core-di`) needs no orienting; a larger application does. A scannable bottom-line is a fast way in, and it respects the reader's time when there is enough to take in that they need one.

Neither changes the register: the "why" is a courtesy, the summary is a convenience, both stay in plain statement. `core-di` has neither an incumbent nor much surface, so it has neither section, and that is right too.
