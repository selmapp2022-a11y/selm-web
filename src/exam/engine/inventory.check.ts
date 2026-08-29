/**
 * The inventory's own invariants.
 *
 *   npx tsx src/exam/engine/inventory.check.ts
 *
 * This does NOT assert that the bank is full. A thin coordinate is a finding
 * for the report to name, not a build failure — the whole purpose of the
 * inventory is to say what is missing, and a check that refused to run while
 * anything was missing would delete its own subject.
 *
 * What it asserts is that the MEASUREMENT is sound: every section declares
 * what the real exam sets and where that figure came from, no count exceeds
 * the count it is a subset of, and the report can be produced at all.
 */
import { EXAMS } from '../definitions';
import { inventory, report } from './inventory';

let bad = 0;
const ok = (cond: boolean, label: string, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${label}${detail ? '   ' + detail : ''}`);
};

console.log('\n1. Every section says what the real exam sets, and where that came from\n');
for (const e of EXAMS) {
  for (const s of e.sections) {
    const sets = (s as { sets?: { questions?: number; tasks?: number; source?: string } }).sets;
    ok(!!sets, `${e.id} · ${s.id}: declares what the exam sets`);
    ok(!!sets?.source && sets.source.length > 20,
       `${e.id} · ${s.id}: names its source`, sets?.source?.slice(0, 60) ?? '');
    ok(typeof (sets?.questions ?? sets?.tasks) === 'number',
       `${e.id} · ${s.id}: the figure is a number`);
  }
}

console.log('\n2. No subset is larger than the set it is drawn from\n');
const rows = inventory();
for (const r of rows) {
  ok(r.reachableItems <= r.existsItems,
     `${r.exam} · ${r.skill}: reachable ≤ exists`, `${r.reachableItems} ≤ ${r.existsItems}`);
  ok(r.servableItems <= r.reachableItems,
     `${r.exam} · ${r.skill}: servable ≤ reachable`, `${r.servableItems} ≤ ${r.reachableItems}`);
  ok(r.freeExamItems <= r.existsItems,
     `${r.exam} · ${r.skill}: the free exam cannot serve more than exists`);
}

console.log('\n3. Every coordinate the planner can emit is either counted or named\n');
for (const r of rows) {
  const named = r.emptyCoordinates.length + r.thinCoordinates.length;
  ok(r.coordinates >= named, `${r.exam} · ${r.skill}: named ≤ total coordinates`, `${named} of ${r.coordinates}`);
  ok(r.coordinates - r.coordinatesWithAnything === r.emptyCoordinates.length,
     `${r.exam} · ${r.skill}: every empty coordinate is NAMED, not just counted`,
     `${r.emptyCoordinates.length}`);
}

console.log('\n4. The report can actually be produced\n');
const text = report(() => 0);
ok(text.includes('THE THREE SPLITS'), 'the three splits are reported');
ok(text.includes('HOURS OF NON-REPEATING WORK'), 'the plain answer is reported');
ok(text.length > 2000, 'the report is not empty', `${text.length} chars`);

console.log(bad === 0 ? '\nAll inventory cases pass.\n' : `\n${bad} FAILED\n`);
if (bad) throw new Error(`${bad} inventory case(s) failed`);
