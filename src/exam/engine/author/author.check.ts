/**
 * The pipeline must reject. That is the only thing worth proving about it.
 *
 *   npx tsx src/exam/engine/author/author.check.ts
 *
 * A check that fed the gate good items and watched them pass would pass just
 * as happily with every rule deleted — the same trap `completion.check.ts`
 * was written against. So almost every case below is a MUTATION: one known
 * defect introduced into one otherwise sound candidate, and the rule that must
 * catch it named. Delete a rule and a case here goes red.
 *
 * §5 runs the other way and is the more interesting half. It asked whether
 * the six passages already in the reading bank pass the gate that will judge
 * their successors — and they do not: every one is shorter than the floor.
 *
 * That was worth an hour. **The floors were wrong first**, invented by eye,
 * and were rewritten from the published format. The bank still fails them, and
 * now that is the correct answer rather than a broken test: the six passages
 * run from 16 to 45 words where a GT paper runs to thousands. They are
 * placeholders, which the Task 3 inventory said in its own words — *6
 * questions against a published 40* — and a floor that accommodated them would
 * have written the placeholder into the specification.
 *
 * So §5 asserts what is actually load-bearing: the gate finds **nothing but
 * thinness** in the reviewed bank. Length and question count are the build's
 * subject. A lifted key, a near-duplicate option, a missing rationale, a
 * conspicuous length tell — any of those in material a person has already read
 * would mean the gate and the reviewer disagree, and that is a red line.
 */
import { EXAMS } from '../../definitions';
import type { ComprehensionSection, ComprehensionItem } from '../../model/types';
import { blueprintsFor, thinnestFirst } from './blueprint';
import { runGate } from './gate';
import { profile, runVeto, type Anchor } from './veto';
import { ingest, summarise } from './ingest';
import type { AnchorVerdict, Candidate } from './types';

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};
/** True when some reason starts with `rule`. */
const caught = (reasons: string[], rule: string) => reasons.some((r) => r.includes(rule));

const gt = EXAMS.find((e) => e.id === 'ielts-gt')!;
const reading = gt.sections.find(
  (s): s is ComprehensionSection => s.kind === 'comprehension' && s.skill === 'reading',
)!;
const bp = blueprintsFor(gt, reading).find((b) => b.family === 'informative' && b.level === 'B2')!;

const ANCHORS: Anchor[] = reading.recordings.map((r) => ({ id: r.id, level: r.level as Anchor['level'], script: r.script ?? '' }));

const choice = (over: Partial<ComprehensionItem> = {}): ComprehensionItem => ({
  id: 'x-1', recordingId: 'x', level: 'B2',
  stem: 'What does the scheme require of tenants?',
  options: [
    'Sorting waste into three separate containers each week',
    'Paying an additional monthly charge to the council',
    'Applying in writing before the end of the trial',
    'Attending an information session at the town hall',
  ],
  answer: 0,
  rationale: 'The passage states the three-container requirement; the other options name things it mentions without requiring.',
  ...over,
} as ComprehensionItem);

const SCRIPT = [
  'The council has extended its kerbside collection trial for a further year, and has published the figures behind the decision.',
  'Households in the trial area sort waste into three containers, which are emptied on alternating weeks rather than every week, and the change was introduced with a leaflet and a single reminder card.',
  'Officers report that contamination — the term used when the wrong material is put in a container — has fallen by about a third since the opening months.',
  'They add two qualifications. The first is that the improvement has slowed markedly since the spring, and the second is that the households who sorted carefully at the start are largely the households sorting carefully now, which suggests the leaflet persuaded rather fewer people than the headline figure implies.',
  'A residents\' association has asked for the alternating collection to be reviewed, arguing that families with small children cannot store a fortnight of waste.',
  'The council replies that the containers were sized for exactly that case, and that the trial will run its second year before any change is considered.',
  'Officers acknowledge, however, that no measurement of household storage was taken before the trial began, so the two positions cannot at present be settled with evidence.',
].join(' ');

