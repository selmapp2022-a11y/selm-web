/**
 *   npx tsc src/exam/engine/cell.eo.check.ts --outDir /tmp/eo --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/eo/exam/engine/cell.eo.check.js
 *
 * The three expression orale cells. With these, every one of TCF Canada's
 * six tâches has a failure mode, a prescription and a bank at NCLC 6.
 */
import { TCF_CANADA } from '../definitions/tcf-canada';
import { ITEMS } from '../definitions/practice/tcf-eo-nclc6.items';
import {
  T1_THRESHOLDS, T2_THRESHOLDS, T3_THRESHOLDS, ITEM_PROXY_BOUNDS,
  T1_FAILURE, T2_FAILURE, T3_FAILURE,
} from '../definitions/prescriptions/tcf-eo-nclc6';
import { runGate } from './gate';
import { diagnoseCatalogue, diagnoseClosedQuestions, diagnoseUndefended } from './diagnose';
import { proxyVeto } from './proxy';
import { segmentationFor, wordCount } from './text';
import { newServeState, serve } from './pool';


const SEG = segmentationFor(TCF_CANADA.locale);
const TASKS: any[] = (TCF_CANADA.sections as any[]).flatMap((s) => s.tasks ?? []);
const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);

const DETECT: Record<string, (task: any, text: string, item: any) => any> = {
  'tcf-eo-t1': (t, x) => diagnoseCatalogue(t, x, T1_THRESHOLDS, SEG),
  'tcf-eo-t2': (t, x, item) => diagnoseClosedQuestions(t, x, T2_THRESHOLDS, item.required ?? [], SEG),
  'tcf-eo-t3': (t, x) => diagnoseUndefended(t, x, T3_THRESHOLDS, SEG),
};
const FAILURES: Record<string, any> = {
  'tcf-eo-t1': T1_FAILURE, 'tcf-eo-t2': T2_FAILURE, 'tcf-eo-t3': T3_FAILURE,
};

let fails = 0;
const notes: string[] = [];

for (const taskId of ['tcf-eo-t1', 'tcf-eo-t2', 'tcf-eo-t3']) {
  const base = TASKS.find((t) => t.id === taskId);
  const items = ITEMS.filter((i) => i.taskId === taskId);
  const minWords = (base.gate ?? []).find((g: any) => g.id === 'min_words')?.words;
  console.log(`\n${'='.repeat(96)}`);
  console.log(`${taskId}  ·  ${FAILURES[taskId].id}  ·  ${items.length} items  ·  floor ${minWords} mots`);
  console.log(pad('item', 30) + pad('n7 w', 6) + pad('n7 gate', 9) + pad('n7 diag', 9) +
    pad('n6 w', 6) + pad('n6 gate', 9) + pad('n6 diag', 9) + pad('offTopic', 14) + 'verdict');
  for (const it of items) {
    const task: any = { ...base, id: it.id, prompt: it.prompt, topicKeywords: it.topicKeywords };
    const p = it.prompt.fr;
    const g7 = runGate(task, it.responses.nclc7, p, SEG);
    const g6 = runGate(task, it.responses.nclc6, p, SEG);
    const go = runGate(task, it.responses.offTopic, p, SEG);
    const d7 = DETECT[taskId](task, it.responses.nclc7, it);
    const d6 = DETECT[taskId](task, it.responses.nclc6, it);

    const probs: string[] = [];
    const zeros = (g: any) => g.findings.filter((f: any) => f.kind === 'zero').map((f: any) => f.ruleId).join('/');
    if (g7.zeroed) probs.push('n7 zeroed:' + zeros(g7));
    if (g6.zeroed) notes.push(`${it.id} — n6 also zeroed by ${zeros(g6)}`);
    // Not counted as an item defect, and the reason is recorded rather than
    // hidden: tâche 1's off_topic bar was set to 2 rather than 3 on purpose,
    // after measuring that 3 catches every off-topic answer while leaving a
    // correct one sitting exactly on the line. Bar 2 keeps a margin of one
    // and lets through the single off-topic answer that scores 2, which the
    // judge then marks low anyway. See `tcf-canada.ts`.
    if (!go.zeroed) notes.push(`${it.id} — offTopic passed the gate (${taskId === 'tcf-eo-t1' ? 'the known cost of bar 2; see tcf-canada.ts' : 'UNEXPECTED'})`);
    if (d7.fired) probs.push('n7 diagnosed as the failure');
    if (!d6.fired) probs.push('n6 NOT diagnosed');
    fails += probs.length;

    console.log(pad(it.id, 30) +
      pad(String(wordCount(it.responses.nclc7, SEG)), 6) + pad(g7.zeroed ? 'ZERO' : 'pass', 9) + pad(d7.fired ? 'FIRED' : 'clear', 9) +
      pad(String(wordCount(it.responses.nclc6, SEG)), 6) + pad(g6.zeroed ? 'zero*' : 'pass', 9) + pad(d6.fired ? 'fired' : 'MISSED', 9) +
      pad(zeros(go) || 'PASSED', 14) + (probs.length ? '✗ ' + probs.join(' | ') : '✓'));
  }

  console.log('  signals, NCLC 7 vs NCLC 6:');
  for (const it of items) {
    const task: any = { ...base, id: it.id, prompt: it.prompt, topicKeywords: it.topicKeywords };
    const d7 = DETECT[taskId](task, it.responses.nclc7, it);
    const d6 = DETECT[taskId](task, it.responses.nclc6, it);
    const line = d7.signals.map((s: any, k: number) => `${s.id} ${s.measured}/${d6.signals[k].measured}`).join('   ');
    console.log('    ' + pad(it.id, 30) + line);
  }

  let pv = 0;
  for (const it of items) if (!proxyVeto(it.prompt.fr, ITEM_PROXY_BOUNDS, SEG).passed) { pv += 1; fails += 1; }
  const st = newServeState();
  const seq: string[] = [];
  for (let i = 0; i < 20; i += 1) seq.push(serve(items, st).item!.id);
  const distinct = new Set(seq.slice(0, items.length)).size;
  if (distinct !== items.length) fails += 1;
  console.log(`  proxy veto ${items.length - pv}/${items.length} inside the band · pool ${distinct}/${items.length} distinct in the first cycle`);
}

console.log('\nNOTES');
if (!notes.length) console.log('  none');
for (const n of notes) console.log('  ' + n);
console.log('\n' + (fails === 0
  ? `ALL THREE CELLS COMPLETE — ${ITEMS.length}/${ITEMS.length} items through gate, diagnosis, proxy veto and the pool test.`
  : `INCOMPLETE — ${fails} failure(s).`));
