#!/usr/bin/env node
// render-hierarchy.mjs — generate a live view of an ADO work-item hierarchy.
//
// WHY THIS EXISTS: work-item hierarchy, state, assignee and linked-PR status
// change constantly and are OWNED by the board. Storing a copy in state.md /
// README guarantees silent staleness. This script GENERATES the view on demand,
// so what you read is always the board's current truth, never a rotting mirror.
// Reconciliation instrument: run it, read it, act, discard it.
//
// Ownership lens (identity = signed-in az user): ours / others' (collision intel) / UNASSIGNED (the frontier).
//
// INPUT: JSON on stdin (same dialect as ado-rest.sh — one input idiom across the tool):
//   { "org": "...", "project": "...", "roots": [10213, 9884], "me": "Stephen Hellicar" }
//   org, project, roots: required. me: optional — defaults to the signed-in az user
//   (its email); pass it only to override. Matched against each item's AssignedTo email.
//   Nothing is hardcoded.
// AUTH: delegates to the azure-devops skill's ado-rest.sh (handles token/az login).

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ADO_REST = join(homedir(), '.claude/skills/azure-devops/scripts/ado-rest.sh');

const input = JSON.parse(readFileSync(0, 'utf8'));
const { org, project } = input;
const roots = (input.roots ?? []).map(Number);
if (!org || !project || roots.length === 0) {
  console.error('stdin JSON needs: org, project, roots[]. (me optional — defaults to the signed-in az user.)');
  console.error(`e.g.  echo '{"org":"eagersautomotive","project":"Uplift","roots":[10213]}' | node render-hierarchy.mjs`);
  process.exit(1);
}

// "me" identifies our work. Default to the signed-in az account's email so the
// caller need not pass it; override with input.me for a different identity.
function signedInEmail() {
  try {
    return execFileSync('az', ['account', 'show', '--query', 'user.name', '-o', 'tsv'], { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}
const meEmail = (input.me ?? signedInEmail())?.toLowerCase() ?? null;

// Call ado-rest.sh with a JSON request on stdin; return parsed JSON.
function ado(request) {
  const out = execFileSync(ADO_REST, [], { input: JSON.stringify(request), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out);
}

// Recursive hierarchy query: all descendants of a root, in one call.
function descendantsOf(rootId) {
  const query = `SELECT [System.Id] FROM workitemLinks WHERE ([Source].[System.Id] = ${rootId}) AND ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') MODE (Recursive)`;
  const res = ado({ org, project, method: 'POST', path: 'wit/wiql', params: { 'api-version': '7.1' }, headers: { 'Content-Type': 'application/json' }, body: { query } });
  return res.workItemRelations ?? [];
}

// Batch-fetch full fields + relations for a set of ids (max 200 per call).
function detailsOf(ids) {
  const byId = new Map();
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const res = ado({ org, method: 'POST', path: 'wit/workitemsbatch', params: { 'api-version': '7.1' }, headers: { 'Content-Type': 'application/json' }, body: { ids: chunk, $expand: 'Relations' } });
    for (const wi of res.value ?? []) byId.set(wi.id, wi);
  }
  return byId;
}

// PR references out of a work item's relations.
function prRefs(wi) {
  const prs = [];
  for (const r of wi.relations ?? []) {
    if (r.rel === 'ArtifactLink' && r.url.includes('/PullRequestId/')) prs.push(decodeURIComponent(r.url).split('/').pop());
  }
  return prs;
}

const assignedTo = (wi) => wi.fields?.['System.AssignedTo'] ?? null;
const isMine = (a) => meEmail && a?.uniqueName?.toLowerCase() === meEmail;

const buckets = { ours: 0, others: new Map(), unassigned: 0 };
function tally(wi) {
  const a = assignedTo(wi);
  if (!a) buckets.unassigned++;
  else if (isMine(a)) buckets.ours++;
  else buckets.others.set(a.displayName, (buckets.others.get(a.displayName) ?? 0) + 1);
}

function line(wi, depth) {
  const f = wi.fields ?? {};
  const a = assignedTo(wi);
  const owner = a ? (isMine(a) ? 'OURS' : a.displayName) : '⚠ UNASSIGNED';
  const prs = prRefs(wi);
  const prStr = prs.length ? `  PRs: ${prs.join(', ')}` : '';
  return `${'  '.repeat(depth)}${f['System.WorkItemType'] ?? '?'} #${wi.id} [${f['System.State'] ?? '?'}] — ${f['System.Title'] ?? '(no title)'}  ·  ${owner}${prStr}`;
}

// Query every root, MERGE into one graph, render once — so overlapping or nested
// roots collapse into a single tree instead of printing twice or at the wrong levels.
const children = new Map(); // source id -> [child ids]
const childSet = new Set();  // every id that appears as someone's child
const allIds = new Set(roots);
for (const rootId of roots) {
  for (const link of descendantsOf(rootId)) {
    const target = link.target?.id;
    if (target == null) continue;
    allIds.add(target);
    const source = link.source?.id;
    if (source == null || source === target) continue; // root self-entry / self-link
    allIds.add(source);
    if (!children.has(source)) children.set(source, []);
    if (!children.get(source).includes(target)) children.get(source).push(target);
    childSet.add(target);
  }
}
const details = detailsOf([...allIds]);

// Render only the topmost roots: a passed root that sits under another node in
// the merged graph renders in its place within that ancestor's tree. Dedup too.
const topRoots = [...new Set(roots)].filter((id) => !childSet.has(id));

console.log(`\n=== Hierarchy under ${topRoots.map((id) => '#' + id).join(', ')} (${org}/${project}) — generated ${new Date().toISOString()} ===\n`);
const seen = new Set();
const walk = (id, depth) => {
  const wi = details.get(id);
  if (!wi || seen.has(id)) return;
  seen.add(id);
  tally(wi);
  console.log(line(wi, depth));
  for (const c of children.get(id) ?? []) walk(c, depth + 1);
};
for (const id of topRoots) walk(id, 0);

console.log(`\n--- Ownership tally ---`);
if (meEmail) console.log(`  OURS (${meEmail}): ${buckets.ours}`);
for (const [who, n] of buckets.others) console.log(`  ${who}: ${n}`);
console.log(`  UNASSIGNED: ${buckets.unassigned}`);
console.log('');
