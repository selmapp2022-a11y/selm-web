/**
 * The calibration record — two numbers that must never become one.
 *
 * Amendment 2 §1.2: *"Both count. Neither is silently mixed with the other.
 * `samples` is reported per kind, never as one figure. Any published
 * accuracy statement names which kind it rests on. The gate's
 * ten-per-level requirement applies per kind."*
 *
 * That is a rule a policy document can state and a type can enforce, and
 * this file enforces it: **there is no function here that returns a single
 * combined sample count, and no way to construct one from what is
 * exported.** `Coverage` is keyed by kind at the top level, so a caller who
 * wants a total has to write the addition themselves, in the open, where a
 * reviewer sees it.
 *
 * Same discipline as `attestation.ts`: a redaction rule in a document is a
 * hope; a type with no field for the thing is a guarantee.
 */
import type { AttestationKind } from '../model/attestation';

export type SkillId = 'speaking' | 'listening' | 'reading' | 'writing';

export const SKILLS: SkillId[] = ['speaking', 'listening', 'reading', 'writing'];

/**
 * One observation: an official mark, our mark for the same person and
 * skill, and the distance in time between them.
 *
 * **The pair is the unit, not the attestation.** An attestation on its own
 * is four numbers and no scripts — worth almost nothing for calibration,
 * which is exactly why the dataset search of steps 05–15 found nothing
 * usable. What makes it valuable is the person attached to it, because that
 * person can be scored by us. A downloaded attestation has no person; a
 * user's attestation does.
 */
export type Pair = {
  attestationId: string;
  kind: AttestationKind;
  examId: string;
  skill: SkillId;
  /** The awarding body's mark, on the exam's own scale. */
  official: number;
  /** Ours, on the same scale, for the same candidate. */
  ours: number;
  /** The benchmark level the official mark converts to. Coverage counts by this. */
  officialLevel: number;
  /**
   * Whole months between the sitting and our own scoring.
   *
   * **Amendment 2 §1.3, and this field is the honest limit made visible.**
   * Zero or near it for a prospective pair. For a retrospective pair it can
   * be anything, and the wider it is the more of the difference is the
   * candidate's own learning rather than our marking. It is a weight, never
   * a filter: nothing is ever rejected for being old.
   */
  gapMonths: number;
  /**
   * Whether the candidate says they studied between the sitting and now.
   * One question at upload, and it tightens the weight above. Unknown is a
   * real answer and is not treated as "no".
   */
  studiedSince: boolean | null;
};

/** How much a pair counts, given how far apart its two measurements are. */
export function recencyWeight(p: Pick<Pair, 'gapMonths' | 'studiedSince'>): number {
  // Half-life of a year. A sitting last month is worth ~0.94; three years
  // ago, ~0.12. The shape is a choice and it is ours; what is not a choice
  // is that it must decay, because ability moves.
  const base = Math.pow(0.5, p.gapMonths / 12);
  // Studying in between is the mechanism by which the gap does damage, so
  // saying so costs more than the months alone.
  return p.studiedSince === true ? base * 0.6 : base;
}

export type Agreement = {
  n: number;
  /** Mean signed difference — our mark minus theirs. The bias, and it is correctable. */
  bias: number;
  /** Mean absolute difference. What a candidate would feel. */
  meanAbs: number;
  /** Share of pairs within one point of the official mark. */
  within1: number;
  /** Weighted by recency; reported beside the unweighted figure, never instead of it. */
  weightedBias: number;
  /** Months between sitting and our scoring: median across the pairs. */
  medianGapMonths: number;
};

