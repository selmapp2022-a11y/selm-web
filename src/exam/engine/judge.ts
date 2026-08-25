/**
 * Layer 4 — the judge.
 *
 * A judge turns a response into a value per criterion, ON ITS OWN SCALE.
 * Whether that scale can be stated as the exam's scale is a separate
 * question the binding answers, and today the answer is no for every judge
 * bound here: no mapping has been fitted against real score reports.
 *
 * `kind: 'none'` is a supported outcome, not a failure. An exam with no
 * judge produces deterministic findings and no number, which is the correct
 * behaviour for an exam whose engine has not been built.
 */
import { api, unwrap } from '../../lib/api';
import type { Criterion, JudgeBinding, Localised, Scale, TaskDefinition } from '../model/types';

export type CriterionScore = { criterionId: string; value: number };

export type JudgeOutcome =
  | { kind: 'unavailable'; reason: Localised }
  | {
      kind: 'scored';
      judgeId: string;
      /** The scale `scores` are expressed in. */
      scale: Scale;
      /** Why these values are not the exam's own scale. */
      unmappedReason: Localised;
      scores: CriterionScore[];
      notes?: string[];
    };

/**
 * Adapters map one backend response shape onto criteria. They are the single
 * declared extension point: binding a judge that answers in a new shape means
 * adding an adapter here, and nothing else in the engine changes.
 */
const adapters = {
  /**
   * `/writing/assess` — a general writing assessor answering 0–100 with four
   * fixed sub-scores. It is not exam-aware and it is not an examiner; its
   * numbers are reported as its own.
   */
  writing_assess(raw: any, criteria: Criterion[]): CriterionScore[] {
    const a: any = unwrap(raw, 'assessment');
    const s = a?.scores ?? {};
    const source: Record<string, number | undefined> = {
      grammar: s.grammar ?? a?.grammar_score,
      vocabulary: s.vocabulary ?? a?.vocabulary_score,
      coherence: s.coherence ?? a?.coherence_score,
      task: s.task_achievement ?? s.task_response ?? a?.task_response_score,
    };
    const out: CriterionScore[] = [];
    for (const c of criteria) {
      const v = source[c.id];
      if (typeof v === 'number') out.push({ criterionId: c.id, value: v });
    }
    return out;
  },
};

function notesFrom(raw: any): string[] {
  const a: any = unwrap(raw, 'assessment');
  const notes: string[] = [];
  if (a?.feedback) notes.push(String(a.feedback));
  for (const w of a?.weaknesses ?? []) notes.push(String(w));
  return notes;
}

export async function runJudge(
  binding: JudgeBinding,
  task: TaskDefinition,
  text: string,
  promptText: string
): Promise<JudgeOutcome[]> {
  if (binding.kind === 'none') return [{ kind: 'unavailable', reason: binding.reason }];

  const samples = Math.max(1, binding.samples ?? 1);
  const calls = Array.from({ length: samples }, async (): Promise<JudgeOutcome> => {
    try {
      const { data } = await api.post(binding.endpoint, {
        text,
        prompt: promptText,
        ...(binding.payload ?? {}),
      });
      const scores = adapters[binding.adapter](data, task.criteria);
      if (!scores.length) {
        return {
          kind: 'unavailable',
          reason: {
            en: 'The judge returned no criterion this task asks for.',
            fr: "Le correcteur n'a renvoyé aucun critère demandé par cette tâche.",
          },
        };
      }
      return {
        kind: 'scored',
        judgeId: binding.adapter,
        scale: binding.judgeScale,
        unmappedReason: binding.toExamScale.reason,
        scores,
        notes: notesFrom(data),
      };
    } catch (e: any) {
      return {
        kind: 'unavailable',
        reason: {
          en: `The judge could not be reached (${e?.message ?? 'network error'}).`,
          fr: `Le correcteur est injoignable (${e?.message ?? 'erreur réseau'}).`,
        },
      };
    }
  });

  return Promise.all(calls);
}
