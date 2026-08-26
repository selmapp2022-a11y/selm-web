/**
 * Scoring a comprehension section.
 *
 * Deterministic: count the keys, and report what the count supports. No judge,
 * no vendor, no interval — and, as it turns out, **no scale score**.
 *
 * The step this implements assumed the comprehension half was cheap because
 * "the scales are published and the answer key is ours, so the score is exact
 * rather than estimated". The count is exact. The conversion from that count
 * to a TCF scale score is not ours to compute:
 *
 *   - FEI publishes that « un barème est appliqué aux bonnes réponses [qui]
 *     prend en compte la difficulté de chaque question », and has never
 *     published that barème in any version of the candidate manual from 2014
 *     to April 2025.
 *   - FEI also claims « quelle que soit la version du test, les résultats
 *     restent comparables » — a claim of equating, which means the mapping
 *     differs per form. **No fixed table can be correct**, even with perfect
 *     information.
 *   - The item parameters are undisclosed, and our items are not FEI's items.
 *
 * So this returns a raw count and a difficulty profile, both exact and both
 * ours, and it returns `scaleScore: null` with the reason attached. Anything
 * rendering this must show the count, may show the profile, and must not
 * print a three-digit number.
 */
import type { ComprehensionItem, ComprehensionSection, Localised } from '../model/types';

export const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Band = (typeof BANDS)[number];

/** One answer: the item, and the option index chosen. `null` = not answered. */
export type ItemAnswer = { itemId: string; chose: number | null };

export type BandResult = { band: Band; correct: number; total: number };

export type ComprehensionResult = {
  section: ComprehensionSection;
  /** Items presented. */
  total: number;
  /** Items the candidate answered at all. */
  answered: number;
  correct: number;
  byBand: BandResult[];
  /**
   * The highest band the candidate answered at least `holdRatio` of correctly,
   * counting upward from A1 and stopping at the first band they did not hold.
   * `null` when they did not hold even A1.
   */
  held: Band | null;
  /** The band immediately above `held` — where they broke down. */
  breaksAt: Band | null;
  /**
   * Deliberately null. See the file header: the official conversion is
   * unpublished and form-specific, so this product does not compute one.
   */
  scaleScore: null;
  scaleScoreReason: Localised;
};

const NOT_COMPUTABLE: Localised = {
  en: 'This practice section reports the number of correct answers and the difficulty they reached. It does not report a TCF scale score: the official conversion from correct answers to that scale is not published, and it varies between versions of the exam, so no fixed table could be right. The scale-to-NCLC step is published, and is used when a real result is entered.',
  fr: "Cette épreuve d'entraînement indique le nombre de bonnes réponses et le niveau de difficulté atteint. Elle n'indique pas de score TCF : la conversion officielle des bonnes réponses vers ce score n'est pas publiée et varie selon la version de l'épreuve — aucune table fixe ne pourrait être exacte. La conversion score → NCLC, elle, est publiée, et sert lorsqu'un résultat réel est saisi.",
};

/** Fraction of a band's items that must be correct for the band to be "held". */
export const HOLD_RATIO = 0.6;

export function scoreComprehension(
  section: ComprehensionSection,
  answers: ItemAnswer[],
  holdRatio: number = HOLD_RATIO
): ComprehensionResult {
  const chosen = new Map(answers.map((a) => [a.itemId, a.chose]));
  const isCorrect = (i: ComprehensionItem) => chosen.get(i.id) === i.answer;

  const byBand: BandResult[] = BANDS.map((band) => {
    const items = section.items.filter((i) => i.level === band);
    return { band, correct: items.filter(isCorrect).length, total: items.length };
  }).filter((b) => b.total > 0);

  let held: Band | null = null;
  let breaksAt: Band | null = null;
  for (const b of byBand) {
    if (b.correct / b.total >= holdRatio) {
      held = b.band;
    } else {
      breaksAt = b.band;
      break;
    }
  }

  return {
    section,
    total: section.items.length,
    answered: section.items.filter((i) => chosen.get(i.id) !== null && chosen.get(i.id) !== undefined).length,
    correct: section.items.filter(isCorrect).length,
    byBand,
    held,
    breaksAt,
    scaleScore: null,
    scaleScoreReason: NOT_COMPUTABLE,
  };
}

/**
 * The governing level across a whole sitting.
 *
 * IRCC reads the **lowest of the four skills**, so a candidate at NCLC 8, 8, 8
 * and 5 is at NCLC 5 for immigration purposes. Anything that shows four
 * numbers without showing that one is showing the candidate a better result
 * than they have.
 *
 * `null` entries are skills with no level — a production skill whose release
 * gate refuses to publish one, or a comprehension section with no published
 * conversion. **A sitting with any null cannot state a governing level**, and
 * says so rather than taking the lowest of the ones it happens to have.
 */
export function governingLevel(levels: Array<number | null>): { level: number | null; complete: boolean } {
  const complete = levels.length > 0 && levels.every((l) => typeof l === 'number');
  if (!complete) return { level: null, complete: false };
  return { level: Math.min(...(levels as number[])), complete: true };
}
