#!/bin/sh

claude-sdk-cli --system "$(cat ~/.claude/actors/handler/ACTOR.md ~/.claude/roles/requirements-analyst/ROLE.md ~/.claude/roles/scribe/ROLE.md ~/.claude/roles/executor/ROLE.md ~/.claude/roles/router/ROLE.md)"
