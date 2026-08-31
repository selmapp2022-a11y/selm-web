import { create } from 'zustand';
import type {
  ComprehensionSection,
  ExamDefinition,
  Goal,
  LanguageCode,
  ProductionSection,
  Response,
  TaskDefinition,
} from './model/types';
import type { ScoreResult } from './engine/score';
import { EXAMS, GOALS } from './definitions';
import { loadHistory, saveHistory, type SittingRecord } from './model/history';
import { loadPlan, savePlan } from './model/plan';

export type { SittingRecord } from './model/history';

/**
 * A sitting in progress.
 *
 * Persisted, and that is not a nicety. A candidate who loses their connection
 * forty minutes into a mock exam and loses the mock will not come back, and
 * this population is concentrated in places with unreliable connectivity —
 * the same reason the offline exam exists in the plan.
 */
export type Sitting = {
  examId: string;
  /** Section ids in the exam's own order. */
  order: string[];
  /** Index into `order`. A section once left cannot be returned to. */
  at: number;
  /** Epoch ms the current section started, for the section clock. */
  sectionStartedAt: number;
  /**
   * Answers by section id, then by item id.
   *
   * `number` is an option index, `string` is what the candidate typed on a
   * completion item, `null` is unanswered. Widened on 29 August 2026 when
   * IELTS Listening's completion items arrived; every stored sitting written
   * before then holds numbers and nulls and reads back unchanged.
   */
  answers: Record<string, Record<string, number | string | null>>;
  /** Section ids already submitted. */
  submitted: string[];
  /**
   * Recordings already played, by recording id.
   *
   * Ruling 2, and it is a fairness ruling rather than a mechanism. The played
   * flag used to be component state keyed on the question, so a reload gave
   * the candidate the recording again — and, once a recording carries ten
   * questions, moving between them did too.
   *
   * It lives in the sitting so that it survives a reload AND a device change.
   * But it records that the recording was PLAYED, not that the page was
   * LOADED. A reload is usually not a candidate seeking a second listen; it
   * is a dropped connection, and this product's priority market sits on
   * unreliable connectivity. If a reload cost the recording, the first
   * candidate whose connection drops mid-part loses their mock and does not
   * come back — a worse failure than an unearned advantage, and one that
   * punishes exactly the people the product exists for.
   *
   * So: once per sitting, not once per page load. Already played means resume
   * at the questions. "Heard once" means once. It does not mean zero.
   */
  playedRecordings: string[];
  /**
   * The PAPER this sitting is running, by section id, in the order served.
   *
   * Recorded because `serveEpreuve` now draws from a memory that advances
   * (`model/epreuve.ts`), and a draw that advances must happen ONCE per
   * sitting. Without this, a candidate who reloaded forty minutes into a
   * section — the exact case `playedRecordings` exists for — would be handed
   * a different set of documents inside the same clock, with the answers they
   * had already given attached to questions that were no longer on the paper.
   *
   * A sitting stored before this field existed reads back with an empty
   * record and draws its paper on the next render, which is what it was doing
   * every render before.
   */
  papers: Record<string, string[]>;
};

const SITTING_KEY = 'selm_exam_sitting_v1';

