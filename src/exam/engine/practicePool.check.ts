/**
 * Practice must not deal the same card twice.
 *
 *   npx tsx src/exam/engine/practicePool.check.ts
 *
 * The defect being fixed was invisible to every check in this directory,
 * because every check asked the selector a question and the selector answered
 * correctly. Nothing asked what a candidate SEES on their second visit — and
 * the answer, measured on the deployed build, was "the same recording, ten
 * times out of ten".
 *
 * So §1 is written the way the failure was found: not by calling the selector
 * twice, but by throwing the state away between calls, which is what a page
 * navigation does. A fix that keeps the memory in component state would pass a
 * naive check and fail this one.
 *
 * §5 checks the real banks, so that the day someone re-authors `tcf-canada.ts`
 * and leaves two recordings sharing an id, this fails rather than the app
 * quietly serving one of them forever.
 */
import { ladder, orderFor, practicable, practiceState, servePractice } from './practicePool';
import { candidateLevel, cefrTag } from './planner';
import { GOALS } from '../definitions';
import type { Attempt } from '../../lib/attempts';
import type { ComprehensionSection, Recording } from '../model/types';
import { EXAMS } from '../definitions';
import { newServeState } from './pool';
const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

const rec = (id: string, level: Recording['level']): Recording =>
  ({ id, level, family: 'f', variety: 'international', script: '', durationSec: 60 } as unknown as Recording);

const BANK: Recording[] = [
  rec('r-b1', 'B1'), rec('r-a1', 'A1'), rec('r-c1', 'C1'), rec('r-a2', 'A2'),
];

const att = (itemId: string, ts: number): Attempt =>
  ({ skill: 'listening', topic: 'f · A1', itemId, ts });

/** One visit: state rebuilt from storage, one recording served, page left. */
const visit = (log: Attempt[]): string | null => {
  const st = practiceState(BANK, log);
  return servePractice(BANK, st).item?.id ?? null;
};

console.log('\n1. A visit is not a function call — the state dies with the page\n');

// The old code, exactly: no memory, sorted easiest first, index 0.
const empty: Attempt[] = [];
t('first ever visit opens on the easiest', visit(empty), 'r-a1');
t('second visit with NOTHING recorded still opens on the easiest', visit(empty), 'r-a1');
// ^ this is not the bug. Nothing happened between the two visits, so nothing
//   should change. The bug is the next line: something DID happen.

const log: Attempt[] = [att('r-a1', 1000)];
t('after practising the easiest, the next visit moves on', visit(log), 'r-a2');
log.push(att('r-a2', 2000));
t('and again', visit(log), 'r-b1');
log.push(att('r-b1', 3000));
t('and again', visit(log), 'r-c1');

console.log('\n2. Ten visits reach four recordings, and the fifth says so\n');

const fresh: Attempt[] = [];
const seenOrder: string[] = [];
for (let n = 0; n < 4; n++) {
  const st = practiceState(BANK, fresh);
  const s = servePractice(BANK, st);
  seenOrder.push(s.item!.id);
  t(`visit ${n + 1} is not a repeat`, seenOrder.filter((x) => x === s.item!.id).length, 1);
  t(`visit ${n + 1} reports ${4 - n} unseen`, s.unseen, 4 - n);
  t(`visit ${n + 1} does not claim exhaustion`, s.recycled, false);
  fresh.push(att(s.item!.id, 1000 + n));
}
t('the four came in ladder order', seenOrder, ['r-a1', 'r-a2', 'r-b1', 'r-c1']);

const fifth = servePractice(BANK, practiceState(BANK, fresh));
t('the fifth visit REPORTS that the bank is finished', fifth.recycled, true);
t('the fifth visit reports zero unseen', fifth.unseen, 0);
t('and it returns the least-recently-practised, not the easiest', fifth.item?.id, 'r-a1');
// r-a1 was practised at ts 1000, longest ago. The old code would also have
// returned r-a1 — from the other end of the reasoning, and without the flag
// that lets the screen say why.

console.log('\n3. A bank of one is honest about being a bank of one\n');

const ONE = [rec('only', 'B1')];
const s1 = servePractice(ONE, practiceState(ONE, []));
t('first serve of a one-item bank is not recycled', s1.recycled, false);
t('first serve reports one unseen', s1.unseen, 1);
const s2 = servePractice(ONE, practiceState(ONE, [att('only', 1)]));
t('second serve of a one-item bank REPORTS exhaustion', s2.recycled, true);
t('second serve reports the total, so the screen can name it', s2.total, 1);
// Ruling: "a skill with one item should not present it as though there were
// more". The flag is what lets the screen keep that promise; a selector that
// silently returned the same item could not.

console.log('\n4. Changing exam does not make the new bank look half-done\n');

const foreign: Attempt[] = [att('gt-l-p1', 500), att('gt-l-p2', 600)];
const s3 = servePractice(BANK, practiceState(BANK, foreign));
t('attempts naming another bank are ignored', s3.unseen, 4);
t('and the new bank starts at its own easiest', s3.item?.id, 'r-a1');

console.log('\n5. A pre-itemId attempt is "we do not know", not "recording 1"\n');

const legacy: Attempt[] = [{ skill: 'listening', topic: 'f · A1', ts: 100 }];
t('an attempt with no itemId marks nothing as seen', servePractice(BANK, practiceState(BANK, legacy)).unseen, 4);