function agreementOf(pairs: Pair[]): Agreement {
  const n = pairs.length;
  if (n === 0) return { n: 0, bias: 0, meanAbs: 0, within1: 0, weightedBias: 0, medianGapMonths: 0 };
  const d = pairs.map((p) => p.ours - p.official);
  const w = pairs.map(recencyWeight);
  const wsum = w.reduce((a, b) => a + b, 0);
  const gaps = pairs.map((p) => p.gapMonths).sort((a, b) => a - b);
  return {
    n,
    bias: d.reduce((a, b) => a + b, 0) / n,
    meanAbs: d.reduce((a, b) => a + Math.abs(b), 0) / n,
    within1: d.filter((x) => Math.abs(x) <= 1).length / n,
    weightedBias: wsum > 0 ? d.reduce((a, b, i) => a + b * w[i], 0) / wsum : 0,
    medianGapMonths: gaps[Math.floor(n / 2)],
  };
}

/**
 * The gate: ten pairs at every benchmark level from 4 to 10, **per kind**.
 *
 * §2.5's warning made structural: *"two hundred attestations with 4, 8, 9
 * and 10 empty leaves the gate shut."* The total is the misleading number,
 * so this view does not compute one.
 */
export const GATE_LEVELS = [4, 5, 6, 7, 8, 9, 10];
export const GATE_PER_LEVEL = 10;

export type LevelCoverage = { level: number; n: number; need: number; met: boolean };

export type KindCoverage = {
  kind: AttestationKind;
  agreement: Agreement;
  perSkill: Record<SkillId, Agreement>;
  perLevel: LevelCoverage[];
  /** True only when every level from 4 to 10 has its ten. */
  gateOpen: boolean;
};

/** Keyed by kind at the top level, on purpose. There is no combined view. */
export type Coverage = Record<AttestationKind, KindCoverage>;

function coverageOfKind(kind: AttestationKind, pairs: Pair[]): KindCoverage {
  const mine = pairs.filter((p) => p.kind === kind);
  const perSkill = {} as Record<SkillId, Agreement>;
  for (const s of SKILLS) perSkill[s] = agreementOf(mine.filter((p) => p.skill === s));
  const perLevel = GATE_LEVELS.map((level) => {
    const n = mine.filter((p) => p.officialLevel === level).length;
    return { level, n, need: GATE_PER_LEVEL, met: n >= GATE_PER_LEVEL };
  });
  return {
    kind,
    agreement: agreementOf(mine),
    perSkill,
    perLevel,
    gateOpen: perLevel.every((l) => l.met),
  };
}

export function coverage(pairs: Pair[]): Coverage {
  return {
    retrospective: coverageOfKind('retrospective', pairs),
    prospective: coverageOfKind('prospective', pairs),
  };
}

/**
 * The sentence the product is allowed to publish, for one kind.
 *
 * Amendment 2 §1.3: the two figures mean different things and the wording
 * must say so. **Neither is ever presented as the other**, and the interval
 * is stated with the retrospective one because it is the honest limit.
 *
 * Returns null when the gate for that kind is shut — which is the point.
 * There is no wording available for a figure we have not earned.
 */
export function publishableClaim(c: KindCoverage): { en: string; fr: string } | null {
  if (!c.gateOpen || c.agreement.n === 0) return null;
  const abs = c.agreement.meanAbs.toFixed(1);
  const n = c.agreement.n;
  if (c.kind === 'retrospective') {
    const m = c.agreement.medianGapMonths;
    const g = m >= 12 ? `${(m / 12).toFixed(1)} years` : `${m} months`;
    return {
      en: `Measured against ${n} official score reports, our marking sits within ${abs} points of the official mark, on candidates whose sitting was a median of ${g} before we scored them. This measures how closely our marking tracks official marking. It is not a prediction of a future result.`,
      fr: `Mesurée sur ${n} attestations officielles, notre correction se situe à ${abs} point près de la note officielle, pour des candidats dont l'épreuve précédait notre correction de ${m} mois en médiane. Cela mesure l'accord entre notre correction et la correction officielle. Ce n'est pas une prévision de résultat futur.`,
    };
  }
  return {
    en: `Measured against ${n} official score reports from sittings that took place AFTER we scored the candidate, our prediction sits within ${abs} points of the awarded mark.`,
    fr: `Mesurée sur ${n} attestations officielles portant sur des épreuves passées APRÈS notre correction, notre prévision se situe à ${abs} point près de la note obtenue.`,
  };
}