const good = (over: Partial<Candidate> = {}): Candidate => ({
  id: 'x', examId: 'ielts-gt', skill: 'reading', family: 'informative', level: 'B2',
  script: SCRIPT,
  items: [choice(), choice({ id: 'x-2', stem: 'What do the officers add about the improvement?', answer: 2, options: [
    'Contamination has stopped falling altogether in the trial area',
    'Every household in the area has changed its behaviour',
    'The rate of improvement has slowed',
    'The trial will not be extended for another year',
  ], rationale: 'They report a slowing, not a stop, and attribute most of the gain to households already careful.' }),
  choice({ id: 'x-3', stem: 'Why does the residents\' association object?', answer: 3, options: [
    'It believes the containers were never delivered to every household',
    'It wants the trial abandoned before its second year begins',
    'It disputes the figure the officers published for contamination',
    'It says some families cannot store two weeks of waste',
  ], rationale: 'The objection is about storage over a fortnight, not about the figures, the delivery or the trial itself.' }),
  choice({ id: 'x-4', stem: 'What do the officers concede?', answer: 1, options: [
    'That the leaflet reached only a minority of the households',
    'That nothing was measured before the trial started',
    'That the second year of the trial has already been cancelled',
    'That the containers are too small for the households using them',
  ], rationale: 'They accept that no baseline for household storage exists, which is why neither side can settle the point.' })],
  freshness: 'current',
  provenance: { author: 'claude-opus-5', authoredAt: '2026-08-29', promptVersion: 'gt-reading-v1', source: 'ielts.org published GT Reading specification' },
  ...over,
});

const gate = (c: Candidate) => runGate({ candidate: c, blueprint: bp, section: reading, locale: gt.locale });

console.log('\n1. A sound candidate passes, and that is the least interesting case\n');
const base = gate(good());
t('the sound candidate passes', base.pass, true);
if (!base.pass) console.log('     ', base.reasons.join('; '));

console.log('\n2. One defect at a time, and the rule that must catch it\n');
const cases: Array<[string, Candidate, string]> = [
  ['a passage below the band\'s floor', good({ script: 'Bins are collected weekly.' }), 'passage.too-short'],
  ['a passage over the band\'s ceiling', good({ script: (SCRIPT + ' ').repeat(3) }), 'passage.too-long'],
  ['a band that is not the coordinate\'s', good({ level: 'C1' }), 'passage.wrong-band'],
  ['a family that is not the coordinate\'s', good({ family: 'argued' }), 'passage.wrong-family'],
  ['the author admitting the framing is dated', good({ freshness: 'dated' }), 'passage.dated'],
  ['news, which ages and takes a position', good({ script: SCRIPT.replace('The council', 'After the election the president') }), 'passage.news'],
  ['a passage already in the bank', good({ script: reading.recordings[2].script! }), 'passage.duplicate-of'],
  ['too few questions', good({ items: [choice()] }), 'items.too-few'],
  ['two questions sharing an id', good({ items: [choice(), choice()] }), 'items.duplicate-id'],
  ['a stem that is not a question', good({ items: [choice({ stem: 'Tenants must sort waste' }), choice({ id: 'x-2' })] }), 'item.stem-not-a-question'],
  ['no rationale', good({ items: [choice({ rationale: '' }), choice({ id: 'x-2' })] }), 'item.no-rationale'],
  ['a key that is conspicuously the longest option', good({ items: [choice({ options: [
    'Sorting every kind of household waste into three separate containers which are emptied on alternating weeks throughout the year',
    'Paying a charge', 'Applying in writing', 'Attending a session',
  ] }), choice({ id: 'x-2' })] }), 'options.key-is-conspicuously-longest'],
  ['a key lifted out of the passage', good({ items: [choice({ options: [
    'Households in the trial area sort waste into three containers',
    'Paying an additional monthly charge to the council',
    'Applying in writing before the end of the trial',
    'Attending an information session at the town hall',
  ] }), choice({ id: 'x-2' })] }), 'options.key-lifted-from-passage'],
  ['two options that mean the same thing', good({ items: [choice({ options: [
    'Sorting waste into three separate containers each week',
    'Each week, sorting waste into three separate containers',
    'Applying in writing before the end of the trial',
    'Attending an information session at the town hall',
  ] }), choice({ id: 'x-2' })] }), 'options.near-duplicate'],
  ['an answer index outside the options', good({ items: [choice({ answer: 9 }), choice({ id: 'x-2' })] }), 'options.answer-out-of-range'],
  ['no author in the provenance', good({ provenance: { author: '', authoredAt: '2026-08-29', promptVersion: 'v1', source: 'spec' } }), 'provenance.no-author'],
  ['a source that is a real exam paper', good({ provenance: { author: 'x', authoredAt: '2026-08-29', promptVersion: 'v1', source: 'reconstructed from a real exam paper' } }), 'provenance.source-is-a-real-paper'],
];
for (const [name, cand, rule] of cases) {
  const v = gate(cand);
  t(`${name} → ${rule}`, v.pass === false && caught(v.reasons, rule), true);
  if (v.pass || !caught(v.reasons, rule)) console.log('      reasons:', v.reasons.join('; ') || '(none)');
}

