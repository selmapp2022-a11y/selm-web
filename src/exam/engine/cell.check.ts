/**
 * The cell, end to end. One command, no network, no cost.
 *
 *   npx tsc src/exam/engine/cell.check.ts --outDir /tmp/cc --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/cc/engine/cell.check.js
 *
 * What it proves, and what it cannot:
 *
 *   PROVES   the eight items survive the deterministic gate; the gate still
 *            refuses a single-document answer on each of them; the diagnostic
 *            tier separates an NCLC 6 response from an NCLC 7 response on the
 *            same item; the proxy veto holds the documents inside a B1 band;
 *            selection never repeats before the pool is exhausted; and how
 *            long serving takes.
 *
 *   CANNOT   exercise the anchor JUDGE. STEP 05 measured the model at 14 of
 *            14 correct pairwise orderings, and that is the layer that turns
 *            a proxy distance into a level. No key is bound in this
 *            environment, so what runs below is the proxy half only and it
 *            says so in its own output.
 */
import { TCF_CANADA } from '../definitions/tcf-canada';
import { ITEMS, type PracticeItem } from '../definitions/practice/tcf-ee-t3-nclc6.items';
import { THRESHOLDS, ITEM_PROXY_BOUNDS, FAILURE_MODE } from '../definitions/prescriptions/tcf-ee-t3-nclc6';
import { runGate } from './gate';
import { diagnoseJuxtaposition, comparisonMetrics } from './diagnose';
import { proxyMetrics, proxyVeto } from './proxy';
import { segmentationFor } from './text';
import { newServeState, serve } from './pool';
import type { TaskDefinition } from '../model/types';

function anchorTask(): TaskDefinition {
  for (const s of TCF_CANADA.sections) {
    const t = (s as any).tasks as TaskDefinition[] | undefined;
    const hit = t?.find((x) => x.id === 'tcf-ee-t3');
    if (hit) return hit;
  }
  throw new Error('tcf-ee-t3 not found');
}

/** An item is the anchor task with its prompt, topic and sources swapped. */
function taskFor(item: PracticeItem, anchor: TaskDefinition): TaskDefinition {
  const gate = (anchor.gate ?? []).map((g) =>
    g.id === 'source_coverage' ? ({ ...g, sources: item.sources } as any) : g,
  );
  return { ...anchor, id: item.id, prompt: item.prompt, topicKeywords: item.topicKeywords, gate } as TaskDefinition;
}

const A = anchorTask();
/** TCF Canada is fr-CA, so elision splits. See `text.ts`. */
const SEG = segmentationFor(TCF_CANADA.locale);
const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);
const num = (x: number, d = 2) => x.toFixed(d);

let itemFailures = 0;
const notes: string[] = [];
const rejections: Record<string, number> = {};
function reject(reason: string) {
  rejections[reason] = (rejections[reason] ?? 0) + 1;
  itemFailures += 1;
}

console.log('CELL — TCF Canada · expression écrite · tâche 3 · NCLC 6');
console.log('items: ' + ITEMS.length + '   failure mode: ' + FAILURE_MODE.id);
console.log('thresholds: ' + JSON.stringify(THRESHOLDS));
console.log('');

// ── layer 1 + 2, per item ───────────────────────────────────────────────
console.log('LAYER 1 (gate) and LAYER 2 (diagnosis)');
console.log(
  pad('item', 24) + pad('n7 gate', 9) + pad('n7 diag', 9) +
  pad('n6 gate', 9) + pad('n6 diag', 9) + pad('single', 22) + 'verdict',
);
for (const item of ITEMS) {
  const task = taskFor(item, A);
  const p = item.prompt.fr;

  const g7 = runGate(task, item.responses.nclc7, p, SEG);
  const g6 = runGate(task, item.responses.nclc6, p, SEG);
  const gs = runGate(task, item.responses.single, p, SEG);
  const d7 = diagnoseJuxtaposition(task, item.responses.nclc7, THRESHOLDS, SEG);
  const d6 = diagnoseJuxtaposition(task, item.responses.nclc6, THRESHOLDS, SEG);

  const problems: string[] = [];
  if (g7.zeroed) problems.push('n7 zeroed:' + g7.findings.filter(f => f.kind==='zero').map(f=>f.ruleId).join('/'));
  // An NCLC 6 response being zeroed is NOT an item defect and is not counted
  // as one. It is the finding this run produced: a candidate who summarises
  // instead of comparing also tends to lift a clause, so layer 1 refuses the
  // response before layer 2 can say why it was weak. Recorded as a note, and
  // the conclusion is that the diagnosis must run whatever the gate decided —
  // "you copied AND you did not compare" is more use than a zero.
  if (g6.zeroed) notes.push(item.id + ' — n6 also zeroed by ' + g6.findings.filter(f => f.kind==='zero').map(f=>f.ruleId).join('/'));
  if (!gs.zeroed) problems.push('single NOT refused');
  else if (!gs.findings.some((f) => f.ruleId === 'source_coverage' && f.kind === 'zero'))
    problems.push('single refused for the wrong reason:' + gs.findings.filter(f=>f.kind==='zero').map(f=>f.ruleId).join('/'));
  if (d7.fired) problems.push('n7 diagnosed as the failure');
  if (!d6.fired) problems.push('n6 NOT diagnosed');

  for (const pr of problems) reject(pr.split(':')[0]);

  const singleWhy = gs.findings.filter((f) => f.kind === 'zero').map((f) => f.ruleId).join(',') || 'PASSED';
  console.log(
    pad(item.id, 24) +
    pad(g7.zeroed ? 'ZERO' : 'pass', 9) + pad(d7.fired ? 'FIRED' : 'clear', 9) +
    pad(g6.zeroed ? 'zero*' : 'pass', 9) + pad(d6.fired ? 'fired' : 'MISSED', 9) +
    pad(singleWhy, 22) + (problems.length ? '✗ ' + problems.join(' | ') : '✓'),
  );
}

