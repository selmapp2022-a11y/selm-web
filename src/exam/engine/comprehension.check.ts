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
  ok(s.items.every((i) => i.options.length === 4), `${s.id}: four options on every item`);
  ok(
    s.items.every((i) => i.answer >= 0 && i.answer < i.options.length),
    `${s.id}: every key indexes a real option`
  );
  ok(new Set(s.items.map((i) => i.id)).size === s.items.length, `${s.id}: ids unique`);
  ok(s.items.every((i) => new Set(i.options).size === 4), `${s.id}: no duplicate options`);
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
  const longest = s.items.filter(
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
  s.items.map((i, n) => ({ itemId: i.id, chose: f(i.level, n) ? i.answer : (i.answer + 1) % 4 }));

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
  const half = scoreComprehension(s, s.items.map((i, n) => ({ itemId: i.id, chose: n < 20 ? i.answer : null })));
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
}

console.log(bad === 0 ? '\nAll comprehension cases pass.' : `\n${bad} FAILURES`);
if (bad !== 0) throw new Error(`${bad} comprehension cases failed`);
