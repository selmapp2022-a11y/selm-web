/**
 * The IELTS Listening test: is it the exam's shape, and is every answer
 * actually in the recording?
 *
 *   npx tsx src/exam/engine/ielts-listening.check.ts
 *
 * Two things are checked here that no other check can see.
 *
 * **The proportions.** The ruling of 29 August 2026 refused forty multiple-
 * choice questions labelled "IELTS Listening" because the real paper is mostly
 * completion. A bank that drifts back towards multiple choice — because MCQs
 * are easier to write — would be that refusal quietly reversed, so the shape
 * is asserted rather than intended.
 *
 * **That the answer is audible.** An item whose key is never spoken is not a
 * hard item, it is an impossible one, and nothing else in this codebase would
 * catch it: the audio renders fine, the types are satisfied, and the item
 * looks exactly like its neighbours. The check reads every accepted form back
 * against the script it is asked about.
 */
import { IELTS_LISTENING } from '../definitions/ielts-listening';
import { isChoiceItem, isCompletionItem, isMatchingItem } from '../model/types';
import { normalise } from './completion';
import { scoreComprehension, serveEpreuve, itemsFor, type ItemAnswer } from './comprehension';

const S = IELTS_LISTENING;
let bad = 0;
const ok = (cond: boolean, label: string, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${label}${detail ? '   ' + detail : ''}`);
};

const completion = S.items.filter(isCompletionItem);
const matching = S.items.filter(isMatchingItem);
//  is measured on the paper (px) and on nothing else — the bank-wide
// count told us less than the per-paper one and read as a published fact.

/**
 * THE PAPER IS NOT THE BANK, and until 31 August this file could not tell them
 * apart.
 *
 * `four parts` and `forty questions` were asserted on `S.recordings` and
 * `S.items` — the whole bank. That was correct while the bank held exactly one
 * of each part, and it was about to become wrong for a good reason: the bank
 * is being grown to four versions of every part, and a check reading the bank
 * would have reported a forty-question exam as a hundred-and-sixty-question
 * failure while the exam itself had not changed at all.
 *
 * So the published facts are asserted against what ONE SITTING presents, and
 * the bank is checked separately for the properties every recording must have
 * whether or not it is on today's paper.
 */
const PAPER = serveEpreuve(S);
const paperItems = itemsFor(S, PAPER);
const pc = paperItems.filter(isCompletionItem);
const pm = paperItems.filter(isMatchingItem);
const px = paperItems.filter(isChoiceItem);

console.log('\n1. The shape of the PAPER — what one sitting presents\n');
ok(PAPER.length === 4, 'four parts', `${PAPER.length}`);
ok(paperItems.length === 40, 'forty questions', `${paperItems.length}`);
ok(new Set(PAPER.map((r) => r.family)).size === 4, 'one of each part, never the same part twice',
   PAPER.map((r) => `${r.family}:${r.id}`).join(' '));

console.log('');
ok(pc.length > paperItems.length / 2,
   'completion is the MAJORITY, as the real paper is',
   `${pc.length}/${paperItems.length} typed`);
ok(pm.length > 0, 'matching and labelling are present', `${pm.length}`);
ok(px.length < pc.length,
   'multiple choice is a minority of the paper',
   `${px.length} choice vs ${pc.length} completion`);
ok(pc.length + pm.length + px.length === paperItems.length, 'every question has a kind');
ok(S.matchingGroups?.some((g) => !!g.figureSvg) === true,
   'a labelling task with a figure exists — map labelling is a real IELTS task');

console.log('\n1b. The shape of the BANK — every version, on or off today\'s paper\n');
ok(new Set(S.items.map((i) => i.id)).size === S.items.length, 'question ids unique',
   `${S.items.length} questions`);
ok(new Set(S.recordings.map((r) => r.id)).size === S.recordings.length, 'recording ids unique',
   `${S.recordings.length} recordings`);
ok(completion.length > S.items.length / 2,
   'completion stays the majority across the whole bank',
   `${completion.length}/${S.items.length}`);
{
  const byFamily = new Map<string, number>();
  for (const r of S.recordings) byFamily.set(String(r.family), (byFamily.get(String(r.family)) ?? 0) + 1);
  console.log(`       versions per part: ${[...byFamily].map(([f, n]) => `${f} ${n}`).join(', ')}`);
}

console.log('\n2. Every question names material that exists, and every part is used\n');
const recIds = new Set(S.recordings.map((r) => r.id));
ok(S.items.every((i) => recIds.has(i.recordingId)), 'every question names a real part');
ok(S.recordings.every((r) => S.items.some((i) => i.recordingId === r.id)), 'every part is asked about');
for (const r of S.recordings) {
  const n = S.items.filter((i) => i.recordingId === r.id).length;
  ok(n === 10, `${r.id}: ten questions, as every IELTS part has`, `${n}`);
}

console.log('\n3. Matching: the key is in the bank, and the bank is shared\n');
for (const g of S.matchingGroups ?? []) {
  const mine = matching.filter((i) => i.groupId === g.id);
  ok(mine.length >= 2, `${g.id}: a shared bank serves more than one question`, `${mine.length}`);
  ok(g.options.length >= 3, `${g.id}: at least three options`, `${g.options.length}`);
  ok(new Set(g.options.map((o) => o.id)).size === g.options.length, `${g.id}: option letters unique`);
  ok(mine.every((i) => g.options.some((o) => o.id === i.answer)), `${g.id}: every key is one of the options`);
  ok(recIds.has(g.recordingId), `${g.id}: names a real part`);
  if (g.reusable !== true) {
    const keys = mine.map((i) => i.answer);
    ok(new Set(keys).size === keys.length,
       `${g.id}: no letter is used twice in a bank that says each is used once`);
  }
}

console.log('\n4. Completion: the rule is answerable, and its own key obeys it\n');
ok(completion.every((i) => i.answer.accept.length > 0), 'every item accepts at least one form');
ok(completion.every((i) => i.prompt.includes('___')), 'every prompt shows where the gap is');
ok(completion.every((i) => i.answer.accept.every((a) => a.trim().split(/\s+/).length <= i.answer.maxWords)),
   'no accepted form breaks its own word cap');
ok(completion.every((i) => new Set(i.answer.accept.map((a) => normalise(a, i.answer.caseSensitive === true))).size === i.answer.accept.length),
   'no accepted form is a duplicate of another');

console.log('\n5. IS THE ANSWER AUDIBLE? Every key, read back against its script.\n');
// The answers below are spoken as words rather than written, so a literal
// search cannot find them. Each is named with its reason rather than skipped
// silently — an exception nobody can see is how a check stops being one.
const SPOKEN_NOT_WRITTEN: Record<string, string> = {
  'gt-l-02': 'the number is dictated digit by digit ("oh-seven-double-four…")',
  'gt-l-06': 'the time is said as "six", the form takes "6pm"',
  'gt-l-08': 'said as "fifteen pounds", the form takes the figure',
  'gt-l-04': 'said as "forty-five", the form takes the figure',
  'gt-l-37': 'said as "seventy-five", accepted as either',
  'gt-l-34': 'said as "four", accepted as either',
};
for (const i of completion) {
  const script = (S.recordings.find((r) => r.id === i.recordingId)?.script ?? '').toLowerCase();
  const heard = i.answer.accept.some((a) => script.includes(a.toLowerCase()));
  if (!heard && SPOKEN_NOT_WRITTEN[i.id]) {
    console.log(`  ok   ${i.id}: spoken, not written — ${SPOKEN_NOT_WRITTEN[i.id]}`);
    continue;
  }
  ok(heard, `${i.id}: at least one accepted form is actually said in the recording`,
     heard ? '' : `none of ${JSON.stringify(i.answer.accept)} appears in ${i.recordingId}`);
}

/**
 * §6 AND §7 ARE ABOUT RENDERED AUDIO, so they are asserted over the recordings
 * that HAVE audio, not over every script in the bank.
 *
 * The ruling of 29 August: *"`variety` is set per recording as it is produced
 * — declared at render time, never inferred afterwards."* An unrendered script
 * therefore has no variety and no voice, and that is the correct state rather
 * than a gap. Requiring one in advance would mean writing down which accent a
 * recording was going to be spoken in before anybody had chosen it, which is
 * exactly the `unknown` finding the ruling exists to prevent.
 */
const RENDERED = S.recordings.filter((r) => !!r.audioPath);
const UNRENDERED = S.recordings.filter((r) => !r.audioPath);

console.log('\n6. Accents: more than the four ielts.org names as a floor\n');
console.log(`       ${RENDERED.length} rendered, ${UNRENDERED.length} written and waiting for the variety gate`);
const varieties = new Set(RENDERED.map((r) => r.variety));
ok(varieties.size >= 4, 'at least four different accents across the rendered parts',
   [...varieties].join(', '));
ok(RENDERED.every((r) => !!r.variety && r.variety !== 'unknown'),
   'every rendered part declares the variety it is spoken in');
ok(UNRENDERED.every((r) => !r.variety && !r.voice),
   'and an unrendered script claims neither a variety nor a voice',
   `${UNRENDERED.length} checked`);

console.log('\n7. Every rendered part says which voices actually spoke it\n');
ok(RENDERED.every((r) => !!r.voice), 'every rendered part records the voice that produced it');
ok(RENDERED.every((r) => r.voice?.requestedVariety === r.variety),
   'no part was rendered in a variety other than the one asked for');
// A monologue is one speaker plus the narrator; a dialogue is two plus the
// narrator. The first manifest listed a voice for Part 2 and Part 4 that never
// opened its mouth — the renderer resolved a second speaker whether or not the
// part had one. A provenance record naming a voice that did not speak is the
// same defect as one omitting a voice that did, and nothing caught it but
// reading the file. This is what catches it now.
ok(RENDERED.every((r) => (r.voice?.voiceIds?.length ?? 0) === (r.speakers ?? 1) + 1),
   'the voices listed are exactly the speakers plus the narrator',
   RENDERED.map((r) => `${r.id}:${r.voice?.voiceIds?.length}`).join(' '));
const NARRATOR_ID = RENDERED[0]?.voice?.voiceIds?.slice(-1)[0];
ok(!!NARRATOR_ID && RENDERED.every((r) => r.voice?.voiceIds?.slice(-1)[0] === NARRATOR_ID),
   'the same narrator speaks every rendered part', NARRATOR_ID ?? '');
ok(new Set(RENDERED.map((r) => r.voice?.voiceId)).size === RENDERED.length,
   'no two rendered parts open with the same voice');

console.log('\n8. Scoring, end to end\n');
const answerAll = (f: (n: number) => 'right' | 'wrong' | 'near'): ItemAnswer[] =>
  S.items.map((i, n) => {
    const how = f(n);
    if (isCompletionItem(i)) {
      const a = i.answer.accept[0];
      return { itemId: i.id, chose: how === 'right' ? a : how === 'near' ? `${a.slice(0, -1)}${a.slice(-1)}${a.slice(-1)}` : 'zzz' };
    }
    if (isMatchingItem(i)) {
      const g = S.matchingGroups?.find((x) => x.id === i.groupId);
      const other = g?.options.find((o) => o.id !== i.answer)?.id ?? 'Z';
      return { itemId: i.id, chose: how === 'right' ? i.answer : other };
    }
    return { itemId: i.id, chose: how === 'right' ? i.answer : (i.answer + 1) % 4 };
  });

const perfect = scoreComprehension(S, answerAll(() => 'right'));
ok(perfect.correct === 40, 'everything right → forty', `${perfect.correct}/40`);
const nothing = scoreComprehension(S, answerAll(() => 'wrong'));
ok(nothing.correct === 0, 'everything wrong → zero', `${nothing.correct}`);

// THE ONE THAT MATTERS. Every typed answer doubled on its last letter — the
// shape of a real misspelling. A generous marker would score most of these.
const near = scoreComprehension(S, answerAll((n) => (S.items[n] && isCompletionItem(S.items[n]) ? 'near' : 'wrong')));
ok(near.correct === 0,
   'every typed answer misspelt by one letter → ZERO. Spelling is marked.',
   `${near.correct} of ${completion.length} typed answers were let through`);

const blanks = scoreComprehension(S, S.items.map((i) => ({ itemId: i.id, chose: isCompletionItem(i) ? '   ' : null })));
ok(blanks.answered === 0, 'whitespace typed into every box is not "answered"', `${blanks.answered}`);

console.log('\n9. The plan the backend renders from cannot drift from this file\n');
// The scripts live here, beside the questions asked about them. The renderer
// runs on a server that cannot import TypeScript, so a generated JSON copy
// ships with the backend — and a copy that nothing compares is a copy that
// will eventually differ. The French bank is why this check exists.
// Loaded the same way the French drift check loads its plan: a dynamic
// `node:fs` inside an async block, so the browser build never sees it. This
// file is a check script run with tsx and is never bundled, so the node
// import is correct here and the suppression is narrow.
// @ts-expect-error - node built-in, not in the browser type set
const fs = await import('node:fs');
const PLAN_PATH = '../selmapp/backend/scripts/ielts-listening-plan.json';
if (!fs.existsSync(PLAN_PATH)) {
  ok(false, 'the backend plan is missing', PLAN_PATH);
} else try {
  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8')) as Array<{ id: string; variety: string; speakers: number; body: string[]; narratorIntro: string; narratorOutro: string }>;
  ok(plan.length === S.recordings.length, 'the plan has one row per part', `${plan.length}`);
  let agree = 0;
  for (const r of S.recordings) {
    const row = plan.find((x) => x.id === r.id);
    if (!row) { ok(false, `${r.id}: missing from the plan`); continue; }
    const rebuilt = [row.narratorIntro, ...row.body, row.narratorOutro].join('\n');
    const same = rebuilt.trim() === r.script.trim()
      && row.variety === r.variety && row.speakers === (r.speakers ?? 1);
    if (same) agree++; else ok(false, `${r.id}: the plan and this file disagree`);
  }
  ok(agree === S.recordings.length, 'every part in the plan matches this file word for word', `${agree}/${S.recordings.length}`);
} catch (e) {
  ok(false, 'the backend plan could not be read', String(e).slice(0, 120));
}

console.log(bad === 0 ? '\nAll IELTS listening cases pass.\n' : `\n${bad} FAILED\n`);
if (bad) throw new Error(`${bad} IELTS listening case(s) failed`);
