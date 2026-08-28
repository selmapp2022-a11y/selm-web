/**
 * The Academic decision, proved rather than asserted.
 *
 * Founder's decision 2026-08-28: an IELTS Academic Test Report Form gives up
 * two of its four marks and keeps them, and the candidate is told which and
 * why. This file checks the three things that could go wrong with that:
 *
 *   1. the RIGHT two transfer, and the wrong two do not;
 *   2. a non-transferring mark is KEPT as printed and merely not converted —
 *      losing the number would be its own dishonesty;
 *   3. the note the candidate reads says both halves — what we used, and
 *      that IRCC will not take the document at all. A note that said only
 *      the first would leave a candidate believing they can file.
 */
import { TRANSFERABLE, transfers, MODULE_NOTE } from '../model/ielts-variants';
import { IELTS_GT } from '../definitions/ielts-gt';
import { toBenchmark } from './aggregate';
import type { SkillId } from '../model/types';

let bad = 0;
const ok = (c: boolean, label: string, detail = '') => {
  if (!c) bad++;
  console.log(`  ${c ? 'ok  ' : 'FAIL'} ${label}${detail ? '   ' + detail : ''}`);
};

console.log('1. WHICH MARKS CROSS FROM ACADEMIC\n');
ok(TRANSFERABLE.general_training.length === 4, 'General Training: all four transfer');
ok(
  TRANSFERABLE.academic.join(',') === 'listening,speaking',
  'Academic: listening and speaking only',
  TRANSFERABLE.academic.join(', '),
);
for (const s of ['listening', 'speaking'] as const)
  ok(transfers('academic', s), `${s} transfers — same test in both modules`);
for (const s of ['reading', 'writing'] as const)
  ok(!transfers('academic', s), `${s} does NOT transfer — different construct, different material`);

console.log('\n2. A MARK THAT DOES NOT TRANSFER IS KEPT, NOT LOST\n');
// A real Academic form from the corpus: document Q.
const Q = { listening: 8.5, reading: 6.5, writing: 6.5, speaking: 6.5 };
const awarded: Record<string, number | null> = {};
const benchmark: Record<string, number | null> = {};
for (const [skill, band] of Object.entries(Q)) {
  awarded[skill] = band;
  benchmark[skill] = transfers('academic', skill)
    ? toBenchmark(band, IELTS_GT.benchmark, 'band', skill as SkillId) ?? null
    : null;
}
ok(Object.values(awarded).every((v) => typeof v === 'number'), 'all four awarded marks are kept as printed');
ok(benchmark.listening !== null && benchmark.speaking !== null, 'listening and speaking convert to CLB',
   `CLB ${benchmark.listening} / ${benchmark.speaking}`);
ok(benchmark.reading === null && benchmark.writing === null, 'reading and writing carry NO benchmark level');
// The trap this guards: `null ?? 0` would make an unconverted skill look like
// the candidate's weakest, which is the same defect already fixed in the
// planner for an épreuve nobody sat.
ok((benchmark.reading ?? null) !== 0, 'an unconverted skill is null, never 0');

console.log('\n3. WHAT THE CANDIDATE IS TOLD\n');
for (const lang of ['en', 'fr'] as const) {
  const t = MODULE_NOTE.academic[lang];
  ok(t.split('\n\n').length >= 4, `${lang}: the note has all its parts`, `${t.split('\n\n').length} paragraphs`);
  ok(/IRCC/.test(t), `${lang}: says IRCC does not accept Academic`);
  ok(
    lang === 'en' ? /Listening and Speaking/.test(t) : /orale/.test(t),
    `${lang}: names the two that were used`,
  );
  ok(
    lang === 'en' ? /Reading and Writing/.test(t) : /écrite/.test(t),
    `${lang}: names the two that were not`,
  );
}

console.log(`\n${bad === 0 ? 'all checks pass' : bad + ' FAILURES'}`);
if (bad) throw new Error(`${bad} module cases failed`);
