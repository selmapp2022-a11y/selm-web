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
import type { LanguageCode, TaskDefinition } from '../exam/model/types';

export type PracticeTask = {
  id: string;
  /** e.g. "Tâche 3" — the exam's own name for it, not ours. */
  title: string;
  /** What the candidate is asked to do. */
  instruction: string;
  /** The material, where the task supplies any. */
  prompt: string;
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
};

function toPractice(t: TaskDefinition, lang: LanguageCode): PracticeTask {
  return {
    id: t.id,
    title: t.name[lang],
    instruction: t.instruction[lang],
    prompt: t.prompt[lang],
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
export async function practiceTasksFor(skill: 'writing' | 'speaking'): Promise<PracticeSet | null> {
  const plan = loadPlan();
  if (!plan?.examId) return null;
  const defs = await import('../exam/definitions');
  const exam = defs.EXAMS.find((e) => e.id === plan.examId);
  if (!exam) return null;
  const lang = exam.language;
  const tasks: PracticeTask[] = [];
  for (const s of exam.sections) {
    if (s.kind !== 'production' || s.skill !== skill) continue;
    for (const t of s.tasks) tasks.push(toPractice(t, lang));
  }
  return { examId: exam.id, examName: exam.name[lang], lang, tasks };
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
