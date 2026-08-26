/**
 * A runnable check on the TCF Canada → NCLC table.
 *
 * The table it verifies is published by IRCC and by France Éducation
 * international, and three of its rows were wrong in this file until
 * 2026-08-26 — all three in the low half, where 6/20 was being reported as
 * NCLC 4 when the awarding body says NCLC 5. This file exists so that never
 * again depends on someone re-reading a comment.
 *
 *   npx tsc src/exam/engine/benchmark.check.ts --outDir /tmp/bc --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/bc/exam/engine/benchmark.check.js
 */
import { TCF_CANADA } from '../definitions/tcf-canada';
import { toBenchmark } from './aggregate';

/** Every published row, written out as (value, expected level). */
const EXPECT: Array<[string, number, number | null]> = [
  ['sur20', 20, 10], ['sur20', 16, 10],
  ['sur20', 15, 9], ['sur20', 14, 9],
  ['sur20', 13, 8], ['sur20', 12, 8],
  ['sur20', 11, 7], ['sur20', 10, 7],
  ['sur20', 9, 6], ['sur20', 8, 6], ['sur20', 7, 6],
  ['sur20', 6, 5],
  ['sur20', 5, 4], ['sur20', 4, 4],
  ['sur20', 3, null], ['sur20', 0, null],
  ['co699', 699, 10], ['co699', 549, 10], ['co699', 548, 9], ['co699', 523, 9],
  ['co699', 522, 8], ['co699', 503, 8], ['co699', 502, 7], ['co699', 458, 7],
  ['co699', 457, 6], ['co699', 398, 6], ['co699', 397, 5], ['co699', 369, 5],
  ['co699', 368, 4], ['co699', 331, 4], ['co699', 330, null],
  ['ce699', 699, 10], ['ce699', 549, 10], ['ce699', 548, 9], ['ce699', 524, 9],
  ['ce699', 523, 8], ['ce699', 499, 8], ['ce699', 498, 7], ['ce699', 453, 7],
  ['ce699', 452, 6], ['ce699', 406, 6], ['ce699', 405, 5], ['ce699', 375, 5],
  ['ce699', 374, 4], ['ce699', 342, 4], ['ce699', 341, null],
];

let bad = 0;
for (const [scaleId, value, want] of EXPECT) {
  const got = toBenchmark(value, TCF_CANADA.benchmark, scaleId);
  const ok = got === want;
  if (!ok) bad++;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'} ${scaleId} ${String(value).padStart(3)} -> NCLC ${String(got)}` +
      (ok ? '' : `   expected ${String(want)}`)
  );
}

// The two comprehension tables must not be the same table.
const co = TCF_CANADA.benchmark.byScale?.co699 ?? [];
const ce = TCF_CANADA.benchmark.byScale?.ce699 ?? [];
const shared = co.filter((b, i) => ce[i] && ce[i].from === b.from).length;
console.log(`\n  comprehension boundaries shared between the two scales: ${shared} of ${co.length} (expected 1 — the top)`);
if (shared !== 1) bad++;

// Every task's scale must have a band table that can produce a level.
for (const s of TCF_CANADA.sections) {
  if (s.kind !== 'production') {
    const has = !!TCF_CANADA.benchmark.byScale?.[s.scaleId];
    console.log(`  ${has ? 'ok  ' : 'FAIL'} ${s.id} scale=${s.scaleId} has a band table`);
    if (!has) bad++;
    continue;
  }
  for (const t of s.tasks) {
    const has = t.scaleId === 'sur20' || !!TCF_CANADA.benchmark.byScale?.[t.scaleId];
    console.log(`  ${has ? 'ok  ' : 'FAIL'} ${t.id} scale=${t.scaleId} has a band table`);
    if (!has) bad++;
  }
}

console.log(bad === 0 ? '\nAll rows match the published table.' : `\n${bad} FAILURES`);
if (bad !== 0) throw new Error(`${bad} benchmark rows do not match the published table`);
