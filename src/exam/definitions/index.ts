import type { ExamDefinition, Goal } from '../model/types';
import { IELTS_GT } from './ielts-gt';
import { TCF_CANADA } from './tcf-canada';

export const EXAMS: ExamDefinition[] = [IELTS_GT, TCF_CANADA];

export function examById(id: string): ExamDefinition {
  const e = EXAMS.find((x) => x.id === id);
  if (!e) throw new Error(`No exam definition "${id}"`);
  return e;
}

/** Goals are data too: the required level per destination, per system. */
export const GOALS: Goal[] = [
  { id: 'ee-french', label: { en: 'Express Entry — French category', fr: 'Entrée express — catégorie francophone' }, requiredLevel: 7, system: 'NCLC' },
  { id: 'ee-english', label: { en: 'Express Entry — CLB 9 ("8777")', fr: 'Entrée express — CLB 9 (« 8777 »)' }, requiredLevel: 9, system: 'CLB' },
  { id: 'citizenship', label: { en: 'Canadian citizenship', fr: 'Citoyenneté canadienne' }, requiredLevel: 4, system: 'CLB' },
];
