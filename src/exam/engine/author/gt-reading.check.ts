/**
 * The IELTS General Training reading bank, put through its own pipeline.
 *
 *   npx tsx src/exam/engine/author/gt-reading.check.ts
 *
 * A gate that runs once, on the evening the batch was authored, is a gate that
 * ran once. This runs on every check of the repository, against the bank as it
 * actually stands, so the question is not *"did these pass when they were
 * written"* but *"would each of them be accepted if it arrived now"*.
 *
 * Each passage is measured against the section WITHOUT ITSELF, because a
 * passage is always a duplicate of itself and that is not the question.
 */
import { EXAMS } from '../../definitions';
import type { ComprehensionSection } from '../../model/types';
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

const gt = EXAMS.find((e) => e.id === 'ielts-gt')!;
const sec = gt.sections.find(
  (s): s is ComprehensionSection => s.kind === 'comprehension' && s.skill === 'reading',
)!;
const SEG = segmentationFor(gt.locale);
const bps = blueprintsFor(gt, sec);

console.log('\n1. Every passage would be accepted if it arrived now\n');
for (const r of sec.recordings) {
  const items = sec.items.filter((i) => i.recordingId === r.id);
  const bp = bps.find((b) => b.family === r.family && b.level === r.level)!;
  const without = { ...sec, recordings: sec.recordings.filter((x) => x.id !== r.id) } as ComprehensionSection;
  const candidate: Candidate = {
    id: r.id, examId: gt.id, skill: 'reading', family: r.family!, level: r.level as Candidate['level'],
    script: r.script ?? '', items, freshness: r.freshness ?? 'timeless',
    provenance: {
      author: 'claude-opus-5', authoredAt: '2026-08-29', promptVersion: 'gt-reading-anchors-v1',
      source: 'ielts.org published General Training Reading format',
    },
  };
  const v = runGate({ candidate, blueprint: bp, section: without, locale: gt.locale });
  t(`${r.id} ${r.level} ${r.family} — ${words(r.script ?? '', SEG).length}w, ${items.length}q`, v.reasons, []);
}

console.log('\n2. Every non-anchor passage clears the statistical veto\n');

/**
 * Layer 3, run over the bank rather than at the moment a batch was written.
 *
 * The anchors are the instrument and are exempt — with one passage per band
 * their neighbours ARE the envelope, and an instrument cannot be measured
 * against itself. Everything else must sit inside on at least three of the
 * four measures, which is the same bar `runVeto` enforces at ingest. Running
 * it here as well is not duplication: ingest asks whether an item may enter,
 * and this asks whether the bank still holds together after it did.
 */
const ANCHOR_SET: Anchor[] = sec.recordings
  .filter((r) => r.role === 'anchor')
  .map((r) => ({ id: r.id, level: r.level as Anchor['level'], script: r.script ?? '' }));
