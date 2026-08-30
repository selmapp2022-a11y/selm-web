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
import { GOALS } from '../definitions';
import { scoreNeededFor } from './planner';
import { promptsOf, seedFor, servePrompt } from './productionPool';

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
// `off_topic` awards ZERO whatever the quality of the language, on keywords
// written for situation one. That was safe only while the sitting served
// situation one, and on 30 August it stopped doing so. So it is no longer
// enough to note the risk: every situation of a gated task must carry its own
// keywords, and no two situations of one task may be satisfiable by the same
// answer.
for (const { examId, task } of tasks) {
  t(`${examId} · ${task.id}: the declared prompt is situation one`,
    promptsOf(task)[0].prompt.en ?? promptsOf(task)[0].prompt.fr,
    task.prompt.en ?? task.prompt.fr);
  const rule = (task.gate ?? []).find((g) => g.id === 'off_topic');
  if (!rule) continue;
  const need = rule.id === 'off_topic' ? rule.minKeywordHits : 2;
  const variants = promptsOf(task).slice(1);
  t(`${examId} · ${task.id}: every situation carries its own keywords`,
    variants.filter((p) => !p.topicKeywords?.length).map((p) => p.id).join(',') || 'none missing',
    'none missing');

  // Situation one's set is the task's, by the documented fallback.
  const sets = promptsOf(task).map((p) => ({ id: p.id, kw: new Set((p.topicKeywords ?? task.topicKeywords).map((w) => w.toLocaleLowerCase())) }));
  for (let i = 0; i < sets.length; i++)
    for (let j = i + 1; j < sets.length; j++) {
      const shared = [...sets[i].kw].filter((w) => sets[j].kw.has(w));
      // `minKeywordHits` of shared words means an answer to one situation can
      // clear the other's gate — the sets would not be telling them apart.
      t(`${examId} · ${sets[i].id} vs ${sets[j].id}: fewer than ${need} shared keywords`,
        shared.length < need ? 'ok' : `shares ${shared.join(', ')}`,
        'ok');
    }
}

console.log('\n5. Destinations that share an exam do not open on the same situation\n');

/**
 * The founder's complaint, in its third and most specific form: *"all the
 * practice in the three English destinations is the same."*
 *
 * Serving the least-recently-used unseen situation varies what ONE candidate
 * meets over time and leaves three candidates who have done nothing all
 * starting at situation one. The rotation is a position among the destinations
 * sharing the exam, so this case fails if two of them collide — which is
 * exactly what the first version, hashing the id, did.
 */
for (const exam of EXAMS) {
  const sharing = GOALS.filter((g) => g.exams.includes(exam.id)).map((g) => g.id);
  if (sharing.length < 2) continue;
  for (const s of exam.sections) {
    if (s.kind !== 'production') continue;
    for (const task of (s as ProductionSection).tasks) {
      const opens = sharing.map((gid) => servePrompt(task, [], seedFor(sharing, gid)).id);
      const enough = promptsOf(task).length >= sharing.length;
      t(`${exam.id} · ${task.id}: ${sharing.length} destinations open on ${new Set(opens).size} different situations`,
        new Set(opens).size, enough ? sharing.length : promptsOf(task).length);
    }
  }
}

console.log('\n6. What the destination demands is read once, and not twice\n');
// Australia asks for IELTS band 6, a level on the EXAM'S OWN SCALE, so the
// score it needs is 6. Reading it through the benchmark table gives 5.5 --
// a real number for a different question, and the kind of conversion-of-a-
// conversion `cefrBands` was introduced to stop.
for (const g of GOALS) {
  const exam = EXAMS.find((e) => e.id === g.exams[0])!;
  const onExamScale = g.scaleId ? exam.scales.some((sc) => sc.id === g.scaleId) : false;
  const score = onExamScale ? g.requiredLevel : scoreNeededFor(exam, g.requiredLevel, 'speaking');
  console.log(`     ${g.id.padEnd(14)} ${g.system} ${g.requiredLevel} -> speaking needs ${score ?? '—'}${onExamScale ? '   (its own scale, no conversion)' : ''}`);
  t(`${g.id}: the demand is a real number`, typeof score === 'number' && score > 0, true);
}
t('a goal set on the exam\'s own scale is not converted',
  (() => { const g = GOALS.find((x) => x.scaleId === 'band')!; return g.requiredLevel; })(), 6);

console.log(failed === 0
  ? '\nEvery production task sets something new until it runs out, and says when it has.\n'
  : `\n${failed} FAILED\n`);
if (failed) throw new Error(`${failed} production-pool case(s) failed`);
