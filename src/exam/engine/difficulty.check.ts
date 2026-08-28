/**
 *   npx tsc src/exam/engine/difficulty.check.ts --outDir /tmp/df --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/df/exam/engine/difficulty.check.js
 *
 * Part 3 (replacement) §3, run: per task, from performance, never shown,
 * and never told they moved down.
 */
import { PLAN_KEY } from '../model/plan';
import { ATTESTATION_KEY } from '../model/attestationStore';
import * as difficulty from '../../lib/difficulty';
const { difficultyFor, recordAttempt } = difficulty;

const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, v); },
  removeItem: (k: string) => { mem.delete(k); },
};
(globalThis as any).window = { dispatchEvent() {}, addEventListener() {} };
(globalThis as any).CustomEvent = class { constructor(public type: string) {} };



mem.set(PLAN_KEY, JSON.stringify({ goalId: 'ee-french', examId: 'tcf-canada', examDate: null, examLocale: 'fr-CA' }));

console.log('NO ATTESTATION — unknown is not weak');
console.log('  tcf-ee-t3 starts at', difficultyFor('tcf-ee-t3', 'writing'), '(the middle, not A1)');

console.log('\nSEEDED FROM AN ATTESTATION, per skill, expanded to every task of that skill');
mem.set(ATTESTATION_KEY, JSON.stringify([{
  id: 'a1', examId: 'tcf-canada', kind: 'retrospective', entryMethod: 'typed', verification: 'no_qr_legacy_format',
  language: 'fr', sat: '2026-06', awarded: { listening: 420, reading: 460, writing: 9, speaking: 11 },
  benchmark: { system: 'NCLC', listening: 6, reading: 7, writing: 6, speaking: 7 },
  responseIds: [], provenance: 'volunteered', studiedSince: null, consentedAt: '', retainUntil: '',
}]));
for (const [task, skill] of [['tcf-ee-t1','writing'],['tcf-ee-t3','writing'],['tcf-eo-t1','speaking']] as const)
  console.log(`  ${task} (${skill}) ->`, difficultyFor(task, skill));
console.log('  writing NCLC 6 and speaking NCLC 7 seed differently, and every tâche of a skill starts level');

console.log('\nADAPTATION — up on CONSISTENT performance, down silently, one bad day is not a move');
const trace: string[] = [];
const step = (f: number) => { recordAttempt('tcf-ee-t3', 'writing', f); trace.push(`${(f*100).toFixed(0)}% -> ${difficultyFor('tcf-ee-t3','writing')}`); };
step(0.9); step(0.9); step(0.3); step(0.9); step(0.3); step(0.3);
for (const t of trace) console.log('   ', t);

console.log('\nNOTHING TO RENDER IT WITH');
console.log('  exports:', Object.keys(difficulty).join(', '));
console.log('  no label, no colour, no badge — the module returns a CEFR code for the');
console.log('  generation endpoints and nothing a page could put on screen.');
