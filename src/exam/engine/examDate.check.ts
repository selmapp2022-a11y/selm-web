/**
 * The exam date the app stores must be one the app can read back.
 *
 *   npx tsx src/exam/engine/examDate.check.ts
 *
 * Found by using the deployed app on 29 August 2026: a browser date field
 * accepts years beyond four digits, so one extra keystroke produced
 * `202610-12-15`. It was stored. `daysUntil` returned null for it. Today then
 * said "No exam date set" while My exam still showed a date.
 *
 * The countdown is the one number on this product that is both certain and
 * the reason the candidate is here, and it disappeared without a word. A wrong
 * date is recoverable because the candidate can see it is wrong; a date the
 * app cannot read looks exactly like never having entered one.
 *
 * These cases are the contract `GoalPage.commitDate` enforces: anything
 * `daysUntil` cannot read is refused rather than saved.
 */
import { daysUntil } from '../model/plan';

const NOW = new Date(2026, 7, 29); // 29 August 2026, local

const CASES: Array<[string | null, number | null, string]> = [
  ['2026-10-15', 47, 'a normal future date'],
  ['2026-08-29', 0, 'today is zero, not null'],
  ['2026-08-01', -28, 'a past date is negative, not null'],
  [null, null, 'no date at all'],
  ['', null, 'an empty field'],
  // The defect. Every one of these is a value a date input can emit.
  ['202610-12-15', null, 'SIX-DIGIT YEAR — what the field actually produced'],
  ['20261-12-15', null, 'five-digit year'],
  ['226-12-15', null, 'three-digit year'],
  ["2026-13-15", null, "month 13 is refused, not rolled over into 2027"],
  ['2026/10/15', null, 'slashes instead of dashes'],
  ['15-10-2026', null, 'day first'],
  ['not a date', null, 'free text'],
];

let failed = 0;
console.log('\nThe exam date must be readable by the thing that reads it\n');
for (const [input, expected, why] of CASES) {
  const got = daysUntil(input as string | null, NOW);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${String(input).padEnd(14)} -> ${String(got).padStart(5)}   ${why}`);
}

// The point of the guard is not that daysUntil is total — it is that anything
// it cannot read is never stored. This is the case that matters most, spelled
// out on its own so a future reader sees the actual failure rather than a row
// in a table.
const SIX_DIGIT = '202610-12-15';
if (daysUntil(SIX_DIGIT, NOW) !== null) {
  console.log('\n  FAIL the six-digit year is readable again — the guard in GoalPage is now wrong');
  failed++;
} else {
  console.log(`\n  ok   "${SIX_DIGIT}" is unreadable, so GoalPage must refuse to store it`);
}

console.log(failed === 0 ? '\nAll exam-date cases pass.\n' : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} exam-date case(s) failed`);
