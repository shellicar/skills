#!/usr/bin/env node
/**
 * Print the name of the process running in a tmux pane.
 *
 * Thin wrapper around paneProcessName() in pane.mjs.
 *
 * Usage:
 *   echo '{"paneId": "%901"}' | pane-process-name
 *
 * Stdout: process comm (e.g. claude-sdk-cli, zsh, -zsh).
 *
 * Exit codes:
 *   0  name printed
 *   1  pane gone or process unreadable
 *   2  bad usage
 */

import { readFileSync } from 'node:fs';
import { paneProcessName } from '../../../shared/pane.mjs';

const cfg = JSON.parse(readFileSync(0, 'utf8'));
const paneId = cfg.paneId;
if (!paneId) {
  console.error('Missing required field: paneId');
  process.exit(2);
}

const name = paneProcessName(paneId);
if (!name) {
  console.error(`pane ${paneId} not found or unreadable`);
  process.exit(1);
}

console.log(name);
