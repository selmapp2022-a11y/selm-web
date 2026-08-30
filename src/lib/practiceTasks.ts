/**
 * The practice surfaces, fed from the candidate's own exam.
 *
 * Amendment 2 §2.2: *"Four writing templates, five pronunciation sentences,
 * three IELTS prompts. All nine measured still shipping today, and not one
 * mentions a tâche, a word band or a clock. Every practice surface
 * generates against the candidate's actual exam and task."*
 *
 * The nine were not merely English — they were **unrelated to any exam**.
 * A TCF Canada candidate practising *"write a cover letter for a software
 * engineer position"* is practising something the exam does not ask for,
 * in a language it is not set in, with no word band and no clock.
 *
 * **Loaded lazily, and that is not an optimisation.** The exam definitions
 * carry ~72 000 characters of authored French. Importing them statically
 * would put all of it in the app's first paint for every user, including
 * those who never open a practice page. `import()` puts it in its own chunk
 * that arrives when a practice page does.
 */
import { loadPlan } from '../exam/model/plan';
import type { Attempt } from './attempts';
import { seedFor, servePrompt, type ServedPrompt } from '../exam/engine/productionPool';
import { scoreNeededFor } from '../exam/engine/planner';
import type { LanguageCode, TaskDefinition } from '../exam/model/types';

export type PracticeTask = {
  id: string;
  /** e.g. "Tâche 3" — the exam's own name for it, not ours. */
  title: string;
  /** What the candidate is asked to do. */
  instruction: string;
  /** The material, where the task supplies any. */
  prompt: string;
  /**
   * WHICH situation this is, and how many the task holds.
   *
   * A task used to be one situation, so an attempt recorded the task and the
   * screen had nothing to count. It now serves the least-recently-used unseen
   * situation, so the attempt records the SITUATION — a candidate who has
   * written Tâche 1 three times has met three different letters, and the two
   * facts are not the same.
   */
  promptId: string;
  promptsTotal: number;
  promptsUnseen: number;
  /** True when every situation has been met and the pool came round again. */
  promptsRecycled: boolean;
  /** "120 to 180 words" — the exam's band, stated because it is markable. */
  words: string | null;
  /** Seconds. Tâche times are ours where the body publishes only a total. */
  timeLimitSec: number;
  /** True when the time above is our apportionment rather than the exam's. */
  timeIsOurs: boolean;
  /**
   * The rules that award nothing, whatever the quality of the language.
   *
   * This replaces the five-step "structure guide" the old templates carried,
   * and it is a better panel because it is the exam's, not ours. Part 3's
   * replacement §2 says exactly what a task page should show: *"what it
   * demands · the word band and the clock · the errors that score zero
   * regardless of language ability."* Two of those three were already here;
   * this is the third.
   */
  zeroRules: Array<{ label: string; detail: string }>;
  lang: LanguageCode;
};

export type PracticeSet = {
  examId: string;
  examName: string;
  lang: LanguageCode;
  tasks: PracticeTask[];
  /**
   * What this candidate's destination actually demands of this skill, said in
   * the exam's own units.
   *
   * ── Why this is on the screen ───────────────────────────────────────────
   * The founder, about Speaking: *"the practice is the same in all three
   * English destinations."* It was, and the deeper reason is that a Part 1
   * question IS the same question whether you need band 5 or band 8 — the
   * exam does not band its prompts, and pretending it does would be inventing
   * a difference to make a screen look personalised.
   *
   * What genuinely differs is the DEMAND. CLB 9 needs band 7.0 in speaking;
   * CLB 4 needs 4.0. Same question, and a sufficient answer to it is not
   * remotely the same thing. That is the exam's own difference, it is
   * checkable against the published chart, and it was nowhere on the page.
   */
  need: { system: string; level: number; score: number | null; onExamScale: boolean } | null;
};

