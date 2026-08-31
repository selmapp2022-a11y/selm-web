/**
 * SPEECH IS NOT WRITING AT THE SAME BAND, AND THIS MEASURES BY HOW MUCH.
 *
 * Task 5.3, from the finding this project reported on 31 August and the ruling
 * that adopted it:
 *
 *   *"Every listening rejection was a passage judgement. None was an item
 *   defect. Spoken text does not fit an envelope built from written anchors of
 *   the same band."*
 *
 *   *"Build a listening envelope from the listening bank's own anchors. Turn
 *   length is the obvious divergence — **but derive the parameters rather than
 *   assuming which ones differ.**"*
 *
 * ── THE ASSUMPTION WAS WRONG, AND SO WAS THE FIRST CORRECTION ──────────────
 * On 31 August, on a bank of about 90 measurable passages, the measure that
 * separated the two registers at every band was LEXICAL VARIETY, and sentence
 * length looked systematic and then reversed at C2. Both of those were
 * asserted here.
 *
 * **On 31 August, later the same day, the bank had roughly tripled and both
 * assertions were false.** With 168 reading passages and 99 listening scripts
 * measurable:
 *
 *   sentence length   59% 63% 63% 77% 86%   below parity at EVERY band
 *   clause rate       95% 83% 68% 77% 92%   below parity at every band
 *   long-word rate    99% 77% 95% 79% 102%  mixed
 *   lexical variety  154% 72% 71% 69% 75%   ABOVE parity at A2
 *
 * The C2 reversal in sentence length was a sample of a dozen scripts. The A2
 * variety figure is four listening scripts of transactional dialogue — names,
 * times, places — and Guiraud's index reads a short script full of concrete
 * nouns as varied. Neither number was wrong when it was taken. Both were the
 * size of the sample, printed as if they were a fact about the language.
 *
 * ── SO WHAT IS ASSERTED HERE CHANGED ───────────────────────────────────────
 * This file's own note already said it: *"The measured divergence is PRINTED
 * rather than asserted. It is a property of two banks that are both still
 * growing; asserting today's ratio would be asserting the size of the
 * sample."* And then the file asserted today's ratio anyway, twice, and went
 * red the moment the bank grew.
 *
 * What is asserted now is the thing that does not move with the sample: that
 * the two registers separate at all, on at least one measure, at every band
 * they share — and that the widest such measure is wide enough to matter. WHICH
 * measure it is, is derived and printed, never named in an assertion. If that
 * separation ever disappears, this check goes red and it should: it would mean
 * the reason listening has its own anchors had gone with it.
 *
 * ── WHAT ACTUALLY FIXES IT ─────────────────────────────────────────────────
 * Not a correction factor. A correction factor is a second thing to keep true.
 * `runVeto` takes the anchors it is given, so the fix is that a listening
 * section's anchors are listening recordings — which is asserted below, per
 * section, so it cannot quietly stop being true.
 *
 * The measured divergence is PRINTED rather than asserted. It is a property of
 * two banks that are both still growing; asserting today's ratio would be
 * asserting the size of the sample.
 */
import { EXAMS } from '../../definitions';
import { profile } from './veto';
import type { ComprehensionSection } from '../../model/types';

let failed = 0;
const t = (name: string, got: unknown, want: unknown, note = '') => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? (note ? `   ${note}` : '') : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

console.log('\n1. Every section is measured against ITS OWN anchors\n');

// The defect this forbids: a listening recording judged against reading
// anchors. It cannot happen through `runVeto`, which takes the anchors it is
// handed — so what has to hold is that a section's anchor set is drawn from
// that section, and nothing else.
const sections: Array<{ examId: string; sec: ComprehensionSection }> = [];
for (const e of EXAMS)
  for (const s of e.sections)
    if (s.kind === 'comprehension') sections.push({ examId: e.id, sec: s as ComprehensionSection });

for (const { examId, sec } of sections) {
  const anchors = sec.recordings.filter((r) => r.role === 'anchor');
  const ids = new Set(sec.recordings.map((r) => r.id));
  t(`${examId} · ${sec.id}: every anchor is one of this section's own recordings`,
    anchors.filter((a) => !ids.has(a.id)).map((a) => a.id), []);
  t(`${examId} · ${sec.id}: the anchor set is small, not the bank`,
    anchors.length > 0 && anchors.length * 2 <= sec.recordings.length, true,
    `${anchors.length} anchors of ${sec.recordings.length}`);
}

