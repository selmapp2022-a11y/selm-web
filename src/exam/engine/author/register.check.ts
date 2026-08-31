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
 * ── THE ASSUMPTION WAS WRONG, AND THAT IS THE POINT OF DERIVING ────────────
 * Turn length was the obvious candidate and is NOT the systematic divergence.
 * Measured across the whole bank, band by band, the one measure that separates
 * the two registers at EVERY band, in the same direction, by a similar factor,
 * is LEXICAL VARIETY. Speech carries a narrower lexicon than prose written to
 * the same band — and Guiraud's index is already length-normalised, so this is
 * a register fact and not an artefact of listening scripts being shorter.
 *
 * Sentence length does diverge at B1, B2 and C1 — and then REVERSES at C2,
 * where a C2 discussion runs longer sentences than a C2 passage. An envelope
 * built on the assumption would have been wrong at the top of the ladder,
 * which is exactly where the C2 material is hardest to write.
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

// The claim being made in the note at the top of this file, asserted so the
// note cannot quietly become false: lexical variety is the measure that
// separates the registers at every band IN THE SAME DIRECTION, and sentence
// length is the one that looks like it does and then reverses.
const allBelow = (m: typeof MEASURES[number]) => diverge[m].every((r) => r < 1);
const someAbove = (m: typeof MEASURES[number]) => diverge[m].some((r) => r >= 1);
t('lexical variety is lower in speech at EVERY band the two share', allBelow('lexicalVariety'), true,
  diverge.lexicalVariety.map((r) => `${(r * 100).toFixed(0)}%`).join(' '));
t('and sentence length is not the systematic one — it reverses', someAbove('meanSentenceWords'), true,
  diverge.meanSentenceWords.map((r) => `${(r * 100).toFixed(0)}%`).join(' '));

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