function toPractice(t: TaskDefinition, lang: LanguageCode, served: ServedPrompt): PracticeTask {
  return {
    id: t.id,
    title: t.name[lang],
    instruction: t.instruction[lang],
    prompt: served.prompt[lang],
    promptId: served.id,
    promptsTotal: served.total,
    promptsUnseen: served.unseen,
    promptsRecycled: served.recycled,
    words: t.wordGuidance ? t.wordGuidance[lang] : null,
    timeLimitSec: t.timeLimitSec,
    timeIsOurs: Boolean(t.timeLimitApportioned),
    zeroRules: (t.gate ?? [])
      .filter((g) => g.verdict.kind === 'zero')
      .map((g) => ({ label: g.verdict.label[lang], detail: g.verdict.detail[lang] })),
    lang,
  };
}

/**
 * The production tasks of one skill, for the exam the candidate chose.
 *
 * Returns null when no exam has been chosen yet — a real state, and the
 * caller shows the choice rather than inventing a task. Amendment 1 §6: a
 * visible gap is a better failure than a plausible generic answer.
 */
export async function practiceTasksFor(
  skill: 'writing' | 'speaking',
  /**
   * The candidate's attempt log, passed in rather than read here.
   *
   * It was read here for about ten minutes, and two engine checks went red:
   * `lib/attempts` imports the API client, which reads `import.meta.env`, so
   * every check that touched this module needed a browser to run. A module
   * that decides which situation to set should not drag an HTTP client behind
   * it — and passing the log in also makes the choice reproducible, which is
   * what let `productionPool.check.ts` be written at all.
   */
  attempts: readonly Attempt[] = [],
): Promise<PracticeSet | null> {
  const plan = loadPlan();
  if (!plan?.examId) return null;
  const defs = await import('../exam/definitions');
  const exam = defs.EXAMS.find((e) => e.id === plan.examId);
  if (!exam) return null;
  const lang = exam.language;
  const goal = defs.goalById(plan.goalId);
  // The destinations that sit this same exam, in declaration order. The
  // rotation is a position among them, so three destinations take three
  // different starts by construction — see `seedFor`.
  const sharing = defs.GOALS.filter((g) => g.exams.includes(exam.id)).map((g) => g.id);
  const seed = seedFor(sharing, plan.goalId);
  const tasks: PracticeTask[] = [];
  for (const s of exam.sections) {
    if (s.kind !== 'production' || s.skill !== skill) continue;
    // Each task chooses its own situation from what this candidate has done,
    // starting from a point that depends on the destination.
    for (const t of s.tasks) tasks.push(toPractice(t, lang, servePrompt(t, attempts, seed)));
  }
  // WHAT THE DESTINATION DEMANDS, and a conversion that must not be made
  // twice. Australia asks for IELTS band 6 — a level on the EXAM'S OWN SCALE —
  // so the score it needs is 6, not the band that earns CLB 6. Reading it
  // through the benchmark table produced 5.5, which is a real number for a
  // different question. `GoalPage` already draws this distinction; it is drawn
  // the same way here rather than differently.
  const onExamScale = goal?.scaleId ? exam.scales.some((sc) => sc.id === goal.scaleId) : false;
  const need = goal
    ? {
        system: goal.system,
        level: goal.requiredLevel,
        score: onExamScale ? goal.requiredLevel : scoreNeededFor(exam, goal.requiredLevel, skill),
        onExamScale,
      }
    : null;
  return { examId: exam.id, examName: exam.name[lang], lang, tasks, need };
}

/**
 * Sentences to read aloud for pronunciation, in the exam's language.
 *
 * The five that were here were English CEFR specimens — *"Climate change is
 * one of the most pressing issues of our generation"* — and belonged to no
 * exam. **These come from the exam's own task instructions**, which are
 * real sentences in the right language, written for this candidate's exam,
 * and already reviewed as part of the definition.
 *
 * It is a stopgap and says so: §2.2's own wording is that every surface
 * should GENERATE against the exam, and generation needs a model key, which
 * is not bound. What this removes is the English hard-coding. What it does
 * not do is make the sentences varied — the exam supplies six, not sixty.
 */