console.log('\n2. How far speech sits from prose, measured\n');

const MEASURES = ['meanSentenceWords', 'longWordRate', 'clauseRate', 'lexicalVariety'] as const;
const median = (xs: number[]) => {
  const a = [...xs].sort((p, q) => p - q);
  return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};

type Row = { skill: string; level: string } & Record<typeof MEASURES[number], number>;
const rows: Row[] = [];
for (const e of EXAMS)
  for (const s of e.sections) {
    if (s.kind !== 'comprehension') continue;
    for (const r of (s as ComprehensionSection).recordings) {
      if ((r.script ?? '').split(/\s+/).filter(Boolean).length < 30) continue;
      const p = profile(r.script, e.locale);
      rows.push({ skill: s.skill, level: String(r.level), ...Object.fromEntries(MEASURES.map((m) => [m, p[m]])) } as Row);
    }
  }

const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
console.log('     band   n(read) n(hear)     sentence        long words        clauses        variety');
const diverge: Record<string, number[]> = Object.fromEntries(MEASURES.map((m) => [m, []]));
for (const b of BANDS) {
  const read = rows.filter((r) => r.skill === 'reading' && r.level === b);
  const hear = rows.filter((r) => r.skill === 'listening' && r.level === b);
  if (!read.length || !hear.length) continue;
  const cells = MEASURES.map((m) => {
    const ratio = median(hear.map((r) => r[m])) / median(read.map((r) => r[m]));
    diverge[m].push(ratio);
    return `${(ratio * 100).toFixed(0)}%`.padStart(15);
  });
  console.log(`     ${b}    ${String(read.length).padStart(6)}  ${String(hear.length).padStart(6)}${cells.join('')}`);
}
console.log('\n     (listening as a percentage of reading, at the same band)\n');

// What is asserted is the separation, not which measure carries it. Naming the
// measure is naming the sample — see the note at the top of this file.
const pct = (m: typeof MEASURES[number]) => diverge[m].map((r) => `${(r * 100).toFixed(0)}%`).join(' ');
const systematic = MEASURES.filter((m) =>
  diverge[m].length > 0 && (diverge[m].every((r) => r < 1) || diverge[m].every((r) => r > 1)));

t('the registers separate on at least one measure at EVERY band they share',
  systematic.length > 0, true, systematic.length ? systematic.join(', ') : 'none');

// The widest of them, by mean distance from parity. Printed, so the note above
// can be checked against the bank on any day, and so a reader can see which
// measure is currently doing the work.
const spread = (m: typeof MEASURES[number]) =>
  Math.abs(1 - diverge[m].reduce((a, b) => a + b, 0) / diverge[m].length);
const leader = [...systematic].sort((a, b) => spread(b) - spread(a))[0];
console.log(`     the widest systematic measure today is ${leader ?? '(none)'}`);
for (const m of MEASURES) console.log(`       ${m.padEnd(18)} ${pct(m)}${systematic.includes(m) ? '   systematic' : ''}`);
console.log('');

// And it has to be wide enough to be a register difference rather than noise.
// Ten percent at every shared band: below that, a listening envelope built
// from listening anchors is a distinction without a difference.
t('and the widest one is 10% or more from parity at every shared band',
  leader ? diverge[leader].every((r) => Math.abs(1 - r) >= 0.10) : false, true,
  leader ? pct(leader) : '');

console.log('\n3. So a listening bank is judged by listening anchors, and the effect is visible\n');

for (const { examId, sec } of sections) {
  if (sec.skill !== 'listening') continue;
  const anchors = sec.recordings.filter((r) => r.role === 'anchor');
  const measurable = anchors.filter((a) => (a.script ?? '').split(/\s+/).filter(Boolean).length >= 30);
  console.log(`     ${examId} · ${sec.id}: ${anchors.length} anchors, ${measurable.length} of them long enough to define an envelope`);
  t(`${examId} · ${sec.id}: at least two anchors can define an envelope`, measurable.length >= 2, true);
}

console.log(failed ? `\n${failed} FAILED\n` : '\nThe registers are measured, and each bank is judged by its own.\n');
if (failed) throw new Error(`${failed} register case(s) failed`);
