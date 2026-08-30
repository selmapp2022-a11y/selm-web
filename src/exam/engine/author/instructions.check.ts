/**
 * THE PROMPT CANNOT FALL BEHIND THE GATE.
 *
 *   npx tsx src/exam/engine/author/instructions.check.ts
 *
 * `instructions.ts` exists because a model does not learn between batches:
 * the 52% first-pass refusal rate of 30 August fell from 67% to 40% across
 * four batches only because the AUTHOR remembered. Writing the rules down is
 * how that memory is handed to whoever writes next.
 *
 * A written-down rule has one failure mode: the code changes and the writing
 * does not. So this check does not compare two lists by hand. It builds
 * candidates that are deliberately wrong, runs the REAL gate over them,
 * reads the rule ids the gate actually emits, and fails if any of those ids
 * is missing from `RULES` — or if the text `RULES` gives never reaches the
 * prompt a model would be handed.
 */
import { EXAMS } from '../../definitions';
import type { ComprehensionItem, ComprehensionSection } from '../../model/types';
import { blueprintsFor } from './blueprint';
import { runGate } from './gate';
import { RULES, VETO_NOTE, PROMPT_VERSION, authoringPrompt } from './instructions';
import type { Candidate } from './types';

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

const gt = EXAMS.find((e) => e.id === 'ielts-gt')!;
const reading = gt.sections.find(
  (s): s is ComprehensionSection => s.kind === 'comprehension' && s.skill === 'reading',
)!;
const bp = blueprintsFor(gt, reading).find((b) => b.family === 'informative' && b.level === 'B2')!;

const PASSAGE =
  'The council has changed the way garden waste is collected in the borough. ' +
  'Households that want the service now subscribe for a year and receive a bin with a printed label. ' +
  'Collections run fortnightly between March and November and stop entirely over the winter, when the crews are moved to other work. ' +
  'A household that does not subscribe may still take garden waste to the depot on Mill Lane free of charge, although the depot is open only at weekends. ' +
  'The change was introduced because the free collection was used by fewer than a third of households and cost the same to run whether or not a street put anything out. ' +
  'Officers expect the subscription to cover about seventy per cent of the cost, with the remainder met from the general fund.';

const item = (over: Partial<ComprehensionItem> = {}): ComprehensionItem => ({
  id: 'x-q1', recordingId: 'x', level: 'B2',
  stem: 'Why was the free collection replaced?',
  options: [
    'It was used by a minority of homes',
    'The crews were needed elsewhere',
    'The depot had closed at weekends',
    'The bins were too small to fill',
  ],
  answer: 0,
  rationale: 'Fewer than a third of households used it while the cost of running it did not fall when a street put nothing out.',
  ...over,
} as ComprehensionItem);

const candidate = (over: Partial<Candidate> = {}): Candidate => ({
  id: 'x', examId: 'ielts-gt', skill: 'reading', family: 'informative', level: 'B2',
  script: PASSAGE,
  items: [item(), item({ id: 'x-q2', stem: 'What happens over the winter?', answer: 1,
    options: ['Collections continue', 'Collections stop', 'The depot closes', 'The label changes'],
    rationale: 'Collections run fortnightly from March to November and stop completely once the crews move to other work.' }),
    item({ id: 'x-q3', stem: 'What can a household do without subscribing?', answer: 2,
      options: ['Ask for a free bin', 'Pay for one collection', 'Use the depot at weekends', 'Leave waste at the kerb'],
      rationale: 'Waste may be taken to the depot on Mill Lane at no charge, though the depot opens only at weekends.' }),
    item({ id: 'x-q4', stem: 'How much of the cost will subscriptions cover?', answer: 3,
      options: ['All of it', 'About a third', 'About half', 'About seventy per cent'],
      rationale: 'Officers expect about seventy per cent from subscriptions and the rest from the general fund.' })],
  freshness: 'current',
  provenance: { author: 'check', authoredAt: new Date().toISOString(), promptVersion: PROMPT_VERSION, source: 'ielts.org — published format' },
  ...over,
});

