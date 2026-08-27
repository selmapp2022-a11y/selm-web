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
  /** Answers by section id, then by item id. */
  answers: Record<string, Record<string, number | null>>;
  /** Section ids already submitted. */
  submitted: string[];
};

const SITTING_KEY = 'selm_exam_sitting_v1';

const loadSitting = (): Sitting | null => {
  try {
    const raw = localStorage.getItem(SITTING_KEY);
    return raw ? (JSON.parse(raw) as Sitting) : null;
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
  startSitting: (e: ExamDefinition) => void;
  answerItem: (sectionId: string, itemId: string, chose: number | null) => void;
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

const START = (RESTORED && EXAMS.find((e) => e.id === RESTORED.examId)) || PLANNED_EXAM || EXAMS[0];

export const useExam = create<ExamState>((set) => ({
  exam: START,
  taskId: firstTask(START).id,
  goal: PLANNED_GOAL || GOALS[1],
  ui: 'en',
  response: null,
  result: null,
  setExam: (exam) =>
    set((st) => {
      savePlan({ goalId: st.goal.id, examId: exam.id, examDate: loadPlan()?.examDate ?? null });
      return { exam, taskId: firstTask(exam).id, response: null, result: null };
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
      savePlan({ goalId: goal.id, examId: exam.id, examDate: loadPlan()?.examDate ?? null });
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
  startSitting: (exam) => {
    const sitting: Sitting = {
      examId: exam.id,
      order: exam.sections.map((s) => s.id),
      at: 0,
      sectionStartedAt: Date.now(),
      answers: {},
      submitted: [],
    };
    saveSitting(sitting);
    set({ exam, sitting });
  },
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
