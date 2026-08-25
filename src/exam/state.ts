import { create } from 'zustand';
import type { ExamDefinition, Goal, LanguageCode, Response, TaskDefinition } from './model/types';
import type { ScoreResult } from './engine/score';
import { EXAMS, GOALS } from './definitions';

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
};

export const allTasks = (e: ExamDefinition): TaskDefinition[] =>
  e.sections.flatMap((s) => s.tasks);

export const firstTask = (e: ExamDefinition): TaskDefinition => allTasks(e)[0];

export const sectionOf = (e: ExamDefinition, taskId: string) =>
  e.sections.find((s) => s.tasks.some((t) => t.id === taskId))!;

export const useExam = create<ExamState>((set) => ({
  exam: EXAMS[0],
  taskId: firstTask(EXAMS[0]).id,
  goal: GOALS[1],
  ui: 'en',
  response: null,
  result: null,
  setExam: (exam) => set({ exam, taskId: firstTask(exam).id, response: null, result: null }),
  setTaskId: (taskId) => set({ taskId, response: null, result: null }),
  setGoal: (goal) => set({ goal }),
  setUi: (ui) => set({ ui }),
  setResult: (response, result) => set({ response, result }),
  reset: () => set({ response: null, result: null }),
}));