export async function pronunciationLinesFor(): Promise<{ lang: LanguageCode; lines: string[] } | null> {
  const plan = loadPlan();
  if (!plan?.examId) return null;
  const defs = await import('../exam/definitions');
  const exam = defs.EXAMS.find((e) => e.id === plan.examId);
  if (!exam) return null;
  const lang = exam.language;
  const lines: string[] = [];
  // Rubric sentences make poor read-aloud material — "You should spend about
  // 20 minutes on this task" is an instruction about the exam, not a sentence
  // of the language. Prompts are prose; instructions are rubric. Take the
  // prose first and drop anything that is plainly counting words or minutes.
  const RUBRIC = /\b(\d+\s*(words|mots|minutes?)|at least|au moins|environ|spend about)\b/i;
  const take = (text: string) => {
    for (const sentence of text.split(/(?<=[.!?])\s+|\n+/)) {
      const clean = sentence.trim().replace(/^[—–-]\s*/, '');
      if (clean.length < 40 || clean.length > 220) continue;
      if (RUBRIC.test(clean)) continue;
      if (!lines.includes(clean)) lines.push(clean);
    }
  };
  for (const s of exam.sections) {
    if (s.kind !== 'production') continue;
    for (const t of s.tasks) take(t.prompt[lang]);
  }
  if (lines.length === 0) {
    for (const s of exam.sections) {
      if (s.kind !== 'production') continue;
      for (const t of s.tasks) take(t.instruction[lang]);
    }
  }
  return { lang, lines };
}


/**
 * The comprehension half of the curriculum — Amendment 2 §2.4.
 *
 * Expression has six named tâches because the exam names them. Comprehension
 * had nothing, so half the exam could not be planned or prescribed against.
 * The unit here is the item-type family, declared on the section as data.
 *
 * Returns the counts as well as the names, because §4.1 builds
 * **thinnest-first** and a family with two items at a level is a hole the
 * planner has to be able to see.
 */
export type FamilyCoverage = {
  id: string;
  label: string;
  describes: string;
  provenance: string;
  total: number;
  /** CEFR band -> how many items of this family sit there. */
  byLevel: Record<string, number>;
};

export async function comprehensionFamiliesFor(
  skill: 'listening' | 'reading',
): Promise<{ lang: LanguageCode; families: FamilyCoverage[]; unassigned: number } | null> {
  const plan = loadPlan();
  if (!plan?.examId) return null;
  const defs = await import('../exam/definitions');
  const exam = defs.EXAMS.find((e) => e.id === plan.examId);
  if (!exam) return null;
  const lang = exam.language;
  for (const sec of exam.sections) {
    if (sec.kind !== 'comprehension' || sec.skill !== skill) continue;
    const fams = sec.families ?? [];
    const out: FamilyCoverage[] = fams.map((f) => ({
      id: f.id,
      label: f.label[lang],
      describes: f.describes[lang],
      provenance: f.provenance[lang],
      total: 0,
      byLevel: {},
    }));
    // Coverage is counted in RECORDINGS, matching what the planner schedules.
    let unassigned = 0;
    for (const r of sec.recordings) {
      const row = out.find((f) => f.id === r.family);
      if (!row) { unassigned += 1; continue; }
      row.total += 1;
      row.byLevel[r.level] = (row.byLevel[r.level] ?? 0) + 1;
    }
    return { lang, families: out, unassigned };
  }
  return null;
}

/**
 * The plan's exam name, in the exam's own language, for a practice heading.
 *
 * The comprehension pages need only this from the exam; `practiceTasksFor`
 * would build the whole task list to hand back one string.
 */
export async function examNameForPractice(): Promise<string | null> {
  const plan = loadPlan();
  if (!plan?.examId) return null;
  const defs = await import('../exam/definitions');
  const exam = defs.EXAMS.find((e) => e.id === plan.examId);
  if (!exam) return null;
  return exam.name[exam.language] ?? exam.name.en;
}
