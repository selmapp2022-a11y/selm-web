/**
 * The work list: every coordinate, thinnest first, with what it holds now.
 *
 *   npx tsx src/exam/engine/author/plan.run.ts
 *
 * This is what a sitting is authored against, and it is PRINTED FROM THE
 * DEFINITIONS at run time rather than written down — the same rule the Task 3
 * inventory follows, for the same reason: a hand-kept work list is stale the
 * first time somebody authors something and does not remember to cross it off.
 *
 * It counts QUESTIONS, because §B.1's cap is in questions and the inventory
 * prints questions. The one time those two units drifted, the row read "40
 * exists, 4 reachable" and both numbers were right.
 */
import { EXAMS } from '../../definitions';
import type { ComprehensionSection } from '../../model/types';
import { blueprintsFor, thinnestFirst } from './blueprint';

const bar = (n: number, cap: number, width = 12) => {
  const on = Math.max(0, Math.min(width, Math.round((n / Math.max(1, cap)) * width)));
  return '█'.repeat(on) + '·'.repeat(width - on);
};

console.log('\n' + '='.repeat(78));
console.log('  TASK 4 — WHAT TO AUTHOR NEXT.  Thinnest first, counted at run time.');
console.log('='.repeat(78));

let grandHave = 0;
let grandWant = 0;

for (const exam of EXAMS) {
  for (const s of exam.sections) {
    if (s.kind !== 'comprehension') continue;
    const section = s as ComprehensionSection;
    const list = thinnestFirst(blueprintsFor(exam, section));
    const have = list.reduce((n, b) => n + b.have, 0);
    const want = list.reduce((n, b) => n + b.want, 0);
    grandHave += have;
    grandWant += want;

    console.log(`\n■ ${exam.id} · ${section.skill}  —  ${have} questions now, ${want} at the cap`);
    console.log(`  ${bar(have, want, 30)}  ${((have / Math.max(1, want)) * 100).toFixed(0)}%`);
    console.log(`\n  coordinate                       have  want   passage words   questions`);
    console.log('  ' + '─'.repeat(72));
    for (const b of list) {
      const label = `${b.family} · ${b.level}`;
      console.log(
        `  ${label.padEnd(30)} ${String(b.have).padStart(4)}  ${String(b.want).padStart(4)}` +
        `   ${String(b.words.min).padStart(4)}–${String(b.words.max).padEnd(4)}` +
        `      ${b.questions.min}–${b.questions.max}` +
        (b.have === 0 ? '   ← empty' : b.have < b.want ? '   ← thin' : '   done'),
      );
    }
    const empty = list.filter((b) => b.have === 0).length;
    console.log(`\n  ${empty} of ${list.length} coordinates hold nothing.`);
    console.log(`  kinds this section supports: ${blueprintsFor(exam, section)[0]?.kinds.join(', ') || '—'}`);
  }
}

console.log('\n' + '='.repeat(78));
console.log(`  ACROSS BOTH EXAMS: ${grandHave} questions against a cap of ${grandWant}.`);
console.log('  Production skills are not counted here — a writing task is a prompt,');
console.log('  not a question, and mixing the two units is how a row becomes nonsense.');
console.log('='.repeat(78) + '\n');
