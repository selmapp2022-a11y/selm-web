/**
 * Every comprehension bank, put through its own pipeline, on every run.
 *
 *   npx tsx src/exam/engine/author/bank.check.ts
 *
 * A gate that runs once, on the evening a batch was authored, is a gate that
 * ran once. This runs against the banks as they actually stand, so the
 * question is not *"did these pass when they were written"* but **"would each
 * of them be accepted if it arrived now"**.
 *
 * It began as a check on the IELTS reading section alone and was generalised
 * the same night, when the TCF reading bank got an anchor ladder of its own. A
 * second copy of these assertions, drifting quietly from the first, is the
 * shape of measurement this codebase has already refused twice — once when the
 * inventory was made to call the planner's own `coordinatesFor`, and once when
 * the practice selector was made to call `pool.ts` rather than restate it.
 *
 * Each passage is measured against its section WITHOUT ITSELF, because a
 * passage is always a duplicate of itself and that is not the question.
 */
import { EXAMS } from '../../definitions';
import type { ComprehensionSection, ExamDefinition } from '../../model/types';
import { isChoiceItem } from '../../model/types';
import { segmentationFor, words } from '../text';
import { blueprintsFor } from './blueprint';
import { runGate } from './gate';
import { profile, runVeto, type Anchor } from './veto';
import type { Candidate } from './types';

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