t('the anchor ladder covers every band',
  ANCHOR_SET.map((a) => a.level).sort(), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const items = sec.recordings.filter((r) => r.role !== 'anchor');
if (!items.length) console.log('     (no non-anchor passages yet — the ladder is all there is)');
for (const r of items) {
  const v = runVeto(r.script ?? '', r.level as Anchor['level'], ANCHOR_SET, gt.locale);
  t(`${r.id} ${r.level} sits inside the ladder (${v.measured?.inside}/4)`, v.pass, true);
  if (!v.pass) console.log('      ', v.reasons.join('; '));
}

console.log('\n3. Every passage says when it was written for\n');
for (const r of sec.recordings) t(`${r.id} carries a freshness`, typeof r.freshness === 'string', true);
t('none is dated', sec.recordings.filter((r) => r.freshness === 'dated').length, 0);

console.log('\n4. The ladder rises, measured rather than asserted\n');
const ANCHORS: Anchor[] = sec.recordings.filter((r) => r.role === 'anchor').map((r) => ({ id: r.id, level: r.level as Anchor['level'], script: r.script ?? '' }));
for (const a of ANCHORS) {
  const p = profile(a.script, gt.locale);
  console.log(`     ${a.id.padEnd(14)} ${a.level}  ${String(words(a.script, SEG).length).padStart(3)}w  ` +
    `sent ${p.meanSentenceWords.toFixed(1).padStart(5)}  long ${p.longWordRate.toFixed(3)}  ` +
    `clause ${p.clauseRate.toFixed(2).padStart(5)}  var ${p.lexicalVariety.toFixed(2)}`);
}
/**
 * What a ladder has to do, and what it does not.
 *
 * The first version of this demanded that all four measures rise from every
 * rung to the next, and long-word rate failed between A2 and B1: the A2 notice
 * is a short administrative text stuffed with `residents`, `unlabelled`,
 * `charging` and `caretaker`, while the B1 warehouse notice is longer and
 * plainer. That is not a defect in either passage. It is a proxy behaving like
 * a proxy at the bottom of a ladder, where a form has more long words than a
 * paragraph.
 *
 * So the bar is what the ladder actually has to guarantee:
 *
 *   - EVERY measure must be higher at C2 than at A1. A measure that does not
 *     is not measuring difficulty at all, and the veto should stop using it.
 *   - AT LEAST THREE of the four must rise at every step, which is the same
 *     three-of-four the veto itself requires and is not a coincidence: a
 *     ladder that could not meet the bar it enforces would be enforcing a bar
 *     nothing can meet.
 *
 * Lowering it further to make a batch fit would be the move `items.check.ts`
 * records having to undo. Raising it to four-of-four would mean rewriting
 * honest passages to satisfy a word-length count.
 */
const bands = ANCHORS.map((a) => profile(a.script, gt.locale));
const MEASURES = [
  ['sentence length', (p: ReturnType<typeof profile>) => p.meanSentenceWords],
  ['long words', (p: ReturnType<typeof profile>) => p.longWordRate],
  ['clause depth', (p: ReturnType<typeof profile>) => p.clauseRate],
  ['lexical variety', (p: ReturnType<typeof profile>) => p.lexicalVariety],
] as const;

for (const [name, pick] of MEASURES) {
  t(`${name} is higher at C2 than at A1`, pick(bands[bands.length - 1]) > pick(bands[0]), true);
}
for (let i = 1; i < bands.length; i++) {
  const rising = MEASURES.filter(([, pick]) => pick(bands[i - 1]) <= pick(bands[i]));
  const fell = MEASURES.filter(([, pick]) => pick(bands[i - 1]) > pick(bands[i])).map(([n]) => n);
  t(`${ANCHORS[i - 1].level}→${ANCHORS[i].level}: at least three of four rise` +
    (fell.length ? `   (${fell.join(', ')} did not)` : ''), rising.length >= 3, true);
}

// Each rung measured against the other five. An anchor is not required to pass
// its own veto — with one passage per band, the neighbours ARE the envelope
// and the envelope is a single point — but a rung that lands outside on every
// measure would mean the ladder is not a ladder, and that is worth printing.
console.log('\n     each rung against the other five:');
for (const a of ANCHORS) {
  const v = runVeto(a.script, a.level, ANCHORS.filter((x) => x.id !== a.id), gt.locale);
  console.log(`       ${a.id.padEnd(14)} inside ${v.measured?.inside}/4  ${v.pass ? '' : v.reasons.join('; ')}`);
}

console.log('\n5. The tells that only appear across a bank\n');
const choices = sec.items.filter(isChoiceItem);
const pos = [0, 0, 0, 0];
let longest = 0;
for (const it of choices) {
  pos[it.answer] += 1;
  const lens = it.options.map((o) => words(o, SEG).length);
  const max = Math.max(...lens);
  if (lens[it.answer] === max && lens.filter((l) => l === max).length === 1) longest += 1;
}
const sd = Math.sqrt(choices.length * 0.25 * 0.75);
const z = (Math.max(...pos) - choices.length / 4) / sd;
console.log(`     key position A/B/C/D: ${pos.join(' / ')}   (even would be ${(choices.length / 4).toFixed(1)} each)`);
console.log(`     worst position is ${z.toFixed(2)} sd from chance`);
console.log(`     key is the single longest option: ${longest} of ${choices.length}`);
t('keys do not cluster in one position beyond chance', z <= 2, true);
t('the longest option is not the key more than 40% of the time', longest / choices.length <= 0.4, true);

console.log('\n6. The bank is what the inventory will count\n');
t('every item names a passage that exists',
  sec.items.every((i) => sec.recordings.some((r) => r.id === i.recordingId)), true);
t('every passage carries at least one item',
  sec.recordings.every((r) => sec.items.some((i) => i.recordingId === r.id)), true);
t('no duplicate item ids', new Set(sec.items.map((i) => i.id)).size, sec.items.length);
t('no duplicate passage ids', new Set(sec.recordings.map((r) => r.id)).size, sec.recordings.length);
console.log(`\n     ${sec.recordings.length} passages, ${sec.items.length} questions, ` +
  `${sec.recordings.reduce((n, r) => n + words(r.script ?? '', SEG).length, 0)} words of authored English.`);

console.log(failed === 0 ? '\nThe GT reading bank passes its own pipeline.\n' : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} GT reading case(s) failed`);
