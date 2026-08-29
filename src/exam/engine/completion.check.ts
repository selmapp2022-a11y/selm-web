/**
 * The completion marker must not be generous.
 *
 *   npx tsx src/exam/engine/completion.check.ts
 *
 * Every case below is written so that a marker which "helped" the candidate
 * would FAIL it. That is the point: a check that only proves the right answer
 * is accepted would pass just as happily with an edit-distance matcher bolted
 * on, and an edit-distance matcher is exactly the thing that must never appear
 * in this file's history.
 *
 * IELTS marks spelling. Marking too hard costs a candidate an afternoon of
 * extra practice. Marking too easy sends them to a real exam they will fail,
 * having paid for it and waited for it. The two errors are not symmetrical.
 */
import { markCompletion, normalise, wordCount } from './completion';
import type { CompletionAnswer } from '../model/types';

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

const RULE = (accept: string[], maxWords: 1 | 2 | 3 = 2, caseSensitive = false): CompletionAnswer =>
  ({ accept, maxWords, caseSensitive });

const mark = (rule: CompletionAnswer, given: string | null) => markCompletion(rule, given).correct;

console.log('\n1. The answer is accepted, in the forms that are actually the same string\n');
t('exact', mark(RULE(['receive']), 'receive'), true);
t('case is not marked', mark(RULE(['Receive']), 'receive'), true);
t('leading and trailing space', mark(RULE(['receive']), '   receive  '), true);
t('a trailing full stop is not a spelling', mark(RULE(['Smith']), 'Smith.'), true);
t('double space inside is collapsed', mark(RULE(['car park']), 'car  park'), true);
t("a phone's curly apostrophe", mark(RULE(["o'clock"]), 'o’clock'), true);
t('both listed forms accepted — digits', mark(RULE(['15', 'fifteen'], 1), '15'), true);
t('both listed forms accepted — words', mark(RULE(['15', 'fifteen'], 1), 'fifteen'), true);

console.log('\n2. SPELLING IS MARKED. Every one of these must be WRONG.\n');
t('recieve is wrong', mark(RULE(['receive']), 'recieve'), false);
t('one letter missing', mark(RULE(['accommodation'], 1), 'accomodation'), false);
t('one letter extra', mark(RULE(['Smith']), 'Smithh'), false);
t('transposed letters', mark(RULE(['receipt']), 'reciept'), false);
t('plural for singular', mark(RULE(['ticket']), 'tickets'), false);
t('singular for plural', mark(RULE(['tickets']), 'ticket'), false);
t('a synonym is not the answer', mark(RULE(['car park']), 'parking lot'), false);
t('a homophone is not the answer', mark(RULE(['their']), 'there'), false);
t('digits when only the word is accepted', mark(RULE(['fifteen'], 1), '15'), false);
t('word when only digits are accepted', mark(RULE(['15'], 1), 'fifteen'), false);
t('interior punctuation is part of the word', mark(RULE(["o'clock"]), 'oclock'), false);

console.log('\n3. The word cap is enforced, not printed\n');
t('two words in a TWO WORD item', mark(RULE(['car park'], 2), 'car park'), true);
t('THREE words in a TWO WORD item is wrong', mark(RULE(['car park'], 2), 'the car park'), false);
t('...even though the accepted form is inside it',
  markCompletion(RULE(['car park'], 2), 'the car park').correct === false &&
  (markCompletion(RULE(['car park'], 2), 'the car park') as { reason: string }).reason === 'too_many_words', true);
t('ONE WORD item refuses two', mark(RULE(['Monday'], 1), 'on Monday'), false);
t('a number counts as one word', mark(RULE(['15 minutes'], 2), '15 minutes'), true);

console.log('\n4. Nothing was answered\n');
t('empty string', mark(RULE(['x']), ''), false);
t('only spaces', mark(RULE(['x']), '   '), false);
t('null', mark(RULE(['x']), null), false);
t('blank is reported as blank, not as a wrong answer',
  (markCompletion(RULE(['x']), '') as { reason: string }).reason, 'blank');

console.log('\n5. Case sensitivity, where an item genuinely needs it\n');
t('case-sensitive item rejects the wrong case', mark(RULE(['PIN'], 1, true), 'pin'), false);
t('case-sensitive item accepts the right case', mark(RULE(['PIN'], 1, true), 'PIN'), true);

console.log('\n6. The normaliser itself cannot turn a wrong word into a right one\n');
// The proof that the normalisation is safe: it is applied to BOTH sides, so it
// can only remove differences that are identical on both. Two strings that
// differ by a letter still differ by a letter afterwards.
const pairs: Array<[string, string]> = [
  ['receive', 'recieve'], ['their', 'there'], ['ticket', 'tickets'], ['form', 'from'],
];
for (const [a, b] of pairs) {
  t(`normalise keeps "${a}" and "${b}" different`, normalise(a) === normalise(b), false);
}
t('wordCount counts a number as one', wordCount(normalise('15')), 1);
t('wordCount ignores collapsed space', wordCount(normalise('  car   park ')), 2);

console.log(failed === 0
  ? '\nAll completion cases pass — and every case in §2 and §3 would fail a generous matcher.\n'
  : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} completion case(s) failed`);
