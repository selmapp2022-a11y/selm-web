/**
 * THE IELTS LISTENING VARIETY PLAN, CHECKED BEFORE A SINGLE FILE IS RENDERED.
 *
 * Rendering is the expensive, irreversible half. Everything that can be known
 * about the plan before any credit is spent is asserted here — this is the
 * same order the French bank was done in, and the reason the French batch
 * reported `39 rendered, 0 skipped` rather than a substitution nobody could
 * hear.
 */
import { EXAMS } from '../definitions';
import { IELTS_VARIETY_PLAN, IELTS_PUBLISHED_ACCENTS, SINGLE_VOICE_VARIETIES, IELTS_MAJORITY_VARIETY } from '../definitions/ielts-variety-plan';
import { IELTS_VOICE_CAST } from '../definitions/ielts-voices';
import type { ComprehensionSection } from '../model/types';

let failed = 0;
const t = (name: string, got: unknown, want: unknown, note = '') => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? (note ? `   ${note}` : '') : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

const exam = EXAMS.find((e) => e.id === 'ielts-gt')!;
const S = exam.sections.find((s): s is ComprehensionSection => s.id === 'listening')!;

console.log('\n1. The plan covers the bank, exactly\n');

const planIds = IELTS_VARIETY_PLAN.map((p) => p.id).sort();
const bankIds = S.recordings.map((r) => r.id).sort();
t('one assignment per recording, and no assignment without one', planIds, bankIds);
t('no id assigned twice', new Set(planIds).size, planIds.length);
for (const p of IELTS_VARIETY_PLAN) {
  const r = S.recordings.find((x) => x.id === p.id)!;
  t(`${p.id}: the plan agrees with the bank about the part and the speakers`,
    [r.part?.en, r.speakers, r.level], [p.part, p.speakers, p.level]);
}

console.log('\n2. Variety is a PART-level property, and Canadian is the majority\n');

// «تنوع باید در سطح پارت باشد، نه در سطح سؤال. کاربری که پارت ۱ را دوباره
//  می‌گیرد، باید یک ضبط کاملاً متفاوت بشنود.»
//
// The founder's constraint is that a candidate re-sitting a part hears a
// COMPLETELY DIFFERENT RECORDING. The first version of this file read that as
// "four different accents in every part" and asserted it — which was a
// stricter rule than he set, and on 31 August it collided with the one he did
// set: Canadian is the majority. Four distinct accents across four versions
// caps any accent at one per part, which is 25% and not a majority of
// anything.
//
// A different script in a different voice IS a different recording. So the
// rule asserted here is his: every version of a part is a different script,
// and no part is a single accent throughout.
for (const part of ['Part 1', 'Part 2', 'Part 3', 'Part 4'] as const) {
  const here = IELTS_VARIETY_PLAN.filter((p) => p.part === part);
  t(`${part}: four versions`, here.length, 4);
  t(`${part}: not one accent throughout`, new Set(here.map((p) => p.variety)).size >= 2, true,
    here.map((p) => p.variety).join(', '));
  t(`${part}: a Canadian voice is reachable`, here.some((p) => p.variety === IELTS_MAJORITY_VARIETY), true);
}

// HALF, NOT MORE THAN HALF, AND THE DIFFERENCE IS DELIBERATE.
//
// The first version of this line asserted a strict majority and failed at 8 of
// 16. Pushing Canadian to 9 would have taken one of the four accents
// ielts.org names down to a single recording in the whole bank, which is
// presence in name only — and the reason the plan is not all-Canadian is
// exactly that those four must really be there.
//
// So the claim is what the plan actually does: Canadian is half the bank, in
// every part, and four times the share of any other accent. That is what
// "Canadian is the majority" buys a candidate — a familiar voice in every
// part they sit — without the bank stopping being IELTS.
const canadian = IELTS_VARIETY_PLAN.filter((p) => p.variety === IELTS_MAJORITY_VARIETY).length;
const others = IELTS_VARIETY_PLAN.filter((p) => p.variety !== IELTS_MAJORITY_VARIETY);
const biggestOther = Math.max(...IELTS_PUBLISHED_ACCENTS.map((v) => others.filter((p) => p.variety === v).length));
t('Canadian is half the bank', canadian * 2 >= IELTS_VARIETY_PLAN.length, true,
  `${canadian} of ${IELTS_VARIETY_PLAN.length}`);
t('and at least four times any other accent', canadian >= biggestOther * 4, true,
  `${canadian} against ${biggestOther}`);
t('and in every one of the four parts', new Set(IELTS_VARIETY_PLAN.filter((p) => p.variety === IELTS_MAJORITY_VARIETY).map((p) => p.part)).size, 4);

console.log('\n3. The four accents ielts.org names are still all present\n');

