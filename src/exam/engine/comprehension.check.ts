/**
 * A runnable check on comprehension scoring — no judge, no network, no cost.
 *
 * Three things are asserted, and the third is the one that matters:
 *
 *   1. the bank is well formed, and the ÉPREUVE it serves is 39 questions
 *   2. counting works, and the difficulty profile reads the way it claims to
 *   3. **no scale score is produced, ever**, because the official conversion
 *      from correct answers to the TCF scale is unpublished and form-specific
 *
 *   npx tsc src/exam/engine/comprehension.check.ts --outDir /tmp/cc --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/cc/engine/comprehension.check.js
 */
import { TCF_CANADA } from '../definitions/tcf-canada';
import { serveEpreuve, scoreComprehension, governingLevel, type ItemAnswer } from './comprehension';
import type { ComprehensionSection } from '../model/types';
import { TCF_VARIETY_PLAN, TCF_VARIETY_SHARES } from '../definitions/tcf-variety-plan';
import { isChoiceItem, isCompletionItem, isMatchingItem } from '../model/types';
import { normalise } from './completion';

const sections = TCF_CANADA.sections.filter(
  (s): s is ComprehensionSection => s.kind === 'comprehension'
);

let bad = 0;
const ok = (cond: boolean, label: string, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${label}${detail ? '   ' + detail : ''}`);
};

console.log('1. The bank\n');
for (const s of sections) {
  // The BANK, and separately the ÉPREUVE. These were one number until
  // 2026-08-28, when growing the bank silently lengthened the exam.
  const epreuve = serveEpreuve(s);
  const declared = s.serve?.count ?? s.items.length;
  ok(s.items.length >= declared, `${s.id}: bank holds at least one épreuve`, `${s.items.length} in bank`);
  ok(epreuve.length === 39, `${s.id}: the épreuve presents 39 questions`, `${epreuve.length}`);
  if (s.serve)
    ok(
      Object.values(s.serve.byBand).reduce((a, b) => a + b, 0) === s.serve.count,
      `${s.id}: declared band profile sums to the declared length`,
    );
  // Two kinds of item now exist. The four-option checks below apply to the
  // choice items and are not weakened to accommodate the typed ones; the
  // typed ones get their own, which are stricter where it matters.
  const choice = s.items.filter(isChoiceItem);
  const completion = s.items.filter(isCompletionItem);
  ok(choice.every((i) => i.options.length === 4), `${s.id}: four options on every choice item`);
  ok(
    choice.every((i) => i.answer >= 0 && i.answer < i.options.length),
    `${s.id}: every key indexes a real option`
  );
  ok(new Set(s.items.map((i) => i.id)).size === s.items.length, `${s.id}: ids unique`);
  ok(choice.every((i) => new Set(i.options).size === 4), `${s.id}: no duplicate options`);
  if (completion.length) {
    ok(completion.every((i) => i.answer.accept.length > 0),
       `${s.id}: every completion item accepts at least one form`);
    // A cap that the accepted answer itself breaks would mark the key wrong.
    ok(completion.every((i) => i.answer.accept.every((a) => a.trim().split(/\s+/).length <= i.answer.maxWords)),
       `${s.id}: no accepted form is longer than its own word cap`);
    ok(completion.every((i) => i.prompt.includes('___')),
       `${s.id}: every completion item shows where the gap is`);
    // The marker is a whitelist, so two forms that normalise to the same
    // string are one form written twice — harmless, but it hides a typo.
    ok(completion.every((i) => new Set(i.answer.accept.map((a) => normalise(a, i.answer.caseSensitive === true))).size === i.answer.accept.length),
       `${s.id}: no accepted form is a duplicate of another`);
  }
  ok(s.recordings.every((r) => r.script.trim().length > 0), `${s.id}: no empty script`);
  // Every question names material that exists, and every piece of material is
  // asked about. A recording with no questions is dead weight; a question
  // pointing at nothing is a crash waiting for a candidate to find it.
  const recIds = new Set(s.recordings.map((r) => r.id));
  ok(s.items.every((i) => recIds.has(i.recordingId)), `${s.id}: every question names a real recording`);
  ok(
    s.recordings.every((r) => s.items.some((i) => i.recordingId === r.id)),
    `${s.id}: every recording is asked about`
  );
  ok(new Set(s.recordings.map((r) => r.id)).size === s.recordings.length, `${s.id}: recording ids unique`);
  // Progressive difficulty: the bands never go backwards down the list.
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const idx = s.recordings.map((r) => order.indexOf(r.level));
  ok(idx.every((v, n) => n === 0 || v >= idx[n - 1]), `${s.id}: difficulty never goes backwards`);
  // No item is answerable by picking the longest option every time.
  const longest = choice.filter(
    (i) => i.options.indexOf([...i.options].sort((a, b) => b.length - a.length)[0]) === i.answer
  ).length;
  // Was `longest <= items.length / 3`, a bar with no basis that the bank
  // happened to sit exactly on. With four options the longest one is the key
  // 25% of the time by chance, so the question is whether the excess is
  // beyond noise. n=57, p=0.25 → mean 14.3, sd 3.3; the bank was at 25,
  // z = 3.3, and twelve of the eighteen items written on 2026-08-28 were the
  // cause — at B1 and B2 the RIGHT answer is the nuanced one, and nuance
  // takes words, so a candidate reading no French could score by length.
  const expected = s.items.length * 0.25;
  const sd = Math.sqrt(s.items.length * 0.25 * 0.75);
  const z = (longest - expected) / sd;
  ok(z < 2, `${s.id}: "longest option" is not a strategy`, `${longest}/${s.items.length}  z=${z.toFixed(2)}`);
  // And no item is answerable by always picking the same position.
  const counts = [0, 1, 2, 3].map((n) => s.items.filter((i) => i.answer === n).length);
  const pe = s.items.length * 0.25;
  const psd = Math.sqrt(s.items.length * 0.25 * 0.75);
  const pz = (Math.max(...counts) - pe) / psd;
  ok(pz < 2.5, `${s.id}: no answer position dominates`, `${counts.join('/')}  z=${pz.toFixed(2)}`);
  console.log('');
}

console.log('2. Counting, and the difficulty profile\n');
const answerAll = (s: ComprehensionSection, f: (level: string, n: number) => boolean): ItemAnswer[] =>
  s.items.map((i, n) => {
    const right = f(i.level, n);
    if (isCompletionItem(i)) {
      // A deliberate near-miss for the wrong case: one letter changed. If the
      // marker were ever made generous this line alone would turn every
      // "everything wrong" case below into a pass.
      return { itemId: i.id, chose: right ? i.answer.accept[0] : `${i.answer.accept[0]}x` };
    }
    if (isMatchingItem(i)) {
      const g = s.matchingGroups?.find((x) => x.id === i.groupId);
      const other = g?.options.find((o) => o.id !== i.answer)?.id ?? 'ZZ';
      return { itemId: i.id, chose: right ? i.answer : other };
    }
    return { itemId: i.id, chose: right ? i.answer : (i.answer + 1) % 4 };
  });

for (const s of sections) {
  const perfect = scoreComprehension(s, answerAll(s, () => true));
  ok(perfect.correct === s.items.length, `${s.id}: everything right → every item`, `${perfect.correct}/${s.items.length}`);
  ok(perfect.held === 'C2' && perfect.breaksAt === null, `${s.id}: everything right → holds C2`);

  const none = scoreComprehension(s, answerAll(s, () => false));
  ok(none.correct === 0, `${s.id}: everything wrong → 0`, `${none.correct}`);
  ok(none.held === null && none.breaksAt === 'A1', `${s.id}: everything wrong → holds nothing`);

  // The realistic shape: solid to B1, falling apart at B2 and above.
  const upToB1 = scoreComprehension(
    s,
    answerAll(s, (level) => ['A1', 'A2', 'B1'].includes(level))
  );
  ok(upToB1.held === 'B1', `${s.id}: right through B1 → holds B1`, String(upToB1.held));
  ok(upToB1.breaksAt === 'B2', `${s.id}: → breaks at B2`, String(upToB1.breaksAt));
  console.log(
    `      worked example — ${s.id}: ${upToB1.correct}/${upToB1.total} correct, ` +
      `holds ${upToB1.held}, breaks at ${upToB1.breaksAt}`
  );
  console.log(
    '      by band: ' + upToB1.byBand.map((b) => `${b.band} ${b.correct}/${b.total}`).join('  ')
  );

  // Unanswered is not the same as wrong.
  const half = scoreComprehension(s, s.items.map((i, n) => ({
    itemId: i.id,
    chose: n < 20
      ? (isCompletionItem(i) ? i.answer.accept[0] : isMatchingItem(i) ? i.answer : i.answer)
      : null,
  })));
  ok(half.answered === 20, `${s.id}: unanswered items counted as unanswered`, `${half.answered}`);
  ok(half.correct === 20, `${s.id}: unanswered items are not correct`, `${half.correct}`);
  console.log('');
}

console.log('3. The scale score — which this product does not compute\n');
for (const s of sections) {
  const r = scoreComprehension(s, answerAll(s, () => true));
  ok(r.scaleScore === null, `${s.id}: a perfect paper still produces no scale score`);
  ok(r.scaleScoreReason.en.length > 0 && r.scaleScoreReason.fr.length > 0, `${s.id}: and says why, in both languages`);
}
console.log('');

console.log('4. The governing level is the lowest of the four\n');
ok(governingLevel([8, 8, 8, 5]).level === 5, 'NCLC 8, 8, 8, 5 → 5');
ok(governingLevel([7, 7, 7, 7]).level === 7, 'NCLC 7 across → 7');
const incomplete = governingLevel([8, 8, null, null]);
ok(incomplete.level === null && !incomplete.complete, 'two skills unknown → no governing level at all');
console.log(
  '\n      A sitting with an unknown skill does not report the lowest of the ones it has.' +
    '\n      That would show the candidate a better result than they hold.'
);


// ── The audio bank ────────────────────────────────────────────────────────
console.log('\n5. The audio bank\n');
for (const s of sections) {
  if (!s.delivery.audioPlaysOnce) continue;
  const withAudio = s.recordings.filter((r) => r.audioPath).length;
  ok(withAudio === s.recordings.length, `${s.id}: every recording has audio`, `${withAudio}/${s.recordings.length}`);
  ok(
    s.recordings.every((r) => !r.audioPath || /^[a-z0-9-]+\/[a-z0-9-]+\.mp3$/.test(r.audioPath)),
    `${s.id}: every path is a store path, not a hardcoded URL`
  );
  // Two RECORDINGS sharing a file is a bug. Two QUESTIONS sharing a recording
  // is the point — IELTS asks ten of them about one five-minute part.
  ok(
    new Set(s.recordings.map((r) => r.audioPath)).size === s.recordings.length,
    `${s.id}: no two recordings share a file`
  );
  // Every recording with audio SAYS what variety it is spoken in. `unknown` is
  // an honest answer and passes; a missing field does not, because that is how
  // 39 French files came to exist with their variety recorded nowhere — not in
  // the definition, not in the mp3 tags, and not recoverable from the vendor.
  const noVariety = s.recordings.filter((r) => r.audioPath && !r.variety).map((r) => r.id);
  ok(noVariety.length === 0, `${s.id}: every recording declares its variety`,
     noVariety.length ? noVariety.slice(0, 5).join(', ') : 'all declared');
  const unknown = s.recordings.filter((r) => r.variety === 'unknown').length;
  if (unknown) {
    console.log(`      ${s.id}: ${unknown} recording(s) declare variety 'unknown' — established by listening, not by guessing`);
  }

  // A rendered recording says WHO spoke it, and the request it answered.
  //
  // `variety` says what a recording is supposed to be. `voice` says what was
  // asked for and what answered. Ruled 29 August 2026: *"Record the voice
  // used, per recording. The current bank cannot say, and that is the defect
  // underneath this one."*
  //
  // Not yet an assertion. Every recording that exists today predates the
  // field, so failing on it would fail the whole bank for a fact that could
  // not have been recorded. It becomes `ok(...)` the moment the re-render
  // lands — the first bank produced under the new casting has no excuse.
  const noVoice = s.recordings.filter((r) => r.audioPath && !r.voice).map((r) => r.id);
  if (noVoice.length) {
    console.log(
      `      ${s.id}: ${noVoice.length} rendered recording(s) do not say which voice spoke them ` +
      `— pre-dates the field; re-render fills it`,
    );
  }

  // And when it IS recorded, the substitution check is one comparison. This is
  // the failure the field exists to catch: the account holds no voice of the
  // requested accent, the renderer quietly uses another, and the file plays
  // perfectly in the wrong variety.
  const substituted = s.recordings
    .filter((r) => r.voice?.requestedVariety && r.variety && r.voice.requestedVariety !== r.variety)
    .map((r) => `${r.id}: asked ${r.voice!.requestedVariety}, got ${r.variety}`);
  ok(substituted.length === 0, `${s.id}: no recording was rendered in a variety other than the one asked for`,
     substituted.length ? substituted.slice(0, 5).join(' | ') : 'none substituted');
}

console.log(bad === 0 ? '\nAll comprehension cases pass.' : `\n${bad} FAILURES`);
if (bad !== 0) throw new Error(`${bad} comprehension cases failed`);

// ── The variety plan for the re-render ──────────────────────────────────────
//
// Checked here rather than at render time, because a plan that fails its own
// shares is a defect in a table someone can read — and the alternative is
// discovering it after 39 files have been paid for and shipped.
{
  console.log('\n6. The variety plan for the 39 French recordings\n');
  const plan = TCF_VARIETY_PLAN;
  const shares = TCF_VARIETY_SHARES;

  ok(plan.length === 39, 'the plan covers all 39 recordings', `${plan.length}`);

  const counted: Record<string, number> = {};
  for (const a of plan) counted[a.variety] = (counted[a.variety] ?? 0) + 1;
  const matches = Object.entries(shares).every(([v, n]) => counted[v] === n);
  ok(matches, 'the plan realises the shares FRENCH_VARIETY_MIX asks for',
     Object.entries(counted).map(([v, n]) => `${v} ${n}`).join(', '));

  // The majority must actually BE the majority — 'majority' in the mix is a
  // claim about what a candidate hears, not a label on the biggest bucket.
  const intl = counted['international'] ?? 0;
  ok(intl > 39 / 2, 'international is a real majority, not merely the largest share',
     `${intl}/39`);

  // Belgian has no female voice on the account, so it cannot carry a dialogue.
  const badBelgian = plan.filter((a) => a.variety === 'belgian' && a.speakers > 1);
  ok(badBelgian.length === 0, 'Belgian is never assigned to a two-speaker recording',
     badBelgian.length ? badBelgian.map((a) => a.id).join(', ') : 'none');

  // And the one the first attempt got wrong: variety must not track difficulty.
  const bands = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
  const intlPerBand = bands.map((b) => plan.filter((a) => a.level === b && a.variety === 'international').length);
  ok(intlPerBand.every((n) => n > 0), 'the majority variety appears in every band',
     bands.map((b, i) => `${b}:${intlPerBand[i]}`).join(' '));
  const minorityBands = new Set(plan.filter((a) => a.variety !== 'international').map((a) => a.level));
  ok(minorityBands.size >= 5, 'minority varieties are not confined to the hard bands',
     `${minorityBands.size}/6 bands carry a minority variety`);

  // Every id in the plan is a real recording, and every recording is planned.
  // The plan covers the LISTENING bank only — the reading section has
  // recordings too (passages), and they have no variety to be spoken in.
  const listening = sections.filter((s) => s.skill === 'listening');
  const bankIds = new Set(listening.flatMap((s) => s.recordings.map((r) => r.id)));
  const planIds = new Set(plan.map((a) => a.id));
  ok([...planIds].every((id) => bankIds.has(id)), 'every planned id is a real recording');
  ok([...bankIds].every((id) => planIds.has(id)), 'every recording in the bank is planned');
}

// The committed copy the backend renders from must still be this table.
//
// The re-render runs on the server, so the plan is committed into
// selmapp/backend/scripts/. Two copies of a decision is a drift waiting to
// happen — and the drift would be invisible, because both files would still
// parse and the wrong one would still render 39 perfectly good files.
{
  // tsconfig lists only `vite/client` in `types`, because this project is a
  // browser bundle and pulling node types into it would let a component import
  // `fs` and typecheck. This file is a check script run with tsx, never bundled
  // — so the node import is correct here and the suppression is narrow.
  // @ts-expect-error - node built-in, not in the browser type set
  const fs = await import('node:fs');
  const path = '../selmapp/backend/scripts/tcf-variety-plan.json';
  if (fs.existsSync(path)) {
    const shipped = JSON.parse(fs.readFileSync(path, 'utf-8')) as Array<{ id: string; variety: string }>;
    const here = new Map(TCF_VARIETY_PLAN.map((a) => [a.id, a.variety]));
    const drift = shipped.filter((r) => here.get(r.id) !== r.variety);
    ok(shipped.length === TCF_VARIETY_PLAN.length && drift.length === 0,
       'the plan the backend renders from matches this table',
       drift.length ? drift.map((r) => r.id).join(', ') : `${shipped.length} rows agree`);
  } else {
    console.log('      (backend copy not present in this checkout — skipped)');
  }
}