console.log('\n3. The veto measures the band, and the anchors do not move\n');

// A LADDER BUILT FOR THE PURPOSE, and the reason it is not the shipped bank
// is the finding printed at the end of this section: six passages of 16 to 45
// words are not an instrument. They are what this build exists to replace.
const LADDER: Anchor[] = [
  { id: 'a1', level: 'A1', script: 'The shop is open. It sells bread and milk. It is near the park. It shuts at six.' },
  { id: 'a2', level: 'A2', script: 'Our shop opens at eight every morning and closes at six. We sell bread, milk and fruit. On Sunday we open later, at ten, because the delivery arrives early and the staff need time to put it out.' },
  { id: 'b1', level: 'B1', script: 'The shop has changed its opening hours because the delivery now arrives in the afternoon rather than the morning. Customers who came early for bread found the shelves empty, and several complained. The owner decided to open an hour later and stay open an hour longer, which she believes suits most people, although a few regular customers have said they preferred the old arrangement.' },
  { id: 'b2', level: 'B2', script: 'When the delivery schedule changed, the shop faced a choice that looked simple and was not. Opening later meant the shelves were full when customers arrived, which reduced complaints; but it also meant losing the trade of people who bought on their way to work, and that trade, though small each morning, was steady. The owner tried both arrangements for a month each, and found that the later opening earned more overall, while the earlier one earned more reliably.' },
  { id: 'c1', level: 'C1', script: 'What the proprietor discovered, and what the trade publications rarely acknowledge, is that an independent establishment of this description is not optimising a solitary quantity but reconciling two measurements that move antagonistically. Postponed opening elevated the average receipts, because the displays were replenished before the busiest interval commenced; earlier opening suppressed the variability, because the commuters appeared irrespective of the weather and irrespective of whatever the displays contained. Choosing between these alternatives consequently depended considerably less on arithmetic than on whether the proprietor could tolerate an occasional disappointing week in exchange for a demonstrably stronger month, which is fundamentally a question concerning her overdraft facility rather than concerning her customers.' },
  { id: 'c2', level: 'C2', script: 'One might conceivably commend the representative association for belatedly promulgating guidance concerning delivery scheduling, were it not that the guidance presupposes, throughout and without acknowledgement, an establishment sufficiently capacious to accommodate a complete day of inventory — which is to say, precisely the establishment that never encountered the predicament. The diminutive trader, for whom the question is authentically intractable, will discover therein a succession of recommendations presupposing the very resource whose unavailability constitutes the difficulty; and will conclude, not unreasonably, that the recommendations originated with commentators who have perused literature about shopkeeping rather than practised it.' },
];

const flat = 'The shop is open. It sells bread. It sells milk. The shop is near the park. It shuts at six.';
const vFlat = runVeto(flat, 'C1', LADDER, gt.locale);
t('a flat passage claiming C1 is vetoed', vFlat.pass, false);
t('and the veto names the measures that put it outside', vFlat.reasons.length > 0, true);

// The ladder's own C1 rung, measured against B2 and C2 — the instrument
// agreeing with itself, which is the least it must do.
t('a genuinely C1-shaped passage passes at C1',
  runVeto(LADDER[4].script, 'C1', LADDER.filter((a) => a.id !== 'c1'), gt.locale).pass, true);