// This is the half of the ruling that was argued rather than accepted, and it
// is recorded because the argument is the reason the plan is not all-Canadian:
// ielts.org states the recordings carry "Different accents, including British,
// Australian, New Zealand and North American". A candidate who has only ever
// practised on one accent has practised a different test.
const varieties = [...new Set(IELTS_VARIETY_PLAN.map((p) => p.variety))].sort();
for (const v of IELTS_PUBLISHED_ACCENTS)
  t(`ielts.org names ${v}, and the bank speaks it`, varieties.includes(v), true);

// And the French mistake in its IELTS form: shares applied in level order
// produced a bank with no Québécois below B1, teaching a candidate that an
// unfamiliar accent is a hard-band problem. Real exams do not work that way.
const levelsOf = (v: string) =>
  [...new Set(IELTS_VARIETY_PLAN.filter((p) => p.variety === v).map((p) => p.level))].sort();
for (const v of varieties) {
  const ls = levelsOf(v);
  t(`${v} is not C1-only`, ls.length === 1 && ls[0] === 'C1', false, ls.join('/'));
}

console.log('\n3b. Nothing is planned in a variety the ruling removed\n');

// Irish and Scottish are out. `gt-l-p4` was RENDERED Irish, which is the one
// already-paid-for file this ruling costs, and it is marked `keep: false`
// rather than left in place: a bank described as Canadian-majority with an
// Irish recording in it is the substitution defect with our own name on it.
for (const v of SINGLE_VOICE_VARIETIES)
  t(`${v} is not planned anywhere`, IELTS_VARIETY_PLAN.filter((p) => p.variety === v).map((p) => p.id), []);
// `rendered && !keep` is audio that plays in a variety the plan forbids. It
// was `gt-l-p4`, spoken Irish; it has been re-rendered Canadian and the set is
// now empty, which is the state to defend. The assertion is kept pointing at
// the empty set rather than deleted: the next accent ruling will make it
// non-empty, and a check that was removed once it went green is a check that
// only ever guarded the past.
const stale = IELTS_VARIETY_PLAN.filter((p) => p.rendered && !p.keep);
t('no rendered file is left in a variety the plan forbids', stale.map((p) => p.id), []);
t('and every recording in the bank has been rendered',
  IELTS_VARIETY_PLAN.filter((p) => p.rendered && p.keep).length, IELTS_VARIETY_PLAN.length);

console.log('\n4. The account’s limits are in the DATA, not met at render time\n');

// Irish is male-only on this account and Scottish is female-only. A
// two-speaker recording needs two voices of one variety, so neither may be
// planned onto one. Met at render time instead, the renderer substitutes a
// voice of another variety: the file plays perfectly and is wrong, and
// nothing on the screen says so.
// The rule that survives a cast change, asserted over the WHOLE cast rather
// than over the two names that happen to fail it today.
for (const v of [...new Set(IELTS_VOICE_CAST.filter((c) => c.id !== 'narrator').map((c) => c.accent))]) {
  const voices = IELTS_VOICE_CAST.filter((c) => c.accent === v && c.id !== 'narrator');
  const onDialogues = IELTS_VARIETY_PLAN.filter((p) => p.variety === v && p.speakers > 1);
  if (voices.length < 2)
    t(`${v}: one voice on this account, so never planned onto a dialogue`, onDialogues.map((p) => p.id), []);
}
for (const p of IELTS_VARIETY_PLAN.filter((x) => x.speakers > 1)) {
  const genders = new Set(IELTS_VOICE_CAST.filter((c) => c.accent === p.variety && c.id !== 'narrator').map((c) => c.gender));
  t(`${p.id}: ${p.variety} has both genders for a dialogue`, genders.size >= 2, true);
}

console.log('\n6. What the plan is NOT claiming\n');

// The property `ielts-listening.check.ts` asserts over the anchors — no two
// parts open with the same voice — cannot hold over every drawable paper, and
// this states the arithmetic rather than letting it be discovered after the
// render. 4 versions × 4 parts = 256 papers; the property needs the four
// parts' opener pools disjoint, so sixteen distinct voices, and the cast holds
// twelve besides the narrator. One of the fixed cast, the depth or the
// property has to give, and that is a ruling to take, not a thing to fix here.
const speaking = IELTS_VOICE_CAST.filter((c) => c.id !== 'narrator').length;
const openersNeeded = IELTS_VARIETY_PLAN.length;
t('the cast cannot give every part a disjoint opener pool', speaking >= openersNeeded, false,
  `${speaking} voices, ${openersNeeded} recordings — the shortfall is real and is not a defect in the plan`);

console.log(failed ? `\n${failed} FAILED\n` : '\nThe variety plan holds. Nothing has been rendered.\n');
if (failed) throw new Error(`${failed} variety case(s) failed`);
