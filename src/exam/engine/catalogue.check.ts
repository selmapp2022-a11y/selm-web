import { CATALOGUE, entriesFor, cellAt } from '../definitions/prescriptions';
console.log('catalogue entries: ' + CATALOGUE.length);
for (const e of CATALOGUE)
  console.log('  ' + [e.cell.at.examId, e.cell.at.taskId, 'NCLC ' + e.cell.at.level].join(' / ') +
    '  failure=' + e.cell.failureMode.id + '  practice items=' + e.cell.practiceItemIds.length);
console.log('entriesFor(tcf-canada, tcf-ee-t3): ' + entriesFor('tcf-canada','tcf-ee-t3').length);
console.log('entriesFor(tcf-canada, tcf-ee-t1): ' + entriesFor('tcf-canada','tcf-ee-t1').length);
console.log('entriesFor(tcf-canada, tcf-eo-t1): ' + entriesFor('tcf-canada','tcf-eo-t1').length);
console.log('entriesFor(ielts-gt, gt-w-t1):      ' + entriesFor('ielts-gt','gt-w-t1').length + '  <- IELTS has no cell at all: a visible gap, not a generic lesson');
console.log('cellAt(tcf-canada, tcf-ee-t3, 6): ' + (cellAt('tcf-canada','tcf-ee-t3',6) ? 'present' : 'none'));
console.log('cellAt(tcf-canada, tcf-ee-t3, 7): ' + (cellAt('tcf-canada','tcf-ee-t3',7) ? 'present' : 'none') + '  <- NCLC 6 is complete; the next level is the next question');

// ── WHAT MAY BE SERVED ────────────────────────────────────────────────────
//
// An exam whose scale has no known maximum cannot report a score, and a
// product that served it would be showing a candidate a number against a
// ceiling it invented. TEF Canada is in that state today — the awarding body
// and IRCC publish ceilings that cannot both be right — so it is defined in
// `definitions/tef-canada.ts` and kept out of `EXAMS`.
//
// This is the line that keeps it out. It is written as a rule about ALL
// exams rather than a mention of that one, so the next exam in the same state
// is caught without anyone remembering this happened.
import { EXAMS as SERVED, WITHHELD_EXAMS } from '../definitions';

let bad = 0;
const assert = (ok: boolean, name: string, note = '') => {
  if (!ok) bad += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${note ? `   ${note}` : ''}`);
};

console.log('\nWHAT MAY BE SERVED\n');
for (const e of SERVED) {
  const unknown = e.scales.filter((s) => s.max === null).map((s) => s.id);
  assert(unknown.length === 0,
    `${e.id}: every scale it is served on has a published maximum`,
    unknown.length ? `unknown: ${unknown.join(', ')}` : `${e.scales.length} scale(s)`);
}
for (const w of WITHHELD_EXAMS) {
  assert(!SERVED.some((e) => e.id === w.exam.id),
    `${w.exam.id}: withheld, and not in EXAMS`);
  assert(w.because.trim().length > 40,
    `${w.exam.id}: the reason it is withheld is written down, not implied`);
  assert(w.exam.sections.length === 0 || w.exam.scales.every((s) => s.max !== null),
    `${w.exam.id}: nothing has been authored against an unknown scale`,
    `${w.exam.sections.length} section(s)`);
}
console.log(bad ? `\n${bad} FAILED\n` : '\nOnly exams with a known scale are served.\n');
if (bad) throw new Error(`${bad} catalogue case(s) failed`);