// ── the separation, in numbers ──────────────────────────────────────────
console.log('');
console.log('LAYER 2 — the three signals, NCLC 7 response vs NCLC 6 response');
console.log(pad('item', 24) + pad('bridge 7/6', 13) + pad('contrast 7/6', 15) + 'opinion anchors 7/6');
for (const item of ITEMS) {
  const task = taskFor(item, A);
  const m7 = comparisonMetrics(task, item.responses.nclc7, SEG);
  const m6 = comparisonMetrics(task, item.responses.nclc6, SEG);
  console.log(
    pad(item.id, 24) +
    pad(m7.bridgeSentences + ' / ' + m6.bridgeSentences, 13) +
    pad(m7.contrastMarkers + ' / ' + m6.contrastMarkers, 15) +
    m7.opinionAnchors + ' / ' + m6.opinionAnchors,
  );
}

// ── layer 3, on the item's own documents ────────────────────────────────
console.log('');
console.log('LAYER 3 (proxy veto) on the two source documents of each item');
console.log(pad('item', 24) + pad('mean sent', 11) + pad('max sent', 10) + pad('clause', 9) + pad('ttr', 8) + pad('long%', 8) + 'verdict');
for (const item of ITEMS) {
  const v = proxyVeto(item.prompt.fr, ITEM_PROXY_BOUNDS, SEG);
  if (!v.passed) reject('proxy veto');
  console.log(
    pad(item.id, 24) +
    pad(num(v.metrics.meanSentenceWords, 1), 11) +
    pad(String(v.metrics.maxSentenceWords), 10) +
    pad(num(v.metrics.clauseDepth), 9) +
    pad(num(v.metrics.typeTokenRatio), 8) +
    pad(num(v.metrics.longWordShare * 100, 1), 8) +
    (v.passed ? '✓' : '✗ ' + v.breaches.map((b) => b.metric + '=' + num(b.measured) + ' ∉ [' + b.bound.join(',') + ']').join('; ')),
  );
}

// ── anchor comparison, proxy half only ──────────────────────────────────
console.log('');
console.log('ANCHOR — distance from the shipped tâche 3, proxy half only (no judge bound)');
const am = proxyMetrics(A.prompt.fr, SEG);
console.log('anchor: mean ' + num(am.meanSentenceWords, 1) + '  clause ' + num(am.clauseDepth) + '  ttr ' + num(am.typeTokenRatio));
for (const item of ITEMS) {
  const m = proxyMetrics(item.prompt.fr, SEG);
  const d =
    Math.abs(m.meanSentenceWords - am.meanSentenceWords) / 20 +
    Math.abs(m.clauseDepth - am.clauseDepth) / 2 +
    Math.abs(m.typeTokenRatio - am.typeTokenRatio);
  console.log(pad(item.id, 24) + 'distance ' + num(d, 3));
}

// ── serving ─────────────────────────────────────────────────────────────
console.log('');
console.log('POOL — 40 consecutive draws, one candidate');
const st = newServeState();
const seq: string[] = [];
let recycles = 0;
const t0 = performance.now();
for (let i = 0; i < 40; i += 1) {
  const r = serve(ITEMS, st);
  if (r.recycled) recycles += 1;
  seq.push(r.item!.id);
}
const t1 = performance.now();
let repeatBeforeExhaustion = 0;
const firstCycle = seq.slice(0, ITEMS.length);
if (new Set(firstCycle).size !== ITEMS.length) repeatBeforeExhaustion = ITEMS.length - new Set(firstCycle).size;
console.log('draws 40   distinct in first cycle ' + new Set(firstCycle).size + '/' + ITEMS.length +
  '   repeats before exhaustion ' + repeatBeforeExhaustion + '   pool recycles ' + recycles);
console.log('total serve time ' + num(t1 - t0, 3) + ' ms   per draw ' + num((t1 - t0) / 40, 4) + ' ms');
if (repeatBeforeExhaustion > 0) reject('selection repeat');

// ── verdict ─────────────────────────────────────────────────────────────
console.log('');
console.log('NOTES (not item defects)');
if (notes.length === 0) console.log('  none');
for (const n of notes) console.log('  ' + n);
console.log('');
console.log('REJECTIONS');
const keys = Object.keys(rejections);
if (keys.length === 0) console.log('  none');
for (const k of keys) console.log('  ' + pad(k, 40) + rejections[k]);
console.log('');
console.log(itemFailures === 0
  ? 'CELL COMPLETE — 8/8 items pass all three layers and the pool test.'
  : 'CELL INCOMPLETE — ' + itemFailures + ' failures across ' + ITEMS.length + ' items.');