/** Strip the per-item prefix and the parenthesised measurement. */
const bare = (reason: string) => reason.replace(/^[^:]*:/, '').replace(/\(.*$/, '');

console.log('\n1. Every rule the gate can fire is written down\n');

/** Each case is a candidate bent in one direction, with the id it should fire. */
const CASES: Array<[string, Candidate]> = [
  ['passage.too-short', candidate({ script: 'Too short to be a B2 passage.' })],
  ['passage.too-long', candidate({ script: (PASSAGE + ' ').repeat(6) })],
  ['passage.empty', candidate({ script: '   ' })],
  ['passage.wrong-family', candidate({ family: 'notice' })],
  ['passage.wrong-band', candidate({ level: 'A1' })],
  ['passage.dated', candidate({ freshness: 'dated' })],
  ['items.too-few', candidate({ items: [item()] })],
  ['items.duplicate-id', candidate({ items: [item(), item()] })],
  ['item.no-stem', candidate({ items: [item({ stem: '  ' }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['item.stem-not-a-question', candidate({ items: [item({ stem: 'The collection changed' }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['item.no-rationale', candidate({ items: [item({ rationale: 'Because.' }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['item.wrong-passage', candidate({ items: [item({ recordingId: 'somewhere-else' }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['options.count', candidate({ items: [item({ options: ['a', 'b'] }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['options.answer-out-of-range', candidate({ items: [item({ answer: 9 }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['options.identical', candidate({ items: [item({ options: ['same', 'same', 'other', 'third'] }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['options.near-duplicate', candidate({ items: [item({ options: ['The cost will rise', 'The cost will not rise', 'Crews were moved', 'Bins were relabelled'] }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['options.key-is-conspicuously-longest', candidate({ items: [item({ options: ['It was used by fewer than a third of the households in the borough and cost the same', 'Crews left', 'Bins broke', 'Costs fell'] }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['options.key-lifted-from-passage', candidate({ items: [item({ options: ['Collections run fortnightly between March and November', 'The crews were needed', 'The depot had closed', 'The bins were small'] }), item({ id: 'x-q2' }), item({ id: 'x-q3' }), item({ id: 'x-q4' })] })],
  ['provenance.no-author', candidate({ provenance: { author: ' ', authoredAt: '', promptVersion: PROMPT_VERSION, source: 's' } })],
  ['provenance.no-prompt-version', candidate({ provenance: { author: 'a', authoredAt: '', promptVersion: '  ', source: 's' } })],
  ['provenance.no-source', candidate({ provenance: { author: 'a', authoredAt: '', promptVersion: PROMPT_VERSION, source: '  ' } })],
];

const fired = new Set<string>();
for (const [want, c] of CASES) {
  const v = runGate({ candidate: c, blueprint: bp, section: reading, locale: gt.locale });
  const ids = v.reasons.map(bare);
  ids.forEach((i) => fired.add(i));
  t(`${want} fires`, ids.includes(want), true);
}

console.log('\n2. And nothing the gate fired is undocumented\n');
const undocumented = [...fired].filter((id) => !RULES[id]).sort();
t('every rule id the gate emitted has an instruction', undocumented, []);

console.log('\n3. The instruction text reaches the prompt\n');
const prompt = authoringPrompt({
  examId: 'ielts-gt', skill: 'reading', family: bp.family, familyDescribes: bp.familyDescribes,
  level: bp.level, words: bp.words, questions: bp.questions,
});
const missingFromPrompt = Object.keys(RULES).filter((id) => !prompt.includes(id));
t('every documented rule id appears in the prompt', missingFromPrompt, []);
t('the veto is stated, since it has no rule id', prompt.includes(VETO_NOTE), true);

// The two rules that cost the most rework must carry their NUMBERS, or a
// writer has a principle and not a limit.
t('the length rule states its threshold', /three words longer/i.test(RULES['options.key-is-conspicuously-longest']), true);
t('the lifting rule states its threshold', /six or more consecutive words/i.test(RULES['options.key-lifted-from-passage']), true);
t('the rationale rule states its threshold', /forty characters/i.test(RULES['item.no-rationale']), true);
t('the coordinate reaches the prompt', prompt.includes(`${bp.words.min} to ${bp.words.max} words`), true);

console.log(failed ? `\n${failed} FAILED` : '\nThe prompt cannot fall behind the gate.');
if (failed) throw new Error(`${failed} instruction case(s) failed`);
