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
   * The IELTS band block `/speech/evaluate?mode=ielts` returns. Unlike the
   * writing assessor, this one already answers on the exam's own band scale
   * — but on halves, which the Test Report Form does not print for criteria,
   * so the binding declares a whole-integer scale and the value is rounded
   * to it by the aggregation step rather than here.
   */
  ielts_speaking(raw: any, criteria: Criterion[]): CriterionScore[] {
    const d: any = (raw as any)?.result ?? raw ?? {};
    const b = d?.ielts?.bands ?? d?.bands ?? {};
    const source: Record<string, number | undefined> = {
      fluency_coherence: pick(b.fluencyCoherence ?? b.fluency_coherence),
      lexical_resource: pick(b.lexicalResource ?? b.lexical_resource),
      grammar_accuracy: pick(b.grammarAccuracy ?? b.grammar_accuracy),
      pronunciation: pick(b.pronunciation),
      task_response: pick(b.taskResponse ?? b.task_response),
    };
    const out: CriterionScore[] = [];
    for (const c of criteria) {
      const v = source[c.id];
      if (typeof v === 'number') out.push({ criterionId: c.id, value: v });
    }
    return out;
  },

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

function pick(v: any): number | undefined {
  if (typeof v === 'number') return v;
  if (v && typeof v.band === 'number') return v.band;
  return undefined;
}

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
  promptText: string,
  /** The signal layer's raw payload, for judges that read it. */
  signalRaw?: unknown
): Promise<JudgeOutcome[]> {
  if (binding.kind === 'none') return [{ kind: 'unavailable', reason: binding.reason }];

  if (binding.kind === 'from_signal') {
    const scores = adapters[binding.adapter](signalRaw, task.criteria);
    if (!scores.length) {
      return [{
        kind: 'unavailable',
        reason: {
          en: 'The transcriber answered, but it returned no band for any criterion this task asks for.',
          fr: "Le transcripteur a répondu, mais sans note pour aucun critère demandé par cette tâche.",
        },
      }];
    }
    return [{
      kind: 'scored',
      judgeId: binding.adapter,
      scale: binding.judgeScale,
      unmappedReason: binding.toExamScale.reason,
      scores,
    }];
  }

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
