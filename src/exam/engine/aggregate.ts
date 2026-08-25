/**
 * Layers 5, 6 and 7 — aggregation, calibration, interval — and the release
 * gate that decides whether any of it may be shown as a number.
 *
 * The gate reads the exam definition's calibration record and nothing else.
 * With no official score reports collected, no exam passes, and no exam
 * publishes a predicted score. That is the behaviour the governance standard
 * requires, so it is the default rather than an option.
 */
import type { BenchmarkMap, ExamDefinition, Localised, Scale } from '../model/types';
import type { CriterionScore } from './judge';

export type Aggregate = {
  point: number;
  /** Spread across judges. Zero with a single judge — stated, not hidden. */
  judgeSpread: number;
  judgeCount: number;
};

export function aggregate(scoresByJudge: CriterionScore[][], scale: Scale): Aggregate | null {
  const means = scoresByJudge
    .map((s) => (s.length ? s.reduce((a, c) => a + c.value, 0) / s.length : NaN))
    .filter((v) => Number.isFinite(v));
  if (!means.length) return null;
  const point = means.reduce((a, b) => a + b, 0) / means.length;
  const spread = means.length > 1 ? Math.max(...means) - Math.min(...means) : 0;
  const stepped = Math.round(point / scale.step) * scale.step;
  return { point: Math.min(scale.max, Math.max(scale.min, stepped)), judgeSpread: spread, judgeCount: means.length };
}

export function toBenchmark(value: number, map: BenchmarkMap): number | null {
  const sorted = [...map.bands].sort((a, b) => b.from - a.from);
  for (const b of sorted) if (value >= b.from) return b.level;
  return null;
}

export type ReleaseDecision = {
  publishNumeric: boolean;
  reason: Localised;
  /** What is missing, in the exam's own numbers, so the claim is checkable. */
  evidence: { samples: number; minSamples: number; mae: number | null; maxMae: number };
};

export function releaseGate(exam: ExamDefinition): ReleaseDecision {
  const c = exam.calibration;
  const evidence = { samples: c.samples, minSamples: c.gate.minSamples, mae: c.mae, maxMae: c.gate.maxMae };
  if (c.samples < c.gate.minSamples) {
    return {
      publishNumeric: false,
      reason: {
        en: `No predicted score is shown. It requires ${c.gate.minSamples} official score reports to measure against; ${c.samples} have been collected.`,
        fr: `Aucune note prédite n'est affichée. Il en faut ${c.gate.minSamples} attestations officielles pour la mesurer ; ${c.samples} ont été recueillies.`,
      },
      evidence,
    };
  }
  if (c.mae === null || c.mae > c.gate.maxMae) {
    return {
      publishNumeric: false,
      reason: {
        en: `No predicted score is shown. Measured error must be at or below ${c.gate.maxMae} levels; it is ${c.mae ?? 'not yet measured'}.`,
        fr: `Aucune note prédite n'est affichée. L'erreur mesurée doit être au plus de ${c.gate.maxMae} niveaux ; elle est de ${c.mae ?? 'non encore mesurée'}.`,
      },
      evidence,
    };
  }
  return {
    publishNumeric: true,
    reason: {
      en: `Calibrated against ${c.samples} official score reports; published mean absolute error ${c.mae}.`,
      fr: `Étalonné sur ${c.samples} attestations officielles ; erreur absolue moyenne publiée ${c.mae}.`,
    },
    evidence,
  };
}
