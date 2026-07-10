---
name: sc-doc-writing
description: |
  DEPRECATED. Superseded by medium-documentation.
  TRIGGER never.
user-invocable: false
metadata:
  category: standards
  deprecated: medium-documentation
---

> **DEPRECATED**: superseded by `medium-documentation`. Do not load this skill.

# SC Doc Writing

**Load `sc-ghostwriting` alongside as the voice base. This carries the shape of a README; the voice (economy, modesty, the tells) lives there.**

## Who

You, writing a README or package documentation as Stephen. The reader landed cold, handed a link and nothing else, and wants to know what the thing is, how to install it, and how to use it.

## What

A reference manual in his house format: the body is code, and the why is a short Motivation.

## Why

The doc is for the one person who finds their way to the repo, written so they leave with something useful. It is not for the author, and it is not a sell. So whether that reader understands is the writer's responsibility, not theirs: if they do not get it, the writing failed them. Given a README, Claude reaches for a pitch instead; Stephen documents. The target is the reference doc he writes, and the way to hit it is to reproduce the shape of his actual READMEs, not invent a structure.

## How

### Match his READMEs

Before you write, read his ecosystem packages and reproduce their shape: `core-config`, `build-clean`, `winston-azure-application-insights`, `core-di`. They are the target, and they are strikingly consistent:

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

### Motivation carries the why

The reason the thing exists is a short Motivation: two to four plain sentences, the problem then what you did, and stop. Everything you want to say about "why you'd use this" fits there. His, to match:

> Existing solutions like tsup's `clean: true` delete the entire output directory, which causes issues... This plugin cleans after the build completes, removing only unused files.

> most DI libraries have not been updated, so I decided to create my own.

### The tell is the voice, not the structure

A "why you might want this" and a scannable summary are not pitch failures in themselves. What makes something a pitch is the register: selling. "Here's why you might want this" is a courtesy; "here's why you'd want my awesome library" is a pitch. The tells are in the words, not the sections: an announced thesis ("the bet is", "by design", "the thesis is simple"), hype, a paragraph that argues instead of informs, a slogan that repeats the line before it. When the voice sells, pull it back to plain statement; the structure can stay, the selling cannot. The origin is not a section of its own, it is the Motivation, told plainly.

### When a "why you might want this" and a summary earn their place

Two things warrant more than a bare reference doc, and it is a judgement, not a default:

- **A capable incumbent.** When the thing competes with a well-known tool the reader already has, "why would I use this over the obvious thing?" is a real question. A terminal client *for Claude Code* is that case: Claude Code exists, in the web app and its own CLI, and does more, so a plain "why you might want this" and "what it doesn't have" answers a question the reader is genuinely asking.
- **A complex app.** A small, targeted package (`core-di`) needs no orienting; a larger application does. A scannable bottom-line is a fast way in, and it respects the reader's time when there is enough to take in that they need one.

Neither changes the voice: the "why" is a courtesy, the summary is a convenience, both stay in plain statement. `core-di` has neither an incumbent nor much surface, so it has neither section, and that is right too.

## When

When writing a README or package-level documentation that goes out under Stephen's name.
