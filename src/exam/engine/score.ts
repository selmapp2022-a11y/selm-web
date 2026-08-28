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
import { entriesFor } from '../definitions/prescriptions';
import type { Diagnosis } from '../model/prescription';

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
  /**
   * Layer 2's findings — the named failure modes this response matched.
   *
   * Empty when no cell has been written for this task, and that emptiness is
   * meant to be shown rather than filled: Amendment 1 §6 asks for a visible
   * gap instead of a plausible generic answer.
   */
  diagnoses: Diagnosis[];
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
  const seg = segmentationFor(exam.locale);
  const gate = runGate(task, signal.transcript, promptText, seg);

  // Layer 2 — the diagnostic tier, and it runs BEFORE the zero check on
  // purpose.
  //
  // Amendment 2 §3.1. The short-circuit below is right for the judge, which
  // costs money on every call. It is wrong for this, which costs nothing and
  // touches no network. Measured on the first cell: the NCLC 6 response to
  // `t3-n6-04` is zeroed by `prompt_copy` AND is a textbook juxtaposition —
  // the two travel together, because a candidate who summarises instead of
  // comparing also tends to lift a clause. Returning only the zero throws
  // away the half the candidate can act on.
  //
  //   "You copied a sentence, AND you did not compare the two documents"
  //
  // is worth more than a zero.
  const diagnoses = entriesFor(exam.id, task.id).map((e) => e.detect(task, signal.transcript, seg));

  const base = { exam, task, scale, signal, gate, release, diagnoses, overtimeSec };

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
  const benchmarkLevel = examScaleAggregate ? toBenchmark(examScaleAggregate.point, exam.benchmark, task.scaleId, task.skill) : null;

  return { ...base, judges, judgeAggregate, examScaleAggregate, benchmarkLevel, zeroedBy: null };
}