console.log('\n6. The shipped banks can actually be walked end to end\n');

for (const exam of EXAMS) {
  for (const sec of exam.sections) {
    if (sec.kind !== 'comprehension') continue;
    const section = sec as ComprehensionSection;
    const bank = practicable(section);
    const ids = new Set(bank.map((r) => r.id));
    t(`${exam.id} · ${section.skill}: no duplicate ids in the practicable bank`, ids.size, bank.length);
    if (!bank.length) continue;

    // Walk it. Every recording must come up exactly once before any repeats.
    const walked: string[] = [];
    const st = practiceState(bank, []);
    for (let n = 0; n < bank.length; n++) {
      const s = servePractice(bank, st);
      if (s.recycled) break;
      walked.push(s.item!.id);
    }
    t(`${exam.id} · ${section.skill}: ${bank.length} recordings, ${bank.length} distinct served`,
      new Set(walked).size, bank.length);
    t(`${exam.id} · ${section.skill}: the walk ends by declaring the bank finished`,
      servePractice(bank, st).recycled, true);
    t(`${exam.id} · ${section.skill}: it opens on the easiest band present`,
      walked[0], ladder(bank)[0].id);
  }
}

console.log('\n7. The band is the candidate\'s, not the bank\'s\n');

// The founder, three times on 2026-08-29: "every exam has a level, and the
// questions and the practice have to differ." Two destinations, one paper,
// two required levels — CLB 9 and CLB 4. If they open on the same passage
// the complaint stands, whatever the selector does afterwards.
const gt = EXAMS.find((e) => e.id === 'ielts-gt')!;
const gtReading = practicable(
  gt.sections.find((x) => x.kind === 'comprehension' && x.skill === 'reading') as ComprehensionSection,
);

const goalFor = (id: string) => GOALS.find((g) => g.id === id)!;
const bandFor = (goalId: string) =>
  candidateLevel(gt, null, goalFor(goalId).requiredLevel, 'reading');

const clb9 = bandFor('ee-english');
const clb4 = bandFor('citizenship');
t('CLB 9 and CLB 4 do not resolve to the same band', clb9.index === clb4.index, false);
t('CLB 9 sits above CLB 4', clb9.index > clb4.index, true);
t('with no score, the basis is the destination', clb9.basis, 'target');

const firstFor = (index: number) => servePractice(gtReading, practiceState(gtReading, []), index).item?.id;
const a9 = firstFor(clb9.index);
const a4 = firstFor(clb4.index);
console.log(`     CLB 9 -> ${cefrTag(clb9.index)} opens on ${a9};  CLB 4 -> ${cefrTag(clb4.index)} opens on ${a4}`);
t('the two destinations do NOT open on the same passage', a9 === a4, false);

// And each opens at its own band, not at the bottom of the bank.
const levelOf = (id?: string) => gtReading.find((r) => r.id === id)?.level;
t('CLB 9 opens at its own band', levelOf(a9), cefrTag(clb9.index));
t('CLB 4 opens at its own band', levelOf(a4), cefrTag(clb4.index));
t('neither opens on the easiest passage in the bank', a9 === ladder(gtReading)[0].id && a4 === ladder(gtReading)[0].id, false);

// A tie resolves downward: consolidating the band beneath is useful, the band
// above is not yet theirs.
const TIE = [rec('below', 'B1'), rec('above', 'C1')];
t('a tie resolves downward', orderFor(TIE, 3 /* B2 */)[0].id, 'below');

// And a bank belonging to nobody is still counted on the ladder, so the
// inventory does not depend on whose screen it was taken from.
t('here === null is still the ladder', orderFor(BANK, null).map((r) => r.id),
  ['r-a1', 'r-a2', 'r-b1', 'r-c1']);


// ── THE RECYCLE IS AT THE CANDIDATE'S LEVEL TOO ──────────────────────────
// The ordering was applied to the draw and not to the recycle. A candidate at
// B2 who exhausted the bank was handed A1 on their second pass — served
// correctly the first time and wrongly the second, which is the harder failure
// to notice because the screen looks the same.
{
  console.log('\nRECYCLE\n');
  const gt = EXAMS.find((e) => e.id === 'ielts-gt')!;
  const sec = gt.sections.find((x) => x.kind === 'comprehension' && x.skill === 'reading') as any;
  const bank = sec.recordings as Recording[];
  const here = CEFR.indexOf('B2');

  const st = newServeState();
  const drawn: string[] = [];
  for (let n = 0; n < bank.length; n++) drawn.push(servePractice(bank, st, here).item!.id);
  t('every recording is drawn once before any repeats', new Set(drawn).size, bank.length);

  const first = servePractice(bank, st, here);
  const level = bank.find((r) => r.id === first.item!.id)!.level;
  t('the recycle is flagged', first.recycled, true);
  t('and the first recycled recording is at the candidate\'s band', level, 'B2');

  // With no known level there is no nearest band, and the ladder recycles whole.
  const st2 = newServeState();
  for (let n = 0; n < bank.length; n++) servePractice(bank, st2, null);
  t('here === null still recycles, and says so', servePractice(bank, st2, null).recycled, true);
}

console.log(failed === 0
  ? '\nAll practice-pool cases pass — including the four that fail if the memory lives in the page.\n'
  : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} practice-pool case(s) failed`);
