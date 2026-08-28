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

const setPlan = (examId: string | null, locale?: string) => {
  if (!examId) { mem.delete(PLAN_KEY); return; }
  mem.set(PLAN_KEY, JSON.stringify({ goalId: 'g', examId, examDate: null, examLocale: locale }));
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
})();
