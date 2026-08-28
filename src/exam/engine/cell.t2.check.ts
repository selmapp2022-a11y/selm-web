/**
 *   npx tsc src/exam/engine/cell.t2.check.ts --outDir /tmp/c1 --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/c1/exam/engine/cell.t2.check.js
 */
import { TCF_CANADA } from '../definitions/tcf-canada';
import { ITEMS } from '../definitions/practice/tcf-ee-t2-nclc6.items';
import { THRESHOLDS, ITEM_PROXY_BOUNDS, FAILURE_MODE } from '../definitions/prescriptions/tcf-ee-t2-nclc6';
import { runGate } from './gate';
import { diagnoseNoPivot } from './diagnose';
import { proxyVeto } from './proxy';
import { segmentationFor, wordCount } from './text';
import { newServeState, serve } from './pool';
import type { TaskDefinition } from '../model/types';

const A: TaskDefinition = (TCF_CANADA.sections as any[])
  .flatMap((s) => s.tasks ?? [])
  .find((t: any) => t.id === 'tcf-ee-t2');
const SEG = segmentationFor(TCF_CANADA.locale);
const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);


function taskFor(item: (typeof ITEMS)[number]): TaskDefinition {
  return { ...A, id: item.id, prompt: item.prompt as any, topicKeywords: item.topicKeywords };
}

let fails = 0;
const notes: string[] = [];
console.log('CELL — TCF Canada · expression écrite · tâche 2 · NCLC 6');
console.log('items: ' + ITEMS.length + '   failure mode: ' + FAILURE_MODE.id);
console.log('thresholds: ' + JSON.stringify(THRESHOLDS) + '   band 120-150 mots\n');

console.log(pad('item', 26) + pad('n7 w', 6) + pad('n7 gate', 9) + pad('n7 diag', 9) +
  pad('n6 w', 6) + pad('n6 gate', 9) + pad('n6 diag', 9) + pad('offTopic', 18) + 'verdict');
for (const it of ITEMS) {
  const task = taskFor(it);
  const p = it.prompt.fr;
  const g7 = runGate(task, it.responses.nclc7, p, SEG);
  const g6 = runGate(task, it.responses.nclc6, p, SEG);
  const go = runGate(task, it.responses.offTopic, p, SEG);
  const d7 = diagnoseNoPivot(task, it.responses.nclc7, THRESHOLDS, SEG);
  const d6 = diagnoseNoPivot(task, it.responses.nclc6, THRESHOLDS, SEG);

  const probs: string[] = [];
  if (g7.zeroed) probs.push('n7 zeroed:' + g7.findings.filter((f) => f.kind === 'zero').map((f) => f.ruleId).join('/'));
  if (g6.zeroed) notes.push(`${it.id} — n6 also zeroed by ` + g6.findings.filter((f) => f.kind === 'zero').map((f) => f.ruleId).join('/'));
  if (!go.zeroed) probs.push('offTopic NOT refused');
  else if (!go.findings.some((f) => f.ruleId === 'off_topic' && f.kind === 'zero'))
    probs.push('offTopic refused for the wrong reason:' + go.findings.filter((f) => f.kind === 'zero').map((f) => f.ruleId).join('/'));
  if (d7.fired) probs.push('n7 diagnosed as the failure');
  if (!d6.fired) probs.push('n6 NOT diagnosed');
  fails += probs.length;

  console.log(
    pad(it.id, 26) +
    pad(String(wordCount(it.responses.nclc7, SEG)), 6) + pad(g7.zeroed ? 'ZERO' : 'pass', 9) + pad(d7.fired ? 'FIRED' : 'clear', 9) +
    pad(String(wordCount(it.responses.nclc6, SEG)), 6) + pad(g6.zeroed ? 'zero*' : 'pass', 9) + pad(d6.fired ? 'fired' : 'MISSED', 9) +
    pad(go.findings.filter((f) => f.kind === 'zero').map((f) => f.ruleId).join(',') || 'PASSED', 18) +
    (probs.length ? '✗ ' + probs.join(' | ') : '✓'));
}

console.log('\nTHE THREE SIGNALS, NCLC 7 vs NCLC 6');
console.log(pad('item', 26) + pad('sequence 7/6', 15) + pad('pivot 7/6', 12) + 'before/after 7/6');
for (const it of ITEMS) {
  const task = taskFor(it);
  const d7 = diagnoseNoPivot(task, it.responses.nclc7, THRESHOLDS, SEG);
  const d6 = diagnoseNoPivot(task, it.responses.nclc6, THRESHOLDS, SEG);
  const g = (d: typeof d7, id: string) => d.signals.find((s) => s.id === id)!.measured;
  console.log(pad(it.id, 26) +
    pad(`${g(d7, 'sequence')} / ${g(d6, 'sequence')}`, 15) +
    pad(`${g(d7, 'pivot')} / ${g(d6, 'pivot')}`, 12) +
    `${g(d7, 'before_after')} / ${g(d6, 'before_after')}`);
}

console.log('\nPROXY VETO on each item’s own prompt');
let pv = 0;
for (const it of ITEMS) {
  const v = proxyVeto(it.prompt.fr, ITEM_PROXY_BOUNDS, SEG);
  if (!v.passed) { pv += 1; fails += 1; console.log('  ✗ ' + it.id + ': ' + v.breaches.map((b) => `${b.metric}=${b.measured.toFixed(2)}`).join('; ')); }
}
console.log(`  ${ITEMS.length - pv}/${ITEMS.length} inside the B1 band`);

const st = newServeState();
const seq: string[] = [];
const t0 = performance.now();
for (let i = 0; i < 40; i += 1) seq.push(serve(ITEMS, st).item!.id);
const t1 = performance.now();
const first = seq.slice(0, ITEMS.length);
console.log(`\nPOOL — 40 draws, ${new Set(first).size}/${ITEMS.length} distinct in the first cycle, ${((t1 - t0) / 40).toFixed(4)} ms per draw`);
if (new Set(first).size !== ITEMS.length) fails += 1;

console.log('\nNOTES');
if (!notes.length) console.log('  none');
for (const n of notes) console.log('  ' + n);
console.log('\n' + (fails === 0
  ? `CELL COMPLETE — ${ITEMS.length}/${ITEMS.length} items pass all three layers and the pool test.`
  : `CELL INCOMPLETE — ${fails} failure(s).`));
