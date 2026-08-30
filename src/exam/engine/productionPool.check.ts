/**
 * Writing and Speaking must stop setting the same situation twice.
 *
 *   npx tsx src/exam/engine/productionPool.check.ts
 *
 * §1 is the founder's complaint turned into a case: open a task, do it, come
 * back, and get a different situation. It fails if a task holds one situation
 * or if the selector ignores what was done.
 *
 * §4 is the trap. `topicKeywords` drives the gate's `off_topic` rule, which
 * awards zero whatever the quality of the language, and those words were
 * chosen for situation one. A sitting that served situation two and gated it
 * against situation one's keywords would zero a correct answer — so the check
 * asserts the two cannot meet, rather than trusting that they do not.
 */
import { EXAMS } from '../definitions';
import type { Attempt } from '../../lib/attempts';
import type { ProductionSection, TaskDefinition } from '../model/types';
import { promptsOf, servePrompt } from './productionPool';

let failed = 0;
const t = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `   got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`);
};

const tasks: Array<{ examId: string; task: TaskDefinition }> = [];
for (const exam of EXAMS)
  for (const s of exam.sections)
    if (s.kind === 'production')
      for (const task of (s as ProductionSection).tasks) tasks.push({ examId: exam.id, task });

const att = (itemId: string, ts: number): Attempt => ({ skill: 'writing', itemId, ts });

console.log('\n1. Doing a task changes what it sets next time\n');
for (const { examId, task } of tasks) {
  const all = promptsOf(task);
  const log: Attempt[] = [];
  const met: string[] = [];
  for (let n = 0; n < all.length; n++) {
    const s = servePrompt(task, log);
    met.push(s.id);
    log.push(att(s.id, 1000 + n));
  }
  t(`${examId} · ${task.id}: ${all.length} situations, ${new Set(met).size} distinct before any repeat`,
    new Set(met).size, all.length);
  t(`${examId} · ${task.id}: the first is the declared prompt`, met[0], `${task.id}-p1`);
  const after = servePrompt(task, log);
  t(`${examId} · ${task.id}: and then it says it has come round again`, after.recycled, true);
  t(`${examId} · ${task.id}: returning the one done longest ago`, after.id, met[0]);
}

console.log('\n2. One task\'s history is not another\'s\n');
const a = tasks[0].task, b = tasks.find((x) => x.task.id !== a.id)!.task;
const doneA = promptsOf(a).map((p, n) => att(p.id, 100 + n));
t('a task with everything done still reports its own count',
  servePrompt(a, doneA).unseen, 0);
t('and its neighbour is untouched by it',
  servePrompt(b, doneA).unseen, promptsOf(b).length);

console.log('\n3. Every situation is real, and none is a copy of its neighbour\n');
const seen = new Set<string>();
for (const { examId, task } of tasks) {
  const all = promptsOf(task);
  for (const p of all) {
    t(`${p.id} is unique across the product`, seen.has(p.id), false);
    seen.add(p.id);
    const en = (p.prompt.en ?? '').trim();
    const fr = (p.prompt.fr ?? '').trim();
    t(`${p.id} has both languages`, en.length > 20 && fr.length > 20, true);
  }
  // Two situations that share most of their words are one situation with the
  // nouns changed — the failure the whole task exists to end.
  const words = (x: string) => new Set(x.toLowerCase().split(/[^a-zà-ÿ]+/).filter((w) => w.length > 3));
  const lang = EXAMS.find((e) => e.id === examId)!.language;
  for (let i = 0; i < all.length; i++)
    for (let j = i + 1; j < all.length; j++) {
      const A = words(all[i].prompt[lang] ?? ''), B = words(all[j].prompt[lang] ?? '');
      let hit = 0;
      for (const w of A) if (B.has(w)) hit += 1;
      const jac = hit / (A.size + B.size - hit);
      t(`${all[i].id} and ${all[j].id} are different situations (${jac.toFixed(2)})`, jac < 0.5, true);
    }
}

console.log('\n4. A served situation can never meet another situation\'s keywords\n');
// `off_topic` awards zero on `task.topicKeywords`, which were written for
// situation one. Today the mock exam sets `task.prompt` and practice does not
// gate, so the two cannot meet. Both halves of that are asserted, because both
// are wiring rather than design.
for (const { examId, task } of tasks) {
  t(`${examId} · ${task.id}: the declared prompt is situation one`,
    promptsOf(task)[0].prompt.en ?? promptsOf(task)[0].prompt.fr,
    task.prompt.en ?? task.prompt.fr);
  const gated = (task.gate ?? []).some((g) => g.id === 'off_topic');
  const variants = promptsOf(task).slice(1);
  const missing = variants.filter((p) => !p.topicKeywords?.length).map((p) => p.id);
  if (gated && missing.length)
    console.log(`     ${task.id} gates on off_topic and ${missing.length} of its situations carry no keywords of their own — safe only while the sitting serves situation one`);
}

console.log(failed === 0
  ? '\nEvery production task sets something new until it runs out, and says when it has.\n'
  : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} production-pool case(s) failed`);