function checkSection(exam: ExamDefinition, sec: ComprehensionSection) {
  const SEG = segmentationFor(exam.locale);
  const bps = blueprintsFor(exam, sec);
  const anchors: Anchor[] = sec.recordings
    .filter((r) => r.role === 'anchor')
    .map((r) => ({ id: r.id, level: r.level as Anchor['level'], script: r.script ?? '' }));

  console.log(`\n${'='.repeat(74)}\n  ${exam.id} · ${sec.skill} — ${sec.recordings.length} passages, ${sec.items.length} questions`);
  console.log('='.repeat(74));

  if (!anchors.length) {
    console.log('\n  No anchor ladder yet, so layer 3 cannot run here. The gate still does.');
  }

  console.log('\n1. Every passage would be accepted if it arrived now\n');
  for (const r of sec.recordings) {
    const items = sec.items.filter((i) => i.recordingId === r.id);
    const bp = bps.find((b) => b.family === r.family && b.level === r.level);
    if (!bp) { t(`${r.id}: has a blueprint`, false, true); continue; }
    const without = { ...sec, recordings: sec.recordings.filter((x) => x.id !== r.id) } as ComprehensionSection;
    const candidate: Candidate = {
      id: r.id, examId: exam.id, skill: sec.skill as 'reading', family: r.family!, level: r.level as Candidate['level'],
      script: r.script ?? '', items, freshness: r.freshness ?? 'timeless',
      provenance: {
        author: 'selm', authoredAt: '2026-08-30', promptVersion: 'bank',
        source: `${exam.id} published format`,
      },
    };
    const v = runGate({ candidate, blueprint: bp, section: without, locale: exam.locale });
    t(`${r.id} ${r.level} ${r.family} — ${words(r.script ?? '', SEG).length}w, ${items.length}q`, v.reasons, []);
  }

  if (anchors.length) {
    console.log('\n2. Every non-anchor passage clears the statistical veto\n');
    // EVERY BAND THE SECTION ACTUALLY REACHES, not every band that exists.
    // A rung is needed where there is something to measure; demanding one at
    // A1 for a bank whose easiest recording is B1 asks for an anchor with
    // nothing under it. IELTS listening spans B1 to C1 and is honest about
    // it; the reading bank spans all six and this line still requires all
    // six of it. The bands the section holds are printed either way, so a
    // bank that grows into a new band without an anchor is visible.
    const spanned = [...new Set(sec.recordings.map((r) => String(r.level)))].sort();
    t('the anchor ladder covers every band the bank reaches',
      [...new Set(anchors.map((a) => a.level))].sort(), spanned);
    let outside = 0;
    let skipped = 0;
    const measured = sec.recordings.filter((x) => x.role !== 'anchor');
    for (const r of measured) {
      const v = runVeto(r.script ?? '', r.level as Anchor['level'], anchors, exam.locale);
      if (v.skipped) { skipped += 1; continue; }
      if (!v.pass) { outside += 1; console.log(`     outside: ${r.id} ${r.level} — ${v.reasons.join('; ')}`); }
    }
    // A VACUITY GUARD, added 31 August. `outside === 0` is satisfied by there
    // being nothing to measure, and a bank with every passage marked as an
    // anchor — or every passage too short — would print this line green while
    // asserting nothing at all. The same shape as the case in
    // `author.check.ts` that went green when the bank grew: an assertion
    // satisfied by absence. So the count is asserted before the result is.
    t('there is something to measure at all', measured.length - skipped > 0, true);
    t(`all ${measured.length - skipped} measurable non-anchor passages sit inside the ladder`, outside, 0);
    if (skipped) console.log(`     ${skipped} were too short to measure and are recorded as unmeasured, not as passed`);

    /**
     * THE LADDER IS READ FROM BAND MEDIANS, not from one chosen passage.
     *
     * It was one passage per band for an evening, and the TCF bank showed why
     * that is too little instrument: the A1 rung was an eight-word consigne
     * whose long-word rate came out higher than the C2 rung's, so the ladder
     * appeared to fall. A median across every anchor at a band is not
     * disturbed by one short sign, and every passage that was in the reviewed
     * French bank before this task began is an anchor — a set frozen at that
     * snapshot, which is what keeps the instrument from absorbing what it
     * measures.
     *
     * Bands with nothing long enough to measure are skipped rather than
     * plotted, for the same reason.
     */
    console.log('\n   the ladder, from band medians, measured rather than asserted:');
    const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
    const median = (xs: number[]) => {
      const v = [...xs].sort((a, b) => a - b);
      return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
    };
    const bands: Array<ReturnType<typeof profile>> = [];
    const bandNames: string[] = [];
    for (const band of BANDS) {
      const at = anchors.filter((a) => a.level === band)
        .filter((a) => words(a.script, SEG).length >= 30)
        .map((a) => profile(a.script, exam.locale));
      if (!at.length) { console.log(`     ${band}  — nothing long enough to measure`); continue; }
      const p = {
        meanSentenceWords: median(at.map((x) => x.meanSentenceWords)),
        longWordRate: median(at.map((x) => x.longWordRate)),
        clauseRate: median(at.map((x) => x.clauseRate)),
        lexicalVariety: median(at.map((x) => x.lexicalVariety)),
      };
      bands.push(p); bandNames.push(band);
      console.log(`     ${band}  n=${String(at.length).padStart(2)}   ` +
        `sent ${p.meanSentenceWords.toFixed(1).padStart(5)}  long ${p.longWordRate.toFixed(3)}  ` +
        `clause ${p.clauseRate.toFixed(2).padStart(5)}  var ${p.lexicalVariety.toFixed(2)}`);
    }
    const MEASURES = [
      ['sentence length', (p: ReturnType<typeof profile>) => p.meanSentenceWords],
      ['long words', (p: ReturnType<typeof profile>) => p.longWordRate],
      ['clause depth', (p: ReturnType<typeof profile>) => p.clauseRate],
      ['lexical variety', (p: ReturnType<typeof profile>) => p.lexicalVariety],
    ] as const;
    /**
     * THREE OF FOUR, END TO END — not four of four, and French is why.
     *
     * `longWordRate` does not rise across the TCF ladder. Its A2 documents are
     * administrative French, which is nominal and long-worded — *réservation*,
     * *obligatoire*, *renseignements* — while its C2 argumentative prose is
     * built from short common words in difficult arrangements. The measure is
     * reading the register, not the difficulty.
     *
     * That is a fact about the language, and demanding all four would either
     * fail an honest bank or invite the bank to be rewritten to satisfy a
     * word-length count. The veto already tolerates one measure being out on
     * any single passage; the instrument gets the same tolerance, and the
     * measure that fails is named on every run rather than dropped.
     */
    const rose = MEASURES.filter(([, pick]) => pick(bands[bands.length - 1]) > pick(bands[0]));
    const flat = MEASURES.filter(([, pick]) => pick(bands[bands.length - 1]) <= pick(bands[0])).map(([n]) => n);
    t(`at least three of four measures rise across the ladder` +
      (flat.length ? `   (${flat.join(', ')} did not)` : ''), rose.length >= 3, true);
    /**
     * Adjacent bands are NOT required to separate on three of four measures,
     * and the TCF bank is why.
     *
     * Its B2 and C1 medians sit within a word of each other on sentence
     * length, and C2 is shorter-sentenced than both. That is not a defect in
     * the bank: French argumentative prose at C1 and C2 is distinguished by
     * what the sentences DO — irony, concession, the reported-versus-asserted
     * distinction the `argumentatif` family exists to test — and none of the
     * four measures here can see any of that.
     *
     * What the ladder must guarantee is the thing the veto actually relies on:
     * that the measures RISE ACROSS IT overall, so an envelope built from two
     * neighbouring bands means something. Demanding step-by-step separation
     * would be asserting that four arithmetic proxies capture the difference
     * between C1 and C2, which they do not, and the honest place to say so is
     * here rather than in a threshold quietly set low enough to pass.
     */
    const ends = MEASURES.filter(([, pick]) => pick(bands[bands.length - 1]) > pick(bands[0])).length;
    console.log(`     ${ends} of 4 measures rise from ${bandNames[0]} to ${bandNames[bandNames.length - 1]}` +
      `; adjacent bands are not required to separate — see the note in this file`);
  }

  console.log('\n3. The tells that only appear across a bank\n');
  const choices = sec.items.filter(isChoiceItem);
  const pos = [0, 0, 0, 0];
  let longest = 0;
  for (const it of choices) {
    pos[it.answer] += 1;
    const lens = it.options.map((o) => words(o, SEG).length);
    const max = Math.max(...lens);
    if (lens[it.answer] === max && lens.filter((l) => l === max).length === 1) longest += 1;
  }
  // EXPECTED PER POSITION, NOT ONE QUARTER EACH.
  //
  // A three-option question can never key D. IELTS Part 3 asks three-option
  // questions and Part 2 asks four-option ones, so a bank holding both has a
  // genuinely uneven expectation — D is reachable by only some of the items —
  // and a flat quarter would report a skew that is arithmetic rather than
  // authoring. Found on 31 August, when fourteen three-option items entered
  // the listening bank and the flat model called the result 3.4 sigma.
  //
  // Each item contributes 1/n to each of its own n positions, which is the
  // expectation under a candidate guessing at random within each question.
  const expected = [0, 0, 0, 0];
  for (const it of choices) for (let k = 0; k < it.options.length; k++) expected[k] += 1 / it.options.length;
  let z = 0;
  for (let k = 0; k < 4; k++) {
    const e = expected[k];
    if (e <= 0) continue;
    const sd = Math.sqrt(e * (1 - e / Math.max(1, choices.length)));
    z = Math.max(z, (pos[k] - e) / (sd || 1));
  }
  console.log(`     key position A/B/C/D: ${pos.join(' / ')}   (expected ${expected.map((e) => e.toFixed(1)).join(' / ')})`);
  console.log(`     worst position is ${z.toFixed(2)} sd from its own expectation; the longest option is the key ${longest} of ${choices.length}`);
  // A TWENTY-ITEM FLOOR ON THE POSITION TEST, and it is not a let-off.
  //
  // IELTS listening holds seven multiple-choice items among its forty
  // questions, the rest being completion and matching, which have no position
  // at all. With seven items, three keys in one place is 1.7 standard
  // deviations from chance and four is 2.2 — so the test would fire or not
  // fire on the difference of a single item, and would be reporting the size
  // of the sample rather than a property of the bank.
  //
  // Below twenty the counts are printed and not asserted, which is the honest
  // form: `items.check.ts` learned the same lesson from the other side when a
  // flat 40% bar let a real 2.4-sigma skew through.
  if (choices.length >= 20) t('keys do not cluster in one position beyond chance', z <= 2, true);
  else console.log(`     (${choices.length} choice items is too few to test the position for skew)`);
  t('the longest option is not the key more than 40% of the time', choices.length ? longest / choices.length <= 0.4 : true, true);

  console.log('\n4. The bank is what the inventory will count\n');
  t('every item names a passage that exists',
    sec.items.every((i) => sec.recordings.some((r) => r.id === i.recordingId)), true);
  t('every passage carries at least one item',
    sec.recordings.every((r) => sec.items.some((i) => i.recordingId === r.id)), true);
  t('no duplicate item ids', new Set(sec.items.map((i) => i.id)).size, sec.items.length);
  t('every passage says when it was written for, or is older than the field',
    sec.recordings.filter((r) => r.freshness === 'dated').length, 0);
}

for (const exam of EXAMS)
  for (const sec of exam.sections)
    if (sec.kind === 'comprehension') checkSection(exam, sec as ComprehensionSection);

console.log(failed === 0 ? '\nEvery comprehension bank passes its own pipeline.\n' : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} bank case(s) failed`);
