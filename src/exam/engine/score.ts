/**
 * The one entry point. Everything a scored response goes through, in order,
 * for every exam and every skill. Nothing below asks which exam it is
 * running or which language it is in.
 */
import type { ExamDefinition, Localised, Response, Scale, TaskDefinition } from '../model/types';
import { runGate, type GateResult } from './gate';
import { segmentationFor } from './text';
import { runSignal, type SignalResult } from './signal';
import { runJudge, type JudgeOutcome } from './judge';
import { aggregate, releaseGate, toBenchmark, type Aggregate, type ReleaseDecision } from './aggregate';

export type ScoreResult = {
  exam: ExamDefinition;
  task: TaskDefinition;
  /** The exam's own scale. */
  scale: Scale;
  signal: SignalResult;
  gate: GateResult;
  judges: JudgeOutcome[];
  /**
   * Aggregate across judges, ON THE JUDGE'S SCALE. Deliberately not the
   * exam's scale unless a judge answers there: inventing a conversion would
   * produce a number no examiner would recognise.
   */
  judgeAggregate: (Aggregate & { scale: Scale; unmappedReason: Localised }) | null;
  /** Only set when a judge answers on the exam's own scale. */
  examScaleAggregate: Aggregate | null;
  benchmarkLevel: number | null;
  release: ReleaseDecision;
  zeroedBy: Localised | null;
  overtimeSec: number;
};

export function scaleFor(exam: ExamDefinition, id: string): Scale {
  const s = exam.scales.find((x) => x.id === id);
  if (!s) throw new Error(`Exam ${exam.id} declares no scale "${id}"`);
  return s;
}

export async function scoreResponse(
  exam: ExamDefinition,
  task: TaskDefinition,
  response: Response
): Promise<ScoreResult> {
  const lang = exam.language;
  const scale = scaleFor(exam, task.scaleId);
  const promptText = task.prompt[lang];
  const release = releaseGate(exam);
  const overtimeSec = Math.max(0, response.elapsedSec - task.timeLimitSec);

  // Layer 2 first for spoken answers — the gate counts words, and a
  // recording has none until something transcribes it. For typed answers
  // this returns the text unchanged and costs nothing.
  const signal = await runSignal(task.signal, response);

  // Layer 1 — deterministic, on whatever words the signal layer produced.
  // The exam's own locale decides how its language is cut into words.
  // Passing it is not optional for French: `text.ts` measures a 5%
  // under-count and a third of correct-length answers wrongly zeroed
  // without it.
  const gate = runGate(task, signal.transcript, promptText, segmentationFor(exam.locale));

  const base = { exam, task, scale, signal, gate, release, overtimeSec };

  // A response the official scheme awards nothing to is not sent to a judge.
  if (gate.zeroed) {
    const first = gate.findings.find((f) => f.kind === 'zero')!;
    return { ...base, judges: [], judgeAggregate: null, examScaleAggregate: null, benchmarkLevel: null, zeroedBy: first.label };
  }

  // Layer 4 — judging. An exam with no judge bound returns `unavailable`;
  // the pipeline continues, does not throw, and does not invent.
  const judges = await runJudge(task.judge, task, signal.transcript, promptText, signal.raw, exam.locale);
  const scored = judges.filter((j) => j.kind === 'scored') as Extract<JudgeOutcome, { kind: 'scored' }>[];

  // Layers 5-7, on whatever scale the judges answered on.
  let judgeAggregate: ScoreResult['judgeAggregate'] = null;
  if (scored.length) {
    const agg = aggregate(scored.map((j) => j.scores), scored[0].scale);
    if (agg) judgeAggregate = { ...agg, scale: scored[0].scale, unmappedReason: scored[0].unmappedReason };
  }

  // A judge that answers on the exam's own scale reaches the benchmark
  // conversion; one that does not, does not.
  const answersOnExamScale = scored.length > 0 && scored[0].scale.id === scale.id;
  const examScaleAggregate = answersOnExamScale && judgeAggregate
    ? { point: judgeAggregate.point, judgeSpread: judgeAggregate.judgeSpread, judgeCount: judgeAggregate.judgeCount }
    : null;
  const benchmarkLevel = examScaleAggregate ? toBenchmark(examScaleAggregate.point, exam.benchmark, task.scaleId) : null;

  return { ...base, judges, judgeAggregate, examScaleAggregate, benchmarkLevel, zeroedBy: null };
}
