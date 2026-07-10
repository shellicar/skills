---
name: tmux
description: |
  WHAT: The tmux how-to for Claude — you are not the active pane, so orient from $TMUX_PANE and give every command a resolved id target.
  WHY: Claude was trained on human guides, and no human guide ever says to pin $TMUX_PANE — for a human, wherever they execute IS the active pane. For Claude it never is: focus is wherever the SC is looking, so every untargeted command acts on the wrong pane.
  WHEN: TRIGGER before any tmux command, in any role.
user-invocable: false
metadata:
  category: standards
---

# tmux

## Why your training misleads you here

Every tmux guide you learned from was written for a human at a keyboard. For that human, the pane they type into *is* the active pane — so guides freely use `tmux capture-pane -p`, `tmux send-keys ...`, no target, and it works. That assumption is false for you, always: your commands execute in one pane (`$TMUX_PANE`), while the *active* pane — what untargeted commands act on — is wherever the SC's focus happens to be. The human default is your failure mode. An untargeted command is not "my pane"; it is "whatever the SC is looking at right now."

So the discipline no guide taught you: **pin `$TMUX_PANE` first, and give every command a `-t` with an id resolved from it.**

## Orient: who and where am I

```sh
echo $TMUX_PANE                       # your own pane id, e.g. %42 — the one given fact
tmux display-message -p -t "$TMUX_PANE" '#{session_name} #{window_id} #{pane_id}'
```

That yields your session, window, and pane. Every target you use afterwards is resolved from here.

## Resolve: what else is in my window / session

`-t "$TMUX_PANE"` scopes list commands to *your* window or session, wherever focus is:

```sh
# panes in YOUR window, with what runs in each:
tmux list-panes -t "$TMUX_PANE" -F '#{pane_id} #{pane_current_command} #{pane_title}'

# windows in YOUR session:
tmux list-windows -t "$TMUX_PANE" -F '#{window_id} #{window_name}'
```

Pick the target from that output by its **id** (`%pane`, `@window`, `$session`) — ids are unique across the whole server. Never target by index (`-t 1` — indexes shift when panes close) and never by a name you assumed (names collide).

## Act: always with the resolved id

```sh
tmux capture-pane -p -t %57 -S -500       # read a pane you resolved
```

Writing into a pane — `send-keys`, buffers, kill — is not done ad hoc, ever. The sanctioned writes live in scripts (the `dispatch` skill's cast scripts, `close-role`) and in the roles whose job is driving a pane (`drive-post-mortem`); outside those, you read. An id you resolved is a licence to look, not to type.

- **Bad:** `tmux capture-pane -p -S -500` — untargeted; captures the SC's focused pane.
- **Bad:** `tmux capture-pane -p -t 1 ...` — pane index 1 *of the currently focused window*.
- **Good:** `echo $TMUX_PANE` → `tmux list-panes -t "$TMUX_PANE" -F '#{pane_id} #{pane_current_command}'` → `tmux capture-pane -p -t %57 ...` — every hop resolved, no step assumed.

## Telling the SC where something is

Ids are for commands, not for people. `%57` and `@20` mean nothing to the SC; what he can act on is the session, the window and pane **index**, and any names or titles you know. So when you name a location in a response, translate the id at that moment:

```sh
tmux display-message -p -t %57 '#{session_name}:#{window_index}.#{pane_index} #{window_name} #{@title}'
```

And say it in his terms: "the supervisor pane — `claude-cli:0.2` in the launch-preload window", not "pane %57". Resolve it fresh each time you say it — indexes drift, which is exactly why you never *command* by them; the SC's eyes are the one place indexes are the right currency.

## The boundary

Your window is your workspace. Every other window and session belongs to another cast or to the SC: reading one needs a resolved id and a reason; writing into one — `send-keys`, `kill-pane`, layout changes — is not yours to do.

## From outside tmux

No `$TMUX_PANE` in the environment means you are not inside a session: name the server explicitly (`tmux -L shellicar ...`) and read only. If you are outside and think you need to write, stop and ask the SC.
