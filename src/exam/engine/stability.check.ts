/**
 * A runnable check on the stability reader — no judge, no network, no cost.
 *
 * The point of the reader is that a figure stops being quotable. This asserts
 * that it does, on the exact boundary, rather than trusting the comment.
 *
 *   npx tsc src/exam/engine/stability.check.ts --outDir /tmp/sc --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/sc/engine/stability.check.js
 */
import { readStability, ageInDays, DEFAULT_VALIDITY_DAYS } from './stability';
import type { StabilityRecord } from '../model/types';

const REC: StabilityRecord = {
  measuredAt: '2026-08-25',
  validForDays: 30,
  responses: 5,
  callsPerResponse: 10,
  scaleId: 'writing_assess_100',
  worstOverallSpread: 5,
  worstCriterionSpread: 11,
  note: { en: 'x', fr: 'x' },
};

const at = (iso: string) => new Date(iso + 'T12:00:00Z');
let bad = 0;
const check = (name: string, got: string, want: string) => {
  const ok = got === want;
  if (!ok) bad++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(52)} ${got}${ok ? '' : `   expected ${want}`}`);
};

check('same day', readStability(REC, at('2026-08-25')).kind, 'valid');
check('one day later', readStability(REC, at('2026-08-26')).kind, 'valid');
check('last valid day (30)', readStability(REC, at('2026-09-24')).kind, 'valid');
check('one day past the window (31)', readStability(REC, at('2026-09-25')).kind, 'stale');
check('a year later', readStability(REC, at('2027-08-25')).kind, 'stale');
check('no record at all', readStability(undefined, at('2026-08-25')).kind, 'never_measured');
check('unparseable date is never quotable', readStability({ ...REC, measuredAt: 'soon' }, at('2026-08-25')).kind, 'stale');

const dflt = { ...REC, validForDays: undefined };
check(`default window is ${DEFAULT_VALIDITY_DAYS} days — day 30`, readStability(dflt, at('2026-09-24')).kind, 'valid');
check(`default window is ${DEFAULT_VALIDITY_DAYS} days — day 31`, readStability(dflt, at('2026-09-25')).kind, 'stale');

check('age is whole days', String(ageInDays('2026-08-25', at('2026-08-27'))), '2');

// The measurement that mattered: 25 August's figure, read on the 27th, is
// still quotable — the window did not catch that change. That is the honest
// limit of this mechanism and the check states it rather than implying more.
const twoDaysLater = readStability(REC, at('2026-08-27'));
console.log(
  `\n  Note: the 25 August figure still reads as ${twoDaysLater.kind} on 27 August,` +
    '\n  the day the judge was observed behaving differently. A validity window' +
    '\n  bounds how long a stale number can be quoted. It cannot detect a change.' +
    '\n  Only re-running the measurement does that.'
);

console.log(bad === 0 ? '\nAll stability-reader cases pass.' : `\n${bad} FAILURES`);
if (bad !== 0) throw new Error(`${bad} stability-reader cases failed`);