const loadSitting = (): Sitting | null => {
  try {
    const raw = localStorage.getItem(SITTING_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Sitting;
    // A sitting saved before `playedRecordings` existed is still a sitting.
    // Treating it as unplayable, or crashing on it, would end a mock that was
    // already in progress when the app updated underneath the candidate.
    if (!Array.isArray(v.playedRecordings)) v.playedRecordings = [];
    if (!v.papers || typeof v.papers !== 'object') v.papers = {};
    return v;
  } catch {
    return null;
  }
};

const saveSitting = (s: Sitting | null) => {
  try {
    if (s) localStorage.setItem(SITTING_KEY, JSON.stringify(s));
    else localStorage.removeItem(SITTING_KEY);
  } catch {
    /* a sitting that cannot be saved still runs; it just will not survive a reload */
  }
};

type ExamState = {
  exam: ExamDefinition;
  taskId: string;
  goal: Goal;
  /** UI language. Independent of the exam language on purpose: a francophone
   *  candidate may sit IELTS, and an anglophone may sit the TCF. */
  ui: LanguageCode;
  response: Response | null;
  result: ScoreResult | null;
  setExam: (e: ExamDefinition) => void;
  setTaskId: (id: string) => void;
  setGoal: (g: Goal) => void;
  setUi: (l: LanguageCode) => void;
  setResult: (r: Response, s: ScoreResult) => void;
  reset: () => void;
  /** The sitting in progress, if any. */
  sitting: Sitting | null;
  history: SittingRecord[];
  recordSitting: (r: SittingRecord) => void;
  clearHistory: () => void;
  /**
   * Begin a sitting. `only: 'comprehension'` runs the device-scored sections
   * alone — the shape a guest sitting takes, see `components/OpenExam.tsx`.
   */
  startSitting: (e: ExamDefinition, only?: 'comprehension') => void;
  answerItem: (sectionId: string, itemId: string, chose: number | string | null) => void;
  /** Record that a recording has been played. Irreversible within a sitting. */
  markPlayed: (recordingId: string) => void;
  /** Fix the paper this sitting will run for one section. Written once. */
  setPaper: (sectionId: string, recordingIds: string[]) => void;
  submitSection: (sectionId: string) => void;
  endSitting: () => void;
};

/** The production sections — the ones with tasks a judge could score. */
export const productionSections = (e: ExamDefinition): ProductionSection[] =>
  e.sections.filter((s): s is ProductionSection => s.kind === 'production');

/** The comprehension sections — 39 items each, no judge, no vendor. */
export const comprehensionSections = (e: ExamDefinition): ComprehensionSection[] =>
  e.sections.filter((s): s is ComprehensionSection => s.kind === 'comprehension');

export const allTasks = (e: ExamDefinition): TaskDefinition[] =>
  productionSections(e).flatMap((s) => s.tasks);

export const firstTask = (e: ExamDefinition): TaskDefinition => allTasks(e)[0];

export const sectionOf = (e: ExamDefinition, taskId: string): ProductionSection =>
  productionSections(e).find((s) => s.tasks.some((t) => t.id === taskId))!;

// A restored sitting names its own exam. Without this, reloading the page
// forty minutes into a TCF sitting renders the IELTS sections instead —
// which is exactly the failure the persistence exists to prevent.
const RESTORED = loadSitting();

// The plan the candidate set on the goal screen. It outlives a sitting and it
// is what the application's dashboard reads, so the store must start from it
// rather than from the first entry in the array — otherwise the two halves of
// the product disagree about which exam the candidate is preparing for.
const PLAN = loadPlan();
const PLANNED_EXAM = PLAN && EXAMS.find((e) => e.id === PLAN.examId);
const PLANNED_GOAL = PLAN && GOALS.find((g) => g.id === PLAN.goalId);

/**
 * A stored plan can hold a destination and an exam that contradict each other,
 * and until this ran the product printed the contradiction with a straight
 * face: `IELTS General Training / Express Entry - French category / NCLC 7 in
 * every skill`. NCLC is the FRENCH benchmark; IELTS is an English exam and
 * cannot serve that category. Neither half is wrong alone. The pair is.
 *
 * The destination is the authority - the goal screen states the rule, "the
 * exam is chosen from that, not the other way round" - so an exam that does
 * not serve the stored goal is replaced by one that does, and the repair is
 * written back so that every reader of the plan agrees, not just this store.
 *
 * Only ever acts when BOTH halves resolve. A plan with an empty goalId is
 * onboarding mid-flight (step one saves the exam and leaves the destination
 * blank on purpose, so Today stays empty and asks the second question);
 * inventing a destination there would skip that question.
 */
const RECONCILED_EXAM =
  PLANNED_GOAL && PLANNED_EXAM && !PLANNED_GOAL.exams.includes(PLANNED_EXAM.id)
    ? EXAMS.find((e) => PLANNED_GOAL.exams.includes(e.id)) || PLANNED_EXAM
    : PLANNED_EXAM;

if (PLAN && PLANNED_GOAL && RECONCILED_EXAM && RECONCILED_EXAM.id !== PLAN.examId) {
  savePlan({
    goalId: PLANNED_GOAL.id,
    examId: RECONCILED_EXAM.id,
    examDate: PLAN.examDate ?? null,
    examLocale: RECONCILED_EXAM.locale,
  });
}

const START = (RESTORED && EXAMS.find((e) => e.id === RESTORED.examId)) || RECONCILED_EXAM || EXAMS[0];

export const useExam = create<ExamState>((set) => ({
  exam: START,
  taskId: firstTask(START).id,
  goal: PLANNED_GOAL || GOALS[1],
  ui: 'en',
  response: null,
  result: null,
  setExam: (exam) =>
    set((st) => {
      // The mirror of setGoal's guard. Without it the pair could still be
      // driven apart from the exam side - choose the French Express Entry
      // category, then choose IELTS anywhere else, and the plan kept
      // goal=ee-french with exam=ielts-gt for good. Whichever half the
      // candidate touches, the other follows.
      const goal = st.goal.exams.includes(exam.id)
        ? st.goal
        : GOALS.find((g) => g.exams.includes(exam.id)) || st.goal;
      savePlan({ goalId: goal.id, examId: exam.id, examDate: loadPlan()?.examDate ?? null, examLocale: exam.locale });
      return { exam, goal, taskId: firstTask(exam).id, response: null, result: null };
    }),
  setTaskId: (taskId) => set({ taskId, response: null, result: null }),
  setGoal: (goal) =>
    set((st) => {
      // Picking a destination picks the exam with it when the current one
      // does not serve that destination. A candidate who chose the French
      // Express Entry category and was left sitting IELTS would be preparing
      // for the wrong instrument without being told.
      const exam = goal.exams.includes(st.exam.id)
        ? st.exam
        : EXAMS.find((e) => goal.exams.includes(e.id)) || st.exam;
      savePlan({ goalId: goal.id, examId: exam.id, examDate: loadPlan()?.examDate ?? null, examLocale: exam.locale });
      return exam.id === st.exam.id
        ? { goal }
        : { goal, exam, taskId: firstTask(exam).id, response: null, result: null };
    }),
  setUi: (ui) => set({ ui }),
  setResult: (response, result) => set({ response, result }),
  reset: () => set({ response: null, result: null }),

  sitting: RESTORED,
  history: loadHistory(),
  recordSitting: (r) =>
    set((st) => {
      // Keep the last 50. A history longer than that is storage, not a
      // feature, and this lives in the candidate's own browser.
      const history = [...st.history, r].slice(-50);
      saveHistory(history);
      return { history };
    }),
  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },
  startSitting: (exam, only) => {
    // `only: 'comprehension'` is what a guest sitting runs.
    //
    // Not a smaller exam for its own sake. The two comprehension sections are
    // scored on this device and send nothing anywhere; a production section
    // posts the candidate's own words or voice to the backend and from there
    // to a third-party model, which needs both an account and the privacy
    // consent. Serving a guest the production sections would put the wall in
    // the MIDDLE of a timed exam, which is worse than putting it at the end.
    const order = exam.sections
      .filter((s) => (only === 'comprehension' ? s.kind === 'comprehension' : true))
      .map((s) => s.id);
    const sitting: Sitting = {
      examId: exam.id,
      order,
      at: 0,
      sectionStartedAt: Date.now(),
      answers: {},
      submitted: [],
      playedRecordings: [],
      papers: {},
    };
    saveSitting(sitting);
    set({ exam, sitting });
  },
  setPaper: (sectionId, recordingIds) =>
    set((st) => {
      if (!st.sitting) return st;
      // Written once. A second write would mean the paper had been re-drawn
      // mid-sitting, which is the failure this field prevents.
      if (st.sitting.papers[sectionId]?.length) return st;
      const sitting = { ...st.sitting, papers: { ...st.sitting.papers, [sectionId]: recordingIds } };
      saveSitting(sitting);
      return { sitting };
    }),
  markPlayed: (recordingId) =>
    set((st) => {
      if (!st.sitting) return st;
      if (st.sitting.playedRecordings.includes(recordingId)) return st;
      const sitting = {
        ...st.sitting,
        playedRecordings: [...st.sitting.playedRecordings, recordingId],
      };
      // Saved before the audio starts, so a reload, a second click or a
      // failed play cannot buy a second listen.
      saveSitting(sitting);
      return { sitting };
    }),
  answerItem: (sectionId, itemId, chose) =>
    set((st) => {
      if (!st.sitting) return st;
      // Answers stay changeable until the section is submitted — a delivery
      // rule, enforced here rather than in a component.
      if (st.sitting.submitted.includes(sectionId)) return st;
      const answers = {
        ...st.sitting.answers,
        [sectionId]: { ...(st.sitting.answers[sectionId] ?? {}), [itemId]: chose },
      };
      const sitting = { ...st.sitting, answers };
      saveSitting(sitting);
      return { sitting };
    }),
  submitSection: (sectionId) =>
    set((st) => {
      if (!st.sitting) return st;
      const submitted = st.sitting.submitted.includes(sectionId)
        ? st.sitting.submitted
        : [...st.sitting.submitted, sectionId];
      // A section boundary cannot be crossed backwards.
      const sitting = {
        ...st.sitting,
        submitted,
        at: Math.min(st.sitting.at + 1, st.sitting.order.length),
        sectionStartedAt: Date.now(),
      };
      saveSitting(sitting);
      return { sitting };
    }),
  endSitting: () => {
    saveSitting(null);
    set({ sitting: null });
  },
}));
