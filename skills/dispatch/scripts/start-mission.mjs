#!/usr/bin/env node
/**
 * Start a mission — give the Handler's window its mission identity:
 * @title and @colour, the window-level options the SC's tmux status bar
 * reads.
 *
 * Called once at the start of a mission, after the Handler pane exists but
 * before any operator or supervisor cast is dispatched.
 *
 * Idempotent: re-running with the same values is a visual no-op; with
 * different values it changes the displayed identity.
 *
 * Usage:
 *   start-mission < config.json
 *
 * Stdin (JSON):
 *   {
 *     "title": "easyquote-cves",
 *     "colour": "blue"
 *   }
 *
 * Env:
 *   TMUX_PANE — required (the Handler's pane id).
 *
 * Exit codes:
 *   0  identity set
 *   2  TMUX_PANE missing, or bad config
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pm = process.env.TMUX_PANE;
if (!pm) {
  console.error('TMUX_PANE not set; this script must run inside a tmux pane.');
  process.exit(2);
}

const cfg = JSON.parse(readFileSync(0, 'utf8'));
for (const k of ['title', 'colour']) {
  if (!cfg[k]) {
    console.error(`config missing required field: ${k}`);
    process.exit(2);
  }
}

execFileSync('tmux', [
  'set-option', '-w', '-t', pm, '@title', cfg.title,
  ';',
  'set-option', '-w', '-t', pm, '@colour', cfg.colour,
]);

console.log(`mission started: @title=${cfg.title} @colour=${cfg.colour} on window of ${pm}`);
