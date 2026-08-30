/**
 *   npx tsc src/exam/engine/practiceTasks.check.ts --outDir /tmp/pt --module commonjs \
 *     --target es2020 --moduleResolution node --skipLibCheck --esModuleInterop
 *   node /tmp/pt/exam/engine/practiceTasks.check.js
 *
 * The nine hard-coded strings are gone; this shows what stands in their
 * place, for both exams, without a browser and without a network.
 */
import { practiceTasksFor, pronunciationLinesFor } from '../../lib/practiceTasks';
import { PLAN_KEY } from '../model/plan';

// Minimal localStorage so the plan can be set from node.
const mem = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, v); },
  removeItem: (k: string) => { mem.delete(k); },
};
(globalThis as any).window = { dispatchEvent() {}, addEventListener() {} };
(globalThis as any).CustomEvent = class { constructor(public type: string) {} };

const setPlan = (examId: string | null, locale?: string, goalId = 'g') => {
  if (!examId) { mem.delete(PLAN_KEY); return; }
  mem.set(PLAN_KEY, JSON.stringify({ goalId, examId, examDate: null, examLocale: locale }));
};

let failed = 0;
const must = (ok: boolean, what: string) => {
  if (!ok) { failed += 1; console.log(`  FAIL  ${what}`); }
};

(async () => {
  console.log('NO EXAM CHOSEN');
  setPlan(null);
  console.log('  practiceTasksFor(writing) ->', await practiceTasksFor('writing'));
  console.log('  pronunciationLinesFor()   ->', await pronunciationLinesFor());
  console.log('  (null is the point: a visible gap, not four generic templates)\n');

  for (const [id, locale] of [['tcf-canada', 'fr-CA'], ['ielts-gt', 'en-GB']] as const) {
    setPlan(id, locale);
    for (const skill of ['writing', 'speaking'] as const) {
      const set = await practiceTasksFor(skill);
      console.log(`${id} · ${skill}: ${set?.tasks.length ?? 0} task(s), language ${set?.lang}`);
      for (const t of set?.tasks ?? []) {
        console.log(`   ${t.title.padEnd(10)} ${String(t.words ?? '—').padEnd(18)} ${Math.round(t.timeLimitSec / 60)} min${t.timeIsOurs ? ' (ours)' : ''}   zero-rules: ${t.zeroRules.length}`);
        console.log(`     "${t.instruction.slice(0, 96)}${t.instruction.length > 96 ? '…' : ''}"`);
      }
    }
    const lines = await pronunciationLinesFor();
    console.log(`${id} · pronunciation lines: ${lines?.lines.length} in ${lines?.lang}`);
    if (lines?.lines[0]) console.log(`     "${lines.lines[0].slice(0, 96)}"`);
    console.log('');
  }

  // ── THE FOUNDER'S COMPLAINT, MEASURED ────────────────────────────────────
  //   "the speaking practice is the same in all three English destinations"
  // It was: the read-aloud line came from `task.prompt` alone and nothing in
  // the function knew which destination the candidate was sitting for. Both
  // are now false, and this is where that is checked rather than asserted.
  console.log('PRONUNCIATION — THREE ENGLISH DESTINATIONS');
  const firsts = new Map<string, string>();
  for (const goalId of ['ee-english', 'citizenship', 'au-competent']) {
    setPlan('ielts-gt', 'en-GB', goalId);
    const r = await pronunciationLinesFor();
    const first = r?.lines[0] ?? '';
    firsts.set(goalId, first);
    console.log(`  ${goalId.padEnd(13)} ${r?.lines.length} lines · "${first.slice(0, 70)}…"`);
  }
  must(new Set(firsts.values()).size === 3, 'three destinations, three different first lines');

  // Same LIST though — the sentences are not banded, and inventing a level
  // difference the exam does not make is the mistake refused in productionPool.
  setPlan('ielts-gt', 'en-GB', 'ee-english');
  const a = (await pronunciationLinesFor())!.lines;
  setPlan('ielts-gt', 'en-GB', 'citizenship');
  const b = (await pronunciationLinesFor())!.lines;
  must(a.length === b.length, 'the same list, rotated — not a different list');
  must([...a].sort().join('|') === [...b].sort().join('|'), 'rotation only, no sentence added or dropped');

  // Every situation is read, not only the declared one. Task 4 tripled the
  // situations; before this change the count did not move.
  must(a.length > 6, `more than the six declared prompts could yield (got ${a.length})`);

  console.log(failed ? `\n${failed} FAILED` : '\nall assertions pass');
  if (failed) throw new Error(`${failed} practice-task case(s) failed`);
})();
