/**
 * The model, checked against a real Test Report Form.
 *
 *   npx tsc src/exam/engine/trf.check.ts --outDir /tmp/trf --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/trf/exam/engine/trf.check.js
 *
 * **Four numbers, a month, and the exam. Nothing else from the document is
 * here, and there is nowhere in `Attestation` to put anything else** — no
 * name, no date of birth, no candidate number, no centre, no photograph.
 * That is the promise `attestation.ts` makes, and this file is the first
 * time it has been kept against a real document rather than asserted.
 *
 * The form itself printed the CEFR level and the overall band, so both are
 * used here as an independent check on our own conversion rather than
 * stored.
 */
import { IELTS_GT } from '../definitions/ielts-gt';
import { toBenchmark } from './aggregate';
import type { SkillId } from '../model/types';

const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);

// Read off a real IELTS General Training TRF, sat October 2021.
const AWARDED: Array<[SkillId, number]> = [
  ['listening', 5.0],
  ['reading', 4.5],
  ['writing', 6.0],
  ['speaking', 6.5],
];
const PRINTED_OVERALL = 5.5;
const PRINTED_CEFR = 'B2';

// IRCC, "Language test equivalency charts", IELTS (General Training).
const IRCC: Record<SkillId, number> = { listening: 5, reading: 5, writing: 7, speaking: 8 };

// What the table in `ielts-gt.ts` produced before 2026-08-28: one set of
// bands for every skill, and no CLB 6 or 8 anywhere in it.
const OLD = [
  { from: 8, level: 10 }, { from: 7, level: 9 }, { from: 6, level: 7 },
  { from: 5, level: 5 }, { from: 4, level: 4 },
];
const oldConvert = (v: number) => {
  for (const b of [...OLD].sort((a, b) => b.from - a.from)) if (v >= b.from) return b.level;
  return null;
};

console.log('A REAL IELTS GENERAL TRAINING TEST REPORT FORM');
console.log('four numbers and a month. Nothing else was taken, and there is nowhere to put it.\n');
console.log(pad('skill', 12) + pad('band', 7) + pad('IRCC CLB', 10) + pad('ours now', 10) + pad('ours before', 12) + 'was');
let nowOk = 0, oldOk = 0;
for (const [skill, band] of AWARDED) {
  const now = toBenchmark(band, IELTS_GT.benchmark, 'band', skill);
  const before = oldConvert(band);
  if (now === IRCC[skill]) nowOk += 1;
  if (before === IRCC[skill]) oldOk += 1;
  console.log(pad(skill, 12) + pad(band.toFixed(1), 7) + pad(String(IRCC[skill]), 10) +
    pad(String(now) + (now === IRCC[skill] ? ' ✓' : ' ✗'), 10) +
    pad(String(before) + (before === IRCC[skill] ? ' ✓' : ' ✗'), 12) +
    (before === IRCC[skill] ? '' : 'WRONG'));
}
console.log(`\n  correct now: ${nowOk}/4   ·   correct before: ${oldOk}/4`);

console.log('\nWHAT THE OLD TABLE COULD NOT SAY AT ALL');
const reachableOld = new Set<number>();
const reachableNew = new Set<number>();
for (let v = 0; v <= 9; v += 0.5) {
  const o = oldConvert(v); if (o !== null) reachableOld.add(o);
  for (const [skill] of AWARDED) {
    const n = toBenchmark(v, IELTS_GT.benchmark, 'band', skill);
    if (n !== null) reachableNew.add(n);
  }
}
console.log('  CLB levels the old table could emit: ' + [...reachableOld].sort((a, b) => a - b).join(', '));
console.log('  CLB levels reachable now           : ' + [...reachableNew].sort((a, b) => a - b).join(', '));
console.log('  CLB 8 is the level that carries the CRS points. It was unreachable.');

console.log('\nHALF BANDS');
const scale = IELTS_GT.scales.find((s) => s.id === 'band')!;
console.log(`  scale step ${scale.step}, decimals ${scale.display.decimals}`);
const shown = (v: number) => v.toFixed(scale.display.decimals);
for (const [, band] of AWARDED) if (band % 1 !== 0)
  console.log(`  a candidate entering ${band} now sees ${shown(band)}  (before: ${band.toFixed(0)} — a whole band above what they were awarded)`);

console.log('\nOUR OWN CONVERSION AGAINST WHAT THE FORM PRINTED');
const mean = AWARDED.reduce((a, [, b]) => a + b, 0) / 4;
const overall = Math.round(mean * 2) / 2;
console.log(`  mean of the four bands ${mean.toFixed(2)} → rounded to the nearest half ${overall.toFixed(1)}   form printed ${PRINTED_OVERALL.toFixed(1)}   ${overall === PRINTED_OVERALL ? '✓' : '✗'}`);
console.log(`  the form also printed CEFR ${PRINTED_CEFR}, which we neither store nor derive — recorded here only as the document's own word`);

console.log('\nVERIFICATION ROUTE, §2.4');
console.log('  the form says: "can be verified online by recognising organisations".');
console.log('  SELM is not a recognising organisation, so `verification` is `not_available`');
console.log('  for IELTS — which the model already said, and which is now confirmed');
console.log('  against a real document rather than assumed.');
