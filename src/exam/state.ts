import { create } from 'zustand';
import type { ExamDefinition, Goal, LanguageCode, Response, TaskDefinition } from './model/types';
import type { ScoreResult } from './engine/score';
import { EXAMS, GOALS } from './definitions';

type ExamState = {
  exam: ExamDefinition;
  goal: Goal;
  /** UI language. Independent of the exam language on purpose: a francophone
   *  candidate may sit IELTS, and an anglophone may sit the TCF. */
  ui: LanguageCode;
  response: Response | null;
  result: ScoreResult | null;
  setExam: (e: ExamDefinition) => void;
  setGoal: (g: Goal) => void;
  setUi: (l: LanguageCode) => void;
  setResult: (r: Response, s: ScoreResult) => void;
  reset: () => void;
};

export const firstTask = (e: ExamDefinition): TaskDefinition => e.sections[0].tasks[0];

export const useExam = create<ExamState>((set) => ({
  exam: EXAMS[0],
  goal: GOALS[1],
  ui: 'en',
  response: null,
  result: null,
  setExam: (exam) => set({ exam, response: null, result: null }),
  setGoal: (goal) => set({ goal }),
  setUi: (ui) => set({ ui }),
  setResult: (response, result) => set({ response, result }),
  reset: () => set({ response: null, result: null }),
}));
