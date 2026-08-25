/**
 * The one entry point. Everything a scored response goes through, in order,
 * for every exam. Nothing below asks which exam it is running.
 */
import type { ExamDefinition, Localised, Response, Scale, TaskDefinition } from '../model/types';
import { runGate, type GateResult } from './gate';
import { runJudge, type JudgeOutcome } from './judge';
import { aggregate, releaseGate, toBenchmark, type Aggregate, type ReleaseDecision } from './aggregate';

export type ScoreResult = {
  exam: ExamDefinition;
  task: TaskDefinition;
  /** The exam's own scale. */
  scale: Scale;
  gate: GateResult;
  judges: JudgeOutcome[];
  /**
   * Aggregate across judges, ON THE JUDGE'S SCALE. It is deliberately not
   * the exam's scale: no mapping between the two has been fitted, and
   * inventing one would produce a number no examiner would recognise.
   */
  judgeAggregate: (Aggregate & { scale: Scale; unmappedReason: Localised }) | null;
  /** Only set when a judge answers on the exam's own scale. Null today. */
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

  // Layer 1 — deterministic. Runs for every exam, costs nothing.
  const gate = runGate(task, response, promptText);
  const release = releaseGate(exam);
  const overtimeSec = Math.max(0, response.elapsedSec - task.timeLimitSec);

  // A response the official scheme awards nothing to is not sent to a judge.
  // Paying a model to grade an automatic zero would buy a number the exam
  // board would never award.
  if (gate.zeroed) {
    const first = gate.findings.find((f) => f.kind === 'zero')!;
    return {
      exam, task, scale, gate, judges: [],
      judgeAggregate: null, examScaleAggregate: null, benchmarkLevel: null,
      release, zeroedBy: first.label, overtimeSec,
    };
  }

  // Layer 4 — judging. An exam with no judge bound returns `unavailable`
  // and the pipeline continues; it does not throw and it does not invent.
  const judges = await runJudge(task.judge, task, response.text, promptText);
  const scored = judges.filter((j) => j.kind === 'scored') as Extract<JudgeOutcome, { kind: 'scored' }>[];

  // Layers 5–7. Aggregation happens on whatever scale the judges answered on.
  let judgeAggregate: ScoreResult['judgeAggregate'] = null;
  if (scored.length) {
    const agg = aggregate(scored.map((j) => j.scores), scored[0].scale);
    if (agg) judgeAggregate = { ...agg, scale: scored[0].scale, unmappedReason: scored[0].unmappedReason };
  }

  // Nothing reaches the exam's scale until a mapping is fitted, so the
  // benchmark level stays null and the release gate has nothing to release.
  const examScaleAggregate: Aggregate | null = null;
  const benchmarkLevel = examScaleAggregate ? toBenchmark((examScaleAggregate as Aggregate).point, exam.benchmark) : null;

  return { exam, task, scale, gate, judges, judgeAggregate, examScaleAggregate, benchmarkLevel, release, zeroedBy: null, overtimeSec };
}
