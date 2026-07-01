#!/usr/bin/env bash
# start-planner.sh — start a Planner session: claude-sdk-cli with the Planner
# identity preset (actor + role) supplied via --system.
#
# WHY A SHELL SCRIPT (not the old .mjs)
# The Planner's identity is composed as
#   <actor name='planner'>$(cat …/ACTOR.md)</actor> <role name='planner'>$(cat …/ROLE.md)</role>
# The former start-planner.mjs launched via spawnSync WITHOUT a shell, so the
# $(cat …) was passed to claude-sdk-cli as literal text and never expanded — the
# Planner ran with the command string as its "identity" instead of the file
# contents. A shell launch expands $(cat …) at run time, so the actor and role
# actually load. This is the root-session instance of the system-identity bug.
#
# WHAT IT IS
# A thin preset over claude-sdk-cli: --name planner, the composed --system, and a
# default model (Opus). Everything else is forwarded verbatim, so resume
# behaviour is the caller's to choose:
#   start-planner.sh                        # CLI default resume
#   start-planner.sh --no-resume            # force a brand-new conversation
#   start-planner.sh --resume <conv-id>     # rehydrate a Planner after a death
#   start-planner.sh --model claude-…       # override the default model
# A leading `--` separator is accepted and stripped:
#   start-planner.sh -- --resume <conv-id>
#
# NO TMUX MAGIC
# It creates no session/window/pane — that is the SC's. It only tags the pane it
# already runs in (@role/@title/@colour) so the status bar reads "Planner".
# Outside tmux it skips the tags and still launches.
#
# The session runs interactively in the current pane (exec, so stdio and exit
# status pass straight through). Exit 2 if a planner identity file is missing.
set -euo pipefail

actor="$HOME/.claude/actors/planner/ACTOR.md"
role="$HOME/.claude/roles/planner/ROLE.md"
for f in "$actor" "$role"; do
  if [[ ! -f "$f" ]]; then
    echo "start-planner: system file not found: $f" >&2
    exit 2
  fi
done

# The composition preset: the Planner's identity (actor + role) into --system.
# The XML mirrors shared buildSystem; the shell expands $(cat …) here, where the
# old node launch could not.
system="<actor name='planner'>$(cat "$actor")</actor> <role name='planner'>$(cat "$role")</role>"

# Tag the current pane so the status bar reads "Planner". Pane/window creation is
# the SC's; this only labels what already exists. Skipped cleanly outside tmux.
if [[ -n "${TMUX_PANE:-}" ]]; then
  tmux set-option -p -t "$TMUX_PANE" @role planner
  tmux set-option -w -t "$TMUX_PANE" @title Planner
  tmux set-option -w -t "$TMUX_PANE" @colour green
else
  echo "start-planner: not in tmux (TMUX_PANE unset); skipping @role/@title/@colour tags." >&2
fi

# Forward everything else verbatim to claude-sdk-cli. A leading `--` is dropped.
if [[ "${1:-}" == "--" ]]; then
  passthrough=("${@:2}")
else
  passthrough=("$@")
fi

# Presets first, then passthrough. The default model applies only when the caller
# hasn't supplied their own --model.
args=(--name planner --system "$system")
model_supplied=0
for a in ${passthrough[@]+"${passthrough[@]}"}; do
  [[ "$a" == "--model" ]] && model_supplied=1
done
if [[ "$model_supplied" -eq 0 ]]; then
  args+=(--model claude-opus-4-8)
fi
args+=(${passthrough[@]+"${passthrough[@]}"})

# Launch interactively in this pane; exec so the CLI's exit status is ours.
exec claude-sdk-cli "${args[@]}"