// And the same passage claiming to be A2 is refused. A veto that only caught
// passages that were too easy would let every overreaching item through.
t('the same passage claiming A2 is vetoed',
  runVeto(LADDER[4].script, 'A2', LADDER.filter((a) => a.id !== 'c1'), gt.locale).pass, false);

t('no anchors either side is a refusal, not a pass',
  runVeto(SCRIPT, 'B2', [], gt.locale).pass, false);
t('and it says so rather than inventing a reason',
  caught(runVeto(SCRIPT, 'B2', [], gt.locale).reasons, 'unmeasurable'), true);

// WHAT THE SHIPPED ANCHORS ACTUALLY ARE, printed rather than asserted.
// The veto is only as good as what it measures against, and saying so is
// cheaper than discovering it after a hundred items have been let through.
console.log('\n     the IELTS reading anchors, as they stand:');
for (const a of ANCHORS) {
  const p2 = profile(a.script, gt.locale);
  console.log(`       ${a.id} ${a.level}  ${String(a.script.split(/\s+/).length).padStart(3)} words  ` +
    `sent ${p2.meanSentenceWords.toFixed(1).padStart(5)}  long ${p2.longWordRate.toFixed(2)}  var ${p2.lexicalVariety.toFixed(2)}`);
}
const monotone = ANCHORS.every((a, i) => i === 0 || profile(ANCHORS[i - 1].script, gt.locale).meanSentenceWords <= profile(a.script, gt.locale).meanSentenceWords);
console.log(`     do they rise monotonically in sentence length? ${monotone ? 'yes' : 'NO — the instrument is not graded'}`);
console.log('     six passages of 16 to 45 words are not an instrument. Filling this bank');
console.log('     is what makes the veto worth running on the next one.');

console.log('\n4. Ingest runs the layers in order, and records who judged\n');
const verdict = (over: Partial<AnchorVerdict> = {}): AnchorVerdict =>
  ({ pass: true, reasons: [], judge: 'claude-opus-5', easier: 'gt-r-03-r', harder: 'gt-r-05-r', ...over });

const bad = ingest({ candidate: good({ script: 'Too short.' }), blueprint: bp, section: reading, anchors: ANCHORS, anchorVerdict: verdict(), locale: gt.locale });

t('a gate failure never reaches the judgement', bad.ok === false && bad.rejected.layer === 'gate', true);

const noJudge = ingest({ candidate: good(), blueprint: bp, section: reading, anchors: LADDER, anchorVerdict: verdict({ judge: '  ' }), locale: gt.locale });
t('a verdict with no judge is not a verdict', noJudge.ok === false && noJudge.rejected.layer === 'anchor', true);

const noAnchors = ingest({ candidate: good(), blueprint: bp, section: reading, anchors: LADDER, anchorVerdict: verdict({ easier: null, harder: null }), locale: gt.locale });
t('a comparison against nothing is not a comparison', noAnchors.ok === false, true);

// Measured against a graded ladder, not against the six stubs — see §3.
const ok = ingest({ candidate: good(), blueprint: bp, section: reading, anchors: LADDER, anchorVerdict: verdict(), locale: gt.locale });
t('a sound candidate is accepted', ok.ok, true);
if (!ok.ok) console.log('     ', ok.rejected.layer, ok.rejected.reasons.join('; '));
if (ok.ok) {
  t('and it is marked as having marked its own homework', ok.accepted.selfJudged, true);
  t('and it carries all three verdicts', Object.keys(ok.accepted.layers).sort(), ['anchor', 'gate', 'veto']);
}
const other = ingest({ candidate: good(), blueprint: bp, section: reading, anchors: LADDER, anchorVerdict: verdict({ judge: 'a-different-judge' }), locale: gt.locale });
t('a different judge clears the self-judged flag', other.ok && other.accepted.selfJudged, false);

// The instrument has to be built before it can measure: against the six
// stubs the same sound candidate is refused, and as an ANCHOR it is admitted,
// unmeasured and marked for review.
const asItem = ingest({ candidate: good(), blueprint: bp, section: reading, anchors: ANCHORS, anchorVerdict: verdict(), locale: gt.locale });
t('against the placeholder anchors, an item is refused by the veto',
  asItem.ok === false && asItem.rejected.layer === 'veto', true);
const asAnchor = ingest({ candidate: good(), blueprint: bp, section: reading, anchors: ANCHORS, anchorVerdict: verdict(), locale: gt.locale, role: 'anchor' });
t('the same candidate is admitted AS AN ANCHOR', asAnchor.ok, true);
if (asAnchor.ok) {
  t('an anchor is always sent for review', asAnchor.accepted.needsReview, true);
  t('and its veto result is kept, not claimed as a pass', asAnchor.accepted.layers.veto.pass, false);
}

const report = summarise(6, [ok, bad, noJudge]);
t('the batch report counts before and after', [report.before, report.after], [6, 7]);
t('and keeps the rejection reasons', Object.keys(report.byReason).length > 0, true);

console.log('\n5. Across every bank the gate finds thinness, and nothing else\n');

/**
 * This section began as *"the gate must not reject the bank it will judge
 * successors by"*, went red on all six IELTS reading passages, and was the
 * reason the word floors were rewritten from the published format instead of
 * from what happened to be in the file.
 *
 * Then the first batch replaced those six, and the assertion that they were
 * short of the exam went red the other way. Both states were correct in turn,
 * which is why the check now says the thing that stays true: **a hygiene
 * defect anywhere in any bank is a failure; thinness is counted and printed,
 * because it is the work remaining rather than a fault.**
 */
const THIN = /^(items\.too-few|passage\.too-short)/;
for (const exam of EXAMS) {
  for (const sec of exam.sections) {
    if (sec.kind !== 'comprehension') continue;
    const section = sec as ComprehensionSection;
    const bps = blueprintsFor(exam, section);
    let thin = 0;
    const hygiene: string[] = [];
    for (const r of section.recordings) {
      const items = section.items.filter((i) => i.recordingId === r.id);
      const b = bps.find((x) => x.family === r.family && x.level === r.level);
      if (!b) { hygiene.push(`${r.id}: no blueprint — family or band is not one the planner can emit`); continue; }
      const without = { ...section, recordings: section.recordings.filter((x) => x.id !== r.id) } as ComprehensionSection;
      const v = runGate({
        candidate: {
          id: r.id, examId: exam.id, skill: section.skill as 'reading', family: r.family!, level: r.level as Candidate['level'],
          script: r.script ?? '', items, freshness: r.freshness ?? 'timeless',
          provenance: { author: 'selm', authoredAt: '2026-08-29', promptVersion: 'bank', source: 'published exam format' },
        },
        blueprint: b, section: without, locale: exam.locale,
      });
      const bad = v.reasons.filter((x) => !THIN.test(x));
      if (bad.length) hygiene.push(`${r.id}: ${bad.join(', ')}`);
      if (v.reasons.some((x) => THIN.test(x))) thin += 1;
    }
    t(`${exam.id} · ${section.skill}: no hygiene defect in ${section.recordings.length} passages`, hygiene, []);
    console.log(`       ${thin} of ${section.recordings.length} are thinner than the format asks for`);
  }
}
console.log('\n6. Thinnest first is an order, not a slogan\n');
const plan = thinnestFirst(blueprintsFor(gt, reading));
t('the first coordinate is empty', plan[0].have, 0);
t('the list is non-decreasing in what it holds',
  plan.every((b, i) => i === 0 || plan[i - 1].have <= b.have), true);
t('every coordinate the planner can emit is in it', plan.length, (reading.families ?? []).length * 6);
console.log(`     first five: ${plan.slice(0, 5).map((b) => `${b.family}·${b.level}(${b.have})`).join('  ')}`);

console.log('\n7. The profile is arithmetic, and says what it measured\n');
const p = profile(SCRIPT, gt.locale);
t('mean sentence length is plausible', p.meanSentenceWords > 10 && p.meanSentenceWords < 60, true);
t('lexical variety is length-normalised', p.lexicalVariety > 1 && p.lexicalVariety < 30, true);

console.log(failed === 0
  ? '\nAll authoring cases pass — and every case in §2 fails if its rule is deleted.\n'
  : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} authoring case(s) failed`);
